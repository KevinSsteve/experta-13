
import { Product } from "@/contexts/CartContext";
import { normalizeText } from "./voiceCartUtils";
import { normalizeThousandsInText, parsePTNumberFlexible } from "@/utils/ptNumber";
// Tipos de comandos que a Experta AI pode reconhecer
export enum CommandType {
  ADD_PRODUCT = "add_product",
  REGISTER_SALE = "register_sale",
  REGISTER_EXPENSE = "register_expense",
  CHECK_STOCK = "check_stock",
  UNKNOWN = "unknown"
}

// Interface para o comando reconhecido
export interface RecognizedCommand {
  type: CommandType;
  text: string;
  confidence: number;
  data: any;
}

// Palavras-chave para cada tipo de comando
const COMMAND_KEYWORDS = {
  [CommandType.ADD_PRODUCT]: [
    "adicionar", "adicione", "coloque", "colocar", "inserir", "insira", 
    "quero", "comprar", "carrinho", "cesta"
  ],
  [CommandType.REGISTER_SALE]: [
    "venda", "vendido", "registrar venda", "registre venda", "nova venda",
    "completar venda", "complete venda", "finalizar venda", "finalize venda"
  ],
  [CommandType.REGISTER_EXPENSE]: [
    "despesa", "gasto", "registrar despesa", "registrar gasto", "paguei", "pagamento"
  ],
  [CommandType.CHECK_STOCK]: [
    "estoque", "quantidade", "disponível", "verificar estoque", "quanto tem", "quantos tem"
  ]
};

/**
 * Identifica o tipo de comando na entrada de voz
 */
export function identifyCommandType(text: string): { type: CommandType; confidence: number } {
  const normalizedText = normalizeText(text);
  let bestMatch = CommandType.UNKNOWN;
  let highestConfidence = 0;

  // Verifica qual conjunto de palavras-chave tem mais correspondências
  for (const [commandType, keywords] of Object.entries(COMMAND_KEYWORDS)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        matches++;
      }
    }
    
    // Calcula a confiança baseada no número de correspondências
    const confidence = matches > 0 ? matches / keywords.length : 0;
    
    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      bestMatch = commandType as CommandType;
    }
  }

  // Se não tivermos palavras-chave específicas, mas parecer um comando de adicionar produto
  if (bestMatch === CommandType.UNKNOWN && 
      (normalizedText.match(/\d+/) || // Se contém números
       normalizedText.length > 3)) {  // Ou é uma frase minimamente substantiva
    return { type: CommandType.ADD_PRODUCT, confidence: 0.4 };
  }

  return { type: bestMatch, confidence: highestConfidence };
}

/**
 * Processa um comando de voz e retorna uma estrutura padronizada
 */
export function processVoiceCommand(text: string, products: Product[] = []): RecognizedCommand {
  const { type, confidence } = identifyCommandType(text);
  
  // Objeto base para o comando reconhecido
  const command: RecognizedCommand = {
    type,
    text,
    confidence,
    data: {}
  };
  
  // Processamento específico baseado no tipo de comando
  switch (type) {
    case CommandType.ADD_PRODUCT:
      // Reusa a lógica existente de voiceCartUtils
      // Não precisamos processar mais aqui pois o VoiceToCartCreator 
      // já tem toda a lógica necessária
      break;
      
    case CommandType.REGISTER_SALE:
      // Extrai informações sobre a venda (valores, cliente, método de pagamento)
      const saleInfo = extractSaleInfo(text);
      command.data = saleInfo;
      break;
      
    case CommandType.REGISTER_EXPENSE:
      // Extrai informações sobre despesas (valor, categoria, descrição)
      const expenseInfo = extractExpenseInfo(text);
      command.data = expenseInfo;
      break;
      
    case CommandType.CHECK_STOCK:
      // Extrai o nome do produto para verificar estoque
      const productName = extractProductNameForStock(text);
      command.data = { productName };
      break;
  }
  
  return command;
}

/**
 * Extrai informações sobre vendas do comando de voz
 */
