/*
  Cultivee - Controle Hidroponico
  ESP32-WROOM-32D + Modulo Rele 2 canais

  Funcionalidades:
  - Fases de cultivo configuraveis (Germinacao, Bercario, Engorda)
  - Controle automatico de luz e bomba baseado em horario NTP
  - Interface web local (dashboard + configuracao)
  - WiFi Manager com portal cativo
  - Modo manual (override dos reles)
*/

#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include <time.h>
#include "config.h"

// --- Estrutura de fase ---
struct Phase {
  char name[20];
  int days;          // 0 = infinito
  int lightOnHour;   // ex: 6
  int lightOnMin;    // ex: 0
  int lightOffHour;  // ex: 18
  int lightOffMin;   // ex: 0
  int pumpOnDay;     // minutos ligada (dia)
  int pumpOffDay;    // minutos desligada (dia)
  int pumpOnNight;   // minutos ligada (noite)
  int pumpOffNight;  // minutos desligada (noite)
};

// --- Variaveis globais ---
Phase phases[MAX_PHASES];
int numPhases = 0;
char startDate[12] = "2025-01-01";
bool modeAuto = true;
bool manualLight = false;
bool manualPump = false;
bool lightState = false;
bool pumpState = false;
bool ntpSynced = false;

// WiFi
enum Mode { MODE_SETUP, MODE_CONNECTED, MODE_OFFLINE };
Mode currentMode = MODE_SETUP;
Preferences prefs;
WebServer server(80);
DNSServer dnsServer;
String chipId;
String shortId;

// WiFi credentials
String savedSSID = "";
String savedPass = "";

// Timers (non-blocking)
unsigned long lastRegister = 0;
unsigned long lastAutoCheck = 0;
unsigned long lastLedUpdate = 0;
unsigned long pumpCycleStart = 0;
bool pumpCycleOn = true;

// ===================== WIFI MANAGER =====================

void loadWiFiCredentials() {
  prefs.begin("wifi", true);
  savedSSID = prefs.getString("ssid", "");
  savedPass = prefs.getString("pass", "");
  prefs.end();
}

void saveWiFiCredentials(String ssid, String pass) {
  prefs.begin("wifi", false);
  prefs.putString("ssid", ssid);
  prefs.putString("pass", pass);
  prefs.end();
}

void clearWiFiCredentials() {
  prefs.begin("wifi", false);
  prefs.remove("ssid");
  prefs.remove("pass");
  prefs.end();
  savedSSID = "";
  savedPass = "";
}

bool connectWiFi() {
  if (savedSSID.length() == 0) return false;
  Serial.printf("Conectando em '%s'...\n", savedSSID.c_str());
  WiFi.mode(WIFI_STA);
  WiFi.begin(savedSSID.c_str(), savedPass.c_str());
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Conectado! IP: %s\n", WiFi.localIP().toString().c_str());
    return true;
  }
  Serial.println("Falha ao conectar WiFi");
  return false;
}

void startSetupAP() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP("Cultivee-Setup");
  delay(100);
  dnsServer.start(53, "*", WiFi.softAPIP());
  currentMode = MODE_SETUP;
  Serial.printf("AP Setup iniciado: Cultivee-Setup IP: %s\n", WiFi.softAPIP().toString().c_str());
}

// ===================== NTP =====================

void setupNTP() {
  configTime(GMT_OFFSET, DST_OFFSET, NTP_SERVER);
  struct tm t;
  if (getLocalTime(&t, 5000)) {
    ntpSynced = true;
    Serial.printf("NTP sincronizado: %02d/%02d/%04d %02d:%02d:%02d\n",
      t.tm_mday, t.tm_mon + 1, t.tm_year + 1900, t.tm_hour, t.tm_min, t.tm_sec);
  } else {
    Serial.println("NTP: falha ao sincronizar");
  }
}

bool getCurrentTime(struct tm *t) {
  return getLocalTime(t, 0);
}

// ===================== FASES =====================

