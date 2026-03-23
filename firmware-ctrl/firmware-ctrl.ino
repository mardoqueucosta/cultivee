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
#include <ESPmDNS.h>
#include <time.h>
#include "config.h"

// Protecao contra configuracao errada
#if !defined(ENV_LOCAL) && !defined(ENV_PRODUCTION)
  #error "Defina ENV_LOCAL ou ENV_PRODUCTION em config.h"
#endif
#if defined(ENV_LOCAL) && defined(ENV_PRODUCTION)
  #error "Defina APENAS um: ENV_LOCAL ou ENV_PRODUCTION em config.h"
#endif

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
unsigned long lastWiFiRetry = 0;
#define WIFI_RETRY_INTERVAL 30000  // tenta reconectar a cada 30s

// Polling adaptativo
unsigned long currentPollInterval = REGISTER_INTERVAL;  // começa com default
unsigned long lastPollCheck = 0;
#define POLL_FAST_INTERVAL 1000  // poll rapido: a cada 1s quando ha atividade

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
  WiFi.softAP(AP_SSID);
  delay(100);
  dnsServer.start(53, "*", WiFi.softAPIP());
  currentMode = MODE_SETUP;
  Serial.printf("AP Setup iniciado: %s IP: %s\n", AP_SSID, WiFi.softAPIP().toString().c_str());
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

  strcpy(phases[0].name, "Muda");
  phases[0].days = 3;
  phases[0].lightOnHour = 6; phases[0].lightOnMin = 0;
  phases[0].lightOffHour = 18; phases[0].lightOffMin = 0;
  phases[0].pumpOnDay = 15; phases[0].pumpOffDay = 15;
  phases[0].pumpOnNight = 15; phases[0].pumpOffNight = 45;

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
  phases[2].pumpOnNight = 15; phases[2].pumpOffNight = 45;
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

  if (onMin <= offMin) {
    // Periodo normal: ex 06:00 - 18:00
    return nowMin >= onMin && nowMin < offMin;
  } else {
    // Cruza meia-noite: ex 20:00 - 06:00
    return nowMin >= onMin || nowMin < offMin;
  }
}

bool isDayTime(Phase *p) {
  return isLightTime(p);  // dia = quando a luz esta ligada
}

