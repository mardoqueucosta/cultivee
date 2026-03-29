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
  AlertTriangle, Layers, ThermometerSun, Wind, Package,
  Target, Zap, GraduationCap, Gauge, Pipette, Ruler,
  CircleDot, Settings, Wrench, FlaskConical, BarChart3
} from "lucide-react";

const modules = [
  {
    number: "01",
    title: "Fundamentos da Hidroponia",
    icon: BookOpen,
    hours: "6h",
    topics: [
      "O que é hidroponia: cultivo sem solo com solução nutritiva",
      "História e evolução: das pesquisas de Hoagland ao mercado de 3.000+ hectares no Brasil",
      "Vantagens: 6x mais produtividade, 90% menos água, sem agrotóxicos",
      "Panorama do mercado brasileiro e oportunidades de negócio",
    ],
  },
  {
    number: "02",
    title: "Sistemas Hidropônicos",
    icon: Settings,
    hours: "6h",
    topics: [
      "NFT (Nutrient Film Technique): o sistema mais usado no Brasil — fluxo laminar contínuo",
      "DWC (Deep Water Culture): raízes submersas com oxigenação constante",
      "Ebb & Flow e Gotejamento: quando e como utilizar cada sistema",
      "Comparativo prático: complexidade, custo, escala e melhor cultura por sistema",
    ],
  },
  {
    number: "03",
    title: "Montagem do Sistema NFT",
    icon: Wrench,
    hours: "8h",
    topics: [
      "Componentes: perfis, reservatório, bomba, timer, net pots e espuma fenólica",
      "Dimensionamento: inclinação 2-4%, vazão 1-2 L/min, canais de até 12 m",
      "Bancadas: altura, largura (1,5 m) e espaçamento entre furos (15-25 cm)",
      "Montagem passo a passo com materiais acessíveis (PVC, metalon, caixa d'água)",
    ],
  },
  {
    number: "04",
    title: "Solução Nutritiva",
    icon: FlaskConical,
    hours: "8h",
    topics: [
      "Macro e micronutrientes essenciais: N, P, K, Ca, Mg, S, Fe, Mn, B, Cu, Zn, Mo",
      "Fórmula Furlani (IAC): preparo completo para 1.000 L com fertilizantes comerciais",
      "EC (Condutividade Elétrica): faixas por cultura — alface 1,2-1,8 / tomate 2,0-3,5 mS/cm",
      "pH ideal (5,5-6,5): como medir, ajustar e manter estável",
    ],
  },
  {
    number: "05",
    title: "Culturas e Manejo",
    icon: Sprout,
    hours: "8h",
    topics: [
      "Folhosas: alface, rúcula, manjericão, couve — ciclo, EC e espaçamento ideais",
      "Frutos: tomate cereja, pimentão, morango — sistemas e cuidados específicos",
      "Germinação em espuma fenólica e transplante para perfis NFT",
      "Escalonamento de produção: replantio semanal para colheita contínua",
    ],
  },
  {
    number: "06",
    title: "Qualidade da Água",
    icon: Droplets,
    hours: "4h",
    topics: [
      "Análise química: EC máxima 0,5 mS/cm, sódio < 11,5 ppm, cloro < 35,5 ppm",
      "Água dura e alcalina: impactos no pH e disponibilidade de ferro",
      "Tratamento: filtragem, correção e quando usar osmose reversa",
      "Frequência de troca da solução nutritiva (~30 dias para folhosas)",
    ],
  },
  {
    number: "07",
    title: "Controle Ambiental",
    icon: ThermometerSun,
    hours: "4h",
    topics: [
      "Temperatura: 24-28°C diurna, 16-22°C noturna, solução 18-24°C",
      "Umidade relativa: 60-80% — ventilação, nebulização e desumidificação",
      "Iluminação: DLI 12-14 mol/m²/dia para folhosas, fotoperiodo 14-18h",
      "Estufas no Brasil: cobertura plástica, telas de sombreamento e ventilação cruzada",
    ],
  },
  {
    number: "08",
    title: "Pragas, Doenças e Soluções",
    icon: Shield,
    hours: "6h",
    topics: [
      "Doenças radiculares: Pythium (ponto preto), Fusarium (mancha castanha viscosa)",
      "Algas: causas, prevenção e controle (manter sistema fechado/escuro)",
      "Pragas: pulgão, ácaro, tripes, mosca branca — controle com óleo de neem e biológicos",
      "Deficiências nutricionais: diagnóstico visual (clorose, tip burn, bordas secas)",
    ],
  },
  {
    number: "09",
    title: "Negócio e Comercialização",
    icon: ShoppingCart,
    hours: "6h",
    topics: [
      "Investimento: R$ 50-100/m² (média tecnologia) — ROI em ~13 meses",
      "Produção comercial: até 12.000 plantas em 1.000 m² com 1 pessoa",
      "Precificação: alface hidropônico vale 2x mais que convencional",
      "Canais de venda: feiras, mercados, restaurantes, cestas de assinatura",
    ],
  },
  {
    number: "10",
    title: "Projeto Final e Mentoria",
    icon: GraduationCap,
    hours: "4h",
    topics: [
      "Desenvolvimento do seu projeto hidropônico individual",
      "Cálculo de viabilidade: investimento, custo operacional e projeção de receita",
      "Apresentação e feedback personalizado com mentores",
      "Certificado de conclusão + acesso à comunidade de alunos",
    ],
  },
];

