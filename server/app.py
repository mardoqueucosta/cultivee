#!/usr/bin/env python3
"""
Cultivee — Servidor Unificado
Core: auth, modules, dashboard. Blueprints carregados conforme config.

Mesma logica do firmware modular:
  config.py seleciona MODULE_TYPE → blueprints hidro/cam registrados conforme produto.
"""

import os
import json
import logging
from datetime import datetime
from functools import wraps

try:
    from dotenv import load_dotenv
    load_dotenv(override=False)
except ImportError:
    pass

import urllib.request
import urllib.error
from flask import Flask, request, jsonify, send_from_directory, render_template, Response

from config import MODULE_TYPE, PORT, API_PREFIX, MOD_HIDRO, MOD_CAM, PRODUCT_NAME
import models

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static", static_url_path="/static")

models.init_db()
log.info(f"Banco de dados inicializado ({PRODUCT_NAME})")


# =====================================================================
# Auth helpers (exportados para blueprints)
# =====================================================================

def require_auth_func():
    """Retorna usuario autenticado ou None. Usado pelos blueprints."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    else:
        token = request.args.get("token", "")
    if not token:
        return None
    user_id = models.validate_token(token)
    if not user_id:
        return None
    return models.get_user_by_id(user_id)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = require_auth_func()
        if not user:
            return jsonify({"error": "Nao autenticado"}), 401
        request.user = user
        return f(*args, **kwargs)
    return decorated


# =====================================================================
# Auth endpoints
# =====================================================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON invalido"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "")
    name = data.get("name", "").strip()

    if not email or not password or not name:
        return jsonify({"error": "email, password e name obrigatorios"}), 400
    if len(password) < 6:
        return jsonify({"error": "Senha deve ter pelo menos 6 caracteres"}), 400

    user_id = models.create_user(email, password, name)
    if not user_id:
        return jsonify({"error": "Email ja cadastrado"}), 409

    token = models.create_token(user_id)
    return jsonify({"token": token, "user": {"id": user_id, "email": email, "name": name}})


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON invalido"}), 400

    email = data.get("email", "")
    password = data.get("password", "")

    user = models.get_user_by_email(email)
    if not user or not models.check_password(password, user["password_hash"]):
        return jsonify({"error": "Email ou senha invalidos"}), 401

    token = models.create_token(user["id"])
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"]}
    })


@app.route("/api/auth/me")
@require_auth
def me():
    user = request.user
    return jsonify({"id": user["id"], "email": user["email"], "name": user["name"]})


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        models.delete_token(auth[7:])
    return jsonify({"status": "ok"})


# =====================================================================
# Module endpoints (core — todos os produtos)
# =====================================================================

@app.route("/api/modules/register", methods=["POST"])
def register_module():
    """ESP32 chama ao conectar para se registrar."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON invalido"}), 400

    chip_id = data.get("chip_id", "")
    short_id = data.get("short_id", "")
    ip = data.get("ip", "")
    ssid = data.get("ssid", "")
    rssi = data.get("rssi", 0)
    uptime = data.get("uptime", 0)
    free_heap = data.get("free_heap", 0)
    ctrl_data = json.dumps(data.get("ctrl_data", {}))
    capabilities = json.dumps(data.get("capabilities", []))

    if not chip_id:
        return jsonify({"error": "chip_id obrigatorio"}), 400

    models.register_module(chip_id, short_id, ip, ssid, rssi, uptime, free_heap, ctrl_data, capabilities)

    # Busca comandos pendentes
    pending = models.get_pending_commands(chip_id)
    if pending:
        log.info(f"Modulo {short_id}: enviando {len(pending)} comando(s) pendente(s)")

    simple_cmds = []
    for cmd in pending:
        simple = {"cmd": cmd["command"]}
        try:
            params = json.loads(cmd.get("params", "{}"))
            simple.update(params)
        except (json.JSONDecodeError, TypeError):
            pass
        simple_cmds.append(simple)

    poll_interval = models.get_poll_interval(chip_id)

    log.info(f"Modulo registrado: {MODULE_TYPE} {chip_id} ({short_id}) IP={ip} poll={poll_interval}ms")
    return jsonify({"status": "ok", "commands": simple_cmds, "poll_interval": poll_interval})


