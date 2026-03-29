import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Factory,
  Store,
  Cloud,
  Droplets,
  Sun,
  ThermometerSun,
  Truck,
  TrendingUp,
  Users,
  TreePine,
  ArrowRight,
  Check,
  Sprout,
  Building2,
  Handshake,
  Target,
  BarChart3,
  Globe,
  Lightbulb,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const ProjetoPage = () => {
  const problems = [
    {
      icon: Truck,
      title: "Perdas pós-colheita",
      description: "30-45% da produção de hortaliças é desperdiçada entre o campo e o consumidor final.",
      stat: "30-45%",
    },
    {
      icon: TrendingUp,
      title: "Cadeia longa e cara",
      description: "Múltiplos intermediários encarecem o produto e reduzem a margem do produtor.",
      stat: "5-7 elos",
    },
    {
      icon: Users,
      title: "Baixo consumo",
      description: "Menos de 10% dos brasileiros consomem a quantidade diária de vegetais recomendada pela OMS.",
      stat: "<10%",
    },
    {
      icon: ThermometerSun,
      title: "Vulnerabilidade climática",
      description: "Eventos extremos e pragas comprometem a produção convencional, exigindo uso intensivo de agroquímicos.",
      stat: "Risco alto",
    },
  ];

  const solutionPillars = [
    {
      icon: Factory,
      title: "Hub — Fazenda Vertical",
      color: "bg-agro",
      shadowClass: "hover:shadow-agro",
      items: [
        "Cultivo hidropônico com iluminação LED otimizada",
        "Controle total de temperatura, umidade e CO₂",
        "Produção de microverdes, mudas e plantas maduras",
        "Ciclo de cultivo de 20-40 dias",
        "Alface, rúcula, salsinha, cebolinha, agrião",
      ],
    },
    {
      icon: Store,
      title: "Spokes — Displays Inteligentes",
      color: "bg-educa",
      shadowClass: "hover:shadow-educa",
      items: [
        "Totens/prateleiras em áreas urbanas de alta densidade",
        "Condomínios, prédios residenciais e centros comerciais",
        "Mantêm as plantas vivas até o ponto de compra",
        "Fase final de 5-10 dias (colheita → venda)",
        "Frescor máximo, zero desperdício",
      ],
    },
    {
      icon: Cloud,
      title: "Plataforma IoT na Nuvem",
      color: "bg-tech",
      shadowClass: "hover:shadow-tech-shadow",
      items: [
        "Monitoramento e controle remoto de todo o sistema",
        "Gestão de inventário e logística inteligente",
        "Alertas automáticos sobre condições e reposição",
        "Automação de clima e nutrição",
        "Receitas de cultivo baseadas em dados",
      ],
    },
  ];

  const impacts = [
    {
      icon: TreePine,
      title: "Ambiental",
      color: "text-agro",
      bgColor: "bg-agro/10",
      items: [
        "Elimina 30-45% de perdas pós-colheita",
        "Reduz emissões de CO₂ da logística",
        "Otimiza o uso de água (hidroponia)",
        "Reduz uso de agroquímicos",
      ],
    },
    {
      icon: Users,
      title: "Social",
      color: "text-educa",
      bgColor: "bg-educa/10",
      items: [
        "Aumenta acesso a vegetais frescos em centros urbanos",
        "Apoia a segurança alimentar e nutricional",
        "Gera empregos qualificados (3-6 por hectare equivalente)",
        "Democratiza alimentação saudável",
      ],
    },
    {
      icon: BarChart3,
      title: "Econômico",
      color: "text-tech",
      bgColor: "bg-tech/10",
      items: [
        "Receita projetada de R$ 1,4M/ano (Ano 5)",
        "Modelo de franquias escalável",
        "Maior margem para o produtor",
        "Preços mais estáveis ao consumidor",
      ],
    },
  ];

  const businessStreams = [
    {
      icon: Sprout,
      title: "Venda Direta",
      description: "Produção própria de hortaliças, mudas e microverdes para venda direta ao consumidor via displays.",
    },
    {
      icon: Building2,
      title: "Franquias",
      description: "Expansão geográfica rápida via modelo de franquia com taxa de adesão + royalties sobre vendas.",
    },
    {
      icon: Handshake,
      title: "Venda B2B",
      description: "Comercialização de displays inteligentes e licenciamento da plataforma IoT para outros produtores.",
    },
  ];

  const timeline = [
    { phase: "TRL 3", label: "Prova de conceito", description: "Componentes individuais validados separadamente", done: true },
    { phase: "TRL 4", label: "Validação em laboratório", description: "Protótipos integrados em ambiente controlado", done: true },
    { phase: "TRL 5", label: "Validação em ambiente relevante", description: "Sistema operando em escala piloto", done: false },
    { phase: "TRL 6", label: "Demonstração em ambiente operacional", description: "Protótipo completo testado em cenário real", done: false },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Agricultura Urbana
            <br />
            <span className="text-white/90">Inteligente</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/85 max-w-3xl mx-auto mb-10 leading-relaxed">
            Sistema integrado de produção, distribuição e comercialização de hortaliças
            em ambientes urbanos — do cultivo vertical ao ponto de venda, com a planta viva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                Fale Conosco
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#solucao">
              <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-primary px-8">
                Conheça a Solução
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O Desafio da Alimentação Urbana
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A cadeia de suprimento de hortaliças no Brasil enfrenta problemas críticos que afetam produtores e consumidores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-destructive/10 rounded-xl mb-4">
                  <problem.icon className="w-7 h-7 text-destructive" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{problem.stat}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução */}
      <section id="solucao" className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossa Solução
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Um sistema integrado que mantém as hortaliças vivas do cultivo até a compra,
              eliminando perdas pós-colheita e maximizando o frescor.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {solutionPillars.map((pillar, index) => (
              <div
                key={index}
                className={`bg-card rounded-2xl border border-border shadow-elegant ${pillar.shadowClass} transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              >
                <div className={`${pillar.color} p-6 flex items-center gap-4`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <pillar.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                </div>
                <div className="p-6 space-y-3">
                  {pillar.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona — Fluxo Visual */}
      <section className="py-20 bg-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Da semente ao prato — um fluxo contínuo e inteligente.
            </p>
          </div>

          <div className="space-y-0">
            {[
              {
                step: "01",
                icon: Sprout,
                title: "Produção no Hub",
                desc: "Sementes germinam e crescem em ambiente controlado com hidroponia e LED otimizado. Ciclo de 20-40 dias.",
                color: "bg-agro",
              },
              {
                step: "02",
                icon: Truck,
                title: "Distribuição Inteligente",
                desc: "Plantas vivas são transportadas para displays distribuídos em áreas urbanas de alta densidade.",
                color: "bg-educa",
              },
              {
                step: "03",
                icon: Store,
                title: "Display no Ponto de Venda",
                desc: "Displays inteligentes mantêm as plantas vivas por 5-10 dias, com monitoramento IoT contínuo.",
                color: "bg-tech",
              },
              {
                step: "04",
                icon: ShieldCheck,
                title: "Consumidor Colhe Frescor",
                desc: "O cliente compra a planta no pico de frescor. Sem embalagem excessiva, sem desperdício, máxima nutrição.",
                color: "bg-agro",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-stretch gap-6">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center flex-shrink-0 z-10`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  {index < 3 && (
                    <div className="w-0.5 bg-border flex-1 min-h-[40px]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-10">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Etapa {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground max-w-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferencial — Inovação */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-elegant">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                O Diferencial Cultivee
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-destructive mb-3">Cadeia Tradicional</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">&#x2717;</span>
                    Planta colhida → perde frescor a cada hora
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">&#x2717;</span>
                    5-7 intermediários até o consumidor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">&#x2717;</span>
                    30-45% perdido antes de chegar à mesa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">&#x2717;</span>
                    Transporte refrigerado = alto custo + CO₂
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-3">Sistema Cultivee</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Planta viva até o momento da compra
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Cadeia curta: Hub → Display → Consumidor
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Desperdício virtualmente zero
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Logística local = baixo custo + baixa emissão
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impacto */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Impacto Projetado
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Resultados mensuráveis nas dimensões ambiental, social e econômica.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impacts.map((impact, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 border border-border shadow-elegant hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${impact.bgColor} rounded-xl mb-6`}>
                  <impact.icon className={`w-7 h-7 ${impact.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{impact.title}</h3>
                <ul className="space-y-3">
                  {impact.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 ${impact.color} mt-0.5 flex-shrink-0`} />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modelo de Negócio */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Modelo de Negócio
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Três fontes de receita complementares para escalar com solidez.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {businessStreams.map((stream, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 border border-border shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-6">
                  <stream.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{stream.title}</h3>
                <p className="text-sm text-muted-foreground">{stream.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maturidade Tecnológica */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Maturidade Tecnológica
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Progresso de TRL 3 a TRL 6 — da prova de conceito à demonstração em ambiente operacional.
            </p>
          </div>

          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 ${
                  item.done
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    item.done
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground border-2 border-border"
                  }`}
                >
                  {item.done ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.phase}</span>
                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.done && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full hidden sm:inline">
                    Concluído
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parceiros e Programa */}
      <section className="py-20 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Apoio e Parceiros
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-educa/10 rounded-xl mb-4">
                <Target className="w-7 h-7 text-educa" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Programa BASE — SENAI-RS</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bolsa de Apoio ao Desenvolvimento de Tecnologia Emergente, com mentoria técnica e de negócios
                pelo Instituto SENAI de Inovação em Sistemas de Sensoriamento (ISI-SS).
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-tech/10 rounded-xl mb-4">
                <Globe className="w-7 h-7 text-tech" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">FAPESP PIPE</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Proposta submetida ao Programa PIPE (Pesquisa Inovativa em Pequenas Empresas) da FAPESP
                para desenvolvimento de pesquisa aplicada em agricultura urbana inteligente.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Classificação:</strong> Agricultura 4.0 / Deep Tech
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Quer fazer parte dessa transformação?
          </h2>
          <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto">
            Seja como investidor, parceiro ou franqueado — estamos construindo o futuro
            da alimentação urbana no Brasil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                Entre em Contato
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/sobre">
              <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-primary px-8">
                Sobre a Cultivee
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

export default ProjetoPage;
