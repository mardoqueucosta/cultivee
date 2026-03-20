import { Leaf, BookOpen, Cog, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PillarsSection = () => {
  const pillars = [
    {
      id: "agro",
      icon: Leaf,
      title: "Cultivee Agro",
      description: "Microverdes, hidroponia e cultivo indoor. Aprenda técnicas de produção sustentável — e compre direto de quem pratica o que ensina.",
      color: "bg-agro",
      gradient: "bg-gradient-agro",
      shadow: "shadow-agro",
      textColor: "text-agro",
      href: "/agro",
      buttonText: "Ver cursos Agro"
    },
    {
      id: "educa",
      icon: BookOpen,
      title: "Cultivee Educa",
      description: "TCC, dissertação, tese, artigo, patente e projeto de pesquisa. Método prático para escrever trabalhos acadêmicos com excelência.",
      color: "bg-educa",
      gradient: "bg-gradient-educa",
      shadow: "shadow-educa",
      textColor: "text-educa",
      href: "/educa",
      buttonText: "Ver cursos Educa"
    },
    {
      id: "tech",
      icon: Cog,
      title: "Cultivee Tech",
      description: "Instrumentação (mecânica, eletrônica, software) e empreendedorismo. Transforme ideias em produtos e conhecimento em negócio.",
      color: "bg-tech",
      gradient: "bg-gradient-tech",
      shadow: "shadow-tech-shadow",
      textColor: "text-tech",
      href: "/tech",
      buttonText: "Ver cursos Tech"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Três caminhos para sua autonomia
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha sua jornada de aprendizado e desenvolva habilidades práticas para crescer na sua carreira.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.id}
              className={`group relative bg-card rounded-2xl p-8 border border-border hover:border-transparent transition-all duration-300 hover:-translate-y-2 hover:${pillar.shadow}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 ${pillar.gradient} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <pillar.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className={`text-2xl font-bold mb-4 ${pillar.textColor} group-hover:opacity-90 transition-opacity`}>
                {pillar.title}
              </h3>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {pillar.description}
              </p>

              {/* Button */}
              <Button 
                variant="ghost" 
                className={`${pillar.textColor} hover:bg-transparent p-0 group/btn`}
                asChild
              >
                <Link to={pillar.href}>
                  {pillar.buttonText}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {/* Decorative gradient on hover */}
              <div className={`absolute inset-0 ${pillar.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;