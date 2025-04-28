
import { Product } from './types';
import { fetchProductsFromSupabase } from './adapters';
import hardcodedProducts from './fallback';
import { supabase } from '@/integrations/supabase/client';
import { getPhoneticCode } from '@/utils/productMatchUtils';

// Function to get products
export async function getProducts(search = '', category = '', minPrice = 0, maxPrice = Infinity, inStock = false, userId?: string): Promise<Product[]> {
  try {
    console.log(`Fetching products with filters: search=${search}, category=${category}, userId=${userId || 'none'}`);
    
    // Get products from Supabase for the current user
    let products = await fetchProductsFromSupabase(userId);
    
    // If no products found in Supabase, use hardcoded data as fallback
    if (products.length === 0) {
      console.log('No products found in Supabase, using fallback data');
      products = hardcodedProducts;
    } else {
      console.log(`Found ${products.length} products in Supabase`);
    }
    
    // Filter products
    let filteredProducts = [...products];
    
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
    
    // If a user ID is provided, filter by that user
    if (userId) {
      query = query.eq('user_id', userId);
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
    
    const products = await fetchProductsFromSupabase(userId);
    const categories = Array.from(new Set(products.map((product) => product.category)));
    
    console.log(`Found ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Array.from(new Set(hardcodedProducts.map((product) => product.category)));
  }
}
