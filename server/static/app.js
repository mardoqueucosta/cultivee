// =====================================================================
// Cultivee PWA — App Logic
// =====================================================================

let token = localStorage.getItem("cultivee_token");
let user = JSON.parse(localStorage.getItem("cultivee_user") || "null");
let modules = [];
let camChipId = null;

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
        localStorage.setItem("cultivee_token", token);
        localStorage.setItem("cultivee_user", JSON.stringify(user));
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
        localStorage.setItem("cultivee_token", token);
        localStorage.setItem("cultivee_user", JSON.stringify(user));
        enterApp();
    } catch (e) {
        showAuthError(e.message);
    }
}

function doLogout() {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
    token = null;
    user = null;
    localStorage.removeItem("cultivee_token");
    localStorage.removeItem("cultivee_user");
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
    loadCarousel();
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

function formatInterval(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    return `${Math.floor(seconds / 3600)}h`;
}

async function setCaptureInterval(chipId, interval) {
    try {
        await api("/api/modules/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chip_id: chipId, capture_interval: parseInt(interval) })
        });
        // Feedback visual
        const selects = document.querySelectorAll(".config-select");
        selects.forEach(s => {
            if (s.value == interval) {
                s.style.borderColor = "var(--primary)";
                setTimeout(() => s.style.borderColor = "", 1500);
            }
        });
    } catch (e) {
        alert("Erro ao alterar intervalo: " + e.message);
    }
}

// =====================================================================
// Modules
// =====================================================================

async function loadModules() {
    try {
        const data = await api("/api/modules");
        modules = data.modules;
        renderModules();

        // Procura camera para livestream
        const cam = modules.find(m => m.type === "cam" && m.online);
        if (cam) {
            camChipId = cam.chip_id;
            document.getElementById("section-stream").classList.remove("hidden");
            loadStream();
        } else {
            document.getElementById("section-stream").classList.add("hidden");
        }
    } catch (e) {
        if (e.message === "Nao autenticado") doLogout();
    }
}

function renderModules() {
    const list = document.getElementById("modules-list");

    if (modules.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>Nenhum modulo vinculado. Clique em "+ Adicionar".</p></div>';
        return;
    }

    list.innerHTML = modules.map(m => {
        const icon = m.type === "cam"
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
        const name = m.name || m.type.toUpperCase();

        if (m.online) {
            // --- ONLINE: mostra status detalhado ---
            const rssiBar = getRssiBar(m.rssi);
            const uptimeStr = formatUptime(m.uptime);
            const rssiLabel = getRssiLabel(m.rssi);

            const intervalLabel = formatInterval(m.capture_interval || 60);

            return `<div class="module-item module-online">
                <div class="module-header">
                    <div class="module-info">
                        <span class="module-icon-wrap online">${icon}</span>
                        <div>
                            <div class="module-name">${name}</div>
                            <div class="module-meta"><span class="status-dot online"></span> Online &middot; ${m.short_id}</div>
                        </div>
                    </div>
                </div>
                <div class="module-stats">
                    <div class="stat-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
                        <div class="stat-content">
                            <span class="stat-value">${m.ssid || '---'}</span>
                            <span class="stat-label">${rssiBar} ${rssiLabel}</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <div class="stat-content">
                            <span class="stat-value">${uptimeStr}</span>
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
                <div class="module-config">
                    <div class="config-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        <span class="config-label">Capturar a cada:</span>
                        <select class="config-select" onchange="setCaptureInterval('${m.chip_id}', this.value)">
                            <option value="10" ${m.capture_interval == 10 ? 'selected' : ''}>10s</option>
                            <option value="30" ${m.capture_interval == 30 ? 'selected' : ''}>30s</option>
                            <option value="60" ${m.capture_interval == 60 || !m.capture_interval ? 'selected' : ''}>1 min</option>
                            <option value="300" ${m.capture_interval == 300 ? 'selected' : ''}>5 min</option>
                            <option value="600" ${m.capture_interval == 600 ? 'selected' : ''}>10 min</option>
                            <option value="1800" ${m.capture_interval == 1800 ? 'selected' : ''}>30 min</option>
                            <option value="3600" ${m.capture_interval == 3600 ? 'selected' : ''}>1 hora</option>
                        </select>
                    </div>
                </div>
            </div>`;
        } else {
            // --- OFFLINE: mostra guia de conexao ---
            return `<div class="module-item module-offline">
                <div class="module-header">
                    <div class="module-info">
                        <span class="module-icon-wrap offline">${icon}</span>
                        <div>
                            <div class="module-name">${name}</div>
                            <div class="module-meta"><span class="status-dot offline"></span> Offline &middot; ${m.short_id}</div>
                        </div>
                    </div>
                </div>
                <div class="module-help">
                    <p class="help-title">Como conectar:</p>
                    <div class="help-steps">
                        <div class="help-step">
                            <span class="help-num">1</span>
                            <span>Ligue o modulo na tomada</span>
                        </div>
                        <div class="help-step">
                            <span class="help-num">2</span>
                            <span>O LED vai piscar rapido = modo Setup</span>
                        </div>
                        <div class="help-step">
                            <span class="help-num">3</span>
                            <span>No celular, conecte na rede <strong>Cultivee-Setup</strong></span>
                        </div>
                        <div class="help-step">
                            <span class="help-num">4</span>
                            <span>Configure o WiFi no portal que abrir</span>
                        </div>
                    </div>
                    <div class="help-led-guide">
                        <span class="led-item"><span class="led-blink-fast"></span> Pisca rapido = Setup</span>
                        <span class="led-item"><span class="led-pulse"></span> Pulsa = Conectado</span>
                        <span class="led-item"><span class="led-blink-triple"></span> 3 piscas = Sem WiFi</span>
                    </div>
                    ${hasBluetooth() ? '<button class="btn-ble" onclick="showBleModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/></svg> Configurar via Bluetooth</button>' : ''}
                </div>
            </div>`;
        }
    }).join("");
}

