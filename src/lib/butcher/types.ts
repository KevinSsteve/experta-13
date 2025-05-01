
export interface MeatCut {
  id: string;
  name: string;
  animal_type: string;
  price_per_kg: number;
  cost_per_kg: number;
  stock_weight: number;
  description?: string;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export interface MeatProduct {
  id: string;
  name: string;
  animalType: string;
  cutType?: string;
  pricePerKg: number;
  stock: number;
  expirationDate?: Date;
  description?: string;
  code?: string;
}

export type AnimalType = 'beef' | 'pork' | 'lamb' | 'chicken' | 'goat' | 'game';

export const animalTypeLabels: Record<string, string> = {
  'beef': 'Bovino',
  'pork': 'Suíno',
  'lamb': 'Cordeiro/Carneiro',
  'chicken': 'Frango',
  'goat': 'Caprino',
  'game': 'Caça'
};
