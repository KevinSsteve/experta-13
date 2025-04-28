
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
  
  for (const word1 of words1) {
    let bestMatch = 0;
    for (const word2 of words2) {
      const similarity = calculateSimilarity(word1, word2);
      bestMatch = Math.max(bestMatch, similarity);
    }
    if (bestMatch > 0.6) { // Considera apenas correspondências razoáveis
      totalSimilarity += bestMatch;
      matches++;
    }
  }
  
  // Calcula similaridade combinada
  const wordMatchScore = matches > 0 ? totalSimilarity / matches : 0;
  const fullTextScore = calculateSimilarity(text1, text2);
  
  // Peso maior para correspondências de palavras individuais
  return 0.7 * wordMatchScore + 0.3 * fullTextScore;
};

// Encontra produtos similares baseado no texto reconhecido
export const findSimilarProducts = <T extends { name: string; id: string; category: string }>(
  recognizedText: string,
  products: T[],
  threshold: number = 0.5  // Reduzido de 0.6 para 0.5 para encontrar mais correspondências
): Array<T & { similarity: number }> => {
  const normalizedInput = normalizeText(recognizedText);
  
  return products
    .map(product => {
      // Calcula similaridade melhorada considerando palavras individuais
      const nameSimilarity = calculateWordSimilarity(
        normalizeText(product.name),
        normalizedInput
      );
      
      // Calcula similaridade com a categoria também (com peso menor)
      const categorySimilarity = calculateSimilarity(
        normalizeText(product.category),
        normalizedInput
      ) * 0.5; // Peso menor para categoria
      
      // Usa o máximo das duas similaridades
      const similarity = Math.max(nameSimilarity, categorySimilarity);
      
      return {
        ...product,
        similarity
      };
    })
    .filter(product => product.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
};
