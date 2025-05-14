
import { Product } from "@/contexts/CartContext";
import { normalizeText } from "@/utils/voiceCartUtils";

/**
 * Função para pesquisar produtos usando múltiplos termos alternativos
 * @param products Lista de produtos disponíveis
 * @param searchTerms Lista de termos para pesquisa
 * @returns Array de produtos encontrados, ordenados por relevância
 */
export function searchProductsWithAlternatives(
  products: Product[], 
  searchTerms: string[]
): Product[] {
  if (!products?.length || !searchTerms?.length) {
    return [];
  }
  
  // Normaliza os termos de busca
  const normalizedTerms = searchTerms.map(term => normalizeText(term));
  
  // Objeto para armazenar produtos encontrados e suas pontuações
  const productScores: { [key: string]: { product: Product, score: number } } = {};
  
  // Para cada termo de busca
  normalizedTerms.forEach((searchTerm, termIndex) => {
    // O peso do termo diminui à medida que avançamos na lista (prioriza os primeiros termos)
    const termWeight = 1 / (termIndex + 1);
    
    products.forEach(product => {
      const normalizedName = normalizeText(product.name);
      const normalizedCategory = normalizeText(product.category);
      const normalizedCode = product.code ? normalizeText(product.code) : '';
      
      let score = 0;
      
      // Verifica correspondência exata (prioridade alta)
      if (normalizedName === searchTerm || normalizedCode === searchTerm) {
        score = 10 * termWeight;
      }
      // Verifica se o nome do produto contém o termo de busca
      else if (normalizedName.includes(searchTerm)) {
        score = 5 * termWeight;
        
        // Bônus se o termo estiver no início do nome
        if (normalizedName.startsWith(searchTerm)) {
          score += 3 * termWeight;
        }
      }
      // Verifica se a categoria contém o termo
      else if (normalizedCategory.includes(searchTerm)) {
        score = 2 * termWeight;
      }
      // Verifica se o código contém o termo
      else if (normalizedCode.includes(searchTerm)) {
        score = 4 * termWeight;
      }
      
      // Verifica correspondência de palavras individuais
      if (score === 0) {
        const searchWords = searchTerm.split(' ').filter(w => w.length > 2);
        const nameWords = normalizedName.split(' ');
        
        // Conta quantas palavras da busca existem no nome
        const matchedWords = searchWords.filter(word => nameWords.some(nameWord => nameWord.includes(word)));
        if (matchedWords.length > 0) {
          score = (matchedWords.length / searchWords.length) * 3 * termWeight;
        }
      }
      
      // Se encontrou alguma correspondência
      if (score > 0) {
        // Se o produto já tem uma pontuação, soma a nova pontuação
        if (productScores[product.id]) {
          productScores[product.id].score += score;
        } else {
          productScores[product.id] = { product, score };
        }
      }
    });
  });
  
  // Converte o objeto em array e ordena por pontuação
  return Object.values(productScores)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}
