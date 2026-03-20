/*
  Cultivee - Firmware ESP32-CAM
  Modos: Setup (WiFi Manager) | Conectado | AP Offline
  Endpoints: /capture, /live.jpg, /status, /reset-wifi
*/

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>

// --- Pinos ESP32-CAM AI-Thinker ---
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define LED_BUILTIN       33
#define FLASH_LED          4
#define RESET_COUNT_KEY   "rst_cnt"  // Contador de resets rapidos
#define RESET_WINDOW      8000      // Janela de 8s entre resets

// --- Configuracao ---
#define AP_SETUP_SSID     "Cultivee-Setup"
#define AP_SETUP_PASS     "12345678"
#define AP_OFFLINE_SSID   "Cultivee-Cam"
#define AP_OFFLINE_PASS   "12345678"
#define MDNS_NAME         "cultivee-cam"
#define MODULE_TYPE       "cam"
#define WIFI_TIMEOUT      15000
#define SERVER_URL        "http://192.168.137.45:5000"  // Servidor Cultivee
#define REGISTER_INTERVAL 30000  // Registra a cada 30s
#define DNS_PORT          53

// --- Estado ---
enum Mode { MODE_SETUP, MODE_CONNECTED, MODE_AP_OFFLINE };
Mode currentMode = MODE_SETUP;

WebServer server(80);
DNSServer dnsServer;
Preferences prefs;
String chipId;
String savedSSID;
String savedPass;

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
    digitalWrite(LED_BUILTIN, LOW);  // LED inverted
    delay(ms);
    digitalWrite(LED_BUILTIN, HIGH);
    delay(ms);
  }
}

// =====================================================================
// Camera
// =====================================================================

bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_UXGA;
  config.jpeg_quality = 10;
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Erro camera: 0x%x\n", err);
    return false;
  }

  sensor_t* s = esp_camera_sensor_get();
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
  s->set_whitebal(s, 1);
  s->set_awb_gain(s, 1);
  s->set_wb_mode(s, 0);
  s->set_exposure_ctrl(s, 1);
  s->set_aec2(s, 1);
  s->set_gain_ctrl(s, 1);
  s->set_raw_gma(s, 1);
  s->set_lenc(s, 1);

  // Descarta primeiros frames
  for (int i = 0; i < 5; i++) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) esp_camera_fb_return(fb);
    delay(100);
  }

  Serial.println("Camera OK!");
  return true;
}

void sendJpeg() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    server.send(500, "text/plain", "Erro ao capturar");
    return;
  }

  WiFiClient client = server.client();
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: image/jpeg");
  client.println("Content-Length: " + String(fb->len));
  client.println("Access-Control-Allow-Origin: *");
  client.println("Cache-Control: no-cache, no-store");
  client.println("Connection: close");
  client.println();

  uint8_t* buf = fb->buf;
  size_t remaining = fb->len;
  while (remaining > 0) {
    size_t chunk = remaining > 4096 ? 4096 : remaining;
    client.write(buf, chunk);
    buf += chunk;
    remaining -= chunk;
  }

  esp_camera_fb_return(fb);
}

// =====================================================================
// WiFi Manager
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
  if (pass && strlen(pass) > 0) {
    WiFi.softAP(ssid, pass);
  } else {
    WiFi.softAP(ssid);  // Rede aberta
  }
  delay(100);
  Serial.printf("AP iniciado: %s | IP: %s\n", ssid, WiFi.softAPIP().toString().c_str());
}

// =====================================================================
// Pagina de Setup WiFi
// =====================================================================

