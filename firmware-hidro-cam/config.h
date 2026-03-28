/*
  Cultivee Hidro-Cam - Configuracao de Ambiente

  Para testar localmente:  #define ENV_LOCAL
  Para producao (VPS):     #define ENV_PRODUCTION
*/

// ===== AMBIENTE ATIVO =====
// #define ENV_LOCAL
#define ENV_PRODUCTION
// ==========================

#ifdef ENV_LOCAL
  #define LOCAL_SERVER_IP    "192.168.7.233"
  #define LOCAL_SERVER_PORT  "5003"
  #define SERVER_URL         "http://" LOCAL_SERVER_IP ":" LOCAL_SERVER_PORT
#endif

#ifdef ENV_PRODUCTION
  #define SERVER_URL         "http://hidro-cam.cultivee.com.br"
#endif

// ===== MODULO =====
#define MODULE_TYPE        "hidro-cam"
#define REGISTER_INTERVAL  10000    // 10s entre registros no servidor
#define MDNS_NAME          "cultivee-hidro-cam"
#define AP_SSID            "Cultivee-HidroCam"
#define WIFI_TIMEOUT       15000    // 15s timeout conexao WiFi

// ===== HARDWARE (ESP32-WROVER-DEV — GPIOs livres da camera) =====
#define RELE_LAMPADA  13   // IN1 do modulo rele (GPIO13)
#define RELE_BOMBA    14   // IN2 do modulo rele (GPIO14)
#define LED_ONBOARD   2    // LED azul da placa
#define RESET_BTN     0    // Botao BOOT da placa (GPIO0) - segurar 3s = reset WiFi

// Reles com optoacoplador sao ativos em LOW
#define RELE_ON   LOW
#define RELE_OFF  HIGH

// ===== NTP =====
#define NTP_SERVER     "pool.ntp.org"
#define GMT_OFFSET     -3 * 3600   // UTC-3 (Brasilia)
#define DST_OFFSET     0           // Sem horario de verao

// ===== FASES DEFAULT =====
#define MAX_PHASES     10
#define DEFAULT_PHASES 3
