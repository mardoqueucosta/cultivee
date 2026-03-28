// =====================================================================
// Cultivee HidroCam PWA — App Logic
// =====================================================================

const APP_VERSION = '1.0.1';
let token = localStorage.getItem("cultivee_hidro_cam_token");
let user = JSON.parse(localStorage.getItem("cultivee_hidro_cam_user") || "null");
let modules = [];
let activeCtrlChipId = null;

// --- API helper ---

async function api(path, options = {}) {
    const headers = { ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (options.body && typeof options.body === "object") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(options.body);
    }
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro desconhecido");
    return data;
}

// =====================================================================
// Auth
// =====================================================================

function showLogin() {
    document.getElementById("auth-login").classList.remove("hidden");
    document.getElementById("auth-register").classList.add("hidden");
    document.getElementById("auth-error").classList.add("hidden");
}

function showRegister() {
    document.getElementById("auth-login").classList.add("hidden");
    document.getElementById("auth-register").classList.remove("hidden");
    document.getElementById("auth-error").classList.add("hidden");
}

function togglePass(inputId, el) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        el.textContent = "ocultar";
    } else {
        input.type = "password";
        el.textContent = "mostrar";
    }
}

function showAuthError(msg) {
    const el = document.getElementById("auth-error");
    el.textContent = msg;
    el.classList.remove("hidden");
}

async function doLogin() {
    try {
        const data = await api("/api/auth/login", {
            method: "POST",
            body: {
                email: document.getElementById("login-email").value,
                password: document.getElementById("login-pass").value,
            }
        });
        token = data.token;
        user = data.user;
        localStorage.setItem("cultivee_hidro_cam_token", token);
        localStorage.setItem("cultivee_hidro_cam_user", JSON.stringify(user));
        enterApp();
    } catch (e) {
        showAuthError(e.message);
    }
}

async function doRegister() {
    try {
        const data = await api("/api/auth/register", {
            method: "POST",
            body: {
                name: document.getElementById("reg-name").value,
                email: document.getElementById("reg-email").value,
                password: document.getElementById("reg-pass").value,
            }
        });
        token = data.token;
        user = data.user;
        localStorage.setItem("cultivee_hidro_cam_token", token);
        localStorage.setItem("cultivee_hidro_cam_user", JSON.stringify(user));
        enterApp();
    } catch (e) {
        showAuthError(e.message);
    }
}

function doLogout() {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
    token = null;
    user = null;
    localStorage.removeItem("cultivee_hidro_cam_token");
    localStorage.removeItem("cultivee_hidro_cam_user");
    document.getElementById("auth-screen").classList.remove("hidden");
    document.getElementById("app-screen").classList.add("hidden");
}

// =====================================================================
// App Init
// =====================================================================

function enterApp() {
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("app-screen").classList.remove("hidden");
    document.getElementById("nav-user").textContent = user.name;
    loadModules();
    setTimeout(checkPendingCode, 500);
}

// =====================================================================
// Helpers
// =====================================================================

function getRssiBar(rssi) {
    const bars = 4;
    let filled = 0;
    if (rssi >= -50) filled = 4;
    else if (rssi >= -60) filled = 3;
    else if (rssi >= -70) filled = 2;
    else if (rssi >= -80) filled = 1;
    let html = '<span class="rssi-bars">';
    for (let i = 0; i < bars; i++) {
        html += `<span class="rssi-bar ${i < filled ? 'filled' : ''}"></span>`;
    }
    html += '</span>';
    return html;
}

function getRssiLabel(rssi) {
    if (rssi >= -50) return "Excelente";
    if (rssi >= -60) return "Bom";
    if (rssi >= -70) return "Regular";
    if (rssi >= -80) return "Fraco";
    return "Muito fraco";
}

