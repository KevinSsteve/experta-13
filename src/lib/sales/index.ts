
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
    // First, try to fetch from Supabase with user filter if provided
    const supabaseSales = await fetchSalesFromSupabase(userId);
    
    // If we have data from Supabase, return it
    if (supabaseSales && supabaseSales.length > 0) {
      console.log(`Found ${supabaseSales.length} sales in Supabase for user ${userId || 'anonymous'}`);
      return supabaseSales;
    }
    
    // If no data from Supabase, check local storage
    // (This would be removed in a production environment)
    const storedSales = getSalesFromStorage();
    if (storedSales && storedSales.length > 0) {
      console.log(`Found ${storedSales.length} sales in local storage`);
      return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Should only reach here during development or if there are no sales
    console.log('No sales found in Supabase or local storage');
    return [];
  } catch (error) {
    console.error('Error getting sales data:', error);
    
    // Try local storage as a fallback in case of Supabase error
    try {
      const storedSales = getSalesFromStorage();
      if (storedSales && storedSales.length > 0) {
        console.log('Using local storage sales data as fallback due to error');
        return storedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (localError) {
      console.error('Error getting local storage sales:', localError);
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
    // Get sales for current period
    const recentSales = await getRecentSales(days, userId);
    
    // Get sales for previous period
    const previousDays = days * 2;
    const allSales = await getRecentSales(previousDays, userId);
    const previousPeriodSales = allSales.slice(recentSales.length);
    
    return calculateSalesKPIs(recentSales, previousPeriodSales);
  } catch (error) {
    console.error('Error calculating sales KPIs:', error);
    // Return empty KPIs with zero values instead of throwing
    return {
      totalRevenue: 0,
      totalSales: 0,
      averageTicket: 0,
      revenueChange: 0,
      salesChange: 0,
      ticketChange: 0
    };
  }
}
