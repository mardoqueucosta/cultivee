"""
Servidor de desenvolvimento local para o painel hidropônico.
Controla o ESP32-WROOM via serial (COM7).
Porta: 5001
"""

import sys
sys.path.insert(0, r"C:\Users\user\AppData\Roaming\Python\Python314\site-packages")

from flask import Flask, request, jsonify, redirect
from datetime import datetime, timedelta
import json
import os
import ctypes
import ctypes.wintypes
import threading
import struct

app = Flask(__name__)

# Conexao serial com ESP32-WROOM via Win32 API (sem pyserial)
SERIAL_PORT = "COM7"
SERIAL_BAUD = 115200
ser_lock = threading.Lock()
ser_handle = None

kernel32 = ctypes.windll.kernel32
GENERIC_READ = 0x80000000
GENERIC_WRITE = 0x40000000
OPEN_EXISTING = 3
INVALID_HANDLE = ctypes.c_void_p(-1).value

# DCB baud rate constants
CBR_115200 = 115200

def init_serial_win32():
    global ser_handle
    port = f"\\\\.\\{SERIAL_PORT}"
    h = kernel32.CreateFileW(port, GENERIC_READ | GENERIC_WRITE, 0, None, OPEN_EXISTING, 0, None)
    if h == INVALID_HANDLE:
        print(f"Falha ao abrir {SERIAL_PORT}", flush=True)
        return False

    # Configurar baud rate via DCB
    class DCB(ctypes.Structure):
        _fields_ = [("DCBlength", ctypes.wintypes.DWORD),
                     ("BaudRate", ctypes.wintypes.DWORD),
                     ("fBitFields", ctypes.wintypes.DWORD),
                     ("wReserved", ctypes.wintypes.WORD),
                     ("XonLim", ctypes.wintypes.WORD),
                     ("XoffLim", ctypes.wintypes.WORD),
                     ("ByteSize", ctypes.c_byte),
                     ("Parity", ctypes.c_byte),
                     ("StopBits", ctypes.c_byte),
                     ("XonChar", ctypes.c_char),
                     ("XoffChar", ctypes.c_char),
                     ("ErrorChar", ctypes.c_char),
                     ("EofChar", ctypes.c_char),
                     ("EvtChar", ctypes.c_char),
                     ("wReserved1", ctypes.wintypes.WORD)]

    dcb = DCB()
    dcb.DCBlength = ctypes.sizeof(DCB)
    kernel32.GetCommState(h, ctypes.byref(dcb))
    dcb.BaudRate = SERIAL_BAUD
    dcb.ByteSize = 8
    dcb.Parity = 0
    dcb.StopBits = 0
    # Disable DTR and RTS to prevent ESP32 reset
    dcb.fBitFields = dcb.fBitFields & ~0x0030  # Clear DTR bits
    kernel32.SetCommState(h, ctypes.byref(dcb))

    # Timeouts
    class COMMTIMEOUTS(ctypes.Structure):
        _fields_ = [("ReadIntervalTimeout", ctypes.wintypes.DWORD),
                     ("ReadTotalTimeoutMultiplier", ctypes.wintypes.DWORD),
                     ("ReadTotalTimeoutConstant", ctypes.wintypes.DWORD),
                     ("WriteTotalTimeoutMultiplier", ctypes.wintypes.DWORD),
                     ("WriteTotalTimeoutConstant", ctypes.wintypes.DWORD)]

    timeouts = COMMTIMEOUTS()
    timeouts.ReadIntervalTimeout = 50
    timeouts.ReadTotalTimeoutMultiplier = 10
    timeouts.ReadTotalTimeoutConstant = 1000
    timeouts.WriteTotalTimeoutMultiplier = 10
    timeouts.WriteTotalTimeoutConstant = 1000
    kernel32.SetCommTimeouts(h, ctypes.byref(timeouts))

    # Disable DTR/RTS signals
    kernel32.EscapeCommFunction(h, 6)  # CLRDTR
    kernel32.EscapeCommFunction(h, 4)  # CLRRTS

    ser_handle = h
    print(f"Serial {SERIAL_PORT} aberto via Win32 API", flush=True)
    return True

