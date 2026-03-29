# Plano de Implementacao: Captura Agendada de Imagens

## Contexto
- **Versao atual:** Cultivee 3.0
- **Hardware:** ESP32-CAM WROVER conectado via WiFi
- **Servidor:** app.cultivee.com.br (Flask + SQLite na VPS)
- **Layout atual:** Header + Card Camera (live + botoes Capturar/Parar)
- **Objetivo:** Adicionar captura agendada com intervalo configuravel, controle iniciar/parar, e galeria de imagens salvas

---

## Arquitetura da Solucao

### Fluxo de dados
```
ESP32-CAM registra a cada 30s no servidor
    ↓
Servidor responde com {capture_interval, recording: true/false}
    ↓
ESP32 ajusta intervalo e envia imagem via POST /api/modules/upload
    ↓
Servidor salva em /app/data/images/{user_id}/{YYYY-MM-DD}/{HH-MM-SS}.jpg
    ↓
Frontend poll a cada 5s e atualiza galeria
```

### Decisao tecnica
- **ESP32 envia as imagens** (firmware-side) — nao o servidor puxando
- Motivo: ESP32 esta em rede local (NAT), VPS nao acessa IP local do ESP32
- O firmware ja suporta `capture_interval` e `recording` via resposta do `/register`

---

## Mudancas por Arquivo

### 1. FIRMWARE (`firmware-cam/firmware-cam.ino`)

**Verificar/ajustar:**

- [ ] Na funcao `registerOnServer()`: confirmar que extrai `capture_interval` e `recording` da resposta JSON do servidor
- [ ] Na funcao `uploadImageToServer()`: confirmar que respeita `uploadInterval` (em ms) e so envia se `recording == true`
- [ ] Alterar `uploadInterval` default de `60000` para `600000` (10 minutos)

**Logica esperada (ja deve existir):**
```cpp
// No loop ou funcao de upload:
if (!recording) return;  // nao envia se gravacao parada
if (millis() - lastUpload < uploadInterval) return;  // respeita intervalo

camera_fb_t *fb = esp_camera_fb_get();
// POST para /api/modules/upload?chip_id={chipId}
http.POST(fb->buf, fb->len);
lastUpload = millis();
```

---

### 2. SERVIDOR (`server/app.py`)

**2a. Rota POST `/api/modules/upload`** (verificar/ajustar)

- [ ] Recebe imagem JPEG raw via POST body
- [ ] Identifica modulo pelo `chip_id` (query param)
- [ ] Verifica se `recording == True` no banco, senao retorna `{"status": "skipped"}`
- [ ] Salva em `DATA_DIR/{user_id}/{YYYY-MM-DD}/{HH-MM-SS}.jpg`
- [ ] Cria diretorio do usuario e da data se nao existir
- [ ] Retorna `{"status": "ok", "file": "...", "size_kb": ...}`

**2b. Rota POST `/api/modules/config`** (verificar/ajustar)

- [ ] Recebe JSON `{chip_id, capture_interval, recording}`
- [ ] Valida `capture_interval` entre 10 e 86400 (10s a 24h)
- [ ] Salva no banco (tabela `modules`)
- [ ] Retorna config atualizada

**2c. Rota GET `/api/images`** (verificar/ajustar)

- [ ] Lista imagens do usuario autenticado
- [ ] Paginacao: `?page=1&per_page=50`
- [ ] Retorna: `{images: [{filename, size_kb, created_at}, ...], total, page}`
- [ ] Ordenar por data decrescente (mais recentes primeiro)

**2d. Rota GET `/api/images/<path>`** (verificar/ajustar)

- [ ] Serve imagem com autenticacao (token via query param para <img> tags)

**2e. Remover `capture_thread`** (se existir)

- [ ] Remover thread server-side que puxa imagem do ESP32 via HTTP
- [ ] Motivo: redundante, so funciona em rede local, causa duplicatas

**2f. Rota POST `/api/modules/register`** (verificar resposta)

- [ ] Confirmar que a resposta inclui `capture_interval` e `recording` do banco
- [ ] Exemplo de resposta: `{"capture_interval": 600, "recording": true}`

---

### 3. BANCO DE DADOS (`server/models.py`)

**Colunas na tabela `modules`** (verificar/migrar):

