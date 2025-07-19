import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";

export function ExpertaGoOfflineStats() {
  // Dados simulados do armazenamento local
  const offlineStats = {
    todaySales: 5,
    todayExpenses: 2,
    totalRevenue: 15000,
    totalExpenses: 3500,
    pendingSync: 7
  };

  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Vendas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{offlineStats.todaySales}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Offline
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Despesas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{offlineStats.todayExpenses}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Offline
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{offlineStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">AOA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              Gastos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{offlineStats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">AOA</p>
          </CardContent>
        </Card>
      </div>

      {/* Aviso sobre dados offline */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-600">Dados Locais</h4>
              <p className="text-sm text-blue-600/80 mt-1">
                Estas estatísticas são baseadas nos dados salvos no seu dispositivo. 
                Quando houver conexão, os dados serão sincronizados com o servidor.
              </p>
              {offlineStats.pendingSync > 0 && (
                <Badge variant="outline" className="mt-2 text-blue-600 border-blue-600/20">
                  {offlineStats.pendingSync} itens aguardando sincronização
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo do dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do Dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm">Total de Vendas</span>
            <span className="font-medium">{offlineStats.todaySales} transações</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm">Total de Despesas</span>
            <span className="font-medium">{offlineStats.todayExpenses} transações</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Saldo do Dia</span>
            <span className="font-bold text-green-600">
              +{(offlineStats.totalRevenue - offlineStats.totalExpenses).toLocaleString()} AOA
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}