const vegetables = [
  {
    name: "Alface",
    cycle: "35-47 dias",
    ec: "1,2-1,8",
    temp: "15-25°C",
    color: "bg-green-500",
    spacing: "25 cm",
    system: "NFT",
    note: "Principal cultura hidropônica no Brasil",
  },
  {
    name: "Rúcula",
    cycle: "25-35 dias",
    ec: "1,2-1,8",
    temp: "15-22°C",
    color: "bg-green-600",
    spacing: "15-20 cm",
    system: "NFT",
    note: "Crescimento rápido, alta demanda",
  },
  {
    name: "Manjericão",
    cycle: "40-60 dias",
    ec: "1,0-1,6",
    temp: "25-30°C",
    color: "bg-emerald-600",
    spacing: "15-20 cm",
    system: "NFT",
    note: "Colheita contínua por poda apical",
  },
  {
    name: "Couve",
    cycle: "60-80 dias",
    ec: "1,5-2,5",
    temp: "15-25°C",
    color: "bg-green-700",
    spacing: "30 cm",
    system: "NFT",
    note: "Colheita escalonada de folhas externas",
  },
  {
    name: "Tomate Cereja",
    cycle: "80-90 dias",
    ec: "2,0-3,5",
    temp: "20-28°C",
    color: "bg-red-500",
    spacing: "90-120 cm",
    system: "NFT/Gotejo",
    note: "Até 166 ton/ha/ano em estufa",
  },
  {
    name: "Morango",
    cycle: "~60 dias",
    ec: "1,4-2,0",
    temp: "15-25°C",
    color: "bg-rose-500",
    spacing: "25-30 cm",
    system: "NFT/Vertical",
    note: "Acima de 1 kg/planta",
  },
  {
    name: "Pimentão",
    cycle: "90-120 dias",
    ec: "2,0-2,8",
    temp: "22-25°C",
    color: "bg-yellow-500",
    spacing: "40-50 cm",
    system: "Gotejamento",
    note: "Ciclo longo, necessita tutoramento",
  },
  {
    name: "Acelga",
    cycle: "50-70 dias",
    ec: "1,8-2,3",
    temp: "15-22°C",
    color: "bg-amber-600",
    spacing: "25-30 cm",
    system: "NFT/DWC",
    note: "Cultura de estação fria, colheita contínua",
  },
];

