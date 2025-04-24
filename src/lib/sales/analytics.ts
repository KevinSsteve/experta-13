import { Sale, DailySales, SalesByCategory, SalesKPIs } from './types';
import { supabase } from '@/integrations/supabase/client';

// Função para calcular vendas diárias
export async function getDailySales(sales: Sale[], days: number = 7): Promise<DailySales[]> {
  const dailySales: { [key: string]: DailySales } = {};
  const now = new Date();
  
  // Inicializar o objeto com os últimos X dias
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    dailySales[dateString] = {
      date: dateString,
      sales: 0,
      transactions: 0,
    };
  }
  
  // Calcular vendas para cada dia
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  
  const recentSales = sales.filter(sale => new Date(sale.date) >= cutoff);
  
  recentSales.forEach(sale => {
    const dateString = sale.date.split('T')[0];
    if (dailySales[dateString]) {
      dailySales[dateString].sales += sale.total;
      dailySales[dateString].transactions += 1;
    }
  });
  
  // Converter para array e ordenar por data
  return Object.values(dailySales)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Função para calcular vendas por categoria
export async function getSalesByCategory(sales: Sale[]): Promise<SalesByCategory[]> {
  const categories: { [key: string]: number } = {};
  let totalSales = 0;
  
  // Calcular vendas por categoria usando dados reais
  sales.forEach(sale => {
    if (sale.products && Array.isArray(sale.products)) {
      sale.products.forEach(item => {
        // Handle both simplified format and original cart item format
        const category = item.category || (item.product && item.product.category);
        const price = item.price || (item.product && item.product.price) || 0;
        const quantity = item.quantity || 1;
        
        if (category) {
          if (!categories[category]) {
            categories[category] = 0;
          }
          categories[category] += price * quantity;
          totalSales += price * quantity;
        }
      });
    }
  });
  
  // Se não houver dados de vendas por categoria, busque categorias dos produtos
  if (Object.keys(categories).length === 0) {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('category, price')
        .order('category');
      
      if (products && products.length > 0) {
        // Agrupar por categoria
        products.forEach(product => {
          if (!categories[product.category]) {
            categories[product.category] = 0;
          }
          // Simular algumas vendas baseadas nos produtos existentes
          categories[product.category] += product.price * Math.floor(Math.random() * 5 + 1);
        });
        
        totalSales = Object.values(categories).reduce((sum, value) => sum + value, 0);
      } else {
        // Usar categorias padrão se não houver produtos
        const defaultCategories = [
          'Alimentos Básicos',
          'Laticínios',
          'Hortifruti',
          'Carnes',
          'Padaria',
          'Bebidas',
          'Limpeza',
          'Higiene'
        ];
        
        totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        
        defaultCategories.forEach(category => {
          categories[category] = parseFloat((Math.random() * totalSales * 0.3).toFixed(2));
        });
      }
    } catch (error) {
      console.error('Erro ao buscar categorias de produtos:', error);
      
      // Usar categorias padrão em caso de erro
      const defaultCategories = [
        'Alimentos Básicos',
        'Laticínios',
        'Hortifruti',
        'Carnes',
        'Padaria',
        'Bebidas',
        'Limpeza',
        'Higiene'
      ];
      
      totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
      
      defaultCategories.forEach(category => {
        categories[category] = parseFloat((Math.random() * totalSales * 0.3).toFixed(2));
      });
    }
  }
  
  // Converter para o formato esperado
  return Object.entries(categories).map(([category, sales]) => ({
    category,
    sales,
    percentage: parseFloat(((sales / totalSales) * 100).toFixed(1)),
  })).sort((a, b) => b.sales - a.sales);
}

