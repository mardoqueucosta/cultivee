# Plano de Visao Geral - Software Cultivee

**Data:** 2026-03-30
**Status:** Em discussao

---

## 1. Contexto do Projeto

### Titulo
Sistema inteligente de producao, distribuicao e comercializacao de hortalicas em ambientes urbanos utilizando IoT

### Descricao
Modelo integrado composto por uma fazenda vertical indoor e uma rede de expositores de pequeno porte, interligados via computacao em nuvem, para elevar a rentabilidade do produtor e entregar hortalicas mais frescas ao consumidor.

### 3 Pilares do Sistema

| Pilar | Descricao |
|-------|-----------|
| **Fazenda Vertical Indoor** | Cultivo hidroponico (microverdes, mudas, adultas) por 20-40 dias |
| **Expositores Distribuidos** | Cabines de pequeno porte em pontos urbanos, mantendo plantas vivas por 5-10 dias |
| **Software em Nuvem** | Monitoramento, controle e integracao de toda a cadeia |

### Fluxo Operacional
1. Cultivo na fazenda vertical (20-40 dias)
2. Transferencia para expositores proximos ao periodo ideal de colheita (5-10 dias)
3. Software gera alertas de reposicao, fechando o ciclo

### Hardware de Controle
- **ESP32 com WiFi** — um ESP32 fisico por modulo (cada modulo e independente)

---

## 2. Contexto Extraido das Imagens

### Diagrama Completo (Imagem 1)
- Ciclo fechado: **Produtor** (Fazenda Vertical + Estufa) → **Cloud** (Software, Computador, Smartphone) → **Expositores Distribuidos** (predios residenciais/comerciais, lojas, comercio)
- Sensores nos expositores: luminosidade/espectro, CO2, umidade, temperatura, pH, nivel de agua
- Fluxo bidirecional: **Info** sobe do produtor para a nuvem, **Dados** sobem dos expositores para a nuvem
- **Hortalicas** fluem fisicamente do produtor para os expositores

### Diagrama Simplificado (Imagem 2)
- Expositores comunicam via **WiFi** com o servidor em nuvem
- **Painel do produtor** (computador) para gestao da fazenda vertical
- **Smartphone** como interface movel
- Expositores distribuidos em **lojas e comercio**

---

## 3. Arquitetura Modular

### Principio Fundamental

Cada modulo e um **ESP32 fisico independente** com um unico firmware/produto.
Uma fazenda ou expositor e a **soma dos ESP32s pareados** no app, agrupados via Groups.
Adicionar capacidade = parear mais um ESP32. Remover = desparear.

