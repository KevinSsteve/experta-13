// Função para remover acentos e caracteres especiais
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
};

// Converte texto para representação fonética simplificada (adaptada para português angolano)
export const getPhoneticCode = (text: string): string => {
  if (!text) return '';
  
  // Normaliza e remove caracteres especiais primeiro
  let normalized = normalizeText(text);
  
  // Substituições fonéticas específicas para português angolano
  normalized = normalized
    // Consoantes com sons similares
    .replace(/qu|k/g, 'k')  // qu, k -> k
    .replace(/c([eiêiî])/g, 's$1')  // ce, ci -> se, si
    .replace(/c([aouâôûáóúàòù])|k|q/g, 'k$1')  // ca, co, cu, k, q -> ka, ko, ku
    .replace(/ss|ç|x([iêe])/g, 's')  // ss, ç, xe, xi -> s
    .replace(/ch|x|sh/g, 'x')  // ch, x, sh -> x (som de "ch")
    .replace(/z$/g, 's')  // z no final -> s
    .replace(/([^s])s([aeiouáéíóúâêîôûàèìòù])/g, '$1z$2')  // s entre vogais -> z
    .replace(/n([pbmf])/g, 'm$1')  // n antes de p, b, m, f -> m
    .replace(/m([tdnlr])/g, 'n$1')  // m antes de t, d, n, l, r -> n
    .replace(/l$/, 'u')  // l no final -> u (comum em sotaques angolanos)
    .replace(/lh/g, 'li')  // lh -> li
    .replace(/nh/g, 'ni')  // nh -> ni
    .replace(/y/g, 'i')    // y -> i
    .replace(/w/g, 'u')    // w -> u
    .replace(/rr/g, 'r')   // rr -> r
    // Vogais com sons similares
    .replace(/[eéêèë]/g, 'e')  // normaliza e's
    .replace(/[aáâàã]/g, 'a')  // normaliza a's
    .replace(/[iíîì]/g, 'i')   // normaliza i's
    .replace(/[oóôòõ]/g, 'o')  // normaliza o's
    .replace(/[uúûù]/g, 'u')   // normaliza u's
    // Remove duplicatas de letras
    .replace(/([a-z])\1+/g, '$1');
  
  return normalized;
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
  if (!str1 || !str2) return 0;
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
};

// Calcula similaridade fonética entre duas strings
const calculatePhoneticSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  const phoneticStr1 = getPhoneticCode(str1);
  const phoneticStr2 = getPhoneticCode(str2);
  return calculateSimilarity(phoneticStr1, phoneticStr2);
};

// Verifica se uma string contém outra, independentemente de acentos
const containsSubstring = (text: string, search: string): boolean => {
  if (!text || !search) return false;
  const normalizedText = normalizeText(text);
  const normalizedSearch = normalizeText(search);
  return normalizedText.includes(normalizedSearch);
};

// Verifica se há similaridade fonética parcial
const containsPhoneticSubstring = (text: string, search: string): boolean => {
  if (!text || !search) return false;
  const phoneticText = getPhoneticCode(text);
  const phoneticSearch = getPhoneticCode(search);
  
  // Se a string fonética de busca for muito curta, exigimos correspondência exata
  if (phoneticSearch.length <= 2) {
    return phoneticText === phoneticSearch;
  }
  
  // Para strings mais longas, verificamos se é uma substring
  return phoneticText.includes(phoneticSearch);
};

// Calcula similaridade por palavras individuais (útil para produtos com múltiplas palavras)
const calculateWordSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2) return 0;
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
  let phoneticMatches = 0;
  
  for (const word1 of words1) {
    let bestMatch = 0;
    let hasPhoneticMatch = false;
    
    // Normaliza a palavra antes da comparação
    const normalizedWord1 = normalizeText(word1);
    const phoneticWord1 = getPhoneticCode(word1);
    
    for (const word2 of words2) {
      const normalizedWord2 = normalizeText(word2);
      const phoneticWord2 = getPhoneticCode(word2);
      
      if (normalizedWord1 === normalizedWord2) {
        // Correspondência exata tem pontuação máxima
        bestMatch = 1;
        exactMatches++;
        break;
      }
      
      // Verifica correspondência fonética
      if (phoneticWord1 === phoneticWord2) {
        bestMatch = Math.max(bestMatch, 0.9); // Quase perfeito (90%)
        hasPhoneticMatch = true;
      }
      
      // Verifica se uma é substring da outra foneticamente
      else if (phoneticWord1.includes(phoneticWord2) || phoneticWord2.includes(phoneticWord1)) {
        bestMatch = Math.max(bestMatch, 0.8); // Muito bom (80%)
        hasPhoneticMatch = true;
      }
      
      // Similaridade textual padrão como fallback
      const similarity = calculateSimilarity(normalizedWord1, normalizedWord2);
      bestMatch = Math.max(bestMatch, similarity);
    }
    
    // Incrementa contador de correspondências fonéticas
    if (hasPhoneticMatch) {
      phoneticMatches++;
    }
    
    // Considera correspondências com pontuação mais baixa (0.35) para capturar mais resultados
    if (bestMatch > 0.35) {
      totalSimilarity += bestMatch;
      matches++;
    }
  }
  
  // Calcula pontuação baseada em correspondências de palavras
  let wordMatchScore = matches > 0 ? totalSimilarity / matches : 0;
  
  // Bônus para correspondências exatas e fonéticas
  if (exactMatches > 0 || phoneticMatches > 0) {
    // Aumenta a pontuação para correspondências exatas e fonéticas
    const exactBonus = exactMatches / Math.max(words1.length, 1) * 0.3;
    const phoneticBonus = phoneticMatches / Math.max(words1.length, 1) * 0.2;
    wordMatchScore = wordMatchScore * 0.5 + exactBonus + phoneticBonus;
  }
  
  // Calcula similaridade fonética completa
  const phoneticScore = calculatePhoneticSimilarity(text1, text2);
  
  // Calcula similaridade completa do texto
  const fullTextScore = calculateSimilarity(text1, text2);
  
  // Combina as pontuações com pesos
  return Math.max(
    0.5 * wordMatchScore + 0.3 * phoneticScore + 0.2 * fullTextScore,
    phoneticScore * 0.8  // Garante que correspondências fonéticas fortes não sejam ignoradas
  );
};

