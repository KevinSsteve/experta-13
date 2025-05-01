
import { supabase } from '@/integrations/supabase/client';
import { SupermarketProduct } from './types';

export async function getSupermarketProducts(): Promise<SupermarketProduct[]> {
  try {
    const { data, error } = await supabase
      .from('supermarket_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching supermarket products:", error);
      return [];
    }

    return data as SupermarketProduct[];
  } catch (error) {
    console.error("Exception fetching supermarket products:", error);
    return [];
  }
}

export async function getSupermarketProduct(id: string): Promise<SupermarketProduct | null> {
  try {
    const { data, error } = await supabase
      .from('supermarket_products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching supermarket product:", error);
      return null;
    }

    return data as SupermarketProduct;
  } catch (error) {
    console.error("Exception fetching supermarket product:", error);
    return null;
  }
}

export async function createSupermarketProduct(product: Omit<SupermarketProduct, 'id' | 'created_at' | 'updated_at'>): Promise<SupermarketProduct | null> {
  try {
    const { data, error } = await supabase
      .from('supermarket_products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error("Error creating supermarket product:", error);
      return null;
    }

    return data as SupermarketProduct;
  } catch (error) {
    console.error("Exception creating supermarket product:", error);
    return null;
  }
}

export async function updateSupermarketProduct(id: string, product: Partial<SupermarketProduct>): Promise<SupermarketProduct | null> {
  try {
    const { data, error } = await supabase
      .from('supermarket_products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating supermarket product:", error);
      return null;
    }

    return data as SupermarketProduct;
  } catch (error) {
    console.error("Exception updating supermarket product:", error);
    return null;
  }
}

export async function deleteSupermarketProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('supermarket_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting supermarket product:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting supermarket product:", error);
    return false;
  }
}
