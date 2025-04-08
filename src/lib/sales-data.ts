
import { getSalesFromStorage } from './utils';

// Dados de vendas simulados para o dashboard

export interface Sale {
  id: string;
  date: string;
  total: number;
  amountPaid?: number;
  change?: number;
  items: number;
  paymentMethod: string;
  customer?: string;
  products?: any[];
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
function getSalesData(): Sale[] {
  const storedSales = getSalesFromStorage();
  
  // Se houver vendas armazenadas, use-as
  if (storedSales && storedSales.length > 0) {
    return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Caso contrário, gere dados simulados
  return generateSalesData();
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
      items,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      customer: Math.random() > 0.3 ? `Cliente ${Math.floor(Math.random() * 100) + 1}` : undefined,
    });
  }
  
  // Ordenar por data (mais recente primeiro)
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const salesData = getSalesData();

// Função para obter as vendas dos últimos X dias
export function getRecentSales(days: number = 7): Sale[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  
  return salesData.filter(sale => new Date(sale.date) >= cutoff);
}

// Função para calcular vendas diárias
export function getDailySales(days: number = 7): DailySales[] {
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
  const recentSales = getRecentSales(days);
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
export function getSalesByCategory(): SalesByCategory[] {
  const categories: { [key: string]: number } = {};
  let totalSales = 0;
  
  // Calcular vendas por categoria usando dados reais
  salesData.forEach(sale => {
    if (sale.products) {
      sale.products.forEach(item => {
        const category = item.product.category;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += item.product.price * item.quantity;
        totalSales += item.product.price * item.quantity;
      });
    }
  });
  
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
    
    totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0);
    
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
export function getSalesKPIs(days: number = 7) {
  const recentSales = getRecentSales(days);
  
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = recentSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Comparar com o período anterior
  const previousPeriodSales = getRecentSales(days * 2).slice(recentSales.length);
  const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.total, 0);
  const previousSales = previousPeriodSales.length;
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

export default salesData;
