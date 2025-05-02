
import { Product as CartProduct } from '@/contexts/CartContext';
import { Database } from '@/integrations/supabase/database.types';

// Re-export the Product type so it can be imported directly from this file
export type ProductFromSupabase = Database['public']['Tables']['products']['Row'];
export type Product = CartProduct & {
  purchase_price: number;
  profit_margin?: number;
};
