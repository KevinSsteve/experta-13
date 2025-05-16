
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

// Cache para evitar consultas repetidas
let correctionsCache: { [userId: string]: SpeechCorrection[] } = {};
let lastCacheTime: { [userId: string]: number } = {};
const CACHE_TTL = 30000; // 30 segundos

/**
 * Limpa o cache de correções para forçar uma nova consulta
 */
export function clearCorrectionsCache(userId?: string) {
  if (userId) {
    delete correctionsCache[userId];
    delete lastCacheTime[userId];
  } else {
    correctionsCache = {};
    lastCacheTime = {};
  }
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
    // Verifica se há um cache válido
    const now = Date.now();
    let corrections: SpeechCorrection[] = [];
    
    if (correctionsCache[userId] && lastCacheTime[userId] && (now - lastCacheTime[userId] < CACHE_TTL)) {
      corrections = correctionsCache[userId];
      console.log('Usando correções em cache para', userId);
    } else {
      // Busca as correções ativas do usuário
      const { data: fetchedCorrections, error } = await supabase
        .from("speech_corrections")
        .select("id, original_text, corrected_text, user_id, active, created_at")
        .eq("user_id", userId)
        .eq("active", true);

      if (error) {
        console.error("Erro ao buscar correções de voz:", error);
        return text;
      }
      
      corrections = fetchedCorrections || [];
      
      // Atualiza o cache
      correctionsCache[userId] = corrections;
      lastCacheTime[userId] = now;
      console.log('Correções de voz atualizadas no cache:', corrections.length);
    }

    // Se não há correções, tenta usar correções automáticas baseadas em produtos comuns
    if (corrections.length === 0) {
      return await applyProductBasedCorrections(text, userId);
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
      // Adiciona limites de palavra (\b) para evitar substituições parciais indesejadas
      const regex = new RegExp(
        '\\b' + correction.original_text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 
        'gi'
      );
      
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
 * Função para aplicar correções automáticas baseadas em produtos cadastrados
 * @param text Texto reconhecido pelo Google Speech
 * @param userId ID do usuário 
 * @returns Texto corrigido com base em produtos conhecidos
 */
async function applyProductBasedCorrections(text: string, userId?: string): Promise<string> {
  if (!userId || !text) return text;
  
  try {
    const normalizedText = text.toLowerCase();
    
    // Busca produtos do usuário
    const { data: products, error } = await supabase
      .from("products")
      .select("name, category")
      .eq("user_id", userId);
      
    if (error || !products) {
      console.error("Erro ao buscar produtos para correções:", error);
      return text;
    }
    
    // Lista de variações fonéticas conhecidas
    const phoneticVariations: {[key: string]: string[]} = {
      'yummy': ['iumi', 'iume', 'yume', 'iumi', 'filme', 'iami', 'yumi'],
      'tibone': ['tibana', 'tea bone', 'te bone', 'ti bone', 'tivone', 'tibo', 'tim bom']
    };
    
    // Para cada produto, verifica se há variações fonéticas conhecidas
    for (const product of products) {
      const productName = product.name.toLowerCase().trim();
      
      // Verifica se temos variações fonéticas para este produto
      for (const [realProduct, variations] of Object.entries(phoneticVariations)) {
        // Se o nome do produto contém o produto real
        if (productName.includes(realProduct.toLowerCase())) {
          // Verifica se o texto reconhecido contém alguma variação fonética
          for (const variation of variations) {
            if (normalizedText.includes(variation.toLowerCase())) {
              console.log(`Correção baseada em produto aplicada: "${variation}" -> "${realProduct}"`);
              return text.replace(new RegExp(variation, 'gi'), realProduct);
            }
          }
        }
      }
      
      // Para produtos que não têm variações cadastradas, verifica se há semelhança fonética simples
      // Este é um fallback simplificado
      const productWords = productName.split(' ');
      const textWords = normalizedText.split(' ');
      
      for (const productWord of productWords) {
        if (productWord.length < 3) continue; // Ignorar palavras muito curtas
        
        for (const textWord of textWords) {
          // Semelhança simples baseada nos primeiros caracteres
          if (productWord.substring(0, 3) === textWord.substring(0, 3) && 
              Math.abs(productWord.length - textWord.length) <= 2) {
            console.log(`Possível correção fonética: "${textWord}" -> "${productWord}"`);
            return text.replace(new RegExp('\\b' + textWord + '\\b', 'gi'), productWord);
          }
        }
      }
    }
    
    // Aplicar correções comuns em português angolano
    const commonCorrections = applyCommonCorrections(text);
    if (commonCorrections !== text) {
      return commonCorrections;
    }
    
    return text;
  } catch (error) {
    console.error("Erro ao aplicar correções baseadas em produtos:", error);
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
    // Verifica se há um cache válido
    const now = Date.now();
    let corrections: SpeechCorrection[] = [];
    
    if (correctionsCache[userId] && lastCacheTime[userId] && (now - lastCacheTime[userId] < CACHE_TTL)) {
      corrections = correctionsCache[userId];
    } else {
      // Busca palavras problemáticas conhecidas no texto
      const { data: fetchedCorrections, error } = await supabase
        .from("speech_corrections")
        .select("original_text")
        .eq("user_id", userId)
        .eq("active", true);

      if (error) {
        console.error("Erro ao verificar correções:", error);
        return false;
      }
      
      corrections = fetchedCorrections || [];
      
      // Atualiza o cache
      correctionsCache[userId] = corrections;
      lastCacheTime[userId] = now;
    }

    if (corrections.length === 0) {
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
    // Verifica se há um cache válido
    const now = Date.now();
    let corrections: SpeechCorrection[] = [];
    
    if (correctionsCache[userId] && lastCacheTime[userId] && (now - lastCacheTime[userId] < CACHE_TTL)) {
      corrections = correctionsCache[userId];
    } else {
      // Buscar todas as correções ativas do usuário
      const { data: fetchedCorrections, error } = await supabase
        .from("speech_corrections")
        .select("original_text, corrected_text")
        .eq("user_id", userId)
        .eq("active", true);
        
      if (error) {
        console.error("Erro ao buscar correções:", error);
        return [];
      }
      
      corrections = fetchedCorrections || [];
      
      // Atualiza o cache
      correctionsCache[userId] = corrections;
      lastCacheTime[userId] = now;
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
    
    // Busca por produtos cujos nomes possam ser relevantes
    const { data: products, error } = await supabase
      .from("products")
      .select("name")
      .eq("user_id", userId)
      .order("name");
    
    if (!error && products && products.length > 0) {
      const normalizedText = text.toLowerCase();
      const textWords = normalizedText.split(/\s+/);
      
      for (const product of products) {
        const productName = product.name.toLowerCase();
        
        // Verifica similaridade fonética simples
        if (normalizedText.includes(productName.substring(0, Math.min(3, productName.length)))) {
          possibleCorrections.push(product.name);
          continue;
        }
        
        // Verifica palavras individuais
        const productWords = productName.split(/\s+/);
        for (const productWord of productWords) {
          if (productWord.length < 3) continue;
          
          for (const textWord of textWords) {
            if (textWord.length < 3) continue;
            
            if (productWord.substring(0, 3) === textWord.substring(0, 3)) {
              possibleCorrections.push(product.name);
              break;
            }
          }
        }
      }
    }
    
    return [...new Set(possibleCorrections)]; // Remove duplicados
  } catch (error) {
    console.error("Erro ao buscar possíveis correções:", error);
    return [];
  }
}

/**
 * Aplica correções automáticas para erros comuns de reconhecimento de voz
 */
function applyCommonCorrections(text: string): string {
  // Lista de correções comuns para o idioma português
  const commonMistakes: {[key: string]: string} = {
    'tibana': 'tibone',
    'tea bone': 'tibone',
    'te bone': 'tibone',
    'ti bone': 'tibone',
    'tivone': 'tibone',
    'tibo': 'tibone',
    'tim bom': 'tibone',
    'tin bon': 'tibone',
    'iumi': 'yummy',
    'iume': 'yummy',
    'yume': 'yummy',
    'filme': 'yummy',
    'iami': 'yummy',
    'yumi': 'yummy'
  };
  
  let correctedText = text.toLowerCase();
  
  // Aplicar as correções comuns
  Object.entries(commonMistakes).forEach(([mistake, correction]) => {
    correctedText = correctedText.replace(new RegExp(`\\b${mistake}\\b`, 'gi'), correction);
  });
  
  return correctedText;
}
