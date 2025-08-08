// Utilitários para normalização e parsing de números em PT-BR (foco em milhares)
// Regras:
// - Converter valores de milhar reconhecidos com ponto/virgula para inteiros sem separadores (ex: 1.500 -> 1500, 23,500 -> 23500, 1.500,00 -> 1500)
// - Converter números por extenso que contenham "mil" (ex: "dois mil e quinhentos" -> 2500, "vinte e três mil" -> 23000)
// - Para valores < 1000, manter comportamento padrão (decimais continuam válidos)

const UNITS: Record<string, number> = {
  "zero": 0,
  "um": 1, "uma": 1,
  "dois": 2, "duas": 2,
  "três": 3, "tres": 3,
  "quatro": 4,
  "cinco": 5,
  "seis": 6,
  "sete": 7,
  "oito": 8,
  "nove": 9,
};

const TEENS: Record<string, number> = {
  "dez": 10,
  "onze": 11,
  "doze": 12,
  "treze": 13,
  "catorze": 14, "quatorze": 14,
  "quinze": 15,
  "dezesseis": 16, "dezasseis": 16,
  "dezessete": 17, "dezassete": 17,
  "dezoito": 18,
  "dezenove": 19, "dezanove": 19,
};

const TENS: Record<string, number> = {
  "vinte": 20,
  "trinta": 30,
  "quarenta": 40,
  "cinquenta": 50,
  "sessenta": 60,
  "setenta": 70,
  "oitenta": 80,
  "noventa": 90,
};

const HUNDREDS: Record<string, number> = {
  "cem": 100, // 100 exato
  "cento": 100, // para composições: cento e vinte
  "duzentos": 200,
  "trezentos": 300,
  "quatrocentos": 400,
  "quinhentos": 500,
  "seiscentos": 600,
  "setecentos": 700,
  "oitocentos": 800,
  "novecentos": 900,
};

function isCurrencyToken(token: string) {
  return /^(kz|kwanzas?|mt|metical|meticais|r\$|reais?|real|aoa)$/i.test(token);
}

