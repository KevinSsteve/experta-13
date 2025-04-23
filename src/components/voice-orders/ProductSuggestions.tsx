
import { useEffect, useState } from "react";
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
import { normalizeSearch } from "@/utils/searchUtils";
import { Input } from "@/components/ui/input";

interface ProductSuggestionsProps {
  productName: string;
  userId: string | undefined;
}

export function ProductSuggestions({ productName, userId }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [allSuggestions, setAllSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!productName || !userId) return;
      setLoading(true);
      setNoResults(false);
      setSearchQuery(""); // Reset search query when fetching new suggestions

      try {
        let parsed: ParsedVoiceItem;
        try {
          parsed = JSON.parse(productName);
        } catch {
          parsed = { name: productName };
        }

        // Dividir o nome em palavras para busca parcial
        const searchTerms = parsed.name.toLowerCase().split(' ');
        
        // Criar query inicial
        let query = supabase
          .from('products')
          .select('*')
          .eq('user_id', userId);

        // Se tiver preço, primeiro tenta encontrar produtos com palavras do nome E preço
        if (parsed.price) {
          const minPrice = parsed.price * 0.8;
          const maxPrice = parsed.price * 1.2;
          
          // Primeiro, tenta encontrar produtos que contenham qualquer palavra do nome E estejam na faixa de preço
          let matchQuery = searchTerms.map(term => 
            `name.ilike.%${term}%`
          );
          
          const { data: nameAndPriceMatches } = await query
            .or(matchQuery.join(','))
            .gte('price', minPrice)
            .lte('price', maxPrice)
            .limit(15);

          if (nameAndPriceMatches && nameAndPriceMatches.length > 0) {
            setSuggestions(nameAndPriceMatches as Product[]);
            setAllSuggestions(nameAndPriceMatches as Product[]);
            return;
          }

          // Se não encontrar, tenta apenas pelo preço
          const { data: priceMatches } = await query
            .gte('price', minPrice)
            .lte('price', maxPrice)
            .limit(15);

          if (priceMatches && priceMatches.length > 0) {
            setSuggestions(priceMatches as Product[]);
            setAllSuggestions(priceMatches as Product[]);
            return;
          }
        }

        // Se não tiver preço ou não encontrou nada pelo preço, busca por palavras do nome
        let matchQuery = searchTerms.map(term => 
          `name.ilike.%${term}%`
        );
        
        const { data: nameMatches } = await query
          .or(matchQuery.join(','))
          .limit(15);

        if (nameMatches && nameMatches.length > 0) {
          setSuggestions(nameMatches as Product[]);
          setAllSuggestions(nameMatches as Product[]);
        } else {
          setNoResults(true);
        }
      } catch (error) {
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [productName, userId]);

  // Filter suggestions when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions(allSuggestions);
      setNoResults(allSuggestions.length === 0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allSuggestions.filter(product => 
      product.name.toLowerCase().includes(query) || 
      (product.category && product.category.toLowerCase().includes(query))
    );

    setSuggestions(filtered);
    setNoResults(filtered.length === 0);
  }, [searchQuery, allSuggestions]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  if (!productName) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        <span>Sugestões para "{productName}"</span>
      </div>
      
      {/* Search Input */}
      <div className="relative mb-3">
        <Input
          type="text"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8"
        />
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-3 w-3" />
          </Button>
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
        <div className="space-y-2">
          {suggestions.map((product) => (
            <div 
              key={product.id} 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 border rounded-md hover:bg-accent/20"
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  {product.stock > 0 ? (
                    <span className="text-xs">Em estoque: {product.stock}</span>
                  ) : (
                    <span className="text-xs text-destructive">Fora de estoque</span>
                  )}
                </div>
              </div>
              <Button 
                size={isMobile ? "sm" : "default"}
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="h-4 w-4 mr-1" /> 
                {isMobile ? "+" : "Adicionar"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
