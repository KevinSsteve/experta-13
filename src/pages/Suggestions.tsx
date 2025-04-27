
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/ProductGrid";

const Suggestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { data: publicProducts = [], isLoading, error } = useQuery({
    queryKey: ['publicProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_public', true)
        .order('name');
      
      if (error) {
        console.error("Error fetching public products:", error);
        throw error;
      }
      
      return data as Product[];
    }
  });

  const filteredProducts = publicProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToStock = async (product: Product) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos ao estoque");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: existingProducts, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', product.name)
        .eq('category', product.category);

      if (checkError) throw checkError;

      if (existingProducts && existingProducts.length > 0) {
        toast.error("Este produto já existe no seu estoque");
        return;
      }

      const newProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        stock: 10,
        description: product.description || '',
        code: product.code || '',
        image: product.image || "/placeholder.svg",
        user_id: user.id,
        is_public: false
      };

      const { error: insertError } = await supabase
        .from('products')
        .insert([newProduct]);

      if (insertError) throw insertError;

      toast.success("Produto adicionado ao seu estoque com sucesso!");
    } catch (error: any) {
      console.error("Error adding product to stock:", error);
      toast.error(`Erro ao adicionar produto ao estoque: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
          <p className="text-lg">Carregando sugestões de produtos...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Erro ao carregar sugestões de produtos: {(error as Error).message}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Sugestões de Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Descubra produtos populares para adicionar ao seu estoque
            </p>
          </div>

          {/* Search bar */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos por nome ou categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Products grid */}
          <ScrollArea className="h-[calc(100vh-240px)]">
            <ProductGrid
              products={publicProducts}
              visibleProducts={filteredProducts}
              isLoading={isLoading}
              error={error as Error}
              onAddToCart={addToStock}
            />
          </ScrollArea>
        </div>
      </div>
    </MainLayout>
  );
};

export default Suggestions;
