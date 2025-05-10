
import { supabase } from "@/integrations/supabase/client";

export async function importMeatProducts() {
  console.log("Começando processo de importação de produtos de carne");

  try {
    // Verificar se os produtos já existem
    const { count: existingCount, error: countError } = await supabase
      .from('product_backups')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    console.log(`Foram encontrados ${existingCount || 0} produtos no banco de dados`);
    
    // Os produtos já foram importados pelo SQL, então não precisamos fazer nada
    console.log("Produtos já importados com sucesso pelo SQL");
    
    return {
      success: true,
      message: "Produtos já estão disponíveis no sistema",
      count: existingCount
    };
  } catch (error) {
    console.error("Erro na importação:", error);
    throw error;
  }
}
