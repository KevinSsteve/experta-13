
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Timer, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { processExpertaGoVoiceInput } from "@/utils/expertaGoUtils";

interface VoiceRecorderProps {
  type: 'sale' | 'expense';
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export function VoiceRecorder({ type, isActive, onActiveChange }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

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
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        onActiveChange(true);
        setTranscript("");
        console.log("Reconhecimento iniciado para:", type);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        // Se o resultado for final, processar
        if (event.results[current].isFinal) {
          console.log("Texto final reconhecido:", transcript);
          processVoiceInput(transcript);
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
    if (!text.trim() || !user) return;

    setIsProcessing(true);
    
    try {
      const result = await processExpertaGoVoiceInput(text, type, user.id);
      
      if (result.success) {
        const typeLabel = type === 'sale' ? 'venda' : 'despesa';
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
      <div className="text-center">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
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
