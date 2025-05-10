
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/products/ProductCard";
import { getBackupProducts } from "@/lib/products-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Suggestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Usar a nova função getBackupProducts para buscar produtos de backup
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['backupProducts'],
    queryFn: async () => {
      const products = await getBackupProducts(100);
      return products;
    }
  });

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToStock = async (product: Product) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos ao estoque");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar se o produto já existe no estoque do usuário
      const { data: existingProducts, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', product.name)
        .eq('category', product.category);

      if (checkError) throw checkError;

      if (existingProducts && existingProducts.length > 0) {
        toast.error("Este produto já existe no seu estoque");
        setIsSubmitting(false);
        return;
      }

      const newProduct = {
        name: product.name,
        price: product.price,
        category: product.category || 'Geral',
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
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Descubra Novos Produtos
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Explore nossa seleção de produtos populares para seu estoque
              </p>
            </div>

            <Card className="p-4 backdrop-blur-sm bg-background/80">
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

            <div className="space-y-4">
              <Carousel
                opts={{
                  align: "start",
                  slidesToScroll: 3,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {filteredProducts.map((product) => (
                    <CarouselItem key={product.id} className="basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <div className="h-full p-0.5">
                        <ProductCard
                          product={product}
                          onAddToCart={addToStock}
                          priority={true}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            <div className="text-center text-muted-foreground mt-8">
              <p>{filteredProducts.length} produtos encontrados</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Suggestions;
