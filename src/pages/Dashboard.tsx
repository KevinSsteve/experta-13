
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs';
import { SalesByTimeChart } from '@/components/dashboard/SalesByTimeChart';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';
import { RecentSalesList } from '@/components/dashboard/RecentSalesList';
import { LowStockProductsList } from '@/components/dashboard/LowStockProductsList';
import { SalesReportCard } from '@/components/dashboard/SalesReportCard';
import { StockAlertsBanner } from '@/components/dashboard/StockAlertsBanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { testPermissions, verifyRlsPolicies } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7');
  const isMobile = useIsMobile();
  const { user, profile, session, refreshProfile } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    kpis,
    dailySales,
    topProducts,
    recentSales,
    lowStockProducts,
    authStatus
  } = useDashboardData(timeRange);

  useEffect(() => {
    // Verificar estado de autenticação ao carregar o dashboard
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getUser();
      console.log("[Dashboard] Estado de autenticação:", data.user ? "Autenticado" : "Não autenticado");
      if (data.user) {
        console.log("[Dashboard] ID do usuário:", data.user.id);
      }
    };

    checkAuthStatus();
  }, []);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Verificar autenticação
      await refreshProfile();
      
      // Invalidar queries para forçar recarga
      const queryClient = (window as any).__TANSTACK_QUERY_CLIENT__;
      if (queryClient) {
        await queryClient.invalidateQueries();
        toast.success("Dados atualizados com sucesso");
      } else {
        toast.error("Não foi possível acessar o cliente de consultas");
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar os dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestPermissions = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para testar permissões");
      return;
    }
    
    setIsTesting(true);
    try {
      const results = await testPermissions();
      console.log("Resultados do teste de permissões:", results);
      setTestResults(results);
      
      if (results.products.success && results.sales.success && results.profile.success) {
        toast.success("Permissões OK! Verifique o console para detalhes.");
      } else {
        toast.error("Algumas permissões falharam. Verifique o console.");
      }
      
      // Verificar políticas RLS
      const rlsResults = await verifyRlsPolicies();
      console.log("Resultados da verificação de RLS:", rlsResults);
      
      if (rlsResults.success) {
        if (rlsResults.products.count === 0 && rlsResults.sales.count === 0) {
          toast.warning("Permissões OK, mas não há dados encontrados para este usuário");
        }
      }
    } catch (error) {
      console.error("Erro ao testar permissões:", error);
      toast.error("Erro ao testar permissões");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral das suas vendas e desempenho.</p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1">
                  Usuário: {user.email} (ID: {user.id.slice(0, 8)}...)
                </p>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 items-start mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData}
                disabled={isRefreshing || !user}
                className="mr-2"
              >
                {isRefreshing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados</>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestPermissions}
                disabled={isTesting || !user}
              >
                {isTesting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando</>
                ) : (
                  'Testar Permissões'
                )}
              </Button>
              
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
          
          {/* Status de autenticação */}
          {(!user || !authStatus.userId) && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 text-yellow-800 dark:text-yellow-200">
              <h3 className="font-semibold">Atenção: Problema de Autenticação</h3>
              <p className="text-sm">
                Você precisa estar autenticado para visualizar seus dados. 
                {!user ? " Parece que não há usuário logado." : " Seu ID de usuário não está sendo reconhecido corretamente."}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData} 
                className="mt-2"
              >
                Tentar Novamente
              </Button>
            </div>
          )}
          
          {/* Alertas de estoque baixo */}
          <StockAlertsBanner />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardKPIs 
              data={kpis.data} 
              isLoading={kpis.isLoading} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesByTimeChart 
              data={dailySales.data} 
              isLoading={dailySales.isLoading} 
            />
            
            <TopProductsChart 
              data={topProducts.data} 
              isLoading={topProducts.isLoading} 
            />
            
            {/* Novo componente de relatório de vendas */}
            <SalesReportCard />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentSalesList 
              data={recentSales.data} 
              isLoading={recentSales.isLoading} 
            />
            
            <LowStockProductsList 
              data={lowStockProducts.data} 
              isLoading={lowStockProducts.isLoading} 
            />
          </div>
          
          {/* Resultados de teste */}
          {testResults && (
            <div className="mt-6 p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Resultados do Teste de Permissões</h3>
              <div className="text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(testResults, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
