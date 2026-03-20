import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Cog, Cpu, Lightbulb, Rocket, Check, ArrowRight, Leaf, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TechPage = () => {
  const courses = [
    {
      title: "Instrumentação Prática",
      description: "Mecânica, eletrônica e programação para montagem de produtos e protótipos.",
      image: "/placeholder.svg",
      topics: ["Sensores e atuadores", "Arduino e ESP32", "Prototipagem rápida", "Integração de sistemas"]
    },
    {
      title: "Empreendedorismo Técnico",
      description: "Valide ideias, estruture negócios, conquiste mercado. Transforme conhecimento técnico em empresa.",
      image: "/placeholder.svg",
      topics: ["Validação de ideias", "Modelo de negócios", "MVP e iteração", "Captação de recursos"]
    }
  ];

  const connections = [
    { icon: Leaf, text: "Automatize sistemas de cultivo hidropônico", link: "/agro", pillar: "Agro" },
    { icon: BookOpen, text: "Desenvolva equipamentos para pesquisa científica", link: "/educa", pillar: "Educa" },
    { icon: Rocket, text: "Crie produtos para comercializar", link: null, pillar: "Empreendedorismo" }
  ];

  const faqs = [
    {
      question: "Preciso saber programar para fazer o curso de instrumentação?",
      answer: "Não! Começamos do zero e ensinamos programação básica focada em projetos práticos. Você aprende fazendo."
    },
    {
      question: "Que tipo de projetos vou desenvolver?",
      answer: "Desde sensores simples de temperatura e umidade até sistemas completos de automação. Cada aluno pode personalizar projetos para sua área de interesse."
    },
    {
      question: "O curso de empreendedorismo é só para quem quer abrir empresa?",
      answer: "Não apenas. As técnicas de validação e desenvolvimento de produtos são úteis para intraempreendedores, pesquisadores e qualquer pessoa que queira transformar ideias em resultados."
    },
    {
      question: "Vocês fornecem kit de componentes?",
      answer: "Oferecemos kits opcionais com todos os componentes necessários. Mas você também pode adquirir os materiais por conta própria seguindo nossa lista."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-tech">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
            <Cog className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cultivee Tech
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Construa suas próprias soluções tecnológicas
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Da ideia ao produto. Aprenda instrumentação (mecânica, eletrônica, software) e empreendedorismo 
            para transformar conhecimento em negócio.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nossos Cursos
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="bg-card rounded-2xl overflow-hidden border border-border shadow-elegant hover:shadow-tech-shadow transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 bg-muted relative">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{course.title}</h3>
                  <p className="text-muted-foreground mb-6">{course.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {course.topics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-tech" />
                        <span className="text-sm text-foreground">{topic}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-tech hover:bg-tech-dark text-white">
                    Saiba mais
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connections */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-elegant">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              A instrumentação conecta todos os pilares da Cultivee
            </h3>
            
            <div className="space-y-4">
              {connections.map((connection, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                  <div className="w-12 h-12 bg-gradient-tech rounded-xl flex items-center justify-center flex-shrink-0">
                    <connection.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-foreground flex-1">{connection.text}</span>
                  {connection.link && (
                    <Link to={connection.link} className="text-tech hover:underline text-sm font-medium flex items-center gap-1">
                      Ver {connection.pillar}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Perguntas Frequentes
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-tech-shadow transition-shadow"
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

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default TechPage;