import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Cloud, Shield, Zap, Cpu, Globe, Lock, Smartphone } from "lucide-react";

export default function Tecnologia() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "Tecnologia - Experta IA";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conheça a tecnologia por trás do Experta IA. IA avançada, processamento offline, segurança de dados e arquitetura cloud moderna.');
    }

    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', window.location.href);
    document.head.appendChild(canonicalLink);

    // JSON-LD for technology
    const jsonLdTech = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Experta IA",
      "description": "IA de voz para gestão financeira com tecnologia avançada",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, Android, iOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "AOA"
      },
      "featureList": [
        "Reconhecimento de voz offline",
        "IA adaptada para português angolano", 
        "Sincronização automática",
        "Criptografia avançada",
        "PWA multiplataforma"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLdTech);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(canonicalLink);
      document.head.removeChild(script);
    };
  }, []);

  const techFeatures = [
    {
      icon: Brain,
      title: "IA Conversacional Avançada",
      description: "Modelo de linguagem treinado especificamente para comércio e português angolano",
      technical: "Transformers neuronais com processamento de linguagem natural otimizado para contexto comercial"
    },
    {
      icon: Smartphone,
      title: "PWA Multiplataforma", 
      description: "Funciona como app nativo em qualquer dispositivo",
      technical: "Progressive Web App com Service Workers para funcionamento offline total"
    },
    {
      icon: Cloud,
      title: "Arquitetura Cloud Híbrida",
      description: "Processamento local + sincronização na nuvem",
      technical: "Edge computing com fallback para cloud, garantindo performance e disponibilidade"
    },
    {
      icon: Shield,
      title: "Segurança Enterprise",
      description: "Criptografia ponta-a-ponta e compliance GDPR",
      technical: "AES-256, TLS 1.3, zero-knowledge architecture e auditoria contínua"
    },
    {
      icon: Zap,
      title: "Performance Otimizada",
      description: "Resposta instantânea mesmo em dispositivos básicos",
      technical: "WebAssembly, lazy loading, cache inteligente e compressão de dados"
    },
    {
      icon: Globe,
      title: "Adaptação Cultural",
      description: "Compreende gírias, expressões e contexto local",
      technical: "Fine-tuning com dados locais e feedback contínuo de utilizadores angolanos"
    }
  ];

  const architecture = [
    {
      layer: "Interface",
      description: "React + PWA para experiência nativa",
      technologies: ["React 18", "TypeScript", "Tailwind CSS", "Service Workers"]
    },
    {
      layer: "Processamento",
      description: "IA local + cloud para máxima eficiência",
      technologies: ["WebRTC", "WebAssembly", "TensorFlow.js", "Custom NLP"]
    },
    {
      layer: "Dados",
      description: "Base de dados resiliente e escalável",
      technologies: ["Supabase", "PostgreSQL", "Redis Cache", "Edge Storage"]
    },
    {
      layer: "Infraestrutura",
      description: "Cloud global com latência mínima",
      technologies: ["Vercel Edge", "AWS", "CDN Global", "Auto-scaling"]
    }
  ];

  const securityFeatures = [
    "Criptografia AES-256 para dados em repouso",
    "TLS 1.3 para dados em trânsito", 
    "Autenticação multi-factor opcional",
    "Backup automático com versionamento",
    "Auditoria completa de acesso",
    "Compliance GDPR e lei angolana",
    "Zero-knowledge: nem nós vemos seus dados",
    "Recuperação de desastres automática"
  ];

  return (
    <PublicLayout>
      <div className="py-16 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Tecnologia de Ponta para o Seu Negócio
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Conheça a arquitetura moderna e segura que torna o Experta IA a solução 
              mais avançada para gestão comercial por voz.
            </p>
          </div>

          {/* Tech Stack Visual */}
          <div className="mb-16">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Stack Tecnológico</h2>
                <p className="text-muted-foreground">Construído com as tecnologias mais modernas e confiáveis</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {architecture.map((layer, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <Cpu className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{layer.layer}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{layer.description}</p>
                    <div className="space-y-1">
                      {layer.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="text-xs bg-background px-2 py-1 rounded border">
                          {tech}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Características Técnicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {techFeatures.map((feature, index) => (
                <div key={index} className="group p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300">
                  <feature.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-foreground/80">{feature.technical}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* IA Details */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Inteligência Artificial Especializada</h2>
                <div className="space-y-6">
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Processamento de Linguagem Natural
                    </h3>
                    <p className="text-muted-foreground">
                      Modelo treinado com milhares de horas de conversas comerciais em português angolano. 
                      Compreende contexto, gírias e variações regionais.
                    </p>
                  </div>
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Aprendizado Contínuo
                    </h3>
                    <p className="text-muted-foreground">
                      Sistema adapta-se automaticamente ao seu vocabulário comercial específico, 
                      melhorando a precisão a cada uso.
                    </p>
                  </div>
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      Processamento Offline
                    </h3>
                    <p className="text-muted-foreground">
                      Core de IA funciona localmente no dispositivo, garantindo resposta instantânea 
                      e funcionamento sem internet.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <h3 className="text-lg font-semibold mb-4">Exemplo: Processamento de Comando</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded border">
                      <div className="text-sm text-muted-foreground mb-1">Input de voz:</div>
                      <div className="text-primary font-medium">"Vendi 5 sacas de fuba a 8 mil cada para o João"</div>
                    </div>
                    <div className="text-center text-muted-foreground">↓ IA processa ↓</div>
                    <div className="p-3 bg-background rounded border">
                      <div className="text-sm text-muted-foreground mb-1">Output estruturado:</div>
                      <div className="text-sm space-y-1">
                        <div>• Produto: Fuba</div>
                        <div>• Quantidade: 5 unidades</div>
                        <div>• Preço unitário: 8.000 Kz</div>
                        <div>• Total: 40.000 Kz</div>
                        <div>• Cliente: João</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="mb-16 bg-muted/30 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Segurança e Privacidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  Proteção de Dados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-2">Certificações</h4>
                  <p className="text-sm text-muted-foreground">
                    ISO 27001, SOC 2 Type II, GDPR Compliant
                  </p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-2">Auditoria</h4>
                  <p className="text-sm text-muted-foreground">
                    Revisões de segurança trimestrais por empresas independentes
                  </p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-2">Transparência</h4>
                  <p className="text-sm text-muted-foreground">
                    Relatórios públicos de segurança e incident response
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Stats */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Performance em Números</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-card rounded-2xl border border-border">
                <div className="text-3xl font-bold text-primary mb-2">&lt;100ms</div>
                <div className="text-sm text-muted-foreground">Tempo de resposta</div>
              </div>
              <div className="text-center p-6 bg-card rounded-2xl border border-border">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime garantido</div>
              </div>
              <div className="text-center p-6 bg-card rounded-2xl border border-border">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Precisão de voz</div>
              </div>
              <div className="text-center p-6 bg-card rounded-2xl border border-border">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Disponibilidade</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Tecnologia ao Serviço do Seu Negócio</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experimente a IA mais avançada para gestão comercial, construída especificamente 
              para o mercado angolano.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Testar Tecnologia
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