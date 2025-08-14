import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Store, ShoppingCart, Package, Users, TrendingUp, MapPin } from "lucide-react";
import targetAudienceImage from "@/assets/target-audience.jpg";

export default function ParaQuem() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "Para Quem É - Experta IA";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Descubra se o Experta IA é ideal para o seu negócio. Perfeito para mercearias, farmácias, lojas e pequenos comércios em Angola.');
    }

    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', window.location.href);
    document.head.appendChild(canonicalLink);

    return () => {
      document.head.removeChild(canonicalLink);
    };
  }, []);

  const targetBusinesses = [
    {
      icon: Store,
      title: "Mercearias e Mini-Mercados",
      description: "Controle stock de produtos alimentares, bebidas e artigos básicos",
      benefits: [
        "Gestão automática de produtos perecíveis",
        "Controle de datas de validade",
        "Alertas de reposição de stock",
        "Relatórios de produtos mais vendidos"
      ],
      challenge: "Muitos produtos, vendas rápidas, pouco tempo para registos"
    },
    {
      icon: Package,
      title: "Farmácias e Drogarias", 
      description: "Gestão especializada para medicamentos e produtos de saúde",
      benefits: [
        "Controle rigoroso de medicamentos",
        "Rastreamento de lotes e validades",
        "Relatórios para autoridades sanitárias",
        "Gestão de medicamentos controlados"
      ],
      challenge: "Regulamentação rigorosa, produtos sensíveis, precisão crítica"
    },
    {
      icon: ShoppingCart,
      title: "Lojas de Materiais",
      description: "Construção, eletricidade, canalizações e ferramentas",
      benefits: [
        "Inventário de milhares de itens",
        "Gestão por categorias e fornecedores",
        "Controle de materiais sazonais",
        "Previsão de demanda por projeto"
      ],
      challenge: "Inventário complexo, variações de preço, demanda irregular"
    },
    {
      icon: Users,
      title: "Salões e Serviços",
      description: "Cabeleireiros, estética e outros serviços pessoais",
      benefits: [
        "Registo de serviços e produtos",
        "Controle de agenda e comissões",
        "Gestão de stock de cosméticos",
        "Relatórios de performance"
      ],
      challenge: "Mistura de produtos e serviços, horários variados"
    },
    {
      icon: TrendingUp,
      title: "Empresários Emergentes",
      description: "Novos negócios que precisam de organização desde o início",
      benefits: [
        "Setup rápido e fácil",
        "Crescimento escalável",
        "Aprendizado através de dados",
        "Profissionalização gradual"
      ],
      challenge: "Recursos limitados, precisa de crescer rapidamente"
    },
    {
      icon: MapPin,
      title: "Comércio Rural",
      description: "Negócios fora dos centros urbanos com conectividade limitada",
      benefits: [
        "Funcionamento 100% offline",
        "Sincronização quando possível",
        "Simplicidade de uso",
        "Suporte remoto"
      ],
      challenge: "Internet limitada, recursos técnicos reduzidos"
    }
  ];

  const businessSizes = [
    {
      size: "Micro (1-2 pessoas)",
      description: "Negócios familiares, vendedores individuais",
      benefits: [
        "Interface super simples",
        "Sem necessidade de formação",
        "Custo muito baixo",
        "Resultados imediatos"
      ]
    },
    {
      size: "Pequeno (3-10 pessoas)",
      description: "Pequenas empresas com alguns funcionários",
      benefits: [
        "Múltiplos utilizadores",
        "Relatórios por funcionário",
        "Controle de acessos",
        "Análise de performance"
      ]
    },
    {
      size: "Médio (11-50 pessoas)",
      description: "Empresas estabelecidas com múltiplas filiais",
      benefits: [
        "Gestão centralizada",
        "Relatórios consolidados",
        "API para integrações",
        "Suporte prioritário"
      ]
    }
  ];

  const locations = [
    {
      city: "Luanda",
      description: "Centro urbano com alta densidade comercial",
      advantage: "Conectividade estável, mercado competitivo"
    },
    {
      city: "Benguela",
      description: "Porto importante com comércio diversificado", 
      advantage: "Economia mista, indústria e comércio"
    },
    {
      city: "Huambo",
      description: "Centro agrícola com forte comércio local",
      advantage: "Produtos agrícolas, sazonalidade"
    },
    {
      city: "Lubango",
      description: "Turismo e comércio regional",
      advantage: "Economia turística, produtos artesanais"
    },
    {
      city: "Cabinda",
      description: "Zona petrolífera com poder de compra elevado",
      advantage: "Alto poder de compra, produtos importados"
    },
    {
      city: "Interior",
      description: "Comunidades rurais e pequenos centros",
      advantage: "Funcionamento offline, simplicidade"
    }
  ];

  return (
    <PublicLayout>
      <div className="py-16 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Para Quem É o Experta IA?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Desenvolvido especificamente para pequenos e médios comerciantes angolanos 
              que querem profissionalizar o seu negócio.
            </p>
          </div>

          {/* Main Image */}
          <div className="mb-16">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img 
                src={targetAudienceImage} 
                alt="Público-alvo do Experta IA - Pequenos comerciantes angolanos" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Feito para Si</h2>
                <p className="text-white/90">Comerciantes angolanos que querem crescer</p>
              </div>
            </div>
          </div>

          {/* Target Business Types */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Tipos de Negócio Ideais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {targetBusinesses.map((business, index) => (
                <div key={index} className="group p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300">
                  <business.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-3">{business.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{business.description}</p>
                  
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-destructive mb-2">Desafio Atual:</h4>
                    <p className="text-sm text-muted-foreground">{business.challenge}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Benefícios com Experta IA:</h4>
                    <ul className="space-y-1">
                      {business.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Business Sizes */}
          <section className="mb-16 bg-muted/30 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Adaptado ao Tamanho do Seu Negócio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {businessSizes.map((size, index) => (
                <div key={index} className="p-6 bg-background rounded-2xl border border-border">
                  <h3 className="text-xl font-semibold mb-2">{size.size}</h3>
                  <p className="text-muted-foreground mb-4">{size.description}</p>
                  <ul className="space-y-2">
                    {size.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Geographic Coverage */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Funciona em Todo o Angola</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location, index) => (
                <div key={index} className="p-6 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">{location.city}</h3>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">{location.description}</p>
                  <div className="p-2 bg-primary/5 rounded border border-primary/20">
                    <p className="text-sm text-primary font-medium">{location.advantage}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Self-Assessment Quiz */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-center mb-8">O Experta IA É Para Si Se...</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Tem um negócio de comércio (venda de produtos)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Faz entre 10 a 500+ vendas por dia</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Quer mais controle sobre lucros e stock</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Prefere falar a escrever</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Tem smartphone ou tablet</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Quer relatórios automáticos das vendas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Precisa de alertas de stock baixo</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Quer profissionalizar o negócio</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Busca crescimento sustentável</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span>Valoriza simplicidade e eficiência</span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <p className="text-lg text-muted-foreground mb-4">
                  Se concordou com a maioria, o Experta IA foi feito para si!
                </p>
                <Link to="/auth">
                  <Button size="lg" className="px-8">
                    Começar Teste Gratuito
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Success Stories by Business Type */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Casos de Sucesso por Tipo de Negócio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card rounded-2xl border border-border">
                <div className="text-2xl font-bold text-primary mb-2">+35%</div>
                <div className="text-sm text-muted-foreground mb-3">Mercearia - Luanda</div>
                <blockquote className="text-sm italic mb-3">
                  "Agora sei exatamente quais produtos vendem mais e quando repor stock. Vendas aumentaram muito!"
                </blockquote>
                <div className="text-xs text-muted-foreground">- Maria, Mercearia do Bairro</div>
              </div>
              <div className="p-6 bg-card rounded-2xl border border-border">
                <div className="text-2xl font-bold text-primary mb-2">Zero</div>
                <div className="text-sm text-muted-foreground mb-3">Produtos vencidos - Farmácia</div>
                <blockquote className="text-sm italic mb-3">
                  "Os alertas me salvaram muito dinheiro. Nunca mais perco medicamentos por validade."
                </blockquote>
                <div className="text-xs text-muted-foreground">- João, Farmácia Central</div>
              </div>
              <div className="p-6 bg-card rounded-2xl border border-border">
                <div className="text-2xl font-bold text-primary mb-2">4h/dia</div>
                <div className="text-sm text-muted-foreground mb-3">Tempo economizado - Materiais</div>
                <blockquote className="text-sm italic mb-3">
                  "Era impossível controlar 2000 itens diferentes. Agora é simples e rápido."
                </blockquote>
                <div className="text-xs text-muted-foreground">- Paulo, Construmais</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-primary text-primary-foreground rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">O Seu Negócio Merece o Melhor</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de comerciantes angolanos que já transformaram 
              os seus negócios com o Experta IA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="secondary" size="lg" className="px-8">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/beneficios">
                <Button variant="outline" size="lg" className="px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
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