void loadDefaultPhases() {
  numPhases = 3;

  strcpy(phases[0].name, "Germinacao");
  phases[0].days = 3;
  phases[0].lightOnHour = 6; phases[0].lightOnMin = 0;
  phases[0].lightOffHour = 18; phases[0].lightOffMin = 0;
  phases[0].pumpOnDay = 15; phases[0].pumpOffDay = 15;
  phases[0].pumpOnNight = 15; phases[0].pumpOffNight = 15;

  strcpy(phases[1].name, "Bercario");
  phases[1].days = 17;
  phases[1].lightOnHour = 6; phases[1].lightOnMin = 0;
  phases[1].lightOffHour = 19; phases[1].lightOffMin = 0;
  phases[1].pumpOnDay = 15; phases[1].pumpOffDay = 15;
  phases[1].pumpOnNight = 15; phases[1].pumpOffNight = 45;

  strcpy(phases[2].name, "Engorda");
  phases[2].days = 0;  // infinito
  phases[2].lightOnHour = 6; phases[2].lightOnMin = 0;
  phases[2].lightOffHour = 20; phases[2].lightOffMin = 0;
  phases[2].pumpOnDay = 15; phases[2].pumpOffDay = 15;
  phases[2].pumpOnNight = 10; phases[2].pumpOffNight = 50;
}

void savePhases() {
  prefs.begin("hydro", false);
  prefs.putString("start_date", startDate);
  prefs.putInt("num_phases", numPhases);
  prefs.putBool("mode_auto", modeAuto);

  for (int i = 0; i < numPhases; i++) {
    String prefix = "p" + String(i) + "_";
    prefs.putString((prefix + "name").c_str(), phases[i].name);
    prefs.putInt((prefix + "days").c_str(), phases[i].days);
    prefs.putInt((prefix + "loh").c_str(), phases[i].lightOnHour);
    prefs.putInt((prefix + "lom").c_str(), phases[i].lightOnMin);
    prefs.putInt((prefix + "lfh").c_str(), phases[i].lightOffHour);
    prefs.putInt((prefix + "lfm").c_str(), phases[i].lightOffMin);
    prefs.putInt((prefix + "pod").c_str(), phases[i].pumpOnDay);
    prefs.putInt((prefix + "pfd").c_str(), phases[i].pumpOffDay);
    prefs.putInt((prefix + "pon").c_str(), phases[i].pumpOnNight);
    prefs.putInt((prefix + "pfn").c_str(), phases[i].pumpOffNight);
  }
  prefs.end();
  Serial.println("Fases salvas no flash");
}

void loadPhases() {
  prefs.begin("hydro", true);
  numPhases = prefs.getInt("num_phases", 0);
  String sd = prefs.getString("start_date", "");
  if (sd.length() > 0) strncpy(startDate, sd.c_str(), sizeof(startDate) - 1);
  modeAuto = prefs.getBool("mode_auto", true);

  if (numPhases == 0) {
    prefs.end();
    loadDefaultPhases();
    savePhases();
    return;
  }

  for (int i = 0; i < numPhases && i < MAX_PHASES; i++) {
    String prefix = "p" + String(i) + "_";
    String n = prefs.getString((prefix + "name").c_str(), "Fase");
    strncpy(phases[i].name, n.c_str(), sizeof(phases[i].name) - 1);
    phases[i].days = prefs.getInt((prefix + "days").c_str(), 7);
    phases[i].lightOnHour = prefs.getInt((prefix + "loh").c_str(), 6);
    phases[i].lightOnMin = prefs.getInt((prefix + "lom").c_str(), 0);
    phases[i].lightOffHour = prefs.getInt((prefix + "lfh").c_str(), 18);
    phases[i].lightOffMin = prefs.getInt((prefix + "lfm").c_str(), 0);
    phases[i].pumpOnDay = prefs.getInt((prefix + "pod").c_str(), 15);
    phases[i].pumpOffDay = prefs.getInt((prefix + "pfd").c_str(), 15);
    phases[i].pumpOnNight = prefs.getInt((prefix + "pon").c_str(), 15);
    phases[i].pumpOffNight = prefs.getInt((prefix + "pfn").c_str(), 45);
  }
  prefs.end();
  Serial.printf("Fases carregadas: %d fases, inicio: %s\n", numPhases, startDate);
}

int getCycleDay() {
  struct tm t;
  if (!getCurrentTime(&t)) return 0;

  int sy, sm, sd;
  sscanf(startDate, "%d-%d-%d", &sy, &sm, &sd);

  struct tm startTm = {0};
  startTm.tm_year = sy - 1900;
  startTm.tm_mon = sm - 1;
  startTm.tm_mday = sd;
  time_t startTime = mktime(&startTm);
  time_t now = mktime(&t);

  int days = (int)((now - startTime) / 86400) + 1;
  return days > 0 ? days : 1;
}

int getCurrentPhaseIndex() {
  int cycleDay = getCycleDay();
  int dayCount = 0;
  for (int i = 0; i < numPhases; i++) {
    if (phases[i].days == 0) return i;  // infinito = ultima fase
    dayCount += phases[i].days;
    if (cycleDay <= dayCount) return i;
  }
  return numPhases - 1;  // fallback: ultima fase
}

