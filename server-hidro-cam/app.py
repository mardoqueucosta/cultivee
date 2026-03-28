#!/usr/bin/env python3
"""
Cultivee HidroCam — API + Dashboard PWA
Servidor independente para controle de modulos ESP32 HidroCam (reles, fases, ciclo + camera).
"""

import os
import json
import logging
from datetime import datetime
from functools import wraps

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

import urllib.request
import urllib.error
from flask import Flask, request, jsonify, send_from_directory, Response

import models

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static", static_url_path="/static")

models.init_db()
log.info("Banco de dados inicializado")


# =====================================================================
# Auth helpers
# =====================================================================

def get_current_user():
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
        user = get_current_user()
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
# Module endpoints
# =====================================================================

@app.route("/api/modules/register", methods=["POST"])
def register_module():
    """ESP32-WROOM chama ao conectar para se registrar."""
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

    if not chip_id:
        return jsonify({"error": "chip_id obrigatorio"}), 400

    models.register_module(chip_id, short_id, ip, ssid, rssi, uptime, free_heap, ctrl_data)

    # Busca comandos pendentes para este modulo
    pending = models.get_pending_commands(chip_id)
    if pending:
        log.info(f"Modulo {short_id}: enviando {len(pending)} comando(s) pendente(s)")

    # Simplifica comandos para o ESP32 parsear facilmente
    simple_cmds = []
    for cmd in pending:
        simple = {"cmd": cmd["command"]}
        try:
            params = json.loads(cmd.get("params", "{}"))
            simple.update(params)
        except (json.JSONDecodeError, TypeError):
            pass
        simple_cmds.append(simple)

    # Polling adaptativo
    poll_interval = models.get_poll_interval(chip_id)

    log.info(f"Modulo registrado: ctrl {chip_id} ({short_id}) IP={ip} poll={poll_interval}ms")
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
        # Parse ctrl_data JSON
        try:
            m["ctrl_data"] = json.loads(m.get("ctrl_data", "{}"))
        except (json.JSONDecodeError, TypeError):
            m["ctrl_data"] = {}

    return jsonify({"modules": modules})


# =====================================================================
# Ctrl proxy endpoints
# =====================================================================

@app.route("/api/hidro-cam/<chip_id>/status")
@require_auth
def ctrl_status(chip_id):
    """Retorna ultimo status salvo do modulo ctrl."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    now = datetime.now()
    online = False
    if module.get("last_seen"):
        last = datetime.fromisoformat(module["last_seen"])
        online = (now - last).total_seconds() < 120

    try:
        ctrl_data = json.loads(module.get("ctrl_data", "{}"))
    except (json.JSONDecodeError, TypeError):
        ctrl_data = {}

    return jsonify({
        "online": online,
        "ip": module.get("ip", ""),
        "ssid": module.get("ssid", ""),
        "rssi": module.get("rssi", 0),
        "uptime": module.get("uptime", 0),
        "last_seen": module.get("last_seen", ""),
        **ctrl_data
    })


@app.route("/api/hidro-cam/<chip_id>/relay")
@require_auth
def ctrl_relay(chip_id):
    """Controle de rele: proxy direto ou fila de comandos."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    device = request.args.get("device", "")
    action = request.args.get("action", "toggle")

    # Enfileira comando + tenta proxy direto em paralelo (nao bloqueia)
    params = json.dumps({"device": device, "action": action})
    models.add_pending_command(chip_id, "relay", params)

    # Tenta proxy direto em background (funciona em rede local)
    if module.get("ip"):
        try:
            url = f"http://{module['ip']}/relay?device={device}&action={action}"
            urllib.request.urlopen(url, timeout=1)
            # Se proxy funcionou, remove comando da fila (ja executou)
            # Nao precisa - ESP32 ignora comandos duplicados
        except Exception:
            pass
    return jsonify({"status": "queued", "message": "Comando enviado, sera executado em breve"})


