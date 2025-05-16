import { ParsedVoiceItem } from './voiceUtils';
import { Product } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { clearCorrectionsCache } from './speechCorrectionUtils';

export interface EnhancedVoiceItem extends ParsedVoiceItem {
  quantity: number;
  confidence: number;
  originalText: string;
}

// Função para extrair quantidade, nome e preço de um pedido por voz
export function parseVoiceOrder(text: string): EnhancedVoiceItem {
  const originalText = text;
  // Remove palavras comuns desnecessárias
  const cleanText = text
    .toLowerCase()
    .replace(/(quero|adicionar|comprar|colocar|no carrinho|por favor|preciso|de|um|uma)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Padrões para extrair quantidades
  const quantityPatterns = [
    /(\d+)\s+(unidades|unidade|un|pacote|pacotes|caixa|caixas|kg|kilo|kilos|quilo|quilos|litro|litros|l)\s+(?:de\s+)?(.+)/i,
    /(\d+)\s+(.+)/i,
  ];
  
  // Padrões para encontrar preços
  const pricePatterns = [
    /\b(?:de|por|custa|vale)\s+(\d+(?:[,.]\d{1,2})?)\b/,
    /\b(?:de|por|custa|vale)\s+(\d+)\s*(?:reais|kwanzas|kzs)\b/i,
    /\b(?:de|por|custa|vale)\s+(?:r\$\s*|kz\s*)?(\d+(?:[,.]\d{1,2})?)\b/i,
    /\b(\d+(?:[,.]\d{1,2})?)\s*(?:reais|kwanzas|kzs)\b/i,
    /\b(?:r\$\s*|kz\s*)?(\d+(?:[,.]\d{1,2})?)\b/i
  ];

  let quantity = 1; // Quantidade padrão
  let price: number | undefined;
  let name = cleanText;
  let confidence = 0.5; // Confiança padrão

  // Tenta extrair quantidade primeiro
  for (const pattern of quantityPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      // Se encontrou um padrão que menciona unidade específica
      if (match.length > 2) {
        quantity = parseInt(match[1]);
        name = match[match.length - 1].trim();
        confidence = 0.7; // Maior confiança quando detecta quantidade específica
      } else if (match.length > 1) {
        // Padrão simples de número seguido por item
        quantity = parseInt(match[1]);
        name = match[2].trim();
        confidence = 0.6;
      }
      break;
    }
  }

  // Depois tenta extrair preço
  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const priceStr = match[1].replace(',', '.');
      price = parseFloat(priceStr);
      // Remove a parte do preço do nome do produto
      name = cleanText.replace(pattern, "").trim();
      confidence += 0.1; // Aumenta a confiança quando detecta preço
      break;
    }
  }

  // Se o nome ainda contém números no início, pode ser uma quantidade não capturada pelos padrões
  const leadingNumberMatch = name.match(/^(\d+)\s+(.+)$/);
  if (leadingNumberMatch && quantity === 1) {
    quantity = parseInt(leadingNumberMatch[1]);
    name = leadingNumberMatch[2];
  }

  // Limpa o nome de possíveis artefatos
  name = name
    .replace(/^\s*(de|da|do)\s+/, '')
    .replace(/\s+(de|da|do)\s+/, ' ')
    .trim();

  return {
    name,
    price,
    quantity,
    confidence,
    originalText
  };
}

// Função para normalizar texto para busca
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Função para encontrar o melhor produto correspondente
export function findBestProductMatch(
  parsedOrder: EnhancedVoiceItem,
  products: Product[]
): { product: Product; confidence: number } | null {
  if (products.length === 0) return null;

  const normalizedQuery = normalizeText(parsedOrder.name);
  
  // Primeiro tentamos encontrar correspondências exatas
  const exactMatches = products.filter(product => 
    normalizeText(product.name) === normalizedQuery ||
    (product.code && normalizeText(product.code) === normalizedQuery)
  );
  
  if (exactMatches.length > 0) {
    return {
      product: exactMatches[0],
      confidence: 1.0
    };
  }
  
  // Depois tentamos encontrar correspondências parciais
  let bestMatch: { product: Product; confidence: number } | null = null;
  
  products.forEach(product => {
    const normalizedProductName = normalizeText(product.name);
    let score = 0;
    
    // Verifica se o produto contém todas as palavras da consulta
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 2);
    const matchedWords = queryWords.filter(word => 
      normalizedProductName.includes(word)
    );
    
    if (matchedWords.length > 0) {
      // Pontuação baseada na proporção de palavras encontradas
      score = matchedWords.length / queryWords.length;
      
      // Bônus se o nome do produto começa com a consulta
      if (normalizedProductName.startsWith(normalizedQuery)) {
        score += 0.2;
      }
      
      // Bônus se houver correspondência com a categoria
      if (normalizeText(product.category).includes(normalizedQuery)) {
        score += 0.1;
      }
      
      // Se o preço foi especificado, damos bônus para produtos com preço similar
      if (parsedOrder.price && product.price) {
        const priceDiff = Math.abs(product.price - parsedOrder.price);
        const priceRatio = priceDiff / product.price;
        
        if (priceRatio < 0.1) { // Diferença menor que 10%
          score += 0.2;
        } else if (priceRatio < 0.2) { // Diferença menor que 20%
          score += 0.1;
        }
      }
      
      // Atualiza o melhor resultado se este for melhor
      if (!bestMatch || score > bestMatch.confidence) {
        bestMatch = {
          product,
          confidence: score
        };
      }
    }
  });
  
  // Aplica um fator de confiança mínimo
  if (bestMatch && bestMatch.confidence < 0.3) {
    return null;
  }
  
  return bestMatch;
}

