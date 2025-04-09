
import { supabase } from '@/integrations/supabase/client';
import { formatDateISO, startOfPeriod, endOfPeriod } from '@/lib/utils';
import { Product } from '@/contexts/CartContext';

// Tipos de relatório de vendas
export type SalesReportItem = {
  period: string;
  total: number;
  count: number;
  average: number;
};

export type SalesReportCategoryItem = {
  category: string;
  total: number;
  quantity: number;
};

// Relatório de vendas
export async function getSalesReport(
  startDate: Date, 
  endDate: Date, 
  groupBy: 'daily' | 'weekly' | 'monthly' | 'category'
): Promise<SalesReportItem[] | SalesReportCategoryItem[]> {
  try {
    const formattedStartDate = formatDateISO(startDate);
    const formattedEndDate = formatDateISO(new Date(endDate.setHours(23, 59, 59)));

    // Buscar dados de vendas no Supabase
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }

    if (!sales || sales.length === 0) {
      return [];
    }

    // Se o agrupamento for por categoria
    if (groupBy === 'category') {
      const categoryMap = new Map<string, { total: number; quantity: number }>();

      // Analisar produtos vendidos em cada venda
      sales.forEach(sale => {
        const items = sale.items?.products || [];
        
        items.forEach((item: any) => {
          // Extrair categoria do produto
          const category = item.category || (item.product && item.product.category) || 'Sem categoria';
          const price = item.price || (item.product && item.product.price) || 0;
          const quantity = item.quantity || 1;
          
          // Acumular dados na categoria
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { total: 0, quantity: 0 });
          }
          
          const currentData = categoryMap.get(category)!;
          categoryMap.set(category, {
            total: currentData.total + (price * quantity),
            quantity: currentData.quantity + quantity
          });
        });
      });

      // Converter o Map para array de objetos
      return Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: data.total,
        quantity: data.quantity
      })).sort((a, b) => b.total - a.total);
    }
    
    // Para agrupamentos temporais (diário, semanal, mensal)
    const periodMap = new Map<string, { total: number; count: number }>();
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      let periodKey: string;
      
      // Determinar a chave do período baseado no agrupamento
      if (groupBy === 'daily') {
        periodKey = formatDateISO(saleDate).substring(0, 10);
      } else if (groupBy === 'weekly') {
        // Início da semana (domingo)
        const weekStart = startOfPeriod(saleDate, 'week');
        periodKey = formatDateISO(weekStart).substring(0, 10);
      } else { // monthly
        // Início do mês
        periodKey = formatDateISO(saleDate).substring(0, 7) + '-01';
      }
      
      // Acumular dados no período
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { total: 0, count: 0 });
      }
      
      const currentData = periodMap.get(periodKey)!;
      periodMap.set(periodKey, {
        total: currentData.total + sale.total,
        count: currentData.count + 1
      });
    });
    
    // Converter o Map para array de objetos
    return Array.from(periodMap.entries())
      .map(([period, data]) => ({
        period,
        total: data.total,
        count: data.count,
        average: data.total / data.count
      }))
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    throw error;
  }
}

// Relatório de estoque
export async function getInventoryReport(
  reportType: 'all' | 'low' | 'out' | 'category'
): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*');
    
    // Aplicar filtros com base no tipo de relatório
    if (reportType === 'low') {
      query = query.gt('stock', 0).lte('stock', 10);
    } else if (reportType === 'out') {
      query = query.eq('stock', 0);
    }
    
    // Executar a consulta
    const { data: products, error } = await query.order('category', { ascending: true }).order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    if (!products || products.length === 0) {
      return [];
    }
    
    if (reportType === 'category') {
      // Agrupar produtos por categoria
      return products.sort((a, b) => a.category.localeCompare(b.category));
    }
    
    return products;
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    throw error;
  }
}

// Relatório de lucros (simulação - em um sistema real, você teria custos dos produtos)
export async function getProfitReport(
  startDate: Date, 
  endDate: Date, 
  groupBy: 'daily' | 'weekly' | 'monthly' | 'category'
): Promise<any[]> {
  try {
    const formattedStartDate = formatDateISO(startDate);
    const formattedEndDate = formatDateISO(new Date(endDate.setHours(23, 59, 59)));
    
    // Buscar dados de vendas no Supabase
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar vendas para relatório de lucros:', error);
      throw error;
    }
    
    if (!sales || sales.length === 0) {
      return [];
    }
    
    // Como não temos os dados reais de custo, vamos simular uma margem de lucro
    // Em um sistema real, você usaria os dados reais de custo de cada produto
    const SIMULATE_COST_PERCENTAGE = 0.65; // 65% do preço é custo
    
    // Se o agrupamento for por categoria
    if (groupBy === 'category') {
      const categoryMap = new Map<string, { revenue: number; cost: number }>();
      
      // Analisar produtos vendidos em cada venda
      sales.forEach(sale => {
        const items = sale.items?.products || [];
        
        items.forEach((item: any) => {
          const category = item.category || (item.product && item.product.category) || 'Sem categoria';
          const price = item.price || (item.product && item.product.price) || 0;
          const quantity = item.quantity || 1;
          const revenue = price * quantity;
          const cost = revenue * SIMULATE_COST_PERCENTAGE;
          
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { revenue: 0, cost: 0 });
          }
          
          const currentData = categoryMap.get(category)!;
          categoryMap.set(category, {
            revenue: currentData.revenue + revenue,
            cost: currentData.cost + cost
          });
        });
      });
      
      // Converter o Map para array de objetos
      return Array.from(categoryMap.entries()).map(([category, data]) => {
        const profit = data.revenue - data.cost;
        const margin = (profit / data.revenue) * 100;
        
        return {
          category,
          revenue: data.revenue,
          cost: data.cost,
          profit,
          margin
        };
      }).sort((a, b) => b.profit - a.profit);
    }
    
    // Para agrupamentos temporais (diário, semanal, mensal)
    const periodMap = new Map<string, { revenue: number; cost: number }>();
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      let periodKey: string;
      
      // Determinar a chave do período baseado no agrupamento
      if (groupBy === 'daily') {
        periodKey = formatDateISO(saleDate).substring(0, 10);
      } else if (groupBy === 'weekly') {
        const weekStart = startOfPeriod(saleDate, 'week');
        periodKey = formatDateISO(weekStart).substring(0, 10);
      } else { // monthly
        periodKey = formatDateISO(saleDate).substring(0, 7) + '-01';
      }
      
      const revenue = sale.total;
      const cost = revenue * SIMULATE_COST_PERCENTAGE;
      
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { revenue: 0, cost: 0 });
      }
      
      const currentData = periodMap.get(periodKey)!;
      periodMap.set(periodKey, {
        revenue: currentData.revenue + revenue,
        cost: currentData.cost + cost
      });
    });
    
    // Converter o Map para array de objetos
    return Array.from(periodMap.entries())
      .map(([period, data]) => {
        const profit = data.revenue - data.cost;
        const margin = (profit / data.revenue) * 100;
        
        return {
          period,
          revenue: data.revenue,
          cost: data.cost,
          profit,
          margin
        };
      })
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
  } catch (error) {
    console.error('Erro ao gerar relatório de lucros:', error);
    throw error;
  }
}
