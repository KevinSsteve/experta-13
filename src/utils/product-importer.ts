
import { supabase, addMultiplePublicProducts, logCurrentUser } from '@/integrations/supabase/client';

type ProductInput = {
  name: string;
  price: number;
  category: string;
  stock?: number;
  description?: string;
  code?: string;
  image?: string;
};

// Function to parse product text in format "Product Name (1 234,56 AOA);"
export const parseProductText = (productText: string): ProductInput[] => {
  // Split the text by semicolon and remove any empty entries
  const productEntries = productText.split(';').filter(entry => entry.trim().length > 0);
  
  return productEntries.map(entry => {
    const trimmedEntry = entry.trim();
    
    // Find the price in parentheses
    const match = trimmedEntry.match(/(.+?)\s*\(([0-9\s]+,\d+)\s*AOA\)/);
    
    if (!match) {
      console.warn(`Could not parse product: ${trimmedEntry}`);
      return null;
    }
    
    const name = match[1].trim();
    
    // Parse the price - remove spaces and replace comma with dot
    const priceText = match[2].replace(/\s+/g, '').replace(',', '.');
    const price = parseFloat(priceText);
    
    // Determine category based on name
    let category = "Outros";
    
    if (name.includes("Arroz") || name.includes("Fuba") || name.includes("Farinha") || name.includes("Feijão") || name.includes("Grão")) {
      category = "Alimentos Básicos";
    } else if (name.includes("Óleo") || name.includes("Azeite") || name.includes("Vinagre")) {
      category = "Óleos e Temperos";
    } else if (name.includes("Leite") || name.includes("Manteiga") || name.includes("Queijo") || name.includes("Natas")) {
      category = "Laticínios";
    } else if (name.includes("Bolacha") || name.includes("Biscoito") || name.includes("Chocolate")) {
      category = "Bolachas e Snacks";
    } else if (name.includes("Vinho") || name.includes("Cerveja") || name.includes("Whisky") || name.includes("Vodka") || name.includes("Sumo")) {
      category = "Bebidas";
    } else if (name.includes("Pasta") || name.includes("Sabão") || name.includes("Detergente") || name.includes("Lixivia")) {
      category = "Limpeza";
    } else if (name.includes("Papel") || name.includes("Guardanapo") || name.includes("Cotonetes") || name.includes("Absorvente")) {
      category = "Higiene";
    } else if (name.includes("Caderno") || name.includes("Lápis") || name.includes("Caneta") || name.includes("Marcador")) {
      category = "Papelaria";
    } else if (name.includes("Cabo") || name.includes("Carregador") || name.includes("Comando")) {
      category = "Eletrônicos";
    }
    
    return {
      name,
      price,
      category
    };
  }).filter(product => product !== null) as ProductInput[];
};

// Function to add products to Supabase
export const importProductsToSupabase = async (productText: string): Promise<void> => {
  try {
    const products = parseProductText(productText);
    console.log(`Parsed ${products.length} products`);
    
    // Get the current user
    const user = await logCurrentUser();
    
    if (!user) {
      throw new Error("User not authenticated. Please log in to import products.");
    }
    
    // Add products to Supabase
    await addMultiplePublicProducts(products, user.id);
    
    console.log(`Successfully imported ${products.length} products to Supabase`);
  } catch (error) {
    console.error("Error importing products:", error);
    throw error;
  }
};

// Global function for easy console access
export const exposeImportFunction = () => {
  // @ts-ignore - Attaching to window for easy access
  window.importProducts = async (productsText: string) => {
    try {
      await importProductsToSupabase(productsText);
      console.log("Products imported successfully!");
      return true;
    } catch (error) {
      console.error("Failed to import products:", error);
      return false;
    }
  };
  
  console.log("Products import function available as window.importProducts(productsText)");
};
