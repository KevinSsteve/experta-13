
export interface ParsedVoiceItem {
  name: string;
  price?: number;
}

export function parseVoiceInput(text: string): ParsedVoiceItem {
  // Remove palavras comuns que podem interferir
  const cleanText = text
    .toLowerCase()
    .replace(/(comprar|adicionar|lista|pendente|pagar|quero|gostaria de|por favor)/g, "")
    .trim();

  // Padrões para encontrar preços
  const pricePatterns = [
    /\b(?:de|por|custa|vale)\s+(\d+(?:\.\d{1,2})?)\b/,  // Números com ou sem decimais
    /\b(?:de|por|custa|vale)\s+(\d+)\s*(?:reais|real)\b/,
    /\b(?:de|por|custa|vale)\s+(?:r\$\s*)?(\d+(?:\.\d{1,2})?)\b/,
    /\b(\d+(?:\.\d{1,2})?)\s*(?:reais|real)\b/, // Preço seguido de 'reais' ou 'real'
    /\b(?:r\$\s*)?(\d+(?:\.\d{1,2})?)\b/ // Número isolado ou com R$
  ];

  let price: number | undefined;
  let name = cleanText;

  // Tenta encontrar um preço usando os padrões
  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      price = parseFloat(match[1]);
      // Remove a parte do preço do nome do produto
      name = cleanText.replace(pattern, "").trim();
      break;
    }
  }

  return {
    name,
    price
  };
}
