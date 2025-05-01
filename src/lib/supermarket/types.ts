
export interface SupermarketProduct {
  id: string;
  name: string;
  category_type: string;
  price: number;
  cost: number;
  stock: number;
  description?: string;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  expiry_date?: string;
  brand?: string;
  unit?: string; // kg, unidade, pacote, etc.
  discount_percentage?: number;
  featured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  expirationDate?: Date;
  description?: string;
  code?: string;
  brand?: string;
  unit?: string;
  discount?: number;
  featured?: boolean;
}

export type CategoryType = 'groceries' | 'dairy' | 'meat' | 'produce' | 'bakery' | 'beverages' | 'household' | 'personal' | 'frozen' | 'snacks';

export const categoryTypeLabels: Record<string, string> = {
  'groceries': 'Mercearia',
  'dairy': 'Lacticínios',
  'meat': 'Carnes',
  'produce': 'Frutas e Legumes',
  'bakery': 'Padaria',
  'beverages': 'Bebidas',
  'household': 'Produtos Domésticos',
  'personal': 'Higiene Pessoal',
  'frozen': 'Congelados',
  'snacks': 'Petiscos e Snacks'
};

// Imagens para as diferentes categorias
export const categoryTypeImages: Record<string, string> = {
  'groceries': '/images/supermarket/groceries.jpg',
  'dairy': '/images/supermarket/dairy.jpg',
  'meat': '/images/supermarket/meat.jpg',
  'produce': '/images/supermarket/produce.jpg',
  'bakery': '/images/supermarket/bakery.jpg',
  'beverages': '/images/supermarket/beverages.jpg',
  'household': '/images/supermarket/household.jpg',
  'personal': '/images/supermarket/personal.jpg',
  'frozen': '/images/supermarket/frozen.jpg',
  'snacks': '/images/supermarket/snacks.jpg'
};
