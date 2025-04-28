
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

// Encontra produtos similares baseado no texto reconhecido
export const findSimilarProducts = <T extends { name: string; id: string; category: string }>(
  recognizedText: string,
  products: T[],
  threshold: number = 0.6
): Array<T & { similarity: number }> => {
  const normalizedInput = normalizeText(recognizedText);
  
  return products
    .map(product => ({
      ...product,
      similarity: calculateSimilarity(
        normalizeText(product.name),
        normalizedInput
      )
    }))
    .filter(product => product.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
};
