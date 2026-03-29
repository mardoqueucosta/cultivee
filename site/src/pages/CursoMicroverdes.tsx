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
  BookOpen, Beaker, ShoppingCart, Shield, Lightbulb, TrendingUp,
  AlertTriangle, Layers, ThermometerSun, Wind, Scissors, Package,
  Target, Zap, GraduationCap
} from "lucide-react";

const modules = [
  {
    number: "01",
    title: "Fundamentos",
    icon: BookOpen,
    hours: "6h",
    topics: [
      "O que são microverdes: definição e diferenças de brotos e baby greens",
      "Benefícios nutricionais: até 40x mais nutrientes que plantas adultas",
      "Panorama do mercado: R$ 3,5 bi global, crescimento de 15-20% ao ano no Brasil",
      "Perfil do consumidor e oportunidades de negócio",
    ],
  },
  {
    number: "02",
    title: "Variedades e Botânica",
    icon: Sprout,
    hours: "4h",
    topics: [
      "Catálogo de 20+ variedades com características de cultivo",
      "Classificação: fáceis (rabanete, brócolis), intermediárias (girassol, ervilha) e avançadas (manjericão, coentro)",
      "Sementes mucilaginosas: cuidados especiais",
      "Variedades tóxicas: o que NÃO cultivar (solanáceas)",
    ],
  },
  {
    number: "03",
    title: "Infraestrutura e Equipamentos",
    icon: Layers,
    hours: "4h",
    topics: [
      "Bandejas, substratos (fibra de coco, solo, mats) e sementes",
      "Iluminação LED: espectro, PPFD 100-400 µmol/m²/s, fotoperiodo 16h",
      "Sistemas de irrigação: manual, inferior e automatizada",
      "Planejamento do espaço e lista de fornecedores no Brasil",
    ],
  },
  {
    number: "04",
    title: "Técnica de Cultivo — Prática",
    icon: Leaf,
    hours: "10h",
    topics: [
      "Demolho, semeadura e densidades por variedade",
      "Blackout: duração, peso e monitoramento",
      "Fase de crescimento: irrigação inferior e fotoperiodo",
      "Colheita no ponto ideal: técnica, ferramentas e pós-colheita",
      "Atividade prática: plantio de 5 variedades ao vivo",
    ],
  },
  {
    number: "05",
    title: "Controle Ambiental",
    icon: ThermometerSun,
    hours: "4h",
    topics: [
      "Temperatura ideal: 18-22°C (germinação e crescimento)",
      "Umidade relativa: 40-60% com ventilação constante",
      "Qualidade da água: pH 6,0-6,5, sem cloro",
      "Monitoramento com instrumentos digitais e IoT",
    ],
  },
  {
    number: "06",
    title: "Resolução de Problemas",
    icon: AlertTriangle,
    hours: "4h",
    topics: [
      "Mofo vs. pelos radiculares: como diferenciar",
      "Damping off: prevenção e manejo",
      "Crescimento desigual, estiolamento e amarelecimento",
      "Galeria visual de diagnóstico e protocolos de ação",
    ],
  },
  {
    number: "07",
    title: "Negócio e Comercialização",
    icon: ShoppingCart,
    hours: "6h",
    topics: [
      "Precificação: R$ 160-400/kg conforme variedade",
      "Canais de venda: restaurantes, feiras, D2C por Instagram/WhatsApp",
      "Modelo de assinatura semanal e prospecção de clientes",
      "Embalagem, rotulagem e logística de entrega",
    ],
  },
  {
    number: "08",
    title: "Segurança Alimentar e Legislação",
    icon: Shield,
    hours: "4h",
    topics: [
      "Boas práticas de fabricação (BPF) aplicadas a microverdes",
      "Higiene pessoal, ambiental e rastreabilidade",
      "Legislação brasileira: ANVISA, MAPA e alvará sanitário",
      "Certificação orgânica: processo, custos e benefícios",
    ],
  },
  {
    number: "09",
    title: "Técnicas Avançadas",
    icon: Zap,
    hours: "4h",
    topics: [
      "Agricultura vertical: até 390x mais produtivo por m²",
      "Hidroponia vs. solo: quando usar cada abordagem",
      "Automação: irrigação, iluminação e monitoramento IoT",
      "Otimização de espectro luminoso para nutrição",
    ],
  },
  {
    number: "10",
    title: "Projeto Final e Mentoria",
    icon: GraduationCap,
    hours: "4h",
    topics: [
      "Desenvolvimento do seu plano de produção individual",
      "Cálculo de viabilidade econômica",
      "Apresentação e feedback personalizado",
      "Certificado de conclusão + acesso à comunidade",
    ],
  },
];

