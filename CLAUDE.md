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

**IMPORTANTE:** O `docker-compose.yml` no repositório é a fonte da verdade.
Nunca editar o docker-compose.yml diretamente no servidor — sempre editar no repo e fazer deploy.

Quando o usuário pedir "faça o deploy" ou "deploy":
1. `git add` arquivos alterados
2. `git commit` com mensagem descritiva
3. `git push origin main`
4. Executar o script de deploy:
   ```bash
   bash D:/01-projetos-claude/cultivee/deploy.sh          # deploy completo
   bash D:/01-projetos-claude/cultivee/deploy.sh server    # só o server/app
   bash D:/01-projetos-claude/cultivee/deploy.sh site      # só o site
   ```

O script deploy.sh:
- Sempre envia o docker-compose.yml atualizado (evita inconsistências)
- Empacota os arquivos (excluindo node_modules, dist, data, *.db)
- Envia via SCP e extrai no servidor
- Reconstroi containers Docker
- Verifica saúde dos containers

### Configuração Docker (NÃO alterar sem atualizar o repo)
- `DB_PATH=/app/data/cultivee.db` (dentro do volume cultivee-data)
- `DATA_DIR=/app/data/images` (dentro do volume cultivee-data)
- Volume `cultivee-data` montado em `/app/data` (persiste DB + imagens)

## SSH
```bash
ssh -i "D:/01-projetos-claude/id_rsa" -p 22022 root@129.121.50.168
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
- ESP32-CAM envia imagens para o servidor (push architecture)
- Live: frame cada 3s (VGA, sem salvar, sobrescreve latest.jpg)
- Captura: imagem a cada N segundos (configurável no app, salva no histórico)
- WiFi Manager com portal cativo para setup
- Multi-usuario com pareamento por chip_id (MAC)
- Auto-registro do ESP32 no servidor a cada 30s
- Botão reset WiFi no GPIO13 (pressionar 3s)

## Ambiente local vs produção
- `firmware-cam/config.h`: define SERVER_URL e APP_URL
- Para testar localmente: `#define ENV_LOCAL`
- Para produção: `#define ENV_PRODUCTION`
- APP_URL (link para o usuário) é sempre app.cultivee.com.br
- SERVER_URL muda conforme ambiente (localhost vs app.cultivee.com.br)
