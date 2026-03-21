/*
  Cultivee - Configuracao de Ambiente

  Para testar localmente:  #define ENV_LOCAL
  Para producao (VPS):     #define ENV_PRODUCTION

  Altere APENAS a linha abaixo para trocar o ambiente.
*/

// ===== AMBIENTE ATIVO =====
#define ENV_LOCAL
// #define ENV_PRODUCTION
// ==========================

#ifdef ENV_LOCAL
  #define SERVER_URL        "http://192.168.7.233:5000"
  #define USE_HTTPS         false
#endif

#ifdef ENV_PRODUCTION
  #define SERVER_URL        "https://app.cultivee.com.br"
  #define USE_HTTPS         true
#endif

// ===== BLE SETUP =====
// true = habilita configuracao WiFi via Bluetooth
// false = usa apenas WiFi Manager (AP aberto)
// BLE nao cabe no ESP32-CAM (IRAM overflow)
// Habilitar somente na ESP32-WROVER-DEV (8MB PSRAM)
#define BLE_SETUP_ENABLED   false
