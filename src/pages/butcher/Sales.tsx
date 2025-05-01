
import React, { useState } from 'react';
import { ButcherLayout } from '@/components/layouts/ButcherLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { WeightInput } from '@/components/butcher/WeightInput';
import { MeatCutSelector } from '@/components/butcher/MeatCutSelector';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, ShoppingCart, Trash2, Beef, Printer, CreditCard } from 'lucide-react';
import { MeatProductCard } from '@/components/butcher/MeatProductCard';
import { MeatCut, MeatProduct } from '@/lib/butcher/types';
import { toast } from 'sonner';

// Mock data for testing
const mockProducts: MeatProduct[] = [
  {
    id: '1',
    name: 'Picanha Premium',
    code: '7891234567890',
    animalType: 'beef',
    cutType: 'rump',
    pricePerKg: 89.90,
    stock: 15.5,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description: 'Picanha premium de alta qualidade, macia e suculenta.'
  },
  {
    id: '2',
    name: 'Filé Mignon',
    code: '7891234567891',
    animalType: 'beef',
    cutType: 'filet',
    pricePerKg: 99.90,
    stock: 8.2,
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: 'Filé mignon macio e suculento, ideal para ocasiões especiais.'
  }
];

// Convert products to cuts format for the selector
const mockCuts: MeatCut[] = mockProducts.map(product => ({
  id: product.id,
  name: product.name,
  animal_type: product.animalType,
  price_per_kg: product.pricePerKg,
  cost_per_kg: product.pricePerKg * 0.7, // Estimated cost as 70% of price
  stock_weight: product.stock,
  user_id: '1' // Placeholder user ID
}));

interface CartItem {
  id: string;
  product: MeatProduct;
  weight: number;
}

export default function ButcherSales() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCutId, setSelectedCutId] = useState("");
  const [weight, setWeight] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  const selectedProduct = mockProducts.find(p => p.id === selectedCutId);
  
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddToCart = () => {
    if (!selectedProduct || weight <= 0) {
      toast.error("Selecione um produto e informe o peso");
      return;
    }
    
    if (weight > selectedProduct.stock) {
      toast.error(`Estoque insuficiente. Disponível: ${selectedProduct.stock.toFixed(2)}kg`);
      return;
    }
    
    const item: CartItem = {
      id: Date.now().toString(),
      product: selectedProduct,
      weight
    };
    
    setCartItems([...cartItems, item]);
    toast.success(`${selectedProduct.name} adicionado ao carrinho`);
    
    // Reset form
    setSelectedCutId("");
    setWeight(0);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleCompleteSale = () => {
    // In a real app, this would process the payment and create the sale
    toast.success("Venda finalizada com sucesso!");
    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.pricePerKg * item.weight), 0);
  };

  return (
    <ButcherLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ponto de Vendas</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Adicionar Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Procurar produtos..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 font-medium">Corte de Carne</p>
                  <MeatCutSelector 
                    cuts={mockCuts} 
                    value={selectedCutId} 
                    onChange={setSelectedCutId}
                  />
                </div>
                <div>
                  <p className="mb-2 font-medium">Peso e Preço</p>
                  <WeightInput 
                    weight={weight} 
                    pricePerKg={selectedProduct?.pricePerKg || 0} 
                    onChange={setWeight}
                    disabled={!selectedProduct}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleAddToCart} disabled={!selectedProduct || weight <= 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ao Carrinho
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Produtos Disponíveis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="p-3 flex justify-between items-start border-b">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Estoque: {product.stock.toFixed(2)}kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(product.pricePerKg)}/kg</p>
                        </div>
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <Badge variant="outline" className="font-normal">
                          {product.animalType}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedCutId(product.id);
                          setWeight(0.5); // Default weight
                        }}>
                          Selecionar
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <Card className="col-span-full p-8 flex flex-col items-center justify-center">
                      <Beef className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-center">
                        Nenhum produto encontrado. Tente outro termo de pesquisa.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Carrinho
              </CardTitle>
              <Badge variant="outline">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Seu carrinho está vazio.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione produtos para iniciar a venda.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <div className="flex text-sm text-muted-foreground gap-2">
                        <span>{item.weight.toFixed(3)}kg</span>
                        <span>×</span>
                        <span>{formatCurrency(item.product.pricePerKg)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">
                        {formatCurrency(item.weight * item.product.pricePerKg)}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {cartItems.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Nome do cliente (opcional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder="Telefone do cliente (opcional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full" 
              onClick={handleCompleteSale} 
              disabled={cartItems.length === 0}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Finalizar Venda
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={cartItems.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Recibo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ButcherLayout>
  );
}
