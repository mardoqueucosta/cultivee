import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, ChevronDown, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { name: "Home", href: "/" },
  ];

  const pillarItems = [
    { name: "Agro", href: "/agro", color: "text-agro" },
    { name: "Educa", href: "/educa", color: "text-educa" },
    { name: "Tech", href: "/tech", color: "text-tech" },
  ];

  const secondaryNavItems = [
    { name: "Blog", href: "/blog" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ];

  const allNavItems = [
    ...mainNavItems,
    ...pillarItems,
    ...secondaryNavItems,
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg shadow-elegant group-hover:shadow-glow transition-shadow duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              CULTIVEE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                isActive("/") 
                  ? "text-primary bg-primary/10" 
                  : "text-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              Home
            </Link>

            {/* Pillar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-300">
                  Cursos
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-background border-border">
                {pillarItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-2 ${item.color}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></span>
                      Cultivee {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/blog"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                isActive("/blog") 
                  ? "text-primary bg-primary/10" 
                  : "text-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              Blog
            </Link>

            <Link
              to="/sobre"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                isActive("/sobre") 
                  ? "text-primary bg-primary/10" 
                  : "text-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              Sobre
            </Link>

            <Link
              to="/contato"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                isActive("/contato") 
                  ? "text-primary bg-primary/10" 
                  : "text-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              Contato
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://app.cultivee.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                Meu Painel
              </a>
            </Button>
            <Button variant="eco" size="sm" asChild>
              <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer">
                Fale Conosco
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-1 bg-background rounded-xl border border-border p-4 mt-2 shadow-elegant">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive("/") ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cursos
              </div>
              
              {pillarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.href) ? `${item.color} bg-muted` : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}></span>
                  Cultivee {item.name}
                </Link>
              ))}
              
              <div className="border-t border-border my-2"></div>
              
              <Link
                to="/blog"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive("/blog") ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              
              <Link
                to="/sobre"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive("/sobre") ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Sobre
              </Link>
              
              <Link
                to="/contato"
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive("/contato") ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contato
              </Link>
              
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://app.cultivee.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Meu Painel
                  </a>
                </Button>
                <Button variant="eco" className="w-full" asChild>
                  <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer">
                    Fale Conosco
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;