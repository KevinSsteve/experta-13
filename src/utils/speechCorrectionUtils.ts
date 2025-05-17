
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

// Tipos parciais para usar em diferentes contextos
interface PartialSpeechCorrection {
  original_text: string;
  corrected_text?: string;
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
    console.log(`Aplicando correções de voz para texto: "${text}"`);
    
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
      console.log('Correções disponíveis:', corrections);
    }

    // Se não há correções, tenta usar correções automáticas baseadas em produtos comuns
    if (corrections.length === 0) {
      console.log('Nenhuma correção de usuário encontrada, tentando correções automáticas...');
      return await applyProductBasedCorrections(text, userId);
    }

    // Log para debug - mostrar todas as correções disponíveis
    console.log("Correções disponíveis:", corrections.map(c => `"${c.original_text}" -> "${c.corrected_text}"`));
    console.log("Texto original para correção:", text);

    // Aplicar correções exatas primeiro (case-insensitive)
    let correctedText = text;
    const lowerText = text.toLowerCase();
    
    for (const correction of corrections) {
      const lowerOriginal = correction.original_text.toLowerCase();
      
      // Correção exata (case-insensitive)
      if (lowerText === lowerOriginal) {
        console.log(`Correção exata aplicada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        return correction.corrected_text;
      }
    }

    // Se não encontrou correção exata, tenta correções parciais
    let wasAnyCorrection = false;
    
    for (const correction of corrections) {
      const lowerOriginal = correction.original_text.toLowerCase();
      
      // Verifica se o texto contém a string original (case-insensitive)
      // Adiciona limites de palavra (\b) para evitar substituições parciais indesejadas
      // Mas também tenta uma correspondência mais flexível para capturar mais casos
      if (lowerText.includes(lowerOriginal)) {
        console.log(`Correção parcial aplicada (substring): "${correction.original_text}" -> "${correction.corrected_text}"`);
        // Cria um regex que não é tão estrito para capturar variações
        const regex = new RegExp(correction.original_text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        correctedText = correctedText.replace(regex, correction.corrected_text);
        wasAnyCorrection = true;
        continue;
      }
      
      // Tentativa com limites de palavra para termos mais específicos
      const wordBoundaryRegex = new RegExp('\\b' + correction.original_text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
      if (wordBoundaryRegex.test(correctedText)) {
        console.log(`Correção parcial aplicada (palavra completa): "${correction.original_text}" -> "${correction.corrected_text}"`);
        correctedText = correctedText.replace(wordBoundaryRegex, correction.corrected_text);
        wasAnyCorrection = true;
      }
    }
    
    if (wasAnyCorrection) {
      console.log("Texto após correções de usuário:", correctedText);
      return correctedText;
    }

    // Se não conseguiu aplicar correções específicas do usuário, tenta correções comuns
    const commonCorrectedText = applyCommonCorrections(text);
    if (commonCorrectedText !== text) {
      console.log(`Correção comum aplicada: "${text}" -> "${commonCorrectedText}"`);
      return commonCorrectedText;
    }

    console.log("Nenhuma correção aplicada para o texto:", text);
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
    console.log(`Tentando aplicar correções baseadas em produtos para: "${text}"`);
    
    // Busca produtos do usuário
    const { data: products, error } = await supabase
      .from("products")
      .select("name, category")
      .eq("user_id", userId);
      
    if (error || !products) {
      console.error("Erro ao buscar produtos para correções:", error);
      return text;
    }
    
    console.log(`Produtos encontrados para comparação: ${products.length}`);
    
    // Lista de variações fonéticas conhecidas
    const phoneticVariations: {[key: string]: string[]} = {
      'yummy': ['iumi', 'iume', 'yume', 'iumi', 'filme', 'iami', 'yumi'],
      'tibone': ['tibana', 'tea bone', 'te bone', 'ti bone', 'tivone', 'tibo', 'tim bom', 'tin bon', 'que bom né', 'que bom ne']
    };
    
    // Para cada produto, verifica se há variações fonéticas conhecidas
    for (const product of products) {
      const productName = product.name.toLowerCase().trim();
      console.log(`Verificando produto: ${productName}`);
      
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
      
      // Verificação direta para yummy e tibone (independente de estar no catálogo)
      if (normalizedText.includes('filme')) {
        console.log('Correção direta aplicada: "filme" -> "yummy"');
        return text.replace(/filme/gi, 'yummy');
      }
      if (normalizedText.includes('tibana') || normalizedText.includes('que bom né') || normalizedText.includes('que bom ne')) {
        console.log('Correção direta aplicada: "tibana/que bom né" -> "tibone"');
        let corrected = text.replace(/tibana/gi, 'tibone');
        corrected = corrected.replace(/que bom né/gi, 'tibone');
        corrected = corrected.replace(/que bom ne/gi, 'tibone');
        return corrected;
      }
      
      // Verificar se o texto é muito semelhante ao nome do produto
      // Esta abordagem é útil para novos produtos que o usuário adicionou
      if (levenshteinDistance(normalizedText, productName) <= 3) {
        console.log(`Correção por similaridade: "${text}" -> "${product.name}"`);
        return product.name;
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
 * Calcula a distância de Levenshtein (distância de edição) entre duas strings
 * Útil para encontrar palavras semelhantes com pequenas diferenças de digitação ou pronúncia
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Inicializar a matriz
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Preencher a matriz
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // exclusão
        );
      }
    }
  }

  return matrix[b.length][a.length];
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
        .select("id, original_text, corrected_text, user_id, active, created_at")
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
    const lowerText = text.toLowerCase();
    for (const correction of corrections) {
      if (lowerText.includes(correction.original_text.toLowerCase())) {
        return true;
      }
    }
    
    // Verifica variações fonéticas conhecidas
    if (lowerText.includes('filme') || lowerText.includes('iumi') || lowerText.includes('yumi') || 
        lowerText.includes('tibana') || lowerText.includes('tibo') || 
        lowerText.includes('que bom né') || lowerText.includes('que bom ne')) {
      return true;
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
    console.log(`Buscando possíveis correções para: "${text}"`);
    
    // Verifica se há um cache válido
    const now = Date.now();
    let corrections: SpeechCorrection[] = [];
    
    if (correctionsCache[userId] && lastCacheTime[userId] && (now - lastCacheTime[userId] < CACHE_TTL)) {
      corrections = correctionsCache[userId];
    } else {
      // Buscar todas as correções ativas do usuário
      const { data: fetchedCorrections, error } = await supabase
        .from("speech_corrections")
        .select("id, original_text, corrected_text, user_id, active, created_at")
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
          console.log(`Correção possível encontrada: "${correction.original_text}" -> "${correction.corrected_text}"`);
        }
      }
      
      // Verificar também se o texto está próximo da correção original
      // usando a distância de Levenshtein para detectar erros de digitação/pronúncia
      if (levenshteinDistance(text.toLowerCase(), correction.original_text.toLowerCase()) <= 3) {
        if (!possibleCorrections.includes(correction.corrected_text)) {
          possibleCorrections.push(correction.corrected_text);
          console.log(`Correção possível por similaridade: "${correction.original_text}" -> "${correction.corrected_text}"`);
        }
      }
    }
    
    // Verificação direta para correções comuns
    const lowerText = text.toLowerCase();
    if (lowerText.includes('filme')) {
      possibleCorrections.push('yummy');
      console.log('Correção direta possível: "filme" -> "yummy"');
    }
    if (lowerText.includes('tibana') || lowerText.includes('tea bone') || lowerText.includes('tibo') || 
        lowerText.includes('que bom né') || lowerText.includes('que bom ne')) {
      possibleCorrections.push('tibone');
      console.log('Correção direta possível: "tibana/que bom né" -> "tibone"');
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
        
        // Verificar se o texto é muito semelhante ao nome do produto
        if (levenshteinDistance(normalizedText, productName) <= 3) {
          possibleCorrections.push(product.name);
          console.log(`Produto similar encontrado: "${text}" -> "${product.name}"`);
          continue;
        }
        
        // Verifica similaridade fonética simples
        if (normalizedText.includes(productName.substring(0, Math.min(3, productName.length)))) {
          possibleCorrections.push(product.name);
          console.log(`Produto com prefixo similar: "${text}" contém início de "${product.name}"`);
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
              console.log(`Palavra similar encontrada: "${textWord}" similar a "${productWord}" em "${product.name}"`);
              break;
            }
          }
        }
      }
    }
    
    // Remover duplicados e retornar
    const uniqueCorrections = [...new Set(possibleCorrections)];
    console.log(`Total de correções possíveis encontradas: ${uniqueCorrections.length}`);
    return uniqueCorrections;
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
    'que bom né': 'tibone',
    'que bom ne': 'tibone',
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
    // Usando o método de substituição mais flexível para capturar mais casos
    const regex = new RegExp(mistake.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    if (regex.test(correctedText)) {
      console.log(`Aplicando correção comum: "${mistake}" -> "${correction}"`);
      correctedText = correctedText.replace(regex, correction);
    }
  });
  
  return correctedText;
}

/**
 * Salva uma nova correção de voz
 * @param userId ID do usuário
 * @param originalText Texto original reconhecido incorretamente
 * @param correctedText Texto corrigido
 * @returns Success status
 */
export async function saveVoiceCorrection(userId: string, originalText: string, correctedText: string): Promise<boolean> {
  if (!userId || !originalText || !correctedText) {
    console.error("Dados incompletos para salvar correção de voz");
    return false;
  }

  try {
    console.log(`Salvando correção de voz: "${originalText}" -> "${correctedText}"`);
    
    // Verificar se já existe uma correção similar
    const { data: existingCorrections, error: searchError } = await supabase
      .from("speech_corrections")
      .select("id")
      .eq("user_id", userId)
      .eq("original_text", originalText)
      .eq("active", true);

    if (searchError) {
      console.error("Erro ao buscar correções existentes:", searchError);
      return false;
    }

    // Se já existir, atualizar em vez de inserir
    if (existingCorrections && existingCorrections.length > 0) {
      const { error: updateError } = await supabase
        .from("speech_corrections")
        .update({ corrected_text: correctedText })
        .eq("id", existingCorrections[0].id);

      if (updateError) {
        console.error("Erro ao atualizar correção existente:", updateError);
        return false;
      }

      console.log("Correção existente atualizada com sucesso");
      
      // Limpar o cache para forçar nova consulta
      clearCorrectionsCache(userId);
      
      return true;
    }

    // Se não existir, inserir nova correção
    const { error: insertError } = await supabase
      .from("speech_corrections")
      .insert({
        user_id: userId,
        original_text: originalText,
        corrected_text: correctedText,
        active: true
      });

    if (insertError) {
      console.error("Erro ao inserir nova correção:", insertError);
      return false;
    }

    console.log("Nova correção inserida com sucesso");
    
    // Removendo o código que tenta acessar uma tabela inexistente
    try {
      // Nota: tentamos salvar em uma tabela secundária, mas isso não é mais necessário
      // O código foi removido para evitar erros de TypeScript
      console.log("Correção salva com sucesso na tabela principal");
    } catch (backupError) {
      // Ignorar erros pois a funcionalidade de backup foi removida
      console.log("Correção principal foi salva com sucesso");
    }
    
    // Limpar o cache para forçar nova consulta
    clearCorrectionsCache(userId);
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar correção de voz:", error);
    return false;
  }
}
