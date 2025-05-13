
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, ShoppingCart, Repeat, Check, History, X, HelpCircle, MessageSquareText, TimerIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/contexts/CartContext";
import { parseVoiceOrder, findBestProductMatch, EnhancedVoiceItem, saveTrainingData } from "@/utils/voiceCartUtils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceTrainingFeedbackDialog } from "./VoiceTrainingFeedbackDialog";

export function VoiceToCartCreator() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [interimText, setInterimText] = useState<string>("");
  const [parsedOrder, setParsedOrder] = useState<EnhancedVoiceItem | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recentOrders, setRecentOrders] = useState<{text: string, timestamp: number}[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime, setMaxRecordingTime] = useState(30); // 30 segundos por padrão
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);
  
  const [contextualData, setContextualData] = useState<{
    timeOfDay: string;
    deviceType: string;
    userAgent: string;
  }>({
    timeOfDay: '',
    deviceType: '',
    userAgent: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();
  const isMobile = useIsMobile();

  // Coletar dados contextuais no carregamento
  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay = '';
    
    if (hour >= 5 && hour < 12) timeOfDay = 'manhã';
    else if (hour >= 12 && hour < 18) timeOfDay = 'tarde';
    else timeOfDay = 'noite';
    
    const deviceType = isMobile ? 'mobile' : 'desktop';
    const userAgent = navigator.userAgent;
    
    setContextualData({
      timeOfDay,
      deviceType,
      userAgent
    });
  }, [isMobile]);

  // Atualizar o temporizador
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Se atingiu o tempo máximo, para a gravação
          if (prev >= maxRecordingTime) {
            handleStopListening();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening, maxRecordingTime]);

  // Buscar produtos do usuário
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }
      
      return data as Product[];
    },
    enabled: !!user?.id
  });

  // Iniciar reconhecimento de voz contínuo
  const handleListen = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Não suportado!",
        description: "Seu navegador não suporta reconhecimento de voz.",
        variant: "destructive"
      });
      return;
    }
    
    // Limpar reconhecimento anterior se existir
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsListening(true);
    setRecordingTime(0);
    setInterimText("");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Configurar para modo contínuo
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      // Processar todos os resultados desde o último processamento
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          
          // Se não estiver processando outro pedido
          if (!processingRef.current) {
            processingRef.current = true;
            
            console.log('Texto final reconhecido:', transcript);
            
            // Adicionar aos pedidos recentes
            setRecentOrders(prev => {
              const newOrders = [{text: transcript, timestamp: Date.now()}, ...prev];
              return newOrders.slice(0, 5); // Manter apenas os 5 mais recentes
            });
            
            // Processar o pedido
            setRecognizedText(transcript);
            processVoiceOrder(transcript);
            
            // Permitir processar o próximo pedido após um tempo
            setTimeout(() => {
              processingRef.current = false;
            }, 1500);
          }
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Atualizar texto intermediário
      if (interimTranscript !== '') {
        setInterimText(interimTranscript);
      }
    };

    recognition.onerror = (e) => {
      console.error('Erro de reconhecimento de voz:', e);
      
      // Reiniciar reconhecimento em caso de erro
      if (isListening && recognitionRef.current === recognition) {
        recognition.stop();
        setTimeout(() => {
          if (isListening) {
            recognition.start();
            console.log('Reconhecimento de voz reiniciado após erro');
          }
        }, 500);
      }
      
      // Salvar dados sobre o erro localmente
      if (user?.id) {
        try {
          const voiceErrors = JSON.parse(localStorage.getItem('voiceRecognitionErrors') || '[]');
          voiceErrors.push({
            user_id: user.id,
            error_type: e.error,
            device_info: navigator.userAgent,
            created_at: new Date().toISOString()
          });
          localStorage.setItem('voiceRecognitionErrors', JSON.stringify(voiceErrors));
        } catch (err) {
          console.error('Exceção ao salvar erro:', err);
        }
      }
    };
    
    recognition.onend = () => {
      console.log('Sessão de reconhecimento de voz encerrada');
      
      // Reiniciar reconhecimento se ainda estiver no modo de escuta
      if (isListening && recognitionRef.current === recognition) {
        setTimeout(() => {
          if (isListening) {
            recognition.start();
            console.log('Reconhecimento de voz reiniciado');
          }
        }, 500);
      }
    };
    
    // Iniciar reconhecimento
    recognition.start();
    console.log('Reconhecimento de voz contínuo iniciado');
    
    toast({
      title: "Modo contínuo ativado",
      description: "Diga os produtos que deseja adicionar ao carrinho. A gravação continuará por " + maxRecordingTime + " segundos.",
    });
  };
  
  // Parar reconhecimento de voz
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsListening(false);
    setInterimText("");
    setRecordingTime(0);
    
    toast({
      title: "Gravação encerrada",
      description: "Modo de reconhecimento de voz contínuo desativado.",
    });
  };

  // Processar o pedido por voz
  const processVoiceOrder = (text: string) => {
    if (!text || !products || products.length === 0) return;
    
    // Analisar o pedido
    const parsed = parseVoiceOrder(text);
    setParsedOrder(parsed);
    
    // Encontrar o melhor produto correspondente
    const match = findBestProductMatch(parsed, products);
    
    if (match && match.product) {
      setMatchedProduct(match.product);
      setQuantity(parsed.quantity || 1);
      
      // Salvar dados de treinamento melhorados
      saveTrainingData({
        voiceInput: text,
        parsedOrder: parsed,
        selectedProduct: match.product,
        userCorrected: false,
        timestamp: Date.now(),
        contextData: {
          ...contextualData,
          confidence: match.confidence
        }
      });
    } else {
      setMatchedProduct(null);
      toast({
        title: "Produto não encontrado",
        description: "Não encontramos um produto correspondente ao seu pedido.",
        variant: "destructive"
      });
      
      // Salvar para treinamento mesmo sem correspondência
      saveTrainingData({
        voiceInput: text,
        parsedOrder: parsed,
        selectedProduct: null,
        userCorrected: false,
        timestamp: Date.now(),
        contextData: contextualData
      });
    }
  };

  // Adicionar ao carrinho
  const handleAddToCart = () => {
    if (!matchedProduct) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem(matchedProduct);
    }
    
    toast({
      title: "Produto adicionado!",
      description: `${quantity} x ${matchedProduct.name} adicionado ao carrinho.`,
    });
    
    // Salvar feedback positivo localmente
    if (user?.id && parsedOrder) {
      try {
        const feedbackData = JSON.parse(localStorage.getItem('voiceRecognitionFeedback') || '[]');
        feedbackData.push({
          user_id: user.id,
          voice_input: recognizedText,
          product_id: matchedProduct.id,
          product_name: matchedProduct.name,
          was_correct: true,
          confidence: parsedOrder.confidence,
          created_at: new Date().toISOString(),
          context: contextualData
        });
        localStorage.setItem('voiceRecognitionFeedback', JSON.stringify(feedbackData));
      } catch (err) {
        console.error('Exceção ao salvar feedback positivo:', err);
      }
    }
    
    // Limpar o estado após adicionar
    setParsedOrder(null);
    setMatchedProduct(null);
    setQuantity(1);
  };

  // Rejeitar correspondência
  const handleReject = () => {
    // Abrir o diálogo de feedback quando rejeitar
    setShowFeedback(true);
    
    // Salvar feedback negativo localmente
    if (user?.id && parsedOrder) {
      try {
        const feedbackData = JSON.parse(localStorage.getItem('voiceRecognitionFeedback') || '[]');
        feedbackData.push({
          user_id: user.id,
          voice_input: recognizedText,
          product_id: matchedProduct?.id,
          product_name: matchedProduct?.name,
          was_correct: false,
          confidence: parsedOrder.confidence,
          created_at: new Date().toISOString(),
          context: contextualData
        });
        localStorage.setItem('voiceRecognitionFeedback', JSON.stringify(feedbackData));
      } catch (err) {
        console.error('Exceção ao salvar feedback negativo:', err);
      }
    }
    
    // Salvar feedback negativo para treinamento
    if (parsedOrder) {
      saveTrainingData({
        voiceInput: recognizedText,
        parsedOrder: parsedOrder,
        selectedProduct: matchedProduct,
        userCorrected: true,
        timestamp: Date.now(),
        contextData: contextualData
      });
    }
  };

  // Repetir último pedido
  const handleRepeatLast = () => {
    if (recentOrders.length > 0) {
      setRecognizedText(recentOrders[0].text);
      processVoiceOrder(recentOrders[0].text);
    }
  };

  // Abrir diálogo de feedback manualmente
  const handleOpenFeedback = () => {
    setShowFeedback(true);
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return "bg-gray-100";
    if (confidence > 0.8) return "bg-green-100 border-green-200";
    if (confidence > 0.5) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  const getConfidenceText = (confidence?: number): string => {
    if (!confidence) return "Desconhecida";
    if (confidence > 0.8) return "Alta";
    if (confidence > 0.5) return "Média";
    return "Baixa";
  };

  // Atualizar tempo máximo de gravação
  const handleChangeMaxTime = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxRecordingTime(parseInt(e.target.value));
  };

  return (
    <div className="space-y-4">
      {/* Card de gravação de voz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <span>Adicionar ao carrinho por voz (Modo Contínuo)</span>
          </CardTitle>
          <CardDescription>
            Diga o que deseja adicionar ao carrinho. A gravação continuará ativa até que você a encerre ou atinja o limite de tempo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Button
              onClick={isListening ? handleStopListening : handleListen}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="h-16 w-16 rounded-full"
              disabled={isLoadingProducts}
            >
              {isListening ? 
                <MicOff className="h-6 w-6 animate-pulse" /> : 
                <Mic className="h-6 w-6" />
              }
            </Button>
            <div className="flex flex-col items-center">
              <div className="text-sm text-center text-muted-foreground mb-2">
                {isListening ? 
                  <span className="animate-pulse">Ouvindo continuamente...</span> : 
                  <span>Toque para começar a gravação contínua</span>
                }
              </div>
              
              {isListening && (
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Tempo: {recordingTime}s</span>
                    <span>Máximo: {maxRecordingTime}s</span>
                  </div>
                  <Progress value={(recordingTime / maxRecordingTime) * 100} />
                </div>
              )}
              
              {!isListening && (
                <div className="flex items-center gap-2">
                  <label htmlFor="maxTime" className="text-xs text-muted-foreground">
                    Tempo máximo:
                  </label>
                  <select 
                    id="maxTime"
                    className="text-xs p-1 border rounded"
                    value={maxRecordingTime}
                    onChange={handleChangeMaxTime}
                  >
                    <option value="15">15s</option>
                    <option value="30">30s</option>
                    <option value="60">60s</option>
                    <option value="120">2min</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {interimText && isListening && (
            <div className="mt-4">
              <p className="text-sm font-medium">Ouvindo em tempo real:</p>
              <div className="mt-1 p-3 border rounded-md bg-muted/30">
                <p className="text-sm italic text-muted-foreground">"{interimText}"</p>
              </div>
            </div>
          )}
          
          {recognizedText && (
            <div className="mt-4">
              <p className="text-sm font-medium">Último texto processado:</p>
              <div className="mt-1 p-3 border rounded-md bg-muted/30">
                <p className="text-sm">"{recognizedText}"</p>
              </div>
            </div>
          )}
          
          {isLoadingProducts && (
            <div className="mt-4 flex items-center justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando produtos...</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRepeatLast}
              disabled={recentOrders.length === 0 || isListening}
            >
              <Repeat className="h-4 w-4 mr-1" />
              Repetir último
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFeedback}
              disabled={!recognizedText}
            >
              <MessageSquareText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Enviar Feedback</span>
            </Button>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>No modo contínuo, o microfone fica ativo por mais tempo.<br/>
                   Fale naturalmente, seus pedidos serão processados automaticamente.<br/>
                   Pressione novamente para parar.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
      
      {/* Card de produto correspondente */}
      {parsedOrder && matchedProduct && (
        <Card className={`${getConfidenceColor(parsedOrder.confidence)} border`}>
          <CardHeader>
            <CardTitle className="text-base">Produto encontrado</CardTitle>
            <CardDescription>
              <Badge className="mr-1">{getConfidenceText(parsedOrder.confidence)} correspondência</Badge>
              {parsedOrder.confidence && (
                <Badge variant="outline">{Math.round(parsedOrder.confidence * 100)}%</Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-start">
              {matchedProduct.image && (
                <div className="h-20 w-20 rounded-md overflow-hidden border bg-white">
                  <img 
                    src={matchedProduct.image} 
                    alt={matchedProduct.name} 
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium">{matchedProduct.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">{matchedProduct.category}</Badge>
                  <Badge variant="secondary">{formatCurrency(matchedProduct.price)}</Badge>
                  {matchedProduct.stock > 0 ? (
                    <span className="text-xs text-green-700">Em estoque: {matchedProduct.stock}</span>
                  ) : (
                    <span className="text-xs text-red-700">Fora de estoque</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm">Quantidade:</span>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8 border rounded-md px-2 text-center"
                    min="1"
                    max={matchedProduct.stock}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleReject}>
              <X className="h-4 w-4 mr-1" />
              Não é isso
            </Button>
            <Button onClick={handleAddToCart} disabled={matchedProduct.stock <= 0}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Adicionar ao carrinho
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Alerta de instruções */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dicas para o modo contínuo</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Fale naturalmente, mencionando um produto por vez</li>
            <li>Faça uma pequena pausa entre os produtos</li>
            <li>O sistema reconhecerá automaticamente cada produto mencionado</li>
            <li>Você pode parar a gravação a qualquer momento</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      {/* Histórico de pedidos recentes */}
      {recentOrders.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
            <History className="h-4 w-4" />
            Pedidos recentes
          </h3>
          <div className="space-y-2">
            {recentOrders.map((order, index) => (
              <div 
                key={index} 
                className="p-2 border rounded-md text-sm hover:bg-accent/20 cursor-pointer transition-colors"
                onClick={() => {
                  setRecognizedText(order.text);
                  processVoiceOrder(order.text);
                }}
              >
                <p className="truncate">{order.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diálogo de Feedback */}
      <VoiceTrainingFeedbackDialog
        open={showFeedback}
        onOpenChange={setShowFeedback}
        voiceInput={recognizedText}
        suggestedProduct={matchedProduct}
        products={products || []}
      />
    </div>
  );
}
