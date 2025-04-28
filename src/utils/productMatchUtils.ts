
// Função para remover acentos e caracteres especiais
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
};

// Calcula a distância de Levenshtein entre duas strings
const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
};

// Calcula a similaridade entre duas strings (0 a 1)
const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
};

// Verifica se uma string contém outra, independentemente de acentos
const containsSubstring = (text: string, search: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedSearch = normalizeText(search);
  return normalizedText.includes(normalizedSearch);
};

// Calcula similaridade por palavras individuais (útil para produtos com múltiplas palavras)
const calculateWordSimilarity = (text1: string, text2: string): number => {
  // Divide as strings em palavras
  const words1 = text1.split(/\s+/).filter(w => w.length > 1);
  const words2 = text2.split(/\s+/).filter(w => w.length > 1);
  
  if (words1.length === 0 || words2.length === 0) {
    return calculateSimilarity(text1, text2);
  }
  
  // Para cada palavra em text1, encontra a melhor correspondência em text2
  let totalSimilarity = 0;
  let matches = 0;
  let exactMatches = 0;
  
  for (const word1 of words1) {
    let bestMatch = 0;
    for (const word2 of words2) {
      if (normalizeText(word1) === normalizeText(word2)) {
        // Correspondência exata tem pontuação máxima
        bestMatch = 1;
        exactMatches++;
        break;
      }
      const similarity = calculateSimilarity(normalizeText(word1), normalizeText(word2));
      bestMatch = Math.max(bestMatch, similarity);
    }
    
    // Considera correspondências com pontuação mais baixa (0.4) para capturar mais resultados
    if (bestMatch > 0.4) {
      totalSimilarity += bestMatch;
      matches++;
    }
  }
  
  // Bônus para correspondências exatas
  let wordMatchScore = matches > 0 ? totalSimilarity / matches : 0;
  if (exactMatches > 0) {
    // Aumenta a pontuação para correspondências exatas
    wordMatchScore = wordMatchScore * 0.7 + 0.3 * (exactMatches / words1.length);
  }
  
  // Calcula similaridade completa do texto
  const fullTextScore = calculateSimilarity(text1, text2);
  
  // Combina as pontuações com pesos
  return 0.7 * wordMatchScore + 0.3 * fullTextScore;
};

// Função adicional para verificar correspondências parciais
const checkPartialMatches = (input: string, productName: string): number => {
  const normalizedInput = normalizeText(input);
  const normalizedName = normalizeText(productName);
  
  // Verifica se o nome do produto contém exatamente o termo de busca
  if (normalizedName.includes(normalizedInput)) {
    // Quanto mais próximo o comprimento, maior a pontuação
    const lengthRatio = normalizedInput.length / normalizedName.length;
    // Retorna uma pontuação alta para correspondências parciais exatas
    return 0.7 + (0.3 * lengthRatio);
  }
  
  return 0;
};

// Encontra produtos similares baseado no texto reconhecido
export const findSimilarProducts = <T extends { name: string; id: string; category: string; price: number; stock: number }>(
  recognizedText: string,
  products: T[],
  threshold: number = 0.4  // Reduzido para 0.4 para encontrar mais correspondências
): Array<T & { similarity: number }> => {
  if (!recognizedText || recognizedText.trim() === '') {
    console.log('Texto de busca vazio. Não é possível buscar produtos.');
    return [];
  }
  
  console.log(`Buscando por: "${recognizedText}" em ${products.length} produtos`);
  const normalizedInput = normalizeText(recognizedText);
  
  // Divide o texto em palavras para buscar cada uma separadamente
  const searchTerms = normalizedInput.split(/\s+/).filter(term => term.length > 1);
  
  if (searchTerms.length === 0) {
    console.log('Nenhum termo de busca válido após normalização');
    return [];
  }
  
  console.log(`Termos de busca normalizados: ${searchTerms.join(', ')}`);
  
  return products
    .map(product => {
      // Nome normalizado do produto
      const normalizedName = normalizeText(product.name);
      const normalizedCategory = normalizeText(product.category);
      
      // Verifica correspondências exatas primeiro
      const hasExactMatch = searchTerms.some(term => 
        normalizedName.includes(term) || normalizedCategory.includes(term)
      );
      
      // Calcula similaridade melhorada considerando palavras individuais
      const nameSimilarity = calculateWordSimilarity(
        normalizedName,
        normalizedInput
      );
      
      // Verifica correspondências parciais
      const partialMatchScore = searchTerms.reduce((score, term) => {
        return Math.max(score, checkPartialMatches(term, product.name));
      }, 0);
      
      // Calcula similaridade com a categoria (com peso menor)
      const categorySimilarity = calculateSimilarity(
        normalizedCategory,
        normalizedInput
      ) * 0.5; // Peso menor para categoria
      
      // Determina a pontuação final combinando todas as métricas
      let similarity = Math.max(nameSimilarity, categorySimilarity, partialMatchScore);
      
      // Bônus para correspondências exatas
      if (hasExactMatch) {
        similarity = Math.min(1, similarity + 0.2);
      }
      
      return {
        ...product,
        similarity
      };
    })
    .filter(product => {
      // Log para ajudar a depurar por que produtos específicos foram incluídos/excluídos
      if (product.name.toLowerCase().includes('leite')) {
        console.log(`Produto: ${product.name}, Similaridade: ${product.similarity.toFixed(2)}, Incluído: ${product.similarity >= threshold}`);
      }
      return product.similarity >= threshold;
    })
    .sort((a, b) => b.similarity - a.similarity);
};
