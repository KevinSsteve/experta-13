
import React, { useState, useEffect } from 'react';
import { ButcherLayout } from '@/components/layouts/ButcherLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductForm } from '@/components/butcher/ProductForm';
import { MeatProductCard } from '@/components/butcher/MeatProductCard';
import { Beef, Search, Plus } from 'lucide-react';
import { getMeatCuts, createMeatCut, updateMeatCut, deleteMeatCut } from '@/lib/butcher/api';
import { MeatCut } from '@/lib/butcher/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ButcherProducts() {
  const [products, setProducts] = useState<MeatCut[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MeatCut | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getMeatCuts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "beef") return matchesSearch && product.animal_type === "beef";
    if (activeTab === "pork") return matchesSearch && product.animal_type === "pork";
    if (activeTab === "poultry") return matchesSearch && (product.animal_type === "chicken");
    if (activeTab === "other") return matchesSearch && !["beef", "pork", "chicken"].includes(product.animal_type);
    
    return matchesSearch;
  });

  const handleAddProduct = async (data: any) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar produtos");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newProduct = await createMeatCut({
        ...data,
        user_id: user.id
      });
      
      if (newProduct) {
        setProducts([...products, newProduct]);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: any) => {
    if (editingProduct) {
      setIsSubmitting(true);
      
      try {
        const updatedProduct = await updateMeatCut(editingProduct.id, data);
        
        if (updatedProduct) {
          const updatedProducts = products.map(product => 
            product.id === editingProduct.id ? updatedProduct : product
          );
          setProducts(updatedProducts);
          setEditingProduct(null);
          setIsDialogOpen(false);
        }
      } catch (error) {
        console.error("Error updating product:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const success = await deleteMeatCut(productId);
      
      if (success) {
        setProducts(products.filter(product => product.id !== productId));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const openEditDialog = (product: MeatCut) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (product: MeatCut) => {
    toast.success(`${product.name} adicionado ao carrinho`);
    // In a real app, this would add the product to the cart
  };

  return (
    <ButcherLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <Button onClick={() => {
          setEditingProduct(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar produtos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="beef">Bovino</TabsTrigger>
          <TabsTrigger value="pork">Suíno</TabsTrigger>
          <TabsTrigger value="poultry">Aves</TabsTrigger>
          <TabsTrigger value="other">Outros</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 rounded-lg bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <MeatProductCard 
                  key={product.id} 
                  product={product} 
                  onEdit={openEditDialog}
                  onAddToCart={handleAddToCart}
                />
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Beef className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar sua pesquisa ou adicione novos produtos.
                  </p>
                  <Button className="mt-4" onClick={() => {
                    setEditingProduct(null);
                    setIsDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Produto
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            initialData={editingProduct || undefined}
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </ButcherLayout>
  );
}
