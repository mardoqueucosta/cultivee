import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Leaf, Sprout, Droplets, Sun, Clock, ChevronRight, Check,
  BookOpen, ShoppingCart, Shield, Lightbulb, TrendingUp,
  AlertTriangle, Layers, ThermometerSun, Wind, Package,
  Target, Zap, GraduationCap, Gauge, Settings, Wrench,
  BarChart3, Cpu, Wifi, Building2, Factory, Ruler,
  CircuitBoard, MonitorSpeaker, Lamp, Eye
} from "lucide-react";

const modules = [
  {
    number: "01",
    title: "Fundamentos do Cultivo Indoor",
    icon: BookOpen,
    hours: "6h",
    topics: [
      "O que é CEA (Controlled Environment Agriculture) e fazenda vertical",
      "História: de Dickson Despommier (1999) às mega-fazendas de 2025",
      "Diferenças: campo aberto vs estufa vs fazenda vertical",
      "Mercado global (US$ 8-10 bi) e cenário brasileiro (21 operações mapeadas)",
    ],
  },
  {
    number: "02",
    title: "Iluminação LED para Horticultura",
    icon: Lamp,
    hours: "8h",
    topics: [
      "Espectro luminoso: azul (400-500nm), vermelho (600-700nm), far-red e branco",
      "Métricas: PAR, PPF, PPFD (µmol/m²/s) e DLI (mol/m²/dia) — como medir e interpretar",
      "LED vs HPS vs fluorescente: eficiência (3,14 vs 1,7 vs 1,3 µmol/J)",
      "Receitas de luz por cultura: alface (150-300 PPFD), morango (200-400 PPFD)",
    ],
  },
  {
    number: "03",
    title: "Sistemas de Cultivo Indoor",
    icon: Settings,
    hours: "6h",
    topics: [
      "NFT, DWC e Aeroponia: comparativo para ambientes fechados",
      "Torres verticais (ZipGrow, Tower Garden): 80% menos espaço",
      "Cultivo em substrato (perlita, lã de rocha, fibra de coco): buffer e estabilidade",
      "Escolha do sistema ideal conforme cultura, escala e orçamento",
    ],
  },
  {
    number: "04",
    title: "Controle Climático Avançado",
    icon: ThermometerSun,
    hours: "8h",
    topics: [
      "Temperatura (22-25°C dia / 15-18°C noite), umidade (70-80%) e VPD (0,8-1,2 kPa)",
      "Enriquecimento de CO₂: de 400 ppm (ambiente) para 600-1500 ppm",
      "HVAC e desumidificação: dimensionamento para ambientes selados",
      "Free cooling e estratégias para reduzir 20-27% do consumo energético",
    ],
  },
  {
    number: "05",
    title: "Racks Multi-Nível e Design",
    icon: Layers,
    hours: "6h",
    topics: [
      "Projeto de racks: 4-10 níveis, espaçamento 30-45 cm entre bandeja e LED",
      "Racks móveis (rolling benches): 40-60% mais espaço útil",
      "Gestão de fluxo de ar: microclimas por camada, ventilação horizontal",
      "Materiais: aço inox e alumínio anodizado resistentes à umidade",
    ],
  },
  {
    number: "06",
    title: "IoT e Automação",
    icon: Cpu,
    hours: "8h",
    topics: [
      "Sensores: DHT22 (T/UR), DS18B20 (água), pH, EC, CO₂ (NDIR), PAR",
      "Microcontroladores: ESP32 (R$ 25-50), Arduino e Raspberry Pi",
      "Arquitetura MQTT: sensores → ESP32 → broker → dashboard (Grafana/Node-RED)",
      "Automação: irrigação, fotoperíodo, alertas e datalogger com timestamps",
    ],
  },
  {
    number: "07",
    title: "Culturas e Manejo Indoor",
    icon: Sprout,
    hours: "6h",
    topics: [
      "Folhosas: alface (21-30 dias), rúcula, espinafre — PPFD 150-300, DLI 15-25",
      "Ervas: manjericão (21-35 dias), coentro, hortelã — PPFD 200-300, 16h fotoperíodo",
      "Morango: 12,5 kg/m² multi-tier, PPFD 200-400, DLI 17-25",
      "Microverdes e flores comestíveis: maior receita por m² (US$ 540-1.080/m²/ano)",
    ],
  },
  {
    number: "08",
    title: "Gestão de Energia",
    icon: Zap,
    hours: "4h",
    topics: [
      "Distribuição: LED 55%, HVAC 30%, desumidificação 10%, outros 5%",
      "Energia = 40-67% dos custos operacionais — como otimizar",
      "LEDs de alta eficiência: Samsung LM301H EVO (3,14 µmol/J)",
      "Integração solar, baterias e gestão de fotoperíodo para redução de pico",
    ],
  },
  {
    number: "09",
    title: "Negócio e Viabilidade Econômica",
    icon: ShoppingCart,
    hours: "6h",
    topics: [
      "Investimento por escala: R$ 3.389 (protótipo) a R$ 15M+ (industrial)",
      "Custos operacionais: energia, mão de obra, insumos e manutenção",
      "Lucratividade: apenas 27% são lucrativas — o que os vencedores fazem diferente",
      "Canais de venda: supermercados, restaurantes, B2B, assinaturas diretas",
    ],
  },
  {
    number: "10",
    title: "Projeto Final e Mentoria",
    icon: GraduationCap,
    hours: "4h",
    topics: [
      "Desenvolvimento do seu projeto de cultivo indoor individual",
      "Dimensionamento: área, racks, LEDs, HVAC e sistema de cultivo",
      "Cálculo de viabilidade: CAPEX, OPEX e projeção de ROI (2,5-4 anos)",
      "Certificado de conclusão + acesso à comunidade de alunos",
    ],
  },
];