String getSetupPage() {
  // Scan redes
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
    "select:focus,input:focus{outline:none;border-color:#16a34a}"
    "button{width:100%;padding:0.85rem;background:#16a34a;color:#fff;border:none;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;margin-top:1.5rem}"
    "button:hover{background:#15803d}"
    ".msg{padding:0.75rem;border-radius:0.5rem;margin-top:1rem;text-align:center;font-size:0.85rem}"
    ".msg.ok{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}"
    ".msg.err{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}"
    "</style></head><body>"
    "<div class='card'>"
    "<div class='logo'>"
    "<h1>Cultivee</h1>"
    "<p>Configuracao WiFi</p>"
    "</div>"
    "<div class='chip-id'>"
    "<span>" + getShortId() + "</span>"
    "<small>Codigo do modulo (anote para vincular no app)</small>"
    "</div>"
    "<form action='/save-wifi' method='POST'>"
    "<label>Rede WiFi</label>"
    "<select name='ssid'>" + options + "</select>"
    "<label>Senha</label>"
    "<div style='position:relative'>"
    "<input type='password' name='pass' id='pass' placeholder='Senha do WiFi'>"
    "<span onclick=\"var p=document.getElementById('pass');var t=this;if(p.type==='password'){p.type='text';t.textContent='Ocultar'}else{p.type='password';t.textContent='Mostrar'}\" "
    "style='position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);color:#16a34a;cursor:pointer;font-size:0.8rem;font-weight:600'>Mostrar</span>"
    "</div>"
    "<button type='submit'>Conectar</button>"
    "</form>"
    "<div id='msg'></div>"
    "</div></body></html>";
}

// =====================================================================
// Dashboard local (modo AP offline)
// =====================================================================

