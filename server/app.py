#!/usr/bin/env python3
"""
Cultivee Server — API + Dashboard PWA
Multi-usuario, pareamento de modulos, captura de imagens, controle GPIO.
"""

import os
import shutil
import threading
import time
import logging
from datetime import datetime
from pathlib import Path
from functools import wraps

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

import urllib.request
import urllib.error
from flask import Flask, request, jsonify, send_from_directory, Response, abort

import models

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static", static_url_path="/static")

DATA_DIR = Path(os.environ.get("DATA_DIR", "./data/images"))
CAPTURE_INTERVAL = int(os.environ.get("CAPTURE_INTERVAL", "60"))

DATA_DIR.mkdir(parents=True, exist_ok=True)

# Inicializa banco de dados (necessario para Gunicorn que nao executa __main__)
models.init_db()
log.info("Banco de dados inicializado")


# =====================================================================
# Auth helpers
# =====================================================================

def get_current_user():
    """Extrai usuario do token Bearer ou query param."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
    else:
        # Fallback: token via query param (para <img src="">)
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
    """ESP32 chama ao conectar para se registrar."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON invalido"}), 400

    chip_id = data.get("chip_id", "")
    short_id = data.get("short_id", "")
    module_type = data.get("type", "")
    ip = data.get("ip", "")
    ssid = data.get("ssid", "")
    rssi = data.get("rssi", 0)
    uptime = data.get("uptime", 0)
    free_heap = data.get("free_heap", 0)

    if not chip_id or not module_type:
        return jsonify({"error": "chip_id e type obrigatorios"}), 400

    models.register_module(chip_id, short_id, module_type, ip, ssid, rssi, uptime, free_heap)
    log.info(f"Modulo registrado: {module_type} {chip_id} ({short_id}) IP={ip} WiFi={ssid} RSSI={rssi}")
    capture_interval = models.get_capture_interval(chip_id)
    recording = models.get_recording(chip_id)
    return jsonify({"status": "ok", "capture_interval": capture_interval, "recording": recording})


@app.route("/api/modules/config", methods=["POST"])
@require_auth
def set_module_config():
    """Usuario altera configuracoes do modulo."""
    data = request.get_json()
    chip_id = data.get("chip_id", "")
    capture_interval = data.get("capture_interval")
    recording = data.get("recording")

    if not chip_id:
        return jsonify({"error": "chip_id obrigatorio"}), 400

    # Verifica se o modulo pertence ao usuario
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado ou sem permissao"}), 403

    if capture_interval is not None:
        capture_interval = max(10, min(86400, int(capture_interval)))  # 10s a 24h
        models.set_capture_interval(chip_id, capture_interval)
        log.info(f"Intervalo de captura alterado: {chip_id} -> {capture_interval}s")

    if recording is not None:
        models.set_recording(chip_id, bool(recording))
        log.info(f"Gravacao {'ativada' if recording else 'desativada'}: {chip_id}")

    return jsonify({"status": "ok", "capture_interval": capture_interval or models.get_capture_interval(chip_id), "recording": models.get_recording(chip_id)})


@app.route("/api/modules/pair", methods=["POST"])
@require_auth
def pair_module():
    """Usuario vincula um modulo pelo short_id."""
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

    # Verifica online/offline (last_seen < 2 min)
    now = datetime.now()
    for m in modules:
        if m.get("last_seen"):
            last = datetime.fromisoformat(m["last_seen"])
            m["online"] = (now - last).total_seconds() < 120
        else:
            m["online"] = False
        m["capture_interval"] = models.get_capture_interval(m["chip_id"])
        m["recording"] = models.get_recording(m["chip_id"])

    return jsonify({"modules": modules})


# =====================================================================
# Image endpoints
# =====================================================================

def get_user_image_dir(user_id):
    return DATA_DIR / str(user_id)