async function toggleGpio(chipId, gpioName) {
    try {
        await api(`/api/gpio/${chipId}?name=${gpioName}&action=toggle`);
        loadModules();
    } catch (e) {
        console.error("Erro GPIO:", e);
    }
}

// =====================================================================
// Pair Modal
// =====================================================================

// =====================================================================
// Setup Wizard
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
    for (let i = 0; i <= 4; i++) {
        const el = document.getElementById("wizard-step-" + i);
        if (el) el.classList.toggle("hidden", i !== n);
    }
    if (n === 4) {
        document.getElementById("pair-code").value = "";
        document.getElementById("pair-name").value = "";
        document.getElementById("pair-error").classList.add("hidden");
        setTimeout(() => document.getElementById("pair-code").focus(), 100);
    }
}

function wizardStart(mode) {
    if (mode === "new") {
        wizardShowStep(1);
    } else {
        wizardShowStep(4);
    }
}

function wizardNext(step) { wizardShowStep(step); }
function wizardBack(step) { wizardShowStep(step); }

function copyUrl() {
    navigator.clipboard.writeText("http://192.168.4.1").then(() => {
        const el = document.getElementById("url-copy-text");
        el.textContent = "copiado!";
        setTimeout(() => el.textContent = "copiar", 2000);
    }).catch(() => {});
}

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
        loadCarousel();
    } catch (e) {
        const el = document.getElementById("pair-error");
        el.textContent = e.message;
        el.classList.remove("hidden");
    }
}

// =====================================================================
// Stream
// =====================================================================

let streamActive = false;

function loadStream() {
    streamActive = true;
    refreshFrame();
}

function timeAgo(dateStr, timeStr) {
    // dateStr: "2026-03-20", timeStr: "21:17:10"
    const dt = new Date(dateStr + "T" + timeStr);
    const now = new Date();
    const diffS = Math.floor((now - dt) / 1000);
    if (diffS < 5) return "agora";
    if (diffS < 60) return `há ${diffS}s`;
    const diffM = Math.floor(diffS / 60);
    if (diffM < 60) return `há ${diffM}min`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `há ${diffD}d`;
}

let lastFrameTime = null;

function updateStreamInfo() {
    const info = document.getElementById("stream-info");
    if (!info) return;
    if (!lastFrameTime) {
        info.textContent = "";
        return;
    }
    const now = new Date();
    const diff = Math.floor((now - lastFrameTime) / 1000);
    const timeStr = lastFrameTime.toLocaleTimeString("pt-BR");
    if (diff < 2) {
        info.innerHTML = `<span class="stream-time">📷 ${timeStr}</span> <span class="stream-ago">agora</span>`;
    } else if (diff < 60) {
        info.innerHTML = `<span class="stream-time">📷 ${timeStr}</span> <span class="stream-ago">há ${diff}s</span>`;
    } else {
        const min = Math.floor(diff / 60);
        info.innerHTML = `<span class="stream-time">📷 ${timeStr}</span> <span class="stream-ago">há ${min}min</span>`;
    }
}

