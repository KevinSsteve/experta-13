
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Package, 
  Search, 
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
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
import { 
  formatCurrency, 
  debounce 
} from '@/lib/utils';
import { ProductForm, ProductFormValues } from '@/components/products/ProductForm';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { Product } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, getCategories } from '@/lib/products/queries';
import { useQuery } from '@tanstack/react-query';

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Use React Query to fetch products data
  const { 
    data: products = [], 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => getProducts(searchQuery, category !== 'all' ? category : '', 0, Infinity, false, user?.id),
    enabled: !!user
  });

  // Use React Query to fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => getCategories(user?.id),
    enabled: !!user
  });

  // Get low stock products (stock < 10)
  const lowStockProducts = products.filter(product => product.stock > 0 && product.stock < 10);
  
  // Get out of stock products
  const outOfStockProducts = products.filter(product => product.stock === 0);

  // Debounced search function
  const debouncedSearch = debounce(() => {
    refetchProducts();
  }, 300);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch();
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    refetchProducts();
  };

  // Add product
  const handleAddProduct = async (data: ProductFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar produtos");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProduct = {
        name: data.name,
        price: data.price,
        category: data.category,
        stock: data.stock,
        description: data.description || null,
        code: data.code || null,
        image: data.image || "/placeholder.svg",
        user_id: user.id
      };
      
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();
      
      if (error) throw error;
      
      setIsAddDialogOpen(false);
      toast.success("Produto adicionado com sucesso!");
      refetchProducts();
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      toast.error(`Erro ao adicionar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit product
  const handleEditProduct = async (data: ProductFormValues) => {
    if (!currentProduct || !user) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          price: data.price,
          category: data.category,
          stock: data.stock,
          description: data.description || null,
          code: data.code || null,
          image: data.image || "/placeholder.svg",
        })
        .eq('id', currentProduct.id);
      
      if (error) throw error;
      
      setIsEditDialogOpen(false);
      setCurrentProduct(null);
      toast.success("Produto atualizado com sucesso!");
      refetchProducts();
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Produto excluído com sucesso!");
      refetchProducts();
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast.error(`Erro ao excluir produto: ${error.message}`);
    }
  };

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  // Get current products based on active tab
  const getCurrentProducts = () => {
    switch (activeTab) {
      case 'low':
        return lowStockProducts;
      case 'out':
        return outOfStockProducts;
      case 'all':
      default:
        return products;
    }
  };

  // Renderiza um card de produto para visualização em dispositivos móveis
  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-muted rounded overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-xs text-muted-foreground">
                {product.code || "Sem código"} • {product.category}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium">{formatCurrency(product.price)}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="inline-flex items-center gap-1">
            <span 
              className={`h-2 w-2 rounded-full ${
                product.stock === 0
                  ? 'bg-red-500'
                  : product.stock < 10
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              }`}
            />
            <span className="text-sm">
              {product.stock} unidades
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openEditDialog(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="pt-4">
                  <p className="mb-2">
                    <span className="font-medium">{product.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Código: {product.code || "Sem código"} • {product.category}
                  </p>
                </div>
                
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
  );

  if (isLoadingProducts) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Estoque</h1>
            </div>
            <div className="h-40 flex items-center justify-center">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (productsError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Estoque</h1>
            </div>
            <Card className="bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 mb-4">Erro ao carregar produtos:</p>
                <p className="text-sm text-red-600">{(productsError as Error).message}</p>
                <Button 
                  onClick={() => refetchProducts()} 
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Estoque</h1>
              <p className="text-muted-foreground">Controle e atualize o estoque de produtos.</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
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
                <ProductForm onSubmit={handleAddProduct} isSubmitting={isSubmitting} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Inventory stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Total de Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{products.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Baixo Estoque</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{lowStockProducts.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Sem Estoque</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{outOfStockProducts.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar por nome ou código..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory tabs and table */}
          <Card>
            <CardHeader className="pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">
                    Todos os Produtos
                  </TabsTrigger>
                  <TabsTrigger value="low">
                    Baixo Estoque
                  </TabsTrigger>
                  <TabsTrigger value="out">
                    Sem Estoque
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                // Mobile view - using cards
                <div className="space-y-4">
                  {getCurrentProducts().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado nesta categoria
                    </div>
                  ) : (
                    getCurrentProducts().map((product) => renderProductCard(product))
                  )}
                </div>
              ) : (
                // Desktop view - using table
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Código</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Estoque</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                      {getCurrentProducts().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum produto encontrado nesta categoria
                          </TableCell>
                        </TableRow>
                      ) : (
                        getCurrentProducts().map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.code || "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-muted rounded overflow-hidden">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(product.price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <div className="inline-flex items-center gap-1">
                                  <span 
                                    className={`h-2 w-2 rounded-full ${
                                      product.stock === 0
                                        ? 'bg-red-500'
                                        : product.stock < 10
                                          ? 'bg-amber-500'
                                          : 'bg-green-500'
                                    }`}
                                  />
                                  <span className="text-sm">
                                    {product.stock} unidades
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openEditDialog(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    
                                    <div className="pt-4">
                                      <p className="mb-2">
                                        <span className="font-medium">{product.name}</span>
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Código: {product.code || "Sem código"} • {product.category}
                                      </p>
                                    </div>
                                    
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
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
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
          {currentProduct && (
            <ProductForm
              onSubmit={handleEditProduct}
              defaultValues={currentProduct}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Inventory;
