import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderOfflineProps {
  type: 'sale' | 'expense';
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export function VoiceRecorderOffline({ type, isActive, onActiveChange }: VoiceRecorderOfflineProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Seu navegador não suporta reconhecimento de voz");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'pt-BR';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript("");
      setSavedOffline(false);
      onActiveChange(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      toast.error("Erro no reconhecimento de voz");
      stopListening();
    };

    recognitionRef.current.onend = () => {
      if (transcript && isRecording) {
        processOfflineInput();
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    onActiveChange(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const processOfflineInput = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    
    try {
      // Simular processamento e salvar offline
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui salvaria no IndexedDB
      const offlineData = {
        id: crypto.randomUUID(),
        type,
        transcript,
        timestamp: new Date().toISOString(),
        processed: false
      };
      
      // Simular salvamento local
      console.log('Salvando offline:', offlineData);
      
      setSavedOffline(true);
      toast.success(`${type === 'sale' ? 'Venda' : 'Despesa'} salva offline!`);
      
      setTranscript("");
      setRecordingTime(0);
    } catch (error) {
      console.error('Erro ao processar offline:', error);
      toast.error("Erro ao salvar offline");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getExampleText = (): string => {
    return type === 'sale' 
      ? "Ex: 'Vendi 3 garrafas de água por 500 kwanzas cada'"
      : "Ex: 'Gastei 2000 kwanzas em combustível'";
  };

  return (
    <div className="space-y-4">
      {/* Botão principal */}
      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopListening : startListening}
          disabled={isProcessing}
          className={`w-20 h-20 rounded-full ${
            isRecording 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Status e timer */}
      {(isRecording || isProcessing) && (
        <div className="text-center space-y-2">
          {isRecording && (
            <Badge variant="outline" className="animate-pulse">
              {formatTime(recordingTime)}
            </Badge>
          )}
          
          {isProcessing && (
            <Badge variant="secondary">
              Processando offline...
            </Badge>
          )}
        </div>
      )}

      {/* Transcrição */}
      {transcript && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Transcrição:</h4>
            <p className="text-sm text-muted-foreground">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Confirmação offline */}
      {savedOffline && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-600">
              ✓ Salvo offline! Será sincronizado quando houver conexão.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exemplo de uso */}
      {!isRecording && !transcript && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {getExampleText()}
          </p>
        </div>
      )}
    </div>
  );
}