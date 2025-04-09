
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDailySales, 
  fetchSalesByCategory, 
  getSalesKPIs, 
  getRecentSales
} from '@/lib/sales';
import { getTopSellingProducts, getLowStockProducts } from '@/lib/products-data';

export const useDashboardData = (timeRange: string) => {
  const days = parseInt(timeRange);
  
  const kpisQuery = useQuery({
    queryKey: ['salesKpis', days],
    queryFn: () => getSalesKPIs(days)
  });
  
  const dailySalesQuery = useQuery({
    queryKey: ['dailySales', days],
    queryFn: () => fetchDailySales(days)
  });
  
  const salesByCategoryQuery = useQuery({
    queryKey: ['salesByCategory'],
    queryFn: () => fetchSalesByCategory()
  });
  
  const recentSalesQuery = useQuery({
    queryKey: ['recentSales'],
    queryFn: () => getRecentSales(5)
  });
  
  const topProductsQuery = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => getTopSellingProducts(5)
  });
  
  const lowStockProductsQuery = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: () => getLowStockProducts(10)
  });

  return {
    kpis: {
      data: kpisQuery.data,
      isLoading: kpisQuery.isLoading
    },
    dailySales: {
      data: dailySalesQuery.data,
      isLoading: dailySalesQuery.isLoading
    },
    salesByCategory: {
      data: salesByCategoryQuery.data,
      isLoading: salesByCategoryQuery.isLoading
    },
    recentSales: {
      data: recentSalesQuery.data,
      isLoading: recentSalesQuery.isLoading
    },
    topProducts: {
      data: topProductsQuery.data,
      isLoading: topProductsQuery.isLoading
    },
    lowStockProducts: {
      data: lowStockProductsQuery.data,
      isLoading: lowStockProductsQuery.isLoading
    }
  };
};
