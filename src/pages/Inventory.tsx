
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
  CheckCircle 
} from 'lucide-react';
import { 
  Product, 
  getProducts, 
  getCategories,
  getLowStockProducts,
  getOutOfStockProducts 
} from '@/lib/products-data';
import { formatCurrency, debounce } from '@/lib/utils';
import { toast } from "sonner";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    loadInventoryData();
    setCategories(getCategories());
  }, []);

  // Load inventory data
  const loadInventoryData = () => {
    // Convert 'all' category to empty string for the getProducts function
    const categoryFilter = category === 'all' ? '' : category;
    
    setAllProducts(getProducts(searchQuery, categoryFilter));
    setLowStockProducts(getLowStockProducts());
    setOutOfStockProducts(getOutOfStockProducts());
  };

  // Debounced search function
  const debouncedSearch = debounce(() => {
    loadInventoryData();
  }, 300);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch();
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    loadInventoryData();
  };

  // Edit product
  const editProduct = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
  };

  // Save product changes
  const saveProductChanges = () => {
    if (!currentProduct) return;
    
    // In a real app, we would update the product in the database
    // For now, we'll just show a success message
    toast.success(`Produto ${currentProduct.name} atualizado com sucesso!`);
    setIsEditing(false);
    setCurrentProduct(null);
    loadInventoryData();
  };

  // Delete product
  const deleteProduct = (product: Product) => {
    // In a real app, we would delete the product from the database
    // For now, we'll just show a success message
    toast.success(`Produto ${product.name} removido com sucesso!`);
    loadInventoryData();
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
        return allProducts;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Estoque</h1>
              <p className="text-muted-foreground">Controle e atualize o estoque de produtos.</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
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
                <p className="text-3xl font-bold">{allProducts.length}</p>
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
                          <TableCell>{product.code}</TableCell>
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => editProduct(product)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Produto</DialogTitle>
                                    <DialogDescription>
                                      Atualize as informações do produto aqui.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {currentProduct && (
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                          Nome
                                        </Label>
                                        <Input
                                          id="name"
                                          value={currentProduct.name}
                                          onChange={(e) => 
                                            setCurrentProduct({
                                              ...currentProduct,
                                              name: e.target.value
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="price" className="text-right">
                                          Preço
                                        </Label>
                                        <Input
                                          id="price"
                                          type="number"
                                          step="0.01"
                                          value={currentProduct.price}
                                          onChange={(e) => 
                                            setCurrentProduct({
                                              ...currentProduct,
                                              price: parseFloat(e.target.value) || 0
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="stock" className="text-right">
                                          Estoque
                                        </Label>
                                        <Input
                                          id="stock"
                                          type="number"
                                          value={currentProduct.stock}
                                          onChange={(e) => 
                                            setCurrentProduct({
                                              ...currentProduct,
                                              stock: parseInt(e.target.value) || 0
                                            })
                                          }
                                          className="col-span-3"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <DialogFooter>
                                    <Button type="submit" onClick={saveProductChanges}>
                                      Salvar alterações
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Excluir Produto</DialogTitle>
                                    <DialogDescription>
                                      Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="pt-4">
                                    <p className="mb-2">
                                      <span className="font-medium">{product.name}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Código: {product.code} • {product.category}
                                    </p>
                                  </div>
                                  
                                  <DialogFooter>
                                    <Button 
                                      variant="outline"
                                      onClick={() => {}}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => deleteProduct(product)}
                                    >
                                      Excluir
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Inventory;
