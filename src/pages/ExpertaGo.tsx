
import { MainLayout } from "@/components/layouts/MainLayout";
import { ExpertaGoInterface } from "@/components/experta-go/ExpertaGoInterface";

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
              Registre vendas e despesas usando sua voz
            </p>
          </div>

          {/* Interface principal */}
          <div className="mt-16">
            <ExpertaGoInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
