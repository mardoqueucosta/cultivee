/*
  Cultivee - Firmware ESP32-WROOM (Controle)
  Modos: Setup (WiFi Manager) | Conectado | AP Offline
  Controle de LEDs e bombas via HTTP API
  Endpoints: /status, /gpio, /reset-wifi
*/

#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <ArduinoJson.h>

// --- Pinos de controle ---
// Ajuste conforme sua ligacao
#define LED_STATUS    2     // LED onboard
#define LED_1         4     // LED externo 1
#define LED_2        16     // LED externo 2
#define BOMBA_1      17     // Bomba / rele 1
#define BOMBA_2       5     // Bomba / rele 2

// --- Configuracao ---
#define AP_SETUP_SSID     "Cultivee-Setup"
#define AP_SETUP_PASS     "12345678"
#define AP_OFFLINE_SSID   "Cultivee-Ctrl"
#define AP_OFFLINE_PASS   "12345678"
#define MDNS_NAME         "cultivee-ctrl"
#define MODULE_TYPE       "ctrl"
#define WIFI_TIMEOUT      15000
#define DNS_PORT          53
#define NUM_GPIOS         4

// --- Estado ---
enum Mode { MODE_SETUP, MODE_CONNECTED, MODE_AP_OFFLINE };
Mode currentMode = MODE_SETUP;

WebServer server(80);
DNSServer dnsServer;
Preferences prefs;
String chipId;
String savedSSID;
String savedPass;

// Estado dos GPIOs
struct GpioPin {
  const char* name;
  uint8_t pin;
  bool state;
};

GpioPin gpios[NUM_GPIOS] = {
  {"led_1",   LED_1,   false},
  {"led_2",   LED_2,   false},
  {"bomba_1", BOMBA_1, false},
  {"bomba_2", BOMBA_2, false},
};

// =====================================================================
// Utilidades
// =====================================================================

String getChipId() {
  uint64_t mac = ESP.getEfuseMac();
  char id[13];
  snprintf(id, sizeof(id), "%04X%08X",
           (uint16_t)(mac >> 32), (uint32_t)mac);
  return String(id);
}

String getShortId() {
  return chipId.substring(chipId.length() - 4);
}

void blinkLed(int times, int ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_STATUS, HIGH);
    delay(ms);
    digitalWrite(LED_STATUS, LOW);
    delay(ms);
  }
}

// =====================================================================
// WiFi Manager (igual ao CAM)
// =====================================================================

void loadWiFiCredentials() {
  prefs.begin("cultivee", true);
  savedSSID = prefs.getString("ssid", "");
  savedPass = prefs.getString("pass", "");
  prefs.end();
}

void saveWiFiCredentials(String ssid, String pass) {
  prefs.begin("cultivee", false);
  prefs.putString("ssid", ssid);
  prefs.putString("pass", pass);
  prefs.end();
}

void clearWiFiCredentials() {
  prefs.begin("cultivee", false);
  prefs.remove("ssid");
  prefs.remove("pass");
  prefs.end();
}

bool connectWiFi() {
  if (savedSSID.length() == 0) return false;

  Serial.printf("Conectando em '%s'...\n", savedSSID.c_str());
  WiFi.mode(WIFI_STA);
  WiFi.begin(savedSSID.c_str(), savedPass.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Conectado! IP: %s\n", WiFi.localIP().toString().c_str());
    return true;
  }

  Serial.println("Falha na conexao WiFi");
  return false;
}

void startAP(const char* ssid, const char* pass) {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, pass);
  delay(100);
  Serial.printf("AP iniciado: %s | IP: %s\n", ssid, WiFi.softAPIP().toString().c_str());
}

// =====================================================================
// Pagina de Setup WiFi
// =====================================================================