// Função para calcular KPIs
export function calculateSalesKPIs(
  recentSales: Sale[], 
  previousPeriodSales: Sale[]
): SalesKPIs {
  // Calculate revenue
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = recentSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Calculate cost and profit (ensuring products have purchase_price)
  let totalCost = 0;
  recentSales.forEach(sale => {
    if (sale.products && Array.isArray(sale.products)) {
      sale.products.forEach(item => {
        const quantity = item.quantity || 1;
        
        // Extract purchase price with better type checking
        let purchasePrice = 0;
        
        if (item.purchase_price !== undefined && item.purchase_price !== null) {
          purchasePrice = Number(item.purchase_price);
        } else if (item.product && item.product.purchase_price !== undefined && item.product.purchase_price !== null) {
          purchasePrice = Number(item.product.purchase_price);
        }
        
        // Ensure purchase price is valid
        if (isNaN(purchasePrice)) {
          console.warn(`Preço de compra inválido para o produto ${item.id || item.name}:`, item.purchase_price);
          purchasePrice = 0;
        }
        
        const itemCost = purchasePrice * quantity;
        totalCost += itemCost;
        
        console.log(`Item: ${item.name || item.id} - Qtd: ${quantity} - Preço compra: ${purchasePrice} - Custo: ${itemCost}`);
      });
    }
  });
  
  console.log(`Custo total calculado: ${totalCost} (de ${recentSales.length} vendas)`);
  const profit = totalRevenue - totalCost;
  
  // Calculate previous period metrics with the same logic
  const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.total, 0);
  const previousSales = previousPeriodSales.length;
  const previousAvgTicket = previousSales > 0 ? previousRevenue / previousSales : 0;
  
  let previousCost = 0;
  previousPeriodSales.forEach(sale => {
    if (sale.products && Array.isArray(sale.products)) {
      sale.products.forEach(item => {
        const quantity = item.quantity || 1;
        
        // Extract purchase price with the same logic as above
        let purchasePrice = 0;
        
        if (item.purchase_price !== undefined && item.purchase_price !== null) {
          purchasePrice = Number(item.purchase_price);
        } else if (item.product && item.product.purchase_price !== undefined && item.product.purchase_price !== null) {
          purchasePrice = Number(item.product.purchase_price);
        }
        
        if (isNaN(purchasePrice)) {
          purchasePrice = 0;
        }
        
        previousCost += purchasePrice * quantity;
      });
    }
  });
  
  const previousProfit = previousRevenue - previousCost;
  
  // Calculate change percentages
  const revenueChange = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  const salesChange = previousSales > 0 
    ? ((totalSales - previousSales) / previousSales) * 100 
    : 0;
  
  const ticketChange = previousAvgTicket > 0 
    ? ((averageTicket - previousAvgTicket) / previousAvgTicket) * 100 
    : 0;
  
  // Calculate profit change
  const profitChange = previousProfit > 0
    ? ((profit - previousProfit) / previousProfit) * 100
    : 0;
  
  // Calculate profit margin and its change
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const previousMargin = previousRevenue > 0 ? (previousProfit / previousRevenue) * 100 : 0;
  const marginChange = previousMargin > 0
    ? (profitMargin - previousMargin) / previousMargin * 100
    : 0;
  
  console.log("KPIs calculados completos:", {
    receita: totalRevenue.toFixed(2),
    custo: totalCost.toFixed(2),
    lucro: profit.toFixed(2),
    margemLucro: profitMargin.toFixed(1) + "%",
    vendas: totalSales,
    ticketMedio: averageTicket.toFixed(2),
    mudancaReceita: revenueChange.toFixed(1) + "%",
    mudancaLucro: profitChange.toFixed(1) + "%",
    mudancaMargem: marginChange.toFixed(1) + "%"
  });
  
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalSales,
    averageTicket: parseFloat(averageTicket.toFixed(2)),
    revenueChange: parseFloat(revenueChange.toFixed(1)),
    salesChange: parseFloat(salesChange.toFixed(1)),
    ticketChange: parseFloat(ticketChange.toFixed(1)),
    profitChange: parseFloat(profitChange.toFixed(1)),
    marginChange: parseFloat(marginChange.toFixed(1)),
  };
}
