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
        const icon = m.type === "cam" ? "&#128247;" : "&#9881;";
        const statusDot = m.online
            ? '<span class="status-dot online"></span>'
            : '<span class="status-dot offline"></span>';
        const statusText = m.online ? "Online" : "Offline";
        const name = m.name || m.type.toUpperCase();

        let controls = "";
        if (m.type === "ctrl" && m.online) {
            controls = '<div class="module-controls">' +
                (m.gpios || []).map(g =>
                    `<button class="gpio-btn ${g.state ? 'on' : ''}" onclick="toggleGpio('${m.chip_id}','${g.name}')">${g.name}: ${g.state ? 'ON' : 'OFF'}</button>`
                ).join("") +
                '</div>';
        }

        return `<div class="module-item">
            <div class="module-info">
                <span class="module-icon">${icon}</span>
                <div>
                    <div class="module-name">${name}</div>
                    <div class="module-meta">${statusDot} ${statusText} &middot; ${m.short_id} &middot; ${m.ip || 'sem IP'}</div>
                </div>
            </div>
            ${controls}
        </div>`;
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

function refreshFrame() {
    if (!streamActive || !camChipId) return;
    const next = new Image();
    next.onload = function () {
        const el = document.getElementById("stream");
        el.src = next.src;
        el.classList.remove("hidden");
        document.getElementById("stream-offline").classList.add("hidden");
        document.getElementById("live-badge").classList.add("active");
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
        const sizeMB = (img.size_kb / 1024).toFixed(1);
        return `<div class="carousel-item" onclick="openModal('${img.filename}', '${img.date} ${img.time}', ${img.size_kb})">
            <img src="/api/images/${img.filename}?token=${token}" alt="${img.filename}" loading="lazy" />
            <div class="capture-info">${img.date} ${img.time}<span class="capture-size"> &middot; ${sizeMB} MB</span></div>
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
