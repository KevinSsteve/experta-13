import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Linkedin, Mail, MapPin, Heart, Users, Target } from "lucide-react";
import teamCollaborationImage from "@/assets/team-collaboration.jpg";

export default function Equipa() {
  useEffect(() => {
    // SEO Meta Tags
    document.title = "Nossa Equipa - Experta IA";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conheça a equipa por trás do Experta IA. Especialistas angolanos e internacionais dedicados a revolucionar o comércio local.');
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

  const coreTeam = [
    {
      name: "Carlos Mendes",
      role: "CEO & Co-Fundador",
      location: "Luanda, Angola",
      bio: "Empreendedor angolano com 15+ anos em tecnologia. Ex-executivo em telecomunicações, especialista em produtos para mercados emergentes.",
      expertise: ["Estratégia de Negócio", "Mercados Africanos", "Liderança"],
      linkedin: "#",
      email: "carlos@experta.ao"
    },
    {
      name: "Ana Silva",
      role: "CTO & Co-Fundadora", 
      location: "Lisboa, Portugal",
      bio: "Engenheira de software com PhD em IA. 10+ anos em startups de tech, especialista em machine learning e processamento de linguagem natural.",
      expertise: ["Inteligência Artificial", "Arquitetura de Software", "NLP"],
      linkedin: "#",
      email: "ana@experta.ao"
    },
    {
      name: "João Baptista",
      role: "Head of Product",
      location: "Benguela, Angola", 
      bio: "Designer de produto com experiência em UX/UI para mercados africanos. Especialista em criar interfaces simples para utilizadores não-técnicos.",
      expertise: ["Design UX/UI", "Pesquisa de Utilizador", "Product Strategy"],
      linkedin: "#",
      email: "joao@experta.ao"
    },
    {
      name: "Maria Santos",
      role: "Head of Customer Success",
      location: "Huambo, Angola",
      bio: "Especialista em customer success com background em comércio local. Fluente em múltiplas línguas angolanas, focus em adoção de produto.",
      expertise: ["Customer Success", "Formação", "Mercado Local"],
      linkedin: "#", 
      email: "maria@experta.ao"
    }
  ];

  const advisors = [
    {
      name: "Dr. Paulo Kassoma",
      role: "Advisor - Mercado Angolano",
      background: "Ex-Ministro, especialista em políticas de desenvolvimento empresarial"
    },
    {
      name: "Prof. Isabel Ferreira",
      role: "Advisor - IA & Tecnologia",
      background: "Professora de IA na Universidade de Coimbra, 20+ papers em NLP"
    },
    {
      name: "Ricardo Oliveira",
      role: "Advisor - Fintech",
      background: "Ex-VP Engineering no Revolut, especialista em produtos financeiros"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Impacto Local",
      description: "Criamos soluções que realmente resolvem problemas dos comerciantes angolanos"
    },
    {
      icon: Users,
      title: "Equipa Diversa",
      description: "Combinamos experiência local com expertise técnica internacional"
    },
    {
      icon: Target,
      title: "Excelência Técnica",
      description: "Padrões internacionais adaptados à realidade e necessidades locais"
    }
  ];

  const journey = [
    {
      year: "2022",
      milestone: "Fundação",
      description: "Identificação do problema durante pesquisa de mercado em Luanda"
    },
    {
      year: "2023", 
      milestone: "MVP & Testes",
      description: "Desenvolvimento do primeiro protótipo e testes com 50 comerciantes"
    },
    {
      year: "2024",
      milestone: "Lançamento",
      description: "Lançamento oficial com 500+ utilizadores ativos em 3 províncias"
    },
    {
      year: "2025",
      milestone: "Expansão",
      description: "Plano de expansão para todas as províncias angolanas"
    }
  ];

  return (
    <PublicLayout>
      <div className="py-16 px-4">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              A Nossa Equipa
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Especialistas angolanos e internacionais unidos por uma missão: 
              democratizar a gestão profissional para pequenos comerciantes.
            </p>
          </div>

          {/* Team Image */}
          <div className="mb-16">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img 
                src={teamCollaborationImage} 
                alt="Equipa Experta IA - Colaboração e inovação" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Equipa Multicultural</h2>
                <p className="text-white/90">Angola + Portugal + Tecnologia</p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Os Nossos Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 bg-card rounded-2xl border border-border">
                  <value.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Core Team */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Equipa Principal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {coreTeam.map((member, index) => (
                <div key={index} className="p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-1">{member.role}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {member.location}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Especialidades:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a href={member.linkedin} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advisors */}
          <section className="mb-16 bg-muted/30 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">Conselheiros</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {advisors.map((advisor, index) => (
                <div key={index} className="p-6 bg-background rounded-xl border border-border">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-secondary-foreground">
                      {advisor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{advisor.name}</h3>
                  <p className="text-sm text-primary mb-2">{advisor.role}</p>
                  <p className="text-sm text-muted-foreground">{advisor.background}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Company Journey */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">A Nossa Jornada</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border"></div>
              <div className="space-y-8">
                {journey.map((item, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                        <div className="text-2xl font-bold text-primary mb-2">{item.year}</div>
                        <h3 className="text-lg font-semibold mb-2">{item.milestone}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-md flex-shrink-0 z-10"></div>
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Culture & Work */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Cultura de Trabalho</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold mb-2">🇦🇴 Remote-First angolano</h3>
                    <p className="text-muted-foreground text-sm">
                      Equipa distribuída entre Angola e Portugal, priorizando talento local
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold mb-2">🎯 Foco no Cliente</h3>
                    <p className="text-muted-foreground text-sm">
                      Cada decisão é baseada no impacto real para os comerciantes
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold mb-2">🚀 Inovação Constante</h3>
                    <p className="text-muted-foreground text-sm">
                      Experimentação rápida e adaptação às necessidades do mercado
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold mb-2">🌍 Impacto Social</h3>
                    <p className="text-muted-foreground text-sm">
                      Medimos sucesso pelo crescimento dos nossos utilizadores
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <h3 className="text-lg font-semibold mb-3">Junte-se à Nossa Missão</h3>
                  <p className="text-muted-foreground mb-4">
                    Estamos sempre à procura de talentos angolanos apaixonados por tecnologia 
                    e impacto social. Se quer fazer parte da revolução do comércio local, 
                    adoraríamos conhecê-lo.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="mailto:careers@experta.ao" className="inline-block">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Ver Vagas Abertas
                      </Button>
                    </a>
                    <a href="mailto:partnerships@experta.ao" className="inline-block">
                      <Button variant="ghost" className="w-full sm:w-auto">
                        Parcerias
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Construído por Angolanos, Para Angolanos</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Uma equipa que compreende os desafios do mercado local e tem a expertise 
              técnica para criar soluções que realmente funcionam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Começar Com Nossa Equipa
                </Button>
              </Link>
              <a href="mailto:hello@experta.ao">
                <Button variant="outline" size="lg" className="px-8">
                  Falar Connosco
                </Button>
              </a>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}