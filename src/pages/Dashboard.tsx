
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useDashboardData } from '@/hooks/useDashboardData';
import { SimpleDashboardKPI } from '@/components/dashboard/SimpleDashboardKPI';
import { SimpleRecentSales } from '@/components/dashboard/SimpleRecentSales';
import { SimpleLowStockProducts } from '@/components/dashboard/SimpleLowStockProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, BarChart3, CreditCard, DollarSign, Info, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs';
import { SalesReportCard } from '@/components/dashboard/SalesReportCard';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveWrapper } from '@/components/ui/responsive-wrapper';

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
    refreshData();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-16 sm:pb-20">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Header com título e controles */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Visão geral das suas vendas e desempenho</p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                  Usuário: {user.email} (ID: {user.id.slice(0, 8)}...)
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Tabs 
                value={timeRange} 
                onValueChange={setTimeRange} 
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3">
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
                className="w-full sm:w-auto flex items-center justify-center"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                <span>Atualizar</span>
              </Button>
            </div>
          </div>
          
          {/* Alerta de autenticação */}
          {!userId && (
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Atenção: Problema de Autenticação</h3>
                    <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                      Você precisa estar autenticado para visualizar seus dados. 
                      {!user ? " Parece que não há usuário logado." : " Seu ID de usuário não está sendo reconhecido corretamente."}
                    </p>
                    <p className="text-sm mt-2 font-medium text-yellow-800 dark:text-yellow-200">
                      Status atual:
                    </p>
                    <ul className="list-disc pl-6 text-xs sm:text-sm mt-1 text-yellow-700 dark:text-yellow-300">
                      <li>Usuário: {user ? `${user.email} (${user.id.slice(0, 8)}...)` : "Não detectado"}</li>
                      <li>UserId para consultas: {userId ? userId.slice(0, 8) + "..." : "Não definido"}</li>
                    </ul>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-800"
                        asChild
                      >
                        <a href="/auth">Fazer login novamente</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Mensagem de erro */}
          {hasError && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">Erro ao carregar dados</h3>
                      <p className="text-sm mt-1 text-red-700 dark:text-red-300">
                        Ocorreu um erro ao tentar carregar os dados do dashboard. Por favor, verifique sua conexão e tente novamente.
                      </p>
                    </div>
                    <Button 
                      onClick={handleRefresh}
                      variant="outline"
                      size="sm"
                      className="bg-red-50 hover:bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-200 dark:border-red-800"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Mensagem de sem dados */}
          {userId && isAuthReady && noData && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <Info className="h-10 w-10 mx-auto mb-4 text-foreground" />
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
            <div className="flex justify-center items-center my-8 py-6">
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
              <div className="mb-4 sm:mb-6">
                <DashboardKPIs 
                  data={salesKPIs.data} 
                  isLoading={salesKPIs.isLoading} 
                />
              </div>
              
              {/* KPIs simplificados para dispositivos móveis */}
              {salesKPIs.data && (
                <ResponsiveWrapper
                  className="mb-4 sm:mb-6"
                  mobileClassName="grid grid-cols-1 gap-4"
                  desktopClassName="grid grid-cols-3 gap-4"
                >
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
                </ResponsiveWrapper>
              )}
              
              {/* Relatório de vendas */}
              <div className="mb-4 sm:mb-6">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 border-b">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium">Relatório de Vendas</h3>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                    <SalesReportCard />
                  </CardContent>
                </Card>
              </div>
              
              {/* Vendas recentes e estoque baixo */}
              <ResponsiveWrapper
                mobileClassName="grid grid-cols-1 gap-4"
                desktopClassName="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <SimpleRecentSales 
                  sales={recentSales.data} 
                  isLoading={recentSales.isLoading} 
                />
                <SimpleLowStockProducts 
                  products={lowStock.data} 
                  isLoading={lowStock.isLoading} 
                />
              </ResponsiveWrapper>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