const crops = [
  {
    name: "Alface",
    cycle: "21-30 dias",
    ppfd: "150-300",
    dli: "15-25",
    temp: "22-25°C",
    color: "bg-green-500",
    revenue: "US$ 160-430/m²/ano",
    note: "12-14 colheitas/ano, 8x mais produtivo que campo",
  },
  {
    name: "Microverdes",
    cycle: "7-14 dias",
    ppfd: "100-300",
    dli: "10-16",
    temp: "18-24°C",
    color: "bg-emerald-500",
    revenue: "US$ 540-1.080/m²/ano",
    note: "Maior receita por m², 20+ colheitas/ano",
  },
  {
    name: "Manjericão",
    cycle: "21-35 dias",
    ppfd: "200-300",
    dli: "14-17",
    temp: "22-27°C",
    color: "bg-green-600",
    revenue: "US$ 270-650/m²/ano",
    note: "28x mais produtivo que campo por m²",
  },
  {
    name: "Rúcula",
    cycle: "21-28 dias",
    ppfd: "150-250",
    dli: "12-18",
    temp: "18-22°C",
    color: "bg-green-700",
    revenue: "US$ 200-400/m²/ano",
    note: "Crescimento rápido, alta demanda",
  },
  {
    name: "Morango",
    cycle: "60-90 dias",
    ppfd: "200-400",
    dli: "17-25",
    temp: "18-24°C",
    color: "bg-rose-500",
    revenue: "US$ 160-320/m²/ano",
    note: "12,5 kg/m² multi-tier, alto valor agregado",
  },
  {
    name: "Flores Comestíveis",
    cycle: "30-60 dias",
    ppfd: "150-300",
    dli: "12-18",
    temp: "18-24°C",
    color: "bg-purple-500",
    revenue: "Premium",
    note: "Nicho de alta margem, restaurantes gourmet",
  },
];

const systemsComparison = [
  {
    name: "NFT",
    desc: "Filme fino de solução flui por canais",
    pros: "Simples, eficiente, ideal para folhosas",
    cons: "Risco se bomba falhar",
    best: "Alface, rúcula, espinafre",
    icon: Droplets,
  },
  {
    name: "Aeroponia",
    desc: "Raízes suspensas, pulverizadas com névoa",
    pros: "Máxima oxigenação, crescimento rápido",
    cons: "Complexo, sensível a falhas",
    best: "Culturas de alto valor",
    icon: Wind,
  },
  {
    name: "DWC",
    desc: "Raízes submersas em solução aerada",
    pros: "Fácil montagem, baixo custo",
    cons: "Risco de podridão radicular",
    best: "Alface, ervas, plantas maiores",
    icon: Layers,
  },
  {
    name: "Torres Verticais",
    desc: "Cultivo na face vertical com recirculação",
    pros: "80% menos espaço que horizontal",
    cons: "Iluminação desigual",
    best: "Folhosas, ervas, morango",
    icon: Building2,
  },
];

