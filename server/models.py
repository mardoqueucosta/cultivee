"""
Cultivee - Modelos do banco de dados (SQLite)
"""

import sqlite3
import hashlib
import secrets
import os
from pathlib import Path
from datetime import datetime, timedelta


DB_PATH = os.environ.get("DB_PATH", "cultivee.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chip_id TEXT UNIQUE NOT NULL,
            short_id TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('cam', 'ctrl')),
            name TEXT DEFAULT '',
            user_id INTEGER,
            ip TEXT DEFAULT '',
            last_seen TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    conn.close()


# --- Password hashing ---

def hash_password(password):
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def check_password(password, password_hash):
    salt, h = password_hash.split(":")
    return hashlib.sha256((salt + password).encode()).hexdigest() == h


# --- Users ---

def create_user(email, password, name):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
            (email.lower().strip(), hash_password(password), name.strip())
        )
        conn.commit()
        user_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None  # Email ja existe


def get_user_by_email(email):
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email.lower().strip(),)
    ).fetchone()
    conn.close()
    return user


def get_user_by_id(user_id):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return user


# --- Tokens ---

def create_token(user_id, days=30):
    token = secrets.token_urlsafe(32)
    expires = (datetime.now() + timedelta(days=days)).isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
        (user_id, token, expires)
    )
    conn.commit()
    conn.close()
    return token


def validate_token(token):
    conn = get_db()
    row = conn.execute(
        "SELECT user_id, expires_at FROM tokens WHERE token = ?", (token,)
    ).fetchone()
    conn.close()

    if not row:
        return None
    if datetime.fromisoformat(row["expires_at"]) < datetime.now():
        return None
    return row["user_id"]


def delete_token(token):
    conn = get_db()
    conn.execute("DELETE FROM tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()


# --- Modules ---

def register_module(chip_id, short_id, module_type, ip=""):
    conn = get_db()
    existing = conn.execute(
        "SELECT * FROM modules WHERE chip_id = ?", (chip_id,)
    ).fetchone()

    now = datetime.now().isoformat()

    if existing:
        conn.execute(
            "UPDATE modules SET ip = ?, last_seen = ? WHERE chip_id = ?",
            (ip, now, chip_id)
        )
    else:
        conn.execute(
            "INSERT INTO modules (chip_id, short_id, type, ip, last_seen) VALUES (?, ?, ?, ?, ?)",
            (chip_id, short_id, module_type, ip, now)
        )
    conn.commit()
    conn.close()


def pair_module(chip_id, user_id, name=""):
    conn = get_db()
    module = conn.execute(
        "SELECT * FROM modules WHERE chip_id = ?", (chip_id,)
    ).fetchone()

    if not module:
        conn.close()
        return False, "Modulo nao encontrado. Ligue o modulo primeiro."

    if module["user_id"] and module["user_id"] != user_id:
        conn.close()
        return False, "Modulo ja vinculado a outro usuario."

    conn.execute(
        "UPDATE modules SET user_id = ?, name = ? WHERE chip_id = ?",
        (user_id, name, chip_id)
    )
    conn.commit()
    conn.close()
    return True, "Modulo vinculado com sucesso."


def unpair_module(chip_id, user_id):
    conn = get_db()
    conn.execute(
        "UPDATE modules SET user_id = NULL, name = '' WHERE chip_id = ? AND user_id = ?",
        (chip_id, user_id)
    )
    conn.commit()
    conn.close()


def get_user_modules(user_id):
    conn = get_db()
    modules = conn.execute(
        "SELECT * FROM modules WHERE user_id = ? ORDER BY type, name", (user_id,)
    ).fetchall()
    conn.close()
    return [dict(m) for m in modules]


def get_module_by_short_id(short_id):
    conn = get_db()
    module = conn.execute(
        "SELECT * FROM modules WHERE short_id = ?", (short_id.upper(),)
    ).fetchone()
    conn.close()
    return dict(module) if module else None


def get_module_by_chip_id(chip_id):
    conn = get_db()
    module = conn.execute(
        "SELECT * FROM modules WHERE chip_id = ?", (chip_id,)
    ).fetchone()
    conn.close()
    return dict(module) if module else None
