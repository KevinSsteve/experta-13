
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useDashboardData } from '@/hooks/useDashboardData';
import { SimpleDashboardKPI } from '@/components/dashboard/SimpleDashboardKPI';
import { SimpleRecentSales } from '@/components/dashboard/SimpleRecentSales';
import { SimpleLowStockProducts } from '@/components/dashboard/SimpleLowStockProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, CreditCard, DollarSign, ShoppingBag, Info } from 'lucide-react';
import { useEffect } from 'react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const { user } = useAuth();
  
  const {
    salesSummary,
    recentSales,
    lowStock,
    dashboardState
  } = useDashboardData(timeRange);

  const { isLoading, hasError, noData, userId } = dashboardState;

  // Log the dashboard state for debugging
  useEffect(() => {
    console.log('[Dashboard] Estado atual:', { 
      user: user?.id, 
      userId,
      salesData: recentSales.data?.length || 0,
      isLoading,
      hasError
    });
  }, [user, userId, recentSales.data, isLoading, hasError]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          {/* Header com seletor de período */}
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
            </div>
          </div>
          
          {/* Avisos e erros */}
          {(!user || !userId) && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 my-4 text-yellow-800 dark:text-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Atenção: Problema de Autenticação</h3>
                  <p className="text-sm mt-1">
                    Você precisa estar autenticado para visualizar seus dados. 
                    {!user ? " Parece que não há usuário logado." : " Seu ID de usuário não está sendo reconhecido corretamente."}
                  </p>
                  <p className="text-sm mt-1">
                    Por favor, faça login novamente e tente acessar o dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 my-4 text-red-800 dark:text-red-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Erro ao carregar dados</h3>
                  <p className="text-sm mt-1">
                    Ocorreu um erro ao tentar carregar os dados do dashboard. Por favor, tente novamente mais tarde ou entre em contato com o suporte.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {user && userId && noData && !isLoading && (
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
          
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SimpleDashboardKPI 
              title="Receita Total" 
              value={salesSummary.data ? formatCurrency(salesSummary.data.totalRevenue) : "R$ 0,00"} 
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              isLoading={salesSummary.isLoading}
            />
            <SimpleDashboardKPI 
              title="Número de Vendas" 
              value={salesSummary.data ? salesSummary.data.totalSales : "0"} 
              icon={<ShoppingBag className="h-5 w-5 text-primary" />}
              isLoading={salesSummary.isLoading}
            />
            <SimpleDashboardKPI 
              title="Ticket Médio" 
              value={salesSummary.data ? formatCurrency(salesSummary.data.averageTicket) : "R$ 0,00"} 
              icon={<CreditCard className="h-5 w-5 text-primary" />} 
              isLoading={salesSummary.isLoading}
            />
          </div>
          
          {/* Conteúdo principal */}
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
