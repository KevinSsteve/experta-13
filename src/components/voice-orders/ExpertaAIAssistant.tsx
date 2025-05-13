
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, ShoppingCart, Info, History, Check, AlertCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/contexts/CartContext";
import { parseVoiceOrder, findBestProductMatch, EnhancedVoiceItem } from "@/utils/voiceCartUtils";
import { processVoiceCommand, CommandType, RecognizedCommand } from "@/utils/expertaAIUtils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

export function ExpertaAIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [command, setCommand] = useState<RecognizedCommand | null>(null);
  const [recentCommands, setRecentCommands] = useState<{text: string, timestamp: number, type: CommandType}[]>([]);
  const [contextualData, setContextualData] = useState<{
    timeOfDay: string;
    deviceType: string;
  }>({
    timeOfDay: '',
    deviceType: '',
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();
  
  // Resultado do reconhecimento de voz para adição ao carrinho
  const [parsedOrder, setParsedOrder] = useState<EnhancedVoiceItem | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  
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

  // Coletar dados contextuais no carregamento
  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay = '';
    
    if (hour >= 5 && hour < 12) timeOfDay = 'manhã';
    else if (hour >= 12 && hour < 18) timeOfDay = 'tarde';
    else timeOfDay = 'noite';
    
    const deviceType = window.innerWidth <= 768 ? 'mobile' : 'desktop';
    
    setContextualData({
      timeOfDay,
      deviceType,
    });
  }, []);

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
      
      // Adicionar aos comandos recentes
      const processedCommand = processVoiceCommand(transcript, products || []);
      
      setRecentCommands(prev => {
        const newCommands = [{
          text: transcript, 
          timestamp: Date.now(),
          type: processedCommand.type
        }, ...prev];
        return newCommands.slice(0, 5); // Manter apenas os 5 mais recentes
      });
      
      processVoiceInput(transcript);
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

  // Processar o comando de voz
  const processVoiceInput = (text: string) => {
    if (!text) return;
    
    // Identificar o tipo de comando
    const processedCommand = processVoiceCommand(text, products || []);
    setCommand(processedCommand);
    
    // Com base no tipo de comando, realizar ações diferentes
    switch (processedCommand.type) {
      case CommandType.ADD_PRODUCT:
        handleAddProductCommand(text);
        break;
      case CommandType.REGISTER_SALE:
        handleRegisterSaleCommand(processedCommand);
        break;
      case CommandType.REGISTER_EXPENSE:
        handleRegisterExpenseCommand(processedCommand);
        break;
      case CommandType.CHECK_STOCK:
        handleCheckStockCommand(processedCommand);
        break;
      default:
        toast({
          title: "Comando não reconhecido",
          description: "Não foi possível entender o comando. Tente novamente.",
          variant: "destructive"
        });
        break;
    }
  };

  // Processar comando de adicionar produto
  const handleAddProductCommand = (text: string) => {
    if (!products || products.length === 0) return;
    
    // Reutilizamos a lógica existente
    const parsed = parseVoiceOrder(text);
    setParsedOrder(parsed);
    
    // Encontrar o melhor produto correspondente
    const match = findBestProductMatch(parsed, products);
    
    if (match && match.product) {
      setMatchedProduct(match.product);
      setQuantity(parsed.quantity || 1);
      
      toast({
        title: "Produto encontrado",
        description: `"${match.product.name}" correspondência de ${Math.round(match.confidence * 100)}%`,
      });
    } else {
      setMatchedProduct(null);
      toast({
        title: "Produto não encontrado",
        description: "Não encontramos um produto correspondente ao seu pedido.",
        variant: "destructive"
      });
    }
  };
  
  // Processar comando de registrar venda
  const handleRegisterSaleCommand = (command: RecognizedCommand) => {
    // Aqui apenas mostramos um toast, mas poderíamos navegar para a página
    // de vendas ou abrir um modal para completar a venda
    const { amount, customer, paymentMethod } = command.data;
    
    toast({
      title: "Registrar venda",
      description: `Valor: ${formatCurrency(amount)}, Cliente: ${customer}, Método: ${paymentMethod}`,
    });
  };
  
  // Processar comando de registrar despesa
  const handleRegisterExpenseCommand = (command: RecognizedCommand) => {
    const { amount, category, description } = command.data;
    
    toast({
      title: "Registrar despesa",
      description: `Valor: ${formatCurrency(amount)}, Categoria: ${category}`,
    });
  };
  
  // Processar comando de verificar estoque
  const handleCheckStockCommand = (command: RecognizedCommand) => {
    const { productName } = command.data;
    
    // Buscar produto pelo nome
    if (products && productName) {
      const normalizedQuery = productName.toLowerCase();
      const matchingProducts = products.filter(p => 
        p.name.toLowerCase().includes(normalizedQuery)
      );
      
      if (matchingProducts.length > 0) {
        const product = matchingProducts[0];
        toast({
          title: "Estoque disponível",
          description: `${product.name}: ${product.stock} unidades disponíveis`,
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: `Não encontramos "${productName}" no estoque`,
          variant: "destructive"
        });
      }
    }
  };

  // Adicionar ao carrinho quando é um comando de produto
  const handleAddToCart = () => {
    if (!matchedProduct) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem(matchedProduct);
    }
    
    toast({
      title: "Produto adicionado!",
      description: `${quantity} x ${matchedProduct.name} adicionado ao carrinho.`,
    });
    
    // Limpar o estado
    setParsedOrder(null);
    setMatchedProduct(null);
    setQuantity(1);
  };

  // Repetir último comando
  const handleRepeatLast = () => {
    if (recentCommands.length > 0) {
      setRecognizedText(recentCommands[0].text);
      processVoiceInput(recentCommands[0].text);
    }
  };

  // Retornar cor de confiança
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return "bg-gray-100";
    if (confidence > 0.8) return "bg-green-100 border-green-200";
    if (confidence > 0.5) return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  // Obter texto de confiança
  const getConfidenceText = (confidence?: number): string => {
    if (!confidence) return "Desconhecida";
    if (confidence > 0.8) return "Alta";
    if (confidence > 0.5) return "Média";
    return "Baixa";
  };

  // Obter ícone para o tipo de comando
  const getCommandIcon = (type: CommandType) => {
    switch (type) {
      case CommandType.ADD_PRODUCT:
        return <ShoppingCart className="h-4 w-4" />;
      case CommandType.REGISTER_SALE:
        return <Check className="h-4 w-4" />;
      case CommandType.REGISTER_EXPENSE:
        return <AlertCircle className="h-4 w-4" />;
      case CommandType.CHECK_STOCK:
        return <Info className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  // Obter título para o tipo de comando
  const getCommandTitle = (type: CommandType): string => {
    switch (type) {
      case CommandType.ADD_PRODUCT:
        return "Adicionar produto";
      case CommandType.REGISTER_SALE:
        return "Registrar venda";
      case CommandType.REGISTER_EXPENSE:
        return "Registrar despesa";
      case CommandType.CHECK_STOCK:
        return "Verificar estoque";
      default:
        return "Comando desconhecido";
    }
  };

  return (
    <div className="space-y-4">
      {/* Card de gravação de voz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <span>Experta AI - Assistente de Voz</span>
          </CardTitle>
          <CardDescription>
            Diga um comando para adicionar produtos, registrar vendas ou despesas, ou verificar estoque.
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
          
          {command && (
            <div className="mt-4">
              <p className="text-sm font-medium">Tipo de comando identificado:</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getCommandIcon(command.type)}
                  <span>{getCommandTitle(command.type)}</span>
                </Badge>
                <Badge className={command.confidence > 0.6 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  Confiança: {Math.round(command.confidence * 100)}%
                </Badge>
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
            disabled={recentCommands.length === 0 || isListening}
          >
            <History className="h-4 w-4 mr-1" />
            Repetir último
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="w-80 p-3">
                <p className="font-medium mb-2">Exemplos de comandos:</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Adicionar produto:</strong> "3 caixas de leite"</li>
                  <li><strong>Registrar venda:</strong> "Registrar venda de 50 reais para cliente João"</li>
                  <li><strong>Registrar despesa:</strong> "Despesa de aluguel no valor de 500"</li>
                  <li><strong>Verificar estoque:</strong> "Quantos pacotes de arroz temos no estoque?"</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
      
      {/* Card de produto correspondente quando for um comando de adicionar produto */}
      {parsedOrder && matchedProduct && command?.type === CommandType.ADD_PRODUCT && (
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
        <AlertTitle>Como usar a Experta AI</AlertTitle>
        <AlertDescription>
          <p className="mb-2">A Experta AI é um assistente inteligente para seu negócio. Experimente:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Adicionar produtos ao carrinho: "3 pacotes de arroz"</li>
            <li>Registrar vendas: "Registrar venda de 150 reais do cliente Maria"</li>
            <li>Controlar despesas: "Despesa de luz no valor de 200 reais"</li>
            <li>Verificar estoque: "Verificar estoque de leite"</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      {/* Histórico de comandos recentes */}
      {recentCommands.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
            <History className="h-4 w-4" />
            Comandos recentes
          </h3>
          <div className="space-y-2">
            {recentCommands.map((cmd, index) => (
              <div 
                key={index} 
                className="p-2 border rounded-md text-sm hover:bg-accent/20 cursor-pointer transition-colors"
                onClick={() => {
                  setRecognizedText(cmd.text);
                  processVoiceInput(cmd.text);
                }}
              >
                <div className="flex justify-between items-center">
                  <p className="truncate">{cmd.text}</p>
                  <Badge variant="outline" className="flex items-center gap-1 shrink-0 ml-2">
                    {getCommandIcon(cmd.type)}
                    <span className="hidden sm:inline">{getCommandTitle(cmd.type)}</span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(cmd.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
