
import { supabase } from '@/integrations/supabase/client';
import { SupermarketProduct } from './types';

export async function getSupermarketProducts(): Promise<SupermarketProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching supermarket products:", error);
      return [];
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      cost: product.purchase_price || 0,
      stock: product.stock || 0,
      category_type: product.category,
      description: product.description || '',
      barcode: product.code || '',
      user_id: product.user_id,
      created_at: product.created_at,
      updated_at: product.updated_at,
      brand: '', // Default values for fields not in the database
      unit: '',
      discount_percentage: 0,
      featured: false,
      expiry_date: ''
    })) as SupermarketProduct[];
  } catch (error) {
    console.error("Exception fetching supermarket products:", error);
    return [];
  }
}

export async function getSupermarketProduct(id: string): Promise<SupermarketProduct | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching supermarket product:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      price: data.price,
      cost: data.purchase_price || 0,
      stock: data.stock || 0,
      category_type: data.category,
      description: data.description || '',
      barcode: data.code || '',
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      brand: '', // Default values for fields not in the database
      unit: '',
      discount_percentage: 0,
      featured: false,
      expiry_date: ''
    } as SupermarketProduct;
  } catch (error) {
    console.error("Exception fetching supermarket product:", error);
    return null;
  }
}

export async function createSupermarketProduct(product: Omit<SupermarketProduct, 'id' | 'created_at' | 'updated_at'>): Promise<SupermarketProduct | null> {
  try {
    // Convertendo o produto do formato do supermercado para o formato da tabela de produtos
    const productData = {
      name: product.name,
      price: product.price,
      purchase_price: product.cost || 0,
      stock: product.stock || 0,
      category: product.category_type,
      description: product.description || '',
      code: product.barcode || '',
      user_id: product.user_id,
      is_public: false
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error creating supermarket product:", error);
      return null;
    }

    // Convertendo o resultado de volta para o formato de SupermarketProduct
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      cost: data.purchase_price || 0,
      stock: data.stock || 0,
      category_type: data.category,
      description: data.description || '',
      barcode: data.code || '',
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      brand: '', // Default values for fields not in the database
      unit: '',
      discount_percentage: 0,
      featured: false,
      expiry_date: ''
    } as SupermarketProduct;
  } catch (error) {
    console.error("Exception creating supermarket product:", error);
    return null;
  }
}

export async function updateSupermarketProduct(id: string, product: Partial<SupermarketProduct>): Promise<SupermarketProduct | null> {
  try {
    // Convertendo os campos do produto do formato do supermercado para o formato da tabela de produtos
    const productData: any = {};
    if (product.name) productData.name = product.name;
    if (product.price !== undefined) productData.price = product.price;
    if (product.cost !== undefined) productData.purchase_price = product.cost;
    if (product.stock !== undefined) productData.stock = product.stock;
    if (product.category_type) productData.category = product.category_type;
    if (product.description !== undefined) productData.description = product.description;
    if (product.barcode) productData.code = product.barcode;
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating supermarket product:", error);
      return null;
    }

    // Convertendo o resultado de volta para o formato de SupermarketProduct
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      cost: data.purchase_price || 0,
      stock: data.stock || 0,
      category_type: data.category,
      description: data.description || '',
      barcode: data.code || '',
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      brand: '', // Default values for fields not in the database
      unit: '',
      discount_percentage: 0,
      featured: false,
      expiry_date: ''
    } as SupermarketProduct;
  } catch (error) {
    console.error("Exception updating supermarket product:", error);
    return null;
  }
}

export async function deleteSupermarketProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
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