function formatUptime(seconds) {
    if (!seconds) return "0min";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m}min`;
    return `${seconds}s`;
}

// =====================================================================
// Modules
// =====================================================================

async function loadModules() {
    try {
        const data = await api("/api/modules");
        modules = data.modules;
        renderModules();

        // Se tem modulo online, mostra dashboard
        const online = modules.find(m => m.online);
        if (online) {
            activeCtrlChipId = online.chip_id;
            document.getElementById("section-dashboard").classList.remove("hidden");
            loadCtrlStatus(online.chip_id);
        } else {
            document.getElementById("section-dashboard").classList.add("hidden");
            activeCtrlChipId = null;
        }
    } catch (e) {
        if (e.message === "Nao autenticado") doLogout();
    }
}

function renderModules() {
    const list = document.getElementById("modules-list");

    if (modules.length === 0) {
        list.innerHTML = `<div class="empty-state">
            <p>Nenhum dispositivo vinculado</p>
            <p style="font-size:0.8rem;color:var(--text-dim);margin-top:0.5rem">Conecte seu ESP32 na rede <strong>Cultivee-HidroCam</strong> para configurar</p>
            <button class="btn-add" onclick="showPairModal()" style="margin-top:0.75rem">+ Adicionar dispositivo</button>
        </div>`;
        return;
    }

    list.innerHTML = modules.map(m => {
        const name = m.name || "HidroCam";
        const ctrl = m.ctrl_data || {};

        if (m.online) {
            const rssiBar = getRssiBar(m.rssi);
            const lightIcon = ctrl.light ? '&#128161;' : '&#9899;';
            const pumpIcon = ctrl.pump ? '&#128167;' : '&#9899;';
            const phase = ctrl.phase || '---';

            return `<div class="module-compact" onclick="toggleModuleDetails('${m.chip_id}')">
                <div class="module-compact-row">
                    <div class="module-compact-info">
                        <span class="status-dot online"></span>
                        <span class="module-compact-name">${name}</span>
                        <span class="module-compact-meta">${lightIcon} ${pumpIcon} ${phase}</span>
                    </div>
                    <div class="module-compact-actions">
                        <button class="btn-add" onclick="showPairModal();event.stopPropagation()">+</button>
                        <svg class="module-chevron" id="chevron-${m.chip_id}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                </div>
                <div class="module-details hidden" id="details-${m.chip_id}" onclick="event.stopPropagation()">
                    <div class="module-stats">
                        <div class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
                            <div class="stat-content">
                                <span class="stat-value">${m.ssid || '---'}</span>
                                <span class="stat-label">${rssiBar} ${getRssiLabel(m.rssi)}</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <div class="stat-content">
                                <span class="stat-value">${formatUptime(m.uptime)}</span>
                                <span class="stat-label">Ligado</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                            <div class="stat-content">
                                <span class="stat-value">${m.ip || '---'}</span>
                                <span class="stat-label">IP Local</span>
                            </div>
                        </div>
                    </div>
                    <div class="module-actions-row">
                        <span class="module-code-label">Código: <strong>${m.short_id || '---'}</strong></span>
                        <button class="btn-danger-small" onclick="unpairModule('${m.chip_id}');event.stopPropagation()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            Desvincular
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
            return `<div class="module-compact module-compact-offline">
                <div class="module-compact-row">
                    <div class="module-compact-info">
                        <span class="status-dot offline"></span>
                        <span class="module-compact-name">${name}</span>
                        <span class="module-compact-meta" style="color:var(--text-dim)">Offline</span>
                    </div>
                    <a href="http://192.168.4.1" target="_blank" class="btn-setup-small" onclick="event.stopPropagation()">Configurar</a>
                </div>
            </div>`;
        }
    }).join("");

    // CAMERA MODULE — unico ponto de integracao (remover esta linha desativa o card)
    if (CAMERA_ENABLED) cam_render();
}

function toggleModuleDetails(chipId) {
    const details = document.getElementById("details-" + chipId);
    const chevron = document.getElementById("chevron-" + chipId);
    if (details) {
        details.classList.toggle("hidden");
        if (chevron) chevron.style.transform = details.classList.contains("hidden") ? "" : "rotate(180deg)";
    }
}

