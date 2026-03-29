# Cultivee - Plataforma IoT Modular

## Visao Geral
Plataforma IoT para cultivo inteligente. Arquitetura **core + modulos**: um unico codebase
de firmware e um unico servidor, com modulos (hidro, cam) ativados por config.

Trocar produto = 1 linha no firmware (`config.h`) + env vars no servidor (`docker-compose.yml`).

## Estrutura do Monorepo
```
cultivee/
├── firmware/                 # UM firmware, multiplos produtos
│   ├── firmware.ino          # setup() + loop() — orquestrador modular
│   ├── config.h              # Selecao de produto + ambiente (local/prod)
│   ├── core_wifi.h           # WiFi AP+STA, captive portal, NTP, reconnect
│   ├── core_server.h         # WebServer, CORS, rotas setup WiFi
│   ├── core_register.h       # Registro no servidor, polling, command dispatch
│   ├── mod_hidro.h           # Reles, fases, automacao, dashboard local hidro
│   └── mod_cam.h             # Camera OV2640: capture, stream, dashboard local
│
├── products/                 # 1 arquivo = 1 produto (define modulos + pinos)
│   ├── hidro.h               # MOD_HIDRO, ESP32-WROOM, GPIO 4/5
│   └── hidro-cam.h           # MOD_HIDRO + MOD_CAM, ESP32-WROVER, GPIO 13/14
│
├── server/                   # UM servidor Flask (substitui server-ctrl + server-hidro-cam)
│   ├── app.py                # Core: auth, modules, PWA, registro de blueprints
│   ├── models.py             # SQLite (users, modules, commands, tokens)
│   ├── config.py             # Selecao de produto via env vars (espelha firmware)
│   ├── bp_hidro.py           # Blueprint: status, relay, phases, config
│   ├── bp_cam.py             # Blueprint: capture, upload, image
│   ├── templates/
│   │   └── index.html        # Jinja2 template (config injetada por produto)
│   ├── static/
│   │   ├── app.js            # PWA unificada (le window.CULTIVEE para adaptar)
│   │   ├── style.css
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── Dockerfile
│   └── requirements.txt
│
├── site/                     # cultivee.com.br — Landing page (Nginx)
├── docker-compose.yml        # FONTE DA VERDADE — containers de producao
├── deploy.sh                 # Script de deploy para VPS
└── CLAUDE.md                 # ESTE ARQUIVO
```

### Diretorios antigos (DEPRECADOS — nao usar, serao deletados)
- `firmware-ctrl/`, `firmware-hidro-cam/`, `firmware-cam/`, `firmware-wrover/`
- `server-ctrl/`, `server-hidro-cam/`

---

## Como Funciona a Modularizacao

### Firmware: `#ifdef` em tempo de compilacao
Cada modulo implementa funcoes padrao: `*_setup()`, `*_loop()`, `*_register_routes()`,
`*_process_command()`, `*_status_json()`, `*_dashboard_html()`, `*_dashboard_js()`.

`firmware.ino` conecta os modulos condicionalmente:
```cpp
#ifdef MOD_HIDRO
  hidro_setup();
  hidro_register_routes();
#endif
#ifdef MOD_CAM
  cam_setup();
  cam_register_routes();
#endif
```

Trocar produto = mudar 1 include em `config.h`:
```cpp
// #include "../products/hidro.h"
#include "../products/hidro-cam.h"  // ← produto ativo
```

### Servidor: Flask Blueprints + env vars
`config.py` le `MODULE_TYPE` e ativa `MOD_HIDRO` / `MOD_CAM`.
`app.py` registra blueprints condicionalmente (espelha firmware):
```python
if MOD_HIDRO:
    app.register_blueprint(hidro_bp, url_prefix=API_PREFIX)
if MOD_CAM:
    app.register_blueprint(cam_bp, url_prefix=API_PREFIX)
```

Docker Compose roda 2 containers do mesmo server/ com env vars diferentes:
- `ctrl`: MODULE_TYPE=ctrl, PORT=5002, API_PREFIX=/api/ctrl
- `hidro-cam`: MODULE_TYPE=hidro-cam, PORT=5003, API_PREFIX=/api/hidro-cam

