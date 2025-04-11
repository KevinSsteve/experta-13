
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, LineChart, BarChart, FilePenLine, FileBarChart, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [activeTab, setActiveTab] = useState("relatorios");
  
  const { data: reports, isLoading: isLoadingReports, error: reportsError } = useQuery({
    queryKey: ["financial-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as FinancialReport[];
    },
  });

  const { data: metrics, isLoading: isLoadingMetrics, error: metricsError } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_metrics")
        .select("*");
      
      if (error) throw error;
      return data as FinancialMetric[];
    },
  });

  useEffect(() => {
    if (reportsError) {
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar os relatórios financeiros.",
        variant: "destructive",
      });
    }

    if (metricsError) {
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar as métricas financeiras.",
        variant: "destructive",
      });
    }
  }, [reportsError, metricsError, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Resultados Financeiros</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="default" size="sm">
              <FilePenLine className="mr-2 h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="relatorios">
              <FileBarChart className="mr-2 h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="graficos">
              <PieChart className="mr-2 h-4 w-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="metricas">
              <BarChart className="mr-2 h-4 w-4" />
              Métricas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="relatorios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Financeiros</CardTitle>
                <CardDescription>
                  Visão geral dos relatórios financeiros do seu negócio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="flex justify-center py-8">
                    <p>Carregando relatórios...</p>
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum relatório encontrado.</p>
                    <Button variant="outline" className="mt-4">
                      <FilePenLine className="mr-2 h-4 w-4" />
                      Criar Primeiro Relatório
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
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
                          <TableRow key={report.id}>
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="graficos">
            <Card>
              <CardHeader>
                <CardTitle>Visualização Gráfica</CardTitle>
                <CardDescription>
                  Analise seus resultados financeiros através de gráficos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Visualização gráfica em desenvolvimento.
                  </p>
                  <LineChart size={64} className="mx-auto text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metricas">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Financeiras</CardTitle>
                <CardDescription>
                  Indicadores-chave de performance financeira.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="flex justify-center py-8">
                    <p>Carregando métricas...</p>
                  </div>
                ) : !metrics || metrics.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma métrica encontrada.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.map((metric) => (
                      <Card key={metric.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{metric.metric_name}</CardTitle>
                          <CardDescription>{metric.metric_type}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {metric.metric_type.includes('percentual') 
                              ? `${metric.value}%` 
                              : formatCurrency(metric.value)}
                          </div>
                          
                          {metric.comparison_value !== null && metric.percentage_change !== null && (
                            <div className={`text-sm mt-1 ${
                              metric.percentage_change > 0 ? 'text-green-500' : 
                              metric.percentage_change < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {metric.percentage_change > 0 ? '↑' : 
                               metric.percentage_change < 0 ? '↓' : '→'} 
                              {Math.abs(metric.percentage_change).toFixed(2)}% em relação ao período anterior
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