const nftSteps = [
  {
    step: 1,
    title: "Germinação",
    description: "Semeie em espuma fenólica umedecida com água pH 6,0. Mantenha em local protegido até emergir.",
    icon: Sprout,
    duration: "5-10 dias",
  },
  {
    step: 2,
    title: "Berçário",
    description: "Transfira mudas para perfis NFT com EC reduzida (0,5 mS/cm). Espaçamento menor para otimizar espaço.",
    icon: Layers,
    duration: "7-15 dias",
  },
  {
    step: 3,
    title: "Crescimento",
    description: "Mova para bancada definitiva com EC plena (1,2-1,8 mS/cm). Monitore pH e EC diariamente.",
    icon: Sun,
    duration: "15-25 dias",
  },
  {
    step: 4,
    title: "Monitoramento",
    description: "Verifique raízes, folhas e solução. Ajuste pH (5,5-6,5), reponha nutrientes e controle pragas.",
    icon: Gauge,
    duration: "Contínuo",
  },
  {
    step: 5,
    title: "Colheita",
    description: "Colha quando atingir tamanho comercial. Lave, embale e refrigere. Replante imediatamente.",
    icon: Package,
    duration: "Dia 35-47",
  },
];

const businessNumbers = [
  { label: "Investimento médio", value: "R$ 50-100", subtitle: "por m² (média tecnologia)" },
  { label: "Produtividade", value: "6x maior", subtitle: "que cultivo em solo" },
  { label: "Economia de água", value: "90%", subtitle: "comparado ao convencional" },
  { label: "ROI estimado", value: "~13 meses", subtitle: "retorno do investimento" },
];

const equipmentList = [
  { item: "Perfis hidropônicos (PVC 75-100mm)", cost: "R$ 150-300", qty: "4-6 unid. de 3m" },
  { item: "Reservatório 100-150L", cost: "R$ 80-200", qty: "1 unidade" },
  { item: "Bomba submersa (1000-2000 L/h)", cost: "R$ 60-150", qty: "1 unidade" },
  { item: "Timer digital", cost: "R$ 40-80", qty: "1 unidade" },
  { item: "Tubulação e conexões PVC", cost: "R$ 50-100", qty: "Kit completo" },
  { item: "Net pots (vasos rede)", cost: "R$ 30-60", qty: "50-100 unidades" },
  { item: "Espuma fenólica", cost: "R$ 15-30", qty: "1 placa (200+ células)" },
  { item: "Medidor de pH (digital)", cost: "R$ 30-150", qty: "1 unidade" },
  { item: "Medidor de EC/TDS", cost: "R$ 40-120", qty: "1 unidade" },
  { item: "Kit nutrientes (1000L)", cost: "R$ 40-80", qty: "1 kit" },
  { item: "Estrutura/suporte (metalon)", cost: "R$ 100-300", qty: "Sob medida" },
];

const commonProblems = [
  {
    problem: "Folhas amareladas (clorose)",
    cause: "Deficiência de nitrogênio ou ferro, pH fora da faixa",
    solution: "Verificar pH (5,5-6,5), ajustar EC e repor micronutrientes (Fe-EDTA)",
  },
  {
    problem: "Pontas das folhas secas (tip burn)",
    cause: "Deficiência de cálcio, temperatura elevada ou baixa transpiração",
    solution: "Aumentar ventilação, verificar nível de cálcio na solução, reduzir EC",
  },
  {
    problem: "Raízes escurecidas",
    cause: "Pythium (fungo), temperatura da solução acima de 30°C ou falta de oxigênio",
    solution: "Cortar raízes mortas, trocar solução, manter temperatura 18-24°C",
  },
  {
    problem: "Algas nos canais e reservatório",
    cause: "Exposição da solução nutritiva à luz solar",
    solution: "Cobrir reservatório e canais para bloquear luz, limpar sistema periodicamente",
  },
  {
    problem: "Crescimento lento",
    cause: "EC muito baixa, fotoperiodo insuficiente ou temperatura inadequada",
    solution: "Ajustar EC conforme cultura, garantir 14-18h de luz e temperatura 24-28°C",
  },
  {
    problem: "Pulgões e mosca branca",
    cause: "Falta de barreiras físicas, excesso de nitrogênio (trofobiose)",
    solution: "Aplicar óleo de neem, instalar telas anti-inseto, equilibrar nutrição",
  },
];

