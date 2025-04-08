
import { getSalesFromStorage } from './utils';
import { supabase } from '@/integrations/supabase/client';

// Dados de vendas simulados para o dashboard

export interface Sale {
  id: string;
  date: string;
  total: number;
  amountPaid?: number;
  change?: number;
  items: any; // Using any here to match the shape from Supabase
  paymentMethod: string;
  customer?: string;
}

export interface DailySales {
  date: string;
  sales: number;
  transactions: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  percentage: number;
}

// Função para obter as vendas
async function getSalesData(): Promise<Sale[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sales from Supabase:', error);
      return generateSalesData();
    }
    
    // Se houver vendas armazenadas, use-as
    if (data && data.length > 0) {
      return data.map(sale => ({
        ...sale,
        amountPaid: sale.amount_paid,
        paymentMethod: sale.paymentMethod || 'Dinheiro',
      }));
    }
    
    // Caso contrário, gere dados simulados
    return generateSalesData();
  } catch (error) {
    console.error('Error in getSalesData:', error);
    return generateSalesData();
  }
}

// Função para gerar dados aleatórios de vendas dos últimos 30 dias
function generateSalesData(): Sale[] {
  const sales: Sale[] = [];
  const paymentMethods = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix'];
  
  // Data atual
  const now = new Date();
  
  // Gerar vendas para os últimos 30 dias
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    const items = Math.floor(Math.random() * 10) + 1;
    const total = parseFloat((Math.random() * 500 + 10).toFixed(2));
    const amountPaid = parseFloat((total + Math.random() * 50).toFixed(2));
    
    sales.push({
      id: `sale-${i + 1}`,
      date: date.toISOString(),
      total,
      amountPaid,
      change: amountPaid - total,
      items, // Note: This is different from the Supabase schema, but used for generated data
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      customer: Math.random() > 0.3 ? `Cliente ${Math.floor(Math.random() * 100) + 1}` : undefined,
    });
  }
  
  // Ordenar por data (mais recente primeiro)
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

let cachedSalesData: Sale[] | null = null;
let cachedSalesTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Função para obter as vendas dos últimos X dias
export async function getRecentSales(days: number = 7): Promise<Sale[]> {
  const now = Date.now();
  if (!cachedSalesData || now - cachedSalesTimestamp > CACHE_DURATION) {
    cachedSalesData = await getSalesData();
    cachedSalesTimestamp = now;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return cachedSalesData.filter(sale => new Date(sale.date) >= cutoffDate);
}

// Função para calcular vendas diárias
export async function getDailySales(days: number = 7): Promise<DailySales[]> {
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
  const recentSales = await getRecentSales(days);
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
export async function getSalesByCategory(): Promise<SalesByCategory[]> {
  const categories: { [key: string]: number } = {};
  let totalSales = 0;
  
  const sales = await getSalesData();
  
  // Calcular vendas por categoria usando dados reais
  for (const sale of sales) {
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach((item: any) => {
        if (item.product && item.product.category) {
          const category = item.product.category;
          if (!categories[category]) {
            categories[category] = 0;
          }
          categories[category] += (item.product.price * item.quantity) || 0;
          totalSales += (item.product.price * item.quantity) || 0;
        }
      });
    }
  }
  
  // Se não houver dados de vendas por categoria, use categorias simuladas
  if (Object.keys(categories).length === 0) {
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
  
  // Converter para o formato esperado
  return Object.entries(categories).map(([category, sales]) => ({
    category,
    sales,
    percentage: parseFloat(((sales / totalSales) * 100).toFixed(1)),
  })).sort((a, b) => b.sales - a.sales);
}

// Função para calcular KPIs
export async function getSalesKPIs(days: number = 7) {
  const recentSales = await getRecentSales(days);
  
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = recentSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Comparar com o período anterior
  const previousPeriodSales = await getRecentSales(days * 2);
  const filtered = previousPeriodSales.slice(recentSales.length);
  const previousRevenue = filtered.reduce((sum, sale) => sum + sale.total, 0);
  const previousSales = filtered.length;
  const previousAvgTicket = previousSales > 0 ? previousRevenue / previousSales : 0;
  
  const revenueChange = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  const salesChange = previousSales > 0 
    ? ((totalSales - previousSales) / previousSales) * 100 
    : 0;
  
  const ticketChange = previousAvgTicket > 0 
    ? ((averageTicket - previousAvgTicket) / previousAvgTicket) * 100 
    : 0;
  
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalSales,
    averageTicket: parseFloat(averageTicket.toFixed(2)),
    revenueChange: parseFloat(revenueChange.toFixed(1)),
    salesChange: parseFloat(salesChange.toFixed(1)),
    ticketChange: parseFloat(ticketChange.toFixed(1)),
  };
}

export default getSalesData;
