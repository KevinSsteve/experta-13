
import { MainLayout } from "@/components/layouts/MainLayout";
import { ExpertaGoInterface } from "@/components/experta-go/ExpertaGoInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Mic, TrendingUp } from "lucide-react";

export default function ExpertaGo() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Experta Go</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Registre vendas e despesas instantaneamente usando apenas sua voz. 
            Sem cadastros prévios, sem complicações - apenas fale e o sistema registra automaticamente.
          </p>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Mic className="h-8 w-8 text-blue-600 mx-auto" />
                <h3 className="font-semibold">Fale Naturalmente</h3>
                <p className="text-sm text-muted-foreground">
                  "2 pacotes de manteiga de 400 kz"
                </p>
              </div>
              <div className="space-y-2">
                <Zap className="h-8 w-8 text-purple-600 mx-auto" />
                <h3 className="font-semibold">Registro Automático</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema processa e registra instantaneamente
                </p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
                <h3 className="font-semibold">Correção Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Uma correção por dia para melhorar a precisão
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExpertaGoInterface />
      </div>
    </MainLayout>
  );
}
