
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
import { Input } from "@/components/ui/input";
import { normalizeSearch } from "@/utils/searchUtils";
import debounce from "lodash/debounce";

interface SimpleProductSuggestionsProps {
  productName: string;
  userId: string | undefined;
}

export function SimpleProductSuggestions({ productName, userId }: SimpleProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Número máximo de sugestões a mostrar (limitado a 3)
  const maxSuggestions = 3;

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

      // Ordena por nome e limita a resultados
      const { data, error } = await supabaseQuery
        .order('name')
        .limit(maxSuggestions);

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
    if (productName) {
      // Inicializa a busca com o nome do produto
      setSearchQuery(productName);
    }
    
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
    <div className="space-y-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Search className="h-3 w-3" />
        <span>Sugestões para "{productName}"</span>
      </div>
      
      {/* Search Input with improved UX */}
      <div className="relative">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-7 pr-7 h-8 text-sm"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : noResults ? (
        <div className="text-center p-2 border rounded-md bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Nenhum produto encontrado
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {suggestions.map((product) => (
            <div 
              key={product.id} 
              className="flex justify-between items-center p-2 border rounded-md hover:bg-accent/20 transition-colors"
            >
              <div className="overflow-hidden">
                <div className="font-medium text-sm truncate">{product.name}</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                  <Badge variant="secondary" className="text-[10px] font-medium">{formatPrice(product.price)}</Badge>
                  {product.stock <= 0 && (
                    <span className="text-[10px] text-destructive">Fora de estoque</span>
                  )}
                </div>
              </div>
              <Button 
                size="sm"
                variant="default"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className="h-7 px-2"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> 
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
