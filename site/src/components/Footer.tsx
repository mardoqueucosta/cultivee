import { Leaf, Mail, Phone, MapPin, Instagram, Youtube, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Cultivee Agro", href: "/agro" },
    { name: "Cultivee Educa", href: "/educa" },
    { name: "Cultivee Tech", href: "/tech" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ];

  const courses = [
    { name: "Microverdes", href: "/agro" },
    { name: "Hidroponia", href: "/agro" },
    { name: "Escrita Acadêmica", href: "/educa" },
    { name: "Instrumentação", href: "/tech" },
    { name: "Empreendedorismo", href: "/tech" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/cultivee", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com/cultivee", label: "YouTube" },
    { icon: MessageCircle, href: "https://wa.me/5519999999999", label: "WhatsApp" },
  ];

  return (
    <footer className="bg-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                CULTIVEE
              </span>
            </Link>
            <p className="text-white/70 leading-relaxed mb-6">
              Cultivar educação e alimentos para um futuro mais autônomo.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-white/70 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Courses */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Cursos
            </h3>
            <ul className="space-y-3">
              {courses.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href} 
                    className="text-white/70 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Contato
            </h3>
            <div className="space-y-4">
              <a 
                href="mailto:contato@cultivee.com.br"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300"
              >
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>contato@cultivee.com.br</span>
              </a>
              <a 
                href="https://wa.me/5519999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+55 (19) 99999-9999</span>
              </a>
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>Piracicaba, SP - Brasil</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © 2025 Cultivee. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/50 hover:text-white/80 transition-colors duration-300 text-sm">
                Política de Privacidade
              </a>
              <a href="#" className="text-white/50 hover:text-white/80 transition-colors duration-300 text-sm">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;