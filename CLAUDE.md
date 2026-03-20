# Cultivee - Sistema IoT de Monitoramento

## Projeto
Monorepo com 4 componentes:
- **site/** - Landing page cultivee.com.br (React + Vite + shadcn/ui)
- **server/** - Dashboard PWA app.cultivee.com.br (Flask + SQLite)
- **firmware-cam/** - ESP32-CAM (captura de imagens)
- **firmware-ctrl/** - ESP32-WROOM (controle LEDs/bombas, futuro)

## Repositório
- Repo: https://github.com/mardoqueucosta/cultivee (branch: main)
- Domínio site: https://cultivee.com.br
- Domínio app: https://app.cultivee.com.br

## Deploy
O deploy é feito no VPS HostGator (129.121.50.168) via Docker + Traefik.

Quando o usuário pedir "faça o deploy" ou "deploy":
1. `git add .` (exceto .env, node_modules, data/, *.db)
2. `git commit` com mensagem descritiva
3. `git push origin main`
4. Conectar via SSH e rebuild:
   ```bash
   ssh -i "D:/01-projetos-claude/id_rsa" -p 22022 root@129.121.50.168
   cd /opt/sites/cultivee
   # Enviar arquivos atualizados via tar/scp
   docker compose up -d --build
   ```

## Git Config (este repo)
- user.name: Mardoqueu Costa
- user.email: mardo.abc@gmail.com

## Infraestrutura
- **VPS:** Ubuntu 24.04, Docker, Traefik (proxy reverso + SSL)
- **DNS:** Cloudflare (cultivee.com.br proxied, app.cultivee.com.br DNS only)
- **SSL site:** Cloudflare (Full mode)
- **SSL app:** Let's Encrypt via Traefik

## Arquitetura IoT
- ESP32-CAM captura imagens, serve via HTTP
- Servidor puxa imagens do ESP32 (pull architecture)
- WiFi Manager com portal cativo para setup
- Multi-usuario com pareamento por chip_id (MAC)
- Auto-registro do ESP32 no servidor a cada 30s