@app.route("/api/hidro-cam/<chip_id>/phases")
@require_auth
def ctrl_phases(chip_id):
    """Status completo com fases: proxy direto (local) ou banco (producao)."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    # Tenta proxy direto apenas se ?live=1 (pedido explicitamente)
    if request.args.get("live") and module.get("ip"):
        try:
            url = f"http://{module['ip']}/status"
            resp = urllib.request.urlopen(url, timeout=1)
            data = resp.read()
            return Response(data, mimetype="application/json")
        except Exception:
            pass

    # Retorna dados do ultimo registro no banco (rapido, funciona em qualquer ambiente)
    try:
        ctrl_data = json.loads(module.get("ctrl_data", "{}"))
    except (json.JSONDecodeError, TypeError):
        ctrl_data = {}
    return jsonify(ctrl_data)


@app.route("/api/hidro-cam/<chip_id>/save-config", methods=["POST"])
@require_auth
def ctrl_save_config(chip_id):
    """Salvar config: atualiza banco (instantaneo) + enfileira pro ESP32."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    data = request.get_json()

    # 1. Atualiza ctrl_data no banco (UI ve imediatamente)
    updates = {}
    if "start_date" in data:
        updates["start_date"] = data["start_date"]
    np = int(data.get("num_phases", 0))
    if np > 0:
        phases = []
        for i in range(np):
            phase = {
                "name": data.get(f"n{i}", f"Fase {i+1}"),
                "days": int(data.get(f"d{i}", 0)),
                "pumpOnDay": int(data.get(f"pod{i}", 15)) or 15,
                "pumpOffDay": int(data.get(f"pfd{i}", 15)) or 15,
                "pumpOnNight": int(data.get(f"pon{i}", 15)) or 15,
                "pumpOffNight": int(data.get(f"pfn{i}", 45)) or 45,
            }
            lon = data.get(f"lon{i}", "06:00")
            loff = data.get(f"loff{i}", "18:00")
            if ":" in str(lon):
                parts = str(lon).split(":")
                phase["lightOnHour"] = int(parts[0])
                phase["lightOnMin"] = int(parts[1])
            if ":" in str(loff):
                parts = str(loff).split(":")
                phase["lightOffHour"] = int(parts[0])
                phase["lightOffMin"] = int(parts[1])
            phases.append(phase)
        updates["phases"] = phases
        updates["num_phases"] = np
    if updates:
        models.update_ctrl_data(chip_id, updates)

    # 2. Enfileira comando pro ESP32 sincronizar
    models.add_pending_command(chip_id, "save-config", json.dumps(data))

    # 3. Tenta proxy direto em background (funciona em rede local)
    if module.get("ip"):
        try:
            form_parts = [f"{k}={v}" for k, v in data.items()]
            form_body = "&".join(form_parts).encode()
            req = urllib.request.Request(
                f"http://{module['ip']}/save-config",
                data=form_body, method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            urllib.request.urlopen(req, timeout=1)
        except Exception:
            pass

    return jsonify({"status": "ok"})


@app.route("/api/hidro-cam/<chip_id>/add-phase")
@require_auth
def ctrl_add_phase(chip_id):
    """Adicionar fase: atualiza banco + enfileira pro ESP32."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    # Atualiza banco: adiciona fase padrao ao ctrl_data
    try:
        ctrl = json.loads(module.get("ctrl_data", "{}"))
    except (json.JSONDecodeError, TypeError):
        ctrl = {}
    phases = ctrl.get("phases", [])
    phases.append({
        "name": "Nova Fase", "days": 7,
        "lightOnHour": 6, "lightOnMin": 0, "lightOffHour": 18, "lightOffMin": 0,
        "pumpOnDay": 15, "pumpOffDay": 15, "pumpOnNight": 15, "pumpOffNight": 45
    })
    models.update_ctrl_data(chip_id, {"phases": phases, "num_phases": len(phases)})

    models.add_pending_command(chip_id, "add-phase")
    if module.get("ip"):
        try:
            urllib.request.urlopen(f"http://{module['ip']}/add-phase", timeout=1)
        except Exception:
            pass
    return jsonify({"status": "ok"})


@app.route("/api/hidro-cam/<chip_id>/remove-phase")
@require_auth
def ctrl_remove_phase(chip_id):
    """Remover fase: atualiza banco + enfileira pro ESP32."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404
    idx = int(request.args.get("idx", "0"))

    # Atualiza banco: remove fase do ctrl_data
    try:
        ctrl = json.loads(module.get("ctrl_data", "{}"))
    except (json.JSONDecodeError, TypeError):
        ctrl = {}
    phases = ctrl.get("phases", [])
    if 0 <= idx < len(phases) and len(phases) > 1:
        phases.pop(idx)
        models.update_ctrl_data(chip_id, {"phases": phases, "num_phases": len(phases)})

    models.add_pending_command(chip_id, "remove-phase", json.dumps({"idx": idx}))
    if module.get("ip"):
        try:
            urllib.request.urlopen(f"http://{module['ip']}/remove-phase?idx={idx}", timeout=1)
        except Exception:
            pass
    return jsonify({"status": "ok"})


@app.route("/api/hidro-cam/<chip_id>/reset-phases")
@require_auth
def ctrl_reset_phases(chip_id):
    """Restaurar fases: atualiza banco + enfileira pro ESP32."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    # Atualiza banco: fases padrao
    default_phases = [
        {"name": "Muda", "days": 3, "lightOnHour": 6, "lightOnMin": 0, "lightOffHour": 18, "lightOffMin": 0, "pumpOnDay": 15, "pumpOffDay": 15, "pumpOnNight": 15, "pumpOffNight": 45},
        {"name": "Berçário", "days": 17, "lightOnHour": 6, "lightOnMin": 0, "lightOffHour": 19, "lightOffMin": 0, "pumpOnDay": 15, "pumpOffDay": 15, "pumpOnNight": 15, "pumpOffNight": 45},
        {"name": "Engorda", "days": 0, "lightOnHour": 6, "lightOnMin": 0, "lightOffHour": 20, "lightOffMin": 0, "pumpOnDay": 15, "pumpOffDay": 15, "pumpOnNight": 15, "pumpOffNight": 45}
    ]
    models.update_ctrl_data(chip_id, {"phases": default_phases, "num_phases": 3})

    models.add_pending_command(chip_id, "reset-phases")
    if module.get("ip"):
        try:
            urllib.request.urlopen(f"http://{module['ip']}/reset-phases", timeout=1)
        except Exception:
            pass
    return jsonify({"status": "ok"})


@app.route("/api/hidro-cam/<chip_id>/reset-wifi")
@require_auth
def ctrl_reset_wifi(chip_id):
    """Reset WiFi: proxy direto ou fila."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404
    if module.get("ip"):
        try:
            urllib.request.urlopen(f"http://{module['ip']}/reset-wifi", timeout=1)
            return jsonify({"status": "ok"})
        except Exception:
            pass
    models.add_pending_command(chip_id, "reset-wifi")
    return jsonify({"status": "queued"})


# =====================================================================
# Dashboard
# =====================================================================

@app.route("/")
def dashboard():
    return send_from_directory("static", "index.html")


@app.route("/sw.js")
def service_worker():
    response = send_from_directory("static", "sw.js")
    response.headers['Service-Worker-Allowed'] = '/'
    response.headers['Content-Type'] = 'application/javascript'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response


@app.after_request
def add_no_cache_for_static(response):
    if request.path.startswith('/static/') or request.path == '/':
        response.headers['Cache-Control'] = 'no-cache, must-revalidate, max-age=0'
    return response


# =====================================================================
# Main
# =====================================================================

if __name__ == "__main__":
    models.init_db()
    log.info("Cultivee HidroCam Server: http://localhost:5003")
    app.run(host="0.0.0.0", port=5003, debug=False)