// Função adicional para verificar correspondências parciais
const checkPartialMatches = (input: string, productName: string): number => {
  if (!input || !productName) return 0;
  const normalizedInput = normalizeText(input);
  const normalizedName = normalizeText(productName);
  
  // Verifica se o nome do produto contém exatamente o termo de busca
  if (normalizedName.includes(normalizedInput)) {
    // Quanto mais próximo o comprimento, maior a pontuação
    const lengthRatio = normalizedInput.length / normalizedName.length;
    // Retorna uma pontuação alta para correspondências parciais exatas
    return 0.7 + (0.3 * lengthRatio);
  }
  
  // Verifica correspondência fonética parcial
  if (containsPhoneticSubstring(productName, input)) {
    return 0.65; // Pontuação boa para correspondências fonéticas parciais
  }
  
  return 0;
};

// Verifica se são marcas específicas angolanas com alta prioridade
const checkAngolanBrands = (input: string, productName: string): number => {
  // Lista de marcas angolanas comuns e suas variações fonéticas
  const angolanBrands: {[key: string]: string[]} = {
    'kiame': ['kiame', 'quiame', 'que ame', 'ki ame', 'quiami', 'keame'],
    'yummi': ['yummi', 'iumi', 'iume', 'yume', 'iumi', 'filme', 'iami'],
    'ngusso': ['ngusso', 'nguço', 'nguzo', 'moço', 'enguço', 'angusso'],
    'alimo': ['alimo', 'alimô', 'aline', 'alino', 'alima', 'alemao', 'alemão']
  };
  
  // Normaliza input
  const normalizedInput = normalizeText(input);
  
  // Verifica cada marca
  for (const [brand, variations] of Object.entries(angolanBrands)) {
    // Verifica se o nome do produto contém a marca
    if (productName.toLowerCase().includes(brand)) {
      // Verifica se o input corresponde a alguma variação conhecida
      if (variations.some(v => normalizeText(v) === normalizedInput)) {
        console.log(`Correspondência de marca angolana: ${brand} (entrada: ${input})`);
        return 0.95; // Alta pontuação para marca reconhecida
      }
    }
  }
  
  return 0;
};

// Encontra produtos similares baseado no texto reconhecido
export const findSimilarProducts = <T extends { name: string; id: string; category: string; price: number; stock: number }>(
  recognizedText: string,
  products: T[],
  threshold: number = 0.35  // Reduzido para 0.35 para encontrar mais correspondências
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
  console.log(`Versão fonética: ${getPhoneticCode(recognizedText)}`);
  
  return products
    .map(product => {
      // Nome normalizado do produto
      const normalizedName = normalizeText(product.name);
      const normalizedCategory = normalizeText(product.category);
      
      // Verificação específica para marcas angolanas
      const brandMatchScore = checkAngolanBrands(recognizedText, product.name);
      
      // Verifica correspondências exatas primeiro
      const hasExactMatch = searchTerms.some(term => 
        normalizedName.includes(term) || normalizedCategory.includes(term)
      );
      
      // Calcula similaridade melhorada considerando palavras individuais
      const nameSimilarity = calculateWordSimilarity(
        normalizedName,
        normalizedInput
      );
      
      // Calcula similaridade fonética
      const phoneticSimilarity = calculatePhoneticSimilarity(
        product.name,
        recognizedText
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
      let similarity = Math.max(
        nameSimilarity, 
        categorySimilarity, 
        partialMatchScore, 
        phoneticSimilarity * 0.85,
        brandMatchScore
      );
      
      // Bônus para correspondências exatas ou quase exatas
      if (hasExactMatch) {
        similarity = Math.min(1, similarity + 0.2);
      }
      
      // Informações detalhadas no log para debugging
      if (similarity > 0.2) {
        console.log(`Produto: ${product.name}`);
        console.log(`- Similaridade texto: ${nameSimilarity.toFixed(2)}`);
        console.log(`- Similaridade fonética: ${phoneticSimilarity.toFixed(2)}`);
        console.log(`- Match parcial: ${partialMatchScore.toFixed(2)}`);
        console.log(`- Brand match: ${brandMatchScore.toFixed(2)}`);
        console.log(`- Final: ${similarity.toFixed(2)}`);
      }
      
      return {
        ...product,
        similarity
      };
    })
    .filter(product => {
      // Log para ajudar a depurar por que produtos específicos foram incluídos/excluídos
      if (product.similarity >= 0.3) {
        console.log(`Produto: ${product.name}, Similaridade: ${product.similarity.toFixed(2)}, Incluído: ${product.similarity >= threshold}`);
      }
      return product.similarity >= threshold;
    })
    .sort((a, b) => b.similarity - a.similarity);
};