### Catalogo de Modulos

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULOS DISPONIVEIS                        │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  HIDRO   │  │   CAM    │  │  CLIMA   │                   │
│  │ (existe) │  │ (existe) │  │  (novo)  │                   │
│  │          │  │          │  │          │                    │
│  │ Luz+Bomba│  │ OV2640   │  │ Temp     │                   │
│  │ Fases    │  │ Stream   │  │ Umidade  │                   │
│  │ Automacao│  │ Capture  │  │ CO2      │                   │
│  │          │  │ Live     │  │          │                    │
│  │ WROOM    │  │ WROVER   │  │ WROOM    │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ SOLUCAO  │  │ DOSADORA │                                  │
│  │  (novo)  │  │  (novo)  │                                  │
│  │          │  │          │                                  │
│  │ pH       │  │ Bomba A  │                                  │
│  │ EC/TDS   │  │ Bomba B  │                                  │
│  │ Nivel    │  │ pH+      │                                  │
│  │          │  │ pH-      │                                  │
│  │ WROOM    │  │ WROOM    │                                  │
│  └──────────┘  └──────────┘                                  │
│                                                              │
│  Cada caixa = 1 ESP32 fisico com seu proprio firmware        │
└─────────────────────────────────────────────────────────────┘
```

#### Existentes (ja implementados)

| Modulo | Product file | Capability | Hardware | O que faz |
|--------|-------------|-----------|----------|-----------|
| **hidro** | `products/hidro.h` | Reles + fases | ESP32-WROOM, GPIO4/5 | Controle de luz e bomba, fotoperíodo, fases de cultivo |
| **cam** | `products/cam.h` | Camera OV2640 | ESP32-WROVER, PSRAM | Captura, streaming MJPEG, live mode |

#### Novos (a desenvolver)

| Modulo | Product file | Capability | Sensores/Atuadores | O que faz |
|--------|-------------|-----------|-------------------|-----------|
| **clima** | `products/clima.h` | Ambiente | DHT22/SHT30 + MH-Z19 | Monitoramento de temp, umidade, CO2 |
| **solucao** | `products/solucao.h` | Solucao nutritiva | Sensor pH + EC/TDS + boia nivel | Qualidade da hidroponia e nivel de agua |
| **dosadora** | `products/dosadora.h` | Dosagem | Bombas peristalticas (4x) | Ajuste automatico de nutrientes e pH |

### Composicao por Agrupamento (Groups)

```
FAZENDA VERTICAL "Rack 1"                EXPOSITOR "Loja Centro"
┌─────────────────────────┐              ┌─────────────────────────┐
│  Grupo no app (5 ESP32) │              │  Grupo no app (3 ESP32) │
│                         │              │                         │
│  [hidro] ← luz+bomba   │              │  [hidro] ← luz+bomba   │
│  [cam]   ← camera      │              │  [clima] ← temp+umid   │
│  [clima] ← temp+umid+co2│             │  [solucao] ← nivel     │
│  [solucao] ← pH+EC+nivel│             │                         │
│  [dosadora] ← 4 bombas │              │                         │
└─────────────────────────┘              └─────────────────────────┘

Cada [] = 1 ESP32 fisico independente pareado no grupo
```

### Flexibilidade na Pratica

O usuario monta a combinacao que precisa:

| Cenario | ESP32s pareados no grupo |
|---------|--------------------------|
| Fazenda completa | hidro + cam + clima + solucao + dosadora |
| Fazenda basica | hidro + clima + solucao |
| Expositor padrao | hidro + clima + solucao |
| Expositor com camera | hidro + clima + solucao + cam |
| Expositor minimo | hidro + solucao |
| Monitoramento avulso | clima |

Para adicionar camera no expositor → basta parear mais um ESP32 com `cam.h` no grupo.
Para remover dosadora da fazenda → basta desparear o ESP32 da dosadora.

---

## 4. Arquitetura Tecnica

### Visao Geral

```
┌───────────────────────────────────────────────────────────────┐
│                    ESP32s INDEPENDENTES                         │
│                                                                │
│  [hidro]  [cam]  [clima]  [solucao]  [dosadora]               │
│  Cada um com seu firmware, seus sensores, sua comunicacao      │
│  Cada um se registra individualmente no servidor               │
└──────────┬────────┬────────┬──────────┬──────────┬────────────┘
           │        │        │          │          │
           └────────┴────────┴────┬─────┴──────────┘
                                  │ WiFi / HTTP polling