### PWA: Config injetada via Jinja2
`app.py` injeta `window.CULTIVEE` com config do produto (apiPrefix, storagePrefix, cameraEnabled, etc).
`app.js` le `window.CULTIVEE` e adapta a UI (titulo, storage keys, secao camera).
`manifest.json` e `sw.js` sao gerados dinamicamente por rotas Flask.

### Capabilities
Firmware envia `capabilities: ["hidro", "cam"]` no registro. Servidor armazena no banco.
Permite PWA e futuras features adaptar dinamicamente ao hardware conectado.

---

## Produto HIDRO

### URLs
- **App:** https://hidro.cultivee.com.br
- **ESP32 local:** http://192.168.4.1 (rede Cultivee-Hidro)

### Hardware ESP32-WROOM-32D
- **Placa:** HW-394 com placa expansao bornes parafuso
- **Porta:** COM7
- **Board Arduino:** esp32:esp32:esp32doit-devkit-v1
- **Rele:** Modulo 2 canais 5V (JQC3F-5VDC-C) com optoacoplador PC817
  - IN1 → GPIO4 (Lampada), IN2 → GPIO5 (Bomba)
  - VCC → VIN (5V), GND compartilhado, jumper RY-VCC mantido
- **Reles ativos em LOW** (RELE_ON = LOW, RELE_OFF = HIGH)
- **Botao BOOT (GPIO0):** segurar 3s = reset WiFi
- **LED onboard:** GPIO2

### Compilar e gravar
```bash
# Garantir config.h com: #include "../products/hidro.h"
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32doit-devkit-v1 "D:/01-projetos-claude/cultivee/firmware"
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32doit-devkit-v1 -p COM7 "D:/01-projetos-claude/cultivee/firmware"
```

---

## Produto HIDRO-CAM

### URLs
- **App:** https://hidro-cam.cultivee.com.br
- **ESP32 local:** http://192.168.4.1 (rede Cultivee-HidroCam)

### Hardware ESP32-WROVER-DEV
- **Placa:** ESP32-WROVER-DEV com camera OV2640
- **Porta:** COM9
- **Board Arduino:** esp32:esp32:esp32wroverkit
- **Flash:** ~98% usado (apertado, otimizar antes de adicionar features)
- **Camera:** OV2640 integrada, VGA 640x480, JPEG quality 12, 2 frame buffers (PSRAM)
- **Reles:** GPIO 13 (Lampada), GPIO 14 (Bomba) — GPIOs livres da camera
- **LED onboard:** GPIO 2
- **Botao BOOT:** GPIO 0 (reset WiFi 3s)

### Compilar e gravar
```bash
# Garantir config.h com: #include "../products/hidro-cam.h"
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32wroverkit "D:/01-projetos-claude/cultivee/firmware"
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32wroverkit -p COM9 "D:/01-projetos-claude/cultivee/firmware"
```

---

## Funcionalidades

### Firmware (todos os produtos)
- **WiFi AP hibrido:** modo AP_STA, rede AP sempre ativa (192.168.4.1)
- **Portal cativo:** redireciona Android/iOS/Windows para pagina de config WiFi
- **Auto-registro:** POST periodico em /api/modules/register (chip_id, IP, status, capabilities)
- **Polling adaptativo:** 2s com atividade, 10s idle — comando dispatch modular
- **Dashboard local:** 192.168.4.1 com composicao modular (cada modulo contribui HTML+JS)
- **CORS habilitado:** Access-Control-Allow-Origin: *

### Modulo Hidro (mod_hidro.h / bp_hidro.py)
- Fases configuraveis: nome, duracao, horario luz, irrigacao dia/noite
- Controle automatico baseado em fase atual + horario NTP
- Modo manual: liga/desliga reles via interface web
- Config de fases e data de inicio via app ou dashboard local

### Modulo Camera (mod_cam.h / bp_cam.py)
- Captura unica: `/capture` retorna JPEG com CORS
- Stream MJPEG: `/stream` ~10fps, 600 frames, reconecta automaticamente
- Captura remota: app enfileira comando → ESP32 captura → POST /upload-capture
- Imagens salvas em `data/captures/<chip_id>/<timestamp>.jpg`

