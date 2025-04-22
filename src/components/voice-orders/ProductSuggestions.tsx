
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

// Função utilitária para dividir a frase em palavras e normalizar
function getSearchTerms(raw: string): string[] {
  // Remove caracteres especiais e plurais/diminutivos, separa por espaço
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[,.;:!?]/g, "")
    .replace(/(inhos?|inhas?|zinhos?|zinhas?|s)\b/gi, "")
    .replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, "")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1);
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

      // Prepara uma lista de termos do item
      const keywords = getSearchTerms(productName);
      let allSuggestions: Product[] = [];

      try {
        // Busca produtos usando cada termo em name, category ou code
        for (const term of keywords) {
          if (!term) continue;
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', userId)
            .or(
              `name.ilike.%${term}%,category.ilike.%${term}%,code.ilike.%${term}%`
            )
            .order('name')
            .limit(6);

          if (error) continue;
          if (data && data.length > 0) {
            allSuggestions = [...allSuggestions, ...data];
          }
        }

        // Garante unicidade (remover duplicados, comparando por id)
        allSuggestions = allSuggestions.filter(
          (prod, idx, arr) =>
            arr.findIndex(p => p.id === prod.id) === idx
        );

        if (allSuggestions.length > 0) {
          // Ordena por relevância: match exato > começa igual > inclusão parcial > menor nome
          allSuggestions.sort((a, b) => {
            const kwSet = new Set(keywords);
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            // Match exato do nome do produto pedido
            if (aName === productName.toLowerCase() && bName !== productName.toLowerCase()) return -1;
            if (bName === productName.toLowerCase() && aName !== productName.toLowerCase()) return 1;
            // Começa igual a qualquer palavra-chave
            const aStarts = Array.from(kwSet).some(kw => aName.startsWith(kw));
            const bStarts = Array.from(kwSet).some(kw => bName.startsWith(kw));
            if (aStarts && !bStarts) return -1;
            if (bStarts && !aStarts) return 1;
            // Menor nome por último
            return aName.length - bName.length;
          });
          setSuggestions(allSuggestions.slice(0, 8));
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
