import { MainLayout } from "@/components/layouts/MainLayout";
import { ExpertaGoOfflineInterface } from "@/components/experta-go/ExpertaGoOfflineInterface";
import { OfflineIndicator } from "@/components/experta-go/OfflineIndicator";

export default function ExpertaGoOffline() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
          {/* Indicador de status offline/online */}
          <OfflineIndicator />
          
          {/* Header minimalista */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-6xl font-bold tracking-ultra text-foreground">
                experta
              </h1>
              <span className="text-lg font-light text-primary bg-primary/10 px-3 py-1 rounded-full">
                v2 offline
              </span>
            </div>
            <p className="text-xl font-extralight tracking-wider text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Registre vendas e despesas usando sua voz - funciona offline!
            </p>
          </div>

          {/* Interface principal */}
          <div className="mt-16">
            <ExpertaGoOfflineInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}