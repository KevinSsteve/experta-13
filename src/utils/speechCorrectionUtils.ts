
/**
 * Aplica correções de voz para melhorar o reconhecimento de voz
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para representar uma correção de voz
 */
interface VoiceCorrection {
  id: string;
  user_id: string;
  original_text: string;
  corrected_text: string;
  created_at: string;
  active?: boolean;
}

/**
 * Lista de correções conhecidas para termos específicos
 * Estas correções são aplicadas automaticamente sem necessidade de salvar no banco
 */
const knownCorrections: Record<string, string[]> = {
  // Correções para "tibone"
  'tibone': ['tibana', 'que bom', 'te bom', 'que bom né', 'que bone', 'ti bone', 'tee bone', 'te bone', 'ti bom', 'riboni'],
  
  // Correções para "yummy"
  'yummy': ['iami', 'iume', 'iuni', 'filme', 'iome', 'iumê', 'iami', 'iumi'],
  
  // Correções para "mocoto"
  'mocoto': ['mucoto', 'macoto', 'mo coto', 'mu coto'],

  // Correções para "yummy bolacha"
  'yummy bolacha': ['filme bolacha', 'iume bolacha', 'iuni bolacha', 'iami bolacha']
};

/**
 * Aplica correções conhecidas ao texto
 * @param text Texto para aplicar correções
 * @returns Texto corrigido
 */
export function applyKnownCorrections(text: string): string {
  // Converte o texto para minúsculo para comparação
  const lowerText = text.toLowerCase();
  
  // Verifica cada termo conhecido
  for (const [correctTerm, variations] of Object.entries(knownCorrections)) {
    // Verifica se o texto contém alguma das variações conhecidas
    for (const variation of variations) {
      if (lowerText.includes(variation.toLowerCase())) {
        // Substitui a variação pelo termo correto, preservando maiúsculas/minúsculas
        const regex = new RegExp(variation, 'i');
        return text.replace(regex, correctTerm);
      }
    }
  }
  
  return text;
}

/**
 * Aplica correções de voz ao texto
 * @param text Texto a ser corrigido
 * @param userId ID do usuário para buscar correções específicas
 * @returns Texto corrigido
 */
export async function applyVoiceCorrections(text: string, userId?: string): Promise<string> {
  if (!text) return text;
  
  // Primeiro aplica correções conhecidas
  let correctedText = applyKnownCorrections(text);
  
  // Se o texto já foi corrigido, retorna imediatamente
  if (correctedText !== text) {
    console.log(`Aplicando correção conhecida: "${text}" -> "${correctedText}"`);
    return correctedText;
  }
  
  // Se não houver userId, retorna o texto original
  if (!userId) {
    return text;
  }
  
  try {
    // Busca correções de voz específicas do usuário no banco de dados
    const { data: userCorrections, error } = await supabase
      .from('speech_corrections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao buscar correções de voz:', error);
      return correctedText;
    }
    
    // Aplica as correções de voz do usuário
    if (userCorrections && userCorrections.length > 0) {
      for (const correction of userCorrections) {
        const regex = new RegExp(correction.original_text, 'gi');
        correctedText = correctedText.replace(regex, correction.corrected_text);
      }
    }
  } catch (error) {
    console.error('Erro ao aplicar correções de voz:', error);
  }
  
  return correctedText;
}

/**
 * Busca possíveis correções alternativas para o texto
 * @param text Texto original
 * @param userId ID do usuário (opcional)
 * @returns Lista de termos corrigidos
 */
export async function findPossibleCorrections(text: string, userId?: string): Promise<string[]> {
  if (!text) return [];
  
  const alternativeCorrections: string[] = [];
  
  // Primeiro, busca correções conhecidas
  for (const [correctTerm, variations] of Object.entries(knownCorrections)) {
    if (variations.some(variation => text.toLowerCase().includes(variation.toLowerCase()))) {
      alternativeCorrections.push(correctTerm);
    }
  }
  
  // Se houver userId, busca correções personalizadas do usuário
  if (userId) {
    try {
      const { data: userCorrections, error } = await supabase
        .from('speech_corrections')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erro ao buscar correções de voz:', error);
      } else if (userCorrections && userCorrections.length > 0) {
        userCorrections.forEach(correction => {
          if (text.toLowerCase().includes(correction.original_text.toLowerCase())) {
            alternativeCorrections.push(correction.corrected_text);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao buscar correções de voz:', error);
    }
  }
  
  // Remove duplicatas
  return [...new Set(alternativeCorrections)];
}

/**
 * Salva uma correção de voz no banco de dados
 */
export async function saveVoiceCorrection(
  userId: string,
  originalText: string,
  correctedText: string
): Promise<boolean> {
  if (!userId || !originalText || !correctedText) {
    console.warn('Dados incompletos para salvar correção de voz.');
    return false;
  }
  
  try {
    // Verifica se a correção já existe
    const { data: existingCorrections, error: selectError } = await supabase
      .from('speech_corrections')
      .select('*')
      .eq('user_id', userId)
      .eq('original_text', originalText);
    
    if (selectError) {
      console.error('Erro ao verificar correção existente:', selectError);
      return false;
    }
    
    if (existingCorrections && existingCorrections.length > 0) {
      console.log('Correção já existe:', existingCorrections[0]);
      return true;
    }
    
    // Insere a nova correção
    const { error: insertError } = await supabase
      .from('speech_corrections')
      .insert([
        {
          user_id: userId,
          original_text: originalText,
          corrected_text: correctedText,
          active: true
        },
      ]);
    
    if (insertError) {
      console.error('Erro ao salvar correção de voz:', insertError);
      return false;
    }
    
    console.log("Correção salva com sucesso na tabela principal");
    
    // Adiciona a nova correção à lista de correções conhecidas em memória
    // para que seja aplicada imediatamente sem precisar recarregar da base de dados
    const key = correctedText.toLowerCase();
    const value = originalText.toLowerCase();
    
    if (!knownCorrections[key]) {
      knownCorrections[key] = [value];
    } else if (!knownCorrections[key].includes(value)) {
      knownCorrections[key].push(value);
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar correção de voz:", error);
    return false;
  }
}