String getSetupPage() {
  int n = WiFi.scanNetworks();
  String options = "";
  for (int i = 0; i < n; i++) {
    options += "<option value='" + WiFi.SSID(i) + "'>" +
               WiFi.SSID(i) + " (" + String(WiFi.RSSI(i)) + " dBm)</option>";
  }

  return "<!DOCTYPE html><html><head>"
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>Cultivee Setup</title>"
    "<style>"
    "*{margin:0;padding:0;box-sizing:border-box}"
    "body{font-family:-apple-system,sans-serif;background:#f0fdf4;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:1rem}"
    ".card{background:#fff;border-radius:1rem;padding:2rem;max-width:400px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.08)}"
    ".logo{text-align:center;margin-bottom:1.5rem}"
    ".logo h1{color:#16a34a;font-size:1.5rem;margin-top:0.5rem}"
    ".logo p{color:#666;font-size:0.85rem}"
    ".chip-id{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:0.5rem;padding:0.75rem;text-align:center;margin:1rem 0}"
    ".chip-id span{font-size:1.5rem;font-weight:700;color:#16a34a;letter-spacing:0.1em}"
    ".chip-id small{display:block;color:#666;font-size:0.75rem;margin-top:0.25rem}"
    "label{display:block;font-weight:600;margin:1rem 0 0.25rem;font-size:0.85rem;color:#333}"
    "select,input{width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:0.5rem;font-size:1rem}"
    "button{width:100%;padding:0.85rem;background:#16a34a;color:#fff;border:none;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;margin-top:1.5rem}"
    "button:hover{background:#15803d}"
    "</style></head><body>"
    "<div class='card'>"
    "<div class='logo'>"
    "<h1>Cultivee</h1>"
    "<p>Modulo de Controle — Configuracao WiFi</p>"
    "</div>"
    "<div class='chip-id'>"
    "<span>" + getShortId() + "</span>"
    "<small>Codigo do modulo (anote para vincular no app)</small>"
    "</div>"
    "<form action='/save-wifi' method='POST'>"
    "<label>Rede WiFi</label>"
    "<select name='ssid'>" + options + "</select>"
    "<label>Senha</label>"
    "<input type='password' name='pass' placeholder='Senha do WiFi'>"
    "<button type='submit'>Conectar</button>"
    "</form></div></body></html>";
}

// =====================================================================
// Dashboard local (modo AP offline)
// =====================================================================

String getLocalDashboard() {
  String gpioHtml = "";
  for (int i = 0; i < NUM_GPIOS; i++) {
    String color = gpios[i].state ? "#4ade80" : "#666";
    String label = gpios[i].state ? "ON" : "OFF";
    gpioHtml += "<div class='gpio-item'>"
      "<span>" + String(gpios[i].name) + "</span>"
      "<button style='background:" + color + "' onclick=\"toggle('" + String(gpios[i].name) + "')\">" + label + "</button>"
      "</div>";
  }

  return "<!DOCTYPE html><html><head>"
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>Cultivee Ctrl</title>"
    "<style>"
    "*{margin:0;padding:0;box-sizing:border-box}"
    "body{font-family:-apple-system,sans-serif;background:#111;color:#fff;min-height:100vh}"
    "nav{background:#1a1a2e;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center}"
    "nav h1{font-size:1rem;color:#4ade80}"
    ".controls{padding:1rem}"
    ".gpio-item{display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#1a1a2e;border-radius:0.5rem;margin-bottom:0.5rem}"
    ".gpio-item span{font-weight:600}"
    ".gpio-item button{padding:0.5rem 1.5rem;border:none;border-radius:0.5rem;color:#fff;font-weight:600;cursor:pointer}"
    ".info{padding:1rem;text-align:center;font-size:0.8rem;color:#666}"
    ".btn{display:inline-block;padding:0.5rem 1rem;background:#dc2626;color:#fff;border:none;border-radius:0.5rem;font-size:0.85rem;cursor:pointer;margin-top:0.5rem;text-decoration:none}"
    "</style></head><body>"
    "<nav><h1>Cultivee Ctrl</h1><span style='font-size:0.75rem;color:#888'>Offline | " + getShortId() + "</span></nav>"
    "<div class='controls'>" + gpioHtml + "</div>"
    "<div class='info'>"
    "<p>Modo offline</p>"
    "<a class='btn' href='/reset-wifi'>Reconfigurar WiFi</a>"
    "</div>"
    "<script>"
    "function toggle(name){"
    "fetch('/gpio?name='+name+'&action=toggle').then(()=>location.reload())"
    "}"
    "</script></body></html>";
}

// =====================================================================
// Handlers HTTP
// =====================================================================

void handleRoot() {
  if (currentMode == MODE_SETUP) {
    server.send(200, "text/html", getSetupPage());
  } else {
    server.send(200, "text/html", getLocalDashboard());
  }
}

void handleSaveWifi() {
  String ssid = server.arg("ssid");
  String pass = server.arg("pass");

  if (ssid.length() == 0) {
    server.send(400, "text/html", "<h2>SSID vazio</h2><a href='/'>Voltar</a>");
    return;
  }

  saveWiFiCredentials(ssid, pass);

  server.send(200, "text/html",
    "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0fdf4}"
    ".card{text-align:center;padding:2rem;background:#fff;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,0.08)}"
    "h2{color:#16a34a}p{color:#666;margin-top:0.5rem}</style></head>"
    "<body><div class='card'><h2>WiFi salvo!</h2>"
    "<p>Reiniciando e conectando em '" + ssid + "'...</p>"
    "<p style='margin-top:1rem;font-size:0.8rem'>Codigo do modulo: <b>" + getShortId() + "</b></p>"
    "</div></body></html>");

  delay(2000);
  ESP.restart();
}