// Interface para registro de treinamento
export interface VoiceOrderTrainingData {
  voiceInput: string;
  parsedOrder: EnhancedVoiceItem;
  selectedProduct: Product | null;
  userCorrected: boolean;
  correctProduct?: Product;
  timestamp: number;
  contextData?: any;
  alternativeTerms?: string[];
  deviceInfo?: string;
  feedbackRating?: number;
}

// Função para salvar dados de treinamento tanto localmente quanto no Supabase
export async function saveTrainingData(data: VoiceOrderTrainingData): Promise<void> {
  try {
    // 1. Salvar no localStorage como antes
    const storedData = localStorage.getItem('voiceOrderTraining');
    let trainingData: VoiceOrderTrainingData[] = [];
    
    if (storedData) {
      trainingData = JSON.parse(storedData);
    }
    
    // Adicionamos informações extras do dispositivo
    if (!data.deviceInfo) {
      data.deviceInfo = navigator.userAgent;
    }
    
    // Limitamos a 100 entradas para não sobrecarregar o localStorage
    if (trainingData.length > 100) {
      trainingData = trainingData.slice(-100);
    }
    
    trainingData.push(data);
    localStorage.setItem('voiceOrderTraining', JSON.stringify(trainingData));
    
    // 2. Salvar também no Supabase se o usuário estiver autenticado
    const { data: userData } = await supabase.auth.getUser();
    if (userData && userData.user) {
      const userId = userData.user.id;
      
      // Preparar os dados para o formato da tabela
      const voiceInput = data.voiceInput || data.parsedOrder.originalText;
      const selectedProduct = data.selectedProduct;
      const correctProduct = data.correctProduct;
      
      await supabase.from('voice_training_backups').insert({
        user_id: userId,
        voice_input: voiceInput,
        suggested_product_id: selectedProduct?.id,
        suggested_product_name: selectedProduct?.name,
        correct_product_id: correctProduct?.id,
        correct_product_name: correctProduct?.name,
        was_helpful: data.feedbackRating ? data.feedbackRating > 0 : null,
        feedback: JSON.stringify(data),
        alternative_terms: data.alternativeTerms || [],
        created_at: new Date().toISOString()
      });

      console.log('Dados de treinamento salvos no Supabase e no localStorage');
    } else {
      console.log('Usuário não autenticado. Dados salvos apenas no localStorage.');
    }
  } catch (error) {
    console.error('Erro ao salvar dados de treinamento:', error);
  }
}

// Função para obter dados de treinamento
export function getTrainingData(): VoiceOrderTrainingData[] {
  try {
    const storedData = localStorage.getItem('voiceOrderTraining');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Erro ao recuperar dados de treinamento:', error);
  }
  
  return [];
}

/**
 * Buscar possíveis correções para um texto reconhecido por voz
 * Esta função consulta as correções de voz cadastradas pelo usuário
 * e retorna termos alternativos que poderiam ser usados para busca
 */
export async function findPossibleCorrections(text: string, userId?: string): Promise<string[]> {
  if (!userId || !text) {
    return [];
  }
  
  try {
    // Normalizar o texto de entrada para comparação
    const normalizedInput = normalizeText(text);
    
    // Limpa o cache de correções antes de buscar as mais recentes
    clearCorrectionsCache();
    
    // Buscar correções de fala do usuário
    const { data: corrections, error } = await supabase
      .from("speech_corrections")
      .select("original_text, corrected_text")
      .eq("user_id", userId)
      .eq("active", true);
      
    if (error || !corrections) {
      console.error("Erro ao buscar correções de voz:", error);
      return [];
    }
    
    // Array para armazenar possíveis correções
    const possibleCorrections: string[] = [];
    
    // Verificar se alguma das correções cadastradas se aplica ao texto
    for (const correction of corrections) {
      const originalNormalized = normalizeText(correction.original_text);
      
      // Verificar correção exata
      if (normalizedInput === originalNormalized) {
        possibleCorrections.push(correction.corrected_text);
      }
      // Verificar se contém a palavra ou frase original
      else if (normalizedInput.includes(originalNormalized)) {
        const correctedText = text.replace(
          new RegExp(correction.original_text, 'gi'),
          correction.corrected_text
        );
        possibleCorrections.push(correctedText);
      }
      // Verificar se há similaridade significativa (palavras compartilhadas)
      else {
        const inputWords = normalizedInput.split(' ');
        const originalWords = originalNormalized.split(' ');
        
        // Verificar se há pelo menos 40% de palavras compartilhadas
        const commonWords = originalWords.filter(word => inputWords.includes(word));
        if (commonWords.length > 0 && commonWords.length / originalWords.length >= 0.4) {
          possibleCorrections.push(correction.corrected_text);
        }
      }
    }
    
    // Adicionar correções de erros comuns de reconhecimento do Google Speech
    const commonCorrections = applyCommonCorrections(text);
    if (commonCorrections !== text) {
      possibleCorrections.push(commonCorrections);
    }
    
    // Retornar array com as correções possíveis, removendo duplicatas
    return [...new Set(possibleCorrections)];
  } catch (error) {
    console.error("Erro ao buscar correções possíveis:", error);
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
    'tin bon': 'tibone'
  };
  
  let correctedText = text.toLowerCase();
  
  // Aplicar as correções comuns
  Object.entries(commonMistakes).forEach(([mistake, correction]) => {
    correctedText = correctedText.replace(new RegExp(`\\b${mistake}\\b`, 'gi'), correction);
  });
  
  return correctedText;
}
