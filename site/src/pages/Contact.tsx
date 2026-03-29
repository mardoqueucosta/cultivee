import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, email e mensagem.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    
    toast({
      title: "Mensagem enviada!",
      description: "Responderemos em breve. Obrigado pelo contato!",
    });
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "contato@cultivee.com.br", href: "mailto:contato@cultivee.com.br" },
    { icon: Phone, label: "WhatsApp", value: "+55 (19) 99280-5563", href: "https://wa.me/5519992805563" },
    { icon: MapPin, label: "Localização", value: "Piracicaba, SP - Brasil", href: null }
  ];

  const subjects = [
    { value: "cursos-agro", label: "Cursos Agro" },
    { value: "cursos-educa", label: "Cursos Educa" },
    { value: "cursos-tech", label: "Cursos Tech" },
    { value: "hortalicas", label: "Hortaliças" },
    { value: "parcerias", label: "Parcerias" },
    { value: "outro", label: "Outro" }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contato
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Tem alguma dúvida ou quer saber mais? Fale conosco!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Envie sua mensagem
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Telefone / WhatsApp
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Assunto
                      </label>
                      <Select 
                        value={formData.subject} 
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione um assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mensagem *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Como podemos ajudar?"
                      rows={5}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensagem
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Informações de contato
                </h2>
                
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        {item.href ? (
                          <a 
                            href={item.href} 
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-medium text-foreground">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* WhatsApp CTA */}
              <div className="bg-[#25D366]/10 rounded-2xl p-8 border border-[#25D366]/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Prefere WhatsApp?
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Fale diretamente conosco pelo WhatsApp para uma resposta mais rápida.
                </p>
                <Button 
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  asChild
                >
                  <a href="https://wa.me/5519992805563" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Iniciar conversa
                  </a>
                </Button>
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

export default ContactPage;