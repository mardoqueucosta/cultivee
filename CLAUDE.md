# Cultivee - Plataforma IoT de Monitoramento

## Visao Geral
Plataforma Cultivee com dois subprojetos independentes no mesmo monorepo.
Cada subprojeto tem firmware, servidor e app proprios. Nao misturar.

## Estrutura do Monorepo
```
cultivee/
├── site/               # cultivee.com.br - Landing page (compartilhado)
│
│── ── HIDRO (foco ativo) ─────────────────────────────
├── firmware-ctrl/      # Firmware ESP32-WROOM (reles luz/bomba, fases)
│   ├── firmware-ctrl.ino
│   └── config.h        # ENV_LOCAL / ENV_PRODUCTION
├── server-ctrl/        # hidro.cultivee.com.br
│   ├── app.py          # API Flask
│   ├── models.py       # SQLite (users, modules, commands)
│   └── static/         # App/PWA (frontend instalavel no celular)
│       ├── index.html
│       ├── app.js
│       ├── style.css
│       ├── sw.js
│       └── manifest.json
│
│── ── CAM (projeto separado) ─────────────────────────
├── firmware-cam/       # Firmware ESP32-CAM AI-Thinker
│   ├── firmware-cam.ino
│   └── config.h
├── firmware-wrover/    # Firmware ESP32-WROVER (alternativa)
│   ├── firmware-wrover.ino
│   └── config.h
├── server/             # app.cultivee.com.br
│   ├── app.py
│   ├── models.py
│   └── static/         # App/PWA
│
│── ── HIDRO-CAM ──────────────────────────────────────
├── firmware-hidro-cam/ # Firmware ESP32 HidroCam (cópia do Hidro + camera)
│   ├── firmware-hidro-cam.ino
│   └── config.h
├── server-hidro-cam/   # hidro-cam.cultivee.com.br
│   ├── app.py
│   ├── models.py
│   └── static/         # App/PWA
│
│── ── Compartilhado ──────────────────────────────────
├── docker-compose.yml  # Containers de producao (FONTE DA VERDADE)
├── deploy.sh           # Script de deploy para VPS
└── CLAUDE.md           # ESTE ARQUIVO
```

## IMPORTANTE: Coesao dos subprojetos
Cada subprojeto (Hidro, Hidro-cam ou Cam) tem 3 componentes que devem ser atualizados juntos:
1. **Firmware** — codigo do ESP32
2. **Servidor/API** — backend Flask no VPS
3. **App/PWA** — frontend (static/) no mesmo servidor

**Regra:** quando uma mudanca impactar mais de um componente, atualizar TODOS juntos.
Firmware via USB, servidor+app via deploy.sh.

---

## Projeto HIDRO (foco ativo)

### URLs
- **App:** https://hidro.cultivee.com.br (dashboard PWA)
- **ESP32 local:** http://192.168.4.1 (interface via rede Cultivee-Hidro)

### Hardware ESP32-WROOM-32D
- **Placa:** HW-394 com placa expansao bornes parafuso
- **Porta:** COM7
- **Board Arduino:** esp32:esp32:esp32doit-devkit-v1
- **Flash:** ~89% usado
- **Rele:** Modulo 2 canais 5V (JQC3F-5VDC-C) com optoacoplador PC817
  - IN1 → GPIO4 (Lampada), IN2 → GPIO5 (Bomba)
  - VCC → VIN (5V), GND compartilhado, jumper RY-VCC mantido
- **Reles ativos em LOW** (RELE_ON = LOW, RELE_OFF = HIGH)
- **Botao BOOT (GPIO0):** segurar 3s = reset WiFi
- **LED onboard:** GPIO2

### Compilar e gravar firmware
```bash
# Compilar
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32doit-devkit-v1 "D:/01-projetos-claude/cultivee/firmware-ctrl"

# Gravar
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32doit-devkit-v1 -p COM7 "D:/01-projetos-claude/cultivee/firmware-ctrl"
```