setInterval(updateStreamInfo, 1000);

function refreshFrame() {
    if (!streamActive || !camChipId) return;
    const next = new Image();
    next.onload = function () {
        const el = document.getElementById("stream");
        el.src = next.src;
        el.classList.remove("hidden");
        document.getElementById("stream-offline").classList.add("hidden");
        document.getElementById("live-badge").classList.add("active");
        lastFrameTime = new Date();
        updateStreamInfo();
        setTimeout(refreshFrame, 1000);
    };
    next.onerror = function () {
        document.getElementById("stream").classList.add("hidden");
        document.getElementById("stream-offline").classList.remove("hidden");
        document.getElementById("live-badge").classList.remove("active");
        setTimeout(refreshFrame, 3000);
    };
    next.src = `/api/live/${camChipId}?token=${token}&t=` + Date.now();
}

// =====================================================================
// Carousel
// =====================================================================

let carouselImages = [];
let carouselOffset = 0;
const VISIBLE = 4;

async function loadCarousel() {
    try {
        const data = await api("/api/images?page=1&per_page=50");
        carouselImages = data.images;
        carouselOffset = 0;
        renderCarousel();
    } catch (e) {
        console.error("Erro carousel:", e);
    }
}

function renderCarousel() {
    const track = document.getElementById("carousel-track");
    const counter = document.getElementById("carousel-counter");
    const visible = carouselImages.slice(carouselOffset, carouselOffset + VISIBLE);
    const totalPages = Math.max(1, Math.ceil(carouselImages.length / VISIBLE));
    const currentPage = Math.floor(carouselOffset / VISIBLE) + 1;
    counter.textContent = `${currentPage}/${totalPages}`;

    if (visible.length === 0) {
        track.innerHTML = '<div class="empty-state"><p>Nenhuma captura ainda</p></div>';
        return;
    }

    track.innerHTML = visible.map(img => {
        const sizeStr = img.size_kb >= 1024 ? (img.size_kb / 1024).toFixed(1) + ' MB' : img.size_kb.toFixed(0) + ' KB';
        const ago = timeAgo(img.date, img.time);
        return `<div class="carousel-item" onclick="openModal('${img.filename}', '${img.date} ${img.time}', ${img.size_kb})">
            <img src="/api/images/${img.filename}?token=${token}" alt="${img.filename}" loading="lazy" />
            <div class="capture-info">${img.date} ${img.time}<span class="capture-size"> &middot; ${sizeStr}</span></div>
            <div class="capture-ago">${ago}</div>
        </div>`;
    }).join("");
}

function carouselPrev() {
    if (carouselOffset > 0) { carouselOffset -= VISIBLE; renderCarousel(); }
}
function carouselNext() {
    if (carouselOffset + VISIBLE < carouselImages.length) { carouselOffset += VISIBLE; renderCarousel(); }
}

// =====================================================================
// Image Modal
// =====================================================================

function openModal(filename, dt, sizeKb) {
    document.getElementById("modal-img").src = `/api/images/${filename}?token=${token}`;
    document.getElementById("modal-info").textContent = `${dt} | ${sizeKb} KB | ${filename}`;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById("modal").classList.add("hidden");
}

document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closePairModal(); } });

// =====================================================================
// Auto-pair from URL or localStorage
// =====================================================================

function checkPendingCode() {
    const params = new URLSearchParams(window.location.search);
    let code = params.get("code");

    // Tenta localStorage se nao veio na URL
    if (!code) {
        code = localStorage.getItem("cultivee_pending_code");
    }

    if (code && token) {
        // Limpa
        localStorage.removeItem("cultivee_pending_code");
        window.history.replaceState({}, "", window.location.pathname);

        // Abre modal com codigo preenchido
        showPairModal();
        wizardShowStep(4);
        document.getElementById("pair-code").value = code;
        document.getElementById("pair-name").focus();
    }
}

// =====================================================================
// Init
// =====================================================================

if (token && user) {
    enterApp();
    setTimeout(checkPendingCode, 500);
} else {
    document.getElementById("auth-screen").classList.remove("hidden");
    // Salva code para usar apos login
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
        localStorage.setItem("cultivee_pending_code", code);
    }
}

setInterval(() => {
    if (token) { loadModules(); loadCarousel(); }
}, 5000);

// =====================================================================
// Web Bluetooth - Configuracao WiFi via BLE
// =====================================================================

