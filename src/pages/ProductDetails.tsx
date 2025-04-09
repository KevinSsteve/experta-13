
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/products';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id, user?.id],
    queryFn: () => getProduct(id!, user?.id),
    enabled: !!id && !!user?.id
  });
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-md" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <div className="space-x-2">
                <Skeleton className="h-10 w-32 inline-block" />
                <Skeleton className="h-10 w-32 inline-block" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Produto não encontrado</h3>
              <p className="text-muted-foreground mt-2">
                Não foi possível encontrar o produto solicitado.
              </p>
              <Button onClick={() => navigate('/products')} className="mt-6">
                Ver todos os produtos
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-background rounded-lg overflow-hidden border">
            <img 
              src={product.image || '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-auto object-contain aspect-square"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground mt-1">Código: {product.code || 'N/A'}</p>
            </div>
            
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h2 className="text-2xl font-bold text-primary">
                {formatCurrency(product.price)}
              </h2>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-muted-foreground">
                {product.description || 'Sem descrição disponível.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span>
                Estoque: <span className="font-medium">{product.stock} unidades</span>
              </span>
            </div>
            
            <div className="flex gap-4 mt-8">
              <Button 
                onClick={handleAddToCart} 
                disabled={product.stock <= 0}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao carrinho
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(`/products/edit/${product.id}`)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar produto
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetails;
