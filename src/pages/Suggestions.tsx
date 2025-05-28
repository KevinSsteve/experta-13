
import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/products/types";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/products/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Suggestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Buscar todos os produtos disponíveis (de ambas as tabelas)
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['suggestions-products'],
    queryFn: async () => {
      console.log('Fetching products for suggestions page...');
      
      // Buscar produtos da tabela "products"
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
      }
      
      // Buscar produtos da tabela "New"
      const { data: newProductsData, error: newProductsError } = await supabase
        .from('New')
        .select('*')
        .order('name');
      
      if (newProductsError) {
        console.error('Error fetching New products:', newProductsError);
      }
      
      // Combinar produtos das duas tabelas
      const combinedProducts = [
        ...(productsData || []),
        ...(newProductsData || [])
      ];
      
      // Garantir que todos os produtos tenham purchase_price obrigatório
      const productsWithPurchasePrice = combinedProducts.map(product => ({
        ...product,
        purchase_price: product.purchase_price || product.price * 0.7,
      })) as Product[];
      
      console.log(`Found ${productsWithPurchasePrice.length} total products for suggestions (${productsData?.length || 0} from products + ${newProductsData?.length || 0} from New)`);
      return productsWithPurchasePrice;
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Extrair categorias únicas dos produtos
  const categories = useMemo(() => {
    const uniqueCategories = new Set(allProducts.map(product => product.category));
    return ["all", ...Array.from(uniqueCategories)];
  }, [allProducts]);

  // Filtrar produtos com base na busca e categoria selecionada
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Filtro de pesquisa
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.code && product.code.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtro de categoria
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, activeCategory]);

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
        purchase_price: product.purchase_price,
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
            <p className="text-sm mt-2">Total de produtos encontrados: {allProducts.length}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Se não há produtos, mostrar mensagem informativa
  if (allProducts.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Sugestões de Produtos</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Nenhum produto encontrado no catálogo.
            </p>
            <p className="text-sm text-muted-foreground">
              Os produtos podem estar sendo carregados ou não há produtos disponíveis no momento.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-6 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Descubra Novos Produtos
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore nossa seleção de {allProducts.length} produtos populares para seu estoque
            </p>
          </div>

          {/* Search Section */}
          <Card className="p-4 backdrop-blur-sm bg-background/80 max-w-md mx-auto">
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

          {/* Categories Section */}
          <div className="space-y-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <div className="flex justify-center">
                <TabsList className="flex-wrap gap-2 h-auto p-2">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="text-sm px-3 py-2"
                    >
                      {category === "all" ? "Todas Categorias" : category}
                      {category !== "all" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {allProducts.filter(p => p.category === category).length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Products Content */}
              <div className="mt-8">
                {categories.map(category => (
                  <TabsContent key={category} value={category} className="mt-0">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">Nenhum produto encontrado nesta categoria.</p>
                      </div>
                    ) : (
                      <div className="relative px-12">
                        <Carousel
                          opts={{
                            align: "start",
                            slidesToScroll: 2,
                          }}
                          className="w-full"
                        >
                          <CarouselContent className="-ml-2 md:-ml-4">
                            {(category === "all" ? filteredProducts : 
                              filteredProducts.filter(p => p.category === category))
                              .map((product) => (
                              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <div className="h-full">
                                  <ProductCard
                                    product={product}
                                    onAddToCart={addToStock}
                                    priority={true}
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-0" />
                          <CarouselNext className="right-0" />
                        </Carousel>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>

          {/* Results Counter */}
          <div className="text-center text-muted-foreground">
            <p>{filteredProducts.length} produtos encontrados</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Suggestions;