@app.route("/api/modules/poll")
def poll_commands():
    """Endpoint leve: ESP32 busca comandos pendentes rapidamente."""
    chip_id = request.args.get("chip_id", "")
    if not chip_id:
        return jsonify({"commands": []})

    pending = models.get_pending_commands(chip_id)
    simple_cmds = []
    for cmd in pending:
        simple = {"cmd": cmd["command"]}
        try:
            params = json.loads(cmd.get("params", "{}"))
            simple.update(params)
        except (json.JSONDecodeError, TypeError):
            pass
        simple_cmds.append(simple)

    poll_interval = models.get_poll_interval(chip_id)
    return jsonify({"commands": simple_cmds, "poll_interval": poll_interval})


@app.route("/api/modules/pair", methods=["POST"])
@require_auth
def pair_module():
    data = request.get_json()
    short_id = data.get("short_id", "").upper()
    name = data.get("name", "")

    if not short_id:
        return jsonify({"error": "short_id obrigatorio"}), 400

    module = models.get_module_by_short_id(short_id)
    if not module:
        return jsonify({"error": "Modulo nao encontrado. Verifique se esta ligado."}), 404

    ok, msg = models.pair_module(module["chip_id"], request.user["id"], name)
    if not ok:
        return jsonify({"error": msg}), 400

    return jsonify({"status": "ok", "message": msg, "module": module})


@app.route("/api/modules/unpair", methods=["POST"])
@require_auth
def unpair_module():
    data = request.get_json()
    chip_id = data.get("chip_id", "")
    models.unpair_module(chip_id, request.user["id"])
    return jsonify({"status": "ok"})


@app.route("/api/modules")
@require_auth
def list_modules():
    modules = models.get_user_modules(request.user["id"])

    now = datetime.now()
    for m in modules:
        if m.get("last_seen"):
            last = datetime.fromisoformat(m["last_seen"])
            m["online"] = (now - last).total_seconds() < 120
        else:
            m["online"] = False
        try:
            m["ctrl_data"] = json.loads(m.get("ctrl_data", "{}"))
        except (json.JSONDecodeError, TypeError):
            m["ctrl_data"] = {}

    return jsonify({"modules": modules})


# =====================================================================
# Registro condicional de blueprints (espelha firmware #ifdef)
# =====================================================================

if MOD_HIDRO:
    from bp_hidro import hidro_bp
    app.register_blueprint(hidro_bp, url_prefix=API_PREFIX)
    log.info(f"  [+] mod_hidro registrado em {API_PREFIX}/<chip_id>/...")

if MOD_CAM:
    from bp_cam import cam_bp
    app.register_blueprint(cam_bp, url_prefix=API_PREFIX)
    log.info(f"  [+] mod_cam registrado em {API_PREFIX}/<chip_id>/...")


# =====================================================================
# Config do PWA (injetada no template, espelha firmware products/*.h)
# =====================================================================

