/*
  Cultivee - Configuracao de Ambiente

  Para testar localmente:  #define ENV_LOCAL
  Para producao (VPS):     #define ENV_PRODUCTION

  Altere APENAS a linha abaixo para trocar o ambiente.
  O restante se ajusta automaticamente.

  IMPORTANTE: Ao trocar ambiente, recompile e regrave o firmware.
  O servidor (Flask) e o site (React) usam caminhos relativos,
  nao precisam de alteracao.
*/

// ===== AMBIENTE ATIVO =====
// #define ENV_LOCAL
#define ENV_PRODUCTION
// ==========================

// ===== LOCAL: ESP32 envia dados para o PC de desenvolvimento =====
#ifdef ENV_LOCAL
  // IP do PC na rede local (rode 'ipconfig' no terminal para descobrir)
  // Este IP pode mudar! Atualize se necessario.
  #define LOCAL_SERVER_IP    "192.168.7.233"
  #define LOCAL_SERVER_PORT  "5000"
  #define SERVER_URL         "http://" LOCAL_SERVER_IP ":" LOCAL_SERVER_PORT
  #define APP_URL            "https://app.cultivee.com.br"
  #define USE_HTTPS          false
#endif

// ===== PRODUCAO: ESP32 envia dados para o VPS =====
#ifdef ENV_PRODUCTION
  #define SERVER_URL         "http://app.cultivee.com.br"
  #define APP_URL            "https://app.cultivee.com.br"
  #define USE_HTTPS          false  // Traefik faz SSL termination, ESP envia HTTP
#endif

// ===== BLE SETUP =====
// true = habilita configuracao WiFi via Bluetooth
// false = usa apenas WiFi Manager (AP aberto)
// BLE nao cabe no ESP32-CAM (IRAM overflow)
// Habilitar somente na ESP32-WROVER-DEV (8MB PSRAM)
#define BLE_SETUP_ENABLED   false
