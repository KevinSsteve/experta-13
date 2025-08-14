import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, TrendingUp, Shield, Smartphone, DollarSign, Users, BarChart3, Zap } from "lucide-react";
import realBenefitsImage from "@/assets/real-benefits.jpg";

export default function Beneficios() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "Benefícios - Experta IA";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Descubra os benefícios reais do Experta IA. Aumente as vendas, reduza custos e melhore a gestão do seu negócio com nossa IA de voz avançada.');
    }

    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', window.location.href);
    document.head.appendChild(canonicalLink);

    // JSON-LD for benefits
    const jsonLdBenefits = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Experta IA - Benefícios",
      "description": "IA de voz para gestão financeira que aumenta vendas e reduz custos",
      "provider": {
        "@type": "Organization",
        "name": "Experta"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Benefícios do Experta IA",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Redução de tempo administrativo",
            "description": "Economize até 3 horas por dia em tarefas administrativas"
          },
          {
            "@type": "Offer", 
            "name": "Aumento de vendas",
            "description": "Melhore o controle e identifique oportunidades de crescimento"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLdBenefits);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(canonicalLink);
      document.head.removeChild(script);
    };
  }, []);

  const mainBenefits = [
    {
      icon: Clock,
      title: "Economie 3h+ Por Dia",
      description: "Elimine tarefas manuais de registo. Fale e pronto - tudo é registado automaticamente.",
      impact: "Mais tempo para atender clientes e fazer vendas"
    },
    {
      icon: TrendingUp,
      title: "Aumento de 25% nas Vendas",
      description: "Tenha controle total sobre stock e identifique produtos que mais vendem.",
      impact: "Decisões baseadas em dados reais do seu negócio"
    },
    {
      icon: DollarSign,
      title: "Reduza Perdas em 40%",
      description: "Nunca mais perca vendas por falta de stock ou produtos vencidos.",
      impact: "Alertas automáticos evitam desperdícios"
    },
    {
      icon: BarChart3,
      title: "Relatórios Automáticos",
      description: "Veja lucros, vendas e tendências sem fazer cálculos manuais.",
      impact: "Análise profissional do seu negócio sempre atualizada"
    },
    {
      icon: Shield,
      title: "Dados Sempre Seguros",
      description: "Backup automático na nuvem protege contra perda de informações.",
      impact: "Tranquilidade total sobre os seus dados"
    },
    {
      icon: Smartphone,
      title: "Funciona Offline",
      description: "Continue trabalhando mesmo sem internet. Sincroniza automaticamente.",
      impact: "Nunca pare de vender por problemas técnicos"
    }
  ];

  const businessImpacts = [
    {
      category: "Financeiro",
      benefits: [
        "Controle preciso de receitas e despesas",
        "Identificação de produtos mais rentáveis", 
        "Redução de custos operacionais",
        "Previsão de fluxo de caixa"
      ]
    },
    {
      category: "Operacional", 
      benefits: [
        "Gestão automatizada de stock",
        "Processo de vendas mais rápido",
        "Redução de erros humanos",
        "Melhor atendimento ao cliente"
      ]
    },
    {
      category: "Estratégico",
      benefits: [
        "Análise de tendências de vendas",
        "Identificação de oportunidades",
        "Planejamento baseado em dados",
        "Crescimento sustentável"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      business: "Mercearia do Bairro",
      quote: "Desde que comecei a usar o Experta, consigo controlar melhor o meu stock e as vendas aumentaram 30%. É muito fácil de usar!",
      impact: "+30% vendas"
    },
    {
      name: "João Santos", 
      business: "Loja de Materiais",
      quote: "Antes perdia muito tempo a escrever vendas. Agora falo e pronto. Tenho mais tempo para os clientes.",
      impact: "3h+ economizadas/dia"
    },
    {
      name: "Ana Costa",
      business: "Farmácia Esperança", 
      quote: "Os relatórios automáticos me ajudam a ver quais medicamentos vendem mais. Muito útil para o negócio.",
      impact: "Melhor gestão de stock"
    }
  ];

  return (
    <PublicLayout>
      <div className="py-16 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Benefícios Reais para o Seu Negócio
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Descubra como o Experta IA transforma pequenos negócios através de resultados 
              concretos e mensuráveis.
            </p>
          </div>

          {/* Main Image */}
          <div className="mb-16">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img 
                src={realBenefitsImage} 
                alt="Benefícios reais do Experta IA - Crescimento de negócios" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Resultados Comprovados</h2>
                <p className="text-white/90">Benefícios reais em negócios reais</p>
              </div>
            </div>
          </div>

          {/* Main Benefits Grid */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Principais Benefícios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainBenefits.map((benefit, index) => (
                <div key={index} className="group p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                  <benefit.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{benefit.description}</p>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary font-medium">{benefit.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Impact Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Impacto no Seu Negócio</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {businessImpacts.map((category, index) => (
                <div key={index} className="p-6 bg-muted/30 rounded-2xl border border-border">
                  <h3 className="text-xl font-semibold mb-6 text-center">{category.category}</h3>
                  <ul className="space-y-3">
                    {category.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ROI Calculator */}
          <section className="mb-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Calcule o Seu Retorno</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">3h+</div>
                <div className="text-sm text-muted-foreground">Tempo economizado por dia</div>
              </div>
              <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">25%</div>
                <div className="text-sm text-muted-foreground">Aumento médio em vendas</div>
              </div>
              <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">40%</div>
                <div className="text-sm text-muted-foreground">Redução em perdas</div>
              </div>
              <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">ROI</div>
                <div className="text-sm text-muted-foreground">300%+ em 6 meses</div>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-lg text-muted-foreground mb-4">
                Investimento mensal: Menos que o custo de 1 funcionário por semana
              </p>
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Calcular Meu ROI Personalizado
                </Button>
              </Link>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">O Que Dizem os Nossos Clientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary mb-1">{testimonial.impact}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                  <blockquote className="text-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="font-semibold text-foreground">- {testimonial.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-primary text-primary-foreground rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Comece a Ver Resultados Hoje</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de comerciantes que já transformaram os seus negócios com o Experta IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="secondary" size="lg" className="px-8">
                  Começar Teste Gratuito
                </Button>
              </Link>
              <Link to="/como-funciona">
                <Button variant="outline" size="lg" className="px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Ver Como Funciona
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}