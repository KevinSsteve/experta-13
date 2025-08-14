import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mic, Brain, TrendingUp, Shield, Smartphone, Users } from "lucide-react";
import howItWorksImage from "@/assets/how-it-works.jpg";

export default function ComoFunciona() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "Como Funciona - Experta IA";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Descubra como o Experta IA funciona. Nossa IA de voz revoluciona a gestão financeira de pequenos comerciantes através de comandos de voz simples.');
    }

    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', window.location.href);
    document.head.appendChild(canonicalLink);

    // JSON-LD for breadcrumbs
    const jsonLdBreadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": "https://experta.ao"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Como Funciona",
          "item": "https://experta.ao/como-funciona"
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLdBreadcrumb);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(canonicalLink);
      document.head.removeChild(script);
    };
  }, []);

  const steps = [
    {
      icon: Mic,
      title: "Fale Naturalmente",
      description: "Use comandos de voz em português angolano para registar vendas, controlar stock e consultar relatórios."
    },
    {
      icon: Brain,
      title: "IA Processa",
      description: "Nossa inteligência artificial compreende o seu contexto comercial e processa automaticamente as informações."
    },
    {
      icon: TrendingUp,
      title: "Dados Organizados",
      description: "Vendas, despesas e stock são organizados automaticamente em relatórios claros e úteis."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Todos os dados são protegidos com criptografia avançada e armazenados de forma segura."
    },
    {
      icon: Smartphone,
      title: "Acesso Mobile",
      description: "Funciona perfeitamente em qualquer dispositivo, mesmo offline. Sincroniza quando voltar online."
    },
    {
      icon: Users,
      title: "Suporte Personalizado",
      description: "Equipa local disponível para ajudar na configuração e uso diário da plataforma."
    }
  ];

  const benefits = [
    "Elimina a necessidade de escrever - tudo por voz",
    "Funciona mesmo sem internet",
    "Compreende gírias e expressões locais",
    "Relatórios automáticos de vendas e lucros",
    "Alertas de produtos em falta",
    "Backup automático na nuvem",
    "Interface simples e intuitiva",
    "Suporte técnico em português"
  ];

  return (
    <PublicLayout>
      <div className="py-16 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Como Funciona o Experta IA
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Descubra como nossa inteligência artificial revoluciona a gestão do seu negócio 
              através de comandos de voz simples e intuitivos.
            </p>
          </div>

          {/* Main Image */}
          <div className="mb-16">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img 
                src={howItWorksImage} 
                alt="Como funciona o Experta IA - Interface de comandos de voz" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Gestão por Voz</h2>
                <p className="text-white/90">Simplicidade que funciona</p>
              </div>
            </div>
          </div>

          {/* Steps Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Processo Passo a Passo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <step.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Benefits */}
          <section className="mb-16 bg-muted/30 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Vantagens Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Details */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Tecnologia Avançada</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Inteligência Artificial Adaptada</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h4 className="font-semibold mb-2">Reconhecimento de Voz Otimizado</h4>
                    <p className="text-muted-foreground">Treinado especificamente para sotaques e expressões angolanas.</p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h4 className="font-semibold mb-2">Processamento Local</h4>
                    <p className="text-muted-foreground">Funciona offline, sincroniza automaticamente quando online.</p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h4 className="font-semibold mb-2">Aprendizado Contínuo</h4>
                    <p className="text-muted-foreground">Melhora constantemente com o uso, adaptando-se ao seu negócio.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <h4 className="text-lg font-semibold mb-3">Exemplo de Comando</h4>
                  <div className="bg-background p-4 rounded-lg border">
                    <p className="text-primary font-medium">"Registar venda de 3 sacas de arroz por 15 mil cada"</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    O sistema automaticamente calcula o total (45.000 Kz), atualiza o stock e regista a venda.
                  </p>
                </div>
                <div className="p-6 bg-secondary/20 rounded-2xl border border-secondary/30">
                  <h4 className="text-lg font-semibold mb-3">Relatório Automático</h4>
                  <p className="text-muted-foreground">
                    Vendas do dia, produtos mais vendidos, lucro estimado e alertas de stock baixo 
                    são gerados automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Pronto para Experimentar?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comece hoje mesmo e veja como a gestão por voz pode transformar o seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Começar Gratuitamente
                </Button>
              </Link>
              <Link to="/beneficios">
                <Button variant="outline" size="lg" className="px-8">
                  Ver Benefícios
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}