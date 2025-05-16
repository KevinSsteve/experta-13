
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
    console.log(`Aplicando correções para texto: "${text}"`);

    // Busca as correções ativas do usuário com ordenação por data (mais recentes primeiro)
    const { data: corrections, error } = await supabase
      .from("speech_corrections")
      .select("original_text, corrected_text")
      .eq("user_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error || !corrections || corrections.length === 0) {
      console.log("Nenhuma correção encontrada ou erro:", error);
      return text;
    }

    console.log(`Encontradas ${corrections.length} correções para aplicar:`, corrections);
    
    // Normalizar o texto para comparação case-insensitive
    const normalizedText = text.toLowerCase().trim();
    
    // Aplicar correções exatas primeiro (case-insensitive)
    for (const correction of corrections) {
      const normalizedOriginal = correction.original_text.toLowerCase().trim();
      
      // Correção exata (case-insensitive)
      if (normalizedText === normalizedOriginal) {
        console.log(`Correção exata aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        return correction.corrected_text;
      }
    }

    // Se não encontrou correção exata, tenta correções parciais
    let correctedText = text;
    for (const correction of corrections) {
      // Criamos uma regex que seja case-insensitive
      const normalizedOriginal = correction.original_text.toLowerCase().trim();
      const escapedOriginal = normalizedOriginal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedOriginal}\\b`, 'gi');
      
      // Verifica se o texto contém a palavra/frase original como palavra completa
      if (regex.test(correctedText.toLowerCase())) {
        console.log(`Correção parcial aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        correctedText = correctedText.replace(new RegExp(correction.original_text, 'gi'), correction.corrected_text);
      }
    }

    console.log(`Texto original: "${text}". Texto corrigido: "${correctedText}"`);
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
    
    console.log(`Buscando correções possíveis para: "${text}" entre ${corrections.length} correções disponíveis`);
    
    // Lista de possíveis correções
    const possibleCorrections: string[] = [];
    
    // Normalizar o texto para comparação
    const normalizedText = text.toLowerCase().trim();
    
    // Verificar se o texto está próximo de alguma correção conhecida
    for (const correction of corrections) {
      const normalizedOriginal = correction.original_text.toLowerCase().trim();
      
      // Correspondência exata ou contém a palavra/frase
      if (
        normalizedText === normalizedOriginal ||
        normalizedText.includes(normalizedOriginal) ||
        normalizedOriginal.includes(normalizedText)
      ) {
        console.log(`Correção possível encontrada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        if (!possibleCorrections.includes(correction.corrected_text)) {
          possibleCorrections.push(correction.corrected_text);
        }
      }
    }
    
    console.log(`Encontradas ${possibleCorrections.length} correções possíveis para "${text}":`, possibleCorrections);
    return possibleCorrections;
  } catch (error) {
    console.error("Erro ao buscar possíveis correções:", error);
    return [];
  }
}
