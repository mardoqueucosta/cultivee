/*
  Cultivee Modulo - Camera
  Captura JPEG, streaming MJPEG, upload para servidor
*/

#ifndef MOD_CAM_H
#define MOD_CAM_H
#ifdef MOD_CAM

// ===================== INIT =====================

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
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 2;

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
  s->set_wb_mode(s, 0);
  s->set_exposure_ctrl(s, 1);
  s->set_aec2(s, 1);
  s->set_gain_ctrl(s, 1);
  s->set_raw_gma(s, 1);
  s->set_lenc(s, 1);
  s->set_saturation(s, 0);

  for (int i = 0; i < 5; i++) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) esp_camera_fb_return(fb);
    delay(100);
  }

  Serial.println("Camera OK!");
  return true;
}

// ===================== ROUTE HANDLERS =====================

void handleCapture() {
  if (!cameraReady) {
    sendCORS();
    server.send(503, "application/json", "{\"error\":\"Camera nao inicializada\"}");
    return;
  }

  // Flush stale frames from buffer (fb_count=2, podem estar velhos apos stream)
  for (int i = 0; i < 3; i++) {
    camera_fb_t* old = esp_camera_fb_get();
    if (old) esp_camera_fb_return(old);
  }

  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    sendCORS();
    server.send(500, "application/json", "{\"error\":\"Erro ao capturar\"}");
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

  size_t sent = fb->len;
  esp_camera_fb_return(fb);
  Serial.printf("Capture: %d bytes\n", sent);
}

void handleStream() {
  if (!cameraReady) {
    sendCORS();
    server.send(503, "text/plain", "Camera nao inicializada");
    return;
  }

  WiFiClient client = server.client();
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: multipart/x-mixed-replace; boundary=frame");
  client.println("Access-Control-Allow-Origin: *");
  client.println("Cache-Control: no-cache");
  client.println("Connection: close");
  client.println();

  for (int i = 0; i < 600 && client.connected(); i++) {
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
    delay(100);
  }
}

// ===================== STATUS JSON =====================

String cam_register_json() {
  return "\"camera_ready\":" + String(cameraReady ? "true" : "false");
}

String cam_status_json() {
  return ",\"camera_ready\":" + String(cameraReady ? "true" : "false");
}

// ===================== DASHBOARD HTML =====================

String cam_dashboard_html() {
  String html = "";
  html += "<div class='card' style='padding:0;overflow:hidden'>";
  html += "<div onclick='camTgl()' style='display:flex;justify-content:space-between;align-items:center;padding:14px;cursor:pointer'>";
  html += "<div style='display:flex;align-items:center;gap:8px'>";
  html += "<span style='width:8px;height:8px;border-radius:50%;background:" + String(cameraReady ? "#27ae60" : "#e74c3c") + "'></span>";
  html += "<b style='font-size:0.9rem'>Camera</b>";
  html += "<span style='color:#888;font-size:0.8rem'>" + String(cameraReady ? "Pronta" : "Offline") + "</span>";
  html += "</div>";
  html += "<svg id='cam-chv' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#888' stroke-width='2' style='transition:transform 0.25s'><polyline points='6 9 12 15 18 9'/></svg>";
  html += "</div>";
  html += "<div id='cam-body' style='display:none;padding:0 14px 14px;border-top:1px solid #2a2d35'>";
  html += "<div id='cam-img' style='background:#1a1d23;border-radius:8px;min-height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-top:10px'>";
  html += "<span style='color:#555;font-size:0.85rem'>Toque em Capturar</span>";
  html += "</div>";
  html += "<div style='display:flex;gap:8px;margin-top:8px'>";
  html += "<button id='cam-btn' onclick='cap()' style='flex:1;padding:10px;border-radius:10px;border:1px solid #3a3d45;background:#2a2d35;color:#aaa;font-weight:600;font-size:0.85rem;cursor:pointer' " + String(cameraReady ? "" : "disabled") + ">&#128247; Capturar</button>";
  html += "<button id='live-btn' onclick='live()' style='flex:1;padding:10px;border-radius:10px;border:1px solid #3a3d45;background:#2a2d35;color:#aaa;font-weight:600;font-size:0.85rem;cursor:pointer' " + String(cameraReady ? "" : "disabled") + ">&#127909; Ao Vivo</button>";
  html += "</div></div></div>";
  return html;
}

