import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Timer, Volume2, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { processExpertaGoVoiceInput } from "@/utils/expertaGoUtils";
import { applyVoiceCorrections } from "@/utils/speechCorrectionUtils";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  type: 'sale' | 'expense';
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

interface CorrectionNotification {
  originalText: string;
  show: boolean;
}

export function VoiceRecorder({ type, isActive, onActiveChange }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [correctionNotification, setCorrectionNotification] = useState<CorrectionNotification>({
    originalText: "",
    show: false
  });
  const [correctionText, setCorrectionText] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();
  const recognitionRef = useRef<any>(null);
  const processedTranscriptsRef = useRef<Set<string>>(new Set());

  // Timer para contar tempo de gravação
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRecordingTime(0);
    }
  }, [isListening]);

  // Função para detectar se o texto tem informação numérica suficiente
  const hasNumericInfo = (text: string): boolean => {
    // Padrões para detectar preços
    const pricePatterns = [
      /\b\d+(?:[,.]\d{1,2})?\s*(?:kz|kwanzas?|reais?)\b/i,
      /\b(?:r\$|kz)\s*\d+(?:[,.]\d{1,2})?\b/i,
      /\b(?:de|por|custa|vale|custou|paguei|gastei)\s+\d+(?:[,.]\d{1,2})?\b/i,
      /\b\d+(?:[,.]\d{1,2})?\s*(?:cada|unidade|por)\b/i,
    ];

    // Padrões para detectar quantidade
    const quantityPatterns = [
      /^\d+\s+/,  // "2 pacotes..."
      /\b\d+\s+(?:unidades?|unids?|pcs?|peças?|pacotes?)\b/i,
    ];

    const hasPrice = pricePatterns.some(pattern => pattern.test(text));
    const hasQuantity = quantityPatterns.some(pattern => pattern.test(text));

    // Para vendas, precisa de quantidade E preço ou pelo menos um valor numérico claro
    if (type === 'sale') {
      return hasPrice || hasQuantity || /\b\d+\b/.test(text);
    }
    
    // Para despesas, precisa de valor monetário
    return hasPrice || /\b\d+\b/.test(text);
  };

  const showCorrectionNotification = (originalText: string) => {
    setCorrectionNotification({
      originalText,
      show: true
    });
    setCorrectionText(originalText);
  };

  const hideCorrectionNotification = () => {
    setCorrectionNotification({
      originalText: "",
      show: false
    });
    setCorrectionText("");
  };

  const saveCorrection = async () => {
    if (!user || !correctionText.trim() || !correctionNotification.originalText) return;

    try {
      const { error } = await supabase
        .from("speech_corrections")
        .insert([{
          original_text: correctionNotification.originalText,
          corrected_text: correctionText.trim(),
          user_id: user.id,
          active: true
        }]);

      if (error) {
        console.error("Erro ao salvar correção:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a correção.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Correção salva!",
        description: "Sua correção foi registrada e será aplicada nos próximos reconhecimentos.",
      });

      // Processar o texto corrigido
      processVoiceInput(correctionText.trim());
      hideCorrectionNotification();

    } catch (error) {
      console.error("Erro ao salvar correção:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a correção.",
        variant: "destructive"
      });
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive"
      });
      return;
    }

    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        onActiveChange(true);
        setTranscript("");
        console.log("Reconhecimento iniciado para:", type);
      };

      recognition.onresult = async (event) => {
        const current = event.resultIndex;
        const originalTranscript = event.results[current][0].transcript;
        
        console.log(`Texto original reconhecido: "${originalTranscript}"`);
        
        // DETECTAR E APLICAR CORREÇÕES DA BASE DE DADOS
        const correctedTranscript = await applyVoiceCorrections(originalTranscript, user?.id);
        
        console.log(`Texto após correções: "${correctedTranscript}"`);
        
        // Mostrar na interface o texto já corrigido
        setTranscript(correctedTranscript);

        // Notificar se correção foi aplicada
        if (originalTranscript.toLowerCase() !== correctedTranscript.toLowerCase()) {
          console.log(`✅ Correção aplicada automaticamente: "${originalTranscript}" → "${correctedTranscript}"`);
          toast({
            title: "Correção aplicada",
            description: `"${originalTranscript}" foi corrigido para "${correctedTranscript}"`,
            duration: 3000
          });
        }

        // Se o resultado for final, verificar se tem informação numérica
        if (event.results[current].isFinal) {
          console.log("Texto final reconhecido (original):", originalTranscript);
          console.log("Texto final corrigido:", correctedTranscript);
          
          // VERIFICAR SE TEM INFORMAÇÃO NUMÉRICA SUFICIENTE
          if (!hasNumericInfo(correctedTranscript)) {
            console.log("⚠️ Falta informação numérica, mostrando notificação de correção");
            showCorrectionNotification(correctedTranscript);
            return;
          }
          
          // Verificar se já processamos este texto
          if (!processedTranscriptsRef.current.has(correctedTranscript.trim())) {
            processedTranscriptsRef.current.add(correctedTranscript.trim());
            processVoiceInput(correctedTranscript);
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Erro no reconhecimento:', e);
        stopListening();
        
        if (e.error !== 'no-speech') {
          toast({
            title: "Erro no reconhecimento",
            description: "Tente novamente. Certifique-se de falar claramente.",
            variant: "destructive"
          });
        }
      };

      recognition.onend = () => {
        console.log("Reconhecimento encerrado");
        stopListening();
      };

      recognition.start();
      recognitionRef.current = recognition;
      
    } catch (error) {
      console.error("Erro ao iniciar reconhecimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o reconhecimento de voz.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    onActiveChange(false);
    setRecordingTime(0);
  };

  const processVoiceInput = async (text: string) => {
    if (!text.trim() || !user || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const result = await processExpertaGoVoiceInput(text, type, user.id);
      
      if (result.success) {
        const typeLabel = type === 'sale' ? 'Venda' : 'Despesa';
        toast({
          title: `${typeLabel} registrada!`,
          description: result.message,
          duration: 4000
        });
      } else {
        toast({
          title: "Erro no processamento",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao processar entrada de voz:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua fala. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setTranscript("");
      // Limpar cache após um tempo
      setTimeout(() => {
        processedTranscriptsRef.current.clear();
      }, 5000);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getExampleText = () => {
    return type === 'sale' 
      ? "Ex: '2 pacotes de manteiga de 400 kz cada'"
      : "Ex: 'Comprei carne para o restaurante por 5000 kz'";
  };

  return (
    <div className="space-y-4">
      {/* Notificação de Correção */}
      {correctionNotification.show && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Falta informação importante!
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Detectamos que faltam números (quantidade/preço) no que você disse. Por favor, corrija:
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-yellow-600">
                    <strong>Sistema entendeu:</strong> "{correctionNotification.originalText}"
                  </p>
                  
                  <Input
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder={type === 'sale' ? 
                      "Ex: 2 pacotes de manteiga de 400 kz cada" : 
                      "Ex: Comprei carne para o restaurante por 5000 kz"
                    }
                    className="w-full bg-white"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={saveCorrection}
                      size="sm"
                      disabled={!correctionText.trim()}
                    >
                      Salvar Correção
                    </Button>
                    <Button 
                      onClick={hideCorrectionNotification}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interface de Gravação Existente */}
      <div className="text-center">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || correctionNotification.show}
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className={`h-20 w-20 rounded-full text-lg ${
            isListening ? 'animate-pulse' : ''
          }`}
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
        
        {isListening && (
          <Badge variant="destructive" className="mt-2 flex items-center gap-1 w-fit mx-auto">
            <Timer className="h-3 w-3" />
            {formatTime(recordingTime)}
          </Badge>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {isListening ? "🎤 Fale agora..." : getExampleText()}
      </div>

      {transcript && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Volume2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Ouvindo:</p>
                <p className="text-sm text-blue-700">"{transcript}"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            Processando...
          </div>
        </div>
      )}
    </div>
  );
}
