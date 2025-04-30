
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, X, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { normalizeSearch } from "@/utils/searchUtils";
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
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Função para buscar produtos com debounce
  const fetchProducts = debounce(async (query: string) => {
    if (!userId) return;
    setLoading(true);
    setNoResults(false);

    try {
      let supabaseQuery = supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);

      // Se houver busca, aplica os filtros
      if (query) {
        const normalizedQuery = normalizeSearch(query);
        const terms = normalizedQuery.split(' ');
        
        // Cria uma condição OR para cada termo da busca
        const searchConditions = terms.map(term => {
          const likeQuery = `%${term}%`;
          return `or(name.ilike.${likeQuery},category.ilike.${likeQuery},code.ilike.${likeQuery})`;
        }).join(',');

        supabaseQuery = supabaseQuery.or(searchConditions);
      }

      // Ordena por nome e limita a 15 resultados
      const { data, error } = await supabaseQuery
        .order('name')
        .limit(15);

      if (error) throw error;

      if (data) {
        setSuggestions(data as Product[]);
        setNoResults(data.length === 0);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro ao buscar produtos",
        description: "Não foi possível carregar as sugestões.",
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
  }, [searchQuery, userId]);

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

  // Limitar o número de sugestões mostradas inicialmente (apenas a primeira sugestão)
  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, 1);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        <span>Sugestões para "{productName}"</span>
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
          {visibleSuggestions.map((product) => (
            <div 
              key={product.id} 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 border rounded-md hover:bg-accent/20 transition-colors"
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  <Badge variant="secondary" className="text-xs font-medium">{formatPrice(product.price)}</Badge>
                  {product.code && (
                    <span className="text-xs">Código: {product.code}</span>
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

          {/* Botão "Ver mais" quando há mais sugestões disponíveis */}
          {suggestions.length > 1 && (
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-2"
            >
              {showAll ? (
                "Mostrar menos"
              ) : (
                <>
                  Ver mais sugestões ({suggestions.length - 1})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
