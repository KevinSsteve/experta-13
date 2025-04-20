
import { CreditNote } from "@/lib/sales/types";
import { supabase } from "@/integrations/supabase/client";

// Busca todas as notas de crédito
export async function getCreditNotes(userId?: string): Promise<CreditNote[]> {
  if (!userId) return [];

  try {
    // Buscar todas as notas de crédito do usuário
    const { data, error } = await supabase
      .from('credit_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notas de crédito:', error);
      throw error;
    }

    if (!data) return [];

    return data as CreditNote[];
  } catch (error) {
    console.error('Erro ao buscar notas de crédito:', error);
    return [];
  }
}

// Busca uma nota de crédito específica
export async function getCreditNote(noteId: string): Promise<CreditNote | null> {
  try {
    const { data, error } = await supabase
      .from('credit_notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (error) {
      console.error('Erro ao buscar nota de crédito:', error);
      throw error;
    }

    return data as CreditNote;
  } catch (error) {
    console.error('Erro ao buscar nota de crédito:', error);
    return null;
  }
}

// Busca todas as notas de crédito relacionadas a uma venda
export async function getCreditNotesByOriginalSale(saleId: string): Promise<CreditNote[]> {
  try {
    const { data, error } = await supabase
      .from('credit_notes')
      .select('*')
      .eq('original_sale_id', saleId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notas de crédito da venda:', error);
      throw error;
    }

    return data as CreditNote[] || [];
  } catch (error) {
    console.error('Erro ao buscar notas de crédito da venda:', error);
    return [];
  }
}

// Aprova uma nota de crédito
export async function approveCreditNote(noteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('credit_notes')
      .update({ status: 'approved' })
      .eq('id', noteId);

    if (error) {
      console.error('Erro ao aprovar nota de crédito:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao aprovar nota de crédito:', error);
    return false;
  }
}

// Rejeita uma nota de crédito
export async function rejectCreditNote(noteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('credit_notes')
      .update({ status: 'rejected' })
      .eq('id', noteId);

    if (error) {
      console.error('Erro ao rejeitar nota de crédito:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro ao rejeitar nota de crédito:', error);
    return false;
  }
}
