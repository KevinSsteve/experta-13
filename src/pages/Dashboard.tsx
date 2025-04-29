
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useDashboardData } from '@/hooks/useDashboardData';
import { SimpleDashboardKPI } from '@/components/dashboard/SimpleDashboardKPI';
import { SimpleRecentSales } from '@/components/dashboard/SimpleRecentSales';
import { SimpleLowStockProducts } from '@/components/dashboard/SimpleLowStockProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, CreditCard, DollarSign, Info, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs';
import { SalesReportCard } from '@/components/dashboard/SalesReportCard';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const { user } = useAuth();
  
  const {
    salesKPIs,
    recentSales,
    lowStock,
    refreshData,
    isRefreshing,
    dashboardState
  } = useDashboardData(timeRange);

  const { isLoading, hasError, noData, userId, isAuthReady } = dashboardState;

  const handleRefresh = () => {
    toast.info("Atualizando dados do dashboard...");
    refreshData().catch((error) => {
      console.error("Erro na atualização:", error);
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Header com título e controles */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral das suas vendas e desempenho</p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1">
                  Usuário: {user.email} (ID: {user.id.slice(0, 8)}...)
                </p>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 items-start mt-4 md:mt-0">
              <Tabs 
                value={timeRange} 
                onValueChange={setTimeRange} 
              >
                <TabsList>
                  <TabsTrigger value="7">7 dias</TabsTrigger>
                  <TabsTrigger value="30">30 dias</TabsTrigger>
                  <TabsTrigger value="90">90 dias</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar Dados
              </Button>
            </div>
          </div>
          
          {/* Alerta de autenticação */}
          {!userId && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 my-4 text-yellow-800 dark:text-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Atenção: Problema de Autenticação</h3>
                  <p className="text-sm mt-1">
                    Você precisa estar autenticado para visualizar seus dados. 
                    {!user ? " Parece que não há usuário logado." : " Seu ID de usuário não está sendo reconhecido corretamente."}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Status atual:</span>
                  </p>
                  <ul className="list-disc pl-6 text-sm mt-1">
                    <li>Usuário: {user ? `${user.email} (${user.id.slice(0, 8)}...)` : "Não detectado"}</li>
                    <li>UserId para consultas: {userId ? userId.slice(0, 8) + "..." : "Não definido"}</li>
                  </ul>
                  <p className="text-sm mt-2">
                    Por favor, <a href="/auth" className="font-medium underline">faça login novamente</a> para resolver este problema.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensagem de erro */}
          {hasError && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 my-4 text-red-800 dark:text-red-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Erro ao carregar dados</h3>
                  <p className="text-sm mt-1">
                    Ocorreu um erro ao tentar carregar os dados do dashboard. Por favor, verifique sua conexão e tente novamente.
                  </p>
                  <Button 
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensagem de sem dados */}
          {userId && isAuthReady && noData && !isLoading && (
            <Card className="my-4">
              <CardContent className="p-6 text-center">
                <Info className="h-10 w-10 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-medium mb-2">Nenhum dado encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Não encontramos dados para exibir neste dashboard. Isso pode ocorrer por dois motivos:
                </p>
                <ul className="text-sm text-left list-disc pl-6 mb-4 space-y-1">
                  <li>Você ainda não registrou nenhuma venda ou produto no sistema</li>
                  <li>Há um problema de permissão no acesso aos seus dados</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Tente adicionar alguns produtos e registrar vendas para visualizar dados no dashboard.
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Estado de carregamento */}
          {isLoading && userId && (
            <div className="flex justify-center items-center p-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Carregando dados do dashboard...</p>
              </div>
            </div>
          )}
          
          {/* Conteúdo principal do dashboard */}
          {!isLoading && userId && isAuthReady && (
            <>
              {/* KPIs principais */}
              <div className="mb-6">
                <DashboardKPIs 
                  data={salesKPIs.data} 
                  isLoading={salesKPIs.isLoading} 
                />
              </div>
              
              {/* KPIs simplificados */}
              {salesKPIs.data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SimpleDashboardKPI 
                    title="Receita Total" 
                    value={formatCurrency(salesKPIs.data.totalRevenue)} 
                    icon={<DollarSign className="h-5 w-5 text-primary" />}
                    isLoading={salesKPIs.isLoading}
                  />
                  <SimpleDashboardKPI 
                    title="Número de Vendas" 
                    value={salesKPIs.data.totalSales.toString()} 
                    icon={<ShoppingBag className="h-5 w-5 text-primary" />}
                    isLoading={salesKPIs.isLoading}
                  />
                  <SimpleDashboardKPI 
                    title="Ticket Médio" 
                    value={formatCurrency(salesKPIs.data.averageTicket)} 
                    icon={<CreditCard className="h-5 w-5 text-primary" />} 
                    isLoading={salesKPIs.isLoading}
                  />
                </div>
              )}
              
              {/* Relatório de vendas */}
              <div className="mb-6">
                <SalesReportCard />
              </div>
              
              {/* Vendas recentes e estoque baixo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleRecentSales 
                  sales={recentSales.data} 
                  isLoading={recentSales.isLoading} 
                />
                <SimpleLowStockProducts 
                  products={lowStock.data} 
                  isLoading={lowStock.isLoading} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
