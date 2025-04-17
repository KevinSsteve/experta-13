
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Função para limpar todas as vendas de um usuário específico
 * @param userId ID do usuário cujas vendas serão removidas
 * @returns Informação sobre a operação
 */
export async function clearAllSales(userId?: string): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    // Se não tiver usuário, não pode executar
    if (!userId) {
      console.error("Tentativa de limpar vendas sem ID de usuário");
      return { 
        success: false, 
        message: "Você precisa estar autenticado para limpar os registros de vendas" 
      };
    }

    console.log(`Iniciando limpeza de vendas para usuário: ${userId}`);
    
    // Primeiro, obtenha a contagem de registros para confirmar
    const { count, error: countError } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error("Erro ao contar registros de vendas:", countError);
      return { 
        success: false, 
        message: `Erro ao contar registros: ${countError.message}` 
      };
    }
    
    console.log(`Encontrados ${count} registros de venda para remover`);
    
    // Se não houver registros, retorne essa informação
    if (!count || count === 0) {
      return { 
        success: true, 
        message: "Não há registros de vendas para limpar",
        count: 0
      };
    }
    
    // Execute a operação de exclusão
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error("Erro ao limpar registros de vendas:", error);
      return { 
        success: false, 
        message: `Erro ao limpar registros: ${error.message}` 
      };
    }
    
    console.log(`${count} registros de venda removidos com sucesso`);
    
    return { 
      success: true, 
      message: `${count} registros de venda removidos com sucesso`,
      count
    };
  } catch (error) {
    console.error("Exceção ao limpar vendas:", error);
    return { 
      success: false, 
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Função para limpar vendas locais armazenadas no localStorage
 * @returns Informação sobre a operação
 */
export function clearLocalSales(): { success: boolean; message: string; count?: number } {
  try {
    const salesJson = localStorage.getItem('sales');
    const sales = salesJson ? JSON.parse(salesJson) : [];
    const count = sales.length;
    
    if (count === 0) {
      return { 
        success: true, 
        message: "Não há vendas locais para limpar",
        count: 0
      };
    }
    
    localStorage.removeItem('sales');
    console.log(`${count} vendas locais removidas do localStorage`);
    
    return { 
      success: true, 
      message: `${count} vendas locais removidas com sucesso`,
      count
    };
  } catch (error) {
    console.error("Erro ao limpar vendas locais:", error);
    return { 
      success: false, 
      message: `Erro ao limpar vendas locais: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
