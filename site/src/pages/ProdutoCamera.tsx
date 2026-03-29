import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import {
  Camera, Smartphone, Wifi, Sun, Clock, Settings, Shield,
  Zap, ToggleLeft, Layers, ExternalLink, ChevronRight, Timer,
  Gauge, Droplets, Image, Video, Eye
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Captura sob Demanda",
    description: "Tire fotos do seu cultivo a qualquer momento pelo app. O ESP32 captura a imagem e envia para o servidor em segundos."
  },
  {
    icon: Video,
    title: "Visualização ao Vivo",
    description: "Stream MJPEG em tempo real quando conectado na rede local. Veja suas plantas crescendo com ~10fps de fluidez."
  },
  {
    icon: ToggleLeft,
    title: "Controle de Relés",
    description: "Mesmo controle de luz e bomba do módulo Hidroponia. Ligue e desligue com um toque, com feedback visual instantâneo."
  },
  {
    icon: Clock,
    title: "Fases Automáticas",
    description: "Configure fases de cultivo com duração, horário de luz e ciclos de irrigação. O sistema opera automaticamente 24h."
  },
  {
    icon: Gauge,
    title: "Dashboard Completo",
    description: "Dia do ciclo, fase atual, status dos relés, sinal WiFi, uptime e temperatura. Tudo em uma interface escura e responsiva."
  },
  {
    icon: Smartphone,
    title: "PWA com Câmera",
    description: "Instale no celular como app nativo. Card de câmera colapsável no topo do dashboard para acesso rápido às capturas."
  },
];

const cameraSpecs = [
  { label: "Sensor", value: "OV2640 integrado" },
  { label: "Resolução", value: "VGA 640x480" },
  { label: "Formato", value: "JPEG (quality 12)" },
  { label: "Stream", value: "MJPEG ~10fps (rede local)" },
  { label: "Captura remota", value: "Via servidor (qualquer lugar)" },
  { label: "Armazenamento", value: "Servidor (data/captures/)" },
];

const techSpecs = [
  { label: "Microcontrolador", value: "ESP32-WROVER-DEV" },
  { label: "Câmera", value: "OV2640 (VGA, JPEG)" },
  { label: "PSRAM", value: "8MB (2 frame buffers)" },
  { label: "Relés", value: "GPIO 13 (luz) + GPIO 14 (bomba)" },
  { label: "Conexão", value: "WiFi 2.4GHz (AP + STA)" },
  { label: "Servidor", value: "Flask + SQLite (Docker, porta 5003)" },
  { label: "Frontend", value: "PWA (JavaScript vanilla)" },
  { label: "Modo Local", value: "AP Cultivee-HidroCam (192.168.4.1)" },
];

const ProdutoCameraPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li className="text-foreground font-medium">Controle Câmera</li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Camera className="w-4 h-4" />
                Hidroponia + Câmera
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Controle Câmera
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                O melhor dos dois mundos: controle hidropônico completo com câmera integrada.
                Monitore visualmente e controle seus cultivos em um único app —
                capture fotos, assista ao vivo e gerencie fases automaticamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://hidro-cam.cultivee.com.br" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
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
                    src="/produtos/hidro-cam-login.jpg"
                    alt="Cultivee HidroCam - Tela de Login"
                    className="w-full"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  PWA + CAM
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
              Veja as telas reais do aplicativo com módulo conectado — dashboard completo com controles, câmera e fases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Dashboard */}
            <div className="text-center">
              <div className="relative inline-block w-[250px]">
                <div className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl bg-[#0f1923]">
                  <img
                    src="/produtos/hidro-cam-dashboard.jpg"
                    alt="Dashboard HidroCam - Controles, câmera e status em tempo real"
                    className="w-full"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mt-6 mb-1">Dashboard Principal</h3>
              <p className="text-sm text-muted-foreground">
                Dia do ciclo, fase atual, controles de relés e status da câmera.
              </p>
            </div>

            {/* Camera */}
            <div className="text-center">
              <div className="relative inline-block w-[250px]">
                <div className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl bg-[#0f1923]">
                  <img
                    src="/produtos/hidro-cam-camera.jpg"
                    alt="Câmera expandida com captura ao vivo do cultivo"
                    className="w-full"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mt-6 mb-1">Câmera ao Vivo</h3>
              <p className="text-sm text-muted-foreground">
                Câmera expandida com captura remota e visualização da última foto.
              </p>
            </div>

            {/* Phases */}
            <div className="text-center">
              <div className="relative inline-block w-[250px]">
                <div className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl bg-[#0f1923]">
                  <img
                    src="/produtos/hidro-cam-phases.jpg"
                    alt="Fases Configuradas - Muda, Berçário e Engorda com detalhes"
                    className="w-full"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mt-6 mb-1">Fases Configuradas</h3>
              <p className="text-sm text-muted-foreground">
                Todas as fases com duração, horários de luz e irrigação dia/noite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Camera Card Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Câmera Integrada</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Visualize seu cultivo sem sair do dashboard. A câmera OV2640 captura fotos em JPEG e
              faz streaming MJPEG na rede local.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Remote Capture */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Captura Remota</h3>
                  <span className="text-xs text-muted-foreground">Via internet (qualquer lugar)</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Fluxo da captura remota:
                </div>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-blue-500 font-bold">1.</span> Toque em "Capturar" no app</li>
                  <li className="flex gap-2"><span className="text-blue-500 font-bold">2.</span> Servidor enfileira comando ao ESP32</li>
                  <li className="flex gap-2"><span className="text-blue-500 font-bold">3.</span> ESP32 tira foto e envia ao servidor</li>
                  <li className="flex gap-2"><span className="text-blue-500 font-bold">4.</span> Imagem aparece no app (~3-5 segundos)</li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                Imagens salvas no servidor com timestamp. Acesse de qualquer dispositivo com sua conta.
              </p>
            </div>

            {/* Local Stream */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Stream ao Vivo</h3>
                  <span className="text-xs text-muted-foreground">Via rede local (192.168.4.1)</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Fluxo do stream local:
                </div>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-purple-500 font-bold">1.</span> Conecte na rede WiFi Cultivee-HidroCam</li>
                  <li className="flex gap-2"><span className="text-purple-500 font-bold">2.</span> Acesse 192.168.4.1 no navegador</li>
                  <li className="flex gap-2"><span className="text-purple-500 font-bold">3.</span> Toque em "Ao Vivo" no card da câmera</li>
                  <li className="flex gap-2"><span className="text-purple-500 font-bold">4.</span> Stream MJPEG ~10fps por ~60 segundos</li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                Stream direto do ESP32 sem passar pelo servidor. Reconecta automaticamente ao terminar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Todas as Funcionalidades</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combina controle hidropônico + monitoramento visual em um único módulo e app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-elegant transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camera Specs + Tech Specs */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Especificações Técnicas</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Camera */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                Câmera
              </h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {cameraSpecs.map((spec, i) => (
                  <div key={spec.label} className={`flex items-center justify-between px-6 py-3 ${i < cameraSpecs.length - 1 ? 'border-b border-border' : ''}`}>
                    <span className="text-sm font-medium text-foreground">{spec.label}</span>
                    <span className="text-sm text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-500" />
                Sistema
              </h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {techSpecs.map((spec, i) => (
                  <div key={spec.label} className={`flex items-center justify-between px-6 py-3 ${i < techSpecs.length - 1 ? 'border-b border-border' : ''}`}>
                    <span className="text-sm font-medium text-foreground">{spec.label}</span>
                    <span className="text-sm text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison with Hidro */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">HidroCam vs Hidroponia</h2>
            <p className="text-muted-foreground">
              Compare os dois produtos para escolher o ideal para seu cultivo.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 px-6 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Recurso</span>
              <span className="text-sm font-semibold text-green-600 text-center">Hidroponia</span>
              <span className="text-sm font-semibold text-blue-600 text-center">HidroCam</span>
            </div>
            {[
              { feature: "Controle de luz", hidro: true, cam: true },
              { feature: "Controle de bomba", hidro: true, cam: true },
              { feature: "Fases automáticas", hidro: true, cam: true },
              { feature: "Dashboard PWA", hidro: true, cam: true },
              { feature: "Modo offline local", hidro: true, cam: true },
              { feature: "Captura de fotos", hidro: false, cam: true },
              { feature: "Stream ao vivo", hidro: false, cam: true },
              { feature: "PSRAM (8MB)", hidro: false, cam: true },
            ].map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-6 py-3 ${i < 7 ? 'border-b border-border' : ''}`}>
                <span className="text-sm text-foreground">{row.feature}</span>
                <span className="text-center">{row.hidro ? '✅' : '—'}</span>
                <span className="text-center">{row.cam ? '✅' : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Monitore e controle com câmera integrada
          </h2>
          <p className="text-white/80 mb-8">
            Crie sua conta e vincule seu módulo ESP32-WROVER com câmera OV2640.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://hidro-cam.cultivee.com.br" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90 gap-2">
                <ExternalLink className="w-4 h-4" />
                Acessar App
              </Button>
            </a>
            <a href="https://wa.me/5519992805563" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-blue-700">
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

export default ProdutoCameraPage;
