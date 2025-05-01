import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, List, HelpCircle, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseVoiceInput } from "@/utils/voiceUtils"; // Importando a função parseVoiceInput
import { parseVoiceOrder } from "@/utils/voiceCartUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductSuggestions } from "./ProductSuggestions";
import { useAuth } from "@/contexts/AuthContext";

interface VozContinuaCreatorProps {
  onListCreated: (products: string[]) => void;
}

export function VozContinuaCreator({ onListCreated }: VozContinuaCreatorProps) {
  const [isListening, setIsListening] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [transcriptBuffer, setTranscriptBuffer] = useState<string>("");
  const [lastSpeechTime, setLastSpeechTime] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [errorCounter, setErrorCounter] = useState(0);
  const [processingItem, setProcessingItem] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const autoRestartRef = useRef<boolean>(true);
  
  // Timer para contar o tempo de gravação
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [isListening]);
  
  // Efeito para processar pausas no reconhecimento
  useEffect(() => {
    if (lastSpeechTime && transcriptBuffer && !processingItem) {
      const SILENCE_DURATION = 3000; // 3 segundos de silêncio
      
      // Limpar o timer anterior para evitar processamentos duplicados
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      idleTimerRef.current = window.setTimeout(() => {
        console.log(`Silêncio detectado após: ${transcriptBuffer}`);
        setProcessingItem(true); // Impede processamento duplicado
        
        processItemAfterSilence(transcriptBuffer);
        
        // Importante: Parar completamente o reconhecimento atual
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        
        // Limpar buffer e estado
        setTranscriptBuffer("");
        setLastSpeechTime(null);
        
        // Pequeno delay e então reiniciar se ainda estiver em modo de escuta
        setTimeout(() => {
          if (isListening && autoRestartRef.current) {
            startSpeechRecognition();
            setErrorCounter(0); // Reseta o contador de erros após reiniciar com sucesso
          }
          setProcessingItem(false);
        }, 500);
      }, SILENCE_DURATION);
      
      return () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      };
    }
    return () => {};
  }, [lastSpeechTime, transcriptBuffer, isListening, processingItem]);
  
  // Iniciar o reconhecimento de voz com as configurações corretas
  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado!",
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
        console.log("Reconhecimento de voz iniciado");
      };
      
      recognition.onresult = (event) => {
        // Pegar o resultado mais recente
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        // Atualizar o buffer de transcrição com o novo texto
        setTranscriptBuffer(transcript);
        setLastSpeechTime(Date.now());
        
        // Resetar o timer de silêncio quando detecta fala
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
      };
      
      recognition.onerror = (e: any) => {
        console.log('Erro de reconhecimento de voz:', e);
        
        // Incrementa contador de erros
        setErrorCounter(prev => prev + 1);
        
        // Se houver muitos erros consecutivos, para completamente
        if (errorCounter > 5) {
          console.log("Muitos erros consecutivos, parando completamente");
          autoRestartRef.current = false;
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
          }
          setIsListening(false);
          setRecordingTime(0);
          
          toast({
            title: "Erro recorrente",
            description: "Muitos erros consecutivos. Reconhecimento de voz interrompido.",
            variant: "destructive"
          });
          
          return;
        }
        
        // Apenas mostra toast de erro para erros não relacionados a "no-speech"
        if (e.error !== 'no-speech') {
          // Limitamos os toasts de erro para não sobrecarregar a interface
          if (errorCounter < 3) {
            toast({
              title: "Erro",
              description: "Houve um erro no reconhecimento de voz. Tentando reiniciar...",
              variant: "destructive"
            });
          }
        }
        
        // Para o reconhecimento atual
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        
        // Reinicia após um pequeno delay
        setTimeout(() => {
          if (isListening && autoRestartRef.current) {
            console.log("Tentando reiniciar após erro...");
            startSpeechRecognition();
          }
        }, 1000);
      };
      
      recognition.onend = () => {
        console.log("Reconhecimento de voz encerrado");
        // Se não foi um término manual e ainda estamos em modo de escuta
        if (isListening && autoRestartRef.current && !processingItem) {
          console.log("Reiniciando reconhecimento automaticamente...");
          // Curto delay para evitar repetição infinita de erros
          setTimeout(() => {
            if (isListening && autoRestartRef.current) {
              startSpeechRecognition();
            }
          }, 1000);
        } else if (!autoRestartRef.current || !isListening) {
          setIsListening(false);
          setRecordingTime(0);
        }
      };
      
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Erro ao iniciar reconhecimento de voz:", err);
      setIsListening(false);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o reconhecimento de voz.",
        variant: "destructive"
      });
    }
  };
  
  // Processar um item após o silêncio
  const processItemAfterSilence = (text: string) => {
    if (!text.trim()) return;
    
    try {
      // Primeiro tentamos processar usando parseVoiceInput para capturar o nome e preço
      const parsedInput = parseVoiceInput(text.trim());
      
      // Depois processamos com parseVoiceOrder para obter informações adicionais como quantidade
      const processedItem = parseVoiceOrder(text.trim());

      // Combinamos as informações de ambas funções para garantir que capturamos tanto
      // o nome quanto o preço corretamente
      const itemJson = JSON.stringify({
        name: parsedInput.name || processedItem.name, // Usamos o nome de qualquer função que retornou um resultado
        price: parsedInput.price || processedItem.price, // Priorizamos o preço capturado
        quantity: processedItem.quantity || 1,
        originalText: text.trim()
      });
      
      console.log("Item processado:", JSON.parse(itemJson));
      
      // Adicionar o item à lista de produtos
      setProducts(prev => [...prev, itemJson]);
      
      // Feedback visual/sonoro
      const displayName = parsedInput.name || processedItem.name;
      const displayPrice = parsedInput.price || processedItem.price;
      
      const priceDisplay = displayPrice ? ` (${displayPrice})` : '';
      toast({
        title: "Item adicionado",
        description: `Item "${displayName}${priceDisplay}" adicionado à lista.`,
        duration: 1500
      });
    } catch (error) {
      console.error("Erro ao processar item:", error);
      // Fallback para texto simples se houver erro no processamento
      setProducts(prev => [...prev, text.trim()]);
      toast({
        title: "Item adicionado (texto bruto)",
        description: `"${text.trim()}" adicionado à lista.`,
        duration: 1500
      });
    }
  };
  
  const handleListen = () => {
    if (isListening) {
      // Desativa o reinício automático quando o usuário pressiona o botão para parar
      autoRestartRef.current = false;
      
      // Parar a gravação
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      // Processar qualquer texto pendente no buffer
      if (transcriptBuffer.trim()) {
        processItemAfterSilence(transcriptBuffer);
      }
      
      setIsListening(false);
      setTranscriptBuffer("");
      setLastSpeechTime(null);
      setRecordingTime(0);
      setErrorCounter(0);
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      
      return;
    }
    
    // Ativa o reinício automático quando o usuário inicia a gravação
    autoRestartRef.current = true;
    setErrorCounter(0);
    startSpeechRecognition();
  };
  
  const handleCreateList = () => {
    if (products.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione pelo menos um item antes de criar a lista.",
        variant: "destructive"
      });
      return;
    }
    
    onListCreated(products);
    setProducts([]);
  };
  
  const handleRemoveItem = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getItemName = (item: string): string => {
    try {
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed === 'object') {
        // Formatar o nome com o preço, se disponível
        const name = parsed.name || '';
        const price = parsed.price ? ` (${parsed.price})` : '';
        return `${name}${price}`;
      }
      return item;
    } catch (e) {
      return item;
    }
  };

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          <span>Gravação Contínua de Itens</span>
          {isListening && (
            <Badge variant="destructive" className="animate-pulse flex gap-1 ml-2">
              <Timer className="h-3 w-3" />
              {formatTime(recordingTime)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Pressione o botão de microfone e fale os itens para sua lista. Faça uma pausa de 3 segundos entre cada item.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button
            onClick={handleListen}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className={`h-16 w-16 rounded-full ${isListening ? 'animate-pulse' : ''}`}
          >
            {isListening ? 
              <MicOff className="h-6 w-6" /> : 
              <Mic className="h-6 w-6" />
            }
          </Button>
        </div>
        
        {transcriptBuffer && (
          <div className="mt-4 p-3 border rounded-md bg-muted/30">
            <p className="text-sm font-medium">Ouvindo:</p>
            <p className="text-sm mt-1">"{transcriptBuffer}"</p>
          </div>
        )}
        
        {products.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center">
                <List className="h-4 w-4 mr-1" />
                Itens ({products.length})
              </h3>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Clique em um item para ver sugestões de produtos do seu inventário.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product, index) => {
                const itemName = getItemName(product);
                return (
                  <div key={index} className="relative">
                    <div 
                      className={`p-3 border rounded-md cursor-pointer hover:bg-accent/10 ${expandedItem === index ? 'bg-accent/20 border-primary' : ''}`}
                      onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm">{itemName}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(index);
                          }}
                        >
                          <MicOff className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedItem === index && user && (
                      <div className="mt-1 ml-4 border-l-2 border-primary pl-3">
                        <ProductSuggestions productName={itemName} userId={user.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setProducts([])}
          disabled={products.length === 0}
        >
          Limpar itens
        </Button>
        
        <Button
          onClick={handleCreateList}
          disabled={products.length === 0}
        >
          Criar lista com {products.length} item{products.length !== 1 ? 'ns' : ''}
        </Button>
      </CardFooter>
    </Card>
  );
}
