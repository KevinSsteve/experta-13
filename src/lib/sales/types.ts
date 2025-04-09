
import { CartItem } from "@/contexts/CartContext";

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
  notes?: string;
  user_id?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
    image?: string;
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
