
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/contexts/CartContext";

/**
 * Creates a test product if it doesn't already exist for the user
 * @param userId The user ID to create the product for
 * @returns The created or existing product
 */
export async function ensureTestProductExists(userId: string): Promise<Product | null> {
  if (!userId) return null;
  
  // Check if the product already exists
  const { data: existingProducts } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .eq('name', 'Yummy Bolacha')
    .limit(1);
  
  // If product exists, return it
  if (existingProducts && existingProducts.length > 0) {
    console.log('Test product "Yummy Bolacha" already exists:', existingProducts[0]);
    return existingProducts[0] as Product;
  }
  
  // If product doesn't exist, create it
  const newProduct = {
    name: 'Yummy Bolacha',
    price: 200,
    category: 'Alimentos',
    stock: 50,
    description: 'Bolacha gostosa e crocante',
    code: 'YUMMY-BOL',
    image: '/placeholder.svg',
    user_id: userId,
    purchase_price: 120
  };
  
  console.log('Creating test product "Yummy Bolacha"...');
  
  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select();
  
  if (error) {
    console.error('Error creating test product:', error);
    return null;
  }
  
  console.log('Test product created successfully:', data[0]);
  return data[0] as Product;
}
