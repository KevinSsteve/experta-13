
import { supabase } from "@/integrations/supabase/client";

// Log current user
export const logCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    console.log('Current user:', user);
    return user;
  } catch (error) {
    console.error('Exception in logCurrentUser:', error);
    return null;
  }
};

// Add multiple public products to the database
export const addMultiplePublicProducts = async (products: any[], userId: string) => {
  try {
    // Map the products to include user_id and is_public flag
    const productsWithUserId = products.map(product => ({
      ...product,
      user_id: userId,
      is_public: true,
      stock: product.stock || 0,
      image: product.image || '/placeholder.svg'
    }));
    
    // Insert the products into the database
    const { data, error } = await supabase
      .from('products')
      .insert(productsWithUserId)
      .select();
    
    if (error) {
      console.error('Error adding multiple products:', error);
      throw error;
    }
    
    console.log('Multiple products added successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in addMultiplePublicProducts:', error);
    throw error;
  }
};

// Get sales report data
export const getSalesReportData = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error getting sales report data:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getSalesReportData:', error);
    throw error;
  }
};

// Generate sales report
export const generateSalesReport = async (userId: string, days: number = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
    
    // Calculate report metrics
    const total = data.reduce((sum, sale) => sum + sale.total, 0);
    const count = data.length;
    const average = count > 0 ? total / count : 0;
    
    // Create a financial report entry
    const reportData = {
      title: `Financial Report for last ${days} days`,
      description: `Sales report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      total_revenue: total,
      average_sale: average,
      sales_count: count,
      user_id: userId,
      report_type: 'sales_summary',
      metrics: {
        total_revenue: total,
        sales_count: count,
        average_sale: average,
        period_days: days
      }
    };
    
    // Insert the report into financial_reports table if it exists
    try {
      const { data: reportInsertData, error: reportInsertError } = await supabase
        .from('financial_reports')
        .insert([reportData])
        .select();
        
      if (reportInsertError) {
        console.warn('Could not insert financial report (table may not exist):', reportInsertError);
      } else {
        console.log('Financial report created:', reportInsertData);
      }
    } catch (reportInsertError) {
      console.warn('Exception inserting financial report:', reportInsertError);
    }
    
    return {
      period: {
        start: startDate,
        end: endDate,
        days: days
      },
      metrics: {
        total_revenue: total,
        sales_count: count,
        average_sale: average
      },
      data: data
    };
  } catch (error) {
    console.error('Exception in generateSalesReport:', error);
    throw error;
  }
};
