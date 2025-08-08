import { normalizeThousandsInText, parsePTNumberFlexible } from "@/utils/ptNumber";

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

  // Padrões melhorados para encontrar preços
  const pricePatterns = [
    /\b(?:de|por|custa|vale)\s+(\d+(?:[,.]\d{1,2})?)\b/,  // "de 100" ou "por 10,50"
    /\b(?:de|por|custa|vale)\s+(\d+)\s*(?:reais|real)\b/, // "de 50 reais"
    /\b(?:de|por|custa|vale)\s+(?:r\$\s*)?(\d+(?:[,.]\d{1,2})?)\b/, // "de R$ 29,90"
    /\b(\d+(?:[,.]\d{1,2})?)\s*(?:reais|real)\b/, // "10 reais"
    /\b(?:r\$\s*)?(\d+(?:[,.]\d{1,2})?)\b/, // "R$ 29,90" ou número isolado 
    /\s+(\d+(?:[,.]\d{1,2})?)\s*$/, // Número no final da string "açúcar 10"
    /\s+(\d+(?:[,.]\d{1,2})?)\s*(?:reais|real|r\$)?$/ // "açúcar 10 reais" no final
  ];

  let price: number | undefined;
  let name = cleanText;

  // Tenta encontrar um preço usando os padrões
  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const raw = match[1];
      const normalizedNum = parsePTNumberFlexible(raw);
      if (!Number.isNaN(normalizedNum)) {
        price = normalizedNum;
      } else {
        const priceStr = raw.replace(',', '.');
        price = parseFloat(priceStr);
      }
      
      // Remove a parte do preço do nome do produto
      // Usa o índice do começo do match para preservar o nome corretamente
      const matchIndex = cleanText.indexOf(match[0]);
      if (matchIndex > 0) {
        name = cleanText.substring(0, matchIndex).trim();
      } else {
        name = cleanText.replace(pattern, "").trim();
      }
      
      console.log(`Preço encontrado (normalizado): ${price}, Nome: ${name}`);
      break;
    }
  }
  // Se não achou via regex, tenta por extenso com "mil"
  if (price === undefined) {
    const normalizedAll = normalizeThousandsInText(cleanText);
    const m = normalizedAll.match(/\b(\d{4,})\b/);
    if (m) {
      price = parseInt(m[1], 10);
      name = cleanText.replace(m[0], "").trim();
    }
  }

  // Limpa o nome de possíveis resíduos
  name = name
    .replace(/\s+(de|por|custa|vale)\s*$/, '')  // Remove palavras de preço no final
    .replace(/^\s*(de|do|da)\s+/, '')  // Remove preposições no início
    .trim();

  return {
    name,
    price
  };
}
