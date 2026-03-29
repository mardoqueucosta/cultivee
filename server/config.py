"""
Cultivee Server — Configuracao de produto
Espelha a logica do firmware: env vars selecionam quais modulos ativar.

Produtos disponiveis (MODULE_TYPE):
  ctrl      = Hidroponia apenas (ESP32-WROOM)
  hidro-cam = Hidroponia + Camera (ESP32-WROVER)
  cam       = Camera apenas (futuro)
"""

import os

# Diretorio base do servidor (onde este arquivo esta)
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Selecao de produto (equivalente a products/hidro.h no firmware) ---
MODULE_TYPE = os.environ.get("MODULE_TYPE", "ctrl")
PORT = int(os.environ.get("PORT", "5002"))
API_PREFIX = os.environ.get("API_PREFIX", "/api/ctrl")

# DB_PATH: se relativo, resolve a partir do diretorio do servidor
_db = os.environ.get("DB_PATH", "data/cultivee.db")
DB_PATH = _db if os.path.isabs(_db) else os.path.join(_BASE_DIR, _db)

# Modulos ativos (derivado do MODULE_TYPE)
MOD_HIDRO = MODULE_TYPE in ("ctrl", "hidro-cam")
MOD_CAM = MODULE_TYPE in ("cam", "hidro-cam")

# Nome do produto (para logs)
PRODUCT_NAME = {
    "ctrl": "Cultivee Hidroponia",
    "hidro-cam": "Cultivee HidroCam",
    "cam": "Cultivee Camera",
}.get(MODULE_TYPE, "Cultivee")
