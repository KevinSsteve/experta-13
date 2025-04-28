
import { ParsedVoiceItem } from './voiceUtils';
import { Product } from '@/contexts/CartContext';

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
}

// Função para salvar dados de treinamento
export function saveTrainingData(data: VoiceOrderTrainingData): void {
  try {
    const storedData = localStorage.getItem('voiceOrderTraining');
    let trainingData: VoiceOrderTrainingData[] = [];
    
    if (storedData) {
      trainingData = JSON.parse(storedData);
    }
    
    // Limitamos a 100 entradas para não sobrecarregar o localStorage
    if (trainingData.length > 100) {
      trainingData = trainingData.slice(-100);
    }
    
    trainingData.push(data);
    localStorage.setItem('voiceOrderTraining', JSON.stringify(trainingData));
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
