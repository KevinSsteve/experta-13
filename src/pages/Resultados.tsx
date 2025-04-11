import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, LineChart, BarChart, FilePenLine, FileBarChart, FileText, Loader2, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { useIsMobile } from "@/hooks/use-mobile";

interface FinancialReport {
  id: string;
  title: string;
  description: string | null;
  report_type: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  created_at: string;
  updated_at: string;
}

interface FinancialMetric {
  id: string;
  metric_name: string;
  metric_type: string;
  value: number;
  comparison_value: number | null;
  percentage_change: number | null;
  report_id: string;
  created_at: string;
  updated_at: string;
}

export default function Resultados() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("relatorios");
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const isMobile = useIsMobile();
  
  const { data: reports, isLoading: isLoadingReports, error: reportsError, refetch: refetchReports } = useQuery({
    queryKey: ["financial-reports", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      console.log("Fetching financial reports for user:", user.id);
      
      const { data, error } = await supabase
        .from("financial_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching financial reports:", error);
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} financial reports`);
      return data as FinancialReport[];
    },
    enabled: !!user?.id,
    retry: 2
  });

  const { data: metrics, isLoading: isLoadingMetrics, error: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ["financial-metrics", reports?.[0]?.id],
    queryFn: async () => {
      if (!reports || reports.length === 0 || !reports[0].id) {
        console.log("No reports available to fetch metrics");
        return [];
      }

      console.log("Fetching metrics for report:", reports[0].id);
      
      const { data, error } = await supabase
        .from("financial_metrics")
        .select("*")
        .eq("report_id", reports[0].id);
      
      if (error) {
        console.error("Error fetching financial metrics:", error);
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} financial metrics`);
      return data as FinancialMetric[];
    },
    enabled: !!reports && reports.length > 0 && !!reports[0].id
  });

  useEffect(() => {
    if (reports && reports.length > 0) {
      const processReportForChart = () => {
        try {
          const startDate = new Date(reports[0].period_start);
          const endDate = new Date(reports[0].period_end);
          const dayDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          const chartData = [];
          for (let i = 0; i <= dayDiff; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dailyRevenue = reports[0].total_revenue / (dayDiff + 1);
            chartData.push({
              date: date.toISOString(),
              total: dailyRevenue
            });
          }
          
          setSalesChartData(chartData);
        } catch (error) {
          console.error("Erro ao processar dados para o gráfico:", error);
        }
      };
      
      processReportForChart();
    }
  }, [reports]);

  useEffect(() => {
    if (reportsError) {
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar os relatórios financeiros.",
        variant: "destructive",
      });
      console.error("Reports error:", reportsError);
    }

    if (metricsError) {
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar as métricas financeiras.",
        variant: "destructive",
      });
      console.error("Metrics error:", metricsError);
    }
  }, [reportsError, metricsError, toast]);

  const refreshData = async () => {
    try {
      toast({
        title: "Atualizando dados",
        description: "Buscando os dados mais recentes...",
      });
      
      await refetchReports();
      await refetchMetrics();
      
      toast({
        title: "Dados atualizados",
        description: "Os dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Resultados Financeiros</h1>
            <p className="text-sm text-muted-foreground">Análise dos seus resultados de vendas e financeiros</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <Loader2 className={`mr-2 h-4 w-4 ${isLoadingReports ? "animate-spin" : ""}`} />
              {isMobile ? "Atualizar" : "Atualizar Dados"}
            </Button>
            <Button variant="default" size="sm">
              <FilePenLine className="mr-2 h-4 w-4" />
              {isMobile ? "Novo" : "Novo Relatório"}
            </Button>
          </div>
        </div>

        {!user?.id && (
          <Card className="mb-4 sm:mb-6">
            <CardContent className="py-4">
              <div className="text-center text-amber-600 dark:text-amber-400">
                <p>Você precisa estar autenticado para visualizar seus relatórios financeiros.</p>
                <Button variant="outline" className="mt-2" onClick={() => window.location.href = "/auth"}>
                  Ir para página de login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="relatorios" className="text-xs sm:text-sm px-1 sm:px-2">
              <FileBarChart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="graficos" className="text-xs sm:text-sm px-1 sm:px-2">
              <PieChart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="metricas" className="text-xs sm:text-sm px-1 sm:px-2">
              <BarChart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Métricas</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="relatorios" className="space-y-4">
            <Card>
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                <CardTitle className="text-base sm:text-lg">Relatórios Financeiros</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Visão geral dos relatórios financeiros do seu negócio.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 pt-0">
                {isLoadingReports ? (
                  <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p>Carregando relatórios...</p>
                    </div>
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">Nenhum relatório encontrado.</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Crie um relatório financeiro ou faça algumas vendas para gerar relatórios automaticamente.
                    </p>
                    <Button variant="outline" className="mt-4">
                      <FilePenLine className="mr-2 h-4 w-4" />
                      Criar Primeiro Relatório
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    {isMobile ? (
                      <div className="space-y-3 px-3">
                        {reports.map((report) => (
                          <Card key={report.id} className="p-3">
                            <div className="font-medium">{report.title}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {report.report_type} • {formatDate(report.period_start)} - {formatDate(report.period_end)}
                            </div>
                            <div className="grid grid-cols-3 text-sm mt-2 gap-1">
                              <div>
                                <div className="text-muted-foreground text-xs">Receita</div>
                                <div>{formatCurrency(report.total_revenue)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">Custo</div>
                                <div>{formatCurrency(report.total_cost)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">Lucro</div>
                                <div className="font-medium">{formatCurrency(report.total_profit)}</div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Receita</TableHead>
                            <TableHead className="text-right">Custo</TableHead>
                            <TableHead className="text-right">Lucro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((report) => (
                            <TableRow key={report.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{report.title}</TableCell>
                              <TableCell>{report.report_type}</TableCell>
                              <TableCell>
                                {formatDate(report.period_start)} - {formatDate(report.period_end)}
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(report.total_revenue)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(report.total_cost)}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(report.total_profit)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="graficos">
            <Card>
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                <CardTitle className="text-base sm:text-lg">Visualização Gráfica</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Analise seus resultados financeiros através de gráficos.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-60 sm:h-80 px-0 sm:px-6 pb-3 sm:pb-6 pt-0">
                {reports && reports.length > 0 && salesChartData.length > 0 ? (
                  <SalesChart salesData={salesChartData} isLoading={isLoadingReports} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <LineChart size={isMobile ? 48 : 64} className="mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium text-sm sm:text-base">Não há dados suficientes para exibir gráficos</p>
                    <p className="text-xs sm:text-sm mt-1 px-4 text-center">Tente gerar relatórios financeiros ou registrar mais vendas.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metricas">
            <Card>
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                <CardTitle className="text-base sm:text-lg">Métricas Financeiras</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Indicadores-chave de performance financeira.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 pt-0">
                {isLoadingMetrics ? (
                  <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p>Carregando métricas...</p>
                    </div>
                  </div>
                ) : !metrics || metrics.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {reports && reports.length > 0 && (
                      <>
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                          <CardHeader className="pb-2 px-3 sm:px-4 py-3">
                            <CardTitle className="text-sm sm:text-lg">Receita Total</CardTitle>
                            <CardDescription className="text-xs">Vendas no período</CardDescription>
                          </CardHeader>
                          <CardContent className="px-3 sm:px-4 pb-3">
                            <div className="text-xl sm:text-2xl font-bold">
                              {formatCurrency(reports[0].total_revenue)}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                          <CardHeader className="pb-2 px-3 sm:px-4 py-3">
                            <CardTitle className="text-sm sm:text-lg">Custos Totais</CardTitle>
                            <CardDescription className="text-xs">Despesas no período</CardDescription>
                          </CardHeader>
                          <CardContent className="px-3 sm:px-4 pb-3">
                            <div className="text-xl sm:text-2xl font-bold">
                              {formatCurrency(reports[0].total_cost)}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                          <CardHeader className="pb-2 px-3 sm:px-4 py-3">
                            <CardTitle className="text-sm sm:text-lg">Lucro</CardTitle>
                            <CardDescription className="text-xs">Resultado líquido</CardDescription>
                          </CardHeader>
                          <CardContent className="px-3 sm:px-4 pb-3">
                            <div className="text-xl sm:text-2xl font-bold">
                              {formatCurrency(reports[0].total_profit)}
                            </div>
                            <div className={`text-xs sm:text-sm mt-1 flex items-center ${
                              reports[0].total_profit > 0 ? 'text-green-500' : 
                              reports[0].total_profit < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {reports[0].total_profit > 0 ? (
                                <><ArrowUp className="h-3 w-3 mr-1" /> Lucro</>
                              ) : reports[0].total_profit < 0 ? (
                                <><ArrowDown className="h-3 w-3 mr-1" /> Prejuízo</>
                              ) : (
                                <><Minus className="h-3 w-3 mr-1" /> Neutro</>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {metrics.map((metric) => (
                      <Card key={metric.id} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                        <CardHeader className="pb-2 px-3 sm:px-4 py-3">
                          <CardTitle className="text-sm sm:text-lg">{metric.metric_name}</CardTitle>
                          <CardDescription className="text-xs">{metric.metric_type}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-4 pb-3">
                          <div className="text-xl sm:text-2xl font-bold">
                            {metric.metric_type.includes('percentual') 
                              ? `${metric.value}%` 
                              : formatCurrency(metric.value)}
                          </div>
                          
                          {metric.comparison_value !== null && metric.percentage_change !== null && (
                            <div className={`text-xs sm:text-sm mt-1 flex items-center flex-wrap ${
                              metric.percentage_change > 0 ? 'text-green-500' : 
                              metric.percentage_change < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {metric.percentage_change > 0 ? (
                                <><ArrowUp className="h-3 w-3 mr-1 flex-shrink-0" /> {Math.abs(metric.percentage_change).toFixed(2)}%</>
                              ) : metric.percentage_change < 0 ? (
                                <><ArrowDown className="h-3 w-3 mr-1 flex-shrink-0" /> {Math.abs(metric.percentage_change).toFixed(2)}%</>
                              ) : (
                                <><Minus className="h-3 w-3 mr-1 flex-shrink-0" /> 0%</>
                              )}
                              <span className="ml-1 text-xs">vs período anterior</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
