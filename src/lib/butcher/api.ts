
import { supabase } from '@/integrations/supabase/client';
import { MeatCut } from './types';
import { toast } from 'sonner';
import { importSampleMeatCuts, sampleMeatCuts } from './sample-data';

export const getMeatCuts = async (): Promise<MeatCut[]> => {
  try {
    const { data, error } = await supabase
      .from('meat_cuts')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching meat cuts:', error.message);
    toast.error('Erro ao buscar cortes de carne');
    return [];
  }
};

export const getMeatCutById = async (id: string): Promise<MeatCut | null> => {
  try {
    const { data, error } = await supabase
      .from('meat_cuts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching meat cut:', error.message);
    toast.error('Erro ao buscar corte de carne');
    return null;
  }
};

export const createMeatCut = async (meatCut: Omit<MeatCut, 'id' | 'created_at' | 'updated_at'>): Promise<MeatCut | null> => {
  try {
    const { data, error } = await supabase
      .from('meat_cuts')
      .insert([meatCut])
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Corte de carne adicionado com sucesso');
    return data;
  } catch (error: any) {
    console.error('Error creating meat cut:', error.message);
    toast.error('Erro ao criar corte de carne');
    return null;
  }
};

export const updateMeatCut = async (id: string, meatCut: Partial<MeatCut>): Promise<MeatCut | null> => {
  try {
    const { data, error } = await supabase
      .from('meat_cuts')
      .update(meatCut)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Corte de carne atualizado com sucesso');
    return data;
  } catch (error: any) {
    console.error('Error updating meat cut:', error.message);
    toast.error('Erro ao atualizar corte de carne');
    return null;
  }
};

export const deleteMeatCut = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('meat_cuts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast.success('Corte de carne excluído com sucesso');
    return true;
  } catch (error: any) {
    console.error('Error deleting meat cut:', error.message);
    toast.error('Erro ao excluir corte de carne');
    return false;
  }
};

export const initializeMeatCuts = async (userId: string): Promise<boolean> => {
  return importSampleMeatCuts(userId);
};