const faqs = [
  {
    question: "Preciso de experiência prévia em agricultura?",
    answer: "Não! O curso é desenhado para iniciantes absolutos. Começamos do zero explicando o que é hidroponia e avançamos gradualmente até a produção comercial. Tudo com linguagem acessível e muita prática.",
  },
  {
    question: "Quanto espaço preciso para começar?",
    answer: "Para um sistema caseiro, a partir de 4m². Para produção comercial, recomendamos 100-1.000m². No curso, ensinamos layouts otimizados para cada escala, desde bancadas compactas até estufas completas.",
  },
  {
    question: "Qual o investimento inicial?",
    answer: "Um sistema caseiro (30-50 plantas) custa entre R$ 665 e R$ 1.620 em montagem própria, ou R$ 2.290 em kit pronto. Para escala comercial (1.000m²), o investimento varia de R$ 50.000 a R$ 100.000 com retorno em ~13 meses.",
  },
  {
    question: "O que posso cultivar com hidroponia?",
    answer: "Praticamente qualquer hortaliça! Folhosas (alface, rúcula, manjericão) são as mais populares e fáceis. Também é possível cultivar frutos como tomate cereja, morango e pimentão com sistemas adaptados.",
  },
  {
    question: "A hidroponia usa agrotóxicos?",
    answer: "Não! O ambiente controlado reduz drasticamente pragas e doenças. Quando necessário, utilizamos controle biológico e produtos naturais como óleo de neem. A produção é muito mais limpa que a convencional.",
  },
  {
    question: "Quanto posso lucrar com hidroponia?",
    answer: "O alface hidropônico vende pelo dobro do convencional. Com 600m² úteis, é possível produzir ~580 pés/dia. Produtores reportam faturamento bruto acima de R$ 30.000/mês. Uma pessoa cuida de até 10.000 plantas.",
  },
  {
    question: "O curso oferece certificado?",
    answer: "Sim. Ao concluir todos os módulos e apresentar seu projeto final, você recebe certificado de conclusão + acesso vitalício à comunidade de alunos para suporte contínuo e troca de experiências.",
  },
];

const CursoHidroponiaPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Curso de Hidroponia — Cultivo de Hortaliças | Cultivee Agro</title>
        <meta name="description" content="Curso completo de hidroponia: monte seu sistema NFT e produza hortaliças o ano todo. 10 módulos, 60+ horas de conteúdo teórico e prático. Do zero à produção comercial." />
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
              <li className="text-foreground font-medium">Hidroponia</li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-agro/10 text-agro px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Droplets className="w-4 h-4" />
                Cultivo de Hortaliças
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Hidroponia — Cultivo de Hortaliças
              </h1>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Monte seu sistema NFT e produza hortaliças o ano todo com controle total.
                Até 6x mais produtividade que o cultivo em solo, usando 90% menos água.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-agro" /> 60+ horas</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-agro" /> 10 módulos</span>
                <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-agro" /> Teoria + prática</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/5519992805563?text=Olá! Tenho interesse no curso de Hidroponia." target="_blank" rel="noopener noreferrer">
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
                  src="/cursos/hidroponia.jpg"
                  alt="Sistema hidropônico NFT com hortaliças"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="text-2xl font-bold text-agro">6x</div>
                <div className="text-xs text-muted-foreground">mais produtivo</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-xl shadow-lg p-4 border border-border">
                <div className="text-2xl font-bold text-agro">90%</div>
                <div className="text-xs text-muted-foreground">menos água</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que é Hidroponia */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">O que é Hidroponia?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Hidroponia é a técnica de cultivar plantas sem solo, utilizando uma solução nutritiva
                com água e minerais essenciais. As raízes ficam em contato direto com a solução,
                absorvendo nutrientes de forma muito mais eficiente que no cultivo convencional.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                No Brasil, a área hidropônica já ultrapassa 3.000 hectares, com o sistema NFT
                (Nutrient Film Technique) sendo o mais utilizado. Uma produção hidropônica
                de alface rende 313 ton/ha/ano — 6 vezes mais que as 52 ton/ha/ano do cultivo em solo.
              </p>
              <div className="bg-agro/5 border border-agro/20 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-agro" />
                  Por que o NFT domina no Brasil?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Custo acessível, manutenção simples, excelente para folhosas e uso eficiente de água.
                  Um filme fino de solução (2-3 mm) flui por canais inclinados — as raízes absorvem
                  nutrientes enquanto a parte superior respira.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Droplets, label: "90% menos água", desc: "que cultivo convencional" },
                { icon: TrendingUp, label: "6x mais produtivo", desc: "313 vs 52 ton/ha/ano" },
                { icon: Clock, label: "Ciclo 40% menor", desc: "35-47 vs 60-65 dias (alface)" },
                { icon: Shield, label: "Sem agrotóxicos", desc: "ambiente controlado" },
                { icon: Sun, label: "Produção o ano todo", desc: "independente do clima" },
                { icon: Target, label: "Perda de apenas 2%", desc: "vs 30-40% convencional" },
              ].map((item, index) => (
                <div key={index} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <item.icon className="w-6 h-6 text-agro mb-2" />
                  <div className="font-semibold text-foreground text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Etapas do cultivo NFT */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Da Muda à Colheita</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            O ciclo completo no sistema NFT — da germinação em espuma fenólica até a colheita de hortaliças frescas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {nftSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md transition-shadow h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-agro/10 rounded-full mb-4">
                    <item.icon className="w-6 h-6 text-agro" />
                  </div>
                  <div className="text-xs font-semibold text-agro uppercase mb-2">Etapa {item.step}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="text-xs font-medium text-agro bg-agro/10 px-3 py-1 rounded-full inline-block">
                    {item.duration}
                  </div>
                </div>
                {item.step < 5 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-agro/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culturas */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Hortaliças que Você Vai Aprender a Cultivar
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Das folhosas de ciclo rápido aos frutos de alto valor — cada cultura com seus parâmetros ideais de EC, pH e temperatura.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vegetables.map((veg, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${veg.color}`} />
                  <h3 className="font-bold text-foreground">{veg.name}</h3>
                </div>
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ciclo</span>
                    <span className="font-medium text-foreground">{veg.cycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EC (mS/cm)</span>
                    <span className="font-medium text-foreground">{veg.ec}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperatura</span>
                    <span className="font-medium text-foreground">{veg.temp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Espaçamento</span>
                    <span className="font-medium text-foreground">{veg.spacing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sistema</span>
                    <span className="font-medium text-foreground">{veg.system}</span>
                  </div>
                </div>
                <p className="text-xs text-agro font-medium">{veg.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução Nutritiva */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Solução Nutritiva — O Coração da Hidroponia
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A fórmula Furlani (IAC) é referência no Brasil para folhosas. No curso, você aprende a preparar, monitorar e ajustar.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Fórmula */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-agro" />
                Fórmula Furlani — para 1.000L
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Solução completa para alface e folhosas em sistema NFT</p>
              <div className="space-y-3">
                {[
                  { fert: "Nitrato de Cálcio", qty: "750 g" },
                  { fert: "Nitrato de Potássio", qty: "500 g" },
                  { fert: "MAP (Monoamônio Fosfato)", qty: "150 g" },
                  { fert: "Sulfato de Magnésio", qty: "300 g" },
                  { fert: "Conmicros Standard", qty: "25 g" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-foreground font-medium">{item.fert}</span>
                    <span className="text-agro font-bold">{item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-agro/5 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">EC alvo:</strong> ~2,0 mS/cm •{" "}
                  <strong className="text-foreground">pH:</strong> 5,5-6,5 •{" "}
                  <strong className="text-foreground">Troca:</strong> a cada ~30 dias
                </p>
              </div>
            </div>

            {/* Parâmetros por cultura */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-agro" />
                EC por Cultura (mS/cm)
              </h3>
              <p className="text-sm text-muted-foreground mb-6">Condutividade elétrica ideal para cada tipo de hortaliça</p>
              <div className="space-y-3">
                {[
                  { name: "Alface", ec: "1,2 - 1,8", bar: "w-[35%]" },
                  { name: "Rúcula", ec: "1,2 - 1,8", bar: "w-[35%]" },
                  { name: "Manjericão", ec: "1,0 - 1,6", bar: "w-[30%]" },
                  { name: "Morango", ec: "1,4 - 2,0", bar: "w-[40%]" },
                  { name: "Espinafre", ec: "1,8 - 2,3", bar: "w-[50%]" },
                  { name: "Tomate", ec: "2,0 - 3,5", bar: "w-[75%]" },
                  { name: "Pepino", ec: "1,7 - 2,5", bar: "w-[55%]" },
                  { name: "Pimentão", ec: "2,0 - 2,8", bar: "w-[60%]" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.ec}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full bg-agro rounded-full ${item.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Escala: 0 ————— 2,0 ————— 3,5 mS/cm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos do curso */}
      <section id="modulos" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Conteúdo Completo — 10 Módulos
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            60+ horas de conteúdo teórico e prático. Do fundamento científico à montagem do seu sistema e gestão do negócio.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <div
                key={mod.number}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-agro/10 rounded-xl flex items-center justify-center">
                      <mod.icon className="w-6 h-6 text-agro" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-agro bg-agro/10 px-2 py-0.5 rounded-full">
                        Módulo {mod.number}
                      </span>
                      <span className="text-xs text-muted-foreground">{mod.hours}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-3">{mod.title}</h3>
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

      {/* Lista de Equipamentos */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Equipamentos para Montar seu Sistema NFT
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Lista completa para um sistema caseiro de 30-50 plantas. Investimento total estimado: R$ 665 a R$ 1.620.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 bg-agro/10 text-sm font-semibold text-foreground">
                <div>Item</div>
                <div className="text-center">Quantidade</div>
                <div className="text-right">Custo estimado</div>
              </div>
              {equipmentList.map((eq, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 p-4 border-t border-border text-sm items-center">
                  <div className="text-foreground font-medium">{eq.item}</div>
                  <div className="text-center text-muted-foreground">{eq.qty}</div>
                  <div className="text-right font-semibold text-agro">{eq.cost}</div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-4 p-4 border-t-2 border-agro/30 bg-agro/5">
                <div className="text-foreground font-bold col-span-2">Total estimado (montagem própria)</div>
                <div className="text-right font-bold text-agro text-lg">R$ 665-1.620</div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4 text-agro flex-shrink-0 mt-0.5" />
              <p>Kits prontos como o ToDo Hidro N2 (32 plantas) custam ~R$ 2.290 e incluem tudo montado. No curso, ensinamos as duas abordagens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Números do negócio */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Números do Negócio</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A hidroponia é um negócio rentável — produtores reportam faturamento bruto acima de R$ 30.000/mês.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {businessNumbers.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-agro mb-1">{item.value}</div>
                <div className="font-medium text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-agro mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Escala Caseira</h4>
              <p className="text-sm text-muted-foreground">
                30-50 plantas, 4m². Investimento de R$ 665-1.620. Custo operacional ~R$ 55-120/mês.
                Ideal para consumo próprio e vendas locais.
              </p>
            </div>
            <div className="bg-card border border-agro/30 rounded-xl p-6 text-center shadow-md">
              <BarChart3 className="w-8 h-8 text-agro mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Escala Comercial</h4>
              <p className="text-sm text-muted-foreground">
                12.000 plantas em 1.000m². Investimento R$ 50-100 mil. 1 pessoa cuida de até 10.000 plantas.
                Faturamento acima de R$ 30 mil/mês.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-agro mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Vantagem Competitiva</h4>
              <p className="text-sm text-muted-foreground">
                Alface hidropônico vale 2x o preço do convencional. Produção o ano todo, sem sazonalidade.
                Perda de apenas 2% vs 30-40% no campo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problemas comuns */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Problemas Comuns e Soluções
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            No módulo 8, você aprende a identificar e resolver cada um desses problemas rapidamente.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonProblems.map((item, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-foreground text-sm">{item.problem}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">Causa: </span>
                    <span className="text-muted-foreground">{item.cause}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-agro flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item.solution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
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
      <section className="py-20 bg-gradient-to-br from-agro to-agro/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Droplets className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comece a Produzir Hortaliças Hidropônicas
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            10 módulos, 60+ horas de conteúdo, do zero à produção comercial.
            Monte seu sistema NFT e colha sua primeira alface em 35 dias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/5519992805563?text=Olá! Tenho interesse no curso de Hidroponia." target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2 text-agro font-semibold w-full sm:w-auto">
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

export default CursoHidroponiaPage;
