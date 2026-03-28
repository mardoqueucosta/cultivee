/*
  Cultivee - Firmware ESP32-WROVER-CAM
  Modos: Setup (WiFi Manager) | Conectado | AP Offline
  Endpoints: /capture, /live.jpg, /status, /reset-wifi
*/

#include "config.h"

// Protecao contra configuracao errada
#if !defined(ENV_LOCAL) && !defined(ENV_PRODUCTION)
  #error "Defina ENV_LOCAL ou ENV_PRODUCTION em config.h"
#endif
#if defined(ENV_LOCAL) && defined(ENV_PRODUCTION)
  #error "Defina APENAS um: ENV_LOCAL ou ENV_PRODUCTION em config.h"
#endif

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <DNSServer.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#if USE_HTTPS
#include <WiFiClientSecure.h>
#endif
#if BLE_SETUP_ENABLED
#include "ble_setup.h"
#endif

// --- Pinos ESP32-WROVER-CAM ---
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     21
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       19
#define Y4_GPIO_NUM       18
#define Y3_GPIO_NUM        5
#define Y2_GPIO_NUM        4
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define LED_BUILTIN        2
#define FLASH_LED         -1        // WROVER-CAM generico nao possui flash LED dedicado
#define RESET_BTN          0        // Botao BOOT da placa (GPIO0 -> GND)
#define RESET_COUNT_KEY   "rst_cnt"  // Contador de resets rapidos
#define RESET_WINDOW      8000      // Janela de 8s entre resets
#define RESET_HOLD_TIME   3000      // Segurar 3s para resetar WiFi

// --- Configuracao ---
#define AP_SETUP_SSID     "Cultivee-Wrover"
#define AP_SETUP_PASS     "12345678"
#define AP_OFFLINE_SSID   "Cultivee-Wrover"
#define AP_OFFLINE_PASS   "12345678"
#define MDNS_NAME         "cultivee-wrover"
#define MODULE_TYPE       "cam"
#define WIFI_TIMEOUT      15000
// SERVER_URL definido em config.h
#define REGISTER_INTERVAL 30000  // Registra a cada 30s
unsigned long uploadInterval = 60000;  // Salva imagem (default 60s, ajustavel pelo app)
#define LIVE_INTERVAL     3000   // Envia frame ao vivo a cada 3s
#define DNS_PORT          53
#define WIFI_RETRY_INTERVAL 30000  // Retenta WiFi a cada 30s

// --- Estado ---
enum Mode { MODE_SETUP, MODE_CONNECTED, MODE_OFFLINE };
Mode currentMode = MODE_SETUP;

WebServer server(80);
DNSServer dnsServer;
Preferences prefs;
String chipId;
String savedSSID;
String savedPass;
unsigned long lastWiFiRetry = 0;

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
    digitalWrite(LED_BUILTIN, HIGH);  // LED ativo HIGH no WROVER-DEV
    delay(ms);
    digitalWrite(LED_BUILTIN, LOW);
    delay(ms);
  }
}

// --- LED Status ---
unsigned long lastLedToggle = 0;
bool ledState = false;

