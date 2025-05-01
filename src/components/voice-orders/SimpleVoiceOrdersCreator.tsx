
import { useState, useRef } from "react";
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
  const accumulatedTextRef = useRef<string>("");

  const startNewSilenceTimer = () => {
    // Clear any existing silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // Start a new silence timer (3 seconds)
    silenceTimerRef.current = setTimeout(() => {
      // If we have accumulated text, treat it as a complete item
      if (accumulatedTextRef.current.trim()) {
        processItemFromSpeech(accumulatedTextRef.current);
        accumulatedTextRef.current = ""; // Reset accumulated text
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
      toast({
        title: `${productList.length} item(s) adicionado(s)`,
        description: productList.join(", "),
      });
      setRecognizedText(cleanText);
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      // Clear any pending silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Process any accumulated text
      if (accumulatedTextRef.current.trim()) {
        processItemFromSpeech(accumulatedTextRef.current);
        accumulatedTextRef.current = "";
      }
      
      setIsListening(false);
    } else {
      // Start listening
      setIsListening(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;  // Enable continuous recognition
      recognition.interimResults = true;  // Get partial results
      
      recognitionRef.current = recognition;
      
      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        const isFinal = event.results[lastResultIndex].isFinal;
        
        accumulatedTextRef.current = transcript;
        
        // Restart silence timer whenever we get a result
        startNewSilenceTimer();
        
        // If this is a final result and it's substantial
        if (isFinal && transcript.trim().length > 1) {
          processItemFromSpeech(transcript);
          accumulatedTextRef.current = "";
        }
      };
      
      recognition.onerror = (e) => {
        console.error('Erro de reconhecimento de voz:', e);
        toast({
          title: "Erro",
          description: "Houve um erro no reconhecimento de voz.",
          variant: "destructive"
        });
        
        // Clean up
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        setIsListening(false);
        recognitionRef.current = null;
      };
      
      recognition.onend = () => {
        // Only reset listening state if we're stopping intentionally
        // If we're still supposed to be listening, restart the recognition
        if (isListening && recognitionRef.current) {
          recognition.start();
        }
      };
      
      // Start the recognition process
      recognition.start();
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
                  Separe também os itens com "e" ou vírgulas para adicionar vários produtos de uma vez.
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
