
import { Product } from './types';
import { fetchProductsFromSupabase } from './adapters';
import hardcodedProducts from './fallback';
import { supabase } from '@/integrations/supabase/client';
import { getPhoneticCode } from '@/utils/productMatchUtils';

// Function to get products
export async function getProducts(search = '', category = '', minPrice = 0, maxPrice = Infinity, inStock = false, userId?: string): Promise<Product[]> {
  try {
    console.log(`Fetching products with filters: search=${search}, category=${category}, userId=${userId || 'none'}`);
    
    // Get user's private products from Supabase
    let userProducts = await fetchProductsFromSupabase(userId);
    
    // Get public products from Supabase
    const { data: publicProducts, error: publicError } = await supabase
      .from('products')
      .select('*')
      .eq('is_public', true)
      .order('name');
    
    if (publicError) {
      console.error('Error fetching public products:', publicError);
    }
    
    // Combine user products with public products
    let products = [...userProducts];
    if (publicProducts) {
      products = [...products, ...publicProducts as Product[]];
    }
    
    // If no products found, use hardcoded data as fallback
    if (products.length === 0) {
      console.log('No products found in Supabase, using fallback data');
      products = hardcodedProducts;
    } else {
      console.log(`Found ${products.length} products in Supabase (including public products)`);
    }
    
    // Remove duplicates based on name and category
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => 
        p.name.toLowerCase() === product.name.toLowerCase() && 
        p.category.toLowerCase() === product.category.toLowerCase()
      )
    );
    
    // Filter products
    let filteredProducts = [...uniqueProducts];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      const phoneticSearch = getPhoneticCode(search);
      
      console.log(`Filtering by search term: "${search}" (phonetic: "${phoneticSearch}")`);
      
      filteredProducts = filteredProducts.filter(
        (product) => {
          const nameMatches = product.name.toLowerCase().includes(searchLower);
          const codeMatches = product.code && product.code.toLowerCase().includes(searchLower);
          const categoryMatches = product.category.toLowerCase().includes(searchLower);
          
          // Check phonetic match if no direct match
          if (!nameMatches && !codeMatches && !categoryMatches) {
            const phoneticName = getPhoneticCode(product.name);
            const phoneticCategory = getPhoneticCode(product.category);
            return phoneticName.includes(phoneticSearch) || 
                   phoneticSearch.includes(phoneticName) || 
                   phoneticCategory.includes(phoneticSearch);
          }
          
          return nameMatches || codeMatches || categoryMatches;
        }
      );
      
      console.log(`Search filtered products: ${filteredProducts.length}`);
    }
    
    // Filter by category
    if (category) {
      console.log(`Filtering by category: "${category}"`);
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
      console.log(`Category filtered products: ${filteredProducts.length}`);
    }
    
    // Filter by price
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= (maxPrice || Infinity)
    );
    console.log(`Price filtered products: ${filteredProducts.length}`);
    
    // Filter by stock
    if (inStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock > 0
      );
      console.log(`In-stock filtered products: ${filteredProducts.length}`);
    }
    
    return filteredProducts;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function getProduct(id: string, userId?: string): Promise<Product | undefined> {
  try {
    console.log(`Fetching product with id: ${id}, userId: ${userId || 'none'}`);
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('id', id);
    
    // If a user ID is provided, filter by that user OR public products
    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    
    if (!data) {
      console.log(`No product found with id ${id}, using fallback data`);
      return hardcodedProducts.find((product) => product.id === id);
    }
    
    console.log('Product fetched successfully');
    return data as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    // Fallback to hardcoded data
    return hardcodedProducts.find((product) => product.id === id);
  }
}

export async function getCategories(userId?: string): Promise<string[]> {
  try {
    console.log(`Fetching categories for userId: ${userId || 'none'}`);
    
    // Get user's private products
    const userProducts = await fetchProductsFromSupabase(userId);
    
    // Get public products
    const { data: publicProducts, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_public', true);
    
    if (error) {
      console.error('Error fetching public product categories:', error);
    }
    
    // Combine categories from both user and public products
    const allProducts = [...userProducts];
    if (publicProducts) {
      allProducts.push(...publicProducts.map(p => ({ category: p.category })) as any);
    }
    
    const categories = Array.from(new Set(allProducts.map((product) => product.category)));
    
    console.log(`Found ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Array.from(new Set(hardcodedProducts.map((product) => product.category)));
  }
}
