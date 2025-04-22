
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

interface ProductSuggestionsProps {
  productName: string;
  userId: string | undefined;
}

export function ProductSuggestions({ productName, userId }: ProductSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!productName || !userId) return;
      
      setLoading(true);
      setNoResults(false);
      
      try {
        // Normalizamos o nome do produto para melhorar a correspondência
        const normalizedQuery = normalizeProductName(productName);
        
        // Buscamos produtos que correspondem ao nome ou categoria
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .or(`name.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%,code.ilike.%${normalizedQuery}%`)
          .order('name')
          .limit(5);
          
        if (error) throw error;

        if (data && data.length > 0) {
          // Ordena resultados por relevância
          const sortedSuggestions = sortByRelevance(data, normalizedQuery);
          setSuggestions(sortedSuggestions);
        } else {
          setNoResults(true);
          
          // Se não encontrou resultados exatos, tenta buscar por termos parciais
          const { data: fuzzyData, error: fuzzyError } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', userId)
            .or(
              `name.ilike.%${normalizedQuery.slice(0, 4)}%,` +
              `category.ilike.%${normalizedQuery.slice(0, 4)}%`
            )
            .order('name')
            .limit(3);
            
          if (!fuzzyError && fuzzyData && fuzzyData.length > 0) {
            setSuggestions(fuzzyData);
            setNoResults(false);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [productName, userId]);
  
  // Função para normalizar nomes de produtos (remover acentos, plurais, etc.)
  const normalizeProductName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/s$/i, "") // Remove plural
      .replace(/(inho|inha|zinho|zinha)$/i, "") // Remove diminutivos
      .replace(/^(o |a |os |as |um |uma |uns |umas )/, ""); // Remove artigos
  };
  
  // Ordena os resultados por relevância em relação à consulta
  const sortByRelevance = (products: Product[], query: string): Product[] => {
    return [...products].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Dá prioridade para correspondências exatas do nome
      if (aName === queryLower && bName !== queryLower) return -1;
      if (bName === queryLower && aName !== queryLower) return 1;
      
      // Depois para nomes que começam com a consulta
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
      
      // Depois por comprimento do nome (nomes mais curtos são geralmente mais relevantes)
      return aName.length - bName.length;
    });
  };
  
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
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : noResults ? (
        <div className="text-center p-2 border rounded-md bg-muted/30">
          <p className="text-sm text-muted-foreground">Nenhum produto correspondente encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((product) => (
            <div 
              key={product.id} 
              className="flex justify-between items-center p-2 border rounded-md hover:bg-accent/20"
            >
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  {product.stock > 0 ? (
                    <span className="text-xs">Em estoque: {product.stock}</span>
                  ) : (
                    <span className="text-xs text-destructive">Fora de estoque</span>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                className="ml-2"
              >
                <ShoppingCart className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