void updateStatusLed() {
  unsigned long now = millis();

  switch (currentMode) {
    case MODE_SETUP:
      // Pisca rapido: 250ms (2x por segundo)
      if (now - lastLedToggle >= 250) {
        lastLedToggle = now;
        ledState = !ledState;
        digitalWrite(LED_BUILTIN, ledState ? HIGH : LOW);
      }
      break;

    case MODE_CONNECTED:
      // Aceso fixo nos primeiros 3s, depois apaga
      if (now < 5000) {
        digitalWrite(LED_BUILTIN, HIGH);  // ON
      } else {
        // Pisca curto a cada 5s (heartbeat)
        if (now - lastLedToggle >= 5000) {
          lastLedToggle = now;
          digitalWrite(LED_BUILTIN, HIGH);  // ON
        } else if (now - lastLedToggle >= 100) {
          digitalWrite(LED_BUILTIN, LOW);   // OFF
        }
      }
      break;

    case MODE_OFFLINE:
      // 3 piscas rapidas, pausa 1s, repete
      {
        unsigned long cycle = now % 2000;  // ciclo de 2s
        if (cycle < 100)       digitalWrite(LED_BUILTIN, HIGH);
        else if (cycle < 200)  digitalWrite(LED_BUILTIN, LOW);
        else if (cycle < 300)  digitalWrite(LED_BUILTIN, HIGH);
        else if (cycle < 400)  digitalWrite(LED_BUILTIN, LOW);
        else if (cycle < 500)  digitalWrite(LED_BUILTIN, HIGH);
        else                   digitalWrite(LED_BUILTIN, LOW);
      }
      break;
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
  config.frame_size = FRAMESIZE_VGA;    // 640x480 fixo (estavel, bom para WiFi fraco)
  config.jpeg_quality = 12;              // Equilibrio qualidade/tamanho
  config.fb_count = 2;                   // 2 buffers (PSRAM do WROVER permite)

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Erro camera: 0x%x\n", err);
    return false;
  }

  sensor_t* s = esp_camera_sensor_get();
  s->set_vflip(s, 0);
  s->set_hmirror(s, 0);
  s->set_whitebal(s, 1);
  s->set_awb_gain(s, 1);
  s->set_wb_mode(s, 0);                 // 0=Auto (sensor novo, sem correcao de clone)
  s->set_exposure_ctrl(s, 1);
  s->set_aec2(s, 1);
  s->set_gain_ctrl(s, 1);
  s->set_raw_gma(s, 1);
  s->set_lenc(s, 1);
  s->set_saturation(s, 0);              // 0=Normal (sensor novo)

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
  client.printf("HTTP/1.1 200 OK\r\n"
    "Content-Type: image/jpeg\r\n"
    "Content-Length: %d\r\n"
    "Access-Control-Allow-Origin: *\r\n"
    "Cache-Control: no-cache\r\n"
    "Connection: keep-alive\r\n\r\n", fb->len);

  // Chunks de 8KB para transferencia mais rapida via AP
  uint8_t* buf = fb->buf;
  size_t remaining = fb->len;
  while (remaining > 0) {
    size_t chunk = remaining > 8192 ? 8192 : remaining;
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
  savedSSID = "";
  savedPass = "";
}

void startAP() {
  // AP sempre ativo — modo hibrido
  WiFi.softAP(AP_SETUP_SSID);
  delay(100);
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
  Serial.printf("AP ativo: %s IP: %s\n", AP_SETUP_SSID, WiFi.softAPIP().toString().c_str());
}

bool connectWiFi() {
  if (savedSSID.length() == 0) return false;

  Serial.printf("Conectando em '%s'...\n", savedSSID.c_str());
  WiFi.mode(WIFI_AP_STA);  // Hibrido: AP + Station (AP sempre acessivel)
  startAP();
  WiFi.begin(savedSSID.c_str(), savedPass.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("Conectado! IP STA: %s | IP AP: %s\n",
      WiFi.localIP().toString().c_str(), WiFi.softAPIP().toString().c_str());
    return true;
  }

  Serial.println("Falha ao conectar WiFi (AP continua ativo)");
  return false;
}

void tryReconnectWiFi() {
  if (currentMode != MODE_OFFLINE) return;
  if (savedSSID.length() == 0) return;
  if (millis() - lastWiFiRetry < WIFI_RETRY_INTERVAL) return;
  lastWiFiRetry = millis();

  Serial.println("Tentando reconectar WiFi...");
  WiFi.begin(savedSSID.c_str(), savedPass.c_str());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 5000) {
    delay(100);
  }

  if (WiFi.status() == WL_CONNECTED) {
    currentMode = MODE_CONNECTED;
    Serial.printf("Reconectado! IP: %s\n", WiFi.localIP().toString().c_str());
    MDNS.begin(MDNS_NAME);
    MDNS.addService("http", "tcp", 80);
  } else {
    Serial.println("Reconexao falhou, tentando novamente em 30s...");
  }
}

void checkWiFiConnection() {
  if (currentMode == MODE_CONNECTED && WiFi.status() != WL_CONNECTED) {
    currentMode = MODE_OFFLINE;
    Serial.println("WiFi desconectado! Modo OFFLINE — AP continua ativo");
  }
}

// =====================================================================
// Pagina de Setup WiFi
// =====================================================================