def send_serial(cmd):
    global ser_handle
    with ser_lock:
        try:
            if ser_handle is None:
                if not init_serial_win32():
                    return "NO_SERIAL"

            # Escrever comando
            data = (cmd + "\n").encode()
            written = ctypes.wintypes.DWORD()
            kernel32.WriteFile(ser_handle, data, len(data), ctypes.byref(written), None)

            # Ler resposta
            import time
            time.sleep(0.4)
            buf = ctypes.create_string_buffer(256)
            read = ctypes.wintypes.DWORD()
            kernel32.ReadFile(ser_handle, buf, 255, ctypes.byref(read), None)
            resp = buf.value.decode("utf-8", errors="ignore").strip()

            print(f"Serial {cmd} -> {resp}", flush=True)
            return resp
        except Exception as e:
            print(f"Serial EXCEPTION: {e}", flush=True)
            ser_handle = None
            return "ERROR"

# Estado simulado
state = {
    "start_date": datetime.now().strftime("%Y-%m-%d"),
    "mode_auto": True,
    "light": False,
    "pump": False,
    "ntp_synced": True,
    "phases": [
        {
            "name": "Germinacao",
            "days": 3,
            "light_on_hour": 6, "light_on_min": 0,
            "light_off_hour": 18, "light_off_min": 0,
            "pump_on_day": 15, "pump_off_day": 15,
            "pump_on_night": 15, "pump_off_night": 15
        },
        {
            "name": "Bercario",
            "days": 17,
            "light_on_hour": 6, "light_on_min": 0,
            "light_off_hour": 19, "light_off_min": 0,
            "pump_on_day": 15, "pump_off_day": 15,
            "pump_on_night": 15, "pump_off_night": 45
        },
        {
            "name": "Engorda",
            "days": 0,
            "light_on_hour": 6, "light_on_min": 0,
            "light_off_hour": 20, "light_off_min": 0,
            "pump_on_day": 15, "pump_off_day": 15,
            "pump_on_night": 10, "pump_off_night": 50
        }
    ]
}

def get_cycle_day():
    try:
        start = datetime.strptime(state["start_date"], "%Y-%m-%d")
        return (datetime.now() - start).days + 1
    except:
        return 1

def get_current_phase_index():
    cycle_day = get_cycle_day()
    day_count = 0
    for i, p in enumerate(state["phases"]):
        if p["days"] == 0:
            return i
        day_count += p["days"]
        if cycle_day <= day_count:
            return i
    return len(state["phases"]) - 1

def is_light_time(phase):
    now = datetime.now()
    now_min = now.hour * 60 + now.minute
    on_min = phase["light_on_hour"] * 60 + phase["light_on_min"]
    off_min = phase["light_off_hour"] * 60 + phase["light_off_min"]
    return on_min <= now_min < off_min

