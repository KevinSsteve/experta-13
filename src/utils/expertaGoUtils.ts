
import { supabase } from "@/integrations/supabase/client";
import { parseVoiceInput } from "./voiceUtils";

interface ProcessResult {
  success: boolean;
  message: string;
  data?: any;
}

// Gerar nome genérico para produto
function generateGenericProductName(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100);
  return `Produto${timestamp}${random}`;
}

// Gerar descrição genérica para despesa
function generateGenericExpenseDescription(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100);
  return `Despesa${timestamp}${random}`;
}

// Extrair informações de venda da fala
function parseSaleVoiceInput(text: string) {
  const parsed = parseVoiceInput(text);
  
  // Tentar extrair quantidade usando padrões mais robustos
  const quantityPatterns = [
    /^(\d+)\s+/,  // "2 pacotes..."
    /\b(\d+)\s+(?:unidades?|unids?|pcs?|peças?)\b/i,
    /\b(\d+)\s+(?:kg|quilos?|gramas?|g)\b/i,
  ];
  
  let quantity = 0;
  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) {
      quantity = parseInt(match[1]);
      break;
    }
  }

  // Se quantidade for 0, assumir 1
  if (quantity === 0) {
    quantity = 1;
  }

  // Se não encontrou nome válido, usar genérico
  const productName = parsed.name && parsed.name.trim() ? parsed.name : generateGenericProductName();

  return {
    name: productName,
    price: parsed.price || 0,
    quantity: quantity,
    originalText: text,
    processedText: `${quantity} ${productName}${parsed.price > 0 ? ` de ${parsed.price} kz cada` : ''}`
  };
}

// Extrair informações de despesa da fala
function parseExpenseVoiceInput(text: string) {
  // Buscar por valores monetários
  const pricePatterns = [
    /\b(?:de|por|custou|paguei|gastei)\s+(\d+(?:[,.]\d{1,2})?)\b/i,
    /\b(\d+(?:[,.]\d{1,2})?)\s*(?:kz|kwanzas?|reais?)\b/i,
    /\b(?:r\$|kz)\s*(\d+(?:[,.]\d{1,2})?)\b/i,
  ];

  let amount = 0;
  let description = text;

  // Tentar encontrar o valor
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(',', '.'));
      // Remover a parte do valor da descrição
      description = text.replace(match[0], '').trim();
      break;
    }
  }

  // Se não encontrou valor, usar descrição genérica
  if (amount === 0) {
    description = generateGenericExpenseDescription();
  }

  // Limpar a descrição
  description = description
    .replace(/\b(comprei|gastei|paguei|despesa|custo)\b/gi, '')
    .trim();

  if (!description) {
    description = generateGenericExpenseDescription();
  }

  const processedText = `${description}${amount > 0 ? ` de ${amount} kz` : ''}`;

  return {
    description,
    amount,
    originalText: text,
    processedText
  };
}

// Flag para evitar processamento duplicado
let isProcessing = false;

// Processar entrada de voz para venda
async function processSale(text: string, userId: string): Promise<ProcessResult> {
  if (isProcessing) {
    return { success: false, message: "Processamento em andamento..." };
  }

  isProcessing = true;

  try {
    const saleData = parseSaleVoiceInput(text);
    const totalAmount = saleData.price * saleData.quantity;

    // Inserir a venda
    const { data: sale, error: saleError } = await supabase
      .from('experta_go_sales')
      .insert({
        user_id: userId,
        original_voice_input: text,
        processed_text: saleData.processedText,
        product_name: saleData.name,
        quantity: saleData.quantity,
        unit_price: saleData.price,
        total_amount: totalAmount,
        is_generic_product: saleData.name.includes('Produto'),
        correction_pending: true
      })
      .select()
      .single();

    if (saleError) {
      console.error("Erro ao inserir venda:", saleError);
      return { success: false, message: "Erro ao registrar venda." };
    }

    // Atualizar ou criar produto no estoque
    const { data: existingProduct } = await supabase
      .from('experta_go_products')
      .select('*')
      .eq('user_id', userId)
      .eq('name', saleData.name)
      .single();

    if (existingProduct) {
      // Atualizar produto existente
      await supabase
        .from('experta_go_products')
        .update({
          current_stock: Math.max(0, existingProduct.current_stock - saleData.quantity),
          total_sold: existingProduct.total_sold + saleData.quantity,
          last_unit_price: saleData.price,
          original_voice_inputs: [...existingProduct.original_voice_inputs, text]
        })
        .eq('id', existingProduct.id);
    } else {
      // Criar novo produto
      await supabase
        .from('experta_go_products')
        .insert({
          user_id: userId,
          name: saleData.name,
          current_stock: 0,
          total_sold: saleData.quantity,
          last_unit_price: saleData.price,
          is_generic: saleData.name.includes('Produto'),
          original_voice_inputs: [text]
        });
    }

    // Criar correção pendente
    await supabase
      .from('experta_go_corrections')
      .insert({
        user_id: userId,
        original_text: saleData.processedText,
        item_type: 'sale',
        item_id: sale.id,
        correction_date: new Date().toISOString().split('T')[0]
      });

    return {
      success: true,
      message: saleData.processedText,
      data: sale
    };

  } catch (error) {
    console.error("Erro ao processar venda:", error);
    return { success: false, message: "Erro inesperado ao processar venda." };
  } finally {
    isProcessing = false;
  }
}

// Processar entrada de voz para despesa
async function processExpense(text: string, userId: string): Promise<ProcessResult> {
  if (isProcessing) {
    return { success: false, message: "Processamento em andamento..." };
  }

  isProcessing = true;

  try {
    const expenseData = parseExpenseVoiceInput(text);

    // Inserir a despesa
    const { data: expense, error: expenseError } = await supabase
      .from('experta_go_expenses')
      .insert({
        user_id: userId,
        original_voice_input: text,
        processed_text: expenseData.processedText,
        description: expenseData.description,
        amount: expenseData.amount,
        is_generic_description: expenseData.description.includes('Despesa'),
        correction_pending: true
      })
      .select()
      .single();

    if (expenseError) {
      console.error("Erro ao inserir despesa:", expenseError);
      return { success: false, message: "Erro ao registrar despesa." };
    }

    // Criar correção pendente
    await supabase
      .from('experta_go_corrections')
      .insert({
        user_id: userId,
        original_text: expenseData.processedText,
        item_type: 'expense',
        item_id: expense.id,
        correction_date: new Date().toISOString().split('T')[0]
      });

    return {
      success: true,
      message: expenseData.processedText,
      data: expense
    };

  } catch (error) {
    console.error("Erro ao processar despesa:", error);
    return { success: false, message: "Erro inesperado ao processar despesa." };
  } finally {
    isProcessing = false;
  }
}

// Função principal para processar entrada de voz
export async function processExpertaGoVoiceInput(
  text: string, 
  type: 'sale' | 'expense', 
  userId: string
): Promise<ProcessResult> {
  if (!text.trim()) {
    return { success: false, message: "Texto vazio." };
  }

  if (type === 'sale') {
    return await processSale(text, userId);
  } else {
    return await processExpense(text, userId);
  }
}
