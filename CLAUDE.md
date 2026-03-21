# Cultivee - Sistema IoT de Monitoramento

## Visao Geral
Sistema completo de monitoramento de plantas via IoT. O usuario conecta um modulo ESP32-CAM ao WiFi, e monitora suas plantas em tempo real pelo celular ou computador.

## Estrutura do Monorepo
```
cultivee/
├── site/               # cultivee.com.br - Landing page (React + Vite + shadcn/ui)
├── server/             # app.cultivee.com.br - Dashboard + API + PWA (Flask + SQLite)
│   ├── app.py          # Rotas da API e dashboard
│   ├── models.py       # Banco de dados SQLite (users, modules, tokens)
│   ├── static/         # Frontend do dashboard (HTML/CSS/JS puro)
│   │   ├── index.html  # SPA do dashboard
│   │   ├── app.js      # Logica do app (auth, modulos, live, carousel, PWA install)
│   │   ├── style.css   # Estilos
│   │   ├── sw.js       # Service Worker (cache offline)
│   │   └── manifest.json # PWA manifest
│   ├── Dockerfile      # Python 3.10 + gunicorn
│   └── requirements.txt
├── firmware-cam/       # ESP32-CAM (captura e envia imagens)
│   ├── firmware-cam.ino # Firmware principal
│   ├── config.h        # Configuracao de ambiente (LOCAL/PRODUCTION)
│   └── ble_setup.h     # BLE setup (desabilitado no ESP32-CAM, pronto para WROVER)
├── firmware-ctrl/      # ESP32-WROOM (controle LEDs/bombas - futuro)
├── docker-compose.yml  # Containers de producao (FONTE DA VERDADE)
├── deploy.sh           # Script de deploy para VPS
└── CLAUDE.md           # ESTE ARQUIVO - referencia completa
```

## URLs e Repositorio
- **Repo:** https://github.com/mardoqueucosta/cultivee (branch: main)
- **Site:** https://cultivee.com.br (landing page)
- **App:** https://app.cultivee.com.br (dashboard PWA)
- **PWA:** O app "para baixar" E o server/ - mesma coisa. Nao existe app nativo separado.

## Git
- user.name: Mardoqueu Costa
- user.email: mardo.abc@gmail.com

## Como Tudo Se Conecta
```
[ESP32-CAM] --HTTP porta 80--> [Traefik] --> [Flask container]
[Navegador] --HTTPS porta 443-> [Traefik] --> [Flask container]
[cultivee.com.br] --HTTPS------> [Traefik] --> [Nginx container (site)]
```

O ESP32 NAO suporta HTTPS (sem RAM). Por isso o Traefik tem DOIS routers para o app:
- `cultivee-app` (entrypoint: websecure/443) - para navegadores
- `cultivee-app-http` (entrypoint: web/80) - para ESP32

