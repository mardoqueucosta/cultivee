import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Leaf, Sprout, Droplets, Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AgroPage = () => {
  const courses = [
    {
      title: "Cultivo de Microverdes",
      description: "Colheita em 7-14 dias. Aprenda do zero à comercialização.",
      badge: "Mais vendido",
      image: "/placeholder.svg",
      topics: ["Germinação e sementes", "Substratos ideais", "Iluminação", "Colheita e armazenamento"]
    },
    {
      title: "Hidroponia e Cultivo Indoor",
      description: "Monte seu sistema NFT em casa ou em escala comercial.",
      badge: null,
      image: "/placeholder.svg",
      topics: ["Sistema NFT", "Nutrição vegetal", "Controle climático", "Escalonamento comercial"]
    }
  ];

  const faqs = [
    {
      question: "Preciso de experiência prévia?",
      answer: "Não! Nossos cursos são desenhados para iniciantes e vão do básico ao avançado. Você aprende passo a passo, com acompanhamento."
    },
    {
      question: "Quanto espaço preciso para começar?",
      answer: "Para microverdes, basta uma bancada de 1m². Para hidroponia, recomendamos no mínimo 4m². Em ambos os casos, oferecemos soluções modulares que se adaptam ao seu espaço."
    },
    {
      question: "Posso comercializar o que produzo?",
      answer: "Sim! Ensinamos não só as técnicas de cultivo, mas também como estruturar seu negócio, precificar produtos e encontrar clientes."
    },
    {
      question: "Os cursos são online ou presenciais?",
      answer: "Oferecemos ambas modalidades. Os cursos online são gravados com suporte via comunidade. Os presenciais acontecem em nossa unidade em Piracicaba-SP."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-agro">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cultivee Agro
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Produza seus próprios alimentos com tecnologia
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Do microgreen ao sistema hidropônico completo. Cursos práticos baseados em 
            anos de experiência real em produção e comercialização de hortaliças.
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
              <div key={index} className="bg-card rounded-2xl overflow-hidden border border-border shadow-elegant hover:shadow-agro transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 bg-muted relative">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  {course.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-agro text-white text-sm font-medium rounded-full">
                      {course.badge}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-3">{course.title}</h3>
                  <p className="text-muted-foreground mb-6">{course.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {course.topics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-agro" />
                        <span className="text-sm text-foreground">{topic}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-agro hover:bg-agro-dark text-white">
                    Saiba mais
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hortaliças Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-elegant">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-agro rounded-2xl flex items-center justify-center">
                  <Sprout className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Praticamos o que ensinamos
                </h3>
                <p className="text-muted-foreground mb-6">
                  A Cultivee produz e comercializa hortaliças cultivadas com as mesmas técnicas dos nossos cursos. 
                  Frescor e qualidade garantidos.
                </p>
                <Button variant="outline" className="border-agro text-agro hover:bg-agro hover:text-white">
                  Conhecer produtos
                </Button>
              </div>
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
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-elegant transition-shadow"
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

export default AgroPage;