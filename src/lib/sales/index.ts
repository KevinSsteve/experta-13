
import { Sale, DailySales, SalesByCategory, SalesKPIs } from './types';
import { fetchSalesFromSupabase, adaptSupabaseSale } from './adapters';
import { generateSalesData } from './generators';
import { getDailySales, getSalesByCategory, calculateSalesKPIs } from './analytics';
import { getSalesFromStorage } from '../utils';

// Re-export types for external use
export * from './types';

// Função para obter as vendas
export async function getSalesData(): Promise<Sale[]> {
  try {
    // Primeiro, tenta buscar do Supabase
    const supabaseSales = await fetchSalesFromSupabase();
    if (supabaseSales && supabaseSales.length > 0) {
      return supabaseSales;
    }
    
    // Se não encontrar no Supabase, usa armazenamento local
    const storedSales = getSalesFromStorage();
    if (storedSales && storedSales.length > 0) {
      return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Caso contrário, gera dados simulados
    return generateSalesData();
  } catch (error) {
    console.error('Erro ao obter dados de vendas:', error);
    return generateSalesData();
  }
}

// Função para obter as vendas dos últimos X dias
export async function getRecentSales(days: number = 7): Promise<Sale[]> {
  const salesData = await getSalesData();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  
  return salesData.filter(sale => new Date(sale.date) >= cutoff);
}

// Função wrapper para obter vendas diárias
export async function fetchDailySales(days: number = 7): Promise<DailySales[]> {
  const sales = await getSalesData();
  return getDailySales(sales, days);
}

// Função wrapper para obter vendas por categoria
export async function fetchSalesByCategory(): Promise<SalesByCategory[]> {
  const sales = await getSalesData();
  return getSalesByCategory(sales);
}

// Função para calcular KPIs
export async function getSalesKPIs(days: number = 7): Promise<SalesKPIs> {
  // Obter vendas para o período atual
  const recentSales = await getRecentSales(days);
  
  // Obter vendas para o período anterior
  const previousDays = days * 2;
  const allSales = await getRecentSales(previousDays);
  const previousPeriodSales = allSales.slice(recentSales.length);
  
  return calculateSalesKPIs(recentSales, previousPeriodSales);
}
