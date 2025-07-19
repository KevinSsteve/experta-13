import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Download } from "lucide-react";
import { toast } from "sonner";
import { whisperLocal } from "@/lib/whisper-local";

interface VoiceRecorderWithWhisperProps {
  type: 'sale' | 'expense';
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
}

export function VoiceRecorderWithWhisper({ type, isActive, onActiveChange }: VoiceRecorderWithWhisperProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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

  const initializeModel = async () => {
    if (whisperLocal.isModelLoaded() || whisperLocal.isModelLoading()) return;

    setIsModelLoading(true);
    try {
      await whisperLocal.init();
      toast.success("Modelo Whisper carregado!");
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
      toast.error("Erro ao carregar modelo de transcrição");
    } finally {
      setIsModelLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioWithWhisper(audioBlob);
        
        // Parar o stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript("");
      setSavedOffline(false);
      onActiveChange(true);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error("Erro ao acessar microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    onActiveChange(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    if (!whisperLocal.isModelLoaded()) {
      toast.error("Modelo Whisper não está carregado");
      return;
    }

    setIsProcessing(true);
    
    try {
      const transcriptionText = await whisperLocal.transcribe(audioBlob);
      
      if (transcriptionText.trim()) {
        setTranscript(transcriptionText);
        
        // Salvar no armazenamento offline
        const { offlineStorage } = await import('@/lib/offline-storage');
        await offlineStorage.saveRecord({
          type,
          transcript: transcriptionText,
          timestamp: new Date().toISOString(),
          processed: true,
          description: transcriptionText
        });
        
        setSavedOffline(true);
        toast.success(`${type === 'sale' ? 'Venda' : 'Despesa'} transcrita e salva offline!`);
      } else {
        toast.warning("Nenhum áudio foi detectado");
      }
    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast.error("Erro ao transcrever áudio");
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
      {/* Botão para carregar modelo */}
      {!whisperLocal.isModelLoaded() && !isModelLoading && (
        <div className="text-center">
          <Button
            onClick={initializeModel}
            variant="outline"
            className="mb-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Carregar Modelo de Transcrição
          </Button>
          <p className="text-xs text-muted-foreground">
            Necessário carregar uma vez para funcionamento offline
          </p>
        </div>
      )}

      {/* Status do modelo */}
      {isModelLoading && (
        <div className="text-center">
          <Badge variant="secondary" className="animate-pulse">
            Carregando modelo...
          </Badge>
        </div>
      )}

      {/* Botão principal */}
      <div className="flex justify-center">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isModelLoading || !whisperLocal.isModelLoaded()}
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
              Transcrevendo com Whisper...
            </Badge>
          )}
        </div>
      )}

      {/* Transcrição */}
      {transcript && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Transcrição (Whisper):</h4>
            <p className="text-sm text-muted-foreground">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Confirmação offline */}
      {savedOffline && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-600">
              ✓ Transcrito e salvo offline! Será sincronizado quando houver conexão.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exemplo de uso */}
      {!isRecording && !transcript && whisperLocal.isModelLoaded() && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {getExampleText()}
          </p>
        </div>
      )}
    </div>
  );
}