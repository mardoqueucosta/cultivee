import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowRight, ChevronRight, Lightbulb, List } from "lucide-react";
import { getArticleBySlug, getRelatedArticles } from "@/data/blogArticles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TocItem {
  id: string;
  text: string;
}

function extractToc(content: string): TocItem[] {
  const headingRegex = /^## (.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].trim();
    const id = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    items.push({ id, text });
  }
  return items;
}

function parseDate(dateStr: string): string {
  const months: Record<string, string> = {
    "Jan": "01", "Fev": "02", "Mar": "03", "Abr": "04",
    "Mai": "05", "Jun": "06", "Jul": "07", "Ago": "08",
    "Set": "09", "Out": "10", "Nov": "11", "Dez": "12",
  };
  const parts = dateStr.split(" ");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${months[month] || "01"}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const relatedArticles = getRelatedArticles(article.id, article.category);
  const toc = useMemo(() => extractToc(article.content), [article.content]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "author": {
      "@type": "Organization",
      "name": article.author,
      "url": "https://cultivee.com.br"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Cultivee",
      "url": "https://cultivee.com.br"
    },
    "datePublished": parseDate(article.date),
    ...(article.updatedDate ? { "dateModified": parseDate(article.updatedDate) } : {}),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cultivee.com.br/blog/${article.slug}`
    },
    "articleSection": article.category,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title} | Blog Cultivee</title>
        <meta name="description" content={article.excerpt} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className={`pt-20 pb-8 ${
        article.category === "Agro" ? "bg-gradient-to-br from-agro/20 via-agro/5 to-background" :
        article.category === "Educa" ? "bg-gradient-to-br from-educa/20 via-educa/5 to-background" :
        "bg-gradient-to-br from-tech/20 via-tech/5 to-background"
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <ChevronRight className="w-3.5 h-3.5" />
              <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{article.title}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <Badge className={`${article.categoryColor} text-white border-0`}>
              {article.category}
            </Badge>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            {article.updatedDate && (
              <span className="flex items-center gap-2 text-sm">
                (atualizado em {article.updatedDate})
              </span>
            )}
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {article.readTime} de leitura
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* TL;DR Box */}
          {article.tldr && (
            <div className={`mb-10 rounded-xl border-2 p-6 ${
              article.category === "Agro" ? "border-agro/30 bg-agro/5" :
              article.category === "Educa" ? "border-educa/30 bg-educa/5" :
              "border-tech/30 bg-tech/5"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className={`w-5 h-5 ${
                  article.category === "Agro" ? "text-agro" :
                  article.category === "Educa" ? "text-educa" :
                  "text-tech"
                }`} />
                <span className="font-bold text-foreground text-sm uppercase tracking-wider">TL;DR</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{article.tldr}</p>
            </div>
          )}

          {/* Table of Contents */}
          {toc.length > 2 && (
            <nav className="mb-10 rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <List className="w-5 h-5 text-muted-foreground" />
                <span className="font-bold text-foreground text-sm uppercase tracking-wider">Neste artigo</span>
              </div>
              <ol className="space-y-2">
                {toc.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <span className="text-xs font-mono text-muted-foreground/60 mt-0.5 min-w-[1.5rem]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="group-hover:underline underline-offset-2">{item.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-table:border prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return <h2 id={id} {...props}>{children}</h2>;
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
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
            <Button className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-primary" asChild>
              <a href="https://wa.me/5519992805563" target="_blank" rel="noopener noreferrer">
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
