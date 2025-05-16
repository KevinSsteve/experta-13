import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
// Import the clearCorrectionsCache function
import { clearCorrectionsCache } from '@/utils/speechCorrectionUtils';

interface VoiceTrainingFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voiceInput: string;
  suggestedProduct: Product | null;
  products: Product[];
}

export const VoiceTrainingFeedbackDialog: React.FC<VoiceTrainingFeedbackDialogProps> = ({
  open,
  onOpenChange,
  voiceInput,
  suggestedProduct,
  products,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(suggestedProduct || null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    setSelectedProduct(suggestedProduct || null);
  }, [suggestedProduct]);

  const handleSaveCorrection = async () => {
    if (!selectedProduct || !voiceInput || !user?.id) return;
    
    setIsSaving(true);
    
    try {
      // Salvar a correção na tabela speech_corrections
      const { error } = await supabase
        .from('speech_corrections')
        .insert({
          original_text: voiceInput.toLowerCase().trim(),
          corrected_text: selectedProduct.name.toLowerCase().trim(),
          user_id: user.id,
          active: true
        });
      
      if (error) throw error;
      
      // Limpa o cache de correções após salvar uma nova
      clearCorrectionsCache();
      
      console.log("Correção salva com sucesso");
      
      // Exibir mensagem de sucesso
      alert("Obrigado! A correção foi salva e será aplicada em seus próximos pedidos.");
      
      // Fechar o diálogo
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar correção:", error);
      alert("Ocorreu um erro ao salvar a correção. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Feedback de Voz</DialogTitle>
          <DialogDescription>
            Nos ajude a melhorar o reconhecimento de voz.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="voiceInput" className="text-right">
              Entrada de Voz
            </Label>
            <Input
              type="text"
              id="voiceInput"
              value={voiceInput}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Produto Correto
            </Label>
            <Select onValueChange={(value) => {
              const prod = products.find(p => p.id === value) || null;
              setSelectedProduct(prod);
            }}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o produto correto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSaveCorrection} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Correção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