@app.route("/")
def dashboard():
    now = datetime.now()
    time_str = now.strftime("%H:%M:%S")
    cycle_day = get_cycle_day()
    phase_idx = get_current_phase_index()
    p = state["phases"][phase_idx]

    # Auto control
    if state["mode_auto"]:
        state["light"] = is_light_time(p)

    # Phase cards com progresso dentro da fase ativa
    phases_html = ""
    days_before = 0
    for i, ph in enumerate(state["phases"]):
        active_class = " active" if i == phase_idx else ""
        lh = ph['light_off_hour'] - ph['light_on_hour']

        if i == phase_idx:
            # Fase ativa: mostrar progresso
            day_in_phase = cycle_day - days_before
            if ph['days'] > 0:
                progress_text = f"Dia {day_in_phase} de {ph['days']}"
            else:
                progress_text = f"Dia {day_in_phase}"

            phases_html += f"""<div class='phase-card active'>
            <div style='display:flex;justify-content:space-between;align-items:center'>
            <div><span class='phase-name'>{ph['name']}</span><span class='phase-badge'>{progress_text}</span></div>
            </div>
            <div class='phase-detail'>
            &#128161; {ph['light_on_hour']:02d}:{ph['light_on_min']:02d} - {ph['light_off_hour']:02d}:{ph['light_off_min']:02d} ({lh}h)
            &nbsp;&middot;&nbsp;
            &#128167; Dia: {ph['pump_on_day']}/{ph['pump_off_day']}min | Noite: {ph['pump_on_night']}/{ph['pump_off_night']}min
            </div></div>"""
        else:
            # Fase inativa
            dias = f"{ph['days']}d" if ph['days'] > 0 else "&#8734;"
            phases_html += f"""<div class='phase-card'>
            <div style='display:flex;justify-content:space-between;align-items:center'>
            <div><span class='phase-name'>{ph['name']}</span></div>
            <span style='color:#aaa;font-size:0.75rem'>{dias}</span></div>
            <div class='phase-detail'>
            &#128161; {ph['light_on_hour']:02d}:{ph['light_on_min']:02d} - {ph['light_off_hour']:02d}:{ph['light_off_min']:02d} ({lh}h)
            &nbsp;&middot;&nbsp;
            &#128167; Dia: {ph['pump_on_day']}/{ph['pump_off_day']}min | Noite: {ph['pump_on_night']}/{ph['pump_off_night']}min
            </div></div>"""

        days_before += ph['days'] if ph['days'] > 0 else 0

    light_color = "#f39c12" if state["light"] else "#95a5a6"
    light_label = "LIGADA" if state["light"] else "DESLIGADA"
    pump_color = "#3498db" if state["pump"] else "#95a5a6"
    pump_label = "LIGADA" if state["pump"] else "DESLIGADA"
    mode_label = "Automatico" if state["mode_auto"] else "Manual"
    mode_icon = "&#9203;" if state["mode_auto"] else "&#9995;"
    toggle_label = "Manual" if state["mode_auto"] else "Automatico"

    # Calcular horas de luz da fase atual
    light_hours = p["light_off_hour"] - p["light_on_hour"]
    light_period = f"{p['light_on_hour']:02d}:{p['light_on_min']:02d} - {p['light_off_hour']:02d}:{p['light_off_min']:02d}"

    # Data inicio formatada
    try:
        start_dt = datetime.strptime(state["start_date"], "%Y-%m-%d")
        start_fmt = start_dt.strftime("%d/%m/%Y")
    except:
        start_fmt = state["start_date"]

    auto_color = "hsl(142,71%,45%)" if state["mode_auto"] else "#e67e22"
    auto_bg = "hsl(142,50%,96%)" if state["mode_auto"] else "#fef5ec"

    light_on = state["light"]
    pump_on = state["pump"]

    html = f"""<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<title>Hidroponia Inteligente</title>
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' rel='stylesheet'>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
:root{{--primary:hsl(142,71%,45%);--primary-dark:hsl(142,71%,30%);--primary-light:hsl(142,71%,55%);--muted:hsl(220,10%,55%);--border:hsl(0,0%,92%)}}
body{{font-family:'Inter',-apple-system,sans-serif;background:linear-gradient(180deg,#fff,hsl(142,50%,98%));color:hsl(220,15%,15%);max-width:480px;margin:0 auto;min-height:100vh}}
.navbar{{background:linear-gradient(135deg,hsl(220,15%,7%),hsl(220,15%,12%));padding:0 20px;border-bottom:1px solid hsl(142,71%,45%,0.2)}}
.navbar-inner{{display:flex;justify-content:space-between;align-items:center;height:3.5rem}}
.logo{{display:flex;align-items:center;gap:10px}}
.logo-icon{{width:2rem;height:2rem;background:linear-gradient(135deg,var(--primary),var(--primary-light));border-radius:0.5rem;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px hsl(142,71%,55%,0.4)}}
.logo-icon svg{{width:16px;height:16px;color:#fff}}
.logo-text{{color:#fff;font-weight:700;font-size:0.95rem;letter-spacing:0.5px}}
.logo-sub{{font-size:0.6rem;color:var(--primary-light);font-weight:500}}
.nav-pill{{background:hsl(142,71%,45%,0.15);color:var(--primary-light);font-size:0.65rem;padding:3px 10px;border-radius:20px;font-weight:600}}
.main{{padding:16px}}
.hero{{background:#fff;border:1px solid var(--border);border-radius:16px;padding:24px 20px;margin-bottom:16px;text-align:center;box-shadow:0 0 40px hsl(142,71%,55%,0.08)}}
.hero-day{{font-size:2.8rem;font-weight:800;background:linear-gradient(135deg,var(--primary-dark),var(--primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}}
.hero-dates{{display:flex;justify-content:center;gap:24px;margin-top:8px;font-size:0.75rem;color:var(--muted)}}
.status-row{{display:flex;justify-content:center;gap:12px;margin-top:14px}}
.status-pill{{display:flex;align-items:center;gap:5px;font-size:0.7rem;font-weight:500;padding:5px 14px;border-radius:20px}}
.status-pill.on{{background:hsl(142,50%,96%);color:var(--primary-dark)}}
.status-pill.off{{background:hsl(0,0%,96%);color:var(--muted)}}
.status-dot{{width:6px;height:6px;border-radius:50%}}
.section-title{{font-size:0.7rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}}
.phase-card{{background:#fff;border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px}}
.phase-card.active{{border-color:var(--primary);background:hsl(142,50%,98%);box-shadow:0 0 0 1px var(--primary)}}
.phase-row{{display:flex;justify-content:space-between;align-items:center}}
.phase-name{{font-weight:700;font-size:0.85rem}}
.phase-badge{{background:linear-gradient(135deg,var(--primary),var(--primary-light));color:#fff;padding:2px 10px;border-radius:20px;font-size:0.6rem;font-weight:600;margin-left:8px;box-shadow:0 2px 8px hsl(142,71%,45%,0.3)}}
.phase-days{{color:var(--muted);font-size:0.75rem}}
.phase-detail{{color:var(--muted);margin-top:6px;font-size:0.72rem;line-height:1.6}}
.actions{{display:flex;gap:8px;margin-bottom:12px}}
.btn{{flex:1;padding:12px;border-radius:12px;font-weight:600;font-size:0.8rem;text-align:center;cursor:pointer;text-decoration:none;border:none;transition:all 0.15s}}
.btn:hover{{transform:translateY(-1px)}}
.btn-outline{{background:#fff;color:var(--primary);border:1.5px solid var(--border)}}
.btn-outline:hover{{border-color:var(--primary)}}
.btn-primary{{background:linear-gradient(135deg,var(--primary),var(--primary-light));color:#fff;box-shadow:0 4px 12px hsl(142,71%,45%,0.3)}}
.manual-grid{{display:flex;gap:8px;margin-bottom:12px}}
.manual-btn{{flex:1;padding:14px;border-radius:12px;text-align:center;cursor:pointer;border:1.5px solid var(--border);background:#fff;font-weight:600;font-size:0.75rem;transition:all 0.15s}}
.manual-btn:active{{transform:scale(0.97)}}
.manual-btn .icon{{font-size:1.5rem;margin-bottom:4px}}
.manual-btn.light-on{{border-color:#f39c12;background:#fffbf0;color:#e67e22}}
.manual-btn.pump-on{{border-color:#3498db;background:#f0f8ff;color:#2980b9}}
.footer{{text-align:center;padding:16px;font-size:0.6rem;color:#ccc}}
</style></head><body>

<nav class='navbar'>
<div class='navbar-inner'>
<div class='logo'>
<div class='logo-icon'>
<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
<path d='M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/>
<path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/>
</svg>
</div>
<div>
<span class='logo-text'>CULTIVEE</span>
<div class='logo-sub'>Hidroponia Inteligente</div>
</div>
</div>
<span class='nav-pill'>{mode_label}</span>
</div>
</nav>

<div class='main'>

<div class='hero'>
<div class='hero-day'>Dia {cycle_day}</div>
<div class='hero-dates'>
<span>Inicio: {start_fmt}</span>
<span>Hoje: {now.strftime("%d/%m/%Y")}</span>
</div>
<div class='status-row'>
<div class='status-pill {"on" if light_on else "off"}'><span class='status-dot' style='background:{"#f39c12" if light_on else "#ccc"}'></span> Luz {"ligada" if light_on else "desligada"}</div>
<div class='status-pill {"on" if pump_on else "off"}'><span class='status-dot' style='background:{"#3498db" if pump_on else "#ccc"}'></span> Bomba {"ligada" if pump_on else "desligada"}</div>
</div>
</div>

<div class='section-title'>Fases do Cultivo</div>
{phases_html}

<div class='actions'>
<a href='/config' class='btn btn-outline'>&#9881; Configurar</a>
<button class='btn {"btn-primary" if state["mode_auto"] else "btn-outline"}' onclick="cmd('mode','toggle')" style='{"" if state["mode_auto"] else f"color:{auto_color};border-color:{auto_color}"}'>
{toggle_label}
</button>
</div>

{"" if state["mode_auto"] else f"""
<div class='section-title'>Controle Manual</div>
<div class='manual-grid'>
<div class='manual-btn {"light-on" if light_on else ""}' onclick="cmd('light','toggle')">
<div class='icon'>&#128161;</div>
{"Desligar" if light_on else "Ligar"} Luz
</div>
<div class='manual-btn {"pump-on" if pump_on else ""}' onclick="cmd('pump','toggle')">
<div class='icon'>&#128167;</div>
{"Desligar" if pump_on else "Ligar"} Bomba
</div>
</div>
"""}

</div>

<div class='footer'>Hidroponia Inteligente v1.1</div>

<script>
function cmd(device, action) {{
  fetch('/relay?device=' + device + '&action=' + action)
    .then(() => setTimeout(() => location.reload(), 300));
}}
setInterval(() => location.reload(), 10000);
</script>
</body></html>"""
    return html