String cam_dashboard_js() {
  return R"rawliteral(
var liveOn=false,liveImg=null;
function live(){
var im=document.getElementById('cam-img'),b=document.getElementById('live-btn');
if(liveOn){
liveOn=false;
if(liveImg){liveImg.src='';liveImg=null}
im.innerHTML='<span style="color:#555;font-size:0.85rem">Toque em Capturar</span>';
b.innerHTML='&#127909; Ao Vivo';
b.style.borderColor='#3a3d45';b.style.background='#2a2d35';b.style.color='#aaa';
} else {
liveOn=true;
var img=document.createElement('img');
img.src='/stream?t='+Date.now();img.style.cssText='width:100%;border-radius:8px';
img.onerror=function(){if(liveOn){setTimeout(function(){img.src='/stream?t='+Date.now()},1000)}};
liveImg=img;
im.innerHTML='';im.appendChild(img);
b.innerHTML='&#9632; Parar';
b.style.borderColor='#e74c3c';b.style.background='rgba(231,76,60,0.1)';b.style.color='#e74c3c';
}
}
function camTgl(){
var b=document.getElementById('cam-body'),c=document.getElementById('cam-chv');
var open=b.style.display==='none';
b.style.display=open?'block':'none';
c.style.transform=open?'rotate(180deg)':'';
}
function cap(){
var b=document.getElementById('cam-btn'),im=document.getElementById('cam-img');
b.disabled=true;b.innerHTML='&#9203; Capturando...';
im.innerHTML='<div style="padding:20px;text-align:center"><div style="width:24px;height:24px;border:3px solid #333;border-top-color:#27ae60;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto"></div><p style="color:#555;margin-top:8px;font-size:0.8rem">Aguardando imagem...</p></div>';
fetch('/capture').then(r=>{if(!r.ok)throw'err';return r.blob()}).then(bl=>{
var url=URL.createObjectURL(bl);
im.innerHTML='<img src="'+url+'" style="width:100%;border-radius:8px">';
b.disabled=false;b.innerHTML='&#128247; Capturar';
}).catch(()=>{
im.innerHTML='<span style="color:#e74c3c;font-size:0.85rem">Erro ao capturar</span>';
b.disabled=false;b.innerHTML='&#128247; Capturar';
})
}
)rawliteral";
}

// ===================== LIVE MODE (push frames para servidor) =====================

HTTPClient liveHttp;
bool liveHttpReady = false;

void setLiveResolution(bool live) {
  sensor_t* s = esp_camera_sensor_get();
  if (!s) return;
  if (live) {
    s->set_framesize(s, FRAMESIZE_QVGA);   // 320x240 — frames menores, upload rapido
    s->set_quality(s, 20);                   // Compressao alta para live (~5-8KB/frame)
  } else {
    s->set_framesize(s, FRAMESIZE_VGA);     // 640x480 — qualidade full para captura
    s->set_quality(s, 12);
  }
  // Flush buffers apos mudar resolucao
  for (int i = 0; i < 3; i++) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) esp_camera_fb_return(fb);
  }
}

void liveHttpConnect() {
  if (liveHttpReady) return;
  String url = String(SERVER_URL) + "/api/" + String(MODULE_TYPE) + "/" + chipId + "/live-frame";
  liveHttp.begin(url);
  liveHttp.addHeader("Content-Type", "image/jpeg");
  liveHttp.setTimeout(3000);
  liveHttp.setReuse(true);  // Keep-alive — reutiliza conexao TCP
  liveHttpReady = true;
}

void liveHttpDisconnect() {
  if (!liveHttpReady) return;
  liveHttp.end();
  liveHttpReady = false;
}

void pushLiveFrame() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) return;

  liveHttpConnect();
  int httpCode = liveHttp.POST(fb->buf, fb->len);
  esp_camera_fb_return(fb);

  if (httpCode != 200) {
    Serial.printf("Live frame erro: HTTP %d\n", httpCode);
    liveHttpDisconnect();  // Reconecta no proximo frame
  }
}

void cam_loop() {
  if (!camLiveMode || !cameraReady) return;

  // Timeout de seguranca (2 min max)
  if (millis() - liveStartTime > LIVE_MAX_DURATION) {
    camLiveMode = false;
    liveHttpDisconnect();
    setLiveResolution(false);
    Serial.println("Live mode: timeout, parando");
    return;
  }

  if (millis() - lastLiveFrame >= LIVE_FRAME_INTERVAL) {
    lastLiveFrame = millis();
    pushLiveFrame();
  }
}

// ===================== COMMAND HANDLER =====================

bool cam_process_command(String cmd, String obj) {
  if (cmd == "capture") {
    if (cameraReady) {
      // Flush stale frames antes de capturar
      for (int i = 0; i < 3; i++) {
        camera_fb_t* old = esp_camera_fb_get();
        if (old) esp_camera_fb_return(old);
      }
      camera_fb_t* fb = esp_camera_fb_get();
      if (fb) {
        HTTPClient camHttp;
        String uploadUrl = String(SERVER_URL) + "/api/" + String(MODULE_TYPE) + "/" + chipId + "/upload-capture";
        camHttp.begin(uploadUrl);
        camHttp.addHeader("Content-Type", "image/jpeg");
        camHttp.setTimeout(15000);
        int httpCode = camHttp.POST(fb->buf, fb->len);
        Serial.printf("Capture push: %d bytes -> HTTP %d\n", fb->len, httpCode);
        camHttp.end();
        esp_camera_fb_return(fb);
      } else {
        Serial.println("Capture: erro ao capturar frame");
      }
    } else {
      Serial.println("Capture: camera nao inicializada");
    }
    return true;
  }

  if (cmd == "start-live") {
    if (cameraReady) {
      setLiveResolution(true);
      camLiveMode = true;
      liveStartTime = millis();
      lastLiveFrame = 0;
      Serial.println("Live mode: INICIADO (QVGA)");
    } else {
      Serial.println("Live mode: camera nao inicializada");
    }
    return true;
  }

  if (cmd == "stop-live") {
    camLiveMode = false;
    liveHttpDisconnect();
    setLiveResolution(false);
    Serial.println("Live mode: PARADO (VGA restaurado)");
    return true;
  }

  return false;
}

// ===================== SETUP & ROUTES =====================

void cam_setup() {
  cameraReady = initCamera();
}

void cam_register_routes() {
  server.on("/capture", handleCapture);
  server.on("/stream", handleStream);
}

#endif // MOD_CAM
#endif // MOD_CAM_H