### Ambiente (config.h)
```c
// Para testar localmente:
#define ENV_LOCAL
// #define ENV_PRODUCTION

// Para producao (VPS):
// #define ENV_LOCAL
#define ENV_PRODUCTION
```
- `SERVER_URL` muda conforme ambiente (local: http://IP:5002, producao: http://hidro.cultivee.com.br)
- ESP32 envia via HTTP (sem RAM para SSL)

### Funcionalidades do firmware
- **WiFi AP hibrido:** modo AP_STA, rede "Cultivee-Hidro" sempre ativa (192.168.4.1)
- **Portal cativo:** redireciona Android/iOS/Windows para pagina de config WiFi
- **Auto-registro:** POST a cada 10s em /api/ctrl/register (chip_id, IP, status)
- **Fases configuraveis:** nome, duracao, horario luz, irrigacao dia/noite
- **Controle automatico:** baseado em fase atual + horario NTP
- **Modo manual:** liga/desliga reles via interface web
- **Dashboard local:** 192.168.4.1 com status, botoes, fases (update DOM sem reload)
- **Pagina config:** /config com formulario de fases e data de inicio
- **Fila de comandos:** servidor enfileira comandos, ESP32 busca no register
- **CORS habilitado:** Access-Control-Allow-Origin: * (permite fetch direto do browser)

### API do Servidor (server-ctrl/app.py)

#### Autenticacao
- `POST /api/auth/register` → {name, email, password} → {token, user}
- `POST /api/auth/login` → {email, password} → {token, user}
- Token via header `Authorization: Bearer <token>`

#### Modulos
- `POST /api/ctrl/register` → ESP32 se registra (chip_id, ip, status, ctrl_data)
- `POST /api/modules/pair` → Vincular modulo ao usuario (code, name)
- `GET /api/modules/list` → Listar modulos do usuario

#### Controle
- `GET /api/ctrl/<chip_id>/status` → Status do modulo (do banco)
- `GET /api/ctrl/<chip_id>/relay?device=light&action=toggle` → Controle rele (proxy + fila)
- `GET /api/ctrl/<chip_id>/phases?live=1` → Status com fases (proxy direto ou banco)
- `POST /api/ctrl/<chip_id>/save-config` → Salvar config de fases
- `GET /api/ctrl/<chip_id>/add-phase` → Adicionar fase
- `GET /api/ctrl/<chip_id>/remove-phase?idx=N` → Remover fase
- `GET /api/ctrl/<chip_id>/reset-phases` → Restaurar fases default
- `GET /api/ctrl/<chip_id>/reset-wifi` → Reset WiFi do ESP32

### App/PWA (server-ctrl/static/)

#### Versionamento
A versao esta em DOIS arquivos (manter sincronizados):
1. `static/app.js` → `const APP_VERSION = '1.0.1';`
2. `static/sw.js` → `const APP_VERSION = '1.0.1';`

**Ao fazer deploy com mudancas no app, SEMPRE incrementar a versao nos dois arquivos.**

#### Funcionalidades
- Login/registro de usuarios
- Dashboard com card do modulo (online/offline)
- Controle manual: botoes luz e bomba com update otimista
- Visualizacao de fases (progresso, dias, config)
- Config de fases e data de inicio
- Wizard de setup guiado (modulo novo ou codigo existente)
- Auto-pair via URL (?code=XXXX)
- Deteccao de conexao real (fetch com timeout, nao navigator.onLine)
- Tela offline com link para modo local (192.168.4.1)
- Service Worker com cache offline
- Banner de instalacao PWA
- Banner de atualizacao quando nova versao disponivel

### Servidor de desenvolvimento local
```bash
cd D:/01-projetos-claude/cultivee/firmware-ctrl
python server-dev.py
# Acessa em http://localhost:5001
```
O server-dev.py envia comandos serial para o ESP32 via Win32 API (ctypes, sem pyserial).

### Preview PWA local
Configurado em `.claude/launch.json` com nome "hidroponia-pwa" na porta 5002.

---

## Projeto HIDRO-CAM

### URLs
- **App:** https://hidro-cam.cultivee.com.br (dashboard PWA)
- **ESP32 local:** http://192.168.4.1 (interface via rede Cultivee-HidroCam)

### Estrutura
Mesma arquitetura do Hidro (firmware + servidor + app/PWA), com nomes diferenciados:
- Firmware: `firmware-hidro-cam/` (AP: Cultivee-HidroCam)
- Servidor: `server-hidro-cam/` (porta 5003, rotas `/api/hidro-cam/`)
- App/PWA: `server-hidro-cam/static/` (localStorage: `cultivee_hidro_cam_*`)
- Container: `cultivee-hidro-cam` (volume: `cultivee-hidro-cam-data`)

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
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32wroverkit "D:/01-projetos-claude/cultivee/firmware-hidro-cam"
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32wroverkit -p COM9 "D:/01-projetos-claude/cultivee/firmware-hidro-cam"
```

### Funcionalidades da camera (firmware)
- **`/capture`** — captura unica, retorna JPEG com CORS
- **`/stream`** — MJPEG stream (multipart/x-mixed-replace), 600 frames ~60s, reconecta automaticamente
- **`camera_ready`** — campo no status JSON e ctrl_data, indica se camera inicializou
- Camera isolada do codigo de reles — pode ser removida sem afetar hidroponia

### Funcionalidades da camera (servidor)
- **`GET /api/hidro-cam/<chip_id>/capture`** — enfileira comando capture, ESP32 tira foto e envia via push
- **`POST /api/hidro-cam/<chip_id>/upload-capture`** — ESP32 envia foto capturada (push)
- **`GET /api/hidro-cam/<chip_id>/image/<filename>`** — serve imagem salva (requer token via query param)
- **`GET /api/hidro-cam/<chip_id>/last-capture`** — retorna URL da ultima captura
- Imagens salvas em `data/captures/<chip_id>/<timestamp>.jpg`

### Funcionalidades da camera (app PWA)
- Card Camera colapsavel acima do dashboard (clique para expandir)
- Status: "Pronta" (verde) quando camera_ready=true, "Offline" (vermelho) quando nao
- Botao Capturar: enfileira comando + polling ate imagem chegar (~3-5s)
- Carrega ultima captura ao expandir pela primeira vez
- Codigo isolado no bloco CAMERA MODULE — `CAMERA_ENABLED = false` desativa

### Interface local (192.168.4.1)
- Card Camera no topo, colapsavel com chevron (igual PWA)
- Botao **Capturar** — fetch direto ao `/capture` do ESP32 (sem servidor)
- Botao **Ao Vivo** — MJPEG stream direto (`/stream`), ~60s continuo com reconexao
- Botao muda para "Parar" (vermelho) enquanto stream ativo

### Fluxo de captura (com internet)
```
App (HTTPS) → servidor enfileira "capture" + marca atividade (poll=2s)
ESP32 registra → recebe comando → tira foto → POST /upload-capture → servidor salva
App faz polling /last-capture a cada 1.5s → imagem aparece (~3-5s total)
```

### Fluxo de captura (offline / rede local)
```
Browser (HTTP) → fetch direto /capture ao ESP32 → JPEG retorna → mostra na tela
Browser (HTTP) → <img src="/stream"> → MJPEG continuo ~10fps
```

### Deploy
```bash
bash D:/01-projetos-claude/cultivee/deploy.sh hidro-cam
```

### Preview PWA local
Configurado em `.claude/launch.json` com nome "hidro-cam" na porta 5003.

---

## Projeto CAM (separado do Hidro)

### URLs
- **App:** https://app.cultivee.com.br (dashboard PWA)

### Hardware ESP32-CAM
- **Placa:** ESP32-CAM AI-Thinker (520KB RAM, 4MB Flash)
- **Sensor:** OV2640 (clone, tom verde/rosa - mitigado com wb_mode=1)
- **Porta:** COM9
- **Board Arduino:** esp32:esp32:esp32cam
- **Botao reset WiFi:** GPIO13 (3 segundos)

### Hardware ESP32-WROVER (alternativa)
- **Placa:** ESP32-WROVER-CAM (520KB RAM, 8MB PSRAM, 4MB Flash)
- **Board Arduino:** esp32:esp32:esp32wroverkit
- **AP SSID:** "Cultivee-Wrover"

### Compilar e gravar
```bash
# ESP32-CAM
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32cam "D:/01-projetos-claude/cultivee/firmware-cam"
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32cam -p COM9 "D:/01-projetos-claude/cultivee/firmware-cam"

# ESP32-WROVER
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32wroverkit "D:/01-projetos-claude/cultivee/firmware-wrover"
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32wroverkit -p COM9 "D:/01-projetos-claude/cultivee/firmware-wrover"
```

---

## Infraestrutura Compartilhada

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
- Routers HTTP sem redirect: cultivee-app-http, cultivee-ctrl-http, cultivee-hidro-cam-http (para ESP32)
- Config dinamica: /opt/traefik/config/dynamic/redirect.yml

### Docker
- `docker-compose.yml` do REPOSITORIO e a fonte da verdade. NUNCA editar no servidor.
- Volumes: cultivee-data (server), cultivee-ctrl-data (server-ctrl), cultivee-hidro-cam-data (server-hidro-cam)

### Containers
| Container | Servico | Porta | Dominio |
|-----------|---------|-------|---------|
| cultivee-site | Landing page (Nginx) | 80 | cultivee.com.br |
| cultivee-app | API Cam (Flask) | 5000 | app.cultivee.com.br |
| cultivee-ctrl | API Hidro (Flask) | 5002 | hidro.cultivee.com.br |
| cultivee-hidro-cam | API HidroCam (Flask) | 5003 | hidro-cam.cultivee.com.br |

### Deploy
```bash
bash D:/01-projetos-claude/cultivee/deploy.sh server-ctrl  # so Hidro (servidor + app)
bash D:/01-projetos-claude/cultivee/deploy.sh hidro-cam    # so HidroCam (servidor + app)
bash D:/01-projetos-claude/cultivee/deploy.sh server       # so Cam (servidor + app)
bash D:/01-projetos-claude/cultivee/deploy.sh site         # so landing page
bash D:/01-projetos-claude/cultivee/deploy.sh              # tudo
```

### Fluxo de deploy
1. Fazer alteracoes no codigo
2. `bash deploy.sh [server-ctrl|hidro-cam|server|site|all]`
O script automaticamente:
- Envia docker-compose.yml atualizado
- Empacota arquivos (exclui node_modules, dist, data, *.db)
- Envia via SCP e extrai no servidor
- Reconstroi apenas o container necessario (--no-cache)
- Verifica saude dos containers

### DNS (Cloudflare)
- **Conta:** mardo.abc@gmail.com
- **Zone ID:** 1108abb21ad72aca86db5e0fcdd389ea
- **Nameservers:** ben.ns.cloudflare.com, pola.ns.cloudflare.com
- cultivee.com.br → proxied
- app.cultivee.com.br → DNS only
- hidro.cultivee.com.br → DNS only

### VPS secundario (NAO usar para Cultivee)
- **IP:** 129.121.51.237 (porta 22022) - Moodle EAD

### Git
- user.name: Mardoqueu Costa
- user.email: mardo.abc@gmail.com

### Arduino CLI
- Path: `C:/Users/user/arduino-cli/arduino-cli.exe`

### WiFi de teste
- Rede: Mardo-Dri
- Senha: mardodri1609

## Checklist de Mudancas

### Se alterar o Hidro (firmware-ctrl/ ou server-ctrl/):
1. Verificar se a mudanca impacta mais de um componente (firmware, API, app)
2. Se impacta firmware: verificar config.h, compilar e gravar via COM7
3. Se impacta servidor/app: `bash deploy.sh server-ctrl`
4. Testar no celular (com internet + rede Cultivee-Hidro)

### Se alterar o Hidro-cam (firmware-hidro-cam/ ou server-hidro-cam/):
1. Verificar se a mudanca impacta mais de um componente (firmware, API, app)
2. Se impacta firmware: verificar config.h, compilar e gravar (porta COM a definir)
3. Se impacta servidor/app: `bash deploy.sh hidro-cam`
4. Testar no celular (com internet + rede Cultivee-HidroCam)

### Se alterar o Cam (firmware-cam/ ou server/):
1. Se impacta firmware: verificar config.h, compilar e gravar via COM9
2. Se impacta servidor/app: `bash deploy.sh server`

### Se alterar o site/:
1. Testar localmente (npm run dev)
2. `bash deploy.sh site`

### Se alterar docker-compose.yml:
1. Editar no REPOSITORIO (nunca no servidor)
2. `bash deploy.sh` (qualquer variante envia o docker-compose.yml)