- [ ] `capture_interval INTEGER DEFAULT 600` — alterar default de 60 para 600
- [ ] `recording INTEGER DEFAULT 0` — boolean 0/1
- [ ] Usar padrao de auto-migracao com `ALTER TABLE ADD COLUMN` + try/except

---

### 4. FRONTEND — HTML (`server/static/index.html`)

**Adicionar apos a secao existente (Camera + Capturar/Parar):**

```html
<!-- Card: Captura Agendada (NOVO) -->
<section class="card" id="section-scheduled">
    <div class="card-header">
        <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h2>Captura Agendada</h2>
        </div>
        <div class="scheduled-badge hidden" id="scheduled-badge">
            <span class="rec-dot-green"></span>
            Gravando
        </div>
    </div>
    <div class="scheduled-body">
        <!-- Dropdown intervalo -->
        <div class="scheduled-interval">
            <label class="scheduled-label">Intervalo de captura</label>
            <select id="capture-interval" class="config-select-lg"
                    onchange="setCaptureInterval(this.value)">
                <option value="10">10 segundos</option>
                <option value="30">30 segundos</option>
                <option value="60">1 minuto</option>
                <option value="300">5 minutos</option>
                <option value="600" selected>10 minutos</option>
                <option value="1800">30 minutos</option>
                <option value="3600">1 hora</option>
            </select>
        </div>

        <!-- Barra progresso (visivel so quando gravando) -->
        <div class="scheduled-progress hidden" id="scheduled-progress">
            <span class="progress-label" id="progress-label">
                Proxima captura em 0:00
            </span>
            <div class="progress-bar-scheduled">
                <div class="progress-fill-scheduled" id="progress-fill"></div>
            </div>
        </div>

        <!-- Botao iniciar/parar -->
        <button class="btn-scheduled" id="btn-scheduled"
                onclick="toggleScheduledRecording()">
            <span id="scheduled-icon">▶</span>
            <span id="scheduled-label">Iniciar Gravacao</span>
        </button>
    </div>
</section>

<!-- Card: Galeria (NOVO) -->
<section class="card" id="section-gallery">
    <div class="card-header">
        <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
            </svg>
            <h2>Galeria</h2>
        </div>
        <div class="carousel-controls">
            <button class="btn-icon" onclick="galleryPrev()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
            <span class="carousel-counter" id="gallery-counter">0/0</span>
            <button class="btn-icon" onclick="galleryNext()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
        </div>
    </div>
    <div class="gallery-track" id="gallery-track">
        <div class="empty-state">
            <p>Nenhuma captura salva ainda</p>
        </div>
    </div>
</section>
```

---

### 5. FRONTEND — CSS (`server/static/style.css`)

**Adicionar estilos para os novos cards:**

