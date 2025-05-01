
import { supabase } from "@/integrations/supabase/client";
import { MeatCut } from "./types";
import { toast } from "sonner";

export const sampleMeatCuts = [
  {
    name: 'Lombo de Vaca',
    animal_type: 'beef',
    price_per_kg: 3500,
    cost_per_kg: 2800,
    stock_weight: 35.5,
    description: 'Corte premium do lombo bovino, ideal para bifes e assados especiais',
    barcode: 'BF001'
  },
  {
    name: 'Picanha',
    animal_type: 'beef',
    price_per_kg: 4200,
    cost_per_kg: 3400,
    stock_weight: 28.2,
    description: 'Corte nobre e suculento, perfeito para churrascos',
    barcode: 'BF002'
  },
  {
    name: 'Alcatra',
    animal_type: 'beef',
    price_per_kg: 3800,
    cost_per_kg: 3000,
    stock_weight: 42.8,
    description: 'Corte versátil da parte traseira, ótimo para bifes e assados',
    barcode: 'BF003'
  },
  {
    name: 'T-bone',
    animal_type: 'beef',
    price_per_kg: 4500,
    cost_per_kg: 3600,
    stock_weight: 18.5,
    description: 'Bife com osso em formato de T, combina filé mignon e contrafilé',
    barcode: 'BF004'
  },
  {
    name: 'Acém',
    animal_type: 'beef',
    price_per_kg: 2800,
    cost_per_kg: 2200,
    stock_weight: 56.7,
    description: 'Corte macio e saboroso, ideal para estufados e cozidos',
    barcode: 'BF005'
  },
  {
    name: 'Lombo de Porco',
    animal_type: 'pork',
    price_per_kg: 2600,
    cost_per_kg: 2000,
    stock_weight: 40.2,
    description: 'Corte magro do lombo, ideal para assados e bifes',
    barcode: 'PK001'
  },
  {
    name: 'Costeletas de Porco',
    animal_type: 'pork',
    price_per_kg: 2400,
    cost_per_kg: 1900,
    stock_weight: 52.5,
    description: 'Cortes com osso, perfeitos para grelhados e fritos',
    barcode: 'PK002'
  },
  {
    name: 'Peito de Frango',
    animal_type: 'chicken',
    price_per_kg: 1800,
    cost_per_kg: 1400,
    stock_weight: 65.8,
    description: 'Corte magro e versátil, ideal para grelhados e refogados',
    barcode: 'CH001'
  },
  {
    name: 'Coxas de Frango',
    animal_type: 'chicken',
    price_per_kg: 1600,
    cost_per_kg: 1200,
    stock_weight: 72.3,
    description: 'Parte saborosa da perna, ótima para assados e fritos',
    barcode: 'CH002'
  },
  {
    name: 'Pernil de Cordeiro',
    animal_type: 'lamb',
    price_per_kg: 3800,
    cost_per_kg: 3000,
    stock_weight: 28.4,
    description: 'Corte nobre da perna, ideal para assados festivos',
    barcode: 'LM001'
  }
];

export const importSampleMeatCuts = async (userId: string): Promise<boolean> => {
  try {
    // Verificar se já existem cortes de carne para este usuário
    const { count, error: countError } = await supabase
      .from('meat_cuts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (countError) throw countError;
    
    // Se já existem produtos, não insere os exemplos
    if (count && count > 0) {
      console.log('Produtos já existem para este usuário, pulando importação');
      return false;
    }
    
    // Preparar os dados para inserção
    const productsToInsert = sampleMeatCuts.map(product => ({
      ...product,
      user_id: userId
    }));
    
    const { data, error } = await supabase
      .from('meat_cuts')
      .insert(productsToInsert);
      
    if (error) throw error;
    
    console.log('Produtos de exemplo importados com sucesso!');
    toast.success('Produtos de exemplo importados com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Erro ao importar produtos de exemplo:', error.message);
    toast.error(`Erro ao importar produtos: ${error.message}`);
    return false;
  }
};
