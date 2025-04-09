
import { Product } from '../contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

// Re-export the Product type so it can be imported directly from this file
export type { Product };

// Função para buscar produtos do Supabase para o usuário atual
export async function fetchProductsFromSupabase(userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar produtos do Supabase:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Função para obter produtos
export async function getProducts(search = '', category = '', minPrice = 0, maxPrice = Infinity, inStock = false, userId?: string): Promise<Product[]> {
  try {
    // Buscar produtos do Supabase para o usuário atual
    let products = await fetchProductsFromSupabase(userId);
    
    // Se não encontrar produtos no Supabase, use os dados hardcoded
    if (products.length === 0) {
      products = hardcodedProducts;
    }
    
    // Filtrar produtos
    let filteredProducts = [...products];
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) => 
          product.name.toLowerCase().includes(searchLower) || 
          (product.code && product.code.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrar por categoria
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }
    
    // Filtrar por preço
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
    
    // Filtrar por estoque
    if (inStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock > 0
      );
    }
    
    return filteredProducts;
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return [];
  }
}

export async function getProduct(id: string, userId?: string): Promise<Product | undefined> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('id', id);
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      throw error;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    // Fallback para dados hardcoded
    return hardcodedProducts.find((product) => product.id === id);
  }
}

export async function getCategories(userId?: string): Promise<string[]> {
  try {
    const products = await fetchProductsFromSupabase(userId);
    return Array.from(new Set(products.map((product) => product.category)));
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    return Array.from(new Set(hardcodedProducts.map((product) => product.category)));
  }
}

export async function getTopSellingProducts(limit: number = 5, userId?: string): Promise<Product[]> {
  try {
    // Em uma implementação real, você buscaria os produtos mais vendidos
    // com base nos dados de vendas do usuário atual
    const products = await fetchProductsFromSupabase(userId);
    
    if (products.length === 0) {
      return [...hardcodedProducts].sort(() => Math.random() - 0.5).slice(0, limit);
    }
    
    // Simulando produtos mais vendidos (ordenando aleatoriamente)
    return [...products].sort(() => Math.random() - 0.5).slice(0, limit);
  } catch (error) {
    console.error('Erro ao obter produtos mais vendidos:', error);
    return [...hardcodedProducts].sort(() => Math.random() - 0.5).slice(0, limit);
  }
}

export async function getLowStockProducts(threshold: number = 10, userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .lte('stock', threshold)
      .order('stock');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Product[] || [];
  } catch (error) {
    console.error('Erro ao obter produtos com estoque baixo:', error);
    return hardcodedProducts.filter((product) => product.stock > 0 && product.stock <= threshold);
  }
}

export async function getProductsInStock(userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('name');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Product[] || [];
  } catch (error) {
    console.error('Erro ao obter produtos em estoque:', error);
    return hardcodedProducts.filter((product) => product.stock > 0);
  }
}

export async function getOutOfStockProducts(userId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('stock', 0)
      .order('name');
    
    // Se um ID de usuário for fornecido, filtrar por esse usuário
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Product[] || [];
  } catch (error) {
    console.error('Erro ao obter produtos fora de estoque:', error);
    return hardcodedProducts.filter((product) => product.stock === 0);
  }
}