```css
/* --- Captura Agendada -------------------------------------------- */
.scheduled-body {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.scheduled-interval {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.scheduled-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.config-select-lg {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 0.9rem;
    background: var(--bg-card);
    color: var(--text);
    cursor: pointer;
}
.config-select-lg:focus {
    outline: none;
    border-color: var(--primary);
}
.config-select-lg:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Badge gravando */
.scheduled-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--primary);
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    background: hsl(142 50% 95%);
    border: 1px solid hsl(142 50% 85%);
}
.rec-dot-green {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary);
    animation: pulse-dot 1.5s ease-in-out infinite;
}

/* Barra de progresso countdown */
.scheduled-progress {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}
.progress-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
}
.progress-bar-scheduled {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
}
.progress-fill-scheduled {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 3px;
    transition: width 1s linear;
    width: 0%;
}

/* Botao iniciar/parar */
.btn-scheduled {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.85rem;
    border: 2px solid var(--primary);
    border-radius: var(--radius);
    background: transparent;
    color: var(--primary);
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-scheduled:hover {
    background: var(--primary);
    color: #fff;
}
.btn-scheduled.recording {
    border-color: #e74c3c;
    color: #e74c3c;
}
.btn-scheduled.recording:hover {
    background: #e74c3c;
    color: #fff;
}

/* --- Galeria ------------------------------------------------------ */
.gallery-track {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem 1.25rem;
}
.gallery-item {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    background: hsl(220 15% 95%);
}
.gallery-item:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
}
.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.gallery-item .gallery-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, hsl(0 0% 0% / 0.75));
    padding: 1.5rem 0.6rem 0.5rem;
    font-size: 0.65rem;
    color: hsl(0 0% 85%);
    text-align: center;
    font-weight: 500;
}
.gallery-info .gallery-size {
    color: var(--primary-light);
}
.gallery-ago {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    background: hsl(0 0% 0% / 0.65);
    color: var(--primary-light);
    font-size: 0.6rem;
    font-weight: 600;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
}

/* Desktop: 4 colunas na galeria */
@media (min-width: 769px) {
    .gallery-track {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

---

### 6. FRONTEND — JavaScript (`server/static/app.js`)

**6a. Variaveis globais (adicionar):**

```javascript
let galleryImages = [];
let galleryOffset = 0;
const GALLERY_VISIBLE = 4;  // por pagina
let countdownTimer = null;
let countdownRemaining = 0;
```

**6b. Funcao `toggleScheduledRecording()` (nova):**

```javascript
async function toggleScheduledRecording() {
    const cam = modules.find(m => m.type === 'cam' && isOnline(m));
    if (!cam) return alert('Nenhuma camera online');

    const isRec = cam.recording;
    const newState = !isRec;

    await api('/api/modules/config', {
        method: 'POST',
        body: { chip_id: cam.chip_id, recording: newState }
    });

    cam.recording = newState;
    updateScheduledUI(cam);

    if (newState) {
        startCountdown(cam.capture_interval);
    } else {
        stopCountdown();
    }
}
```

**6c. Funcao `setCaptureInterval()` (nova/ajustar):**

```javascript
async function setCaptureInterval(value) {
    const cam = modules.find(m => m.type === 'cam' && isOnline(m));
    if (!cam) return;

    const interval = parseInt(value);
    await api('/api/modules/config', {
        method: 'POST',
        body: { chip_id: cam.chip_id, capture_interval: interval }
    });

    cam.capture_interval = interval;
}
```

**6d. Funcao `updateScheduledUI()` (nova):**

```javascript
function updateScheduledUI(cam) {
    const btn = document.getElementById('btn-scheduled');
    const badge = document.getElementById('scheduled-badge');
    const progress = document.getElementById('scheduled-progress');
    const select = document.getElementById('capture-interval');
    const icon = document.getElementById('scheduled-icon');
    const label = document.getElementById('scheduled-label');

    if (cam && cam.recording) {
        btn.classList.add('recording');
        icon.textContent = '■';
        label.textContent = 'Parar Gravacao';
        badge.classList.remove('hidden');
        progress.classList.remove('hidden');
        select.disabled = true;
    } else {
        btn.classList.remove('recording');
        icon.textContent = '▶';
        label.textContent = 'Iniciar Gravacao';
        badge.classList.add('hidden');
        progress.classList.add('hidden');
        select.disabled = false;
    }

    // Sincronizar dropdown com valor do servidor
    if (cam && cam.capture_interval) {
        select.value = cam.capture_interval;
    }
}
```

**6e. Funcoes de countdown (novas):**

```javascript
function startCountdown(intervalSeconds) {
    countdownRemaining = intervalSeconds;
    stopCountdown();  // limpa anterior

    countdownTimer = setInterval(() => {
        countdownRemaining--;
        if (countdownRemaining <= 0) {
            countdownRemaining = intervalSeconds;  // reinicia ciclo
        }
        updateProgressBar(countdownRemaining, intervalSeconds);
    }, 1000);
}

function stopCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

function updateProgressBar(remaining, total) {
    const pct = ((total - remaining) / total) * 100;
    const min = Math.floor(remaining / 60);
    const sec = String(remaining % 60).padStart(2, '0');

    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-label').textContent =
        `Proxima captura em ${min}:${sec}`;
}
```

**6f. Funcoes da galeria (novas):**

```javascript
async function loadGallery() {
    try {
        const data = await api('/api/images?page=1&per_page=50');
        galleryImages = data.images || [];
        galleryOffset = 0;
        renderGallery();
    } catch (e) {
        console.error('Erro ao carregar galeria:', e);
    }
}

