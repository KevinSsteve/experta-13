
// Remove acentos e converte para minúsculo
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Extrai prefixos de 3 caracteres de cada palavra
export function getWordPrefixes(text: string): string[] {
  return text
    .split(/\s+/)
    .map(word => {
      const normalized = normalizeText(word);
      return normalized.length >= 3 ? normalized.substring(0, 3) : normalized;
    })
    .filter(prefix => prefix.length > 0);
}
