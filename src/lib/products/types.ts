
import { Product as CartProduct } from '@/contexts/CartContext';

// Re-export the Product type so it can be imported directly from this file
export type Product = CartProduct & {
  purchase_price?: number;  // Changed from required to optional to match CartContext
  profit_margin?: number;
};