## Infraestrutura VPS
- **IP:** 129.121.50.168
- **SSH:** `ssh -i "D:/01-projetos-claude/id_rsa" -p 22022 root@129.121.50.168`
- **SO:** Ubuntu 24.04
- **Stack:** Docker + Traefik (proxy reverso + SSL Let's Encrypt)
- **Traefik config:** /opt/traefik/config/traefik.yml
- **Sites:** /opt/sites/cultivee/

### Docker (NAO alterar sem atualizar o repo)
- `DB_PATH=/app/data/cultivee.db` (dentro do volume cultivee-data)
- `DATA_DIR=/app/data/images` (dentro do volume cultivee-data)
- Volume `cultivee-data` montado em `/app/data` (persiste DB + imagens entre deploys)
- **IMPORTANTE:** docker-compose.yml do REPOSITORIO e a fonte da verdade. NUNCA editar diretamente no servidor.

### Outros servidores no mesmo VPS
- engenhariabiomedica.com (Node.js)
- Outros sites em /opt/sites/

### VPS secundario (NAO usar para Cultivee)
- **IP:** 129.121.51.237 (porta 22022) - Moodle EAD
- **SSH key:** mesma id_rsa

## DNS (Cloudflare)
- **Conta:** mardo.abc@gmail.com
- **Zone ID:** 1108abb21ad72aca86db5e0fcdd389ea
- **API Token:** salvar em local seguro (nao commitar)
- **SSL:** Full mode (Cloudflare -> Traefik com Let's Encrypt)
- **Nameservers:** ben.ns.cloudflare.com, pola.ns.cloudflare.com
- cultivee.com.br -> A record -> 129.121.50.168 (proxied)
- app.cultivee.com.br -> A record -> 129.121.50.168 (DNS only, para Let's Encrypt funcionar)

## Deploy

### Comando de deploy
```bash
bash D:/01-projetos-claude/cultivee/deploy.sh          # deploy completo (site + server)
bash D:/01-projetos-claude/cultivee/deploy.sh server    # so o server/app
bash D:/01-projetos-claude/cultivee/deploy.sh site      # so o site
```

### Fluxo completo de deploy
1. Fazer as alteracoes no codigo
2. `git add` + `git commit` + `git push origin main`
3. `bash deploy.sh [server|site|all]`

O script deploy.sh automaticamente:
- Envia docker-compose.yml atualizado (evita inconsistencias)
- Empacota arquivos (exclui node_modules, dist, data, *.db)
- Envia via SCP e extrai no servidor
- Reconstroi containers Docker
- Verifica saude dos containers

### Erros comuns de deploy
- **404 page not found:** DB_PATH errado. Verificar docker-compose.yml: DB_PATH deve ser `/app/data/cultivee.db`
- **Container reiniciando:** Verificar logs: `docker logs cultivee-app --tail 30`
- **ESP32 nao conecta:** Verificar se router HTTP esta no docker-compose (entrypoint: web)

## Firmware ESP32-CAM

### Hardware atual
- **Placa:** ESP32-CAM AI-Thinker (520KB RAM, 4MB Flash)
- **Sensor:** OV2640 (clone, tom verde/rosa - mitigado com wb_mode=1, saturacao=-1)
- **USB:** CH340 via adaptador, porta COM9
- **Board Arduino:** esp32:esp32:esp32cam

### Hardware futuro planejado
- **ESP32-WROVER-DEV** (8MB PSRAM) - suporta BLE + WiFi + Camera simultaneos

### Compilar e gravar
```bash
# Compilar
"C:/Users/user/arduino-cli/arduino-cli.exe" compile --fqbn esp32:esp32:esp32cam "D:/01-projetos-claude/cultivee/firmware-cam"

# Gravar (COM9)
"C:/Users/user/arduino-cli/arduino-cli.exe" upload --fqbn esp32:esp32:esp32cam -p COM9 "D:/01-projetos-claude/cultivee/firmware-cam"
```

### Ambiente local vs producao (config.h)
```c
// Para testar localmente (ESP32 -> PC):
#define ENV_LOCAL
// #define ENV_PRODUCTION

// Para producao (ESP32 -> VPS):
// #define ENV_LOCAL
#define ENV_PRODUCTION
```

- `SERVER_URL` = onde o ESP32 envia dados (muda conforme ambiente)
- `APP_URL` = link para o usuario (SEMPRE https://app.cultivee.com.br)
- Producao usa HTTP (Traefik faz SSL termination)

### Quando o usuario pedir "rode local" / "teste local":
1. Em config.h: ativar `ENV_LOCAL`, verificar LOCAL_SERVER_IP (rodar `ipconfig`)
2. Compilar e gravar firmware
3. Iniciar servidor Flask local: `python server/app.py` ou preview_start

### Quando o usuario pedir "deploy" / "producao":
1. Em config.h: ativar `ENV_PRODUCTION`
2. Compilar e gravar firmware
3. Commitar e push
4. `bash deploy.sh`

### Funcionalidades do firmware
- **WiFi Manager:** AP aberto "Cultivee-Setup" com portal cativo (DNS redirect)
- **Portal cativo:** Endpoints especificos para Android/iOS/Windows/macOS
- **Auto-registro:** POST a cada 30s em /api/modules/register (chip_id, IP, SSID, RSSI)
- **Live stream:** Envia frame VGA a cada 3s via POST /api/modules/live
- **Captura:** Envia imagem VGA a cada N segundos (configuravel) via POST /api/modules/upload
- **Botao reset WiFi:** GPIO13 pressionado por 3s limpa credenciais e reinicia
- **LED status:** Pisca rapido=Setup, Pulsa=Conectado, 3 piscas=Sem WiFi
- **Camera:** VGA 640x480 fixo, quality 12, 1 frame buffer, vflip+hmirror

### Resolucao da camera
- Atualmente VGA 640x480 (estavel para WiFi fraco)
- UXGA 1600x1200 disponivel mas instavel com WiFi fraco e troca de resolucao causa corrupcao de cor
- Na ESP32-WROVER futura: pode usar UXGA sem problemas

## API do Servidor (Flask)

### Autenticacao
- `POST /api/auth/register` - {name, email, password} -> {token, user}
- `POST /api/auth/login` - {email, password} -> {token, user}
- Token via header `Authorization: Bearer <token>` ou query `?token=<token>`

### Modulos
- `POST /api/modules/register` - ESP32 se registra (chip_id, ip, ssid, rssi)
- `POST /api/modules/pair` - Vincular modulo ao usuario (code, name)
- `POST /api/modules/unpair` - Desvincular modulo
- `GET /api/modules/list` - Listar modulos do usuario
- `GET /api/modules/config?chip_id=X` - Buscar config (capture_interval)
- `POST /api/modules/config` - Salvar config (chip_id, capture_interval)

### Imagens
- `POST /api/modules/upload?chip_id=X` - ESP32 envia imagem (salva no historico)
- `POST /api/modules/live?chip_id=X` - ESP32 envia frame live (sobrescreve latest.jpg)
- `GET /api/live/<chip_id>` - Servir ultimo frame live
- `GET /api/images/<chip_id>` - Listar imagens salvas
- `GET /api/images/<path>` - Servir imagem

### Dashboard
- `GET /` - Pagina principal (SPA)
- `GET /sw.js` - Service Worker (servido na raiz para escopo correto)

## App/PWA (server/static/)

### Funcionalidades
- Login/registro de usuarios
- Card do modulo: status online/offline, SSID, sinal WiFi, uptime, IP
- Quando offline: instrucoes passo a passo para conectar
- Monitoramento ao vivo (atualiza frame a cada 3s)
- Carousel de ultimas capturas com paginacao
- Intervalo de captura configuravel (dropdown: 10s a 1h)
- Modal de setup guiado (wizard 4 passos)
- Banner de instalacao PWA (Android/Chrome nativo, iOS manual)
- Service Worker com cache offline

### Arquivos
- `index.html` - HTML completo (SPA, sem framework)
- `app.js` - Toda logica JS (~800 linhas)
- `style.css` - Estilos (~360 linhas)
- `sw.js` - Service Worker
- `manifest.json` - PWA manifest

## Site (site/)

### Stack
- React 18 + TypeScript
- Vite (build)
- Tailwind CSS + shadcn/ui
- React Router

### Paginas
- Home, Agro, Educa, Tech, Blog, Sobre, Contato

### Navbar
- Links: Home, Cursos (dropdown), Blog, Sobre, Contato
- Botoes: "Meu Painel" (outline) + "Baixar App" (verde) -> ambos linkam para app.cultivee.com.br

### Build e preview local
```bash
cd cultivee/site
npm install
npm run dev    # porta 5173
npm run build  # gera dist/
```

## Problemas Conhecidos e Solucoes

| Problema | Causa | Solucao |
|----------|-------|---------|
| Imagem verde/rosa | Sensor OV2640 clone | wb_mode=1 (Sunny), saturacao=-1 |
| ESP32 nao aparece como AP | Credenciais WiFi antigas salvas | Botao GPIO13 por 3s ou clearWiFiCredentials() |
| Portal cativo nao abre | Android/iOS nao detecta | Melhorados endpoints por SO, fallback: acessar 192.168.4.1 |
| Live lento/falhando | WiFi fraco, distancia do roteador | VGA fixo, quality 12, intervalo 3s |
| 404 apos deploy | DB_PATH errado no docker-compose | DB_PATH=/app/data/cultivee.db (dentro do volume) |
| ESP32 nao registra no VPS | Traefik sem router HTTP | Adicionado cultivee-app-http entrypoint web |
| Troca resolucao = cores corrompidas | Buffer do sensor corrompido | Resolucao VGA fixa, sem trocar em runtime |

## Checklist de Mudancas

### Se alterar o server/ (API, dashboard, estilos):
1. Testar localmente (python app.py ou preview_start)
2. git add + commit + push
3. `bash deploy.sh server`

### Se alterar o site/ (landing page):
1. Testar localmente (npm run dev)
2. git add + commit + push
3. `bash deploy.sh site`

### Se alterar o firmware-cam/:
1. Verificar config.h (ENV_LOCAL ou ENV_PRODUCTION?)
2. Compilar com arduino-cli
3. Gravar via COM9
4. Testar (verificar Serial Monitor se necessario)
5. git add + commit + push (deploy.sh NAO grava firmware)

### Se alterar docker-compose.yml:
1. Editar no REPOSITORIO (nunca no servidor)
2. git add + commit + push
3. `bash deploy.sh` (qualquer variante envia o docker-compose.yml)
