#!/bin/bash
# Deploy Cultivee para VPS
# Uso: bash deploy.sh [ctrl|hidro-cam|site|all]
#
# Arquitetura modular: ctrl e hidro-cam usam o mesmo codigo (server/)
# com env vars diferentes no docker-compose.yml.

set -e

VPS_HOST="129.121.50.168"
VPS_PORT="22022"
VPS_USER="root"
SSH_KEY="D:/01-projetos-claude/.credentials/id_rsa"
REMOTE_DIR="/opt/sites/cultivee"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

SSH_CMD="ssh -i $SSH_KEY -p $VPS_PORT $VPS_USER@$VPS_HOST"
SCP_CMD="scp -i $SSH_KEY -P $VPS_PORT"

COMPONENT="${1:-all}"

echo "=== Deploy Cultivee ($COMPONENT) ==="

# Sempre enviar docker-compose.yml (fonte da verdade)
echo "-> Enviando docker-compose.yml..."
$SCP_CMD "$PROJECT_DIR/docker-compose.yml" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/docker-compose.yml"

# ctrl e hidro-cam usam o mesmo server/ — deploy unificado
deploy_server() {
    echo "-> Empacotando server/ (backend unificado)..."
    cd "$PROJECT_DIR"
    tar czf /tmp/cultivee-server.tar.gz \
        --exclude='*.db' \
        --exclude='data/' \
        --exclude='__pycache__/' \
        --exclude='.env' \
        server/app.py server/models.py server/config.py \
        server/bp_hidro.py server/bp_cam.py \
        server/requirements.txt server/Dockerfile \
        server/static/ server/templates/ 2>/dev/null

    echo "-> Enviando server/ para VPS..."
    $SCP_CMD /tmp/cultivee-server.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"
    $SSH_CMD "cd $REMOTE_DIR && tar xzf /tmp/cultivee-server.tar.gz && rm /tmp/cultivee-server.tar.gz"
}

if [ "$COMPONENT" = "ctrl" ] || [ "$COMPONENT" = "server-ctrl" ] || [ "$COMPONENT" = "all" ]; then
    deploy_server
fi

if [ "$COMPONENT" = "hidro-cam" ] || [ "$COMPONENT" = "server-hidro-cam" ] || [ "$COMPONENT" = "all" ]; then
    # So envia se ctrl nao enviou ainda (evita duplicar)
    if [ "$COMPONENT" != "all" ]; then
        deploy_server
    fi
fi

if [ "$COMPONENT" = "site" ] || [ "$COMPONENT" = "all" ]; then
    echo "-> Empacotando site..."
    cd "$PROJECT_DIR"
    tar czf /tmp/cultivee-site.tar.gz \
        --exclude='node_modules/' \
        --exclude='dist/' \
        site/ 2>/dev/null

    echo "-> Enviando site para VPS..."
    $SCP_CMD /tmp/cultivee-site.tar.gz "$VPS_USER@$VPS_HOST:/tmp/"
    $SSH_CMD "cd $REMOTE_DIR && tar xzf /tmp/cultivee-site.tar.gz && rm /tmp/cultivee-site.tar.gz"
fi

echo "-> Reconstruindo containers..."
if [ "$COMPONENT" = "all" ]; then
    $SSH_CMD "cd $REMOTE_DIR && docker compose build --no-cache && docker compose up -d"
else
    # Mapeia componente para nome do servico no docker-compose
    case "$COMPONENT" in
        ctrl|server-ctrl) SVC="ctrl" ;;
        hidro-cam|server-hidro-cam) SVC="hidro-cam" ;;
        site) SVC="site" ;;
        *) SVC="$COMPONENT" ;;
    esac
    $SSH_CMD "cd $REMOTE_DIR && docker compose build --no-cache $SVC && docker compose up -d $SVC"
fi

echo "-> Verificando saude..."
sleep 3
$SSH_CMD "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep cultivee"

echo ""
echo "=== Deploy concluido! ==="
