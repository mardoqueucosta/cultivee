"""
Cultivee — Blueprint Camera
Rotas de captura: enfileirar captura, upload push, live frame, servir imagem.
Registrado com url_prefix dinamico (ex: /api/hidro-cam).
"""

import os
import json
import pathlib
import logging
import threading
import time
from datetime import datetime

from flask import Blueprint, request, jsonify, Response

import models

log = logging.getLogger(__name__)

cam_bp = Blueprint("cam", __name__)

CAPTURE_DIR = pathlib.Path(os.environ.get("DATA_DIR", "data")) / "captures"
LIVE_DIR = pathlib.Path(os.environ.get("DATA_DIR", "data")) / "live"

# In-memory live frame buffer (thread-safe)
_live_frames = {}  # chip_id -> {"data": bytes, "ts": float}
_live_lock = threading.Lock()


def _get_cam_module_or_404(chip_id):
    """Helper: retorna modulo se pertence ao usuario autenticado e tem capability cam."""
    module = models.get_module_by_chip_id(chip_id)
    if not module or module.get("user_id") != request.user["id"]:
        return None
    try:
        caps = json.loads(module.get("capabilities", "[]"))
    except (json.JSONDecodeError, TypeError):
        caps = []
    if "cam" not in caps:
        return None
    return module


# =====================================================================
# Camera routes — montadas no prefix configurado
# =====================================================================

@cam_bp.route("/<chip_id>/capture")
def capture(chip_id):
    """Enfileira comando de captura — ESP32 vai tirar foto e enviar via push."""
    from app import require_auth_func
    user = require_auth_func()
    if not user:
        return jsonify({"error": "Nao autenticado"}), 401
    request.user = user

    module = _get_cam_module_or_404(chip_id)
    if not module:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    models.add_pending_command(chip_id, "capture")
    models.mark_activity(chip_id)
    return jsonify({"status": "queued"})


@cam_bp.route("/<chip_id>/upload-capture", methods=["POST"])
def upload_capture(chip_id):
    """ESP32 envia foto capturada (push). Sem auth mas valida chip_id + capability."""
    module = models.get_module_by_chip_id(chip_id)
    if not module:
        return jsonify({"error": "Modulo nao encontrado"}), 404
    try:
        caps = json.loads(module.get("capabilities", "[]"))
    except (json.JSONDecodeError, TypeError):
        caps = []
    if "cam" not in caps:
        return jsonify({"error": "Modulo sem capability cam"}), 403

    img_data = request.get_data()
    if not img_data or len(img_data) < 100:
        return jsonify({"error": "Imagem vazia"}), 400

    save_dir = CAPTURE_DIR / chip_id
    save_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}.jpg"
    (save_dir / filename).write_bytes(img_data)

    log.info(f"Capture push [{chip_id[:4]}]: {filename} ({len(img_data)/1024:.1f} KB)")
    return jsonify({"status": "ok"})


@cam_bp.route("/<chip_id>/image/<filename>")
def image(chip_id, filename):
    """Serve imagem capturada."""
    from app import require_auth_func
    user = require_auth_func()
    if not user:
        return jsonify({"error": "Nao autenticado"}), 401
    request.user = user

    module = _get_cam_module_or_404(chip_id)
    if not module:
        return jsonify({"error": "Nao autorizado"}), 403

    filepath = CAPTURE_DIR / chip_id / filename
    if not filepath.exists() or not filepath.is_file():
        return jsonify({"error": "Imagem nao encontrada"}), 404

    return Response(
        filepath.read_bytes(),
        mimetype="image/jpeg",
        headers={"Cache-Control": "no-cache, no-store"}
    )


@cam_bp.route("/<chip_id>/start-live")
def start_live(chip_id):
    """Enfileira comando start-live — ESP32 vai começar a enviar frames."""
    from app import require_auth_func
    user = require_auth_func()
    if not user:
        return jsonify({"error": "Nao autenticado"}), 401
    request.user = user

    module = _get_cam_module_or_404(chip_id)
    if not module:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    models.add_pending_command(chip_id, "start-live")
    models.mark_activity(chip_id)
    return jsonify({"status": "queued"})


@cam_bp.route("/<chip_id>/stop-live")
def stop_live(chip_id):
    """Enfileira comando stop-live — ESP32 para de enviar frames."""
    from app import require_auth_func
    user = require_auth_func()
    if not user:
        return jsonify({"error": "Nao autenticado"}), 401
    request.user = user

    module = _get_cam_module_or_404(chip_id)
    if not module:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    models.add_pending_command(chip_id, "stop-live")
    models.mark_activity(chip_id)

    # Limpa frame em memoria
    with _live_lock:
        _live_frames.pop(chip_id, None)

    return jsonify({"status": "queued"})


@cam_bp.route("/<chip_id>/live-frame", methods=["GET", "POST"])
def live_frame(chip_id):
    """POST: ESP32 envia frame live. GET: PWA busca ultimo frame (long-poll)."""
    if request.method == "POST":
        # ESP32 push — sem auth, mas valida chip_id + capability
        module = models.get_module_by_chip_id(chip_id)
        if not module:
            return jsonify({"error": "Modulo nao encontrado"}), 404
        try:
            caps = json.loads(module.get("capabilities", "[]"))
        except (json.JSONDecodeError, TypeError):
            caps = []
        if "cam" not in caps:
            return jsonify({"error": "Modulo sem capability cam"}), 403

        img_data = request.get_data()
        if not img_data or len(img_data) < 100:
            return jsonify({"error": "Frame vazio"}), 400

        with _live_lock:
            _live_frames[chip_id] = {"data": img_data, "ts": time.time()}

        return jsonify({"status": "ok"})

    # GET — PWA busca frame (resposta imediata, sem bloquear worker)
    from app import require_auth_func
    user = require_auth_func()
    if not user:
        return jsonify({"error": "Nao autenticado"}), 401
    request.user = user

    module = _get_cam_module_or_404(chip_id)
    if not module:
        return jsonify({"error": "Nao autorizado"}), 403

    last_ts = float(request.args.get("after", 0))

    with _live_lock:
        frame = _live_frames.get(chip_id)

    if frame and frame["ts"] > last_ts and (time.time() - frame["ts"]) < 10:
        return Response(
            frame["data"],
            mimetype="image/jpeg",
            headers={
                "Cache-Control": "no-cache, no-store",
                "X-Frame-Ts": str(frame["ts"]),
            }
        )

    # Sem frame novo — retorna 204 imediatamente
    return "", 204


@cam_bp.route("/<chip_id>/last-capture")
def last_capture(chip_id):
    """Retorna URL da ultima imagem capturada."""
    from app import require_auth_func
    user = require_auth_func()
    if not user:
        return jsonify({"error": "Nao autenticado"}), 401
    request.user = user

    module = _get_cam_module_or_404(chip_id)
    if not module:
        return jsonify({"error": "Modulo nao encontrado"}), 404

    cap_dir = CAPTURE_DIR / chip_id
    if not cap_dir.exists():
        return jsonify({"status": "empty"})

    files = sorted(cap_dir.glob("*.jpg"), reverse=True)
    if not files:
        return jsonify({"status": "empty"})

    # Monta URL usando o tipo do modulo para determinar o prefixo
    mod_type = module.get("type", "cam")
    filename = files[0].name
    return jsonify({
        "status": "ok",
        "url": f"/api/{mod_type}/{chip_id}/image/{filename}",
        "size_kb": round(files[0].stat().st_size / 1024, 1)
    })
