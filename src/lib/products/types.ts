
import { Product as CartProduct } from '@/contexts/CartContext';

// Re-export the Product type so it can be imported directly from this file
export type Product = CartProduct & {
  purchase_price?: number;
  profit_margin?: number;
};
