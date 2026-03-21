/*
  Cultivee - BLE WiFi Setup Module (NimBLE - leve)
  Permite configurar WiFi via Bluetooth Low Energy (Web Bluetooth API)

  Usa NimBLE: 50% menos flash, ~100KB menos RAM que Bluedroid

  Para desativar: defina BLE_SETUP_ENABLED como false em config.h
*/

#ifndef BLE_SETUP_H
#define BLE_SETUP_H

#include <NimBLEDevice.h>

// UUIDs do servico BLE Cultivee
#define SERVICE_UUID        "fb1e4001-54ae-4a28-9f74-dfccb248601d"
#define CHAR_SSID_UUID      "fb1e4002-54ae-4a28-9f74-dfccb248601d"
#define CHAR_PASS_UUID      "fb1e4003-54ae-4a28-9f74-dfccb248601d"
#define CHAR_CMD_UUID       "fb1e4004-54ae-4a28-9f74-dfccb248601d"
#define CHAR_STATUS_UUID    "fb1e4005-54ae-4a28-9f74-dfccb248601d"

// Estado do BLE setup
static bool bleConnected = false;
static bool bleCredentialsReceived = false;
static String bleSsid = "";
static String blePass = "";
static NimBLECharacteristic *statusChar = nullptr;

// Callback de conexao
class BleServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) override {
    bleConnected = true;
    Serial.println("BLE: Cliente conectado");
    if (statusChar) {
      statusChar->setValue("connected");
      statusChar->notify();
    }
  }

  void onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) override {
    bleConnected = false;
    Serial.println("BLE: Cliente desconectado");
    NimBLEDevice::startAdvertising();
  }
};

// Callback para receber SSID
class SsidCallback : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo& connInfo) override {
    bleSsid = pCharacteristic->getValue().c_str();
    Serial.printf("BLE: SSID recebido: %s\n", bleSsid.c_str());
    if (statusChar) {
      statusChar->setValue("ssid_ok");
      statusChar->notify();
    }
  }
};

// Callback para receber senha
class PassCallback : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo& connInfo) override {
    blePass = pCharacteristic->getValue().c_str();
    Serial.println("BLE: Senha recebida");
    if (statusChar) {
      statusChar->setValue("pass_ok");
      statusChar->notify();
    }
  }
};

// Callback para comando (connect/scan)
class CmdCallback : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *pCharacteristic, NimBLEConnInfo& connInfo) override {
    String cmd = pCharacteristic->getValue().c_str();
    Serial.printf("BLE: Comando: %s\n", cmd.c_str());

    if (cmd == "connect") {
      if (bleSsid.length() > 0) {
        bleCredentialsReceived = true;
        if (statusChar) {
          statusChar->setValue("connecting");
          statusChar->notify();
        }
      } else {
        if (statusChar) {
          statusChar->setValue("error:no_ssid");
          statusChar->notify();
        }
      }
    } else if (cmd == "scan") {
      if (statusChar) {
        statusChar->setValue("scanning");
        statusChar->notify();
      }
      // Scan WiFi
      WiFi.mode(WIFI_STA);
      int n = WiFi.scanNetworks();
      String networks = "networks:";
      for (int i = 0; i < n && i < 10; i++) {
        if (i > 0) networks += "|";
        networks += WiFi.SSID(i) + "," + String(WiFi.RSSI(i));
      }
      WiFi.scanDelete();
      WiFi.mode(WIFI_AP_STA);

      if (statusChar) {
        statusChar->setValue(networks.c_str());
        statusChar->notify();
      }
      Serial.printf("BLE: Scan: %d redes\n", n);
    }
  }
};

// Inicia o servidor BLE
void startBleSetup(const String &shortId) {
  Serial.println("BLE: Iniciando NimBLE...");

  String devName = "Cultivee-" + shortId;
  NimBLEDevice::init(devName.c_str());
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);  // Max power

  NimBLEServer *pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new BleServerCallbacks());

  NimBLEService *pService = pServer->createService(SERVICE_UUID);

  // SSID (write)
  NimBLECharacteristic *ssidChar = pService->createCharacteristic(
    CHAR_SSID_UUID, NIMBLE_PROPERTY::WRITE
  );
  ssidChar->setCallbacks(new SsidCallback());

  // Password (write)
  NimBLECharacteristic *passChar = pService->createCharacteristic(
    CHAR_PASS_UUID, NIMBLE_PROPERTY::WRITE
  );
  passChar->setCallbacks(new PassCallback());

  // Command (write)
  NimBLECharacteristic *cmdChar = pService->createCharacteristic(
    CHAR_CMD_UUID, NIMBLE_PROPERTY::WRITE
  );
  cmdChar->setCallbacks(new CmdCallback());

  // Status (read + notify)
  statusChar = pService->createCharacteristic(
    CHAR_STATUS_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );
  statusChar->setValue("ready");

  pService->start();

  NimBLEAdvertising *pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->enableScanResponse(true);
  pAdvertising->start();

  Serial.printf("BLE: Advertising como '%s'\n", devName.c_str());
}

// Para o BLE e libera memoria
void stopBle() {
  Serial.println("BLE: Desligando NimBLE...");
  NimBLEDevice::deinit(true);
  delay(300);
  Serial.println("BLE: Desligado");
}

// Verifica se credenciais foram recebidas
bool bleHasCredentials() {
  return bleCredentialsReceived;
}

// Retorna credenciais recebidas
void bleGetCredentials(String &ssid, String &pass) {
  ssid = bleSsid;
  pass = blePass;
}

#endif // BLE_SETUP_H