String getSetupPage() {
  int n = WiFi.scanNetworks();
  String options = "";
  for (int i = 0; i < n; i++) {
    if (WiFi.SSID(i).length() == 0) continue;
    options += "<option value='" + WiFi.SSID(i) + "'>" + WiFi.SSID(i) + " (" + String(WiFi.RSSI(i)) + " dBm)</option>";
  }
  WiFi.scanDelete();

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:20px;padding:30px;width:90%;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.1);text-align:center}
.logo{width:48px;height:48px;background:#16a34a;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;font-size:1.5rem;font-weight:800}
h1{color:#16a34a;font-size:1.6rem;margin-bottom:4px}
.sub{color:#888;font-size:0.85rem;margin-bottom:20px}
.step{display:flex;align-items:center;gap:8px;background:#f8f9fa;border-radius:10px;padding:10px 14px;margin-bottom:12px;text-align:left}
.step-num{width:24px;height:24px;background:#16a34a;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0}
.step-text{font-size:0.85rem;color:#555}
.step-active .step-num{animation:pulse-step 1.5s infinite}
@keyframes pulse-step{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
select,input[type='password']{width:100%;padding:14px;margin:6px 0;border:1px solid #ddd;border-radius:10px;font-size:1rem;-webkit-appearance:none;appearance:none}
select{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6'%3E%3Cpath d='M0 0l6 6 6-6' fill='%23888'/%3E%3C/svg%3E") no-repeat right 14px center/12px;background-color:#fff;padding-right:36px}
select:focus,input:focus{outline:none;border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,0.15)}
button{width:100%;padding:14px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:1.1rem;font-weight:700;cursor:pointer;margin-top:10px;transition:all 0.2s}
button:active{transform:scale(0.97)}
.loading{display:none;margin-top:15px}
.spinner{width:28px;height:28px;border:3px solid #e0e0e0;border-top-color:#16a34a;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 8px}
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
<h1>Cultivee Cam</h1>
<p class='sub'>Configure o WiFi do dispositivo</p>
<div class='step step-active'><span class='step-num'>1</span><span class='step-text'>Selecione sua rede WiFi</span></div>
<form method='POST' action='/save-wifi' onsubmit='return onSubmit()'>
<select name='ssid'>)rawliteral" + options + R"rawliteral(</select>
<input type='password' name='password' placeholder='Senha do WiFi' id='pass'>
<label style='display:flex;align-items:center;gap:10px;font-size:0.95rem;margin:12px 0;cursor:pointer;color:#666;-webkit-tap-highlight-color:transparent'>
<input type='checkbox' style='width:22px;height:22px;accent-color:#16a34a;flex-shrink:0' onclick="document.getElementById('pass').type=this.checked?'text':'password'"> Mostrar senha</label>
<button type='submit' id='btn'>Conectar</button>
</form>
<div style='margin-top:16px;padding-top:16px;border-top:1px solid #eee'>
<a href='/skip-wifi' style='display:block;padding:12px;background:#f8f9fa;color:#666;border:1px solid #ddd;border-radius:10px;font-size:0.9rem;font-weight:600;text-decoration:none;text-align:center;transition:all 0.2s'>Usar sem WiFi</a>
<p style='color:#aaa;font-size:0.75rem;margin-top:6px'>Controle local via rede )rawliteral" AP_SETUP_SSID R"rawliteral(</p>
</div>
<div class='loading' id='loading'>
<div class='spinner'></div>
<div class='loading-text'>Salvando configuracao...</div>
</div>
</div></body></html>)rawliteral";

  return html;
}

// =====================================================================
// Dashboard local (modo AP offline)
// =====================================================================

String getLocalDashboard() {
  bool wifiOk = (currentMode == MODE_CONNECTED);
  String statusText = wifiOk
    ? "Online | " + WiFi.SSID() + " | " + WiFi.localIP().toString()
    : "Local | AP: " AP_SETUP_SSID;
  String statusColor = wifiOk ? "#4ade80" : "#f59e0b";
  String infoBlock;

  if (wifiOk) {
    infoBlock = "<div class='info'>"
      "<div class='badge ok'>Conectado ao WiFi</div>"
      "<p>WiFi: " + WiFi.SSID() + " | IP: " + WiFi.localIP().toString() + "</p>"
      "<p>AP local: " AP_SETUP_SSID " | IP: " + WiFi.softAPIP().toString() + "</p>"
      "<p style='color:#4ade80;margin-top:0.5rem'>Enviando imagens ao servidor</p>"
      "<a class='btn reset' href='/reset-wifi'>Reconfigurar WiFi</a>"
      "</div>";
  } else {
    infoBlock = "<div class='info'>"
      "<div class='badge warn'>Modo local (sem internet)</div>"
      "<p>Acesse via rede: " AP_SETUP_SSID "</p>"
      "<p>IP: " + WiFi.softAPIP().toString() + "</p>"
      "<div style='margin-top:0.75rem;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap'>"
      "<a class='btn cfg' href='/'>Configurar WiFi</a>"
      "<a class='btn reset' href='/reset-wifi'>Resetar WiFi</a>"
      "</div></div>";
  }

  return "<!DOCTYPE html><html><head>"
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<title>Cultivee Cam</title>"
    "<style>"
    "*{margin:0;padding:0;box-sizing:border-box}"
    "body{font-family:-apple-system,sans-serif;background:#111;color:#fff;min-height:100vh}"
    "nav{background:#1a1a2e;padding:0.75rem 1rem;display:flex;justify-content:space-between;align-items:center}"
    "nav h1{font-size:1rem;color:#4ade80}"
    "nav .status{font-size:0.75rem;color:" + statusColor + "}"
    ".stream{text-align:center;padding:1rem}"
    ".stream img{max-width:100%;border-radius:0.5rem}"
    ".info{padding:1rem;text-align:center;font-size:0.8rem;color:#999}"
    ".info p{margin:0.25rem 0}"
    ".badge{display:inline-block;padding:0.35rem 0.75rem;border-radius:1rem;font-size:0.75rem;font-weight:600;margin-bottom:0.5rem}"
    ".badge.ok{background:#16a34a33;color:#4ade80}"
    ".badge.warn{background:#f59e0b33;color:#fbbf24}"
    ".btn{display:inline-block;padding:0.5rem 1rem;border:none;border-radius:0.5rem;font-size:0.85rem;cursor:pointer;text-decoration:none;font-weight:600}"
    ".btn.cfg{background:#16a34a;color:#fff}"
    ".btn.reset{background:#333;color:#999;border:1px solid #555}"
    "</style></head><body>"
    "<nav><h1>Cultivee Cam</h1><span class='status'>" + statusText + " | " + getShortId() + "</span></nav>"
    "<div class='stream'>"
    "<img id='live' src='/stream' alt='Camera'/>"
    "</div>"
    + infoBlock +
    "<script>"
    "var img=document.getElementById('live');"
    "img.onerror=function(){setTimeout(function(){img.src='/stream?'+Date.now();},2000);};"
    "</script>"
    "</body></html>";
}

// =====================================================================
// Handlers HTTP
// =====================================================================

void handleRoot() {
  if (currentMode == MODE_SETUP) {
    server.send(200, "text/html", getSetupPage());
  } else {
    // MODE_CONNECTED e MODE_OFFLINE mostram dashboard (com info de status)
    server.send(200, "text/html", getLocalDashboard());
  }
}

// CORS headers para permitir PWA em app.cultivee.com.br acessar o ESP32 em 192.168.4.1
void sendCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleCORSPreflight() {
  sendCORS();
  server.send(204);
}

// Escaneia redes WiFi e retorna JSON
void handleScanWifi() {
  sendCORS();
  Serial.println("Escaneando redes WiFi...");
  int n = WiFi.scanNetworks();
  String json = "{\"networks\":[";
  for (int i = 0; i < n; i++) {
    if (i > 0) json += ",";
    json += "{\"ssid\":\"" + WiFi.SSID(i) + "\","
            "\"rssi\":" + String(WiFi.RSSI(i)) + ","
            "\"open\":" + (WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "true" : "false") + "}";
  }
  json += "],\"chip_id\":\"" + chipId + "\",\"short_id\":\"" + getShortId() + "\"}";
  server.send(200, "application/json", json);
  WiFi.scanDelete();
}

// Salva WiFi via JSON (para PWA) ou form (para portal cativo)
void handleSaveWifiAPI() {
  sendCORS();
  String ssid, pass;

  // Tenta ler JSON do body
  if (server.hasHeader("Content-Type") && server.header("Content-Type").indexOf("json") >= 0) {
    String body = server.arg("plain");
    // Parse simples do JSON
    int ssidStart = body.indexOf("\"ssid\":\"") + 8;
    int ssidEnd = body.indexOf("\"", ssidStart);
    int passStart = body.indexOf("\"password\":\"") + 12;
    int passEnd = body.indexOf("\"", passStart);
    if (ssidStart > 7) ssid = body.substring(ssidStart, ssidEnd);
    if (passStart > 11) pass = body.substring(passStart, passEnd);
  } else {
    ssid = server.arg("ssid");
    pass = server.arg("pass");
  }

  if (ssid.length() == 0) {
    server.send(400, "application/json", "{\"error\":\"SSID vazio\"}");
    return;
  }

  saveWiFiCredentials(ssid, pass);
  String response = "{\"ok\":true,\"ssid\":\"" + ssid + "\",\"code\":\"" + getShortId() + "\",\"chip_id\":\"" + chipId + "\"}";
  server.send(200, "application/json", response);
  delay(2000);
  ESP.restart();
}

void handleSaveWifi() {
  String ssid = server.arg("ssid");
  String pass = server.arg("password");
  if (pass.length() == 0) pass = server.arg("pass");

  if (ssid.length() == 0) {
    server.send(400, "text/plain", "SSID vazio");
    return;
  }

  saveWiFiCredentials(ssid, pass);
  String sId = getShortId();
  String appUrl = String(APP_URL) + "/?code=" + sId;

  String html = R"rawliteral(<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#fff;border-radius:20px;padding:30px;width:90%;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.1);text-align:center}
.check-circle{width:56px;height:56px;background:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;animation:pop 0.4s ease-out}
.check-circle svg{width:28px;height:28px;stroke:#fff;stroke-width:3;fill:none}
@keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
h2{color:#16a34a;margin:8px 0}
.steps{text-align:left;margin:16px 0}
.step{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;margin:4px 0;font-size:0.85rem;color:#999;transition:all 0.3s}
.step.done{color:#16a34a;background:#f0f9f1}
.step.active{color:#333;background:#f8f9fa}
.step-icon{width:20px;height:20px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:0.65rem;flex-shrink:0;transition:all 0.3s}
.step.done .step-icon{background:#16a34a;border-color:#16a34a;color:#fff}
.step.active .step-icon{border-color:#16a34a;animation:pulse-s 1.5s infinite}
@keyframes pulse-s{0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0.3)}50%{box-shadow:0 0 0 6px rgba(22,163,74,0)}}
.spinner-sm{width:14px;height:14px;border:2px solid #e0e0e0;border-top-color:#16a34a;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.progress-bar{width:100%;height:4px;background:#e8e8e8;border-radius:4px;margin:16px 0 8px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:4px;transition:width 1s linear}
.code{font-size:1.8rem;font-weight:800;color:#14532d;letter-spacing:0.15em;margin:8px 0;padding:10px;background:#f0fdf4;border-radius:12px}
.btn{display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;margin-top:8px;transition:all 0.2s}
.btn:active{transform:scale(0.97)}
.status-box{margin-top:12px;padding:12px 16px;border-radius:12px;background:#f8f9fa;border:1px solid #e8e8e8;transition:all 0.3s}
.status-box.connecting{background:#fff8e1;border-color:#ffe082}
.status-box.success{background:#f0fdf4;border-color:#a5d6a7}
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
var appUrl=')rawliteral" + appUrl + R"rawliteral(';
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
      sub.innerHTML='<a href="'+appUrl+'" style="color:#16a34a;font-weight:700;font-size:1rem;text-decoration:none">Toque aqui para abrir o app</a>';
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
<div class='code'>)rawliteral" + sId + R"rawliteral(</div>
<div class='status-box' id='status-box'>
<div class='status-text' id='status-text'>Preparando...</div>
<div class='status-sub' id='status-sub'>O modulo vai reiniciar automaticamente</div>
</div>
<a href=')rawliteral" + appUrl + R"rawliteral(' class='btn' style='margin-top:12px'>Abrir App agora</a>
</div></body></html>)rawliteral";

  server.send(200, "text/html", html);
  delay(8000);
  ESP.restart();
}

void handleSkipWifi() {
  // Muda para modo offline (AP continua ativo, dashboard acessivel)
  currentMode = MODE_OFFLINE;
  Serial.println("Modo sem WiFi — controle local via AP");
  server.sendHeader("Location", "/");
  server.send(302);
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

// MJPEG stream — envia frames continuamente numa unica conexao
void handleStream() {
  WiFiClient client = server.client();
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=frame");
  client.println("Cache-Control: no-cache");
  client.println("Connection: keep-alive");
  client.println();

  while (client.connected()) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) { delay(10); continue; }

    client.printf("--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %d\r\n\r\n", fb->len);

    uint8_t* buf = fb->buf;
    size_t remaining = fb->len;
    while (remaining > 0 && client.connected()) {
      size_t chunk = remaining > 8192 ? 8192 : remaining;
      client.write(buf, chunk);
      buf += chunk;
      remaining -= chunk;
    }
    client.print("\r\n");
    esp_camera_fb_return(fb);

    // ~10 FPS maximo (evita sobrecarga)
    delay(100);
  }
}

void handleStatus() {
  String modeStr;
  switch (currentMode) {
    case MODE_SETUP:      modeStr = "setup"; break;
    case MODE_CONNECTED:  modeStr = "connected"; break;
    case MODE_OFFLINE: modeStr = "offline"; break;
  }

  String staIp = WiFi.localIP().toString();
  String apIp = WiFi.softAPIP().toString();
  String ip = (currentMode == MODE_CONNECTED) ? staIp : apIp;

  String json = "{";
  json += "\"chip_id\":\"" + chipId + "\",";
  json += "\"short_id\":\"" + getShortId() + "\",";
  json += "\"type\":\"" + String(MODULE_TYPE) + "\",";
  json += "\"mode\":\"" + modeStr + "\",";
  json += "\"ip\":\"" + ip + "\",";
  json += "\"ap_ip\":\"" + apIp + "\",";
  json += "\"ssid\":\"" + WiFi.SSID() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"uptime\":" + String(millis() / 1000) + ",";
  json += "\"free_heap\":" + String(ESP.getFreeHeap());
  json += "}";

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// Endpoints de deteccao de portal cativo
// Cada SO/navegador usa um endpoint e espera uma resposta diferente
void handleCaptiveAndroid() {
  // Android espera status 204 para "sem portal" ou qualquer outra coisa para "tem portal"
  // Retornando 302 redirect faz o Android abrir o mini-browser de portal
  Serial.println("Portal cativo: Android detectado");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<html><body><a href='http://192.168.4.1/'>Configurar WiFi</a></body></html>");
}

void handleCaptiveApple() {
  // Apple espera HTML com conteudo - se nao for "<HTML><HEAD><TITLE>Success</TITLE>..." abre portal
  Serial.println("Portal cativo: Apple detectado");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<HTML><HEAD><TITLE>Cultivee</TITLE></HEAD><BODY>Redirecionando...</BODY></HTML>");
}

void handleCaptiveWindows() {
  // Windows NCSI espera "Microsoft NCSI" no body, qualquer outra coisa = portal
  // Windows connecttest espera "Microsoft Connect Test"
  Serial.println("Portal cativo: Windows detectado");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<html><body>Redirecionando...</body></html>");
}

void handleCaptiveGeneric() {
  Serial.println("Portal cativo: generico");
  server.sendHeader("Location", "http://192.168.4.1/");
  server.send(302, "text/html", "<html><body><a href='http://192.168.4.1/'>Configurar WiFi</a></body></html>");
}

void handleNotFound() {
  if (currentMode == MODE_SETUP || currentMode == MODE_OFFLINE) {
    // Em modo setup/offline, redirect para o portal via AP
    Serial.printf("Portal cativo: not found %s -> redirect\n", server.uri().c_str());
    server.sendHeader("Location", "http://192.168.4.1/");
    server.send(302, "text/html", "<html><body><a href='http://192.168.4.1/'>Configurar WiFi</a></body></html>");
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
  digitalWrite(LED_BUILTIN, LOW);   // LED off (ativo HIGH no WROVER-DEV)
  // FLASH_LED nao configurado (nao disponivel no WROVER-CAM generico)
  pinMode(RESET_BTN, INPUT_PULLUP);  // Botao BOOT da placa: GPIO0 -> GND

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
  Serial.println("\n=== Cultivee WROVER-CAM ===");
  Serial.printf("Chip ID: %s\n", chipId.c_str());
  Serial.printf("Short ID: %s\n", getShortId().c_str());

  // Inicializa camera
  bool cameraOk = initCamera();
  if (!cameraOk) {
    Serial.println("AVISO: Camera nao inicializou! Continuando sem camera...");
    blinkLed(10, 100);
  }

  // Configura rotas HTTP (server.begin() sera chamado DEPOIS do WiFi iniciar)
  server.on("/", handleRoot);
  server.on("/capture", handleCapture);
  server.on("/live.jpg", handleLive);
  server.on("/stream", handleStream);
  server.on("/status", handleStatus);
  server.on("/save-wifi", HTTP_POST, handleSaveWifi);
  server.on("/save-wifi", HTTP_OPTIONS, handleCORSPreflight);
  server.on("/api/save-wifi", HTTP_POST, handleSaveWifiAPI);
  server.on("/api/save-wifi", HTTP_OPTIONS, handleCORSPreflight);
  server.on("/api/scan-wifi", handleScanWifi);
  server.on("/api/scan-wifi", HTTP_OPTIONS, handleCORSPreflight);
  server.on("/api/status", [](){ sendCORS(); handleStatus(); });
  server.on("/skip-wifi", handleSkipWifi);
  server.on("/setup-wifi", [](){ server.send(200, "text/html", getSetupPage()); });
  server.on("/reset-wifi", handleResetWifi);
  // Portal cativo: endpoints por SO/navegador
  // Android
  server.on("/generate_204", handleCaptiveAndroid);
  server.on("/gen_204", handleCaptiveAndroid);
  server.on("/connectivitycheck/gstatic/com", handleCaptiveAndroid);
  // Apple iOS/macOS
  server.on("/hotspot-detect.html", handleCaptiveApple);
  server.on("/library/test/success.html", handleCaptiveApple);
  server.on("/captive-portal/api/session", handleCaptiveApple);
  // Windows
  server.on("/connecttest.txt", handleCaptiveWindows);
  server.on("/ncsi.txt", handleCaptiveWindows);
  server.on("/fwlink", handleCaptiveWindows);
  server.on("/redirect", handleCaptiveWindows);
  // Firefox
  server.on("/canonical.html", handleCaptiveGeneric);
  server.on("/success.txt", handleCaptiveGeneric);
  // Samsung
  server.on("/generate204", handleCaptiveAndroid);
  server.on("/mobile/status.php", handleCaptiveAndroid);
  server.onNotFound(handleNotFound);

  // Carrega credenciais WiFi
  loadWiFiCredentials();

  if (savedSSID.length() == 0) {
#if BLE_SETUP_ENABLED
    // MODO BLE: Aguarda credenciais via Bluetooth (camera desligada)
    Serial.println("Modo: BLE SETUP (aguardando credenciais via Bluetooth)");
    currentMode = MODE_SETUP;
    startBleSetup(getShortId());

    // Tambem inicia AP como fallback
    WiFi.mode(WIFI_AP);
    startAP();
    server.begin();

    // Aguarda credenciais via BLE (loop com LED piscando)
    unsigned long bleStart = millis();
    while (!bleHasCredentials()) {
      updateStatusLed();
      delay(50);

      // Tambem processa requisicoes HTTP (fallback WiFi Manager)
      dnsServer.processNextRequest();
      server.handleClient();

      // Verifica se recebeu credenciais pelo WiFi Manager
      if (savedSSID.length() > 0) {
        Serial.println("BLE: Credenciais recebidas via WiFi Manager (fallback)");
        stopBle();
        break;
      }

      // Timeout de 5 minutos — reinicia
      if (millis() - bleStart > 300000) {
        Serial.println("BLE: Timeout 5min, reiniciando...");
        ESP.restart();
      }
    }

    // Se recebeu via BLE
    if (bleHasCredentials()) {
      String bSsid, bPass;
      bleGetCredentials(bSsid, bPass);
      Serial.printf("BLE: Conectando em '%s'...\n", bSsid.c_str());

      // Salva credenciais
      savedSSID = bSsid;
      savedPass = bPass;
      saveWiFiCredentials(bSsid, bPass);

      // Desliga BLE antes de iniciar camera
      stopBle();

      // Reinicia para iniciar com WiFi + Camera
      Serial.println("BLE: Credenciais salvas, reiniciando...");
      delay(1000);
      ESP.restart();
    }
#else
    // MODO 1: Setup (sem BLE)
    currentMode = MODE_SETUP;
    Serial.println("Modo: SETUP");
    WiFi.mode(WIFI_AP);
    startAP();
    server.begin();
    blinkLed(3, 200);
#endif
  } else if (connectWiFi()) {
    // MODO 2: Conectado (AP+STA hibrido — AP ja ativo via connectWiFi)
    currentMode = MODE_CONNECTED;
    Serial.println("Modo: CONECTADO");
    MDNS.begin(MDNS_NAME);
    MDNS.addService("http", "tcp", 80);
    server.begin();
    blinkLed(1, 500);
  } else {
    // MODO 3: WiFi falhou — mantem credenciais e retenta a cada 30s
    // AP ja esta ativo (startAP chamado em connectWiFi)
    currentMode = MODE_OFFLINE;
    Serial.println("WiFi falhou, modo OFFLINE — AP ativo, retentando a cada 30s");
    server.begin();
    blinkLed(5, 100);
  }

  Serial.println("Servidor pronto!");
}

// =====================================================================
// Auto-registro no servidor
// =====================================================================

unsigned long lastRegister = 0;
unsigned long lastUpload = 0;
unsigned long lastLive = 0;

void sendLiveFrame() {
  if (currentMode != MODE_CONNECTED) return;
  if (millis() - lastLive < LIVE_INTERVAL) return;
  lastLive = millis();

  // Live: usa resolucao atual (sem trocar, evita corrupcao)
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) return;

  WiFiClient client;
  HTTPClient http;
  http.setTimeout(5000);

  String url = String(SERVER_URL) + "/api/modules/live?chip_id=" + chipId;
  http.begin(client, url);
  http.addHeader("Content-Type", "image/jpeg");
  http.POST(fb->buf, fb->len);
  http.end();
  esp_camera_fb_return(fb);
}

void uploadImageToServer() {
  if (currentMode != MODE_CONNECTED) return;
  if (millis() - lastUpload < uploadInterval) return;
  lastUpload = millis();

  // Captura: usa resolucao atual (sem trocar, evita corrupcao)
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Upload: falha ao capturar");
    return;
  }

  Serial.printf("Upload: %d bytes VGA, enviando...\n", fb->len);

  WiFiClient client;
  HTTPClient http;
  http.setTimeout(30000);  // 30s para imagem grande

  String url = String(SERVER_URL) + "/api/modules/upload?chip_id=" + chipId;
  http.begin(client, url);
  http.addHeader("Content-Type", "image/jpeg");

  int code = http.POST(fb->buf, fb->len);
  if (code == 200) {
    Serial.printf("Upload OK: %d bytes\n", fb->len);
  } else {
    String resp = http.getString();
    Serial.printf("Upload falhou: HTTP %d - %s\n", code, resp.c_str());
  }
  http.end();
  esp_camera_fb_return(fb);
}

void registerOnServer() {
  if (currentMode != MODE_CONNECTED) return;
  if (millis() - lastRegister < REGISTER_INTERVAL) return;
  lastRegister = millis();

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/modules/register";

#if USE_HTTPS
  WiFiClientSecure client;
  client.setInsecure();
#else
  WiFiClient client;
#endif
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  String body = "{";
  body += "\"chip_id\":\"" + chipId + "\",";
  body += "\"short_id\":\"" + getShortId() + "\",";
  body += "\"type\":\"" + String(MODULE_TYPE) + "\",";
  body += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  body += "\"ssid\":\"" + WiFi.SSID() + "\",";
  body += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  body += "\"uptime\":" + String(millis() / 1000) + ",";
  body += "\"free_heap\":" + String(ESP.getFreeHeap());
  body += "}";

  int code = http.POST(body);
  if (code == 200) {
    String resp = http.getString();
    // Extrai capture_interval da resposta JSON
    int idx = resp.indexOf("\"capture_interval\":");
    if (idx > 0) {
      int start = idx + 19;  // comprimento de "capture_interval":
      int end = start;
      while (end < (int)resp.length() && resp.charAt(end) >= '0' && resp.charAt(end) <= '9') end++;
      if (end > start) {
        unsigned long newInterval = resp.substring(start, end).toInt() * 1000UL;
        if (newInterval >= 10000 && newInterval != uploadInterval) {
          Serial.printf("Intervalo de captura alterado: %lus -> %lus\n", uploadInterval / 1000, newInterval / 1000);
          uploadInterval = newInterval;
        }
      }
    }
    Serial.println("Registro OK no servidor");
  } else {
    Serial.printf("Registro falhou: %d\n", code);
  }
  http.end();
}

// Verifica botao de reset WiFi (GPIO13)
void checkResetButton() {
  static unsigned long pressStart = 0;
  static bool wasPressed = false;

  if (digitalRead(RESET_BTN) == LOW) {  // Botao pressionado (ativo LOW)
    if (!wasPressed) {
      pressStart = millis();
      wasPressed = true;
      Serial.println("Botao pressionado...");
    }
    // Feedback visual: LED pisca enquanto segura
    if (millis() - pressStart > 1000) {
      digitalWrite(LED_BUILTIN, (millis() / 200) % 2);  // Pisca rapido
    }
    // Se segurou por 3 segundos
    if (millis() - pressStart >= RESET_HOLD_TIME) {
      Serial.println(">>> RESET WiFi via botao! <<<");
      blinkLed(2, 500);  // Feedback visual de confirmacao
      // Limpa credenciais e reinicia
      clearWiFiCredentials();
      ESP.restart();
    }
  } else {
    if (wasPressed) {
      digitalWrite(LED_BUILTIN, LOW);  // Apaga LED se soltou antes dos 3s
    }
    wasPressed = false;
  }
}

void loop() {
  checkResetButton();
  dnsServer.processNextRequest();  // AP sempre ativo, DNS sempre processando
  server.handleClient();
  updateStatusLed();
  checkWiFiConnection();     // Detecta queda de WiFi
  tryReconnectWiFi();        // Retenta a cada 30s se offline
  registerOnServer();
  sendLiveFrame();
  uploadImageToServer();
}