### API do Servidor

#### Autenticacao
- `POST /api/auth/register` → {name, email, password} → {token, user}
- `POST /api/auth/login` → {email, password} → {token, user}
- `GET /api/auth/me` → user info (requer token)
- `POST /api/auth/logout` → invalida token

#### Modulos
- `POST /api/modules/register` → ESP32 se registra (chip_id, capabilities, ctrl_data)
- `GET /api/modules/poll?chip_id=X` → polling leve de comandos pendentes
- `POST /api/modules/pair` → vincular modulo ao usuario (short_id, name)
- `POST /api/modules/unpair` → desvincular modulo
- `GET /api/modules` → listar modulos do usuario

#### Hidro (prefixo dinamico: /api/ctrl ou /api/hidro-cam)
- `GET /<prefix>/<chip_id>/status` → status do modulo
- `GET /<prefix>/<chip_id>/relay?device=light&action=toggle` → controle rele
- `GET /<prefix>/<chip_id>/phases?live=1` → fases (proxy direto ou banco)
- `POST /<prefix>/<chip_id>/save-config` → salvar config fases
- `GET /<prefix>/<chip_id>/add-phase` → adicionar fase
- `GET /<prefix>/<chip_id>/remove-phase?idx=N` → remover fase
- `GET /<prefix>/<chip_id>/reset-phases` → restaurar fases default
- `GET /<prefix>/<chip_id>/reset-wifi` → reset WiFi do ESP32

#### Camera (prefixo dinamico: /api/hidro-cam)
- `GET /<prefix>/<chip_id>/capture` → enfileira captura
- `POST /<prefix>/<chip_id>/upload-capture` → ESP32 envia foto
- `GET /<prefix>/<chip_id>/image/<filename>` → serve imagem (requer token)
- `GET /<prefix>/<chip_id>/last-capture` → URL ultima captura

### App/PWA

#### Versionamento
A versao esta em `app.py` (sw.js e manifest.json sao dinamicos):
- `sw.js` inline em `app.py` → `APP_VERSION = '1.0.1'`

**Ao fazer deploy com mudancas no app, incrementar a versao em app.py.**

#### Funcionalidades
- Login/registro de usuarios
- Dashboard com cards dos modulos (online/offline)
- Controle manual: botoes luz e bomba com update otimista
- Visualizacao de fases (progresso, dias, config)
- Camera: card colapsavel com captura remota e ultima foto
- Wizard de setup guiado (modulo novo ou codigo existente)
- Auto-pair via URL (?code=XXXX)
- Deteccao de conexao real (fetch com timeout)
- Tela offline com link para modo local (192.168.4.1)
- Service Worker com cache offline
- Banner de instalacao e atualizacao PWA

---