const BLE_SERVICE = "fb1e4001-54ae-4a28-9f74-dfccb248601d";
const BLE_SSID    = "fb1e4002-54ae-4a28-9f74-dfccb248601d";
const BLE_PASS    = "fb1e4003-54ae-4a28-9f74-dfccb248601d";
const BLE_CMD     = "fb1e4004-54ae-4a28-9f74-dfccb248601d";
const BLE_STATUS  = "fb1e4005-54ae-4a28-9f74-dfccb248601d";

let bleDevice = null;
let bleChars = {};

function hasBluetooth() {
    return navigator.bluetooth !== undefined;
}

async function bleConnect() {
    const statusEl = document.getElementById("ble-status");
    const networksList = document.getElementById("ble-networks");

    if (!hasBluetooth()) {
        statusEl.textContent = "Bluetooth nao suportado neste navegador. Use Chrome.";
        statusEl.className = "ble-status error";
        return;
    }

    try {
        statusEl.textContent = "Buscando dispositivos Cultivee...";
        statusEl.className = "ble-status info";

        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "Cultivee-" }],
            optionalServices: [BLE_SERVICE]
        });

        statusEl.textContent = "Conectando a " + bleDevice.name + "...";

        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService(BLE_SERVICE);

        bleChars.ssid = await service.getCharacteristic(BLE_SSID);
        bleChars.pass = await service.getCharacteristic(BLE_PASS);
        bleChars.cmd = await service.getCharacteristic(BLE_CMD);
        bleChars.status = await service.getCharacteristic(BLE_STATUS);

        // Escuta notificacoes de status
        await bleChars.status.startNotifications();
        bleChars.status.addEventListener("characteristicvaluechanged", (e) => {
            const val = new TextDecoder().decode(e.target.value);
            handleBleStatus(val);
        });

        statusEl.textContent = "Conectado a " + bleDevice.name + "! Buscando redes WiFi...";
        statusEl.className = "ble-status success";

        // Mostra secao de WiFi
        document.getElementById("ble-wifi-section").classList.remove("hidden");
        document.getElementById("ble-connect-btn").classList.add("hidden");

        // Solicita scan de redes
        const encoder = new TextEncoder();
        await bleChars.cmd.writeValue(encoder.encode("scan"));

    } catch (e) {
        console.error("BLE erro:", e);
        if (e.name === "NotFoundError") {
            statusEl.textContent = "Nenhum dispositivo selecionado.";
        } else {
            statusEl.textContent = "Erro: " + e.message;
        }
        statusEl.className = "ble-status error";
    }
}

function handleBleStatus(val) {
    const statusEl = document.getElementById("ble-status");
    console.log("BLE status:", val);

    if (val.startsWith("networks:")) {
        // Recebeu lista de redes WiFi
        const raw = val.substring(9);
        const networks = raw.split("|").map(n => {
            const [ssid, rssi] = n.split(",");
            return { ssid, rssi: parseInt(rssi) };
        }).filter(n => n.ssid);

        const list = document.getElementById("ble-networks");
        list.innerHTML = networks.map(n => {
            const bars = n.rssi > -50 ? "████" : n.rssi > -65 ? "███░" : n.rssi > -75 ? "██░░" : "█░░░";
            return `<div class="ble-network" onclick="bleSelectNetwork('${n.ssid.replace(/'/g, "\\'")}')">
                <span class="ble-network-name">${n.ssid}</span>
                <span class="ble-network-signal">${bars}</span>
            </div>`;
        }).join("");

        statusEl.textContent = `${networks.length} redes encontradas. Selecione uma:`;
        statusEl.className = "ble-status success";

    } else if (val === "ssid_ok") {
        statusEl.textContent = "SSID recebido pelo modulo.";
    } else if (val === "pass_ok") {
        statusEl.textContent = "Senha recebida pelo modulo.";
    } else if (val === "connecting") {
        statusEl.textContent = "Modulo conectando ao WiFi... Aguarde o reinicio.";
        statusEl.className = "ble-status info";
        // Fecha modal apos 3s
        setTimeout(() => {
            closeBleModal();
            // Recarrega modulos apos 10s para ver se conectou
            setTimeout(loadModules, 10000);
        }, 3000);
    } else if (val.startsWith("error:")) {
        statusEl.textContent = "Erro: " + val.substring(6);
        statusEl.className = "ble-status error";
    }
}

