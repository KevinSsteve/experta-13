
import { supabase } from "@/integrations/supabase/client";

// Interface para as correções de voz
interface SpeechCorrection {
  id: string;
  original_text: string;
  corrected_text: string;
  user_id: string;
  active: boolean;
  created_at: string;
}

/**
 * Aplica correções registradas pelo usuário ao texto reconhecido pelo Google Speech
 * @param text Texto reconhecido pelo Google Speech
 * @param userId ID do usuário para buscar suas correções
 * @returns Texto corrigido com base nas correções do usuário
 */
export async function applyVoiceCorrections(text: string, userId?: string): Promise<string> {
  if (!userId) return text;
  
  // Se o texto estiver vazio, retorna vazio
  if (!text || text.trim() === '') return text;

  try {
    // Busca as correções ativas do usuário
    const { data: corrections, error } = await supabase
      .from("speech_corrections")
      .select("original_text, corrected_text")
      .eq("user_id", userId)
      .eq("active", true);

    if (error || !corrections || corrections.length === 0) {
      return text;
    }

    // Aplicar correções exatas primeiro
    let correctedText = text;
    for (const correction of corrections) {
      // Correção exata (case-insensitive)
      if (correctedText.toLowerCase() === correction.original_text.toLowerCase()) {
        console.log(`Correção exata aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        return correction.corrected_text;
      }
    }

    // Se não encontrou correção exata, tenta correções parciais
    for (const correction of corrections) {
      // Verifica se o texto contém a string original (case-insensitive)
      const regex = new RegExp(correction.original_text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      if (regex.test(correctedText)) {
        console.log(`Correção parcial aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        correctedText = correctedText.replace(regex, correction.corrected_text);
      }
    }

    return correctedText;
  } catch (error) {
    console.error("Erro ao aplicar correções de voz:", error);
    return text;
  }
}

/**
 * Função para aplicar correções de voz em uma lista de strings
 * @param texts Lista de strings para corrigir
 * @param userId ID do usuário para buscar suas correções
 * @returns Lista de strings corrigidas
 */
export async function applyVoiceCorrectionsToList(texts: string[], userId?: string): Promise<string[]> {
  if (!userId || !texts || texts.length === 0) return texts;
  
  try {
    const correctedTexts = await Promise.all(
      texts.map(text => applyVoiceCorrections(text, userId))
    );
    return correctedTexts;
  } catch (error) {
    console.error("Erro ao aplicar correções de voz à lista:", error);
    return texts;
  }
}

/**
 * Função para verificar se o texto pode se beneficiar de correções
 * @param text Texto para verificar
 * @param userId ID do usuário para buscar suas correções
 * @returns Verdadeiro se houver potenciais correções
 */
export async function hasNeedForCorrections(text: string, userId?: string): Promise<boolean> {
  if (!userId || !text) return false;
  
  try {
    // Busca palavras problemáticas conhecidas no texto
    const { data: corrections, error } = await supabase
      .from("speech_corrections")
      .select("original_text")
      .eq("user_id", userId)
      .eq("active", true);

    if (error || !corrections || corrections.length === 0) {
      return false;
    }

    // Verifica se alguma das palavras problemáticas está no texto
    for (const correction of corrections) {
      if (text.toLowerCase().includes(correction.original_text.toLowerCase())) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar necessidade de correções:", error);
    return false;
  }
}

/**
 * Função para buscar possíveis correções para um texto
 * @param text Texto a ser verificado
 * @param userId ID do usuário
 * @returns Array com possíveis correções
 */
export async function findPossibleCorrections(text: string, userId?: string): Promise<string[]> {
  if (!userId || !text) return [];
  
  try {
    // Buscar todas as correções ativas do usuário
    const { data: corrections, error } = await supabase
      .from("speech_corrections")
      .select("original_text, corrected_text")
      .eq("user_id", userId)
      .eq("active", true);
      
    if (error || !corrections || corrections.length === 0) {
      return [];
    }
    
    // Lista de possíveis correções
    const possibleCorrections: string[] = [];
    
    // Verificar se o texto está próximo de alguma correção conhecida
    // Primeiro verificamos correções exatas
    for (const correction of corrections) {
      // Verifica a similaridade do texto com as correções originais
      // Usando uma abordagem simples de comparação case-insensitive primeiro
      if (text.toLowerCase() === correction.original_text.toLowerCase() ||
          text.toLowerCase().includes(correction.original_text.toLowerCase()) ||
          correction.original_text.toLowerCase().includes(text.toLowerCase())) {
        
        // Adiciona o texto corrigido como possível alternativa
        if (!possibleCorrections.includes(correction.corrected_text)) {
          possibleCorrections.push(correction.corrected_text);
        }
      }
    }
    
    // Se não encontrou nenhuma correção com essa abordagem simples
    // Podemos usar técnicas mais avançadas como algoritmos de distância de edição
    // ou outras heurísticas de similaridade fonética
    
    return possibleCorrections;
  } catch (error) {
    console.error("Erro ao buscar possíveis correções:", error);
    return [];
  }
}
