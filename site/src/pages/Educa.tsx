import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, FileText, Users, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EducaPage = () => {
  const targetAudience = [
    { icon: GraduationCap, title: "Estudantes de graduação", description: "Finalizando TCC" },
    { icon: FileText, title: "Mestrandos e doutorandos", description: "Dissertações e teses" },
    { icon: BookOpen, title: "Pesquisadores", description: "Artigos e patentes" },
    { icon: Users, title: "Profissionais", description: "Projetos de pesquisa" }
  ];

  const courseTopics = [
    "Estruturação do trabalho",
    "Revisão bibliográfica",
    "Metodologia científica",
    "Formatação ABNT",
    "Escrita clara e objetiva",
    "Defesa e apresentação"
  ];

  const faqs = [
    {
      question: "Qual a duração do curso?",
      answer: "O curso MEAD tem carga horária de 40 horas, divididas em módulos que você pode fazer no seu ritmo. Acesso por 1 ano."
    },
    {
      question: "O curso serve para qualquer área de conhecimento?",
      answer: "Sim! O método é universal e funciona para todas as áreas: exatas, humanas, biológicas e interdisciplinares."
    },
    {
      question: "Vocês fazem revisão de trabalhos?",
      answer: "O curso ensina você a fazer sua própria revisão. Mas oferecemos mentorias individuais como serviço adicional."
    },
    {
      question: "Posso tirar dúvidas durante o curso?",
      answer: "Sim! Você terá acesso à nossa comunidade de alunos e poderá interagir com outros estudantes e com o instrutor."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-educa">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cultivee Educa
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Cultive sua carreira acadêmica e científica
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Método estruturado para escrever TCC, dissertação, tese, artigo científico, patente e projeto de pesquisa. 
            Desenvolvido por pesquisador com experiência em orientação e publicação.
          </p>
        </div>
      </section>

      {/* Main Course */}
      <section className="py-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-elegant">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-muted">
                <img src="/placeholder.svg" alt="Curso MEAD" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12">
                <span className="inline-block px-3 py-1 bg-educa/10 text-educa text-sm font-medium rounded-full mb-4">
                  Curso Principal
                </span>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Método Escrita Acadêmica Descomplicada
                </h2>
                <p className="text-muted-foreground mb-6">
                  Da estrutura à formatação ABNT. Aprenda a escrever TCC, dissertação, tese, artigo, 
                  patente e projeto de pesquisa.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {courseTopics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-educa flex-shrink-0" />
                      <span className="text-sm text-foreground">{topic}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full md:w-auto bg-educa hover:bg-educa-dark text-white">
                  Quero me inscrever
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Para quem é este curso
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {targetAudience.map((item, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-educa transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-educa/10 rounded-xl mb-4">
                  <item.icon className="w-7 h-7 text-educa" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connection with Agro */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-educa rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Exemplos práticos para sua área
            </h3>
            <p className="text-white/90 max-w-2xl mx-auto">
              Exemplos práticos de escrita científica voltada à agricultura e bioengenharia 
              — áreas de atuação do instrutor. Perfeito para quem trabalha com ciências agrárias e afins.
            </p>
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
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-educa transition-shadow"
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

export default EducaPage;