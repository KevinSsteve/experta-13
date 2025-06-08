
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Search, Edit3, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  current_stock: number;
  total_sold: number;
  last_unit_price: number;
  is_generic: boolean;
  original_voice_inputs: string[];
  created_at: string;
}

export default function ExpertaGoInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('experta_go_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product.id);
    setEditName(product.name);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditName("");
  };

  const saveProductName = async (productId: string) => {
    if (!editName.trim()) return;

    try {
      const { error } = await supabase
        .from('experta_go_products')
        .update({
          name: editName.trim(),
          is_generic: false
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Produto atualizado!",
        description: "O nome do produto foi alterado com sucesso.",
      });

      loadProducts();
      cancelEditing();

    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const genericProducts = filteredProducts.filter(p => p.is_generic);
  const namedProducts = filteredProducts.filter(p => !p.is_generic);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/experta-go" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Estoque Experta Go</h1>
            <p className="text-muted-foreground">
              Produtos criados automaticamente pelo reconhecimento de voz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              {products.length} produtos total
            </Badge>
            <Badge variant="secondary">
              {genericProducts.length} precisam de nome
            </Badge>
          </div>
        </div>

        {genericProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Produtos que precisam de nome ({genericProducts.length})</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {genericProducts.map((product) => (
                <Card key={product.id} className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      {editingProduct === product.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome do produto"
                            className="bg-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveProductName(product.id)}
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Salvar
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              variant="outline"
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-orange-800">{product.name}</CardTitle>
                          <Button
                            onClick={() => startEditing(product)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            Editar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estoque atual:</span>
                        <span className="font-medium">{product.current_stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total vendido:</span>
                        <span className="font-medium">{product.total_sold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Último preço:</span>
                        <span className="font-medium">{product.last_unit_price} kz</span>
                      </div>
                      {product.original_voice_inputs.length > 0 && (
                        <div className="mt-3 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Como foi falado: "{product.original_voice_inputs[product.original_voice_inputs.length - 1]}"
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {namedProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Produtos com nome definido ({namedProducts.length})</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {namedProducts.map((product) => (
                <Card key={product.id} className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-800">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estoque atual:</span>
                        <span className="font-medium">{product.current_stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total vendido:</span>
                        <span className="font-medium">{product.total_sold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Último preço:</span>
                        <span className="font-medium">{product.last_unit_price} kz</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Tente ajustar sua busca ou registre vendas para criar produtos automaticamente."
                  : "Comece registrando vendas por voz para criar produtos automaticamente."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
