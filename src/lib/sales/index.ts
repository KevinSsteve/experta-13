import { Sale, DailySales, SalesByCategory, SalesKPIs, SalesSummary, CustomerInfo } from './types';
import { fetchSalesFromSupabase, adaptSupabaseSale } from './adapters';
import { generateSalesData } from './generators';
import { getDailySales, getSalesByCategory, calculateSalesKPIs } from './analytics';
import { getSalesFromStorage } from '../utils';

// Re-export types for external use
export * from './types';

// Function to get sales data
export async function getSalesData(userId?: string): Promise<Sale[]> {
  try {
    console.log(`Buscando dados de vendas para usuário: ${userId || 'anônimo'}`);
    
    // Verifique se temos um ID de usuário
    if (!userId) {
      console.warn('getSalesData: Nenhum ID de usuário fornecido, retornando dados locais');
      const storedSales = getSalesFromStorage();
      return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Primeiro, tente buscar do Supabase com filtro de usuário
    const supabaseSales = await fetchSalesFromSupabase(userId);
    
    // Se temos dados do Supabase, retorne-os
    if (supabaseSales && supabaseSales.length > 0) {
      console.log(`Encontradas ${supabaseSales.length} vendas no Supabase para usuário ${userId}`);
      return supabaseSales;
    }
    
    console.log(`Nenhuma venda encontrada no Supabase para usuário ${userId}, verificando localStorage`);
    
    // Se não há dados do Supabase, verifique o localStorage
    // (Isso seria removido em um ambiente de produção)
    const storedSales = getSalesFromStorage();
    if (storedSales && storedSales.length > 0) {
      console.log(`Encontradas ${storedSales.length} vendas no localStorage`);
      return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Só deve chegar aqui durante o desenvolvimento ou se não houver vendas
    console.log('Nenhuma venda encontrada no Supabase ou localStorage');
    return [];
  } catch (error) {
    console.error('Erro ao obter dados de vendas:', error);
    
    // Tente localStorage como fallback em caso de erro do Supabase
    try {
      const storedSales = getSalesFromStorage();
      if (storedSales && storedSales.length > 0) {
        console.log('Usando dados de vendas do localStorage como fallback devido a erro');
        return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (localError) {
      console.error('Erro ao obter vendas do localStorage:', localError);
    }
    
    return [];
  }
}

// Function to get sales from the last X days
export async function getRecentSales(days: number = 7, userId?: string): Promise<Sale[]> {
  const salesData = await getSalesData(userId);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  
  return salesData.filter(sale => new Date(sale.date) >= cutoff);
}

// Wrapper function to get daily sales
export async function fetchDailySales(days: number = 7, userId?: string): Promise<DailySales[]> {
  const sales = await getSalesData(userId);
  return getDailySales(sales, days);
}

// Wrapper function to get sales by category
export async function fetchSalesByCategory(userId?: string): Promise<SalesByCategory[]> {
  const sales = await getSalesData(userId);
  return getSalesByCategory(sales);
}

// Function to calculate KPIs
export async function getSalesKPIs(days: number = 7, userId?: string): Promise<SalesKPIs> {
  try {
    console.log(`Calculando KPIs para os últimos ${days} dias, usuário: ${userId || 'não definido'}`);
    // Get sales for current period
    const recentSales = await getRecentSales(days, userId);
    
    // Get sales for previous period
    const previousDays = days * 2;
    const allSales = await getRecentSales(previousDays, userId);
    const previousPeriodSales = allSales.slice(recentSales.length);
    
    console.log(`Dados obtidos: ${recentSales.length} vendas recentes, ${previousPeriodSales.length} vendas do período anterior`);
    
    if (recentSales.length === 0) {
      console.warn("Nenhuma venda recente encontrada para calcular KPIs");
    }
    
    // Verificando se há preços de compra definidos nas vendas
    if (recentSales.length > 0) {
      const sampleSale = recentSales[0];
      if (sampleSale.products && Array.isArray(sampleSale.products) && sampleSale.products.length > 0) {
        const sampleProduct = sampleSale.products[0];
        console.log("Exemplo de produto na venda:", {
          produto: sampleProduct.name || sampleProduct.id,
          temPrecoCusto: sampleProduct.purchase_price !== undefined,
          valorPrecoCusto: sampleProduct.purchase_price,
          temProdutoAninhado: sampleProduct.product !== undefined,
          produtoAninhado: sampleProduct.product
        });
      }
    }
    
    return calculateSalesKPIs(recentSales, previousPeriodSales);
  } catch (error) {
    console.error('Error calculating sales KPIs:', error);
    // Return empty KPIs with zero values instead of throwing
    return {
      totalRevenue: 0,
      totalCost: 0,
      totalSales: 0,
      averageTicket: 0,
      revenueChange: 0,
      salesChange: 0,
      ticketChange: 0,
      profitChange: 0,
      marginChange: 0
    };
  }
}
