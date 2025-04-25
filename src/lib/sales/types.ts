import { CartItem } from "@/contexts/CartContext";
import { Json } from "@/integrations/supabase/types";

// Interface para informações do cliente
export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string; // NIF (Número de Identificação Fiscal) para SAFT Angola
}

// Interface para representar uma venda
export interface Sale {
  id: string;
  date: string;
  customer: string | CustomerInfo;
  items: CartItem[] | number;
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number; // Added change property that was missing
  notes?: string;
  user_id?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
    image?: string;
    category?: string; // Added category property to support analytics
    purchase_price?: number; // Add purchase_price property
    product?: any; // Support for nested product structure
  }>
}

// Tipo para o resumo de vendas
export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesByDay: Record<string, number>;
  salesByCategory: Record<string, number>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

// Adding the missing type exports that are used in analytics and components
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
  totalCost: number;
  totalSales: number;
  averageTicket: number;
  revenueChange: number;
  salesChange: number;
  ticketChange: number;
  profitChange: number;
  marginChange: number;
}

// Interface para notas de crédito
export interface CreditNote {
  id: string;
  original_sale_id: string;
  date: string;
  reason: string;
  observations?: string | null;
  total: number;
  items: Json;
  user_id: string;
  customer: Json | null;
  status: 'pending' | 'approved' | 'rejected';
}