// ===================== AUTOMACAO =====================

void setRelay(int pin, bool on) {
  digitalWrite(pin, on ? RELE_ON : RELE_OFF);
}

bool isLightTime(Phase *p) {
  struct tm t;
  if (!getCurrentTime(&t)) return false;

  int nowMin = t.tm_hour * 60 + t.tm_min;
  int onMin = p->lightOnHour * 60 + p->lightOnMin;
  int offMin = p->lightOffHour * 60 + p->lightOffMin;

  return nowMin >= onMin && nowMin < offMin;
}

bool isDayTime(Phase *p) {
  return isLightTime(p);  // dia = quando a luz esta ligada
}

void runAutomation() {
  if (!modeAuto || !ntpSynced) return;
  if (millis() - lastAutoCheck < 5000) return;  // checa a cada 5s
  lastAutoCheck = millis();

  int phaseIdx = getCurrentPhaseIndex();
  Phase *p = &phases[phaseIdx];

  // --- Luz ---
  bool shouldLight = isLightTime(p);
  if (shouldLight != lightState) {
    lightState = shouldLight;
    setRelay(RELE_LAMPADA, lightState);
    Serial.printf("Auto: Luz %s (fase: %s)\n", lightState ? "ON" : "OFF", p->name);
  }

  // --- Bomba (ciclo) ---
  bool isDay = isDayTime(p);
  int pumpOn = isDay ? p->pumpOnDay : p->pumpOnNight;
  int pumpOff = isDay ? p->pumpOffDay : p->pumpOffNight;
  int cycleTotal = (pumpOn + pumpOff) * 60 * 1000UL;  // em ms
  int onTime = pumpOn * 60 * 1000UL;

  if (cycleTotal == 0) return;

  unsigned long elapsed = millis() - pumpCycleStart;
  if (elapsed >= (unsigned long)cycleTotal) {
    pumpCycleStart = millis();
    elapsed = 0;
  }

  bool shouldPump = elapsed < (unsigned long)onTime;
  if (shouldPump != pumpState) {
    pumpState = shouldPump;
    setRelay(RELE_BOMBA, pumpState);
    Serial.printf("Auto: Bomba %s (%s, %dmin/%dmin)\n",
      pumpState ? "ON" : "OFF", isDay ? "dia" : "noite", pumpOn, pumpOff);
  }
}

// ===================== LED STATUS =====================

void updateStatusLed() {
  unsigned long now = millis();
  if (now - lastLedUpdate < 100) return;
  lastLedUpdate = now;

  switch (currentMode) {
    case MODE_SETUP:
      digitalWrite(LED_ONBOARD, (now / 250) % 2);
      break;
    case MODE_CONNECTED:
      digitalWrite(LED_ONBOARD, (now / 3000) % 2 == 0 && (now % 3000) < 100);
      break;
    case MODE_OFFLINE:
      {
        int pos = (now / 200) % 10;
        digitalWrite(LED_ONBOARD, pos < 6 && pos % 2 == 0);
      }
      break;
  }
}

// ===================== RESET BUTTON =====================

void checkResetButton() {
  static unsigned long pressStart = 0;
  static bool pressing = false;

  if (digitalRead(RESET_BTN) == LOW) {
    if (!pressing) { pressStart = millis(); pressing = true; }
    if (millis() - pressStart > 3000) {
      Serial.println("Reset WiFi ativado!");
      for (int i = 0; i < 6; i++) {
        digitalWrite(LED_ONBOARD, i % 2);
        delay(200);
      }
      clearWiFiCredentials();
      ESP.restart();
    }
  } else {
    pressing = false;
  }
}

// ===================== WEB SERVER =====================

void sendCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

String getStatusJSON() {
  struct tm t;
  bool hasTime = getCurrentTime(&t);
  int cycleDay = getCycleDay();
  int phaseIdx = getCurrentPhaseIndex();
  Phase *p = &phases[phaseIdx];

  String json = "{";
  json += "\"chip_id\":\"" + chipId + "\",";
  json += "\"short_id\":\"" + shortId + "\",";
  json += "\"mode\":\"" + String(modeAuto ? "auto" : "manual") + "\",";
  json += "\"light\":" + String(lightState ? "true" : "false") + ",";
  json += "\"pump\":" + String(pumpState ? "true" : "false") + ",";
  json += "\"cycle_day\":" + String(cycleDay) + ",";
  json += "\"phase\":\"" + String(p->name) + "\",";
  json += "\"phase_index\":" + String(phaseIdx) + ",";
  json += "\"num_phases\":" + String(numPhases) + ",";
  json += "\"start_date\":\"" + String(startDate) + "\",";
  json += "\"ntp_synced\":" + String(ntpSynced ? "true" : "false") + ",";
  if (hasTime) {
    char timeStr[9];
    snprintf(timeStr, sizeof(timeStr), "%02d:%02d:%02d", t.tm_hour, t.tm_min, t.tm_sec);
    json += "\"time\":\"" + String(timeStr) + "\",";
  }
  json += "\"uptime\":" + String(millis() / 1000) + ",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"ssid\":\"" + WiFi.SSID() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI());
  json += "}";
  return json;
}

