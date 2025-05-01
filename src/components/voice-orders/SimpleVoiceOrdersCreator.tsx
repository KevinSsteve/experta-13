
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, List, HelpCircle } from "lucide-react";
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

  const handleListen = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado!",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive"
      });
      return;
    }
    
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedText(transcript);
      
      // Identificar produtos separados por vírgulas, "e" ou "mais"
      const productList = transcript
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
      }
    };

    recognition.onerror = (e) => {
      console.error('Erro de reconhecimento de voz:', e);
      toast({
        title: "Erro",
        description: "Houve um erro no reconhecimento de voz.",
        variant: "destructive"
      });
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    recognition.start();
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
                  Pressione o microfone e fale os itens da sua lista. 
                  Separe os itens com "e" ou vírgulas para adicionar vários produtos de uma vez.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleListen}
            variant={isListening ? "destructive" : "secondary"}
            size="sm"
            className="flex-grow-0"
            disabled={isListening}
          >
            {isListening ? (
              <><MicOff className="h-4 w-4 mr-1" /> Ouvindo...</>
            ) : (
              <><Mic className="h-4 w-4 mr-1" /> Adicionar por voz</>
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
