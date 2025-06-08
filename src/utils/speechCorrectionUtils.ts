
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
 * Extrai valores numéricos de um texto corrigido
 * @param text Texto para extrair valores
 * @returns Objeto com valores encontrados
 */
function extractNumericValues(text: string): { price?: number, quantity?: number } {
  const result: { price?: number, quantity?: number } = {};
  
  // Padrões para encontrar preços
  const pricePatterns = [
    /\b(?:de|por|custa|vale|custou|paguei|gastei)\s+(\d+(?:[,.]\d{1,2})?)\b/i,
    /\b(\d+(?:[,.]\d{1,2})?)\s*(?:kz|kwanzas?|reais?)\b/i,
    /\b(?:r\$|kz)\s*(\d+(?:[,.]\d{1,2})?)\b/i,
    /\b(\d+(?:[,.]\d{1,2})?)\s*(?:cada|unidade|por)\b/i,
  ];

  // Padrões para encontrar quantidade
  const quantityPatterns = [
    /^(\d+)\s+/,  // "2 pacotes..."
    /\b(\d+)\s+(?:unidades?|unids?|pcs?|peças?|pacotes?)\b/i,
  ];

  // Buscar preço
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1].replace(',', '.');
      result.price = parseFloat(priceStr);
      console.log(`Preço extraído após correção: ${result.price}`);
      break;
    }
  }

  // Buscar quantidade
  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.quantity = parseInt(match[1]);
      console.log(`Quantidade extraída após correção: ${result.quantity}`);
      break;
    }
  }

  return result;
}

/**
 * Aplica correções registradas pelo usuário ao texto reconhecido pelo Google Speech
 * FLUXO ATUALIZADO: Aplica correção sempre que o texto reconhecido corresponder
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

    let correctedText = text;
    
    // Normalizar o texto de entrada para comparação (minúsculas, sem espaços extras)
    const normalizeText = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedInput = normalizeText(text);
    
    // Primeiro, tenta correções exatas (case-insensitive)
    for (const correction of corrections) {
      const normalizedOriginal = normalizeText(correction.original_text);
      
      if (normalizedInput === normalizedOriginal) {
        console.log(`Correção exata aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        
        // Extrair valores numéricos do texto corrigido
        const extractedValues = extractNumericValues(correction.corrected_text);
        
        // Se o texto corrigido tem valores numéricos mas o original não tinha, 
        // tentar incorporar esses valores no resultado final
        if (extractedValues.price || extractedValues.quantity) {
          let enhancedText = correction.corrected_text;
          
          // Se encontrou preço mas não estava explícito no texto corrigido, adicionar
          if (extractedValues.price && !correction.corrected_text.match(/\d+(?:[,.]\d{1,2})?\s*(?:kz|reais?)/i)) {
            enhancedText += ` de ${extractedValues.price} kz`;
          }
          
          console.log(`Texto corrigido com valores extraídos: "${enhancedText}"`);
          return enhancedText;
        }
        
        return correction.corrected_text;
      }
    }

    // Depois, tenta correções parciais (palavras similares)
    for (const correction of corrections) {
      const normalizedOriginal = normalizeText(correction.original_text);
      
      // Verifica se o texto original está contido no texto reconhecido
      if (normalizedInput.includes(normalizedOriginal)) {
        console.log(`Correção parcial (contém) aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        const regex = new RegExp(correction.original_text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        correctedText = correctedText.replace(regex, correction.corrected_text);
        
        // Verificar se precisa adicionar valores numéricos
        const extractedValues = extractNumericValues(correctedText);
        if (extractedValues.price && !correctedText.match(/\d+(?:[,.]\d{1,2})?\s*(?:kz|reais?)/i)) {
          correctedText += ` de ${extractedValues.price} kz`;
        }
      }
      // Verifica se o texto reconhecido está contido no original (para casos de reconhecimento parcial)
      else if (normalizedOriginal.includes(normalizedInput)) {
        console.log(`Correção parcial (é parte de) aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        
        // Extrair e aplicar valores numéricos se necessário
        const extractedValues = extractNumericValues(correction.corrected_text);
        let enhancedText = correction.corrected_text;
        
        if (extractedValues.price && !correction.corrected_text.match(/\d+(?:[,.]\d{1,2})?\s*(?:kz|reais?)/i)) {
          enhancedText += ` de ${extractedValues.price} kz`;
        }
        
        return enhancedText;
      }
    }

    // Verifica similaridade por palavras individuais
    const inputWords = normalizedInput.split(' ');
    for (const correction of corrections) {
      const originalWords = normalizeText(correction.original_text).split(' ');
      
      // Se mais de 70% das palavras coincidirem, aplica a correção
      const matchingWords = inputWords.filter(word => 
        originalWords.some(origWord => 
          word.includes(origWord) || origWord.includes(word) || 
          word === origWord
        )
      );
      
      const similarity = matchingWords.length / Math.max(inputWords.length, originalWords.length);
      
      if (similarity >= 0.7) {
        console.log(`Correção por similaridade (${Math.round(similarity * 100)}%) aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        
        // Extrair e aplicar valores numéricos se necessário
        const extractedValues = extractNumericValues(correction.corrected_text);
        let enhancedText = correction.corrected_text;
        
        if (extractedValues.price && !correction.corrected_text.match(/\d+(?:[,.]\d{1,2})?\s*(?:kz|reais?)/i)) {
          enhancedText += ` de ${extractedValues.price} kz`;
        }
        
        return enhancedText;
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
    
    return possibleCorrections;
  } catch (error) {
    console.error("Erro ao buscar possíveis correções:", error);
    return [];
  }
}