void runAutomation() {
  if (!modeAuto) return;
  // Verifica se tem horario valido (NTP sincronizado ou RTC externo futuro)
  struct tm testTime;
  if (!getCurrentTime(&testTime)) return;  // sem horario = nao roda
  if (testTime.tm_year < (2024 - 1900)) return;  // horario invalido (antes de 2024)
  if (!ntpSynced) ntpSynced = true;  // marcamos como synced se horario eh valido
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
  unsigned long pumpOn = isDay ? p->pumpOnDay : p->pumpOnNight;
  unsigned long pumpOff = isDay ? p->pumpOffDay : p->pumpOffNight;
  unsigned long cycleTotal = (pumpOn + pumpOff) * 60UL * 1000UL;  // em ms
  unsigned long onTime = pumpOn * 60UL * 1000UL;

  if (cycleTotal == 0) return;

  // Usa NTP para calcular posicao no ciclo (sobrevive a reboot)
  struct tm ct;
  if (getCurrentTime(&ct)) {
    unsigned long secsSinceMidnight = ct.tm_hour * 3600UL + ct.tm_min * 60UL + ct.tm_sec;
    unsigned long msSinceMidnight = secsSinceMidnight * 1000UL;
    unsigned long cycleTotalSec = (pumpOn + pumpOff) * 60UL;
    unsigned long posInCycle = (secsSinceMidnight % cycleTotalSec) * 1000UL;
    bool shouldPump = posInCycle < onTime;
    if (shouldPump != pumpState) {
      pumpState = shouldPump;
      setRelay(RELE_BOMBA, pumpState);
      Serial.printf("Auto: Bomba %s (%s, %lumin/%lumin)\n",
        pumpState ? "ON" : "OFF", isDay ? "dia" : "noite", pumpOn, pumpOff);
    }
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
  static bool wasPressed = false;

  if (digitalRead(RESET_BTN) == LOW) {
    if (!wasPressed) {
      pressStart = millis();
      wasPressed = true;
      Serial.println("Botao pressionado...");
    }
    // Feedback visual: LED pisca enquanto segura (apos 1s)
    if (millis() - pressStart > 1000) {
      digitalWrite(LED_ONBOARD, (millis() / 200) % 2);
    }
    // Se segurou por 3 segundos
    if (millis() - pressStart >= 3000) {
      Serial.println(">>> RESET WiFi via botao! <<<");
      // Confirmacao visual: 2 piscadas longas
      digitalWrite(LED_ONBOARD, HIGH);
      delay(500);
      digitalWrite(LED_ONBOARD, LOW);
      delay(200);
      digitalWrite(LED_ONBOARD, HIGH);
      delay(500);
      digitalWrite(LED_ONBOARD, LOW);
      clearWiFiCredentials();
      ESP.restart();
    }
  } else {
    if (wasPressed) {
      digitalWrite(LED_ONBOARD, LOW);
      Serial.println("Botao solto antes dos 3s");
    }
    wasPressed = false;
  }
}

// ===================== POLL RAPIDO DE COMANDOS =====================

void pollCommands() {
  if (currentMode != MODE_CONNECTED) return;
  // So faz poll rapido quando intervalo eh curto (atividade recente)
  if (currentPollInterval >= 10000) return;
  if (millis() - lastPollCheck < POLL_FAST_INTERVAL) return;
  // Nao fazer poll se registro completo vai acontecer em breve
  if (millis() - lastRegister >= currentPollInterval - 500) return;
  lastPollCheck = millis();

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/modules/poll?chip_id=" + chipId;
  http.begin(url);
  http.setTimeout(3000);

  int code = http.GET();
  if (code == 200) {
    String response = http.getString();

    // Atualiza poll interval
    int piKey = response.indexOf("\"poll_interval\":");
    if (piKey >= 0) {
      unsigned long newInterval = response.substring(piKey + 16).toInt();
      if (newInterval >= 1000 && newInterval <= 60000) {
        currentPollInterval = newInterval;
      }
    }

    // Processa comandos
    int cmdsStart = response.indexOf("\"commands\":[");
    if (cmdsStart >= 0) {
      int arrStart = response.indexOf("[", cmdsStart);
      int arrEnd = response.indexOf("]", arrStart);
      if (arrStart >= 0 && arrEnd > arrStart + 1) {
        processPendingCommands(response);
      }
    }
  }
  http.end();
}

// ===================== REGISTRO NO SERVIDOR =====================

void registerOnServer() {
  if (currentMode != MODE_CONNECTED) return;
  if (millis() - lastRegister < currentPollInterval) return;
  lastRegister = millis();

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/modules/register";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  // Monta ctrl_data com estado da hidroponia
  int cycleDay = getCycleDay();
  int phaseIdx = getCurrentPhaseIndex();
  Phase *p = &phases[phaseIdx];

  struct tm t;
  bool hasTime = getCurrentTime(&t);
  char timeStr[9] = "--:--:--";
  if (hasTime) snprintf(timeStr, sizeof(timeStr), "%02d:%02d:%02d", t.tm_hour, t.tm_min, t.tm_sec);

  // Monta JSON das fases
  String phasesJson = "[";
  for (int i = 0; i < numPhases; i++) {
    if (i > 0) phasesJson += ",";
    phasesJson += "{\"name\":\"" + String(phases[i].name) + "\"";
    phasesJson += ",\"days\":" + String(phases[i].days);
    phasesJson += ",\"lightOnHour\":" + String(phases[i].lightOnHour);
    phasesJson += ",\"lightOnMin\":" + String(phases[i].lightOnMin);
    phasesJson += ",\"lightOffHour\":" + String(phases[i].lightOffHour);
    phasesJson += ",\"lightOffMin\":" + String(phases[i].lightOffMin);
    phasesJson += ",\"pumpOnDay\":" + String(phases[i].pumpOnDay);
    phasesJson += ",\"pumpOffDay\":" + String(phases[i].pumpOffDay);
    phasesJson += ",\"pumpOnNight\":" + String(phases[i].pumpOnNight);
    phasesJson += ",\"pumpOffNight\":" + String(phases[i].pumpOffNight);
    phasesJson += "}";
  }
  phasesJson += "]";

  String json = "{";
  json += "\"chip_id\":\"" + chipId + "\",";
  json += "\"short_id\":\"" + shortId + "\",";
  json += "\"type\":\"" + String(MODULE_TYPE) + "\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"ssid\":\"" + WiFi.SSID() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"uptime\":" + String(millis() / 1000) + ",";
  json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  json += "\"ctrl_data\":{";
  json += "\"light\":" + String(lightState ? "true" : "false") + ",";
  json += "\"pump\":" + String(pumpState ? "true" : "false") + ",";
  json += "\"mode\":\"" + String(modeAuto ? "auto" : "manual") + "\",";
  json += "\"phase\":\"" + String(p->name) + "\",";
  json += "\"phase_index\":" + String(phaseIdx) + ",";
  json += "\"cycle_day\":" + String(cycleDay) + ",";
  json += "\"num_phases\":" + String(numPhases) + ",";
  json += "\"start_date\":\"" + String(startDate) + "\",";
  json += "\"ntp_synced\":" + String(ntpSynced ? "true" : "false") + ",";
  json += "\"time\":\"" + String(timeStr) + "\",";
  json += "\"phases\":" + phasesJson;
  json += "}}";

  int code = http.POST(json);
  if (code == 200) {
    String response = http.getString();

    // Atualiza polling adaptativo
    int piKey = response.indexOf("\"poll_interval\":");
    if (piKey >= 0) {
      unsigned long newInterval = response.substring(piKey + 16).toInt();
      if (newInterval >= 1000 && newInterval <= 60000) {
        if (newInterval != currentPollInterval) {
          Serial.printf("Poll interval: %lu -> %lu ms\n", currentPollInterval, newInterval);
        }
        currentPollInterval = newInterval;
      }
    }

    Serial.printf("Registrado OK (poll=%lums)\n", currentPollInterval);

    // Processa comandos pendentes do servidor
    processPendingCommands(response);
  } else {
    Serial.printf("Erro registro servidor: %d\n", code);
  }
  http.end();
}

// Helper: extrai valor string de chave em JSON plano
String jsonVal(String json, String key) {
  String search = "\"" + key + "\":\"";
  int start = json.indexOf(search);
  if (start < 0) return "";
  start += search.length();
  int end = json.indexOf("\"", start);
  return (end > start) ? json.substring(start, end) : "";
}

int jsonInt(String json, String key) {
  String search = "\"" + key + "\":";
  int start = json.indexOf(search);
  if (start < 0) return -1;
  return json.substring(start + search.length()).toInt();
}

void processPendingCommands(String response) {
  // Formato esperado: {"status":"ok","commands":[{"cmd":"relay","device":"light","action":"toggle"}]}
  int cmdsStart = response.indexOf("\"commands\":[");
  if (cmdsStart < 0) return;

  int arrStart = response.indexOf("[", cmdsStart);
  int arrEnd = response.lastIndexOf("]");
  if (arrStart < 0 || arrEnd < 0 || arrEnd <= arrStart + 1) return;

  String cmdsStr = response.substring(arrStart + 1, arrEnd);
  Serial.printf("Cmds pendentes: %s\n", cmdsStr.c_str());

  int pos = 0;
  while (pos < (int)cmdsStr.length()) {
    int objStart = cmdsStr.indexOf("{", pos);
    if (objStart < 0) break;
    int objEnd = cmdsStr.indexOf("}", objStart);
    if (objEnd < 0) break;

    String obj = cmdsStr.substring(objStart, objEnd + 1);
    pos = objEnd + 1;

    String cmd = jsonVal(obj, "cmd");
    Serial.printf("Exec: %s\n", cmd.c_str());

    if (cmd == "relay") {
      String device = jsonVal(obj, "device");
      if (device == "mode") {
        modeAuto = !modeAuto;
        Serial.printf("Remoto: Modo %s\n", modeAuto ? "Auto" : "Manual");
      } else if (device == "light") {
        lightState = !lightState;
        setRelay(RELE_LAMPADA, lightState);
        if (modeAuto) modeAuto = false;
        Serial.printf("Remoto: Luz %s\n", lightState ? "ON" : "OFF");
      } else if (device == "pump") {
        pumpState = !pumpState;
        setRelay(RELE_BOMBA, pumpState);
        if (modeAuto) modeAuto = false;
        Serial.printf("Remoto: Bomba %s\n", pumpState ? "ON" : "OFF");
      }
    } else if (cmd == "add-phase") {
      if (numPhases < MAX_PHASES) {
        strcpy(phases[numPhases].name, "Nova Fase");
        phases[numPhases].days = 7;
        phases[numPhases].lightOnHour = 6; phases[numPhases].lightOnMin = 0;
        phases[numPhases].lightOffHour = 18; phases[numPhases].lightOffMin = 0;
        phases[numPhases].pumpOnDay = 15; phases[numPhases].pumpOffDay = 15;
        phases[numPhases].pumpOnNight = 15; phases[numPhases].pumpOffNight = 45;
        numPhases++;
        savePhases();
        Serial.println("Remoto: Fase adicionada");
      }
    } else if (cmd == "reset-phases") {
      loadDefaultPhases();
      savePhases();
      Serial.println("Remoto: Fases restauradas");
    } else if (cmd == "remove-phase") {
      int idx = jsonInt(obj, "idx");
      if (idx >= 0 && idx < numPhases && numPhases > 1) {
        for (int i = idx; i < numPhases - 1; i++) phases[i] = phases[i + 1];
        numPhases--;
        savePhases();
        Serial.printf("Remoto: Fase %d removida\n", idx);
      }
    } else if (cmd == "save-config") {
      // Extrai start_date
      String sd = jsonVal(obj, "start_date");
      if (sd.length() > 0) strncpy(startDate, sd.c_str(), sizeof(startDate) - 1);

      int np = jsonInt(obj, "num_phases");
      if (np > 0 && np <= MAX_PHASES) {
        for (int i = 0; i < np; i++) {
          String n = jsonVal(obj, "n" + String(i));
          if (n.length() > 0) strncpy(phases[i].name, n.c_str(), sizeof(phases[i].name) - 1);
          phases[i].days = jsonInt(obj, "d" + String(i));

          String lon = jsonVal(obj, "lon" + String(i));
          if (lon.length() >= 5) {
            phases[i].lightOnHour = lon.substring(0, 2).toInt();
            phases[i].lightOnMin = lon.substring(3, 5).toInt();
          }
          String loff = jsonVal(obj, "loff" + String(i));
          if (loff.length() >= 5) {
            phases[i].lightOffHour = loff.substring(0, 2).toInt();
            phases[i].lightOffMin = loff.substring(3, 5).toInt();
          }

          phases[i].pumpOnDay = jsonInt(obj, "pod" + String(i));
          phases[i].pumpOffDay = jsonInt(obj, "pfd" + String(i));
          phases[i].pumpOnNight = jsonInt(obj, "pon" + String(i));
          phases[i].pumpOffNight = jsonInt(obj, "pfn" + String(i));
        }
        numPhases = np;
      }
      savePhases();
      Serial.println("Remoto: Config salva");
    }
  }
}

// ===================== ENDPOINT GPIO (para proxy do servidor) =====================

void handleGpio() {
  String name = server.arg("name");
  String action = server.arg("action");

  if (name == "light") {
    if (!modeAuto || action == "toggle") {
      lightState = !lightState;
      setRelay(RELE_LAMPADA, lightState);
      if (modeAuto) { modeAuto = false; }
      Serial.printf("GPIO: Luz %s\n", lightState ? "ON" : "OFF");
    }
  } else if (name == "pump") {
    if (!modeAuto || action == "toggle") {
      pumpState = !pumpState;
      setRelay(RELE_BOMBA, pumpState);
      if (modeAuto) { modeAuto = false; }
      Serial.printf("GPIO: Bomba %s\n", pumpState ? "ON" : "OFF");
    }
  } else if (name == "mode") {
    modeAuto = !modeAuto;
    if (!modeAuto) {
      manualLight = lightState;
      manualPump = pumpState;
    }
    prefs.begin("hydro", false);
    prefs.putBool("mode_auto", modeAuto);
    prefs.end();
    Serial.printf("GPIO: Modo %s\n", modeAuto ? "Auto" : "Manual");
  }

  sendCORS();
  server.send(200, "application/json", getStatusJSON());
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
  json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"ssid\":\"" + WiFi.SSID() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";

  // Fases completas
  json += "\"phases\":[";
  for (int i = 0; i < numPhases; i++) {
    if (i > 0) json += ",";
    json += "{\"name\":\"" + String(phases[i].name) + "\"";
    json += ",\"days\":" + String(phases[i].days);
    json += ",\"lightOnHour\":" + String(phases[i].lightOnHour);
    json += ",\"lightOnMin\":" + String(phases[i].lightOnMin);
    json += ",\"lightOffHour\":" + String(phases[i].lightOffHour);
    json += ",\"lightOffMin\":" + String(phases[i].lightOffMin);
    json += ",\"pumpOnDay\":" + String(phases[i].pumpOnDay);
    json += ",\"pumpOffDay\":" + String(phases[i].pumpOffDay);
    json += ",\"pumpOnNight\":" + String(phases[i].pumpOnNight);
    json += ",\"pumpOffNight\":" + String(phases[i].pumpOffNight);
    json += "}";
  }
  json += "]";

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
.logo{width:48px;height:48px;background:#27ae60;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;font-size:1.5rem;font-weight:800}
h1{color:#27ae60;font-size:1.6rem;margin-bottom:4px}
.sub{color:#888;font-size:0.85rem;margin-bottom:20px}
.step{display:flex;align-items:center;gap:8px;background:#f8f9fa;border-radius:10px;padding:10px 14px;margin-bottom:12px;text-align:left}
.step-num{width:24px;height:24px;background:#27ae60;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0}
.step-text{font-size:0.85rem;color:#555}
.step-active .step-num{animation:pulse-step 1.5s infinite}
@keyframes pulse-step{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
select,input[type='password'],input[type='text']{width:100%;padding:14px;margin:6px 0;border:1px solid #ddd;border-radius:10px;font-size:1rem;-webkit-appearance:none;appearance:none}
select{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6'%3E%3Cpath d='M0 0l6 6 6-6' fill='%23888'/%3E%3C/svg%3E") no-repeat right 14px center/12px;background-color:#fff;padding-right:36px}
select:focus,input:focus{outline:none;border-color:#27ae60;box-shadow:0 0 0 3px rgba(39,174,96,0.15)}
button{width:100%;padding:14px;background:#27ae60;color:#fff;border:none;border-radius:10px;font-size:1.1rem;font-weight:700;cursor:pointer;margin-top:10px;transition:all 0.2s}
button:active{transform:scale(0.97)}
.loading{display:none;margin-top:15px}
.spinner{width:28px;height:28px;border:3px solid #e0e0e0;border-top-color:#27ae60;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 8px}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-text{color:#888;font-size:0.85rem}
</style>
<script>
function onSubmit(){
  var btn=document.getElementById('btn');
  var ld=document.getElementById('loading');
  btn.disabled=true;btn.textContent='Conectando...';btn.style.opacity='0.7';
  ld.style.display='block';
  return true;
}
</script>
</head><body>
<div class='card'>
<div class='logo'>C</div>
<h1>Cultivee Hidro</h1>
<p class='sub'>Configure o WiFi do dispositivo</p>
<div class='step step-active'><span class='step-num'>1</span><span class='step-text'>Selecione sua rede WiFi</span></div>
<form method='POST' action='/save-wifi' onsubmit='return onSubmit()'>
<select name='ssid'>)rawliteral" + options + R"rawliteral(</select>
<input type='password' name='password' placeholder='Senha do WiFi' id='pass'>
<label style='display:flex;align-items:center;gap:10px;font-size:0.95rem;margin:12px 0;cursor:pointer;color:#666;-webkit-tap-highlight-color:transparent'>
<input type='checkbox' style='width:22px;height:22px;accent-color:#27ae60;flex-shrink:0' onclick="document.getElementById('pass').type=this.checked?'text':'password'"> Mostrar senha</label>
<button type='submit' id='btn'>Conectar</button>
</form>
<div class='loading' id='loading'>
<div class='spinner'></div>
<div class='loading-text'>Salvando configuracao...</div>
</div>
</div></body></html>)rawliteral";

  server.send(200, "text/html", html);
}

void handleSaveWiFi() {
  String ssid = server.arg("ssid");
  String pass = server.arg("password");

  if (ssid.length() == 0) {
    server.send(400, "text/plain", "SSID vazio");
    return;
  }

  saveWiFiCredentials(ssid, pass);

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:20px;padding:30px;width:90%;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.1);text-align:center}
.check-circle{width:56px;height:56px;background:#27ae60;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;animation:pop 0.4s ease-out}
.check-circle svg{width:28px;height:28px;stroke:#fff;stroke-width:3;fill:none}
@keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
h2{color:#27ae60;margin:8px 0}
.steps{text-align:left;margin:16px 0}
.step{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;margin:4px 0;font-size:0.85rem;color:#999;transition:all 0.3s}
.step.done{color:#27ae60;background:#f0f9f1}
.step.active{color:#333;background:#f8f9fa}
.step-icon{width:20px;height:20px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:0.65rem;flex-shrink:0;transition:all 0.3s}
.step.done .step-icon{background:#27ae60;border-color:#27ae60;color:#fff}
.step.active .step-icon{border-color:#27ae60;animation:pulse-s 1.5s infinite}
@keyframes pulse-s{0%,100%{box-shadow:0 0 0 0 rgba(39,174,96,0.3)}50%{box-shadow:0 0 0 6px rgba(39,174,96,0)}}
.spinner-sm{width:14px;height:14px;border:2px solid #e0e0e0;border-top-color:#27ae60;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.progress-bar{width:100%;height:4px;background:#e8e8e8;border-radius:4px;margin:16px 0 8px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#27ae60,#2ecc71);border-radius:4px;transition:width 1s linear}
.code{font-size:1.8rem;font-weight:800;color:#1a472a;letter-spacing:0.15em;margin:8px 0;padding:10px;background:#f0f9f1;border-radius:12px}
.btn{display:inline-block;padding:12px 24px;background:#27ae60;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;margin-top:8px;transition:all 0.2s}
.btn:active{transform:scale(0.97)}
.timer{color:#888;font-size:0.8rem;margin-top:6px}
.status-box{margin-top:12px;padding:12px 16px;border-radius:12px;background:#f8f9fa;border:1px solid #e8e8e8;transition:all 0.3s}
.status-box.connecting{background:#fff8e1;border-color:#ffe082}
.status-box.success{background:#f0f9f1;border-color:#a5d6a7}
.status-text{font-size:0.95rem;font-weight:600;color:#555}
.status-sub{font-size:0.8rem;color:#888;margin-top:4px}
.status-spinner{display:inline-block;width:16px;height:16px;border:2px solid #e0e0e0;border-top-color:#f9a825;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;margin-right:6px}
</style>
<script>
var s=6,total=6;
var steps=['WiFi salvo','Reiniciando modulo','Conectando na rede','Abrindo o app'];
function tick(){
  s--;
  var pct=((total-s)/total)*100;
  document.getElementById('pbar').style.width=pct+'%';
  var msgs=['Salvando configuracao...','Preparando reinicio...','Reiniciando modulo...','Conectando na rede...','Verificando conexao...','Quase pronto...'];
  var mi=total-s-1;if(mi<0)mi=0;if(mi>=msgs.length)mi=msgs.length-1;
  document.getElementById('status-text').textContent=msgs[mi];
  document.getElementById('status-sub').textContent='Passo '+(total-s)+' de '+total;
  // Animate steps
  var si=Math.min(Math.floor(((total-s)/total)*steps.length), steps.length-1);
  for(var i=0;i<steps.length;i++){
    var el=document.getElementById('s'+i);
    if(i<si){el.className='step done';el.querySelector('.step-icon').innerHTML='&#10003;';}
    else if(i==si){el.className='step active';el.querySelector('.step-icon').innerHTML='<div class="spinner-sm"></div>';}
  }
  if(s<=0){
    document.getElementById('s'+(steps.length-1)).className='step done';
    document.getElementById('s'+(steps.length-1)).querySelector('.step-icon').innerHTML='&#10003;';
    tryRedirect();
  }
  else setTimeout(tick,1000);
}
setTimeout(tick,800);
var appUrl='https://hidro.cultivee.com.br?code=)rawliteral" + shortId + R"rawliteral(';
var retries=0;
function tryRedirect(){
  retries++;
  var box=document.getElementById('status-box');
  var txt=document.getElementById('status-text');
  var sub=document.getElementById('status-sub');
  box.className='status-box connecting';
  txt.innerHTML='<span class="status-spinner"></span>Reconectando ao WiFi...';
  sub.textContent='Tentativa '+retries+' - aguarde alguns segundos';
  fetch(appUrl,{mode:'no-cors',cache:'no-store'}).then(function(){
    box.className='status-box success';
    txt.innerHTML='&#10003; Conectado! Abrindo o app...';
    sub.textContent='';
    setTimeout(function(){window.location.href=appUrl;},500);
  }).catch(function(){
    if(retries<20){
      setTimeout(tryRedirect,3000);
    } else {
      box.className='status-box';
      txt.innerHTML='Nao foi possivel conectar automaticamente';
      sub.innerHTML='<a href="'+appUrl+'" style="color:#27ae60;font-weight:700;font-size:1rem;text-decoration:none">&#9654; Toque aqui para abrir o app</a>';
    }
  });
}
</script>
</head><body>
<div class='card'>
<div class='check-circle'><svg viewBox='0 0 24 24'><polyline points='6 12 10 16 18 8'/></svg></div>
<h2>WiFi configurado!</h2>
<p style='color:#888;font-size:0.9rem'>Rede: <strong>)rawliteral" + ssid + R"rawliteral(</strong></p>
<div class='progress-bar'><div class='progress-fill' id='pbar' style='width:5%'></div></div>
<div class='steps'>
<div class='step done' id='s0'><span class='step-icon'>&#10003;</span><span>WiFi salvo</span></div>
<div class='step' id='s1'><span class='step-icon'></span><span>Reiniciando modulo</span></div>
<div class='step' id='s2'><span class='step-icon'></span><span>Conectando na rede</span></div>
<div class='step' id='s3'><span class='step-icon'></span><span>Abrindo o app</span></div>
</div>
<p style='color:#888;font-size:0.8rem;margin-top:8px'>Seu codigo de pareamento:</p>
<div class='code'>)rawliteral" + shortId + R"rawliteral(</div>
<div class='status-box' id='status-box'>
<div class='status-text' id='status-text'><span id='t'>Preparando...</span></div>
<div class='status-sub' id='status-sub'>O modulo vai reiniciar automaticamente</div>
</div>
<a href='https://hidro.cultivee.com.br?code=)rawliteral" + shortId + R"rawliteral(' class='btn' style='margin-top:12px'>Abrir App agora</a>
</div></body></html>)rawliteral";

  server.send(200, "text/html", html);
  delay(8000);  // Espera redirect (5s) + margem antes de reiniciar
  ESP.restart();
}

void handleResetWiFi() {
  clearWiFiCredentials();
  server.send(200, "text/plain", "WiFi resetado. Reiniciando...");
  delay(1000);
  ESP.restart();
}

// Portal cativo redirects (handlers por OS — igual ESP32-CAM)
void handleCaptiveAndroid() {
  Serial.println("Portal cativo: Android detectado");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<html><body><a href='http://192.168.4.1/'>Configurar WiFi</a></body></html>");
}

void handleCaptiveApple() {
  Serial.println("Portal cativo: Apple detectado");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<HTML><HEAD><TITLE>Cultivee</TITLE></HEAD><BODY>Redirecionando...</BODY></HTML>");
}

void handleCaptiveWindows() {
  Serial.println("Portal cativo: Windows detectado");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<html><body>Redirecionando...</body></html>");
}

void handleCaptiveGeneric() {
  Serial.println("Portal cativo: generico");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<html><body><a href='http://192.168.4.1/'>Configurar WiFi</a></body></html>");
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
  if (savedSSID.length() > 0) {
    if (connectWiFi()) {
      currentMode = MODE_CONNECTED;
      setupNTP();
      if (MDNS.begin(MDNS_NAME)) {
        Serial.printf("mDNS: %s.local\n", MDNS_NAME);
        MDNS.addService("http", "tcp", 80);
      }
    } else {
      // WiFi falhou mas NAO limpa credenciais — entra em offline
      // Automacao continua rodando, reconexao em background
      currentMode = MODE_OFFLINE;
      Serial.println("WiFi falhou, modo OFFLINE — automacao ativa, reconexao em background");
    }
  } else {
    // Sem credenciais salvas — precisa configurar
    startSetupAP();
  }

  // Web server routes — OFFLINE tambem precisa das rotas de controle
  if (currentMode == MODE_SETUP) {
    server.on("/", handleSetupPage);
    server.on("/save-wifi", HTTP_POST, handleSaveWiFi);
    // Captive portal - handlers por OS (igual ESP32-CAM)
    server.on("/generate_204", handleCaptiveAndroid);
    server.on("/gen_204", handleCaptiveAndroid);
    server.on("/connectivitycheck/gstatic/com", handleCaptiveAndroid);
    server.on("/hotspot-detect.html", handleCaptiveApple);
    server.on("/library/test/success.html", handleCaptiveApple);
    server.on("/captive-portal/api/session", handleCaptiveApple);
    server.on("/connecttest.txt", handleCaptiveWindows);
    server.on("/ncsi.txt", handleCaptiveWindows);
    server.on("/fwlink", handleCaptiveWindows);
    server.on("/redirect", handleCaptiveWindows);
    server.on("/canonical.html", handleCaptiveGeneric);
    server.on("/success.txt", handleCaptiveGeneric);
    server.on("/generate204", handleCaptiveGeneric);
    server.on("/mobile/status.php", handleCaptiveGeneric);
    server.onNotFound(handleCaptiveGeneric);
  } else {
    server.on("/", handleDashboard);
    server.on("/config", handleConfig);
    server.on("/save-config", HTTP_POST, handleSaveConfig);
    server.on("/relay", handleRelay);
    server.on("/gpio", handleGpio);
    server.on("/status", handleStatus);
    server.on("/reset-wifi", handleResetWiFi);
    server.on("/add-phase", handleAddPhase);
    server.on("/remove-phase", handleRemovePhase);
    server.on("/reset-phases", handleResetPhases);
  }

  server.begin();
  Serial.println("Web server iniciado");
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

void tryReconnectWiFi() {
  if (currentMode != MODE_OFFLINE) return;
  if (millis() - lastWiFiRetry < WIFI_RETRY_INTERVAL) return;
  lastWiFiRetry = millis();

  Serial.println("Tentando reconectar WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(savedSSID.c_str(), savedPass.c_str());

  // Non-blocking: tenta por 5s apenas
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 5000) {
    delay(100);
    runAutomation();  // continua automacao durante tentativa
  }

  if (WiFi.status() == WL_CONNECTED) {
    currentMode = MODE_CONNECTED;
    Serial.printf("Reconectado! IP: %s\n", WiFi.localIP().toString().c_str());
    if (!ntpSynced) setupNTP();
    if (MDNS.begin(MDNS_NAME)) {
      MDNS.addService("http", "tcp", 80);
    }
  } else {
    Serial.println("Reconexao falhou, tentando novamente em 30s...");
  }
}

void checkWiFiConnection() {
  // Detecta queda de WiFi durante operacao normal
  if (currentMode == MODE_CONNECTED && WiFi.status() != WL_CONNECTED) {
    currentMode = MODE_OFFLINE;
    Serial.println("WiFi desconectado! Modo OFFLINE — automacao continua");
  }
}

void loop() {
  checkResetButton();
  handleSerialCommands();

  if (currentMode == MODE_SETUP) {
    dnsServer.processNextRequest();
  }

  server.handleClient();
  updateStatusLed();

  // Automacao roda SEMPRE (connected ou offline)
  if (currentMode != MODE_SETUP) {
    runAutomation();
  }

  // Funcoes que precisam de WiFi
  if (currentMode == MODE_CONNECTED) {
    pollCommands();
    registerOnServer();
    checkWiFiConnection();
  }

  // Reconexao em background
  if (currentMode == MODE_OFFLINE) {
    tryReconnectWiFi();
  }
}
