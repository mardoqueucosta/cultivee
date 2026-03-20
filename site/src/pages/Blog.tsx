import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { blogArticles } from "@/data/blogArticles";

const categories = [
  { name: "Todos", value: "all" },
  { name: "Agro", value: "agro", color: "bg-agro" },
  { name: "Educa", value: "educa", color: "bg-educa" },
  { name: "Tech", value: "tech", color: "bg-tech" },
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Blog Cultivee
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Conteúdo que{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                cultiva conhecimento
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Artigos práticos sobre agricultura, escrita acadêmica e tecnologia. 
              Aprenda com quem faz.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={category.value === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category.color && (
                  <span className={`w-2 h-2 rounded-full ${category.color} mr-2`}></span>
                )}
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogArticles.map((post) => (
              <Card 
                key={post.id} 
                className="group overflow-hidden border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={`absolute top-4 left-4 ${post.categoryColor} text-white border-0`}>
                      {post.category}
                    </Badge>
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`}>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      {post.author}
                    </span>
                    <Button variant="ghost" size="sm" className="group/btn" asChild>
                      <Link to={`/blog/${post.slug}`}>
                        Ler mais
                        <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Carregar mais artigos
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Receba novos artigos por email
          </h2>
          <p className="text-white/80 mb-8">
            Inscreva-se na nossa newsletter e receba conteúdo exclusivo toda semana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="bg-white text-primary hover:bg-white/90">
              Inscrever-se
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BlogPage;
