import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Camera, Droplets, ExternalLink, Smartphone, Wifi } from "lucide-react";

const apps = [
  {
    name: "Cultivee Camera",
    description: "Monitore suas plantas em tempo real com o ESP32-CAM. Capture imagens automaticamente, visualize ao vivo e acompanhe o crescimento das suas plantas pelo celular.",
    features: ["Monitoramento ao vivo", "Captura automatica de imagens", "Historico de fotos"],
    icon: Camera,
    color: "#3498db",
    url: "https://app.cultivee.com.br",
  },
  {
    name: "Cultivee Hidroponia",
    description: "Controle inteligente do seu sistema hidroponico. Gerencie luz e bomba, configure fases de cultivo e acompanhe o ciclo das suas plantas automaticamente.",
    features: ["Controle de luz e bomba", "Fases de cultivo configuraveis", "Modo automatico com horarios"],
    icon: Droplets,
    color: "#27ae60",
    url: "https://hidro.cultivee.com.br",
  },
  {
    name: "Cultivee HidroCam",
    description: "O melhor dos dois mundos: controle hidroponico completo com camera integrada. Monitore visualmente e controle seus cultivos em um unico app.",
    features: ["Hidroponia + Camera", "Captura sob demanda", "Controle de reles + visualizacao"],
    icon: Camera,
    secondIcon: Droplets,
    color: "#e67e22",
    url: "https://hidro-cam.cultivee.com.br",
  },
];

const AplicativosPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-16 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Smartphone className="w-4 h-4" />
            Apps PWA — instale direto no celular
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Nossos Aplicativos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aplicativos web progressivos para monitorar e controlar seus cultivos.
            Instale no celular sem precisar de loja de apps.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {apps.map((app) => (
              <div
                key={app.name}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Icon header */}
                <div
                  className="p-8 flex items-center justify-center"
                  style={{ background: `${app.color}10` }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: `${app.color}20` }}
                  >
                    {app.secondIcon ? (
                      <div className="flex items-center gap-1">
                        <app.icon className="w-8 h-8" style={{ color: app.color }} />
                        <app.secondIcon className="w-8 h-8" style={{ color: app.color }} />
                      </div>
                    ) : (
                      <app.icon className="w-10 h-10" style={{ color: app.color }} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-foreground mb-2">{app.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{app.description}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {app.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: app.color }} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a href={app.url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2" variant="outline" size="lg">
                      <ExternalLink className="w-4 h-4" />
                      Abrir App
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* How to install */}
          <div className="mt-16 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Como instalar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                <div>
                  <p className="font-medium text-foreground text-sm">Abra o app</p>
                  <p className="text-xs text-muted-foreground">Acesse o link pelo navegador do celular</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                <div>
                  <p className="font-medium text-foreground text-sm">Instale</p>
                  <p className="text-xs text-muted-foreground">Toque em "Adicionar a tela inicial" ou "Instalar"</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                <div>
                  <p className="font-medium text-foreground text-sm">Pronto</p>
                  <p className="text-xs text-muted-foreground">O app aparece na sua tela inicial como um app nativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AplicativosPage;