void handleDashboard() {
  struct tm t;
  bool hasTime = getCurrentTime(&t);
  int cycleDay = getCycleDay();
  int phaseIdx = getCurrentPhaseIndex();
  Phase *p = &phases[phaseIdx];

  char timeStr[9] = "--:--:--";
  if (hasTime) snprintf(timeStr, sizeof(timeStr), "%02d:%02d:%02d", t.tm_hour, t.tm_min, t.tm_sec);

  // Barra de progresso das fases
  String progressBar = "";
  int totalDays = 0;
  for (int i = 0; i < numPhases; i++) totalDays += phases[i].days > 0 ? phases[i].days : 30;
  int accumulated = 0;
  for (int i = 0; i < numPhases; i++) {
    int d = phases[i].days > 0 ? phases[i].days : 30;
    int pct = (d * 100) / totalDays;
    String color = i == phaseIdx ? "#27ae60" : "#e0e0e0";
    String textColor = i == phaseIdx ? "#fff" : "#666";
    progressBar += "<div style='flex:" + String(pct) + ";background:" + color + ";color:" + textColor;
    progressBar += ";padding:6px 4px;text-align:center;font-size:0.7rem;font-weight:600'>";
    progressBar += String(phases[i].name);
    if (i == phaseIdx) progressBar += " &#9679;";
    progressBar += "</div>";
  }

  // Fases detalhadas
  String phasesHtml = "";
  for (int i = 0; i < numPhases; i++) {
    Phase *ph = &phases[i];
    String border = i == phaseIdx ? "border-left:4px solid #27ae60" : "border-left:4px solid #e0e0e0";
    String badge = i == phaseIdx ? " <span style='background:#27ae60;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.65rem'>ATIVA</span>" : "";
    String diasStr = ph->days > 0 ? String(ph->days) + " dias" : "&#8734;";

    phasesHtml += "<div style='background:#fff;border-radius:12px;padding:12px;margin-bottom:8px;" + border + "'>";
    phasesHtml += "<div style='display:flex;justify-content:space-between;align-items:center'>";
    phasesHtml += "<b>" + String(ph->name) + "</b>" + badge;
    phasesHtml += "<span style='color:#888;font-size:0.8rem'>" + diasStr + "</span></div>";
    phasesHtml += "<div style='color:#666;font-size:0.8rem;margin-top:6px'>";
    phasesHtml += "&#128161; " + String(ph->lightOnHour) + ":" + (ph->lightOnMin < 10 ? "0" : "") + String(ph->lightOnMin);
    phasesHtml += " - " + String(ph->lightOffHour) + ":" + (ph->lightOffMin < 10 ? "0" : "") + String(ph->lightOffMin) + "<br>";
    phasesHtml += "&#128167; Dia: " + String(ph->pumpOnDay) + "/" + String(ph->pumpOffDay) + "min";
    phasesHtml += " | Noite: " + String(ph->pumpOnNight) + "/" + String(ph->pumpOffNight) + "min";
    phasesHtml += "</div></div>";
  }

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<title>Cultivee Hidroponia</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;color:#1a1a2e;max-width:480px;margin:0 auto}
.top{background:linear-gradient(135deg,#1a472a,#27ae60);color:#fff;padding:20px;text-align:center}
.top h1{font-size:1.3rem;margin-bottom:2px}
.top p{font-size:0.8rem;opacity:0.8}
.card{background:#fff;border-radius:16px;margin:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stat{text-align:center}
.stat .label{font-size:0.7rem;color:#888;text-transform:uppercase;font-weight:600}
.stat .value{font-size:1.5rem;font-weight:700;color:#1a472a}
.btn{display:inline-block;padding:10px 20px;border-radius:25px;font-weight:700;font-size:0.85rem;
border:none;cursor:pointer;text-decoration:none;text-align:center}
.btn-on{background:#27ae60;color:#fff}
.btn-off{background:#e74c3c;color:#fff}
.btn-outline{background:#fff;color:#27ae60;border:2px solid #27ae60}
.btn-gray{background:#95a5a6;color:#fff}
.status-row{display:flex;gap:8px;justify-content:center;margin:10px 0}
.progress{display:flex;border-radius:8px;overflow:hidden;margin:10px 0}
.footer{text-align:center;padding:15px;color:#888;font-size:0.75rem}
</style></head><body>
<div class='top'>
<h1>&#127793; Cultivee Hidroponia</h1>
<p>Controle e Monitoramento</p>
</div>

<div class='card'>
<div class='grid'>
<div class='stat'><div class='label'>Ciclo</div><div class='value'>Dia )rawliteral" + String(cycleDay) + R"rawliteral(</div></div>
<div class='stat'><div class='label'>Fase</div><div class='value' style='font-size:1.1rem'>)rawliteral" + String(p->name) + R"rawliteral(</div></div>
<div class='stat'><div class='label'>Horario</div><div class='value' style='font-size:1.1rem'>)rawliteral" + String(timeStr) + R"rawliteral(</div></div>
<div class='stat'><div class='label'>Status</div>
<div class='status-row'>
<span class='btn )rawliteral" + String(lightState ? "btn-on" : "btn-gray") + R"rawliteral(' onclick="cmd('light','toggle')">LUZ</span>
<span class='btn )rawliteral" + String(pumpState ? "btn-on" : "btn-gray") + R"rawliteral(' onclick="cmd('pump','toggle')">BOMBA</span>
</div>
<div style='font-size:0.75rem;color:#888'>)rawliteral" + String(modeAuto ? "Automatico" : "Manual") + R"rawliteral(</div>
</div>
</div>
</div>

<div class='card' style='padding:8px 10px'>
<div class='progress'>)rawliteral" + progressBar + R"rawliteral(</div>
</div>

<div style='margin:10px;display:flex;gap:8px'>
<a href='/config' class='btn btn-outline' style='flex:1'>&#9881; Configurar</a>
<span class='btn )rawliteral" + String(modeAuto ? "btn-outline" : "btn-on") + R"rawliteral(' style='flex:1' onclick="cmd('mode','toggle')">)rawliteral" + String(modeAuto ? "Manual" : "Automatico") + R"rawliteral(</span>
</div>

<div style='margin:0 10px'><h3 style='margin:10px 0;font-size:0.95rem'>Fases Configuradas</h3>
)rawliteral" + phasesHtml + R"rawliteral(</div>

<div class='footer'>Cultivee Hidroponia v1.0 | )rawliteral" + WiFi.localIP().toString() + R"rawliteral(</div>

<script>
function cmd(device, action) {
  fetch('/relay?device=' + device + '&action=' + action)
    .then(() => setTimeout(() => location.reload(), 300));
}
setInterval(() => location.reload(), 10000);
</script>
</body></html>)rawliteral";

  server.send(200, "text/html", html);
}

void handleConfig() {
  // Gera formulario de configuracao
  String phaseForms = "";
  for (int i = 0; i < numPhases; i++) {
    Phase *p = &phases[i];
    phaseForms += "<div style='background:#fff;border-radius:12px;padding:12px;margin-bottom:10px'>";
    phaseForms += "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px'>";
    phaseForms += "<b>Fase " + String(i + 1) + "</b>";
    if (numPhases > 1) phaseForms += "<button type='button' onclick=\"removePhase(" + String(i) + ")\" style='background:#e74c3c;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer'>X</button>";
    phaseForms += "</div>";
    phaseForms += "<input name='n" + String(i) + "' value='" + String(p->name) + "' placeholder='Nome' style='width:100%;padding:8px;margin:4px 0;border:1px solid #ddd;border-radius:8px'>";
    phaseForms += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:6px'>";
    phaseForms += "<label style='font-size:0.75rem'>Dias (0=infinito)<input type='number' name='d" + String(i) + "' value='" + String(p->days) + "' min='0' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "<label style='font-size:0.75rem'>Luz ON<input type='time' name='lon" + String(i) + "' value='" + (p->lightOnHour < 10 ? "0" : "") + String(p->lightOnHour) + ":" + (p->lightOnMin < 10 ? "0" : "") + String(p->lightOnMin) + "' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "<label style='font-size:0.75rem'>Luz OFF<input type='time' name='loff" + String(i) + "' value='" + (p->lightOffHour < 10 ? "0" : "") + String(p->lightOffHour) + ":" + (p->lightOffMin < 10 ? "0" : "") + String(p->lightOffMin) + "' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "<label style='font-size:0.75rem'>Bomba Dia ON (min)<input type='number' name='pod" + String(i) + "' value='" + String(p->pumpOnDay) + "' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "<label style='font-size:0.75rem'>Bomba Dia OFF (min)<input type='number' name='pfd" + String(i) + "' value='" + String(p->pumpOffDay) + "' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "<label style='font-size:0.75rem'>Bomba Noite ON (min)<input type='number' name='pon" + String(i) + "' value='" + String(p->pumpOnNight) + "' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "<label style='font-size:0.75rem'>Bomba Noite OFF (min)<input type='number' name='pfn" + String(i) + "' value='" + String(p->pumpOffNight) + "' style='width:100%;padding:6px;border:1px solid #ddd;border-radius:6px'></label>";
    phaseForms += "</div></div>";
  }

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<title>Configuracao - Cultivee</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;color:#1a1a2e;max-width:480px;margin:0 auto}
.top{background:linear-gradient(135deg,#1a472a,#27ae60);color:#fff;padding:15px;text-align:center}
.btn{display:inline-block;padding:10px 20px;border-radius:25px;font-weight:700;font-size:0.85rem;border:none;cursor:pointer}
.btn-on{background:#27ae60;color:#fff}
.btn-outline{background:#fff;color:#27ae60;border:2px solid #27ae60}
.btn-red{background:#e74c3c;color:#fff}
</style></head><body>
<div class='top'><h1>&#9881; Configuracao</h1></div>

<form method='POST' action='/save-config' style='padding:10px'>
<div style='background:#fff;border-radius:12px;padding:12px;margin-bottom:10px'>
<label style='font-size:0.85rem;font-weight:600'>Data de Inicio do Cultivo</label>
<input type='date' name='start_date' value=')rawliteral" + String(startDate) + R"rawliteral(' style='width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;border-radius:8px'>
</div>

<h3 style='margin:10px 0;font-size:0.95rem'>Fases</h3>
<div id='phases'>)rawliteral" + phaseForms + R"rawliteral(</div>
<input type='hidden' name='num_phases' id='num_phases' value=')rawliteral" + String(numPhases) + R"rawliteral('>

<div style='display:flex;gap:8px;margin:10px 0'>
<button type='submit' class='btn btn-on' style='flex:1'>Salvar</button>
<a href='/' class='btn btn-outline' style='flex:1;text-align:center'>Voltar</a>
</div>
<div style='display:flex;gap:8px'>
<button type='button' onclick='addPhase()' class='btn btn-outline' style='flex:1'>+ Adicionar Fase</button>
<a href='/reset-phases' class='btn btn-red' style='flex:1;text-align:center' onclick="return confirm('Restaurar fases padrao?')">Restaurar Padrao</a>
</div>
</form>

<script>
function removePhase(idx) {
  if(!confirm('Remover esta fase?')) return;
  fetch('/remove-phase?idx='+idx).then(()=>location.reload());
}
function addPhase() {
  fetch('/add-phase').then(()=>location.reload());
}
</script>
</body></html>)rawliteral";

  server.send(200, "text/html", html);
}

void handleSaveConfig() {
  String sd = server.arg("start_date");
  if (sd.length() > 0) strncpy(startDate, sd.c_str(), sizeof(startDate) - 1);

  int np = server.arg("num_phases").toInt();
  if (np > MAX_PHASES) np = MAX_PHASES;

  for (int i = 0; i < np; i++) {
    String n = server.arg("n" + String(i));
    if (n.length() > 0) strncpy(phases[i].name, n.c_str(), sizeof(phases[i].name) - 1);
    phases[i].days = server.arg("d" + String(i)).toInt();

    String lon = server.arg("lon" + String(i));
    if (lon.length() >= 5) {
      phases[i].lightOnHour = lon.substring(0, 2).toInt();
      phases[i].lightOnMin = lon.substring(3, 5).toInt();
    }
    String loff = server.arg("loff" + String(i));
    if (loff.length() >= 5) {
      phases[i].lightOffHour = loff.substring(0, 2).toInt();
      phases[i].lightOffMin = loff.substring(3, 5).toInt();
    }

    phases[i].pumpOnDay = server.arg("pod" + String(i)).toInt();
    phases[i].pumpOffDay = server.arg("pfd" + String(i)).toInt();
    phases[i].pumpOnNight = server.arg("pon" + String(i)).toInt();
    phases[i].pumpOffNight = server.arg("pfn" + String(i)).toInt();
  }
  numPhases = np;
  savePhases();
  pumpCycleStart = millis();  // Reset ciclo da bomba

  server.sendHeader("Location", "/");
  server.send(302, "text/plain", "Salvo!");
}

void handleRelay() {
  String device = server.arg("device");
  String action = server.arg("action");

  if (device == "mode") {
    modeAuto = !modeAuto;
    if (!modeAuto) {
      // Ao entrar em manual, mantém estado atual
      manualLight = lightState;
      manualPump = pumpState;
    }
    prefs.begin("hydro", false);
    prefs.putBool("mode_auto", modeAuto);
    prefs.end();
    Serial.printf("Modo: %s\n", modeAuto ? "Automatico" : "Manual");
  } else if (device == "light") {
    if (!modeAuto || action == "toggle") {
      lightState = !lightState;
      setRelay(RELE_LAMPADA, lightState);
      if (!modeAuto) modeAuto = false;  // Força manual
      Serial.printf("Manual: Luz %s\n", lightState ? "ON" : "OFF");
    }
  } else if (device == "pump") {
    if (!modeAuto || action == "toggle") {
      pumpState = !pumpState;
      setRelay(RELE_BOMBA, pumpState);
      if (!modeAuto) modeAuto = false;
      Serial.printf("Manual: Bomba %s\n", pumpState ? "ON" : "OFF");
    }
  }

  sendCORS();
  server.send(200, "application/json", getStatusJSON());
}

void handleAddPhase() {
  if (numPhases < MAX_PHASES) {
    strcpy(phases[numPhases].name, "Nova Fase");
    phases[numPhases].days = 7;
    phases[numPhases].lightOnHour = 6; phases[numPhases].lightOnMin = 0;
    phases[numPhases].lightOffHour = 18; phases[numPhases].lightOffMin = 0;
    phases[numPhases].pumpOnDay = 15; phases[numPhases].pumpOffDay = 15;
    phases[numPhases].pumpOnNight = 15; phases[numPhases].pumpOffNight = 45;
    numPhases++;
    savePhases();
  }
  server.sendHeader("Location", "/config");
  server.send(302);
}

void handleRemovePhase() {
  int idx = server.arg("idx").toInt();
  if (idx >= 0 && idx < numPhases && numPhases > 1) {
    for (int i = idx; i < numPhases - 1; i++) phases[i] = phases[i + 1];
    numPhases--;
    savePhases();
  }
  server.sendHeader("Location", "/config");
  server.send(302);
}

void handleResetPhases() {
  loadDefaultPhases();
  savePhases();
  server.sendHeader("Location", "/config");
  server.send(302);
}

void handleStatus() {
  sendCORS();
  server.send(200, "application/json", getStatusJSON());
}

// --- WiFi Setup Page ---
void handleSetupPage() {
  int n = WiFi.scanNetworks();
  String options = "";
  for (int i = 0; i < n; i++) {
    options += "<option value='" + WiFi.SSID(i) + "'>" + WiFi.SSID(i) + " (" + String(WiFi.RSSI(i)) + " dBm)</option>";
  }

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:20px;padding:30px;width:90%;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.1);text-align:center}
h1{color:#27ae60;font-size:1.8rem}
p{color:#888;margin:5px 0 20px}
select,input{width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:10px;font-size:1rem}
button{width:100%;padding:14px;background:#27ae60;color:#fff;border:none;border-radius:10px;font-size:1.1rem;font-weight:700;cursor:pointer;margin-top:10px}
</style></head><body>
<div class='card'>
<h1>Cultivee</h1>
<p>Configurar WiFi</p>
<form method='POST' action='/save-wifi'>
<select name='ssid'>)rawliteral" + options + R"rawliteral(</select>
<input type='password' name='password' placeholder='Senha do WiFi' id='pass'>
<label style='display:flex;align-items:center;gap:6px;font-size:0.85rem;margin:8px 0;cursor:pointer'>
<input type='checkbox' onclick="document.getElementById('pass').type=this.checked?'text':'password'"> Mostrar senha</label>
<button type='submit'>Conectar</button>
</form></div></body></html>)rawliteral";

  server.send(200, "text/html", html);
}

void handleSaveWiFi() {
  String ssid = server.arg("ssid");
  String pass = server.arg("password");
  saveWiFiCredentials(ssid, pass);

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:20px;padding:30px;width:90%;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.1);text-align:center}
h2{color:#27ae60;margin:10px 0}
</style></head><body>
<div class='card'>
<div style='font-size:3rem'>&#10003;</div>
<h2>WiFi configurado!</h2>
<p>Conectando em ')rawliteral" + ssid + R"rawliteral('...</p>
<p style='margin-top:15px;color:#888'>O dispositivo vai reiniciar.<br>Reconecte no WiFi <b>)rawliteral" + ssid + R"rawliteral(</b> e acesse o IP do dispositivo.</p>
</div></body></html>)rawliteral";

  server.send(200, "text/html", html);
  delay(2000);
  ESP.restart();
}

void handleResetWiFi() {
  clearWiFiCredentials();
  server.send(200, "text/plain", "WiFi resetado. Reiniciando...");
  delay(1000);
  ESP.restart();
}

// Portal cativo redirects
void handleCaptiveRedirect() {
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/plain", "");
}

// ===================== SETUP =====================

void setup() {
  Serial.begin(115200);
  delay(1000);

  // GPIO
  pinMode(RELE_LAMPADA, OUTPUT);
  pinMode(RELE_BOMBA, OUTPUT);
  pinMode(LED_ONBOARD, OUTPUT);
  pinMode(RESET_BTN, INPUT_PULLUP);
  setRelay(RELE_LAMPADA, false);
  setRelay(RELE_BOMBA, false);

  // Chip ID
  uint64_t mac = ESP.getEfuseMac();
  char macStr[13];
  snprintf(macStr, sizeof(macStr), "%04X%08X", (uint16_t)(mac >> 32), (uint32_t)mac);
  chipId = String(macStr);
  shortId = chipId.substring(chipId.length() - 4);

  Serial.println("\n=== Cultivee Hidroponia ===");
  Serial.printf("Chip ID: %s (%s)\n", chipId.c_str(), shortId.c_str());

  // Carregar fases
  loadPhases();

  // WiFi
  loadWiFiCredentials();
  if (savedSSID.length() > 0 && connectWiFi()) {
    currentMode = MODE_CONNECTED;
    setupNTP();
  } else {
    startSetupAP();
  }

  // Web server routes
  if (currentMode == MODE_SETUP) {
    server.on("/", handleSetupPage);
    server.on("/save-wifi", HTTP_POST, handleSaveWiFi);
    // Captive portal
    server.on("/generate_204", handleCaptiveRedirect);
    server.on("/gen_204", handleCaptiveRedirect);
    server.on("/hotspot-detect.html", handleCaptiveRedirect);
    server.on("/connecttest.txt", handleCaptiveRedirect);
    server.on("/ncsi.txt", handleCaptiveRedirect);
    server.on("/canonical.html", handleCaptiveRedirect);
    server.onNotFound(handleCaptiveRedirect);
  } else {
    server.on("/", handleDashboard);
    server.on("/config", handleConfig);
    server.on("/save-config", HTTP_POST, handleSaveConfig);
    server.on("/relay", handleRelay);
    server.on("/status", handleStatus);
    server.on("/reset-wifi", handleResetWiFi);
    server.on("/add-phase", handleAddPhase);
    server.on("/remove-phase", handleRemovePhase);
    server.on("/reset-phases", handleResetPhases);
  }

  server.begin();
  Serial.println("Web server iniciado");
  pumpCycleStart = millis();
}

// ===================== SERIAL COMMANDS =====================

void handleSerialCommands() {
  if (!Serial.available()) return;
  String cmd = Serial.readStringUntil('\n');
  cmd.trim();

  if (cmd == "L1") {
    lightState = true;
    setRelay(RELE_LAMPADA, true);
    modeAuto = false;
    Serial.println("OK:L1");
  } else if (cmd == "L0") {
    lightState = false;
    setRelay(RELE_LAMPADA, false);
    modeAuto = false;
    Serial.println("OK:L0");
  } else if (cmd == "P1") {
    pumpState = true;
    setRelay(RELE_BOMBA, true);
    modeAuto = false;
    Serial.println("OK:P1");
  } else if (cmd == "P0") {
    pumpState = false;
    setRelay(RELE_BOMBA, false);
    modeAuto = false;
    Serial.println("OK:P0");
  } else if (cmd == "AUTO") {
    modeAuto = true;
    Serial.println("OK:AUTO");
  } else if (cmd == "STATUS") {
    Serial.printf("L:%d P:%d M:%s\n", lightState, pumpState, modeAuto ? "auto" : "manual");
  }
}

// ===================== LOOP =====================

void loop() {
  checkResetButton();
  handleSerialCommands();

  if (currentMode == MODE_SETUP) {
    dnsServer.processNextRequest();
  }

  server.handleClient();
  updateStatusLed();

  if (currentMode == MODE_CONNECTED) {
    runAutomation();
  }
}