@app.route("/relay")
def relay():
    device = request.args.get("device", "")
    action = request.args.get("action", "")
    print(f">>> RELAY chamado: device={device} action={action}", flush=True)

    if device == "mode":
        state["mode_auto"] = not state["mode_auto"]
        if state["mode_auto"]:
            send_serial("AUTO")
    elif device == "light":
        state["light"] = not state["light"]
        state["mode_auto"] = False
        resp = send_serial("L1" if state["light"] else "L0")
        print(f"Serial: L{'1' if state['light'] else '0'} -> {resp}")
    elif device == "pump":
        state["pump"] = not state["pump"]
        state["mode_auto"] = False
        resp = send_serial("P1" if state["pump"] else "P0")
        print(f"Serial: P{'1' if state['pump'] else '0'} -> {resp}")

    return jsonify({"status": "ok"})

@app.route("/config")
def config_page():
    inp = "style='width:100%;padding:10px;border:1px solid hsl(220,15%,25%);border-radius:10px;font-size:0.85rem;font-family:Inter,-apple-system,sans-serif;background:hsl(220,15%,14%);color:#eee;transition:border 0.15s'"
    inp_focus = "onfocus=\"this.style.borderColor='hsl(142,71%,45%)'\" onblur=\"this.style.borderColor='hsl(220,15%,25%)'\""
    lbl = "style='font-size:0.7rem;color:hsl(220,10%,60%);display:block;margin-bottom:4px;font-weight:500'"
    grid2 = "style='display:grid;grid-template-columns:1fr 1fr;gap:10px'"
    remove_btn = lambda i: f"<button type='button' onclick=\"removePhase({i})\" style='background:none;color:hsl(220,10%,45%);border:1px solid hsl(220,15%,25%);border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:0.7rem;transition:all 0.15s' onmouseover=\"this.style.color='hsl(0,70%,60%)';this.style.borderColor='hsl(0,70%,40%)'\" onmouseout=\"this.style.color='hsl(220,10%,45%)';this.style.borderColor='hsl(220,15%,25%)'\">&#10005;</button>" if len(state['phases']) > 1 else ""

    phases_forms = ""
    for i, p in enumerate(state["phases"]):
        phases_forms += f"""<div style='background:hsl(220,15%,16%);border:1px solid hsl(220,15%,22%);border-radius:14px;padding:16px;margin-bottom:12px'>
        <div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid hsl(220,15%,22%)'>
        <span style='font-weight:700;font-size:0.9rem;color:hsl(0,0%,90%)'>Fase {i+1}</span>
        {remove_btn(i)}
        </div>

        <div {grid2}>
            <div><label {lbl}>Nome</label><input name='n{i}' value='{p["name"]}' placeholder='Nome da fase' {inp} {inp_focus}></div>
            <div><label {lbl}>Duracao (dias)</label><input type='number' name='d{i}' value='{p["days"]}' min='0' placeholder='0 = infinito' {inp} {inp_focus}></div>
        </div>

        <div style='font-size:0.75rem;font-weight:600;color:hsl(0,0%,80%);margin:14px 0 8px;display:flex;align-items:center;gap:6px'>&#128161; Iluminacao</div>
        <div {grid2}>
            <div><label {lbl}>Liga</label><input type='time' name='lon{i}' value='{p["light_on_hour"]:02d}:{p["light_on_min"]:02d}' {inp} {inp_focus}></div>
            <div><label {lbl}>Desliga</label><input type='time' name='loff{i}' value='{p["light_off_hour"]:02d}:{p["light_off_min"]:02d}' {inp} {inp_focus}></div>
        </div>

        <div style='font-size:0.75rem;font-weight:600;color:hsl(0,0%,80%);margin:14px 0 8px;display:flex;align-items:center;gap:6px'>&#128167; Irrigacao Dia <span style='font-weight:400;color:hsl(220,10%,55%);font-size:0.65rem'>(luz ligada)</span></div>
        <div {grid2}>
            <div><label {lbl}>Liga (min)</label><input type='number' name='pod{i}' value='{p["pump_on_day"]}' min='1' {inp} {inp_focus}></div>
            <div><label {lbl}>Desliga (min)</label><input type='number' name='pfd{i}' value='{p["pump_off_day"]}' min='1' {inp} {inp_focus}></div>
        </div>

        <div style='font-size:0.75rem;font-weight:600;color:hsl(0,0%,80%);margin:14px 0 8px;display:flex;align-items:center;gap:6px'>&#127769; Irrigacao Noite <span style='font-weight:400;color:hsl(220,10%,55%);font-size:0.65rem'>(luz desligada)</span></div>
        <div {grid2}>
            <div><label {lbl}>Liga (min)</label><input type='number' name='pon{i}' value='{p["pump_on_night"]}' min='1' {inp} {inp_focus}></div>
            <div><label {lbl}>Desliga (min)</label><input type='number' name='pfn{i}' value='{p["pump_off_night"]}' min='1' {inp} {inp_focus}></div>
        </div>
        </div>"""

    html = f"""<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<meta charset='UTF-8'>
<title>Configuracao - Hidroponia Inteligente</title>
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet'>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Inter',-apple-system,sans-serif;background:hsl(220,15%,12%);color:hsl(0,0%,90%);max-width:480px;margin:0 auto;min-height:100vh}}
.navbar{{background:hsl(220,15%,7%);padding:0 20px;border-bottom:1px solid hsl(142,71%,45%,0.2)}}
.navbar-inner{{display:flex;justify-content:space-between;align-items:center;height:3.5rem}}
.nav-title{{color:#fff;font-weight:700;font-size:0.95rem;display:flex;align-items:center;gap:8px}}
.nav-back{{color:hsl(142,71%,55%);text-decoration:none;font-size:0.8rem;font-weight:500;display:flex;align-items:center;gap:4px}}
.main{{padding:16px}}
.section-title{{font-size:0.7rem;font-weight:600;color:hsl(142,71%,55%);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}}
.date-card{{background:hsl(220,15%,16%);border:1px solid hsl(220,15%,22%);border-radius:14px;padding:16px;margin-bottom:16px}}
.date-card label{{font-size:0.8rem;font-weight:600;display:block;margin-bottom:6px;color:hsl(0,0%,85%)}}
.btn-row{{display:flex;gap:8px;margin-bottom:10px}}
.btn{{flex:1;padding:12px;border-radius:12px;font-weight:600;font-size:0.8rem;text-align:center;cursor:pointer;text-decoration:none;border:none;transition:all 0.15s;font-family:'Inter',-apple-system,sans-serif}}
.btn:hover{{transform:translateY(-1px)}}
.btn-primary{{background:linear-gradient(135deg,hsl(142,71%,45%),hsl(142,71%,55%));color:#fff;box-shadow:0 4px 12px hsl(142,71%,45%,0.3)}}
.btn-outline{{background:hsl(220,15%,16%);color:hsl(142,71%,55%);border:1.5px solid hsl(220,15%,25%)}}
.btn-outline:hover{{border-color:hsl(142,71%,45%)}}
.btn-danger{{background:hsl(220,15%,16%);color:hsl(0,70%,60%);border:1.5px solid hsl(220,15%,25%)}}
.btn-danger:hover{{border-color:hsl(0,70%,55%)}}
.footer{{text-align:center;padding:16px;font-size:0.6rem;color:#ccc}}
</style></head><body>

<nav class='navbar'>
<div class='navbar-inner'>
<span class='nav-title'>&#9881; Configuracao</span>
<a href='/' class='nav-back'>&#8592; Voltar</a>
</div>
</nav>

<div class='main'>

<form method='POST' action='/save-config'>

<div class='section-title'>Inicio do Cultivo</div>
<div class='date-card'>
<label>Data de Inicio</label>
<input type='date' name='start_date' value='{state["start_date"]}' style='width:100%;padding:10px;border:1px solid hsl(220,15%,25%);border-radius:10px;font-size:0.85rem;font-family:Inter,-apple-system,sans-serif;background:hsl(220,15%,14%);color:#eee'>
</div>

<div class='section-title'>Fases do Cultivo</div>
<div id='phases'>{phases_forms}</div>
<input type='hidden' name='num_phases' value='{len(state["phases"])}'>

<div class='btn-row'>
<button type='submit' class='btn btn-primary'>Salvar</button>
</div>
<div class='btn-row'>
<button type='button' onclick='addPhase()' class='btn btn-outline'>+ Adicionar Fase</button>
<a href='/reset-phases' class='btn btn-danger' onclick="return confirm('Restaurar fases padrao?')">Restaurar</a>
</div>

</form>

</div>

<div class='footer'>Hidroponia Inteligente v1.1</div>

<script>
function removePhase(idx) {{
  if(!confirm('Remover esta fase?')) return;
  fetch('/remove-phase?idx='+idx).then(()=>location.reload());
}}
function addPhase() {{
  fetch('/add-phase').then(()=>location.reload());
}}
</script>
</body></html>"""
    return html

