
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, List, HelpCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimpleVoiceOrdersCreatorProps {
  onListCreated: (products: string[]) => void;
}

export function SimpleVoiceOrdersCreator({ onListCreated }: SimpleVoiceOrdersCreatorProps) {
  const [isListening, setIsListening] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // References for continuous listening
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedTextRef = useRef<string>("");
  const isSpeakingRef = useRef<boolean>(false);

  // Sound effect for item registration
  const playNotificationSound = () => {
    try {
      const audio = new Audio();
      audio.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaGAIAUAhCQGAOAx/8kxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=";
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };
  
  // Cleanup function for recognition
  const cleanupRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };
  
  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, []);

  const startNewSilenceTimer = () => {
    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // Start a new silence timer (3 seconds)
    silenceTimerRef.current = setTimeout(() => {
      // If we have accumulated text and we were speaking, treat it as a complete item
      if (accumulatedTextRef.current.trim() && isSpeakingRef.current) {
        processItemFromSpeech(accumulatedTextRef.current);
        accumulatedTextRef.current = ""; // Reset accumulated text
        isSpeakingRef.current = false;
      }
    }, 3000);
  };
  
  const processItemFromSpeech = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    
    // Identificar produtos separados por vírgulas, "e" ou "mais"
    const productList = cleanText
      .toLowerCase()
      .replace(/^(quero|adicionar|comprar|preciso|lista|listar)/g, "")
      .split(/\s*(?:,|e|mais)\s*/)
      .filter(item => item.trim().length > 1)
      .map(item => item.trim());
    
    if (productList.length > 0) {
      setProducts(prev => [...prev, ...productList]);
      setRecognizedText(cleanText);
      
      // Play notification sound and show toast
      playNotificationSound();
      toast({
        title: `${productList.length} item(s) adicionado(s)`,
        description: productList.join(", "),
      });
    }
  };

  const handleToggleListen = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado!",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      // Stop listening
      cleanupRecognition();
      setIsListening(false);
      
      // Process any accumulated text
      if (accumulatedTextRef.current.trim()) {
        processItemFromSpeech(accumulatedTextRef.current);
        accumulatedTextRef.current = "";
      }
    } else {
      // Start listening
      setIsListening(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;  // Enable continuous recognition
      recognition.interimResults = true;  // Get partial results
      
      recognitionRef.current = recognition;
      
      // Set up event handlers
      recognition.onstart = () => {
        console.log("Voice recognition started");
      };
      
      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        
        // Mark that we're speaking
        isSpeakingRef.current = true;
        
        // Update the accumulated text
        accumulatedTextRef.current = transcript;
        
        // Reset speech detection timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        
        // Restart silence timer whenever we get a result
        startNewSilenceTimer();
        
        console.log("Recognized speech:", transcript);
      };
      
      recognition.onaudiostart = () => {
        console.log("Audio capturing started");
      };
      
      recognition.onaudioend = () => {
        console.log("Audio capturing ended");
      };
      
      recognition.onsoundstart = () => {
        console.log("Sound detected");
      };
      
      recognition.onsoundend = () => {
        console.log("Sound ended");
      };
      
      recognition.onspeechstart = () => {
        console.log("Speech started");
        isSpeakingRef.current = true;
      };
      
      recognition.onspeechend = () => {
        console.log("Speech ended");
        // Use a small delay to confirm speech has ended
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        
        speechTimeoutRef.current = setTimeout(() => {
          isSpeakingRef.current = false;
        }, 500);
      };
      
      recognition.onerror = (e) => {
        console.error('Erro de reconhecimento de voz:', e);
        toast({
          title: "Erro",
          description: "Houve um erro no reconhecimento de voz.",
          variant: "destructive"
        });
        
        // Clean up
        cleanupRecognition();
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log("Recognition ended");
        // Only restart if we're still supposed to be listening
        if (isListening) {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (error) {
            console.error("Failed to restart recognition:", error);
            setIsListening(false);
          }
        }
      };
      
      // Start the recognition process
      try {
        recognition.start();
      } catch (error) {
        console.error("Failed to start recognition:", error);
        setIsListening(false);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o reconhecimento de voz.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAdd = () => {
    if (products.length > 0) {
      onListCreated(products);
      setProducts([]);
      setRecognizedText("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Nova Lista</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Pressione o microfone para iniciar a gravação. Clique novamente para parar.
                  Uma pausa de 3 segundos separa automaticamente um item do outro.
                  Cada frase completa é registrada como um item na lista após 3 segundos de silêncio.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleToggleListen}
            variant={isListening ? "destructive" : "secondary"}
            size="sm"
            className="flex-grow-0"
          >
            {isListening ? (
              <><MicOff className="h-4 w-4 mr-1" /> Parar gravação</>
            ) : (
              <><Mic className="h-4 w-4 mr-1" /> Iniciar gravação</>
            )}
          </Button>
          {recognizedText && (
            <span className="text-xs text-muted-foreground self-center">
              Último: "{recognizedText}"
            </span>
          )}
        </div>

        {products.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <List className="h-4 w-4" />
              <span>{products.length} item(s) na lista</span>
            </div>
            
            <div className="grid gap-1">
              {products.map((product, index) => (
                <div key={index} className="flex items-center justify-between bg-accent/10 rounded px-2 py-1">
                  <span className="text-sm truncate">{product}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleRemoveItem(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleAdd} 
              size="sm" 
              className={isMobile ? "w-full mt-2" : ""}
            >
              Salvar Lista
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
