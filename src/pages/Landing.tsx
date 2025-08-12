import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { CheckCircle2, Mic, BrainCircuit, ShieldCheck, TrendingUp, Users, Building2, Handshake, LineChart, Calendar, Linkedin } from "lucide-react";
// usando imagem pública enviada pelo usuário
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
            <figure className="aspect-square sm:aspect-[16/10] md:aspect-[4/3] rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-background overflow-hidden">
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-muted/40 to-background">
                <div className="text-center px-6">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">Experta</p>
                  <p className="text-lg font-medium">Assistente financeira por voz</p>
                </div>
              </div>
            </figure>
          </aside>
        </div>
      </header>

      {/* Por que existimos */}
      <section aria-labelledby="sec-missao" className="container mx-auto px-4 py-12 scroll-mt-24" id="porque-existimos">
        <h2 id="sec-missao" className="text-2xl font-semibold mb-6">Por que existimos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="font-medium">Missão</h3>
              <p className="text-sm text-muted-foreground">Tornar a gestão financeira acessível e intuitiva para quem prefere falar a escrever.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="font-medium">Visão</h3>
              <p className="text-sm text-muted-foreground">Transformar negócios informais em empresas sustentáveis usando IA.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="font-medium">Pilares</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Acessível</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Inteligente</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Humana</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="sec-como-funciona" id="como-funciona" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-como-funciona" className="text-2xl font-semibold mb-6">Como funciona</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Mic, title: "Fale", desc: "Registe vendas e despesas por voz." },
            { icon: BrainCircuit, title: "Assistente organiza", desc: "A assistente entende o contexto local, normaliza e organiza os dados." },
            { icon: LineChart, title: "Relatórios", desc: "Veja relatórios simples e insights automáticos." },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <s.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">Funciona offline. Não precisa ler ou escrever.</p>
      </section>

      {/* Benefícios */}
      <section aria-labelledby="sec-beneficios" id="beneficios" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-beneficios" className="text-2xl font-semibold mb-6">Benefícios reais</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: "Aumenta lucros", desc: "Descubra os produtos que mais rendem." },
            { icon: ShieldCheck, title: "Evita prejuízos", desc: "Alerte-se para erros e despesas excessivas." },
            { icon: Building2, title: "Acesso a crédito", desc: "Histórico organizado facilita crédito." },
            { icon: Calendar, title: "Mais tempo", desc: "Menos papelada, mais foco no negócio." },
          ].map((b, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <b.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
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
          <Card>
            <CardContent className="p-6">
              <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                Demonstração técnica breve (vídeo/anim.) — em breve
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Para quem é */}
      <section aria-labelledby="sec-para-quem" id="para-quem" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-para-quem" className="text-2xl font-semibold mb-6">Para quem é</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Comerciantes", cta: "Quero experimentar", to: "/auth", icon: Users },
            { title: "Bancos & Microcrédito", cta: "Falar com a equipa", to: "https://wa.me/244924000171", icon: Building2 },
            { title: "Parceiros tecnológicos", cta: "Seja parceiro", to: "https://wa.me/244924000171", icon: Handshake },
            { title: "Investidores", cta: "Quero investir", to: "https://wa.me/244924000171", icon: TrendingUp },
          ].map((p, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <p.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{p.title}</h3>
                {p.to.startsWith("http") ? (
                  <a href={p.to} target="_blank" rel="noreferrer" className="text-sm underline">{p.cta}</a>
                ) : (
                  <Link to={p.to} className="text-sm underline">{p.cta}</Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Prova social */}
      <section aria-labelledby="sec-prova" id="prova-social" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-prova" className="text-2xl font-semibold mb-6">Prova social e validação</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Métricas e projeções — em construção</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Parceiros envolvidos — em negociação</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Na mídia — em breve</p></CardContent></Card>
        </div>
      </section>

      {/* Nossa jornada */}
      <section aria-labelledby="sec-jornada" id="jornada" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-jornada" className="text-2xl font-semibold mb-6">Nossa jornada</h2>
        <ol className="relative border-l border-border pl-6 space-y-6">
          {[
            { title: "Prototipagem", desc: "Primeiros testes com tecnologia de voz." },,
            { title: "Pilotos", desc: "Pilotos com comerciantes locais." },
            { title: "Lançamento", desc: "Disponível como PWA." },
            { title: "Expansão", desc: "Parcerias B2B2C e bancos." },
          ].map((m, i) => (
            <li key={i} className="ml-2">
              <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-primary"></div>
              <h3 className="font-medium">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Equipa */}
      <section aria-labelledby="sec-equipa" id="equipa" className="container mx-auto px-4 py-12 scroll-mt-24">
        <h2 id="sec-equipa" className="text-2xl font-semibold mb-6">Equipa</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
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
