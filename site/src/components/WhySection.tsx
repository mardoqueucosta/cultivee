import { CheckCircle2, Network, Layers } from "lucide-react";

const WhySection = () => {
  const reasons = [
    {
      icon: CheckCircle2,
      title: "Ensinamos o que praticamos",
      description: "Comercializamos as hortaliças cultivadas com as mesmas técnicas dos nossos cursos. Você aprende com quem faz."
    },
    {
      icon: Network,
      title: "Conhecimento integrado",
      description: "Conectamos agricultura, ciência e tecnologia em uma jornada de aprendizado completa."
    },
    {
      icon: Layers,
      title: "Do iniciante ao avançado",
      description: "Cursos estruturados para todos os níveis, com suporte e comunidade de alunos."
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que aprender com a Cultivee?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="text-center p-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <reason.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {reason.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;