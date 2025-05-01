
// Função para normalizar texto em buscas
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/gi, '') // Remove caracteres especiais
    .trim();
}

// Função para calcular similaridade entre dois textos
export function calculateSimilarity(text1: string, text2: string): number {
  const normalizedText1 = normalizeSearch(text1);
  const normalizedText2 = normalizeSearch(text2);
  
  // Verificar correspondência exata
  if (normalizedText1 === normalizedText2) {
    return 1.0;
  }
  
  // Verificar se um texto está contido no outro
  if (normalizedText1.includes(normalizedText2) || normalizedText2.includes(normalizedText1)) {
    const longerLength = Math.max(normalizedText1.length, normalizedText2.length);
    const shorterLength = Math.min(normalizedText1.length, normalizedText2.length);
    return shorterLength / longerLength * 0.9; // 90% da pontuação máxima
  }
  
  // Algoritmo simples de correspondência parcial por palavras
  const words1 = normalizedText1.split(/\s+/).filter(w => w.length > 1);
  const words2 = normalizedText2.split(/\s+/).filter(w => w.length > 1);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  let matchCount = 0;
  
  // Conta palavras correspondentes
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matchCount++;
        break;
      }
    }
  }
  
  // Média de correspondência
  const matchRatio = matchCount / Math.max(words1.length, words2.length);
  return matchRatio * 0.8; // 80% da pontuação máxima para correspondências parciais
}
