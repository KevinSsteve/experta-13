import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";

export function ExpertaGoOfflineStats() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    unsyncedRecords: 0,
    salesCount: 0,
    expensesCount: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { offlineStorage } = await import('@/lib/offline-storage');
        const currentStats = await offlineStorage.getStats();
        setStats(currentStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    loadStats();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

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
            <div className="text-2xl font-bold">{stats.salesCount}</div>
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
            <div className="text-2xl font-bold">{stats.expensesCount}</div>
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
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
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
            <div className="text-2xl font-bold">{stats.unsyncedRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendente</p>
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
              {stats.unsyncedRecords > 0 && (
                <Badge variant="outline" className="mt-2 text-blue-600 border-blue-600/20">
                  {stats.unsyncedRecords} itens aguardando sincronização
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
            <span className="font-medium">{stats.salesCount} registros</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm">Total de Despesas</span>
            <span className="font-medium">{stats.expensesCount} registros</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Total de Registros</span>
            <span className="font-bold text-primary">
              {stats.totalRecords} itens
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}