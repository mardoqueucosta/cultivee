import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Leaf, Target, Heart, Lightbulb } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sobre a Cultivee
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Cultivar educação. Cultivar alimentos. Cultivar autonomia.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Nossa História
          </h2>
          
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="leading-relaxed mb-6">
              A Cultivee nasceu da convergência de experiências em pesquisa acadêmica, desenvolvimento 
              de tecnologia e agricultura. Fundada por um pesquisador com pós-doutorado e anos de 
              experiência em bioengenharia e agricultura de precisão, a empresa surgiu da percepção 
              de que conhecimento prático transforma vidas.
            </p>
            <p className="leading-relaxed">
              Após orientar dezenas de trabalhos acadêmicos, desenvolver protótipos de equipamentos 
              e cultivar hortaliças em sistemas controlados, percebemos que poderíamos compartilhar 
              esse conhecimento de forma estruturada e acessível.
            </p>
          </div>
        </div>
      </section>

      {/* Por que Cultivee */}
      <section className="py-16 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-elegant">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Por que "Cultivee"?
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              O nome "Cultivee" carrega um duplo significado: <strong className="text-foreground">cultivar educação</strong> e 
              <strong className="text-foreground"> cultivar produtos agrícolas</strong>. Representa nossa essência de unir 
              conhecimento e prática, ensinando técnicas que nós mesmos aplicamos no dia a dia.
            </p>
          </div>
        </div>
      </section>

      {/* Nossa Filosofia */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Nossa Filosofia
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Ensinamos fazendo
              </h3>
              <p className="text-muted-foreground">
                Não oferecemos apenas teoria — demonstramos na prática o que ensinamos, 
                seja cultivando hortaliças, publicando artigos ou desenvolvendo protótipos.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Conhecimento acessível
              </h3>
              <p className="text-muted-foreground">
                Acreditamos que conhecimento técnico não deve ser exclusivo de poucos. 
                Nossos cursos são desenhados para ser claros, práticos e aplicáveis.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary/10 rounded-full mb-6">
                <Target className="w-8 h-8 text-tertiary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Autonomia como objetivo
              </h3>
              <p className="text-muted-foreground">
                Nosso maior sucesso é ver alunos aplicando o que aprenderam de forma 
                independente, seja produzindo alimentos, publicando trabalhos ou criando negócios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão */}
      <section className="py-16 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Nossa Missão
          </h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Democratizar conhecimento técnico para que mais pessoas conquistem autonomia produtiva 
            — seja produzindo alimentos, avançando na carreira acadêmica ou criando soluções tecnológicas.
          </p>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;