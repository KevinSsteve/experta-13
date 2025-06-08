
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Edit3 } from "lucide-react";

interface Correction {
  id: string;
  original_text: string;
  item_type: 'sale' | 'expense';
  item_id: string;
  correction_date: string;
  is_corrected: boolean;
  corrected_text: string | null;
}

export function PendingCorrections() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCorrections();
    }
  }, [user]);

  const loadCorrections = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('experta_go_corrections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setCorrections(data || []);
    } catch (error) {
      console.error("Erro ao carregar correções:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (correction: Correction) => {
    setEditingId(correction.id);
    setEditText(correction.original_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveCorrection = async (correctionId: string) => {
    if (!editText.trim()) return;

    try {
      // Atualizar a correção
      const { error } = await supabase
        .from('experta_go_corrections')
        .update({
          is_corrected: true,
          corrected_text: editText.trim()
        })
        .eq('id', correctionId);

      if (error) throw error;

      // Encontrar a correção para atualizar o item correspondente
      const correction = corrections.find(c => c.id === correctionId);
      if (correction) {
        if (correction.item_type === 'sale') {
          // Atualizar venda
          await supabase
            .from('experta_go_sales')
            .update({
              product_name: editText.trim(),
              is_generic_product: false,
              correction_pending: false
            })
            .eq('id', correction.item_id);

          // Atualizar produto no estoque
          await supabase
            .from('experta_go_products')
            .update({
              name: editText.trim(),
              is_generic: false
            })
            .eq('user_id', user?.id)
            .eq('name', correction.original_text);

        } else {
          // Atualizar despesa
          await supabase
            .from('experta_go_expenses')
            .update({
              description: editText.trim(),
              is_generic_description: false,
              correction_pending: false
            })
            .eq('id', correction.item_id);
        }
      }

      toast({
        title: "Correção salva!",
        description: "O item foi atualizado com o novo nome.",
      });

      // Recarregar correções
      loadCorrections();
      cancelEditing();

    } catch (error) {
      console.error("Erro ao salvar correção:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a correção.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCorrections = corrections.filter(c => !c.is_corrected);
  const completedCorrections = corrections.filter(c => c.is_corrected);

  return (
    <div className="space-y-6">
      {/* Correções pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Correções Pendentes ({pendingCorrections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCorrections.length > 0 ? (
            <div className="space-y-4">
              {pendingCorrections.map((correction) => (
                <div key={correction.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant={correction.item_type === 'sale' ? 'default' : 'secondary'}>
                        {correction.item_type === 'sale' ? 'Venda' : 'Despesa'}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(correction.correction_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Sistema entendeu:</strong> "{correction.original_text}"
                    </p>
                    
                    {editingId === correction.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          placeholder="O que você quis dizer exatamente?"
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => saveCorrection(correction.id)}
                            size="sm"
                          >
                            Salvar
                          </Button>
                          <Button 
                            onClick={cancelEditing}
                            variant="outline"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => startEditing(correction)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Corrigir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma correção pendente! 🎉
            </p>
          )}
        </CardContent>
      </Card>

      {/* Correções já feitas */}
      {completedCorrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Correções Realizadas ({completedCorrections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedCorrections.slice(0, 5).map((correction) => (
                <div key={correction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <Badge variant={correction.item_type === 'sale' ? 'default' : 'secondary'}>
                      {correction.item_type === 'sale' ? 'Venda' : 'Despesa'}
                    </Badge>
                    <p className="text-sm mt-1">
                      <span className="line-through text-muted-foreground">"{correction.original_text}"</span>
                      {' → '}
                      <span className="text-green-700 font-medium">"{correction.corrected_text}"</span>
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
