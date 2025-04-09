
import { CartItem } from '@/contexts/CartContext';

// Sale data interfaces
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
  user_id?: string;  // Added user_id property
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

export interface SalesKPIs {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  revenueChange: number;
  salesChange: number;
  ticketChange: number;
}