const varieties = [
  {
    name: "Rabanete",
    days: "5-12 dias",
    level: "Iniciante",
    flavor: "Picante",
    color: "bg-red-500",
    density: "65g/bandeja",
    soak: false,
  },
  {
    name: "Brócolis",
    days: "8-12 dias",
    level: "Iniciante",
    flavor: "Suave",
    color: "bg-green-600",
    density: "50g/bandeja",
    soak: false,
  },
  {
    name: "Girassol",
    days: "10-14 dias",
    level: "Intermediário",
    flavor: "Adocicado",
    color: "bg-yellow-500",
    density: "150g/bandeja",
    soak: true,
  },
  {
    name: "Ervilha",
    days: "10-14 dias",
    level: "Intermediário",
    flavor: "Doce e crocante",
    color: "bg-green-500",
    density: "250g/bandeja",
    soak: true,
  },
  {
    name: "Beterraba",
    days: "10-14 dias",
    level: "Intermediário",
    flavor: "Terroso",
    color: "bg-purple-600",
    density: "30g/bandeja",
    soak: true,
  },
  {
    name: "Manjericão",
    days: "20-25 dias",
    level: "Avançado",
    flavor: "Intenso",
    color: "bg-emerald-600",
    density: "15g/bandeja",
    soak: false,
  },
  {
    name: "Coentro",
    days: "21-28 dias",
    level: "Avançado",
    flavor: "Concentrado",
    color: "bg-lime-600",
    density: "35g/bandeja",
    soak: true,
  },
  {
    name: "Rúcula",
    days: "6-12 dias",
    level: "Iniciante",
    flavor: "Apimentado",
    color: "bg-green-700",
    density: "24g/bandeja",
    soak: false,
  },
];

const steps = [
  {
    step: 1,
    title: "Preparação",
    description: "Seleção de sementes, demolho (quando necessário) e sanitização com peróxido de hidrogênio 3%.",
    icon: Beaker,
    duration: "0-12h",
  },
  {
    step: 2,
    title: "Semeadura",
    description: "Substrato úmido nivelado na bandeja. Distribuição uniforme das sementes sem cobrir.",
    icon: Sprout,
    duration: "15 min",
  },
  {
    step: 3,
    title: "Blackout",
    description: "Cobertura com bandeja invertida + peso. Escuridão simula estar sob o solo.",
    icon: Layers,
    duration: "2-7 dias",
  },
  {
    step: 4,
    title: "Crescimento",
    description: "Exposição à luz LED 16h/dia. Irrigação inferior 1-2x/dia. Ventilação constante.",
    icon: Sun,
    duration: "5-14 dias",
  },
  {
    step: 5,
    title: "Colheita",
    description: "Corte 1-2 cm acima do substrato com tesoura higienizada. Refrigerar a 2-4°C.",
    icon: Scissors,
    duration: "Dia 7-21",
  },
];

const businessNumbers = [
  { label: "Investimento inicial", value: "R$ 1.500", subtitle: "produção artesanal" },
  { label: "Preço por kg", value: "R$ 160-400", subtitle: "conforme variedade" },
  { label: "Margem bruta", value: "85-90%", subtitle: "após estabilização" },
  { label: "Ciclos por mês", value: "4-6", subtitle: "colheita semanal" },
];

const faqs = [
  {
    question: "Preciso de experiência prévia em agricultura?",
    answer: "Não! O curso é desenhado para iniciantes absolutos. Começamos do zero e avançamos até técnicas profissionais. Tudo com linguagem acessível e muita prática.",
  },
  {
    question: "Quanto espaço preciso para começar?",
    answer: "Para começar em casa, basta uma bancada de 1m². Para produção artesanal comercial, recomendamos 6-12m². No curso, ensinamos layouts otimizados para cada escala.",
  },
  {
    question: "Qual o investimento inicial para produção comercial?",
    answer: "Produção caseira: R$ 150-300. Artesanal (5-10 bandejas/semana): R$ 1.500-3.000. Semi-profissional (12m² indoor): ~R$ 25.000. No módulo de negócios, detalhamos cada cenário.",
  },
  {
    question: "Microverdes são a mesma coisa que brotos?",
    answer: "Não. Brotos germinam em água (3-7 dias) e a raiz é consumida. Microverdes crescem em substrato com luz (7-21 dias) e são cortados acima do solo. São mais nutritivos, saborosos e seguros.",
  },
  {
    question: "Quais variedades são mais fáceis para começar?",
    answer: "Rabanete (5-12 dias), brócolis (8-12 dias) e rúcula (6-12 dias) são as mais indicadas para iniciantes — germinação rápida, alta taxa de sucesso e boa demanda comercial.",
  },
  {
    question: "Consigo vender para restaurantes?",
    answer: "Sim! No módulo de comercialização, ensinamos como prospectar, precificar e fechar contratos semanais com restaurantes. Chefs pagam premium por frescor e qualidade constante.",
  },
  {
    question: "O curso oferece certificado?",
    answer: "Sim. Ao concluir todos os módulos e apresentar seu projeto final, você recebe certificado de conclusão + acesso vitalício à comunidade de alunos para suporte contínuo.",
  },
];

const CursoMicroverdesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Curso de Cultivo de Microverdes | Cultivee Agro</title>
        <meta name="description" content="Curso completo de cultivo de microverdes: do zero à comercialização. 10 módulos, 50+ horas de conteúdo teórico e prático. Aprenda a produzir e vender microverdes com alta margem de lucro." />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-agro/15 via-background to-agro/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li><Link to="/agro" className="hover:text-foreground transition-colors">Agro</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li className="text-foreground font-medium">Cultivo de Microverdes</li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-agro/10 text-agro px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Mais vendido
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Cultivo de Microverdes
              </h1>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Curso completo do zero à comercialização. Aprenda a produzir alimentos com
                até 40x mais nutrientes em ciclos de 7 a 21 dias — no espaço de uma bancada.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-agro" /> 50+ horas</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-agro" /> 10 módulos</span>
                <span className="flex items-center gap-1.5"><Sprout className="w-4 h-4 text-agro" /> Teoria + prática</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/5519992805563?text=Olá! Tenho interesse no curso de Microverdes." target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 bg-agro hover:bg-agro/90 w-full sm:w-auto">
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
                  src="/cursos/microverdes.jpg"
                  alt="Microverdes frescos prontos para colheita"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="text-2xl font-bold text-agro">40x</div>
                <div className="text-xs text-muted-foreground">mais nutrientes</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="text-2xl font-bold text-agro">7-21</div>
                <div className="text-xs text-muted-foreground">dias até colheita</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que são Microverdes */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">O que são Microverdes?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Microverdes são plantas jovens comestíveis colhidas entre 7 e 21 dias após a germinação,
                quando apresentam as primeiras folhas verdadeiras. Medem de 2,5 a 10 cm e são cortados
                acima do substrato.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Estudos da Universidade de Maryland/USDA comprovaram que microverdes contêm até 40 vezes
                mais nutrientes que as versões adultas — incluindo vitaminas C, E, K, betacaroteno,
                polifenóis e antioxidantes em concentrações superiores.
              </p>
              <div className="bg-agro/5 border border-agro/20 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-agro" />
                  Microverdes ≠ Brotos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Brotos germinam em água (3-7 dias) e a raiz é consumida. Microverdes crescem
                  em substrato com luz e são cortados — mais nutritivos, saborosos e seguros.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Leaf, label: "Vitaminas C, E, K", detail: "Concentração superior" },
                { icon: Beaker, label: "Sulforafano", detail: "100x mais que brócolis adulto" },
                { icon: TrendingUp, label: "Mercado global", detail: "R$ 3,5 bi em 2025" },
                { icon: Clock, label: "Colheita rápida", detail: "7-21 dias do plantio" },
              ].map((item) => (
                <div key={item.label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-agro/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-agro" />
                  </div>
                  <div className="font-semibold text-foreground text-sm mb-1">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Processo passo a passo */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Da Semente à Colheita</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O processo completo em 5 etapas — simples, rápido e replicável.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="bg-card border border-border rounded-xl p-5 text-center relative">
                <div className="w-12 h-12 rounded-full bg-agro/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-6 h-6 text-agro" />
                </div>
                <div className="text-xs text-agro font-bold mb-1">{s.duration}</div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                {s.step < 5 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-agro/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Variedades */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Variedades que Você Vai Aprender</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No curso, abordamos mais de 20 variedades. Aqui estão as principais.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {varieties.map((v) => (
              <div key={v.name} className="bg-card border border-border rounded-xl p-5 hover:shadow-elegant transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${v.color}`}></div>
                  <h3 className="font-semibold text-foreground">{v.name}</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Colheita</span>
                    <span className="text-foreground font-medium">{v.days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível</span>
                    <span className={`font-medium ${v.level === 'Iniciante' ? 'text-green-600' : v.level === 'Intermediário' ? 'text-yellow-600' : 'text-red-500'}`}>
                      {v.level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sabor</span>
                    <span className="text-foreground">{v.flavor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Densidade</span>
                    <span className="text-foreground">{v.density}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Demolho</span>
                    <span className="text-foreground">{v.soak ? "Sim" : "Não"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Módulos do Curso */}
      <section id="modulos" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Conteúdo Completo do Curso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              10 módulos que cobrem teoria, prática e negócios. Do iniciante ao profissional.
            </p>
          </div>

          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.number} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-agro/10 flex items-center justify-center">
                    <mod.icon className="w-6 h-6 text-agro" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-agro bg-agro/10 px-2 py-0.5 rounded">
                        MÓDULO {mod.number}
                      </span>
                      <span className="text-xs text-muted-foreground">{mod.hours}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{mod.title}</h3>
                    <ul className="space-y-1.5">
                      {mod.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-agro flex-shrink-0 mt-0.5" />
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

      {/* Números do Negócio */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Números do Negócio</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Microverdes são um dos negócios agrícolas com maior margem de lucro e menor barreira de entrada.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessNumbers.map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-agro mb-1">{item.value}</div>
                <div className="font-medium text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.subtitle}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-agro/5 border border-agro/20 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-agro" />
              Público-alvo para vendas
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {[
                { title: "Restaurantes gourmet", detail: "Contratos semanais, R$ 500-2.500/semana" },
                { title: "Lojas de naturais", detail: "Público consciente, demanda crescente" },
                { title: "Feiras orgânicas", detail: "Venda direta, margem total" },
                { title: "Direto ao consumidor", detail: "Instagram/WhatsApp, assinatura semanal" },
              ].map((t) => (
                <div key={t.title} className="bg-card rounded-lg p-3 border border-border">
                  <div className="font-medium text-foreground mb-1">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Condições Ambientais */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Condições Ideais de Cultivo</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: ThermometerSun,
                title: "Temperatura",
                value: "18-22°C",
                detail: "Germinação e crescimento. Armazenamento pós-colheita: 2-4°C.",
              },
              {
                icon: Droplets,
                title: "Umidade",
                value: "40-60%",
                detail: "Acima de 70% favorece mofo. Usar desumidificador se necessário.",
              },
              {
                icon: Sun,
                title: "Iluminação",
                value: "16h/dia",
                detail: "LED full spectrum, 100-400 PPFD, 15-30 cm de distância.",
              },
              {
                icon: Wind,
                title: "Ventilação",
                value: "Constante",
                detail: "Ventilador oscilante suave. Previne mofo e fortalece caules.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-agro/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-agro" />
                </div>
                <div className="text-2xl font-bold text-agro mb-1">{item.value}</div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problemas Comuns */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Problemas Comuns e Soluções</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No curso, você aprende a identificar e resolver cada um destes problemas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                problem: "Mofo",
                cause: "Excesso de umidade, falta de ventilação",
                solution: "Peróxido de hidrogênio 3%, melhorar ventilação, irrigação inferior",
              },
              {
                problem: "Damping off",
                cause: "Patógenos fúngicos em substrato úmido/frio",
                solution: "Aumentar temperatura, melhorar drenagem, tratar sementes",
              },
              {
                problem: "Crescimento desigual",
                cause: "Semeadura ou iluminação irregular",
                solution: "Pesar sementes, nivelar substrato, rotacionar bandejas 180°",
              },
              {
                problem: "Estiolamento",
                cause: "Luz insuficiente ou muito distante",
                solution: "Aproximar LEDs (15-20 cm), aumentar fotoperiodo para 16-18h",
              },
              {
                problem: "Amarelecimento",
                cause: "Falta de luz ou excesso de água",
                solution: "Normal pós-blackout (24-48h). Se persistir: reduzir rega",
              },
              {
                problem: "Não germina",
                cause: "Sementes velhas, temperatura inadequada",
                solution: "Verificar taxa de germinação (>85%), manter 18-24°C",
              },
            ].map((item) => (
              <div key={item.problem} className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {item.problem}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Causa:</strong> {item.cause}
                </p>
                <p className="text-xs text-agro">
                  <strong>Solução:</strong> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-elegant transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-agro to-agro/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece a produzir microverdes
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            10 módulos, 50+ horas de conteúdo, prática orientada e mentoria.
            Do primeiro plantio à sua primeira venda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5519992805563?text=Olá! Tenho interesse no curso de Microverdes." target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-agro hover:bg-white/90 gap-2">
                Quero me inscrever
              </Button>
            </a>
            <Link to="/agro">
              <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-agro">
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

export default CursoMicroverdesPage;