@app.route("/save-config", methods=["POST"])
def save_config():
    state["start_date"] = request.form.get("start_date", state["start_date"])
    np = int(request.form.get("num_phases", len(state["phases"])))

    for i in range(np):
        if i < len(state["phases"]):
            p = state["phases"][i]
        else:
            break
        p["name"] = request.form.get(f"n{i}", p["name"])
        p["days"] = int(request.form.get(f"d{i}", p["days"]))
        lon = request.form.get(f"lon{i}", "")
        if len(lon) >= 5:
            p["light_on_hour"] = int(lon[:2])
            p["light_on_min"] = int(lon[3:5])
        loff = request.form.get(f"loff{i}", "")
        if len(loff) >= 5:
            p["light_off_hour"] = int(loff[:2])
            p["light_off_min"] = int(loff[3:5])
        p["pump_on_day"] = int(request.form.get(f"pod{i}", p["pump_on_day"]))
        p["pump_off_day"] = int(request.form.get(f"pfd{i}", p["pump_off_day"]))
        p["pump_on_night"] = int(request.form.get(f"pon{i}", p["pump_on_night"]))
        p["pump_off_night"] = int(request.form.get(f"pfn{i}", p["pump_off_night"]))

    return redirect("/")

@app.route("/add-phase")
def add_phase():
    state["phases"].append({
        "name": "Nova Fase", "days": 7,
        "light_on_hour": 6, "light_on_min": 0,
        "light_off_hour": 18, "light_off_min": 0,
        "pump_on_day": 15, "pump_off_day": 15,
        "pump_on_night": 15, "pump_off_night": 45
    })
    return redirect("/config")

@app.route("/remove-phase")
def remove_phase():
    idx = int(request.args.get("idx", -1))
    if 0 <= idx < len(state["phases"]) and len(state["phases"]) > 1:
        state["phases"].pop(idx)
    return redirect("/config")

@app.route("/reset-phases")
def reset_phases():
    state["phases"] = [
        {"name": "Germinacao", "days": 3, "light_on_hour": 6, "light_on_min": 0, "light_off_hour": 18, "light_off_min": 0, "pump_on_day": 15, "pump_off_day": 15, "pump_on_night": 15, "pump_off_night": 15},
        {"name": "Bercario", "days": 17, "light_on_hour": 6, "light_on_min": 0, "light_off_hour": 19, "light_off_min": 0, "pump_on_day": 15, "pump_off_day": 15, "pump_on_night": 15, "pump_off_night": 45},
        {"name": "Engorda", "days": 0, "light_on_hour": 6, "light_on_min": 0, "light_off_hour": 20, "light_off_min": 0, "pump_on_day": 15, "pump_off_day": 15, "pump_on_night": 10, "pump_off_night": 50},
    ]
    return redirect("/config")

@app.route("/status")
def status():
    return jsonify(state)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