┌─────────────────────────────────▼─────────────────────────────┐
│                    SERVIDOR (Flask unificado)                   │
│                                                                │
│  /api/modules/register  ← todos os ESP32 se registram aqui    │
│  /api/modules/poll      ← todos buscam comandos aqui          │
│  /api/ctrl/*            ← blueprint hidro                     │
│  /api/cam/*             ← blueprint cam                       │
│  /api/clima/*           ← blueprint clima (novo)              │
│  /api/solucao/*         ← blueprint solucao (novo)            │
│  /api/dosadora/*        ← blueprint dosadora (novo)           │
└─────────────────────────────────┬─────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────┐
│                    PWA (app.cultivee.com.br)                    │
│                                                                │
│  moduleRenderers = {                                           │
│    hidro:    { renderContent: renderModule_hidro },            │
│    cam:      { renderContent: renderModule_cam },              │
│    clima:    { renderContent: renderModule_clima },    (novo)  │
│    solucao:  { renderContent: renderModule_solucao },  (novo)  │
│    dosadora: { renderContent: renderModule_dosadora }, (novo)  │
│  }                                                             │
│                                                                │
│  Groups: agrupa modulos visualmente por fazenda/expositor      │
└───────────────────────────────────────────────────────────────┘
```

### Caminho de cada Modulo (do hardware ao app)

```
  products/clima.h                firmware/mod_clima.h
  ┌──────────────┐               ┌──────────────────────┐
  │ #define MOD_  │               │ clima_setup()        │
  │ MODULE_TYPE   │──────────────▶│ clima_loop()         │
  │ PINAGEM       │  compilacao   │ clima_status_json()  │
  │ SERVER_URL    │  condicional  │ clima_dashboard_html │
  └──────────────┘               │ clima_process_cmd()  │
                                  └──────────┬───────────┘
                                             │
                                   WiFi      │  POST /api/modules/register
                                   HTTP      │  { chip_id, type:"clima",
                                   polling   │    capabilities:["clima"],
                                             │    ctrl_data:{temp,umid,co2} }
                                             │
                                  ┌──────────▼───────────┐
                                  │ server/bp_clima.py    │
                                  │                       │
                                  │ GET /status           │
                                  │ GET /history          │
                                  │ POST /thresholds      │
                                  │                       │
                                  │ Registrado em app.py: │
                                  │ /api/clima/*          │
                                  └──────────┬───────────┘
                                             │
                                  ┌──────────▼───────────┐
                                  │ PWA (app.js)          │
                                  │                       │
                                  │ moduleRenderers.clima │
                                  │ = {                   │
                                  │   label: 'Clima',     │
                                  │   renderContent: ..., │
                                  │   getStatusText: ..., │
                                  │ }                     │
                                  └──────────────────────┘
```

Esse caminho e **identico** para todos os modulos. Mudam apenas os sensores/atuadores, as rotas e o render no app.

### Padrao para cada novo modulo (ja documentado no CLAUDE.md)

| Camada | Arquivos | Trabalho |
|--------|----------|----------|
| **Firmware** | `products/modulo.h` + `firmware/mod_modulo.h` + integracao no `firmware.ino` | Sensores, atuadores, rotas locais, dashboard offline |
| **Server** | `server/bp_modulo.py` + registro no `app.py` | Blueprint com rotas, validacao de capability |
| **PWA** | Entrada no `moduleRenderers` em `app.js` | Render do conteudo, status text |
| **Infra** | DNS + label Traefik no `docker-compose.yml` | Subdominio modulo.cultivee.com.br |

---

## 5. Detalhe dos Novos Modulos

### Modulo HIDRO (products/hidro.h) — EXISTE

| Item | Detalhe |
|------|---------|
| **Board** | ESP32-WROOM-32D |
| **GPIO** | 4 (luz), 5 (bomba) |
| **Firmware** | `mod_hidro.h` (832 linhas) |
| **Blueprint** | `bp_hidro.py` → `/api/ctrl/*` |
| **ctrl_data** | `{ light, pump, mode, phase, cycle_day, phases[] }` |
| **Funcao** | Reles + fases + fotoperíodo + automacao |

### Modulo CAM (products/cam.h) — EXISTE

| Item | Detalhe |
|------|---------|
| **Board** | ESP32-WROVER-DEV (PSRAM) |
| **Sensor** | OV2640 (VGA 640x480) |
| **Firmware** | `mod_cam.h` (457 linhas) |
| **Blueprint** | `bp_cam.py` → `/api/cam/*` |
| **ctrl_data** | `{ camera_ready, live_mode }` |
| **Funcao** | Captura, streaming MJPEG, live mode |

### Modulo CLIMA (products/clima.h) — NOVO

**Objetivo:** Monitoramento ambiental (temperatura, umidade, CO2)

| Item | Detalhe |
|------|---------|
| **Board** | ESP32-WROOM-32D |
| **Sensores** | DHT22 ou SHT30 (temp+umidade), MH-Z19 (CO2) |
| **MODULE_TYPE** | "clima" |
| **Capability** | ["clima"] |
| **ctrl_data** | `{ temp: 25.3, humidity: 68.2, co2: 420 }` |
| **Intervalo leitura** | 30-60s |
| **Dashboard local** | Valores atuais + mini historico |

**Funcionalidades no app:**
- Graficos em tempo real (temp, umidade, CO2)
- Historico (ultimas 24h, 7d, 30d)
- Configuracao de faixas ideais (min/max por variavel)
- Alertas quando fora da faixa

**Rotas do blueprint (bp_clima.py):**
- `GET /<chip_id>/status` — leitura atual
- `GET /<chip_id>/history` — historico de leituras
- `POST /<chip_id>/thresholds` — salvar faixas ideais

---

### Modulo SOLUCAO (products/solucao.h) — NOVO

**Objetivo:** Monitoramento da solucao nutritiva (pH, EC/TDS, nivel)

| Item | Detalhe |
|------|---------|
| **Board** | ESP32-WROOM-32D |
| **Sensores** | Sensor pH analogico, sensor EC/TDS, boia de nivel |
| **MODULE_TYPE** | "solucao" |
| **Capability** | ["solucao"] |
| **ctrl_data** | `{ ph: 6.2, ec: 1.4, tds: 700, nivel: "ok" }` |
| **Intervalo leitura** | 60s |
| **Calibracao** | pH requer calibracao periodica (buffer 4.0 e 7.0) |

**Funcionalidades no app:**
- Valores atuais (pH, EC, nivel) com indicadores visuais (verde/amarelo/vermelho)
- Historico e tendencias
- Wizard de calibracao do pH (guiado pelo app)
- Alertas: pH fora da faixa, nivel baixo do reservatorio

**Rotas do blueprint (bp_solucao.py):**
- `GET /<chip_id>/status` — leitura atual
- `GET /<chip_id>/history` — historico
- `POST /<chip_id>/calibrate` — iniciar calibracao
- `POST /<chip_id>/thresholds` — faixas ideais

---

### Modulo DOSADORA (products/dosadora.h) — NOVO

**Objetivo:** Dosagem automatica de nutrientes e ajuste de pH

| Item | Detalhe |
|------|---------|
| **Board** | ESP32-WROOM-32D |
| **Atuadores** | 4 bombas peristalticas (Nutriente A, Nutriente B, pH+, pH-) |
| **MODULE_TYPE** | "dosadora" |
| **Capability** | ["dosadora"] |
| **ctrl_data** | `{ bomba_a: false, bomba_b: false, ph_up: false, ph_down: false, modo: "manual" }` |
| **Dependencia** | Funciona melhor em conjunto com modulo solucao (leitura de pH/EC) |

**Funcionalidades no app:**
- Controle manual de cada bomba (ligar/desligar, dosar X ml)
- Modo automatico (requer modulo solucao no mesmo grupo):
  - Se pH < min → acionar pH+
  - Se pH > max → acionar pH-
  - Se EC < min → dosar nutrientes A+B
- Historico de dosagens
- Configuracao de receitas (proporcao A:B, faixas pH/EC alvo)

**Rotas do blueprint (bp_dosadora.py):**
- `GET /<chip_id>/status` — estado das bombas
- `GET /<chip_id>/dose` — dosar manualmente (?bomba=a&ml=5)
- `POST /<chip_id>/recipe` — salvar receita
- `POST /<chip_id>/auto-config` — configurar modo automatico

---

## 6. Comunicacao entre Modulos do mesmo Grupo

Os modulos sao independentes, mas o **modo automatico da dosadora** precisa ler dados do **modulo solucao**. Isso acontece **pelo servidor**, nao entre ESP32s:

```
[solucao ESP32] ──POST ctrl_data:{ph:5.8}──▶ [SERVIDOR]
                                                  │
                                            consulta pH
                                            do grupo
                                                  │
[dosadora ESP32] ◀──comando:{dosar ph_up}─── [SERVIDOR]
```

O servidor ve todos os modulos do grupo e toma decisoes cross-module.
Nenhum ESP32 precisa saber da existencia dos outros.

---

## 7. Contextos de Uso: Fazenda vs Expositor

Mesmo catalogo de modulos, **contextos operacionais diferentes:**

| Aspecto | Fazenda Vertical | Expositor |
|---------|-----------------|-----------|
| **Localizacao** | Centralizada (1 local) | Distribuido (N locais remotos) |
| **Operador** | Presente no dia a dia | Ausente (desassistido) |
| **Objetivo** | Maximizar crescimento | Preservar frescor |
| **Modulos tipicos** | hidro + cam + clima + solucao + dosadora | hidro + clima + solucao |
| **Complexidade** | Alta (mais modulos, automacao avancada) | Baixa (poucos modulos, modo manutencao) |
| **Criticidade offline** | Media (operador por perto) | Alta (precisa funcionar sozinho) |
| **Alertas prioritarios** | Otimizacao (pH desviou, EC baixo) | Seguranca (offline, temp critica, sem agua) |
| **Fases do hidro** | Completas (Muda→Bercario→Engorda) | Simplificadas (fase unica de manutencao) |
| **Dosadora** | Sim (ajuste fino de nutrientes) | Nao (sem necessidade) |

A diferenciacao entre fazenda e expositor e feita pelo **agrupamento e configuracao no app**, nao pelo firmware.

---

## 8. Evolucao dos Groups

O sistema de groups ja existe no banco (`groups` table). Para suportar fazenda/expositor, precisamos evoluir:

### Melhorias necessarias no Group

| Funcionalidade | Descricao |
|---------------|-----------|
| **Tipo de grupo** | Campo `type` (fazenda, expositor, estufa, avulso) |
| **Dashboard agregado** | Visao consolidada de todos os modulos do grupo |
| **Alertas por grupo** | Alertas que consideram dados de multiplos modulos |
| **Localizacao** | Endereco/coordenadas do grupo (util para expositores distribuidos) |
| **Status do grupo** | Online se todos os modulos estao online, alerta se algum offline |

---

## 9. Atividades Macro para Desenvolvimento

### Fase 1 — Modulo Clima (base para os demais)
1. Firmware: `mod_clima.h` + `products/clima.h`
2. Server: `bp_clima.py` + armazenamento de historico de leituras
3. PWA: `renderModule_clima` (valores atuais + graficos)
4. Infra: DNS clima.cultivee.com.br

### Fase 2 — Modulo Solucao
1. Firmware: `mod_solucao.h` + `products/solucao.h`
2. Server: `bp_solucao.py` + calibracao + historico
3. PWA: `renderModule_solucao` (pH, EC, nivel + wizard calibracao)

### Fase 3 — Modulo Dosadora
1. Firmware: `mod_dosadora.h` + `products/dosadora.h`
2. Server: `bp_dosadora.py` + receitas + modo automatico
3. PWA: `renderModule_dosadora` (controle bombas + receitas)

### Fase 4 — Evolucao dos Groups (Fazenda/Expositor)
1. Server: tipo de grupo, dashboard agregado, alertas cross-module
2. PWA: visao de grupo, mapa de expositores, status consolidado
3. Logica de negocio: ciclo da planta (fazenda → expositor), reposicao

### Fase 5 — Gestao de Inventario e Logistica
1. Rastreabilidade: lote plantado na fazenda → transferido para expositor
2. Alertas de reposicao baseados em tempo + dados dos sensores
3. Relatorios de operacao

---

## 10. Decisoes Pendentes

- [ ] Sensores especificos para clima (DHT22 vs SHT30, MH-Z19 vs MH-Z14)
- [ ] Sensores especificos para solucao (qual sensor pH analogico, qual EC)
- [ ] Modelo de bomba peristaltica para dosadora
- [ ] Armazenamento de historico de leituras (SQLite vs InfluxDB vs tabela separada)
- [ ] Frequencia de envio de leituras ao servidor (a cada leitura vs batch)
- [ ] Como o modo automatico da dosadora le dados do modulo solucao (via servidor ou comunicacao local entre ESP32s?)
- [ ] Estrategia de OTA para atualizar firmware dos modulos remotos (expositores)