PWA_CONFIG = {
    "ctrl": {
        "title": "Cultivee Hidroponia",
        "subtitle": "Hidroponia inteligente",
        "navbar_subtitle": "Hidroponia Inteligente",
        "short_name": "Hidroponia",
        "description": "Controle de hidroponia inteligente",
        "default_name": "Hidroponia",
        "ap_ssid": "Cultivee-Hidro",
        "api_prefix": "/api/ctrl",
        "storage_prefix": "cultivee_ctrl",
        "cache_prefix": "cultivee-ctrl",
        "camera_enabled": False,
    },
    "hidro-cam": {
        "title": "Cultivee HidroCam",
        "subtitle": "HidroCam inteligente",
        "navbar_subtitle": "HidroCam Inteligente",
        "short_name": "HidroCam",
        "description": "Controle de hidro-cam inteligente",
        "default_name": "HidroCam",
        "ap_ssid": "Cultivee-HidroCam",
        "api_prefix": "/api/hidro-cam",
        "storage_prefix": "cultivee_hidro_cam",
        "cache_prefix": "cultivee-hidro-cam",
        "camera_enabled": True,
    },
    "cam": {
        "title": "Cultivee Camera",
        "subtitle": "Camera inteligente",
        "navbar_subtitle": "Camera Inteligente",
        "short_name": "Camera",
        "description": "Camera de monitoramento inteligente",
        "default_name": "Camera",
        "ap_ssid": "Cultivee-Cam",
        "api_prefix": "/api/cam",
        "storage_prefix": "cultivee_cam",
        "cache_prefix": "cultivee-cam",
        "camera_enabled": True,
    },
}

pwa_cfg = PWA_CONFIG.get(MODULE_TYPE, PWA_CONFIG["ctrl"])


# =====================================================================
# Dashboard / PWA (template dinamico com config injetada)
# =====================================================================

@app.route("/")
def dashboard():
    return render_template("index.html", config=pwa_cfg)


@app.route("/manifest.json")
def manifest():
    """Manifest dinamico — nome do produto vem da config."""
    data = json.dumps({
        "name": pwa_cfg["title"],
        "short_name": pwa_cfg["short_name"],
        "description": pwa_cfg["description"],
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0f1923",
        "theme_color": "#0f1923",
        "orientation": "portrait",
        "icons": [
            {"src": "/static/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
            {"src": "/static/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
        ]
    }, indent=2)
    return Response(data, mimetype="application/json",
                    headers={"Cache-Control": "no-cache, must-revalidate"})


@app.route("/sw.js")
def service_worker():
    """Service Worker dinamico — cache name usa prefix do produto."""
    sw_js = f"""const APP_VERSION = '1.0.2';
const CACHE_NAME = '{pwa_cfg["cache_prefix"]}-v' + APP_VERSION;
const STATIC_ASSETS = [
    '/',
    '/static/style.css',
    '/static/app.js',
    '/static/icon-192.png',
    '/static/icon-512.png',
    '/manifest.json'
];

self.addEventListener('install', (event) => {{
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {{
            return cache.addAll(STATIC_ASSETS);
        }})
    );
}});

self.addEventListener('activate', (event) => {{
    event.waitUntil(
        caches.keys().then((keys) => {{
            const oldKeys = keys.filter(k => k.startsWith('{pwa_cfg["cache_prefix"]}-') && k !== CACHE_NAME);
            if (oldKeys.length > 0) {{
                self.clients.matchAll().then(clients => {{
                    clients.forEach(client => {{
                        client.postMessage({{ type: 'APP_UPDATED', version: APP_VERSION }});
                    }});
                }});
            }}
            return Promise.all(oldKeys.map(k => caches.delete(k)));
        }})
    );
}});

self.addEventListener('fetch', (event) => {{
    if (event.request.url.includes('/api/')) return;
    event.respondWith(
        fetch(event.request)
            .then((response) => {{
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {{
                    cache.put(event.request, clone);
                }});
                return response;
            }})
            .catch(() => {{
                return caches.match(event.request);
            }})
    );
}});

self.addEventListener('message', (event) => {{
    if (event.data === 'SKIP_WAITING') {{
        self.skipWaiting();
    }}
}});
"""
    return Response(sw_js, mimetype="application/javascript",
                    headers={
                        "Service-Worker-Allowed": "/",
                        "Cache-Control": "no-cache, no-store, must-revalidate"
                    })


@app.after_request
def add_no_cache_for_static(response):
    if request.path.startswith('/static/') or request.path == '/':
        response.headers['Cache-Control'] = 'no-cache, must-revalidate, max-age=0'
    return response


# =====================================================================
# Main
# =====================================================================

if __name__ == "__main__":
    log.info(f"{PRODUCT_NAME} Server: http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
