
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown, ShoppingCart, CreditCard, Package } from "lucide-react";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Stats {
  totalSales: number;
  totalExpenses: number;
  totalProducts: number;
  todaySales: number;
  todayExpenses: number;
  recentSales: any[];
  recentExpenses: any[];
}

export function ExpertaGoStats() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    totalExpenses: 0,
    totalProducts: 0,
    todaySales: 0,
    todayExpenses: 0,
    recentSales: [],
    recentExpenses: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Buscar vendas
      const { data: sales } = await supabase
        .from('experta_go_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar despesas
      const { data: expenses } = await supabase
        .from('experta_go_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar produtos
      const { data: products } = await supabase
        .from('experta_go_products')
        .select('*')
        .eq('user_id', user.id);

      // Calcular estatísticas
      const today = new Date().toISOString().split('T')[0];
      
      const totalSales = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const totalProducts = products?.length || 0;
      
      const todaySales = sales?.filter(sale => 
        sale.sale_date.split('T')[0] === today
      ).reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      const todayExpenses = expenses?.filter(expense => 
        expense.expense_date.split('T')[0] === today
      ).reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      setStats({
        totalSales,
        totalExpenses,
        totalProducts,
        todaySales,
        todayExpenses,
        recentSales: sales?.slice(0, 5) || [],
        recentExpenses: expenses?.slice(0, 5) || []
      });

    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.todaySales.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total geral: {stats.totalSales.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.todayExpenses.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total geral: {stats.totalExpenses.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos únicos registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atividades recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSales.length > 0 ? (
                stats.recentSales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{sale.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(new Date(sale.created_at), new Date(), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {Number(sale.total_amount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.quantity}x
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Despesas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentExpenses.length > 0 ? (
                stats.recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(new Date(expense.created_at), new Date(), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {Number(expense.amount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma despesa registrada ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
