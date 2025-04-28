
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, ShoppingCart, Repeat, Check, History, X, HelpCircle } from "lucide-react";
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

export function VoiceToCartCreator() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [parsedOrder, setParsedOrder] = useState<EnhancedVoiceItem | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recentOrders, setRecentOrders] = useState<{text: string, timestamp: number}[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();
  const isMobile = useIsMobile();

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

  // Iniciar reconhecimento de voz
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
      
      // Adicionar aos pedidos recentes
      setRecentOrders(prev => {
        const newOrders = [{text: transcript, timestamp: Date.now()}, ...prev];
        return newOrders.slice(0, 5); // Manter apenas os 5 mais recentes
      });
      
      processVoiceOrder(transcript);
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
      
      // Salvar para treinamento
      saveTrainingData({
        voiceInput: text,
        parsedOrder: parsed,
        selectedProduct: match.product,
        userCorrected: false,
        timestamp: Date.now()
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
        timestamp: Date.now()
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
    
    // Limpar o estado após adicionar
    setParsedOrder(null);
    setMatchedProduct(null);
    setQuantity(1);
  };

  // Rejeitar correspondência
  const handleReject = () => {
    // Salvar feedback negativo para treinamento
    if (parsedOrder) {
      saveTrainingData({
        voiceInput: recognizedText,
        parsedOrder: parsedOrder,
        selectedProduct: matchedProduct,
        userCorrected: true,
        timestamp: Date.now()
      });
    }
    
    setParsedOrder(null);
    setMatchedProduct(null);
    toast({
      title: "Correspondência rejeitada",
      description: "Produto não adicionado ao carrinho.",
    });
  };

  // Repetir último pedido
  const handleRepeatLast = () => {
    if (recentOrders.length > 0) {
      setRecognizedText(recentOrders[0].text);
      processVoiceOrder(recentOrders[0].text);
    }
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

  return (
    <div className="space-y-4">
      {/* Card de gravação de voz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <span>Adicionar ao carrinho por voz</span>
          </CardTitle>
          <CardDescription>
            Diga o que deseja adicionar ao carrinho. Por exemplo: "2 caixas de leite" ou "5 pacotes de biscoito"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <Button
              onClick={handleListen}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="h-16 w-16 rounded-full"
              disabled={isListening || isLoadingProducts}
            >
              {isListening ? 
                <MicOff className="h-6 w-6 animate-pulse" /> : 
                <Mic className="h-6 w-6" />
              }
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {isListening ? 
                <span className="animate-pulse">Ouvindo...</span> : 
                <span>Toque para começar a gravação</span>
              }
            </div>
          </div>
          
          {recognizedText && (
            <div className="mt-4">
              <p className="text-sm font-medium">Texto reconhecido:</p>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRepeatLast}
            disabled={recentOrders.length === 0 || isListening}
          >
            <Repeat className="h-4 w-4 mr-1" />
            Repetir último
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Diga a quantidade e o produto que deseja adicionar.<br/>Exemplo: "3 caixas de leite"</p>
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
        <AlertTitle>Dicas para melhores resultados</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Mencione a quantidade e o nome do produto claramente</li>
            <li>Fale devagar e em um ambiente sem ruído</li>
            <li>Você pode mencionar características como marca e preço</li>
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
    </div>
  );
}