async function unpairModule(chipId) {
    if (!confirm('Desvincular este módulo da sua conta?')) return;
    try {
        await api('/api/modules/unpair', { method: 'POST', body: { chip_id: chipId } });
        loadModules();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

// =====================================================================
// Ctrl Dashboard
// =====================================================================

async function loadCtrlStatus(chipId) {
    try {
        const data = await api(`/api/hidro-cam/${chipId}/status`);
        // Se houve toggle recente, preserva estado local dos campos alterados
        if (localState && (Date.now() - lastToggleTime < TOGGLE_COOLDOWN)) {
            data.light = localState.light;
            data.pump = localState.pump;
            data.mode = localState.mode;
        }
        renderDashboard(chipId, data);
    } catch (e) {
        console.error("Erro status ctrl:", e);
        document.getElementById("dashboard-content").innerHTML =
            '<div class="card"><div class="empty-state"><p>Erro ao carregar status</p></div></div>';
    }
}

function renderDashboard(chipId, data) {
    // Salva estado local para updates otimistas
    localState = { ...data };

    const container = document.getElementById("dashboard-content");

    const cycleDay = data.cycle_day || 0;
    const phase = data.phase || "---";
    const phaseIndex = data.phase_index || 0;
    const numPhases = data.num_phases || 0;
    const lightOn = data.light || false;
    const pumpOn = data.pump || false;
    const modeAuto = data.mode === "auto";
    const timeStr = data.time || "--:--:--";
    const ntpSynced = data.ntp_synced || false;
    const startDateRaw = data.start_date || "---";
    let startDate = startDateRaw;
    if (startDateRaw && startDateRaw.includes("-")) {
        const [y, m, d] = startDateRaw.split("-");
        startDate = `${d}/${m}/${y}`;
    }

    // Phase list - calculate days elapsed per phase
    let phasesHtml = '';
    if (data.phases && data.phases.length) {
        // Calculate cumulative days to find days in current phase
        let cumDays = 0;
        const phaseStartDays = [];
        data.phases.forEach(p => {
            phaseStartDays.push(cumDays);
            cumDays += (p.days > 0 ? p.days : 0);
        });

        phasesHtml = data.phases.map((p, i) => {
            const isActive = i === phaseIndex;
            const isPast = i < phaseIndex;
            const lOn = `${String(p.lightOnHour).padStart(2, '0')}:${String(p.lightOnMin).padStart(2, '0')}`;
            const lOff = `${String(p.lightOffHour).padStart(2, '0')}:${String(p.lightOffMin).padStart(2, '0')}`;

            let diasInfo = '';
            let progressBar = '';
            if (p.days > 0) {
                if (isActive) {
                    const daysInPhase = cycleDay - phaseStartDays[i];
                    const clamped = Math.min(daysInPhase, p.days);
                    const pct = Math.round((clamped / p.days) * 100);
                    diasInfo = `<span class="phase-item-days">${clamped} de ${p.days} dias</span>`;
                    progressBar = `<div class="phase-mini-progress"><div class="phase-mini-bar" style="width:${pct}%"></div></div>`;
                } else if (isPast) {
                    diasInfo = `<span class="phase-item-days phase-done">${p.days}/${p.days} dias &#10003;</span>`;
                } else {
                    diasInfo = `<span class="phase-item-days">${p.days} dias</span>`;
                }
            } else {
                diasInfo = `<span class="phase-item-days">&#8734;</span>`;
            }

            return `<div class="phase-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}">
                <div class="phase-item-header">
                    <span class="phase-item-name">${p.name} ${isActive ? '<span class="phase-badge">ATIVA</span>' : ''}</span>
                    ${diasInfo}
                </div>
                ${progressBar}
                <div class="phase-item-details">
                    &#128161; ${lOn} - ${lOff}<br>
                    &#128167; Dia: ${p.pumpOnDay}/${p.pumpOffDay}min | Noite: ${p.pumpOnNight}/${p.pumpOffNight}min
                </div>
            </div>`;
        }).join("");
    }

    // Controls: only show toggle buttons in manual mode
    const lightPending = pendingCommands.has('light');
    const pumpPending = pendingCommands.has('pump');
    const modePending = pendingCommands.has('mode');

    let controlsHtml = '';
    if (!modeAuto) {
        controlsHtml = `
            <div class="controls-row">
                <button class="ctrl-btn ${lightOn ? 'on' : 'off'} ${lightPending ? 'pending' : ''}" onclick="toggleRelay('${chipId}', 'light')" ${lightPending ? 'disabled' : ''}>
                    ${lightPending ? '<span class="btn-spinner"></span>' : `<span class="ctrl-btn-icon">${lightOn ? '&#128161;' : '&#9899;'}</span>`}
                    <span>${lightPending ? 'Enviando...' : `LUZ ${lightOn ? 'ON' : 'OFF'}`}</span>
                </button>
                <button class="ctrl-btn ${pumpOn ? 'on pump-on' : 'off'} ${pumpPending ? 'pending' : ''}" onclick="toggleRelay('${chipId}', 'pump')" ${pumpPending ? 'disabled' : ''}>
                    ${pumpPending ? '<span class="btn-spinner"></span>' : `<span class="ctrl-btn-icon">${pumpOn ? '&#128167;' : '&#9899;'}</span>`}
                    <span>${pumpPending ? 'Enviando...' : `BOMBA ${pumpOn ? 'ON' : 'OFF'}`}</span>
                </button>
            </div>`;
    }

    // Status indicators (always visible)
    const lightStatusClass = lightOn ? 'status-on' : 'status-off';
    const pumpStatusClass = pumpOn ? 'status-on pump' : 'status-off';

    // Format current date
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

    container.innerHTML = `
        <div class="card">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="label">Ciclo</div>
                    <div class="value">Dia ${cycleDay}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Fase</div>
                    <div class="value small">${phase}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Início</div>
                    <div class="value small">${startDate}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Hoje</div>
                    <div class="value small">${dateStr}</div>
                </div>
            </div>

            <div class="status-indicators">
                <div class="status-indicator ${lightStatusClass}">
                    <span class="status-indicator-dot"></span>
                    <span>Luz ${lightOn ? 'Ligada' : 'Desligada'}</span>
                </div>
                <div class="status-indicator ${pumpStatusClass}">
                    <span class="status-indicator-dot"></span>
                    <span>Bomba ${pumpOn ? 'Ligada' : 'Desligada'}</span>
                </div>
            </div>

            <button class="ctrl-btn-mode ${modeAuto ? 'auto' : 'manual'} ${modePending ? 'pending' : ''}" onclick="toggleRelay('${chipId}', 'mode')" ${modePending ? 'disabled' : ''}>
                ${modePending ? '<span class="btn-spinner"></span> Alterando...' : (modeAuto ? '&#9881; Modo Automático' : '&#9995; Modo Manual')}
            </button>

            ${controlsHtml}
        </div>

        ${phasesHtml ? `
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    <h2>Fases Configuradas</h2>
                </div>
                <button class="btn-config" onclick="showConfigModal('${chipId}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Configurar
                </button>
            </div>
            ${phasesHtml}
        </div>` : ''}
    `;
}

// Estado local para update otimista
let localState = null;
let lastToggleTime = 0;
const TOGGLE_COOLDOWN = 35000; // Bloqueia refresh por 35s (ESP32 registra a cada 30s)

let pendingCommands = new Set();

async function toggleRelay(chipId, device) {
    // Update otimista: muda estado local ANTES da resposta
    if (localState) {
        if (device === "light") localState.light = !localState.light;
        else if (device === "pump") localState.pump = !localState.pump;
        else if (device === "mode") localState.mode = localState.mode === "auto" ? "manual" : "auto";
        lastToggleTime = Date.now();
        pendingCommands.add(device);
        renderDashboard(chipId, localState);
    }

    try {
        await api(`/api/hidro-cam/${chipId}/relay?device=${device}&action=toggle`);
    } catch (e) {
        console.error("Erro relay:", e);
    }

    // Aguarda confirmacao do ESP32 (poll a cada 1.5s, max 15s)
    let confirmed = false;
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1500));
        try {
            const data = await api(`/api/hidro-cam/${chipId}/status`);
            // Verifica se estado mudou
            if (device === "light" && data.light === localState.light) { confirmed = true; break; }
            if (device === "pump" && data.pump === localState.pump) { confirmed = true; break; }
            if (device === "mode" && data.mode === localState.mode) { confirmed = true; break; }
        } catch (e) { break; }
    }

    pendingCommands.delete(device);
    if (confirmed) {
        renderDashboard(chipId, localState);
    } else {
        // Nao confirmou: recarrega estado real
        loadCtrlStatus(chipId);
    }
}

