
import { MainLayout } from "@/components/layouts/MainLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mic } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceOrderTrainingData } from "@/utils/voiceCartUtils";

// Interface para os pares de correção
interface CorrectionPair {
  id: string;
  original_text: string;
  corrected_text: string;
  user_id: string;
  created_at: string;
  active: boolean;
}

export default function Treinamento() {
  const { user, isLoading: authLoading } = useAuth();
  const [voiceText, setVoiceText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [corrections, setCorrections] = useState<CorrectionPair[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Carregar correções existentes
  useEffect(() => {
    if (!user || authLoading) {
      setCorrections([]);
      return;
    }
    setLoading(true);
    supabase
      .from("speech_corrections")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar correções:", error);
          toast({
            title: "Erro ao carregar correções",
            description: "Não foi possível carregar suas correções: " + error.message,
            variant: "destructive"
          });
          setCorrections([]);
        } else if (data) {
          setCorrections(data as CorrectionPair[]);
        }
        setLoading(false);
      });
  }, [user, authLoading, toast]);

  // Iniciar o reconhecimento de voz
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
    
    // Inicializa o reconhecimento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setCorrectedText(transcript); // Inicialmente, texto corrigido é igual ao reconhecido
      
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

  // Salvar a correção
  const saveCorrection = async () => {
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
      // 1. Salvar na tabela speech_corrections
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
      
      // 2. Se foi bem sucedido, adicione à lista local
      if (data) {
        setCorrections((prev) => [data[0] as CorrectionPair, ...prev]);
        
        // 3. Também salvar na tabela de backup voice_training_backups
        try {
          // Criar uma versão compatível com o formato de backup
          await supabase.from('voice_training_backups').insert({
            user_id: user.id,
            voice_input: voiceText,
            correct_product_name: correctedText, // Usamos o campo pois é o mais próximo
            was_helpful: true,
            feedback: JSON.stringify({
              correction_type: "speech",
              original: voiceText,
              corrected: correctedText
            }),
            alternative_terms: [correctedText],
            created_at: new Date().toISOString()
          });
        } catch (backupError) {
          console.error("Erro ao criar backup da correção:", backupError);
          // Não interromper o fluxo se o backup falhar
        }
        
        // 4. Armazenar dados de treinamento para melhorar o algoritmo (localStorage)
        const trainingData: VoiceOrderTrainingData = {
          voiceInput: voiceText,
          parsedOrder: {
            name: correctedText,
            quantity: 1,
            confidence: 0.8,
            originalText: voiceText
          },
          selectedProduct: null,
          userCorrected: true,
          timestamp: Date.now(),
          alternativeTerms: [voiceText],
          deviceInfo: navigator.userAgent,
          feedbackRating: 1 // Consideramos útil
        };
        
        // Salvar localmente para análise futura
        try {
          const storedData = localStorage.getItem('voiceOrderTraining');
          let trainingDataset: VoiceOrderTrainingData[] = [];
          
          if (storedData) {
            trainingDataset = JSON.parse(storedData);
          }
          
          // Limitamos a 100 entradas para não sobrecarregar o localStorage
          if (trainingDataset.length > 100) {
            trainingDataset = trainingDataset.slice(-100);
          }
          
          trainingDataset.push(trainingData);
          localStorage.setItem('voiceOrderTraining', JSON.stringify(trainingDataset));
        } catch (storageError) {
          console.error('Erro ao salvar dados de treinamento:', storageError);
        }
        
        // Limpar os campos após salvar
        setVoiceText("");
        setCorrectedText("");
        
        toast({
          title: "Correção salva",
          description: "Sua correção foi salva com sucesso com backup no servidor.",
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

  // Remover uma correção
  const removeCorrection = async (id: string) => {
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
      
      setCorrections((prev) => prev.filter((c) => c.id !== id));
      
      toast({
        title: "Correção removida",
        description: "A correção foi removida da sua lista, mas o backup continua.",
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

  return (
    <MainLayout>
      <div className={`mx-auto py-6 px-3 ${isMobile ? 'w-full' : 'max-w-2xl'} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Treinamento de Voz</h1>
          </div>
        </div>
        
        <Alert className="bg-muted/50 border-muted">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Área de Treinamento de Reconhecimento de Voz</AlertTitle>
          <AlertDescription>
            Nesta área, você pode ajudar a melhorar o reconhecimento de voz para produtos angolanos e termos específicos.
            Fale algo, verifique como foi reconhecido e corrija se necessário. Suas correções serão usadas para melhorar o sistema.
            {!user && (
              <p className="mt-2 text-sm font-medium text-primary">
                Faça login para que suas correções sejam salvas permanentemente no servidor.
              </p>
            )}
          </AlertDescription>
        </Alert>
        
        <Card className="bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Reconhecimento de Voz</h2>
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
            </div>
            
            <div className="grid gap-4 pt-4">
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
                onClick={saveCorrection}
                disabled={!voiceText || !correctedText}
                className="w-full"
              >
                Salvar Correção
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Suas Correções Salvas</h2>
          
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando correções...</div>
          ) : corrections.length === 0 ? (
            <div className="text-center text-muted-foreground">Você ainda não tem nenhuma correção salva.</div>
          ) : (
            <div className="space-y-3">
              {corrections.map((correction) => (
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
                          onClick={() => removeCorrection(correction.id)}
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
      </div>
    </MainLayout>
  );
}
