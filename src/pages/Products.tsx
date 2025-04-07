
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/contexts/CartContext";
import { generateId, formatCurrency } from "@/lib/utils";
import { ProductForm, ProductFormValues } from "@/components/products/ProductForm";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Products = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    // Carregar produtos do localStorage se existirem
    const savedProducts = localStorage.getItem("products");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Filtrar produtos baseado na busca
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (data: ProductFormValues) => {
    // Ensure all required fields have values to satisfy the Product type
    const newProduct: Product = {
      id: generateId(),
      name: data.name, // Required field
      price: data.price, // Required field
      category: data.category, // Required field
      stock: data.stock, // Required field
      image: data.image || "/placeholder.svg", // Required field with default
      code: data.code,
      description: data.description,
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    
    setIsAddDialogOpen(false);
    toast.success("Produto adicionado com sucesso!");
  };

  const handleEditProduct = (data: ProductFormValues) => {
    if (!editingProduct) return;
    
    const updatedProducts = products.map((product) =>
      product.id === editingProduct.id
        ? { ...product, ...data }
        : product
    );
    
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast.success("Produto atualizado com sucesso!");
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    
    toast.success("Produto excluído com sucesso!");
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {!isMobile && "Adicionar Produto"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Produto</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do produto e clique em salvar.
                  </DialogDescription>
                </DialogHeader>
                <ProductForm onSubmit={handleAddProduct} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                Gerencie os produtos disponíveis no sistema.
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, código ou categoria..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full">
                <div className="overflow-auto">
                  <div className="min-w-full inline-block align-middle">
                    {isMobile ? (
                      // Versão mobile: Cards em vez de tabela
                      <div className="grid gap-4">
                        {filteredProducts.length === 0 ? (
                          <div className="px-4 py-8 text-center text-muted-foreground">
                            {products.length === 0
                              ? "Nenhum produto cadastrado. Clique em 'Adicionar Produto' para começar."
                              : "Nenhum produto encontrado com os critérios de busca."}
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <Card key={product.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{product.name}</h3>
                                    <div className="text-sm text-muted-foreground mb-2">
                                      {product.code || "Sem código"} • {product.category}
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                      <div className="font-medium">{formatCurrency(product.price)}</div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                          product.stock === 0
                                            ? "bg-red-100 text-red-700"
                                            : product.stock < 10
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                      >
                                        {product.stock} un
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(product)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Confirmar exclusão
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o produto "{product.name}"?
                                            Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteProduct(product.id)}
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    ) : (
                      // Versão desktop: Tabela
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Nome</th>
                            <th className="px-4 py-2 text-left">Código</th>
                            <th className="px-4 py-2 text-left">Categoria</th>
                            <th className="px-4 py-2 text-left">Preço</th>
                            <th className="px-4 py-2 text-left">Estoque</th>
                            <th className="px-4 py-2 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                {products.length === 0
                                  ? "Nenhum produto cadastrado. Clique em 'Adicionar Produto' para começar."
                                  : "Nenhum produto encontrado com os critérios de busca."}
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <tr key={product.id} className="border-b hover:bg-muted/50">
                                <td className="px-4 py-2">{product.name}</td>
                                <td className="px-4 py-2">{product.code || "-"}</td>
                                <td className="px-4 py-2">{product.category}</td>
                                <td className="px-4 py-2">{formatCurrency(product.price)}</td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      product.stock === 0
                                        ? "bg-red-100 text-red-700"
                                        : product.stock < 10
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {product.stock} un
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(product)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Confirmar exclusão
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o produto "{product.name}"?
                                            Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteProduct(product.id)}
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para edição de produtos */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              onSubmit={handleEditProduct}
              defaultValues={editingProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Products;
