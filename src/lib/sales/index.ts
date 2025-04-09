
import { Sale, DailySales, SalesByCategory, SalesKPIs, SalesSummary, CustomerInfo } from './types';
import { fetchSalesFromSupabase, adaptSupabaseSale } from './adapters';
import { generateSalesData } from './generators';
import { getDailySales, getSalesByCategory, calculateSalesKPIs } from './analytics';
import { getSalesFromStorage } from '../utils';

// Re-export types for external use
export * from './types';

// Função para obter as vendas
export async function getSalesData(userId?: string): Promise<Sale[]> {
  try {
    // Primeiro, tenta buscar do Supabase com filtro de usuário se fornecido
    const supabaseSales = await fetchSalesFromSupabase(userId);
    if (supabaseSales && supabaseSales.length > 0) {
      return supabaseSales;
    }
    
    // Se não encontrar no Supabase, usa armazenamento local
    // (Isso seria removido em um ambiente de produção)
    const storedSales = getSalesFromStorage();
    if (storedSales && storedSales.length > 0) {
      return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Só deve chegar aqui durante o desenvolvimento ou se não houver vendas
    return []; // Não gerar mais dados simulados
  } catch (error) {
    console.error('Erro ao obter dados de vendas:', error);
    return []; // Não gerar mais dados simulados em caso de erro
  }
}

// Função para obter as vendas dos últimos X dias
export async function getRecentSales(days: number = 7, userId?: string): Promise<Sale[]> {
  const salesData = await getSalesData(userId);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  
  return salesData.filter(sale => new Date(sale.date) >= cutoff);
}

// Função wrapper para obter vendas diárias
export async function fetchDailySales(days: number = 7, userId?: string): Promise<DailySales[]> {
  const sales = await getSalesData(userId);
  return getDailySales(sales, days);
}

// Função wrapper para obter vendas por categoria
export async function fetchSalesByCategory(userId?: string): Promise<SalesByCategory[]> {
  const sales = await getSalesData(userId);
  return getSalesByCategory(sales);
}

// Função para calcular KPIs
export async function getSalesKPIs(days: number = 7, userId?: string): Promise<SalesKPIs> {
  // Obter vendas para o período atual
  const recentSales = await getRecentSales(days, userId);
  
  // Obter vendas para o período anterior
  const previousDays = days * 2;
  const allSales = await getRecentSales(previousDays, userId);
  const previousPeriodSales = allSales.slice(recentSales.length);
  
  return calculateSalesKPIs(recentSales, previousPeriodSales);
}
