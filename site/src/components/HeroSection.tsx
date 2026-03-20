import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const whatsappLink = "https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os cursos da Cultivee.";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Onde conhecimento
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              vira colheita
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Cursos práticos em agricultura tecnificada, escrita acadêmica e instrumentação. 
            <span className="font-semibold text-foreground"> Três caminhos para sua autonomia.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              variant="eco" 
              size="lg" 
              className="text-lg px-8 py-6 w-full sm:w-auto group"
              asChild
            >
              <Link to="/agro">
                Explorar Cursos
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 w-full sm:w-auto"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 w-5 h-5" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;