function extractSaleInfo(text: string): any {
  const originalLower = text.toLowerCase();
  const normalizedText = normalizeThousandsInText(originalLower);
  
  // Extrai valor da venda
  let amount = 0;
  const amountMatch = normalizedText.match(/(?:valor|total|venda de|vendido por|vendi por|por)\s+(?:r\$|\$)?\s*([\d.,]+)/i);
  if (amountMatch) {
    const parsed = parsePTNumberFlexible(amountMatch[1]);
    if (!isNaN(parsed)) amount = parsed;
  }
  
  // Extrai possível nome do cliente
  let customer = "Cliente não identificado";
  const customerMatch = normalizedText.match(/(?:cliente|para|ao cliente|comprador)\s+([a-zà-ú\s]+?)(?:pagou|pagando|usando|com|valor|por|\s+\d+|$)/i);
  if (customerMatch) {
    customer = customerMatch[1].trim();
  }
  
  // Extrai método de pagamento
  let paymentMethod = "cash";
  if (normalizedText.includes("cartão") || 
      normalizedText.includes("credito") || 
      normalizedText.includes("crédito") ||
      normalizedText.includes("visa") || 
      normalizedText.includes("mastercard")) {
    paymentMethod = "card";
  } else if (normalizedText.includes("pix") || 
             normalizedText.includes("transferência") || 
             normalizedText.includes("transferencia") ||
             normalizedText.includes("digital")) {
    paymentMethod = "pix";
  } else if (normalizedText.includes("mbway") ||
             normalizedText.includes("mb way")) {
    paymentMethod = "mbway";
  }
  
  return {
    amount,
    customer,
    paymentMethod
  };
}

/**
 * Extrai informações sobre despesas do comando de voz
 */
function extractExpenseInfo(text: string): any {
  const originalLower = text.toLowerCase();
  const normalizedText = normalizeThousandsInText(originalLower);
  
  // Extrai valor da despesa
  let amount = 0;
  const amountMatch = normalizedText.match(/(?:valor|despesa de|gasto de|paguei|pagamento de|custa|custou|gastei|custo de)\s+(?:r\$|\$)?\s*([\d.,]+)/i);
  if (amountMatch) {
    const parsed = parsePTNumberFlexible(amountMatch[1]);
    if (!isNaN(parsed)) amount = parsed;
  }
  
  // Identifica categoria da despesa
  let category = "Diversos";
  const categories = {
    "Aluguel": ["aluguel", "renda", "casa", "apartamento", "loja", "espaço"],
    "Salários": ["salário", "salario", "funcionário", "funcionarios", "pagamento de pessoal", "folha"],
    "Fornecedores": ["fornecedor", "mercadoria", "produto", "estoque", "reposição", "compra de"],
    "Impostos": ["imposto", "taxa", "tributo", "fiscal", "iva", "iuc"],
    "Serviços": ["luz", "água", "energia", "gás", "internet", "telefone", "serviço"],
    "Manutenção": ["manutenção", "reparo", "conserto", "arrumação", "concerto", "equipamento"],
    "Transporte": ["transporte", "combustível", "gasolina", "diesel", "entrega", "frete"]
  };
  
  // Verifica palavras-chave nas categorias
  for (const [cat, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        category = cat;
        break;
      }
    }
  }
  
  // Extrai descrição da despesa
  let description = text;
  // Remove informações de valor para deixar a descrição mais limpa
  if (amountMatch) {
    description = text.replace(amountMatch[0], "").trim();
  }
  
  return {
    amount,
    category,
    description
  };
}

/**
 * Extrai o nome do produto para verificação de estoque
 */
function extractProductNameForStock(text: string): string {
  const normalizedText = text.toLowerCase();
  
  // Tenta extrair o nome do produto após palavras-chave
  const stockPhrases = [
    "estoque de", "quantidade de", "quanto tem de", "quantos tem de", 
    "temos", "temos quanto", "verificar", "checar"
  ];
  
  for (const phrase of stockPhrases) {
    if (normalizedText.includes(phrase)) {
      const productPart = normalizedText.split(phrase)[1];
      if (productPart && productPart.trim().length > 0) {
        return productPart.trim();
      }
    }
  }
  
  // Se não encontrou com frases específicas, considera o texto completo
  // removendo palavras-chave de estoque
  let cleanText = normalizedText
    .replace(/estoque|quantidade|disponível|verificar|quanto tem|quantos tem|checar|temos/g, "")
    .trim();
    
  return cleanText;
}
