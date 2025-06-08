
import { MainLayout } from "@/components/layouts/MainLayout";
import { ExpertaGoStats } from "@/components/experta-go/ExpertaGoStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpertaGoDashboard() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/experta-go" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Experta Go</h1>
            <p className="text-muted-foreground">
              Acompanhe suas vendas e despesas registradas por voz
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas por Voz</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Hoje</div>
              <p className="text-xs text-muted-foreground">
                Registros rápidos e automáticos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas por Voz</CardTitle>
              <Wallet className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Hoje</div>
              <p className="text-xs text-muted-foreground">
                Controle automático de gastos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Automático</div>
              <p className="text-xs text-muted-foreground">
                Estoque criado automaticamente
              </p>
            </CardContent>
          </Card>
        </div>

        <ExpertaGoStats />
      </div>
    </MainLayout>
  );
}