## Ambiente (config.h)
```c
// Firmware: escolher ambiente
// #define ENV_LOCAL
#define ENV_PRODUCTION
```
- `SERVER_URL` muda conforme ambiente (local: http://IP:porta, producao: http://subdominio.cultivee.com.br)
- ESP32 envia via HTTP (sem RAM para SSL)

### Servidor de desenvolvimento local
```bash
cd D:/01-projetos-claude/cultivee/server

# Terminal 1: servidor
python run-ctrl.py              # Hidro na porta 5002
python run-hidro-cam.py         # HidroCam na porta 5003

# Terminal 2: simulador ESP32 (finge ser o hardware)
python -u sim_esp32.py          # simula ctrl (codigo: SC01)
python -u sim_esp32.py hidro-cam  # simula hidro-cam (codigo: SH01)
```

O simulador (`sim_esp32.py`) registra um modulo fake no servidor, envia heartbeat periodico
e processa comandos (relay, fases, capture). Permite testar o fluxo completo da PWA sem hardware.
- **SC01** = codigo para vincular modulo ctrl simulado
- **SH01** = codigo para vincular modulo hidro-cam simulado

---

## Infraestrutura

### VPS
- **IP:** 129.121.50.168
- **SSH:** `ssh -i "D:/01-projetos-claude/.credentials/id_rsa" -p 22022 root@129.121.50.168`
- **SO:** Ubuntu 24.04
- **Stack:** Docker + Traefik (proxy reverso + SSL Let's Encrypt)
- **Traefik config:** /opt/traefik/config/traefik.yml
- **Sites:** /opt/sites/cultivee/

### Traefik
- Redirect HTTP→HTTPS **removido do global** (ESP32 precisa de HTTP)
- Redirect via middleware `https-redirect@file` aplicado individualmente nos routers do site
- Routers HTTP sem redirect: cultivee-ctrl-http, cultivee-hidro-cam-http (para ESP32)
- Config dinamica: /opt/traefik/config/dynamic/redirect.yml

### Docker
- `docker-compose.yml` do REPOSITORIO e a fonte da verdade. NUNCA editar no servidor.
- Volumes: cultivee-ctrl-data, cultivee-hidro-cam-data

### Containers
| Container | Servico | Porta | Dominio |
|-----------|---------|-------|---------|
| cultivee-site | Landing page (Nginx) | 80 | cultivee.com.br |
| cultivee-ctrl | Hidro (Flask/Gunicorn) | 5002 | hidro.cultivee.com.br |
| cultivee-hidro-cam | HidroCam (Flask/Gunicorn) | 5003 | hidro-cam.cultivee.com.br |

### Deploy
```bash
bash D:/01-projetos-claude/cultivee/deploy.sh ctrl       # so Hidro
bash D:/01-projetos-claude/cultivee/deploy.sh hidro-cam  # so HidroCam
bash D:/01-projetos-claude/cultivee/deploy.sh site       # so landing page
bash D:/01-projetos-claude/cultivee/deploy.sh all        # tudo
bash D:/01-projetos-claude/cultivee/deploy.sh            # tudo (default)
```

### Fluxo de deploy
1. Fazer alteracoes no codigo
2. `bash deploy.sh [ctrl|hidro-cam|site|all]`
O script automaticamente:
- Envia docker-compose.yml atualizado
- Empacota server/ (backend unificado) ou site/
- Envia via SCP e extrai no servidor
- Reconstroi apenas o container necessario (--no-cache)
- Verifica saude dos containers

### DNS (Cloudflare)
- **Conta:** mardo.abc@gmail.com
- **Zone ID:** 1108abb21ad72aca86db5e0fcdd389ea
- cultivee.com.br → proxied
- hidro.cultivee.com.br → DNS only
- hidro-cam.cultivee.com.br → DNS only

### WiFi de teste
- Rede: Mardo-Dri
- Senha: mardodri1609

### Git
- user.name: Mardoqueu Costa
- user.email: mardo.abc@gmail.com

### Arduino CLI
- Path: `C:/Users/user/arduino-cli/arduino-cli.exe`

---

## Checklist de Mudancas

### Se alterar firmware (firmware/ ou products/):
1. Verificar `config.h` (produto e ambiente corretos)
2. Compilar e gravar no board correspondente
3. Se mudou API/protocolo: atualizar servidor e app junto

### Se alterar servidor/app (server/):
1. `bash deploy.sh ctrl` e/ou `bash deploy.sh hidro-cam`
2. Se mudou versao do app: incrementar APP_VERSION em app.py
3. Testar no celular (com internet + rede local do ESP32)

### Se alterar docker-compose.yml:
1. Editar no REPOSITORIO (nunca no servidor)
2. `bash deploy.sh` (qualquer variante envia o docker-compose.yml)

---

## Adicionar Novo Modulo (futuro)

Para adicionar um modulo "sensor":
1. Criar `mod_sensor.h` no firmware (setup, loop, routes, status, dashboard)
2. Adicionar `#ifdef MOD_SENSOR` nos pontos de integracao em `firmware.ino`
3. Criar `products/hidro-sensor.h` com `MOD_HIDRO + MOD_SENSOR`
4. Criar `bp_sensor.py` no servidor (Flask Blueprint)
5. Registrar condicionalmente em `app.py`
6. Adicionar UI no `app.js` / `index.html`

**Total: ~3-4 arquivos novos, ~10 linhas em arquivos existentes.**
