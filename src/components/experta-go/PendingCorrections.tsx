import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Edit3, Mic, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Correction {
  id: string;
  original_text: string;
  item_type: 'sale' | 'expense';
  item_id: string;
  correction_date: string;
  is_corrected: boolean;
  corrected_text: string | null;
}

interface SpeechCorrection {
  id: string;
  original_text: string;
  corrected_text: string;
  user_id: string;
  created_at: string;
  active: boolean;
}

export function PendingCorrections() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [speechCorrections, setSpeechCorrections] = useState<SpeechCorrection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Training states
  const [voiceText, setVoiceText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCorrections();
      loadSpeechCorrections();
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

      const typedCorrections = (data || []).map(correction => ({
        ...correction,
        item_type: correction.item_type as 'sale' | 'expense'
      }));

      setCorrections(typedCorrections);
    } catch (error) {
      console.error("Erro ao carregar correções:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpeechCorrections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("speech_corrections")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar correções de voz:", error);
      } else if (data) {
        setSpeechCorrections(data as SpeechCorrection[]);
      }
    } catch (error) {
      console.error("Erro ao carregar correções de voz:", error);
    }
  };

  // Voice training functions
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setCorrectedText(transcript);
      
      toast({
        title: "Texto reconhecido",
        description: transcript,
      });
    };
    
    recognition.onerror = (event) => {
      console.error('Erro de reconhecimento de voz:', event.error);
      toast({
        title: "Erro",
        description: "Não foi possível reconhecer sua voz. Tente novamente.",
        variant: "destructive",
      });
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const saveVoiceCorrection = async () => {
    if (!user) {
      toast({
        title: "Necessário fazer login",
        description: "Você precisa estar logado para salvar correções.",
        variant: "destructive"
      });
      return;
    }
    
    if (!voiceText || !correctedText) {
      toast({
        title: "Campos incompletos",
        description: "Ambos os textos são necessários para salvar uma correção.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("speech_corrections")
        .insert([{
          original_text: voiceText,
          corrected_text: correctedText,
          user_id: user.id,
          active: true
        }])
        .select();
        
      if (error) {
        console.error("Erro ao salvar correção:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a correção: " + error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        setSpeechCorrections((prev) => [data[0] as SpeechCorrection, ...prev]);
        setVoiceText("");
        setCorrectedText("");
        
        toast({
          title: "Correção salva",
          description: "Sua correção foi salva com sucesso.",
        });
      }
    } catch (err) {
      console.error("Exceção ao salvar correção:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar salvar sua correção.",
        variant: "destructive"
      });
    }
  };

  const removeSpeechCorrection = async (id: string) => {
    try {
      const { error } = await supabase
        .from("speech_corrections")
        .update({ active: false })
        .eq("id", id)
        .eq("user_id", user?.id);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover a correção.",
          variant: "destructive"
        });
        return;
      }
      
      setSpeechCorrections((prev) => prev.filter((c) => c.id !== id));
      
      toast({
        title: "Correção removida",
        description: "A correção foi removida da sua lista.",
      });
    } catch (err) {
      console.error("Exceção ao remover correção:", err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar remover a correção.",
        variant: "destructive"
      });
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
      const { error } = await supabase
        .from('experta_go_corrections')
        .update({
          is_corrected: true,
          corrected_text: editText.trim()
        })
        .eq('id', correctionId);

      if (error) throw error;

      const correction = corrections.find(c => c.id === correctionId);
      if (correction) {
        if (correction.item_type === 'sale') {
          await supabase
            .from('experta_go_sales')
            .update({
              product_name: editText.trim(),
              is_generic_product: false,
              correction_pending: false
            })
            .eq('id', correction.item_id);

          await supabase
            .from('experta_go_products')
            .update({
              name: editText.trim(),
              is_generic: false
            })
            .eq('user_id', user?.id)
            .eq('name', correction.original_text);

        } else {
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
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pendentes ({pendingCorrections.length})</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="completed">Completas ({completedCorrections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Correções Pendentes
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
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Treinamento de Voz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 border border-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Use esta seção para treinar o reconhecimento de voz. Fale algo, verifique como foi reconhecido e corrija se necessário. 
                  Suas correções serão aplicadas automaticamente nos próximos registros.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={startListening} 
                    disabled={isListening}
                    className="w-full sm:w-auto"
                  >
                    {isListening ? "Ouvindo..." : "Iniciar Gravação"}
                    <Mic className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="voiceText" className="text-sm font-medium">
                      Texto Reconhecido:
                    </label>
                    <Input
                      id="voiceText"
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      placeholder="O texto reconhecido aparecerá aqui"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="correctedText" className="text-sm font-medium">
                      Correção (o que você realmente disse):
                    </label>
                    <Input
                      id="correctedText"
                      value={correctedText}
                      onChange={(e) => setCorrectedText(e.target.value)}
                      placeholder="Digite a correção aqui"
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    onClick={saveVoiceCorrection}
                    disabled={!voiceText || !correctedText}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Salvar Correção
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Suas Correções de Voz</h3>
                
                {speechCorrections.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Você ainda não tem nenhuma correção de voz salva.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {speechCorrections.map((correction) => (
                      <Card key={correction.id} className="bg-card">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                {new Date(correction.created_at).toLocaleString()}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeSpeechCorrection(correction.id)}
                                className="h-6 px-2 text-destructive hover:text-destructive"
                              >
                                Remover
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <div>
                                <span className="text-sm font-semibold">Original: </span>
                                <span className="text-sm">{correction.original_text}</span>
                              </div>
                              <div>
                                <span className="text-sm font-semibold">Correção: </span>
                                <span className="text-sm">{correction.corrected_text}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          {completedCorrections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Correções Realizadas
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