// Produtos hardcoded para fallback
const hardcodedProducts: Product[] = [
  {
    id: "1",
    name: "Arroz Premium 5kg",
    price: 29.90,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 50,
    code: "ARR001",
    description: "Arroz tipo 1, grãos nobres e selecionados.",
  },
  {
    id: "2",
    name: "Feijão Carioca 1kg",
    price: 8.49,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 45,
    code: "FEI001",
    description: "Feijão carioca tipo 1, colheita recente.",
  },
  {
    id: "3",
    name: "Açúcar Refinado 1kg",
    price: 5.99,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 60,
    code: "ACU001",
    description: "Açúcar refinado de alta qualidade.",
  },
  {
    id: "4",
    name: "Café Torrado e Moído 500g",
    price: 15.90,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 40,
    code: "CAF001",
    description: "Café torrado e moído, embalagem à vácuo.",
  },
  {
    id: "5",
    name: "Óleo de Soja 900ml",
    price: 7.95,
    image: "/placeholder.svg",
    category: "Alimentos Básicos",
    stock: 55,
    code: "OLE001",
    description: "Óleo de soja refinado tipo 1.",
  },
  {
    id: "6",
    name: "Leite Integral 1L",
    price: 4.79,
    image: "/placeholder.svg",
    category: "Laticínios",
    stock: 70,
    code: "LEI001",
    description: "Leite integral UHT, embalagem longa vida.",
  },
  {
    id: "7",
    name: "Queijo Mussarela 500g",
    price: 25.50,
    image: "/placeholder.svg",
    category: "Laticínios",
    stock: 30,
    code: "QUE001",
    description: "Queijo mussarela fatiado de primeira qualidade.",
  },
  {
    id: "8",
    name: "Iogurte Natural 500g",
    price: 8.99,
    image: "/placeholder.svg",
    category: "Laticínios",
    stock: 35,
    code: "IOG001",
    description: "Iogurte natural cremoso sem açúcar.",
  },
  {
    id: "9",
    name: "Maçã Gala Kg",
    price: 9.90,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 40,
    code: "MAC001",
    description: "Maçã gala fresca, selecionada.",
  },
  {
    id: "10",
    name: "Banana Prata Kg",
    price: 6.49,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 45,
    code: "BAN001",
    description: "Banana prata madura, ideal para consumo.",
  },
  {
    id: "11",
    name: "Tomate Kg",
    price: 7.90,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 35,
    code: "TOM001",
    description: "Tomate fresco para saladas e molhos.",
  },
  {
    id: "12",
    name: "Alface Crespa Un",
    price: 3.99,
    image: "/placeholder.svg",
    category: "Hortifruti",
    stock: 25,
    code: "ALF001",
    description: "Alface crespa fresca, colhida no dia.",
  },
  {
    id: "13",
    name: "Carne Bovina Patinho Kg",
    price: 39.90,
    image: "/placeholder.svg",
    category: "Carnes",
    stock: 20,
    code: "CAR001",
    description: "Carne bovina patinho, peça inteira ou moída.",
  },
  {
    id: "14",
    name: "Frango Inteiro Kg",
    price: 15.90,
    image: "/placeholder.svg",
    category: "Carnes",
    stock: 30,
    code: "FRA001",
    description: "Frango inteiro resfriado.",
  },
  {
    id: "15",
    name: "Linguiça Toscana Kg",
    price: 22.90,
    image: "/placeholder.svg",
    category: "Carnes",
    stock: 25,
    code: "LIN001",
    description: "Linguiça toscana suína para churrasco.",
  },
  {
    id: "16",
    name: "Pão Francês Kg",
    price: 13.90,
    image: "/placeholder.svg",
    category: "Padaria",
    stock: 50,
    code: "PAO001",
    description: "Pão francês fresco, feito no dia.",
  },
  {
    id: "17",
    name: "Pão de Forma 500g",
    price: 8.49,
    image: "/placeholder.svg",
    category: "Padaria",
    stock: 40,
    code: "PAO002",
    description: "Pão de forma tradicional fatiado.",
  },
  {
    id: "18",
    name: "Bolo de Chocolate Un",
    price: 19.90,
    image: "/placeholder.svg",
    category: "Padaria",
    stock: 15,
    code: "BOL001",
    description: "Bolo de chocolate fresco, pronto para consumo.",
  },
  {
    id: "19",
    name: "Água Mineral 500ml",
    price: 2.49,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 100,
    code: "AGU001",
    description: "Água mineral sem gás, garrafa 500ml.",
  },
  {
    id: "20",
    name: "Refrigerante Cola 2L",
    price: 8.99,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 60,
    code: "REF001",
    description: "Refrigerante sabor cola, garrafa 2 litros.",
  },
  {
    id: "21",
    name: "Suco de Laranja 1L",
    price: 10.90,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 45,
    code: "SUC001",
    description: "Suco de laranja natural integral, garrafa 1 litro.",
  },
  {
    id: "22",
    name: "Cerveja Lata 350ml",
    price: 4.90,
    image: "/placeholder.svg",
    category: "Bebidas",
    stock: 80,
    code: "CER001",
    description: "Cerveja pilsen, lata 350ml.",
  },
  {
    id: "23",
    name: "Sabão em Pó 1kg",
    price: 12.90,
    image: "/placeholder.svg",
    category: "Limpeza",
    stock: 40,
    code: "SAB001",
    description: "Sabão em pó multi-ação para roupas.",
  },
  {
    id: "24",
    name: "Detergente Líquido 500ml",
    price: 3.49,
    image: "/placeholder.svg",
    category: "Limpeza",
    stock: 55,
    code: "DET001",
    description: "Detergente líquido para louças, neutro.",
  },
  {
    id: "25",
    name: "Papel Higiênico 12 rolos",
    price: 19.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 35,
    code: "PAP001",
    description: "Papel higiênico folha dupla, pacote com 12 rolos.",
  },
  {
    id: "26",
    name: "Creme Dental 90g",
    price: 5.99,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 50,
    code: "CRE001",
    description: "Creme dental com flúor para proteção completa.",
  },
  {
    id: "27",
    name: "Sabonete 90g",
    price: 2.99,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 60,
    code: "SAB002",
    description: "Sabonete hidratante para banho.",
  },
  {
    id: "28",
    name: "Shampoo 350ml",
    price: 12.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 40,
    code: "SHA001",
    description: "Shampoo para todos os tipos de cabelo.",
  },
  {
    id: "29",
    name: "Condicionador 350ml",
    price: 13.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 38,
    code: "CON001",
    description: "Condicionador para todos os tipos de cabelo.",
  },
  {
    id: "30",
    name: "Desodorante Roll-on 50ml",
    price: 9.90,
    image: "/placeholder.svg",
    category: "Higiene",
    stock: 45,
    code: "DES001",
    description: "Desodorante roll-on antitranspirante.",
  },
];

export default hardcodedProducts;