function normalizeToken(t: string) {
  return t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function parseUnderThousandTokens(tokens: string[]): number {
  let sum = 0;
  let i = 0;
  while (i < tokens.length) {
    const tk = normalizeToken(tokens[i]);
    if (tk === 'e') { i++; continue; }

    if (HUNDREDS[tk] != null) {
      sum += HUNDREDS[tk];
      i++;
      continue;
    }
    if (TEENS[tk] != null) {
      sum += TEENS[tk];
      i++;
      continue;
    }
    if (TENS[tk] != null) {
      sum += TENS[tk];
      // Pode haver unidade após o "e"
      if (i + 2 < tokens.length && normalizeToken(tokens[i + 1]) === 'e') {
        const nextUnit = normalizeToken(tokens[i + 2]);
        if (UNITS[nextUnit] != null) {
          sum += UNITS[nextUnit];
          i += 3;
          continue;
        }
      }
      i++;
      continue;
    }
    if (UNITS[tk] != null) {
      sum += UNITS[tk];
      i++;
      continue;
    }
    // token não reconhecido, parar
    break;
  }
  return sum;
}

function parseWordsThousands(text: string): number | null {
  const tokens = text.split(/\s+/).filter(Boolean);
  let best: number | null = null;

  for (let i = 0; i < tokens.length; i++) {
    if (normalizeToken(tokens[i]) === 'mil') {
      // Parte da esquerda (até 3 tokens significativos antes de "mil")
      const leftStart = Math.max(0, i - 4);
      const leftTokens = tokens.slice(leftStart, i).filter(t => normalizeToken(t) !== 'de');
      const leftVal = leftTokens.length > 0 ? parseUnderThousandTokens(leftTokens) : 1; // "mil" sozinho = 1000

      // Parte da direita (até 5 tokens após "mil")
      const rightTokensRaw = tokens.slice(i + 1, i + 6);
      const rightTokens = rightTokensRaw.filter(t => normalizeToken(t) !== 'e' && !isCurrencyToken(t));
      const rightVal = parseUnderThousandTokens(rightTokens);

      const total = leftVal * 1000 + rightVal;
      if (total >= 1000) {
        if (best == null || total > best) best = total;
      }
    }
  }

  return best;
}

// Detecta rapidamente se um token numérico parece ser "milhar" (grupos de 3)
function looksLikeThousandsGrouping(token: string): boolean {
  const t = token.replace(/\s/g, '');
  return /^(\d{1,3}([., ]\d{3})+)$/.test(t);
}

// Converte um token numérico para número, respeitando PT-BR e regras de milhares
export function parsePTNumberFlexible(token: string): number {
  const raw = token.trim();
  if (!raw) return NaN;

  // Se contiver letras, não tentamos aqui (usar parser por extenso em outro fluxo)
  if (/[a-zA-Z]/.test(raw)) return NaN;

  const noSpaces = raw.replace(/\s/g, '');

  // Caso claro de agrupamento de milhares
  if (looksLikeThousandsGrouping(noSpaces)) {
    const intVal = parseInt(noSpaces.replace(/[., ]/g, ''), 10);
    return intVal;
  }

  const hasComma = noSpaces.includes(',');
  const hasDot = noSpaces.includes('.');

  // Padrão comum PT-BR: 1.234,56
  if (hasComma && hasDot) {
    const lastComma = noSpaces.lastIndexOf(',');
    const intPart = noSpaces.slice(0, lastComma).replace(/[.\s]/g, '');
    const decPart = noSpaces.slice(lastComma + 1);
    const intVal = parseInt(intPart || '0', 10);
    // Se for milhar, descartar decimais
    if (intVal >= 1000) return intVal;
    // Se < 1000, manter decimais
    const dec = parseInt(decPart.replace(/\D/g, '') || '0', 10);
    const result = intVal + (dec / Math.pow(10, decPart.length));
    return result;
  }

  // Apenas vírgula
  if (hasComma) {
    // Se vírgula seguida de 3 dígitos, é milhares (ex: 23,500)
    if(/,\d{3}(?:,\d{3})*$/.test(noSpaces)){
      return parseInt(noSpaces.replace(/[,\s]/g, ''), 10);
    }
    // Se vírgula como decimal
    if(/,\d{1,2}$/.test(noSpaces)){
      const [i, d] = noSpaces.split(',');
      const intVal = parseInt(i.replace(/[\s.]/g, ''), 10);
      if (intVal >= 1000) return intVal; // descarta decimais
      const result = parseFloat(i.replace(/[\s.]/g, '')) + parseFloat('0.' + d);
      return result;
    }
    // Caso genérico: remova vírgulas
    return parseInt(noSpaces.replace(/[,\s]/g, ''), 10);
  }

  // Apenas ponto
  if (hasDot) {
    // Se ponto seguido de 3 dígitos, é milhares (ex: 1.500)
    if(/\.\d{3}(?:\.\d{3})*$/.test(noSpaces)){
      return parseInt(noSpaces.replace(/[.\s]/g, ''), 10);
    }
    // Se ponto decimal (ex: 999.99)
    if(/\.\d{1,2}$/.test(noSpaces)){
      const [i, d] = noSpaces.split('.');
      const intVal = parseInt(i.replace(/\s/g, ''), 10);
      if (intVal >= 1000) return intVal; // descarta decimais
      const result = parseFloat(i) + parseFloat('0.' + d);
      return result;
    }
    // Caso genérico: remova pontos
    return parseInt(noSpaces.replace(/[.\s]/g, ''), 10);
  }

  // Sem separadores: número simples
  if (/^\d+$/.test(noSpaces)) {
    return parseInt(noSpaces, 10);
  }

  return NaN;
}

// Normaliza apenas os "milhares" dentro de um texto.
// Substitui tokens numéricos em milhares por sua forma sem separadores e
// também tenta converter expressões com "mil" para números.
export function normalizeThousandsInText(text: string): string {
  if (!text) return text;
  let out = text;

  // 1) Converter expressões com "mil" por extenso
  const wordsVal = parseWordsThousands(out.toLowerCase());
  if (wordsVal != null && !isNaN(wordsVal) && wordsVal >= 1000) {
    // substitui apenas a primeira ocorrência de uma expressão contendo "mil"
    out = out.replace(/([\p{L}]+\s+)*mil(\s+[\p{L}]+)*/iu, String(wordsVal));
  }

  // 2) Normalizar tokens numéricos que aparentam ser milhares
  out = out.replace(/\b[\d.,\s]+\b/g, (m) => {
    const n = parsePTNumberFlexible(m);
    if (!isNaN(n) && n >= 1000) return String(Math.trunc(n));
    return m;
  });

  return out;
}