@app.route("/api/images")
@require_auth
def list_images():
    user_dir = get_user_image_dir(request.user["id"])
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    all_images = []

    if user_dir.exists():
        for day_dir in sorted(user_dir.iterdir(), reverse=True):
            if not day_dir.is_dir():
                continue
            date_str = day_dir.name
            for img in sorted(day_dir.iterdir(), reverse=True):
                if img.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                    all_images.append({
                        "filename": f"{date_str}/{img.name}",
                        "date": date_str,
                        "time": img.name.replace("-", ":").rsplit(".", 1)[0],
                        "size_kb": round(img.stat().st_size / 1024, 1),
                    })

    total = len(all_images)
    start = (page - 1) * per_page
    end = start + per_page

    return jsonify({
        "images": all_images[start:end],
        "total": total,
        "page": page,
        "pages": max(1, (total + per_page - 1) // per_page),
    })


@app.route("/api/images/<path:filename>")
@require_auth
def serve_image(filename):
    user_dir = get_user_image_dir(request.user["id"])
    filepath = user_dir / filename
    if not filepath.exists() or not filepath.is_file():
        abort(404)
    if not filepath.resolve().is_relative_to(user_dir.resolve()):
        abort(403)
    return send_from_directory(str(filepath.parent), filepath.name)


@app.route("/api/images/<path:filename>", methods=["DELETE"])
@require_auth
def delete_image(filename):
    user_dir = get_user_image_dir(request.user["id"])
    filepath = user_dir / filename
    if not filepath.exists():
        abort(404)
    if not filepath.resolve().is_relative_to(user_dir.resolve()):
        abort(403)
    filepath.unlink()
    return jsonify({"status": "ok", "deleted": filename})


# =====================================================================
# Upload (push from ESP32)
# =====================================================================

@app.route("/api/modules/live", methods=["POST"])
def live_frame():
    """ESP32 envia frame ao vivo (sobrescreve, nao salva historico)."""
    chip_id = request.args.get("chip_id", "")
    if not chip_id:
        return jsonify({"error": "chip_id obrigatorio"}), 400

    img_data = request.get_data()
    if not img_data or len(img_data) < 100:
        return "", 204

    latest_dir = DATA_DIR / "live"
    latest_dir.mkdir(parents=True, exist_ok=True)
    (latest_dir / f"{chip_id}.jpg").write_bytes(img_data)

    # Atualiza last_seen
    conn = models.get_db()
    conn.execute(
        "UPDATE modules SET last_seen = ? WHERE chip_id = ?",
        (datetime.now().isoformat(), chip_id)
    )
    conn.commit()
    conn.close()

    return "", 204


@app.route("/api/modules/upload", methods=["POST"])
def upload_image():
    """ESP32 envia imagem para salvar no historico."""
    chip_id = request.form.get("chip_id", "") or request.args.get("chip_id", "")
    if not chip_id:
        return jsonify({"error": "chip_id obrigatorio"}), 400

    module = models.get_module_by_chip_id(chip_id)
    if not module:
        return jsonify({"error": "Modulo nao registrado"}), 404

    if not module.get("user_id"):
        return jsonify({"error": "Modulo nao pareado"}), 400

    # Verifica se gravacao esta ativa
    if not models.get_recording(chip_id):
        return jsonify({"status": "skipped", "reason": "recording off"}), 200

    # Aceita imagem via file upload ou raw body
    if "image" in request.files:
        img_data = request.files["image"].read()
    else:
        img_data = request.get_data()

    if not img_data or len(img_data) < 100:
        return jsonify({"error": "Imagem vazia ou invalida"}), 400

    user_dir = get_user_image_dir(module["user_id"])
    today = datetime.now().strftime("%Y-%m-%d")
    save_dir = user_dir / today
    save_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%H-%M-%S")
    filepath = save_dir / f"{timestamp}.jpg"
    filepath.write_bytes(img_data)

    # Atualiza last_seen e IP
    ip = request.remote_addr or ""
    conn = models.get_db()
    conn.execute(
        "UPDATE modules SET last_seen = ?, ip = ? WHERE chip_id = ?",
        (datetime.now().isoformat(), ip, chip_id)
    )
    conn.commit()
    conn.close()

    size_kb = len(img_data) / 1024
    log.info(f"Upload [{module.get('short_id', chip_id)}]: {today}/{timestamp}.jpg ({size_kb:.1f} KB)")
    return jsonify({"status": "ok", "file": f"{today}/{timestamp}.jpg", "size_kb": round(size_kb, 1)})


# =====================================================================
# Live proxy
# =====================================================================

@app.route("/api/live/<chip_id>")
@require_auth
def proxy_live(chip_id):
    """Serve a ultima imagem enviada pelo modulo (push)."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404
    if module.get("type") != "cam":
        return jsonify({"error": "Modulo nao e camera"}), 400

    latest = DATA_DIR / "live" / f"{chip_id}.jpg"
    if not latest.exists():
        return jsonify({"error": "Nenhuma imagem disponivel"}), 404

    return Response(
        latest.read_bytes(),
        mimetype="image/jpeg",
        headers={"Cache-Control": "no-cache, no-store"},
    )


# =====================================================================
# GPIO proxy
# =====================================================================

@app.route("/api/gpio/<chip_id>")
@require_auth
def proxy_gpio(chip_id):
    """Proxy de controle GPIO para modulo ctrl do usuario."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return jsonify({"error": "Modulo nao encontrado"}), 404
    if module.get("type") != "ctrl":
        return jsonify({"error": "Modulo nao e controle"}), 400

    name = request.args.get("name", "")
    action = request.args.get("action", "toggle")

    try:
        url = f"http://{module['ip']}/gpio?name={name}&action={action}"
        resp = urllib.request.urlopen(url, timeout=5)
        data = resp.read()
        return Response(data, mimetype="application/json")
    except Exception:
        return jsonify({"error": "Modulo indisponivel"}), 503


# =====================================================================
# Status
# =====================================================================

@app.route("/api/status")
@require_auth
def status():
    user_dir = get_user_image_dir(request.user["id"])
    total_images = 0
    total_size = 0

    if user_dir.exists():
        for day_dir in user_dir.iterdir():
            if not day_dir.is_dir():
                continue
            for img in day_dir.iterdir():
                if img.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                    total_images += 1
                    total_size += img.stat().st_size

    modules = models.get_user_modules(request.user["id"])

    return jsonify({
        "total_images": total_images,
        "total_size_mb": round(total_size / (1024 * 1024), 1),
        "modules": len(modules),
    })


# =====================================================================
# Capture thread
# =====================================================================

def capture_thread():
    """Periodicamente busca imagens de todas as cameras registradas."""
    log.info(f"Capture thread: every {CAPTURE_INTERVAL}s")
    time.sleep(10)

    while True:
        try:
            conn = models.get_db()
            cams = conn.execute(
                "SELECT * FROM modules WHERE type = 'cam' AND user_id IS NOT NULL AND ip != ''"
            ).fetchall()
            conn.close()

            for cam in cams:
                try:
                    resp = urllib.request.urlopen(f"http://{cam['ip']}/capture", timeout=10)
                    content = resp.read()
                    if resp.status == 200 and len(content) > 0:
                        user_dir = get_user_image_dir(cam["user_id"])
                        today = datetime.now().strftime("%Y-%m-%d")
                        save_dir = user_dir / today
                        save_dir.mkdir(parents=True, exist_ok=True)

                        timestamp = datetime.now().strftime("%H-%M-%S")
                        filepath = save_dir / f"{timestamp}.jpg"
                        filepath.write_bytes(content)

                        size_kb = len(content) / 1024
                        log.info(f"Captura [{cam['short_id']}]: {today}/{timestamp}.jpg ({size_kb:.1f} KB)")

                        # Atualiza last_seen
                        conn2 = models.get_db()
                        conn2.execute(
                            "UPDATE modules SET last_seen = ? WHERE chip_id = ?",
                            (datetime.now().isoformat(), cam["chip_id"])
                        )
                        conn2.commit()
                        conn2.close()
                except Exception as e:
                    log.warning(f"Erro captura [{cam['short_id']}]: {e}")

        except Exception as e:
            log.error(f"Capture thread error: {e}")

        time.sleep(CAPTURE_INTERVAL)


# =====================================================================
# Dashboard
# =====================================================================

@app.route("/")
def dashboard():
    return send_from_directory("static", "index.html")

@app.route("/sw.js")
def service_worker():
    """Service Worker precisa ser servido na raiz para escopo correto"""
    response = send_from_directory("static", "sw.js")
    response.headers['Service-Worker-Allowed'] = '/'
    response.headers['Content-Type'] = 'application/javascript'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.after_request
def add_no_cache_for_static(response):
    """Evitar cache agressivo dos arquivos estaticos para PWA atualizar"""
    if request.path.startswith('/static/') or request.path == '/':
        response.headers['Cache-Control'] = 'no-cache, must-revalidate, max-age=0'
    return response


# =====================================================================
# Main
# =====================================================================

if __name__ == "__main__":
    models.init_db()
    log.info("Banco de dados inicializado")

    t = threading.Thread(target=capture_thread, daemon=True)
    t.start()

    log.info(f"Cultivee Server: http://localhost:5000")
    log.info(f"Intervalo de captura: {CAPTURE_INTERVAL}s")
    app.run(host="0.0.0.0", port=5000, debug=False)
