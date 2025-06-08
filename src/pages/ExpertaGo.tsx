
import { MainLayout } from "@/components/layouts/MainLayout";
import { ExpertaGoInterface } from "@/components/experta-go/ExpertaGoInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, TrendingUp } from "lucide-react";

export default function ExpertaGo() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
          {/* Header minimalista */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-6xl font-bold tracking-ultra text-white">
                experta
              </h1>
            </div>
            <p className="text-xl font-extralight tracking-wider text-white/80 max-w-3xl mx-auto leading-relaxed">
              Registre vendas e despesas instantaneamente usando apenas sua voz.
              <br />
              <span className="text-white/60">Simples. Rápido. Inteligente.</span>
            </p>
          </div>

          {/* Cards de funcionalidades principais */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="futuristic-card text-center group">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Mic className="h-12 w-12 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-extralight tracking-wider">FALE</h3>
                  <p className="text-sm font-light text-white/60 tracking-wide">
                    "2 pacotes de manteiga de 400 kz"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="futuristic-card text-center group">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-12 w-12 text-primary mx-auto group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-extralight tracking-wider">PROCESSA</h3>
                  <p className="text-sm font-light text-white/60 tracking-wide">
                    Sistema registra automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="futuristic-card text-center group">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-extralight tracking-wider">APRENDE</h3>
                  <p className="text-sm font-light text-white/60 tracking-wide">
                    Melhora com suas correções
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interface principal simplificada */}
          <div className="mt-16">
            <ExpertaGoInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