// =====================================================================
// Config Modal
// =====================================================================

let configChipId = null;
let configPhases = [];

async function showConfigModal(chipId) {
    configChipId = chipId;
    try {
        // Tenta buscar dados em tempo real do ESP32 (live=1), senao usa banco
        let data;
        try {
            data = await api(`/api/hidro-cam/${chipId}/phases?live=1`);
        } catch (e) {
            data = await api(`/api/hidro-cam/${chipId}/status`);
        }
        configPhases = data.phases || [];
        renderConfigModal(data);
        document.getElementById("config-modal").classList.remove("hidden");
    } catch (e) {
        alert("Erro ao carregar configuração: " + e.message);
    }
}

function closeConfigModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById("config-modal").classList.add("hidden");
}

function renderConfigModal(data) {
    const container = document.getElementById("config-content");
    const today = new Date().toISOString().split('T')[0];
    const startDate = data.start_date || today;
    const phases = data.phases || [];

    let phasesHtml = phases.map((p, i) => {
        const lOnH = p.lightOnHour != null ? p.lightOnHour : 6;
        const lOnM = p.lightOnMin != null ? p.lightOnMin : 0;
        const lOffH = p.lightOffHour != null ? p.lightOffHour : 18;
        const lOffM = p.lightOffMin != null ? p.lightOffMin : 0;
        const lOn = `${String(lOnH).padStart(2, '0')}:${String(lOnM).padStart(2, '0')}`;
        const lOff = `${String(lOffH).padStart(2, '0')}:${String(lOffM).padStart(2, '0')}`;
        const pod = p.pumpOnDay || 15;
        const pfd = p.pumpOffDay || 15;
        const pon = p.pumpOnNight || 15;
        const pfn = p.pumpOffNight || 45;
        const days = p.days != null ? p.days : 7;
        const name = p.name || `Fase ${i+1}`;
        return `<div class="config-phase">
            <div class="config-phase-header">
                <span class="config-phase-title">Fase ${i + 1}</span>
                ${phases.length > 1 ? `<button class="config-remove" onclick="removePhase(${i})">&#10005;</button>` : ''}
            </div>
            <div class="config-grid">
                <div class="config-field">
                    <label>Nome</label>
                    <input type="text" id="cfg-n${i}" value="${name}">
                </div>
                <div class="config-field">
                    <label>Dias</label>
                    <input type="number" id="cfg-d${i}" value="${days}" min="0" placeholder="0=infinito">
                </div>
            </div>
            <div class="config-section-label">&#128161; Iluminação</div>
            <div class="config-grid">
                <div class="config-field">
                    <label>Liga</label>
                    <input type="time" id="cfg-lon${i}" value="${lOn}">
                </div>
                <div class="config-field">
                    <label>Desliga</label>
                    <input type="time" id="cfg-loff${i}" value="${lOff}">
                </div>
            </div>
            <div class="config-section-label">&#128167; Irrigação Dia</div>
            <div class="config-grid">
                <div class="config-field">
                    <label>ON (min)</label>
                    <input type="number" id="cfg-pod${i}" value="${pod}" min="1">
                </div>
                <div class="config-field">
                    <label>OFF (min)</label>
                    <input type="number" id="cfg-pfd${i}" value="${pfd}" min="1">
                </div>
            </div>
            <div class="config-section-label">&#127769; Irrigação Noite</div>
            <div class="config-grid">
                <div class="config-field">
                    <label>ON (min)</label>
                    <input type="number" id="cfg-pon${i}" value="${pon}" min="1">
                </div>
                <div class="config-field">
                    <label>OFF (min)</label>
                    <input type="number" id="cfg-pfn${i}" value="${pfn}" min="1">
                </div>
            </div>
        </div>`;
    }).join("");

    container.innerHTML = `
        <div class="config-field" style="margin-bottom:1rem">
            <label>Data de Início do Cultivo</label>
            <input type="date" id="cfg-start-date" value="${startDate}">
        </div>
        <div id="config-phases">${phasesHtml}</div>
        <div class="config-actions">
            <button class="btn-primary" onclick="saveConfig()">Salvar</button>
        </div>
        <div class="config-actions" style="margin-top:0.5rem">
            <button class="btn-secondary" onclick="addPhase()">+ Adicionar Fase</button>
            <button class="btn-danger-outline" onclick="resetPhases()">Restaurar Padrão</button>
        </div>
    `;
}

async function saveConfig() {
    const phases = document.querySelectorAll('.config-phase');
    const data = {
        start_date: document.getElementById('cfg-start-date').value,
        num_phases: phases.length
    };

    phases.forEach((_, i) => {
        data[`n${i}`] = document.getElementById(`cfg-n${i}`).value;
        data[`d${i}`] = document.getElementById(`cfg-d${i}`).value;
        data[`lon${i}`] = document.getElementById(`cfg-lon${i}`).value;
        data[`loff${i}`] = document.getElementById(`cfg-loff${i}`).value;
        data[`pod${i}`] = document.getElementById(`cfg-pod${i}`).value;
        data[`pfd${i}`] = document.getElementById(`cfg-pfd${i}`).value;
        data[`pon${i}`] = document.getElementById(`cfg-pon${i}`).value;
        data[`pfn${i}`] = document.getElementById(`cfg-pfn${i}`).value;
    });

    try {
        await api(`/api/hidro-cam/${configChipId}/save-config`, {
            method: "POST",
            body: data
        });
        closeConfigModal();
        setTimeout(() => loadCtrlStatus(configChipId), 500);
    } catch (e) {
        alert("Erro ao salvar: " + e.message);
    }
}

async function addPhase() {
    try {
        await api(`/api/hidro-cam/${configChipId}/add-phase`);
        showConfigModal(configChipId);
    } catch (e) {
        alert("Erro: " + e.message);
    }
}

async function removePhase(idx) {
    if (!confirm('Remover esta fase?')) return;
    try {
        await api(`/api/hidro-cam/${configChipId}/remove-phase?idx=${idx}`);
        showConfigModal(configChipId);
    } catch (e) {
        alert("Erro: " + e.message);
    }
}

async function resetPhases() {
    if (!confirm('Restaurar fases padrão?')) return;
    try {
        await api(`/api/hidro-cam/${configChipId}/reset-phases`);
        showConfigModal(configChipId);
    } catch (e) {
        alert("Erro: " + e.message);
    }
}

// =====================================================================
// Pair Modal
// =====================================================================

function showPairModal() {
    document.getElementById("pair-modal").classList.remove("hidden");
    wizardShowStep(0);
}

function closePairModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById("pair-modal").classList.add("hidden");
}

function wizardShowStep(n) {
    ["0", "1", "2"].forEach(id => {
        const el = document.getElementById("wizard-step-" + id);
        if (el) el.classList.toggle("hidden", id != n);
    });
    if (n === 2 || n === "2") {
        document.getElementById("pair-code").value = "";
        document.getElementById("pair-name").value = "";
        document.getElementById("pair-error").classList.add("hidden");
        setTimeout(() => document.getElementById("pair-code").focus(), 100);
    }
}

function wizardStart(mode) {
    wizardShowStep(mode === "new" ? 1 : 2);
}

function wizardNext(step) { wizardShowStep(step); }
function wizardBack(step) { wizardShowStep(step); }

async function doPair() {
    try {
        await api("/api/modules/pair", {
            method: "POST",
            body: {
                short_id: document.getElementById("pair-code").value,
                name: document.getElementById("pair-name").value,
            }
        });
        closePairModal();
        loadModules();
    } catch (e) {
        const el = document.getElementById("pair-error");
        el.textContent = e.message;
        el.classList.remove("hidden");
    }
}

// =====================================================================
// Auto-pair from URL or localStorage
// =====================================================================

let autoPairRetries = 0;
const AUTO_PAIR_MAX_RETRIES = 20; // 20 tentativas x 3s = 60s max

function checkPendingCode() {
    const params = new URLSearchParams(window.location.search);
    let code = params.get("code");

    if (!code) {
        code = localStorage.getItem("cultivee_hidro_cam_pending_code");
    }

    if (code && token) {
        localStorage.removeItem("cultivee_hidro_cam_pending_code");
        window.history.replaceState({}, "", window.location.pathname);
        doAutoPair(code);
    }
}

async function doAutoPair(code) {
    // Mostra indicador de conexao
    const list = document.getElementById("modules-list");
    list.innerHTML = `<div class="auto-pair-status">
        <div class="spinner"></div>
        <p>Conectando módulo <strong>${code}</strong>...</p>
        <p class="auto-pair-hint">Aguardando o módulo registrar no servidor</p>
    </div>`;

    try {
        await api("/api/modules/pair", {
            method: "POST",
            body: { short_id: code, name: "HidroCam" }
        });
        // Sucesso
        autoPairRetries = 0;
        loadModules();
    } catch (e) {
        autoPairRetries++;
        if (autoPairRetries < AUTO_PAIR_MAX_RETRIES) {
            // Retry em 3s
            list.innerHTML = `<div class="auto-pair-status">
                <div class="spinner"></div>
                <p>Conectando módulo <strong>${code}</strong>...</p>
                <p class="auto-pair-hint">Tentativa ${autoPairRetries}/${AUTO_PAIR_MAX_RETRIES} — aguardando módulo</p>
            </div>`;
            setTimeout(() => doAutoPair(code), 3000);
        } else {
            // Falhou apos todas tentativas — mostra modal manual
            autoPairRetries = 0;
            list.innerHTML = `<div class="auto-pair-status">
                <p>Não foi possível conectar automaticamente.</p>
                <button class="btn-primary" onclick="showPairModal()" style="margin-top:0.5rem">Vincular com código</button>
            </div>`;
        }
    }
}

// =====================================================================
// CAMERA MODULE (isolado — deletar este bloco remove toda funcionalidade)
// Para desabilitar: mudar CAMERA_ENABLED = false
// Para deletar: remover este bloco + a linha cam_render() no renderModules()
// =====================================================================

const CAMERA_ENABLED = true;
let cam_expanded = false;
let cam_pending = false;
let cam_imageUrl = null;
let cam_lastLoaded = false;

function cam_render() {
    if (!CAMERA_ENABLED) return;
    const section = document.getElementById("section-camera");
    if (!section) return;

    const onlineModule = modules.find(m => m.online);
    const camReady = onlineModule && onlineModule.ctrl_data && onlineModule.ctrl_data.camera_ready;
    const camOnline = !!camReady;
    const chipId = onlineModule ? onlineModule.chip_id : null;

    if (!onlineModule) {
        section.innerHTML = "";
        return;
    }

    const statusText = camOnline ? "Pronta" : "Offline";
    const btnDisabled = !camOnline || cam_pending;

    section.innerHTML = `
        <div class="cam-card">
            <div class="cam-header" onclick="cam_toggle()">
                <div class="module-compact-info">
                    <span class="status-dot ${camOnline ? 'online' : 'offline'}"></span>
                    <span class="module-compact-name">Camera</span>
                    <span class="module-compact-meta" style="color:var(--text-dim)">${statusText}</span>
                </div>
                <svg class="module-chevron" id="cam-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="${cam_expanded ? 'transform:rotate(180deg)' : ''}"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="cam-body ${cam_expanded ? '' : 'hidden'}" id="cam-body">
                <div class="cam-preview" id="cam-preview">
                    ${cam_imageUrl
                        ? `<img src="${cam_imageUrl}&token=${token}" alt="Captura" />`
                        : `<div class="cam-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            <p>${camOnline ? 'Toque em Capturar' : 'Camera nao conectada'}</p>
                        </div>`
                    }
                </div>
                <div class="cam-actions">
                    <button class="cam-btn ${cam_pending ? 'pending' : ''}" onclick="cam_capture('${chipId}')" ${btnDisabled ? 'disabled' : ''}>
                        ${cam_pending
                            ? '<span class="btn-spinner"></span> Capturando...'
                            : '&#128247; Capturar'
                        }
                    </button>
                </div>
            </div>
        </div>`;

    if (cam_expanded && !cam_lastLoaded && chipId && camOnline) {
        cam_lastLoaded = true;
        cam_loadLast(chipId);
    }
}

function cam_toggle() {
    cam_expanded = !cam_expanded;
    cam_render();
    if (cam_expanded && !cam_lastLoaded && activeCtrlChipId) {
        cam_lastLoaded = true;
        cam_loadLast(activeCtrlChipId);
    }
}

async function cam_capture(chipId) {
    if (!chipId || cam_pending) return;
    cam_pending = true;
    cam_render();

    try {
        // Enfileira comando de captura no servidor
        await api(`/api/hidro-cam/${chipId}/capture`);

        // Polling: espera a imagem chegar (ESP32 envia via push, max 15s)
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1500));
            try {
                const data = await api(`/api/hidro-cam/${chipId}/last-capture`);
                if (data.status === "ok" && data.url) {
                    const newUrl = data.url + "?t=" + Date.now();
                    if (newUrl !== cam_imageUrl) {
                        cam_imageUrl = newUrl;
                        break;
                    }
                }
            } catch (e) { break; }
        }
    } catch (e) {
        console.error("Erro captura:", e);
    }

    cam_pending = false;
    cam_render();
}

async function cam_loadLast(chipId) {
    try {
        const data = await api(`/api/hidro-cam/${chipId}/last-capture`);
        if (data.status === "ok" && data.url) {
            cam_imageUrl = data.url + "?t=" + Date.now();
            cam_render();
        }
    } catch (e) { /* sem imagem anterior */ }
}

// =====================================================================
// Init
// =====================================================================

// Detecta modo offline e decide qual tela mostrar
async function initApp() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
        localStorage.setItem("cultivee_hidro_cam_pending_code", code);
    }

    // Testa conexão real com o servidor (navigator.onLine não é confiável)
    const serverOnline = await checkServerConnection();

    if (token && user && serverOnline) {
        enterApp();
        setTimeout(checkPendingCode, 500);
    } else if (!serverOnline) {
        showOfflineScreen();
    } else {
        document.getElementById("auth-screen").classList.remove("hidden");
    }
}

async function checkServerConnection() {
    try {
        const res = await fetch("/api/modules/register", {
            method: "HEAD",
            signal: AbortSignal.timeout(3000)
        });
        return true;
    } catch (e) {
        return false;
    }
}

function showOfflineScreen() {
    document.getElementById("offline-screen").classList.remove("hidden");
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("app-screen").classList.add("hidden");
}

// Detecta quando a conexão volta
window.addEventListener("online", () => {
    if (!document.getElementById("offline-screen").classList.contains("hidden")) {
        location.reload();
    }
});

initApp();

// Poll modules + status every 5s
setInterval(() => {
    if (token) {
        loadModules();
    }
}, 5000);

// Poll ctrl status every 3s (pula se houve toggle recente)
setInterval(() => {
    if (token && activeCtrlChipId) {
        if (Date.now() - lastToggleTime < TOGGLE_COOLDOWN) return;
        loadCtrlStatus(activeCtrlChipId);
    }
}, 3000);

// =====================================================================
// PWA Install
// =====================================================================

let deferredPrompt = null;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => {
            console.log('SW registrado:', reg.scope);
            setInterval(() => reg.update(), 30 * 60 * 1000);

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                });
            });
        })
        .catch(err => console.log('SW erro:', err));

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'APP_UPDATED') {
            showUpdateBanner(event.data.version);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.getElementById('app-footer');
    if (footer) {
        footer.textContent = `Cultivee HidroCam v${APP_VERSION}`;
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const dismissed = localStorage.getItem('pwa_ctrl_dismissed');
    if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
    }
    showPwaBanner();
});

window.addEventListener('appinstalled', () => {
    hidePwaBanner();
    deferredPrompt = null;
});

function showPwaBanner() {
    const banner = document.getElementById('pwa-banner');
    if (banner) banner.classList.remove('hidden');
}

function hidePwaBanner() {
    const banner = document.getElementById('pwa-banner');
    if (banner) banner.classList.add('hidden');
}

function pwaInstall() {
    if (!deferredPrompt) {
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
            alert('Para instalar:\n1. Toque no botao de compartilhar\n2. Selecione "Adicionar a Tela de Início"');
        } else {
            alert('Para instalar:\n1. Abra o menu do navegador (3 pontos)\n2. Selecione "Instalar aplicativo"');
        }
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
        deferredPrompt = null;
        hidePwaBanner();
    });
}

function pwaDismiss() {
    hidePwaBanner();
    localStorage.setItem('pwa_ctrl_dismissed', Date.now().toString());
}

// =====================================================================
// App Update
// =====================================================================

function showUpdateBanner(newVersion) {
    let banner = document.getElementById('update-banner');
    if (banner) banner.remove();

    banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.className = 'update-banner';
    banner.innerHTML = `
        <div class="update-banner-inner">
            <div class="update-banner-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <div>
                    <strong>Nova versao disponivel${newVersion ? ' (v' + newVersion + ')' : ''}</strong>
                    <small>Atualize para ter as ultimas melhorias</small>
                </div>
            </div>
            <div class="update-banner-actions">
                <button class="pwa-btn-install" onclick="doAppUpdate()">Atualizar</button>
                <button class="pwa-btn-dismiss" onclick="dismissUpdate()">Depois</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
}

function doAppUpdate() {
    const banner = document.getElementById('update-banner');
    if (banner) {
        banner.querySelector('.pwa-btn-install').textContent = 'Atualizando...';
        banner.querySelector('.pwa-btn-install').disabled = true;
    }

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });

    navigator.serviceWorker.ready.then((reg) => {
        if (reg.waiting) {
            reg.waiting.postMessage('SKIP_WAITING');
        } else {
            caches.keys().then(keys => {
                Promise.all(keys.map(k => caches.delete(k))).then(() => {
                    window.location.reload();
                });
            });
        }
    });

    setTimeout(() => {
        caches.keys().then(keys => {
            Promise.all(keys.map(k => caches.delete(k))).then(() => {
                window.location.reload();
            });
        });
    }, 3000);
}

function dismissUpdate() {
    const banner = document.getElementById('update-banner');
    if (banner) banner.remove();
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closePairModal(); });