function bleSelectNetwork(ssid) {
    document.getElementById("ble-ssid").value = ssid;
    document.getElementById("ble-pass-section").classList.remove("hidden");
    document.getElementById("ble-pass").focus();
    document.getElementById("ble-status").textContent = `Rede selecionada: ${ssid}`;
}

async function bleSendCredentials() {
    const ssid = document.getElementById("ble-ssid").value;
    const pass = document.getElementById("ble-pass").value;
    const statusEl = document.getElementById("ble-status");

    if (!ssid) {
        statusEl.textContent = "Selecione uma rede WiFi.";
        statusEl.className = "ble-status error";
        return;
    }

    try {
        const encoder = new TextEncoder();
        statusEl.textContent = "Enviando credenciais...";
        statusEl.className = "ble-status info";

        await bleChars.ssid.writeValue(encoder.encode(ssid));
        await new Promise(r => setTimeout(r, 300));
        await bleChars.pass.writeValue(encoder.encode(pass));
        await new Promise(r => setTimeout(r, 300));
        await bleChars.cmd.writeValue(encoder.encode("connect"));

        statusEl.textContent = "Credenciais enviadas! O modulo vai reiniciar...";
        statusEl.className = "ble-status success";
    } catch (e) {
        statusEl.textContent = "Erro ao enviar: " + e.message;
        statusEl.className = "ble-status error";
    }
}

function showBleModal() {
    document.getElementById("ble-modal").classList.remove("hidden");
    document.getElementById("ble-status").textContent = "Clique em 'Buscar Modulo' para iniciar.";
    document.getElementById("ble-status").className = "ble-status info";
    document.getElementById("ble-connect-btn").classList.remove("hidden");
    document.getElementById("ble-wifi-section").classList.add("hidden");
    document.getElementById("ble-pass-section").classList.add("hidden");
    document.getElementById("ble-networks").innerHTML = "";
}

function closeBleModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById("ble-modal").classList.add("hidden");
    if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
    }
    bleDevice = null;
    bleChars = {};
}

// =====================================================================
// PWA Install
// =====================================================================

const APP_VERSION = '1.0.0';
let deferredPrompt = null;

// Registrar Service Worker + verificar atualizacoes
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => {
            console.log('SW registrado:', reg.scope);

            // Verificar atualizacoes a cada 30 minutos
            setInterval(() => reg.update(), 30 * 60 * 1000);

            // Detectar novo SW instalado (atualizacao disponivel)
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Novo SW pronto, mostrar banner de atualizacao
                        showUpdateBanner();
                    }
                });
            });
        })
        .catch(err => console.log('SW erro:', err));

    // Escutar mensagens do SW
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'APP_UPDATED') {
            showUpdateBanner(event.data.version);
        }
        if (event.data.type === 'VERSION') {
            console.log('SW version:', event.data.version);
        }
    });
}

// Mostrar versao no footer
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.textContent = `Cultivee v${APP_VERSION} · Monitoramento inteligente`;
    }
});

// Capturar evento de instalacao
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Verificar se ja foi dispensado recentemente
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        // Mostra novamente apos 7 dias
        if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
    }
    showPwaBanner();
});

// Verificar se ja esta instalado
window.addEventListener('appinstalled', () => {
    console.log('Cultivee instalado!');
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
        // Fallback: mostrar instrucoes manuais
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
            alert('Para instalar:\n1. Toque no botao de compartilhar (quadrado com seta)\n2. Selecione "Adicionar a Tela de Inicio"');
        } else {
            alert('Para instalar:\n1. Abra o menu do navegador (3 pontos)\n2. Selecione "Instalar aplicativo" ou "Adicionar a tela inicial"');
        }
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
        if (result.outcome === 'accepted') {
            console.log('PWA instalada!');
        }
        deferredPrompt = null;
        hidePwaBanner();
    });
}

function pwaDismiss() {
    hidePwaBanner();
    localStorage.setItem('pwa_dismissed', Date.now().toString());
}

// =====================================================================
// App Update
// =====================================================================

function showUpdateBanner(newVersion) {
    // Remover banner existente se houver
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
    if (banner) banner.remove();

    // Forcar o novo SW a ativar
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
            if (reg.waiting) {
                reg.waiting.postMessage('SKIP_WAITING');
            }
        });
    }

    // Recarregar a pagina para carregar nova versao
    window.location.reload(true);
}

function dismissUpdate() {
    const banner = document.getElementById('update-banner');
    if (banner) banner.remove();
}
