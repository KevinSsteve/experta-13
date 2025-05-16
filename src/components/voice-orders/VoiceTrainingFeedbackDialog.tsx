import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceOrderTrainingData } from "@/utils/voiceCartUtils";

interface VoiceTrainingFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voiceInput: string;
  suggestedProduct: Product | null;
  products: Product[];
}

export function VoiceTrainingFeedbackDialog({
  open,
  onOpenChange,
  voiceInput,
  suggestedProduct,
  products,
}: VoiceTrainingFeedbackDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [alternativeTerms, setAlternativeTerms] = useState("");
  const [correctProductId, setCorrectProductId] = useState<string | undefined>(
    suggestedProduct?.id
  );
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Encontrar o produto correto baseado no ID selecionado
      const correctProduct = correctProductId 
        ? products.find(p => p.id === correctProductId)
        : null;

      // Preparar os termos alternativos como um array
      const terms = alternativeTerms
        .split(",")
        .map(term => term.trim())
        .filter(term => term.length > 0);

      // Dados para salvar no Supabase
      const trainingDataForSupabase = {
        user_id: user?.id,
        voice_input: voiceInput,
        suggested_product_id: suggestedProduct?.id,
        suggested_product_name: suggestedProduct?.name,
        correct_product_id: correctProductId || null,
        correct_product_name: correctProduct?.name || null,
        was_helpful: wasHelpful,
        feedback,
        alternative_terms: terms,
        created_at: new Date().toISOString()
      };
      
      // Dados completos para o localStorage e formato compatível com a função existente
      const trainingDataComplete: VoiceOrderTrainingData = {
        voiceInput: voiceInput,
        parsedOrder: {
          name: correctProduct?.name || suggestedProduct?.name || voiceInput,
          quantity: 1,
          confidence: wasHelpful ? 0.9 : 0.4,
          originalText: voiceInput
        },
        selectedProduct: suggestedProduct,
        userCorrected: !!correctProductId && correctProductId !== suggestedProduct?.id,
        correctProduct: correctProduct || undefined,
        timestamp: Date.now(),
        alternativeTerms: terms,
        deviceInfo: navigator.userAgent,
        feedbackRating: wasHelpful ? 1 : -1
      };
      
      // Salvar no localStorage e também tentar salvar no Supabase
      if (user?.id) {
        try {
          // Salvar diretamente no Supabase
          await supabase.from('voice_training_backups').insert({
            ...trainingDataForSupabase,
            feedback: JSON.stringify({ feedback, timestamp: Date.now() })
          });
          
          console.log("Feedback de voz salvo com sucesso no Supabase");
          
          // Se o usuário indicou que a sugestão não foi útil, adicionar como correção
          if (wasHelpful === false && correctProduct && correctProduct.name !== suggestedProduct?.name) {
            try {
              await supabase.from('speech_corrections').insert({
                original_text: voiceInput,
                corrected_text: correctProduct.name,
                user_id: user.id,
                active: true
              });
              
              console.log("Correção de voz adicionada automaticamente:", voiceInput, "->", correctProduct.name);
            } catch (correctionError) {
              console.error("Erro ao adicionar correção automática:", correctionError);
            }
          }
          
          toast({
            title: "Feedback enviado",
            description: "Obrigado pelo seu feedback! Isso nos ajuda a melhorar.",
          });
        } catch (supabaseError) {
          console.error("Erro ao salvar no Supabase:", supabaseError);
          // Fallback para localStorage
          saveToLocalStorage(trainingDataComplete);
          
          toast({
            title: "Feedback enviado (local)",
            description: "Feedback salvo localmente. Houve um erro no backup online.",
          });
        }
      } else {
        // Salvar apenas no localStorage
        saveToLocalStorage(trainingDataComplete);
        
        toast({
          title: "Feedback enviado",
          description: "Obrigado pelo seu feedback! Para backup permanente, faça login.",
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao processar feedback:", error);
      toast({
        title: "Erro",
        description: "Houve um erro ao enviar seu feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const saveToLocalStorage = (data: any) => {
    try {
      // Obter dados existentes
      const existingData = localStorage.getItem('voiceTrainingData');
      let trainingData = [];
      
      if (existingData) {
        trainingData = JSON.parse(existingData);
      }
      
      // Adicionar novo dado
      trainingData.push(data);
      
      // Limitar a 100 entradas para não sobrecarregar
      if (trainingData.length > 100) {
        trainingData = trainingData.slice(-100);
      }
      
      // Salvar de volta
      localStorage.setItem('voiceTrainingData', JSON.stringify(trainingData));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Feedback de Reconhecimento de Voz</DialogTitle>
            <DialogDescription>
              Sua opinião nos ajuda a melhorar a precisão do nosso sistema de reconhecimento de voz.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="voiceInput">Texto reconhecido</Label>
              <Input
                id="voiceInput"
                value={voiceInput}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="suggestedProduct">Produto sugerido</Label>
              <Input
                id="suggestedProduct"
                value={suggestedProduct?.name || "Nenhum produto sugerido"}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label>O resultado foi útil?</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={wasHelpful === true ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setWasHelpful(true)}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Sim
                </Button>
                <Button
                  type="button"
                  variant={wasHelpful === false ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setWasHelpful(false)}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Não
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="correctProduct">Produto correto</Label>
              <Select
                value={correctProductId}
                onValueChange={setCorrectProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto correto" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="">Nenhum produto</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="alternativeTerms">
                Termos alternativos para este produto (separados por vírgula)
              </Label>
              <Input
                id="alternativeTerms"
                value={alternativeTerms}
                onChange={(e) => setAlternativeTerms(e.target.value)}
                placeholder="Ex: sacola plástica, saco de compras, sacola"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback">Comentários adicionais</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Adicione qualquer informação adicional que possa nos ajudar"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