function renderGallery() {
    const track = document.getElementById('gallery-track');
    const counter = document.getElementById('gallery-counter');

    if (!galleryImages.length) {
        track.innerHTML = '<div class="empty-state"><p>Nenhuma captura salva ainda</p></div>';
        counter.textContent = '0/0';
        return;
    }

    const slice = galleryImages.slice(galleryOffset, galleryOffset + GALLERY_VISIBLE);
    const totalPages = Math.ceil(galleryImages.length / GALLERY_VISIBLE);
    const currentPage = Math.floor(galleryOffset / GALLERY_VISIBLE) + 1;

    counter.textContent = `${currentPage}/${totalPages}`;

    track.innerHTML = slice.map(img => {
        const sizeStr = img.size_kb >= 1024
            ? (img.size_kb / 1024).toFixed(1) + ' MB'
            : img.size_kb.toFixed(0) + ' KB';
        const ago = timeAgo(img.created_at);
        const dateStr = formatDateTime(img.created_at);

        return `
            <div class="gallery-item" onclick="openModal('${img.filename}', '${dateStr}', '${sizeStr}')">
                <img src="/api/images/${img.filename}?token=${token}"
                     alt="Captura" loading="lazy" />
                <span class="gallery-ago">${ago}</span>
                <div class="gallery-info">
                    ${dateStr} · <span class="gallery-size">${sizeStr}</span>
                </div>
            </div>`;
    }).join('');
}

function galleryPrev() {
    if (galleryOffset > 0) {
        galleryOffset -= GALLERY_VISIBLE;
        renderGallery();
    }
}

function galleryNext() {
    if (galleryOffset + GALLERY_VISIBLE < galleryImages.length) {
        galleryOffset += GALLERY_VISIBLE;
        renderGallery();
    }
}
```

**6g. Integrar no polling existente:**

```javascript
// No setInterval existente (a cada 5s), adicionar:
loadGallery();

// No loadModules, apos receber modulos, chamar:
const cam = modules.find(m => m.type === 'cam');
if (cam) updateScheduledUI(cam);
```

**6h. Atualizar versao:**

```javascript
const APP_VERSION = '3.1.0';  // em app.js E sw.js
```

---

### 7. SERVICE WORKER (`server/static/sw.js`)

- [ ] Atualizar `APP_VERSION` para `'3.1.0'`

---

## Armazenamento no Servidor

```
/app/data/images/
├── live/
│   └── {chip_id}.jpg          ← frame live (sobrescreve)
└── {user_id}/
    └── {YYYY-MM-DD}/
        ├── 14-30-00.jpg       ← captura agendada
        ├── 14-40-00.jpg       ← captura agendada (10min depois)
        ├── 14-50-00.jpg
        └── ...
```

---

## Ordem de Implementacao

### Fase 1 — Backend (verificar/ajustar)
1. Verificar rotas existentes em `app.py` (upload, config, images, register)
2. Alterar default `capture_interval` de 60 para 600 em `models.py`
3. Remover `capture_thread` se existir (redundante)
4. Testar: `POST /api/modules/config` com `{recording: true, capture_interval: 600}`

### Fase 2 — Frontend (implementar)
1. Adicionar HTML dos cards "Captura Agendada" e "Galeria" em `index.html`
2. Adicionar CSS em `style.css`
3. Adicionar funcoes JS em `app.js`
4. Testar localmente com `python server/app.py`

### Fase 3 — Firmware (verificar)
1. Confirmar que firmware extrai `capture_interval` e `recording` do `/register`
2. Alterar default `uploadInterval` para `600000` (10min)
3. Compilar e gravar no ESP32

### Fase 4 — Deploy
1. Incrementar versao para 3.1.0 (app.js + sw.js)
2. `git add . && git commit && git push`
3. `bash deploy.sh server`
4. Testar no celular

---

## Checklist Final

- [ ] Dropdown de intervalo funciona e salva no servidor
- [ ] Botao Iniciar inicia gravacao (recording=true no banco)
- [ ] Botao Parar para gravacao (recording=false no banco)
- [ ] ESP32 respeita intervalo e flag de gravacao
- [ ] Imagens salvas na pasta do usuario por data
- [ ] Galeria exibe imagens com paginacao
- [ ] Click na imagem abre modal fullscreen
- [ ] Countdown visual funciona durante gravacao
- [ ] Dropdown trava durante gravacao
- [ ] Versao 3.1.0 em app.js e sw.js
- [ ] Layout preservado (header + camera + capturar/parar intactos)
