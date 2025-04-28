
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, List, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseVoiceInput } from "@/utils/voiceUtils";
import { findSimilarProducts } from "@/utils/productMatchUtils";
import { ProductSuggestionItem } from "./ProductSuggestionItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/contexts/CartContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface VoiceOrdersCreatorProps {
  onListCreated: (products: string[]) => void;
}

export function VoiceOrdersCreator({ onListCreated }: VoiceOrdersCreatorProps) {
  const [isListening, setIsListening] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Array<Product & { similarity: number }>>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [noResultsFor, setNoResultsFor] = useState<string | null>(null);
  const [previousQueries, setPreviousQueries] = useState<Set<string>>(new Set());

  const { data: catalogProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Buscando todos os produtos do catálogo...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }
      
      console.log(`Quantidade de produtos encontrados: ${data?.length || 0}`);
      if (data && data.length > 0) {
        console.log('Exemplo dos primeiros produtos:');
        data.slice(0, 5).forEach(p => {
          console.log(`- ${p.name} (${p.category})`);
        });
        
        // Verificar todos os produtos com "leite", "kiame", "yummi", "ngusso", "alimo" no nome
        const testTerms = ['leite', 'kiame', 'yummi', 'ngusso', 'alimo'];
        testTerms.forEach(term => {
          const matchingProducts = data.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
          );
          console.log(`Produtos com "${term}" no nome ou categoria: ${matchingProducts.length}`);
          matchingProducts.forEach(p => console.log(`  - ${p.name} (${p.category})`));
        });
      }
      return data as Product[];
    }
  });

  const handleListen = (append: boolean = false) => {
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
      setNoResultsFor(null);
      
      // Adiciona a consulta ao histórico para evitar mensagens repetitivas
      setPreviousQueries(prev => new Set([...prev, transcript.toLowerCase()]));
      
      if (catalogProducts && catalogProducts.length > 0) {
        console.log(`Buscando sugestões para: "${transcript}"`);
        console.log(`Total de produtos no catálogo: ${catalogProducts.length}`);
        
        // Usar limiar mais baixo (0.35) para encontrar mais produtos com a nova lógica fonética
        const matchedProducts = findSimilarProducts(transcript, catalogProducts, 0.35);
        console.log(`Produtos encontrados com similaridade: ${matchedProducts.length}`);
        matchedProducts.forEach(p => {
          console.log(`- ${p.name} (similaridade: ${p.similarity.toFixed(2)})`);
        });
        
        if (matchedProducts.length === 0) {
          setNoResultsFor(transcript);
          
          // Mensagem mais específica para termos conhecidos
          const knownTerms = {
            'kiame': 'Kiame',
            'que ame': 'Kiame',
            'quiame': 'Kiame',
            'yummi': 'Yummi',
            'filme': 'Yummi',
            'ngusso': 'Ngusso',
            'moço': 'Ngusso',
            'alimo': 'Alimo',
            'aline': 'Alimo',
            'alemão': 'Alimo',
            'alemao': 'Alimo'
          };
          
          // Verifica se o texto reconhecido pode ser uma marca específica
          const normalizedText = transcript.toLowerCase();
          const potentialBrand = Object.entries(knownTerms).find(([variant]) => 
            normalizedText.includes(variant)
          );
          
          if (potentialBrand) {
            const [variant, actual] = potentialBrand;
            toast({
              title: "Dica de busca",
              description: `Você disse "${variant}", mas talvez esteja procurando por produtos "${actual}"?`,
              variant: "default"
            });
          }
        }
        
        setSuggestions(matchedProducts);
      } else {
        console.warn('Catálogo de produtos vazio ou não carregado!');
        toast({
          title: "Aviso",
          description: "Catálogo de produtos não está disponível.",
          variant: "default"
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

  const handleProductSelection = (product: Product) => {
    const productJson = JSON.stringify({
      name: product.name,
      price: product.price
    });
    
    if (!products.includes(productJson)) {
      setProducts(prev => [...prev, productJson]);
      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado à lista.`
      });
    }
    
    setSuggestions([]);
    setRecognizedText("");
    setNoResultsFor(null);
  };

  const handleAdd = () => {
    if (products.length > 0) {
      onListCreated(products);
      setProducts([]);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 sm:p-4 border border-muted rounded-lg shadow bg-background">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          onClick={() => handleListen(false)}
          variant={isListening ? "secondary" : "outline"}
          size="icon"
          disabled={isListening}
        >
          {isListening ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
        </Button>
        <span className="text-sm sm:text-base flex-1">
          Pressione <b>microfone</b> e fale a lista de produtos.
        </span>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Se o produto não for reconhecido corretamente, você poderá
                selecionar a opção correta nas sugestões apresentadas.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isLoadingProducts && (
        <div className="p-2 text-sm text-muted-foreground text-center">
          Carregando produtos do catálogo...
        </div>
      )}

      {recognizedText && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">
            Texto reconhecido: "{recognizedText}"
          </p>
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Sugestões de produtos:</p>
              {suggestions.map((product) => (
                <ProductSuggestionItem
                  key={product.id}
                  product={product}
                  similarity={product.similarity}
                  onSelect={handleProductSelection}
                  isSelected={products.some(p => 
                    JSON.parse(p).name === product.name
                  )}
                />
              ))}
            </div>
          ) : noResultsFor ? (
            <div className="p-3 border border-amber-200 bg-amber-50 rounded-md">
              <p className="text-sm text-amber-800">
                Nenhuma sugestão encontrada para "{noResultsFor}". 
                <br />
                Tente usar palavras diferentes ou verifique se o produto está cadastrado.
                <br />
                <span className="text-xs italic mt-1 block">
                  Dica: Para marcas específicas como Kiame, Yummi, Ngusso ou Alimo, 
                  tente pronunciar claramente ou verificar a ortografia.
                </span>
              </p>
            </div>
          ) : recognizedText && !isLoadingProducts ? (
            <p className="text-sm text-muted-foreground">
              Processando texto reconhecido...
            </p>
          ) : null}
        </div>
      )}

      {products.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-1">
            <List className="h-4 w-4" />
            <b>Itens a adicionar:</b>
          </div>
          <ul className="list-disc pl-8 text-primary">
            {products.map((p, i) => {
              const parsed = JSON.parse(p);
              return (
                <li key={i} className="break-words">
                  {parsed.name}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              onClick={() => onListCreated(products)} 
              size="sm"
              className={isMobile ? "w-full" : ""}
            >
              Salvar lista
            </Button>
            <Button
              onClick={() => handleListen(true)}
              size="sm"
              variant="ghost"
              type="button"
              disabled={isListening}
              className={isMobile ? "w-full" : ""}
            >
              <Mic className="h-4 w-4 mr-1" />
              Adicionar item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

