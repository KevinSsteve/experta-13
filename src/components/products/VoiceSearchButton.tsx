
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
}

export const VoiceSearchButton = ({ onResult }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
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
      onResult(transcript);
      
      toast({
        title: "Busca por voz",
        description: `"${transcript}"`,
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
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-3 top-1/2 -translate-y-1/2"
      onClick={startListening}
      disabled={isListening}
    >
      {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
      <span className="sr-only">{isListening ? 'Ouvindo...' : 'Busca por voz'}</span>
    </Button>
  );
};