String getLocalDashboard() {
  return "<!DOCTYPE html><html><head>"
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>Cultivee Cam</title>"
    "<style>"
    "*{margin:0;padding:0;box-sizing:border-box}"
    "body{font-family:-apple-system,sans-serif;background:#111;color:#fff;min-height:100vh}"
    "nav{background:#1a1a2e;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center}"
    "nav h1{font-size:1rem;color:#4ade80}"
    "nav .status{font-size:0.75rem;color:#888}"
    ".stream{text-align:center;padding:1rem}"
    ".stream img{max-width:100%;border-radius:0.5rem}"
    ".info{padding:1rem;text-align:center;font-size:0.8rem;color:#666}"
    ".btn{display:inline-block;padding:0.5rem 1rem;background:#dc2626;color:#fff;border:none;border-radius:0.5rem;font-size:0.85rem;cursor:pointer;margin-top:0.5rem;text-decoration:none}"
    "</style></head><body>"
    "<nav><h1>Cultivee Cam</h1><span class='status'>Offline | " + getShortId() + "</span></nav>"
    "<div class='stream'>"
    "<img id='live' src='/live.jpg' alt='Camera'/>"
    "</div>"
    "<div class='info'>"
    "<p>Modo offline — sem conexao WiFi</p>"
    "<a class='btn' href='/reset-wifi'>Reconfigurar WiFi</a>"
    "</div>"
    "<script>setInterval(()=>{document.getElementById('live').src='/live.jpg?'+Date.now()},1500)</script>"
    "</body></html>";
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
    "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0fdf4;padding:1rem}"
    ".card{text-align:center;padding:2rem;background:#fff;border-radius:1rem;max-width:400px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.08)}"
    "h2{color:#16a34a;font-size:1.3rem}"
    ".check{font-size:3rem;margin-bottom:0.5rem}"
    ".steps{text-align:left;margin:1.5rem 0;padding:0;list-style:none}"
    ".steps li{padding:0.75rem;margin:0.5rem 0;background:#f0fdf4;border-radius:0.5rem;font-size:0.9rem;color:#333;border-left:3px solid #16a34a}"
    ".steps li b{color:#16a34a}"
    ".btn{display:block;width:100%;padding:0.85rem;background:#16a34a;color:#fff;border:none;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;text-decoration:none;text-align:center;margin-top:0.5rem}"
    ".btn:hover{background:#15803d}"
    ".btn-outline{background:transparent;border:2px solid #16a34a;color:#16a34a}"
    ".btn-outline:hover{background:#f0fdf4}"
    "</style></head>"
    "<body><div class='card'>"
    "<div class='check'>&#10003;</div>"
    "<h2>WiFi configurado!</h2>"
    "<p style='color:#666;margin-top:0.5rem'>Conectando em '" + ssid + "'...</p>"
    "<ul class='steps'>"
    "<li><b>Passo 1:</b> Reconecte seu celular ao WiFi <b>" + ssid + "</b></li>"
    "<li><b>Passo 2:</b> Clique no botao abaixo para abrir o app e vincular automaticamente</li>"
    "</ul>"
    "<a class='btn' href='http://localhost:5000/?code=" + getShortId() + "'>Abrir Cultivee e vincular</a>"
    "<p style='color:#999;font-size:0.75rem;margin-top:1.5rem'>Codigo do modulo: <b>" + getShortId() + "</b> (caso precise vincular manualmente)</p>"
    "<script>try{localStorage.setItem('cultivee_pending_code','" + getShortId() + "')}catch(e){}</script>"
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

void handleCapture() { sendJpeg(); }
void handleLive()    { sendJpeg(); }

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

  String json = "{";
  json += "\"chip_id\":\"" + chipId + "\",";
  json += "\"short_id\":\"" + getShortId() + "\",";
  json += "\"type\":\"" + String(MODULE_TYPE) + "\",";
  json += "\"mode\":\"" + modeStr + "\",";
  json += "\"ip\":\"" + ip + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"uptime\":" + String(millis() / 1000) + ",";
  json += "\"free_heap\":" + String(ESP.getFreeHeap());
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void handleNotFound() {
  // Portal cativo: redireciona tudo para /
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

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);  // LED off (inverted)
  pinMode(FLASH_LED, OUTPUT);
  digitalWrite(FLASH_LED, LOW);

  // Triple-reset: conta quantas vezes reiniciou rapido
  prefs.begin("cultivee", false);
  int rstCount = prefs.getInt(RESET_COUNT_KEY, 0) + 1;
  prefs.putInt(RESET_COUNT_KEY, rstCount);
  prefs.end();
  Serial.printf("Reset count: %d\n", rstCount);

  // Nao precisa mais do triple-reset
  prefs.begin("cultivee", false);
  prefs.putInt(RESET_COUNT_KEY, 0);
  prefs.end();

  chipId = getChipId();
  Serial.println("\n=== Cultivee CAM ===");
  Serial.printf("Chip ID: %s\n", chipId.c_str());
  Serial.printf("Short ID: %s\n", getShortId().c_str());

  // Inicializa camera
  if (!initCamera()) {
    Serial.println("ERRO: Camera nao inicializou!");
    blinkLed(10, 100);
    return;
  }

  // Carrega credenciais WiFi
  loadWiFiCredentials();

  if (savedSSID.length() == 0) {
    // MODO 1: Setup
    currentMode = MODE_SETUP;
    Serial.println("Modo: SETUP");
    startAP(AP_SETUP_SSID, "");  // Rede aberta no setup
    dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());  // Portal cativo
    blinkLed(3, 200);
  } else if (connectWiFi()) {
    // MODO 2: Conectado
    currentMode = MODE_CONNECTED;
    Serial.println("Modo: CONECTADO");
    MDNS.begin(MDNS_NAME);
    MDNS.addService("cultivee", "tcp", 80);
    blinkLed(1, 500);
  } else {
    // MODO 3: WiFi falhou — volta para Setup automaticamente
    currentMode = MODE_SETUP;
    Serial.println("Modo: SETUP (WiFi falhou)");
    clearWiFiCredentials();  // Limpa WiFi que nao funciona
    startAP(AP_SETUP_SSID, "");  // Rede aberta
    dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
    blinkLed(5, 100);
  }

  // Rotas
  server.on("/", handleRoot);
  server.on("/capture", handleCapture);
  server.on("/live.jpg", handleLive);
  server.on("/status", handleStatus);
  server.on("/save-wifi", HTTP_POST, handleSaveWifi);
  server.on("/reset-wifi", handleResetWifi);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println("Servidor pronto!");
}

// =====================================================================
// Auto-registro no servidor
// =====================================================================

unsigned long lastRegister = 0;

void registerOnServer() {
  if (currentMode != MODE_CONNECTED) return;
  if (millis() - lastRegister < REGISTER_INTERVAL) return;
  lastRegister = millis();

  WiFiClient client;
  HTTPClient http;

  String url = String(SERVER_URL) + "/api/modules/register";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  String body = "{";
  body += "\"chip_id\":\"" + chipId + "\",";
  body += "\"short_id\":\"" + getShortId() + "\",";
  body += "\"type\":\"" + String(MODULE_TYPE) + "\",";
  body += "\"ip\":\"" + WiFi.localIP().toString() + "\"";
  body += "}";

  int code = http.POST(body);
  if (code == 200) {
    Serial.println("Registro OK no servidor");
  } else {
    Serial.printf("Registro falhou: %d\n", code);
  }
  http.end();
}

void loop() {
  if (currentMode == MODE_SETUP) {
    dnsServer.processNextRequest();  // Portal cativo
  }
  server.handleClient();
  registerOnServer();
}
