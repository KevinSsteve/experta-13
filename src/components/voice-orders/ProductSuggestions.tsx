
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ParsedVoiceItem } from "@/utils/voiceUtils";
import { Input } from "@/components/ui/input";
import { normalizeSearch } from "@/utils/searchUtils";
import { findSimilarProducts } from "@/utils/productMatchUtils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import debounce from "lodash/debounce";

interface ProductSuggestionsProps {
  productName: string;
  userId: string | undefined;
}

export function ProductSuggestions({ productName, userId }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<(Product & { similarity?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Função para extrair nome do produto se for um objeto JSON
  const extractProductName = (text: string): string => {
    try {
      if (typeof text === 'string' && (text.startsWith('{') || text.startsWith('['))) {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return parsed.name;
        }
      }
      return text;
    } catch (e) {
      return text;
    }
  };

  // Função para buscar produtos com debounce
  const fetchProducts = debounce(async (query: string) => {
    if (!userId) return;
    setLoading(true);
    setNoResults(false);

    try {
      // Se não houver query explícita, usa o nome do produto como query
      const searchTerm = query || extractProductName(productName);
      console.log(`Buscando sugestões para: "${searchTerm}"`);

      // Busca todos os produtos do usuário
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      if (!products || products.length === 0) {
        setNoResults(true);
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Usa o algoritmo avançado de correspondência fonética
      const similarProducts = findSimilarProducts(
        searchTerm, 
        products as Product[],
        0.25 // Reduz o threshold para encontrar mais correspondências
      );

      console.log(`Encontradas ${similarProducts.length} sugestões relevantes para "${searchTerm}"`);
      
      // Ordena por similaridade
      const sortedProducts = similarProducts.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      
      setSuggestions(sortedProducts);
      setNoResults(sortedProducts.length === 0);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro ao buscar sugestões",
        description: "Não foi possível carregar as sugestões para este item.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, 300);

  // Efeito para buscar produtos quando o componente monta ou quando o termo de busca muda
  useEffect(() => {
    fetchProducts(searchQuery);
    return () => {
      fetchProducts.cancel();
    };
  }, [searchQuery, userId, productName]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (!productName) return null;

  // Format price function
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        <span>Sugestões para "{extractProductName(productName)}"</span>
      </div>
      
      {/* Search Input with improved UX */}
      <div className="relative mb-3">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar por nome, código ou categoria..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8 pr-8"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpar busca</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : noResults ? (
        <div className="text-center p-2 border rounded-md bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {searchQuery 
              ? `Nenhum produto encontrado para "${searchQuery}"`
              : "Nenhum produto correspondente encontrado"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {suggestions.map((product) => (
            <div 
              key={product.id} 
              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 border rounded-md hover:bg-accent/20 transition-colors ${
                (product.similarity || 0) > 0.7 ? 'bg-green-100/30 dark:bg-green-900/20' : 
                (product.similarity || 0) > 0.4 ? 'bg-yellow-100/30 dark:bg-yellow-900/20' : ''
              }`}
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  <Badge variant="secondary" className="text-xs font-medium">{formatPrice(product.price)}</Badge>
                  {product.code && (
                    <span className="text-xs">Código: {product.code}</span>
                  )}
                  {product.similarity && (
                    <Badge variant={product.similarity > 0.7 ? "success" : product.similarity > 0.4 ? "warning" : "outline"} className="text-xs">
                      {Math.round(product.similarity * 100)}% correspondência
                    </Badge>
                  )}
                  {product.stock > 0 ? (
                    <span className="text-xs">Em estoque: {product.stock}</span>
                  ) : (
                    <span className="text-xs text-destructive">Fora de estoque</span>
                  )}
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size={isMobile ? "sm" : "default"}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className="w-full sm:w-auto"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" /> 
                      {isMobile ? "+" : "Adicionar"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adicionar ao carrinho</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
