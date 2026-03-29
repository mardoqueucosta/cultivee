import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import {
  Droplets, Smartphone, Wifi, WifiOff, Sun, Clock, Settings, Shield,
  Zap, ToggleLeft, Layers, ExternalLink, ChevronRight, Timer, Gauge
} from "lucide-react";

const features = [
  {
    icon: ToggleLeft,
    title: "Controle Manual de Relés",
    description: "Ligue e desligue luz e bomba d'água com um toque. Interface com feedback visual instantâneo e confirmação do estado real do módulo."
  },
  {
    icon: Clock,
    title: "Modo Automático com Fases",
    description: "Configure fases de cultivo (muda, berçário, engorda) com horários de luz e ciclos de irrigação dia/noite. O sistema opera sozinho 24h."
  },
  {
    icon: Layers,
    title: "Fases Configuráveis",
    description: "Adicione, remova ou edite fases livremente. Cada fase tem duração, horário de luz (ex: 06h-18h) e irrigação independente (minutos ligado/desligado)."
  },
  {
    icon: Gauge,
    title: "Dashboard em Tempo Real",
    description: "Acompanhe dia do ciclo, fase atual, status da luz e bomba, sinal WiFi (RSSI), uptime do módulo e IP na rede local."
  },
  {
    icon: Wifi,
    title: "Funciona Online e Offline",
    description: "Com internet, controle de qualquer lugar. Sem internet, conecte direto na rede WiFi do módulo (192.168.4.1) para controle local."
  },
  {
    icon: Smartphone,
    title: "PWA Instalável",
    description: "Instale no celular como app nativo. Funciona offline, recebe atualizações automáticas e abre direto da tela inicial."
  },
];

const phases = [
  { name: "Muda", days: "3 dias", light: "06:00 - 18:00", pumpDay: "15/15 min", pumpNight: "15/45 min" },
  { name: "Berçário", days: "17 dias", light: "06:00 - 18:00", pumpDay: "15/15 min", pumpNight: "15/45 min" },
  { name: "Engorda", days: "∞", light: "06:00 - 18:00", pumpDay: "15/15 min", pumpNight: "15/45 min" },
];

const techSpecs = [
  { label: "Microcontrolador", value: "ESP32-WROOM-32D" },
  { label: "Relés", value: "2 canais 5V (luz + bomba)" },
  { label: "Conexão", value: "WiFi 2.4GHz (AP + STA)" },
  { label: "Servidor", value: "Flask + SQLite (Docker)" },
  { label: "Frontend", value: "PWA (JavaScript vanilla)" },
  { label: "Protocolo", value: "HTTP REST + polling" },
  { label: "Autenticação", value: "Token Bearer (30 dias)" },
  { label: "Modo Local", value: "AP 192.168.4.1 (sem internet)" },
];

const ProdutoHidroponiaPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-500/10 via-background to-green-500/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li className="text-foreground font-medium">Controle Hidroponia</li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Droplets className="w-4 h-4" />
                Aplicativo PWA
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Controle Hidroponia
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Dashboard inteligente para controlar seu sistema hidropônico via ESP32.
                Gerencie luz e bomba d'água, configure fases de cultivo e acompanhe
                o ciclo das plantas — tudo pelo celular.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://hidro.cultivee.com.br" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                    <ExternalLink className="w-4 h-4" />
                    Acessar App
                  </Button>
                </a>
                <a href="https://wa.me/5519992805563" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2">
                    Falar com a equipe
                  </Button>
                </a>
              </div>
            </div>

            {/* Screenshot */}
            <div className="flex justify-center">
              <div className="relative w-[280px]">
                <div className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl bg-[#0f1923]">
                  <img
                    src="/produtos/hidro-login.jpg"
                    alt="Cultivee Hidroponia - Tela de Login"
                    className="w-full"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  PWA
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">O App por Dentro</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja a interface real do aplicativo — dashboard com status do módulo, controles e informações do cultivo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Dashboard */}
            <div className="text-center">
              <div className="relative inline-block w-[280px]">
                <div className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl bg-[#0f1923]">
                  <img
                    src="/produtos/hidro-dashboard.jpg"
                    alt="Dashboard Hidroponia - Dia do ciclo, fase atual, controles de relés"
                    className="w-full"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mt-6 mb-1">Dashboard Principal</h3>
              <p className="text-sm text-muted-foreground">
                Dia do ciclo, fase atual, status dos relés, modo automático e fases configuradas.
              </p>
            </div>

            {/* Phases */}
            <div className="text-center">
              <div className="relative inline-block w-[280px]">
                <div className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl bg-[#0f1923]">
                  <img
                    src="/produtos/hidro-phases.jpg"
                    alt="Fases Configuradas - Muda, Berçário e Engorda com detalhes"
                    className="w-full"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mt-6 mb-1">Fases Configuradas</h3>
              <p className="text-sm text-muted-foreground">
                Visualize todas as fases com duração, horários de luz e ciclos de irrigação dia/noite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Funcionalidades</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Controle completo do seu sistema hidropônico em uma interface simples e responsiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-elegant transition-all">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Phases */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Fases de Cultivo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Configure fases automáticas para cada etapa do crescimento. O sistema alterna entre fases automaticamente conforme a duração configurada.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {phases.map((phase, i) => (
              <div key={phase.name} className="bg-card border border-border rounded-xl p-6 relative">
                {i === 2 && (
                  <span className="absolute top-3 right-3 bg-green-500/10 text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                    ATIVA
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-600 font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{phase.name}</h3>
                    <span className="text-xs text-muted-foreground">{phase.days}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <span>Luz: {phase.light}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Irrigação dia: {phase.pumpDay}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="w-4 h-4 text-indigo-500" />
                    <span>Irrigação noite: {phase.pumpNight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture / How it connects */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Como Funciona</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">ESP32 no cultivo</h3>
              <p className="text-sm text-muted-foreground">
                O módulo ESP32-WROOM controla os relés de luz e bomba. Se registra no servidor a cada 10 segundos e executa comandos automaticamente.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Servidor na nuvem</h3>
              <p className="text-sm text-muted-foreground">
                Flask + SQLite hospedado no VPS com Docker. Gerencia usuários, módulos e fila de comandos. Comunica com o ESP32 via HTTP polling.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">App no celular</h3>
              <p className="text-sm text-muted-foreground">
                PWA instalável que mostra o dashboard, controles e configuração de fases. Funciona online (via servidor) ou offline (direto no ESP32).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Especificações Técnicas</h2>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {techSpecs.map((spec, i) => (
              <div key={spec.label} className={`flex items-center justify-between px-6 py-4 ${i < techSpecs.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-sm font-medium text-foreground">{spec.label}</span>
                <span className="text-sm text-muted-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece a controlar seu cultivo
          </h2>
          <p className="text-white/80 mb-8">
            Crie sua conta gratuitamente e vincule seu módulo ESP32 em minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://hidro.cultivee.com.br" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-green-700 hover:bg-white/90 gap-2">
                <ExternalLink className="w-4 h-4" />
                Acessar App
              </Button>
            </a>
            <a href="https://wa.me/5519992805563" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-green-700">
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProdutoHidroponiaPage;