const businessNumbers = [
  { label: "Produtividade", value: "até 390x", subtitle: "mais que campo aberto" },
  { label: "Economia de água", value: "95-98%", subtitle: "sistema fechado recirculante" },
  { label: "Colheitas por ano", value: "12-14", subtitle: "produção 365 dias" },
  { label: "Mercado global", value: "US$ 50 bi", subtitle: "projeção 2032" },
];

const ledSpectrum = [
  { range: "Azul (400-500nm)", role: "Crescimento vegetativo, compactação, clorofila", pct: "10-20%" },
  { range: "Verde (500-600nm)", role: "Penetração no dossel, fotossíntese em camadas inferiores", pct: "5-10%" },
  { range: "Vermelho (600-700nm)", role: "Fotossíntese primária, floração, extensão foliar", pct: "70-80%" },
  { range: "Far-Red (700-750nm)", role: "Alongamento, floração precoce, sinal de sombra", pct: "2-5%" },
];

const commonMistakes = [
  {
    mistake: "Escalar antes de provar demanda",
    detail: "Construir mega-fazendas antes de ter compradores garantidos levou à falência de empresas como Bowery e AppHarvest.",
    solution: "Comece pequeno, valide o mercado local, tenha contratos antes de expandir.",
  },
  {
    mistake: "Subestimar custos de energia",
    detail: "Eletricidade representa 40-67% dos custos operacionais. Muitos falham ao ignorar isso no planejamento.",
    solution: "Calcule consumo detalhado: LED (55%) + HVAC (30%) + desumidificação (10%).",
  },
  {
    mistake: "Escolha errada de culturas",
    detail: "Produzir apenas alface de baixa margem em instalações caras de milhões de dólares.",
    solution: "Priorize culturas de alto valor: microverdes, ervas aromáticas, morangos.",
  },
  {
    mistake: "Over-engineering desde o início",
    detail: "Gastar em robótica e automação avançada antes de validar o modelo básico de produção.",
    solution: "Domine a agronomia primeiro, automatize depois. Agrônomos > engenheiros de software.",
  },
  {
    mistake: "Ignorar gestão térmica",
    detail: "LEDs geram calor significativo — 15-25% da energia vira calor. HVAC é o 2º maior custo.",
    solution: "Dimensione HVAC corretamente, use free cooling e LEDs de alta eficiência.",
  },
  {
    mistake: "Falta de planejamento comercial",
    detail: "Produzir sem ter canais de venda definidos — supermercados, restaurantes, cestas.",
    solution: "Feche contratos de fornecimento ANTES de construir. O que os sobreviventes fazem.",
  },
];

const faqs = [
  {
    question: "Qual a diferença entre fazenda vertical e estufa?",
    answer: "Estufa usa luz solar (com suplementação opcional), tem controle parcial de clima e cultiva em 1 nível. Fazenda vertical usa 100% LED artificial, controle total de clima, e empilha 4-16+ níveis em ambiente selado — sem dependência de solo, sol ou clima externo.",
  },
  {
    question: "Preciso de experiência prévia?",
    answer: "Não! O curso parte do zero e avança gradualmente. Começamos com conceitos de biologia vegetal e terminamos com IoT e viabilidade econômica. Ideal para iniciantes que querem entrar nesse mercado.",
  },
  {
    question: "Quanto custa montar uma fazenda vertical?",
    answer: "Depende da escala. Protótipo caseiro: R$ 3.000-5.000. Pequena produção (<230m²): R$ 500 mil a R$ 2 milhões. Escala industrial (>2.800m²): R$ 20-150 milhões. No curso, ensinamos a calcular o investimento para sua realidade.",
  },
  {
    question: "Fazenda vertical é lucrativa?",
    answer: "Pode ser, mas exige planejamento. Apenas 27% são lucrativas atualmente. Os vencedores focam em culturas de alto valor (microverdes, morangos, ervas), controlam energia e têm compradores garantidos antes de construir. Payback típico: 2,5-4 anos.",
  },
  {
    question: "Qual cultura dá mais lucro por m²?",
    answer: "Microverdes lideram com US$ 540-1.080/m²/ano (20+ colheitas). Depois, ervas aromáticas (US$ 270-650/m²/ano) e alface premium (US$ 160-430/m²/ano). Morangos premium (Oishii) também têm excelente margem.",
  },
  {
    question: "O consumo de energia é muito alto?",
    answer: "Sim, energia é o maior desafio — 40-67% dos custos operacionais. LED consome 55%, HVAC 30%. Mas no Brasil a matriz é ~80% renovável, tornando a operação mais sustentável. No curso, ensinamos estratégias para reduzir 20-50% do consumo.",
  },
  {
    question: "O curso aborda automação com IoT?",
    answer: "Sim! Um módulo inteiro dedicado: sensores (pH, EC, T, UR, CO₂, luz), ESP32, MQTT, dashboards com Grafana/Node-RED, automação de irrigação e fotoperíodo. Prática com hardware real.",
  },
  {
    question: "O curso oferece certificado?",
    answer: "Sim. Ao concluir todos os módulos e apresentar seu projeto final, você recebe certificado de conclusão + acesso vitalício à comunidade de alunos para suporte contínuo.",
  },
];

const CursoCultivoIndoorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Curso de Cultivo Indoor e Fazendas Verticais | Cultivee Agro</title>
        <meta name="description" content="Curso completo de cultivo indoor e fazendas verticais: LED, automação IoT, controle climático e viabilidade econômica. 10 módulos, 62+ horas. Do protótipo à escala comercial." />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-500/10 via-background to-agro/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li><Link to="/agro" className="hover:text-foreground transition-colors">Agro</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li className="text-foreground font-medium">Cultivo Indoor</li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                Novo
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Cultivo Indoor e Fazendas Verticais
              </h1>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Produza em ambientes 100% controlados com até 390x mais produtividade por m².
                LED, IoT, automação e controle climático — a agricultura do futuro.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> 62+ horas</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-blue-500" /> 10 módulos</span>
                <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-blue-500" /> Teoria + prática + IoT</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/5519992805563?text=Olá! Tenho interesse no curso de Cultivo Indoor e Fazendas Verticais." target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    Quero me inscrever
                  </Button>
                </a>
                <a href="#modulos">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    Ver conteúdo completo
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/cursos/cultivo-indoor.jpg"
                  alt="Fazenda vertical com LED e prateleiras de plantas"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="text-2xl font-bold text-blue-600">390x</div>
                <div className="text-xs text-muted-foreground">mais produtivo</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="text-2xl font-bold text-blue-600">365</div>
                <div className="text-xs text-muted-foreground">dias/ano</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que é Fazenda Vertical */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">O que é Fazenda Vertical?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Fazenda vertical é um método de produção em ambiente 100% controlado (CEA) onde cultivos
                são empilhados em múltiplas camadas dentro de estruturas fechadas. Utiliza LED artificial,
                hidroponia ou aeroponia, e controle climático total — sem depender de solo, luz solar ou clima.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                O conceito foi idealizado em 1999 pelo Prof. Dickson Despommier na Columbia University.
                Hoje, o mercado global vale US$ 8-10 bilhões e projeta atingir US$ 50 bilhões até 2032.
                No Brasil, a Pink Farms (SP) lidera com 3 ton/mês em 750 m² e investimento de R$ 15M.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  Campo vs Estufa vs Fazenda Vertical
                </h4>
                <p className="text-sm text-muted-foreground">
                  Campo: 1 nível, luz solar, sem controle. Estufa: 1 nível, luz solar + suplementar, controle parcial.
                  Fazenda Vertical: 4-16+ níveis, 100% LED, controle total de clima, 365 dias/ano, zero pesticidas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TrendingUp, label: "Até 390x mais produtivo", desc: "por m² vs campo aberto" },
                { icon: Droplets, label: "95-98% menos água", desc: "sistema fechado recirculante" },
                { icon: Shield, label: "Zero pesticidas", desc: "ambiente selado e controlado" },
                { icon: Sun, label: "365 dias/ano", desc: "12-14 colheitas, sem sazonalidade" },
                { icon: Layers, label: "4-16+ níveis", desc: "multiplicação da área útil" },
                { icon: Target, label: "90-99% menos terra", desc: "produção urbana compacta" },
              ].map((item, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <item.icon className="w-6 h-6 text-blue-500 mb-2" />
                  <div className="font-semibold text-foreground text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LED Spectrum */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Iluminação LED — O Motor da Fazenda Vertical
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            LED representa 55% do consumo energético. Entender espectro, PPFD e DLI é essencial
            para maximizar produtividade e minimizar custos.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Espectro */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Lamp className="w-5 h-5 text-blue-500" />
                Espectro Luminoso e Funções
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Cada faixa do espectro cumpre uma função específica na planta</p>
              <div className="space-y-4">
                {ledSpectrum.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground text-sm">{item.range}</span>
                      <span className="text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">{item.pct}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                    <div className="h-2 rounded-full overflow-hidden" style={{
                      background: i === 0 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' :
                                  i === 1 ? 'linear-gradient(90deg, #22c55e, #86efac)' :
                                  i === 2 ? 'linear-gradient(90deg, #ef4444, #f87171)' :
                                  'linear-gradient(90deg, #7c3aed, #a78bfa)'
                    }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas e comparação */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-500" />
                LED vs Outras Tecnologias
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Eficiência, custo e vida útil comparados</p>
              <div className="space-y-4">
                {[
                  { tech: "LED (Samsung LM301H EVO)", eff: "3,14 µmol/J", life: "50-100 mil h", heat: "15-25%", bar: "w-full" },
                  { tech: "HPS (Sódio Alta Pressão)", eff: "1,70 µmol/J", life: "~10 mil h", heat: "80%", bar: "w-[54%]" },
                  { tech: "Fluorescente/CFL", eff: "1,30 µmol/J", life: "~8 mil h", heat: "80%", bar: "w-[41%]" },
                ].map((item, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                    <div className="font-medium text-foreground text-sm mb-2">{item.tech}</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div className={`h-full bg-blue-500 rounded-full ${item.bar}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>Efic.: <strong className="text-foreground">{item.eff}</strong></span>
                      <span>Vida: <strong className="text-foreground">{item.life}</strong></span>
                      <span>Calor: <strong className="text-foreground">{item.heat}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">PPFD alto</strong> aumenta biomassa em até <strong className="text-foreground">76% na alface</strong> e <strong className="text-foreground">79% no manjericão</strong> vs luz branca sozinha.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sistemas de cultivo */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Sistemas de Cultivo para Ambientes Fechados
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Cada sistema tem vantagens específicas. No curso, você aprende a escolher o ideal para sua cultura e escala.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemsComparison.map((sys, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg mb-3">
                  <sys.icon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{sys.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{sys.desc}</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-green-600 font-medium">+ </span>
                    <span className="text-muted-foreground">{sys.pros}</span>
                  </div>
                  <div>
                    <span className="text-red-500 font-medium">- </span>
                    <span className="text-muted-foreground">{sys.cons}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <span className="text-blue-500 font-medium">Ideal: </span>
                    <span className="text-foreground">{sys.best}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culturas */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Culturas para Fazenda Vertical
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Dados reais de PPFD, DLI, ciclo e receita por m²/ano — priorizando as culturas mais lucrativas.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.map((crop, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${crop.color}`} />
                  <h3 className="font-bold text-foreground">{crop.name}</h3>
                </div>
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciclo</span>
                    <span className="font-medium text-foreground">{crop.cycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PPFD (µmol/m²/s)</span>
                    <span className="font-medium text-foreground">{crop.ppfd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DLI (mol/m²/dia)</span>
                    <span className="font-medium text-foreground">{crop.dli}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="font-medium text-foreground">{crop.temp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita/m²/ano</span>
                    <span className="font-medium text-blue-600">{crop.revenue}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-500 font-medium">{crop.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IoT e Automação */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            IoT e Automação — Controle Total
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sensores, microcontroladores e dashboards para monitorar e controlar cada parâmetro da fazenda em tempo real.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Sensores */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground mb-4">Sensores</h3>
              <ul className="space-y-2">
                {[
                  "DHT22 / SHT31 — Temperatura + Umidade",
                  "DS18B20 — Temperatura da água",
                  "Eletrodo pH — Acidez da solução",
                  "EC/TDS — Condutividade elétrica",
                  "MH-Z19 / SenseAir S8 — CO₂ (NDIR)",
                  "BH1750 — Intensidade luminosa (PAR)",
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CircuitBoard className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Controladores */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4">
                <Cpu className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground mb-4">Microcontroladores</h3>
              <div className="space-y-3">
                {[
                  { name: "ESP32", price: "R$ 25-50", desc: "Wi-Fi + Bluetooth, GPIO, MQTT — ideal para IoT" },
                  { name: "Arduino Mega", price: "R$ 80-150", desc: "Muitas portas analógicas, prototipagem" },
                  { name: "Raspberry Pi 4/5", price: "R$ 300-600", desc: "Linux, câmera, dashboard local, visão computacional" },
                ].map((mc, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-foreground text-sm">{mc.name}</span>
                      <span className="text-xs font-semibold text-blue-500">{mc.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arquitetura */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4">
                <Wifi className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-foreground mb-4">Arquitetura IoT</h3>
              <div className="space-y-3">
                {[
                  { step: "1", label: "Coleta", desc: "Sensores → ESP32 (leitura a cada 5-30s)" },
                  { step: "2", label: "Transmissão", desc: "Wi-Fi → Broker MQTT (Mosquitto/EMQX)" },
                  { step: "3", label: "Processamento", desc: "Node-RED → lógica de automação" },
                  { step: "4", label: "Visualização", desc: "Grafana → dashboards em tempo real" },
                  { step: "5", label: "Ação", desc: "Relés → bombas, LEDs, ventiladores, alertas" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <span className="font-medium text-foreground text-sm">{item.label}</span>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos do curso */}
      <section id="modulos" className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Conteúdo Completo — 10 Módulos
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            62+ horas de conteúdo teórico e prático. Do fundamento científico à automação IoT e viabilidade econômica.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.number}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <mod.icon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        Módulo {mod.number}
                      </span>
                      <span className="text-xs text-muted-foreground">{mod.hours}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-3">{mod.title}</h3>
                    <ul className="space-y-1.5">
                      {mod.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números do negócio */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Números do Mercado</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A fazenda vertical é um mercado em expansão — mas exige planejamento rigoroso para ser lucrativa.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {businessNumbers.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">{item.value}</div>
                <div className="font-medium text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Protótipo / Caseiro</h4>
              <p className="text-sm text-muted-foreground">
                R$ 3.000-5.000. Ideal para aprendizado e validação. 1-2 racks com LED,
                sensores básicos e sistema NFT ou DWC.
              </p>
            </div>
            <div className="bg-card border border-blue-300 dark:border-blue-700 rounded-xl p-6 text-center shadow-md">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Escala Comercial</h4>
              <p className="text-sm text-muted-foreground">
                R$ 500 mil - R$ 2M para &lt;230m². Payback de 2,5-4 anos.
                Foco em culturas de alto valor. 27% atingem lucratividade.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Escala Industrial</h4>
              <p className="text-sm text-muted-foreground">
                R$ 20-150M+. Pink Farms (SP): R$ 15M Series A, 3 ton/mês em 750m².
                Meta: 24 fazendas na América Latina até 2027.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Erros comuns */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Erros que Derrubam Fazendas Verticais
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            14 empresas faliram só em 2025. No módulo 9, analisamos cada caso e ensinamos o que os sobreviventes fazem diferente.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonMistakes.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-foreground text-sm">{item.mistake}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.detail}</p>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item.solution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustentabilidade */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Sustentabilidade e o Brasil
                </h3>
                <p className="text-muted-foreground mb-4">
                  A pegada de carbono depende da matriz energética. Com ~80% de fontes renováveis (hidro + eólica + solar),
                  o Brasil tem vantagem competitiva sobre EUA e Europa para fazendas verticais sustentáveis.
                  Zero pesticidas, 95-98% menos água, produção urbana sem desmatamento.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Zero pesticidas", "95% menos água", "Sem desmatamento", "Produção urbana", "Energia renovável BR"].map((tag, i) => (
                    <span key={i} className="text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Perguntas Frequentes
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Entre na Agricultura do Futuro
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            10 módulos, 62+ horas, do protótipo caseiro à viabilidade comercial.
            LED, IoT, automação e controle climático — tudo em um curso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5519992805563?text=Olá! Tenho interesse no curso de Cultivo Indoor e Fazendas Verticais." target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2 text-blue-700 font-semibold w-full sm:w-auto">
                Falar com a equipe
              </Button>
            </a>
            <Link to="/agro">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Ver todos os cursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CursoCultivoIndoorPage;
