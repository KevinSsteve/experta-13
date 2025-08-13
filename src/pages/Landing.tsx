import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { CheckCircle2, Mic, BrainCircuit, ShieldCheck, TrendingUp, Users, Building2, Handshake, LineChart, Calendar, Linkedin } from "lucide-react";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import aiAssistant from "@/assets/ai-assistant.jpg";
import workspace from "@/assets/workspace.jpg";
import analytics from "@/assets/analytics.jpg";
import teamCollaboration from "@/assets/team-collaboration.jpg";
import missionVision from "@/assets/mission-vision.jpg";
import howItWorks from "@/assets/how-it-works.jpg";
import realBenefits from "@/assets/real-benefits.jpg";
import targetAudience from "@/assets/target-audience.jpg";
import ourJourney from "@/assets/our-journey.jpg";
export default function Landing() {
  useEffect(() => {
    // SEO: title, description, canonical
    document.title = "Experta: assistente financeira por voz";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Assistente financeira por voz para empreendedores informais em Angola. Entende o contexto local e ajuda a gerir receitas, despesas e metas financeiras.");

    // canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", window.location.origin + "/");

    // JSON-LD Organization
    const orgLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Experta",
      url: window.location.origin,
      logo: window.location.origin + "/logo.png",
      sameAs: [
        "https://instagram.com/experta.ao"
      ],
      contactPoint: [{
        "@type": "ContactPoint",
        telephone: "+244924000171",
        contactType: "customer service"
      }]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(orgLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <header className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <article className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Assistente financeira por voz que entende o seu negócio como você fala
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Gestão financeira por voz para pequenos comerciantes. Fale e a assistente regista vendas e despesas com indicadores em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth"><Button size="lg">Experimente grátis</Button></Link>
              <a href="https://wa.me/244924000171" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline">Falar com a equipa</Button>
              </a>
            </div>
            <ul className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Privacidade e segurança</li>
              <li className="flex items-center gap-2"><Mic className="h-4 w-4" /> Voz primeiro (inclusive offline)</li>
              <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Insights automáticos</li>
            </ul>
          </article>

          <aside className="relative animate-fade-in">
            <figure className="aspect-square sm:aspect-[16/10] md:aspect-[4/3] rounded-3xl border border-border/50 overflow-hidden shadow-lg">
              <img 
                src={dashboardHero} 
                alt="Dashboard financeiro moderno com interface limpa e análises"
                className="h-full w-full object-cover"
              />
            </figure>
          </aside>
        </div>
      </header>

      {/* Por que existimos */}
      <section aria-labelledby="sec-missao" className="container mx-auto px-4 py-16 scroll-mt-24" id="porque-existimos">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 id="sec-missao" className="text-3xl font-semibold mb-8">Por que existimos</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-3 text-primary">Missão</h3>
                <p className="text-muted-foreground leading-relaxed">Tornar a gestão financeira acessível e intuitiva para quem prefere falar a escrever, democratizando o acesso a ferramentas empresariais.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-3 text-primary">Visão</h3>
                <p className="text-muted-foreground leading-relaxed">Transformar negócios informais em empresas sustentáveis usando IA, criando um ecossistema próspero para empreendedores angolanos.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-3 text-primary">Pilares</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> <span>Acessível: simples de usar, sem barreiras tecnológicas</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> <span>Inteligente: IA que entende o contexto local</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> <span>Humana: interface natural por voz</span></li>
                </ul>
              </div>
            </div>
          </div>
          <figure className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={missionVision} 
              alt="Visualização da missão com contexto empresarial africano mostrando união e colaboração"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </figure>
        </div>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="sec-como-funciona" id="como-funciona" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <figure className="rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={howItWorks} 
              alt="Fluxo de trabalho de tecnologia por voz mostrando ondas de microfone transformando-se em gráficos organizados"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </figure>
          <div>
            <h2 id="sec-como-funciona" className="text-3xl font-semibold mb-8">Como funciona</h2>
            <div className="space-y-6">
              {[
                { icon: Mic, title: "1. Fale naturalmente", desc: "Registe vendas e despesas por voz, como se estivesse conversando com um assistente pessoal." },
                { icon: BrainCircuit, title: "2. IA organiza tudo", desc: "A assistente entende o contexto local angolano, normaliza preços em kwanzas e organiza automaticamente os dados." },
                { icon: LineChart, title: "3. Insights instantâneos", desc: "Veja relatórios simples, gráficos intuitivos e insights automáticos sobre o seu negócio." },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground"><strong>Vantagem única:</strong> Funciona offline. Não precisa ler ou escrever. Perfeito para quem está sempre em movimento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section aria-labelledby="sec-beneficios" id="beneficios" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 id="sec-beneficios" className="text-3xl font-semibold mb-8">Benefícios reais para o seu negócio</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: TrendingUp, title: "Aumenta lucros", desc: "Identifique os produtos mais rentáveis e otimize sua estratégia de vendas com dados precisos." },
                { icon: ShieldCheck, title: "Evita prejuízos", desc: "Receba alertas automáticos sobre erros, despesas excessivas e flutuações anômalas no negócio." },
                { icon: Building2, title: "Facilita crédito", desc: "Histórico financeiro organizado e relatórios profissionais aceleram aprovação de empréstimos." },
                { icon: Calendar, title: "Economiza tempo", desc: "Elimine planilhas e papelada. Foque no que realmente importa: fazer o negócio crescer." },
              ].map((b, i) => (
                <div key={i} className="space-y-3">
                  <div className="bg-primary/10 p-3 rounded-2xl w-fit">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <figure className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={realBenefits} 
              alt="Visualização de benefícios empresariais com gráficos de crescimento e setas de aumento de lucro"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </figure>
        </div>
      </section>

      {/* Tecnologia */}
      <section aria-labelledby="sec-tecnologia" id="tecnologia" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-tecnologia" className="text-2xl font-semibold mb-6">A Tecnologia</h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <p className="text-muted-foreground">Tecnologia de voz adaptada ao contexto angolano, com suporte a sotaques e termos locais.</p>
            <p className="text-muted-foreground">Privacidade e segurança de dados desde a concepção.</p>
            <p className="text-muted-foreground">Mais simples e humano do que soluções tradicionais.</p>
          </div>
          <figure className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={aiAssistant} 
              alt="Interface do assistente de IA com tons azuis suaves e elementos flutuantes"
              className="h-full w-full object-cover"
            />
          </figure>
        </div>
      </section>

      {/* Para quem é */}
      <section aria-labelledby="sec-para-quem" id="para-quem" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <figure className="rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={targetAudience} 
              alt="Ilustração de público-alvo diverso mostrando comerciantes, representantes bancários, parceiros tech e investidores"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </figure>
          <div>
            <h2 id="sec-para-quem" className="text-3xl font-semibold mb-8">Para quem é a Experta</h2>
            <div className="grid gap-6">
              {[
                { title: "Comerciantes & Empreendedores", desc: "Pequenos negócios que querem crescer de forma organizada", cta: "Quero experimentar", to: "/auth", icon: Users },
                { title: "Bancos & Microcrédito", desc: "Instituições que precisam avaliar histórico de clientes", cta: "Falar com a equipa", to: "https://wa.me/244924000171", icon: Building2 },
                { title: "Parceiros Tecnológicos", desc: "Empresas que querem integrar nossa solução", cta: "Seja parceiro", to: "https://wa.me/244924000171", icon: Handshake },
                { title: "Investidores", desc: "Quem acredita no potencial do mercado angolano", cta: "Quero investir", to: "https://wa.me/244924000171", icon: TrendingUp },
              ].map((p, i) => (
                <div key={i} className="flex gap-4 items-start p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="bg-primary/10 p-3 rounded-2xl flex-shrink-0">
                    <p.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
                    {p.to.startsWith("http") ? (
                      <a href={p.to} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">{p.cta} →</a>
                    ) : (
                      <Link to={p.to} className="text-sm font-medium text-primary hover:underline">{p.cta} →</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section aria-labelledby="sec-prova" id="prova-social" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-prova" className="text-2xl font-semibold mb-6">Prova social e validação</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <figure className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={workspace} 
              alt="Espaço de trabalho moderno com laptop e gráficos financeiros"
              className="h-48 w-full object-cover"
            />
          </figure>
          <figure className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={analytics} 
              alt="Visualização de análise de negócios com gradientes suaves"
              className="h-48 w-full object-cover"
            />
          </figure>
          <Card className="flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Métricas em construção</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Nossa jornada */}
      <section aria-labelledby="sec-jornada" id="jornada" className="container mx-auto px-4 py-16 scroll-mt-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 id="sec-jornada" className="text-3xl font-semibold mb-8">Nossa jornada</h2>
            <div className="space-y-8">
              {[
                { title: "Prototipagem", desc: "Primeiros testes com tecnologia de voz adaptada ao contexto angolano. Validação inicial com comerciantes locais.", status: "completed" },
                { title: "Testes Pilotos", desc: "Pilotos em mercados de Luanda com foco em pequenos comerciantes. Refinamento baseado no feedback real.", status: "completed" },
                { title: "Lançamento Beta", desc: "Disponível como PWA para early adopters. Coleta de dados e melhorias contínuas.", status: "current" },
                { title: "Expansão Estratégica", desc: "Parcerias B2B2C com bancos e microfinanças. Escalabilidade para todo território nacional.", status: "future" },
              ].map((m, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`mt-2 h-4 w-4 rounded-full flex-shrink-0 ${
                    m.status === 'completed' ? 'bg-green-500' : 
                    m.status === 'current' ? 'bg-primary animate-pulse' : 
                    'bg-muted border-2 border-primary'
                  }`}></div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{m.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <figure className="order-1 md:order-2 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={ourJourney} 
              alt="Visualização de cronograma de jornada com marcos e indicadores de progresso"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </figure>
        </div>
      </section>

      {/* Equipa */}
      <section aria-labelledby="sec-equipa" id="equipa" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-equipa" className="text-2xl font-semibold mb-6">Equipa</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <figure className="rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={teamCollaboration} 
              alt="Equipe colaborando em escritório moderno de tecnologia financeira"
              className="h-64 w-full object-cover"
            />
          </figure>
          {[1,2].map((i) => (
            <Card key={i}>
              <CardContent className="p-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted" aria-hidden></div>
                <h3 className="font-medium">Membro {i}</h3>
                <p className="text-sm text-muted-foreground">Função principal</p>
                <a href="#" className="inline-flex items-center gap-1 text-sm underline">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Chamada final */}
      <section aria-labelledby="sec-final" id="cta-final" className="container mx-auto px-4 py-12 scroll-mt-24">
        <Card>
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 id="sec-final" className="text-2xl font-semibold">Pronto para experimentar?</h2>
              <p className="text-sm text-muted-foreground">Escolha o seu caminho e comece agora.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth"><Button>Quero experimentar</Button></Link>
              <a href="https://wa.me/244924000171" target="_blank" rel="noreferrer"><Button variant="outline">Quero investir</Button></a>
              <a href="https://wa.me/244924000171" target="_blank" rel="noreferrer"><Button variant="secondary">Quero ser parceiro</Button></a>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Conteúdo vivo */}
      <section aria-labelledby="sec-conteudo" id="conteudo" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-conteudo" className="text-2xl font-semibold mb-6">Conteúdo vivo</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {["Gestão simples por voz", "Guia prático para o comerciante", "Caso de estudo: padaria"].map((t, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <h3 className="font-medium">{t}</h3>
                <p className="text-sm text-muted-foreground">Artigo em breve</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
