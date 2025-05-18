import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Cria um novo produto no banco de dados
 * @param userId ID do usuário proprietário do produto
 * @returns O produto criado ou null em caso de erro
 */
export const createDefaultProduct = async (userId: string) => {
  if (!userId) {
    console.error("ID do usuário não fornecido para criar produto");
    return null;
  }

  try {
    // Verificar se o produto já existe
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', 'Carne de Cabrito')
      .eq('user_id', userId);

    if (checkError) {
      console.error("Erro ao verificar produto existente:", checkError);
      return null;
    }

    // Se o produto já existe, retorná-lo
    if (existingProducts && existingProducts.length > 0) {
      console.log("Produto 'Carne de Cabrito' já existe:", existingProducts[0]);
      return existingProducts[0];
    }

    // Criar o novo produto
    const newProduct = {
      name: 'Carne de Cabrito',
      price: 12000,
      category: 'Carnes',
      stock: 12,
      description: 'Carne de cabrito fresca',
      code: 'CAB-001',
      image: "/placeholder.svg",
      user_id: userId,
      purchase_price: 9000, // Preço de compra estimado (75% do preço de venda)
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();
    
    if (error) {
      console.error("Erro ao criar produto 'Carne de Cabrito':", error);
      return null;
    }
    
    console.log("Produto 'Carne de Cabrito' criado com sucesso:", data[0]);
    toast.success("Produto 'Carne de Cabrito' criado com sucesso!");
    return data[0];
  } catch (error) {
    console.error("Exceção ao criar produto:", error);
    return null;
  }
};

/**
 * Cria o produto Yummy Bolacha no banco de dados
 * @param userId ID do usuário proprietário do produto
 * @returns O produto criado ou null em caso de erro
 */
export const createYummyProduct = async (userId: string) => {
  if (!userId) {
    console.error("ID do usuário não fornecido para criar produto");
    return null;
  }

  try {
    // Verificar se o produto já existe
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', 'Yummy Bolacha')
      .eq('user_id', userId);

    if (checkError) {
      console.error("Erro ao verificar produto existente:", checkError);
      return null;
    }

    // Se o produto já existe, retorná-lo
    if (existingProducts && existingProducts.length > 0) {
      console.log("Produto 'Yummy Bolacha' já existe:", existingProducts[0]);
      return existingProducts[0];
    }

    // Criar o novo produto
    const newProduct = {
      name: 'Yummy Bolacha',
      price: 100,
      category: 'Alimentos',
      stock: 30,
      description: 'Yummy Bolacha de pacote',
      code: 'YUM-001',
      image: "/placeholder.svg",
      user_id: userId,
      purchase_price: 70, // Preço de compra estimado (70% do preço de venda)
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();
    
    if (error) {
      console.error("Erro ao criar produto 'Yummy Bolacha':", error);
      return null;
    }
    
    console.log("Produto 'Yummy Bolacha' criado com sucesso:", data[0]);
    toast.success("Produto 'Yummy Bolacha' criado com sucesso!");
    return data[0];
  } catch (error) {
    console.error("Exceção ao criar produto:", error);
    return null;
  }
};

/**
 * Cria o produto Sambapito Yummy Yummi no banco de dados
 * @param userId ID do usuário proprietário do produto
 * @returns O produto criado ou null em caso de erro
 */
export const createSambapitoProduct = async (userId: string) => {
  if (!userId) {
    console.error("ID do usuário não fornecido para criar produto");
    return null;
  }

  try {
    // Verificar se o produto já existe
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', 'Sambapito Yummy Yummi')
      .eq('user_id', userId);

    if (checkError) {
      console.error("Erro ao verificar produto existente:", checkError);
      return null;
    }

    // Se o produto já existe, retorná-lo
    if (existingProducts && existingProducts.length > 0) {
      console.log("Produto 'Sambapito Yummy Yummi' já existe:", existingProducts[0]);
      return existingProducts[0];
    }

    // Criar o novo produto
    const newProduct = {
      name: 'Sambapito Yummy Yummi',
      price: 200,
      category: 'Alimentos',
      stock: 30,
      description: 'Sambapito Yummy Yummi delicioso',
      code: 'SAM-001',
      image: "/placeholder.svg",
      user_id: userId,
      purchase_price: 140, // Preço de compra estimado (70% do preço de venda)
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();
    
    if (error) {
      console.error("Erro ao criar produto 'Sambapito Yummy Yummi':", error);
      return null;
    }
    
    console.log("Produto 'Sambapito Yummy Yummi' criado com sucesso:", data[0]);
    toast.success("Produto 'Sambapito Yummy Yummi' criado com sucesso!");
    return data[0];
  } catch (error) {
    console.error("Exceção ao criar produto:", error);
    return null;
  }
};
