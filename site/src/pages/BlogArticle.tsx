import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { getArticleBySlug, getRelatedArticles } from "@/data/blogArticles";
import ReactMarkdown from "react-markdown";

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const article = slug ? getArticleBySlug(slug) : undefined;
  
  if (!article) {
    return <Navigate to="/blog" replace />;
  }
  
  const relatedArticles = getRelatedArticles(article.id, article.category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className={`pt-24 pb-16 ${
        article.category === "Agro" ? "bg-gradient-to-br from-agro/10 via-background to-agro/5" :
        article.category === "Educa" ? "bg-gradient-to-br from-educa/10 via-background to-educa/5" :
        "bg-gradient-to-br from-tech/10 via-background to-tech/5"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>
          
          <Badge className={`mb-4 ${article.categoryColor} text-white border-0`}>
            {article.category}
          </Badge>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {article.readTime} de leitura
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-table:border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Author Box */}
      <section className="py-8 border-t border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{article.author}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                A equipe Cultivee é formada por especialistas em agricultura, educação e tecnologia, 
                comprometidos em compartilhar conhecimento prático para sua autonomia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Artigos relacionados</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map((post) => (
              <Card 
                key={post.id} 
                className="group overflow-hidden border-border hover:shadow-elegant transition-all duration-300"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className={`absolute top-3 left-3 ${post.categoryColor} text-white border-0 text-xs`}>
                    {post.category}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 text-sm">
                    {post.excerpt}
                  </CardDescription>
                  <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto group/btn" asChild>
                    <Link to={`/blog/${post.slug}`}>
                      Ler artigo
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${
        article.category === "Agro" ? "bg-gradient-to-r from-agro to-agro/80" :
        article.category === "Educa" ? "bg-gradient-to-r from-educa to-educa/80" :
        "bg-gradient-to-r from-tech to-tech/80"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Quer aprofundar seus conhecimentos?
          </h2>
          <p className="text-white/80 mb-8">
            Conheça nossos cursos e transforme teoria em prática.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-foreground hover:bg-white/90" asChild>
              <Link to={`/${article.category.toLowerCase()}`}>
                Ver cursos {article.category}
              </Link>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <a href="https://wa.me/5519999999999" target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BlogArticlePage;