void handleResetWifi() {
  clearWiFiCredentials();
  server.send(200, "text/html",
    "<!DOCTYPE html><html><head><meta charset='UTF-8'>"
    "<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#fef2f2}"
    ".card{text-align:center;padding:2rem;background:#fff;border-radius:1rem}"
    "h2{color:#dc2626}p{color:#666;margin-top:0.5rem}</style></head>"
    "<body><div class='card'><h2>WiFi apagado</h2>"
    "<p>Reiniciando em modo Setup...</p></div></body></html>");
  delay(2000);
  ESP.restart();
}

void handleGpio() {
  String name = server.arg("name");
  String action = server.arg("action");

  server.sendHeader("Access-Control-Allow-Origin", "*");

  for (int i = 0; i < NUM_GPIOS; i++) {
    if (String(gpios[i].name) == name) {
      if (action == "on")     gpios[i].state = true;
      else if (action == "off") gpios[i].state = false;
      else if (action == "toggle") gpios[i].state = !gpios[i].state;

      digitalWrite(gpios[i].pin, gpios[i].state ? HIGH : LOW);

      String json = "{\"name\":\"" + name + "\",\"state\":" + (gpios[i].state ? "true" : "false") + "}";
      server.send(200, "application/json", json);
      return;
    }
  }

  server.send(404, "application/json", "{\"error\":\"GPIO nao encontrado\"}");
}

void handleStatus() {
  String modeStr;
  switch (currentMode) {
    case MODE_SETUP:      modeStr = "setup"; break;
    case MODE_CONNECTED:  modeStr = "connected"; break;
    case MODE_AP_OFFLINE: modeStr = "ap_offline"; break;
  }

  String ip = (currentMode == MODE_CONNECTED)
    ? WiFi.localIP().toString()
    : WiFi.softAPIP().toString();

  String gpioJson = "[";
  for (int i = 0; i < NUM_GPIOS; i++) {
    if (i > 0) gpioJson += ",";
    gpioJson += "{\"name\":\"" + String(gpios[i].name) + "\","
                "\"pin\":" + String(gpios[i].pin) + ","
                "\"state\":" + (gpios[i].state ? "true" : "false") + "}";
  }
  gpioJson += "]";

  String json = "{";
  json += "\"chip_id\":\"" + chipId + "\",";
  json += "\"short_id\":\"" + getShortId() + "\",";
  json += "\"type\":\"" + String(MODULE_TYPE) + "\",";
  json += "\"mode\":\"" + modeStr + "\",";
  json += "\"ip\":\"" + ip + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"uptime\":" + String(millis() / 1000) + ",";
  json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  json += "\"gpios\":" + gpioJson;
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void handleNotFound() {
  if (currentMode == MODE_SETUP) {
    server.sendHeader("Location", "http://192.168.4.1/");
    server.send(302);
  } else {
    server.send(404, "text/plain", "Nao encontrado");
  }
}

// =====================================================================
// Setup e Loop
// =====================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Configura pinos
  pinMode(LED_STATUS, OUTPUT);
  for (int i = 0; i < NUM_GPIOS; i++) {
    pinMode(gpios[i].pin, OUTPUT);
    digitalWrite(gpios[i].pin, LOW);
  }

  chipId = getChipId();
  Serial.println("\n=== Cultivee CTRL ===");
  Serial.printf("Chip ID: %s\n", chipId.c_str());
  Serial.printf("Short ID: %s\n", getShortId().c_str());

  // Carrega credenciais WiFi
  loadWiFiCredentials();

  if (savedSSID.length() == 0) {
    currentMode = MODE_SETUP;
    Serial.println("Modo: SETUP");
    startAP(AP_SETUP_SSID, AP_SETUP_PASS);
    dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
    blinkLed(3, 200);
  } else if (connectWiFi()) {
    currentMode = MODE_CONNECTED;
    Serial.println("Modo: CONECTADO");
    MDNS.begin(MDNS_NAME);
    MDNS.addService("cultivee", "tcp", 80);
    blinkLed(1, 500);
  } else {
    currentMode = MODE_AP_OFFLINE;
    Serial.println("Modo: AP OFFLINE");
    startAP(AP_OFFLINE_SSID, AP_OFFLINE_PASS);
    blinkLed(5, 100);
  }

  // Rotas
  server.on("/", handleRoot);
  server.on("/gpio", handleGpio);
  server.on("/status", handleStatus);
  server.on("/save-wifi", HTTP_POST, handleSaveWifi);
  server.on("/reset-wifi", handleResetWifi);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println("Servidor pronto!");
}

void loop() {
  if (currentMode == MODE_SETUP) {
    dnsServer.processNextRequest();
  }
  server.handleClient();
}
