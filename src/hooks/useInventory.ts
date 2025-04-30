
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/contexts/CartContext';
import { getProducts, getCategories } from '@/lib/products/queries';
import { ProductFormValues } from '@/components/products/ProductForm';
import { debounce } from '@/lib/utils';
import { toast } from 'sonner';

export const useInventory = (userId?: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Use React Query to fetch products data with performance optimization
  const { 
    data: products = [], 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products', userId, searchQuery, category],
    queryFn: async () => {
      // Otimizando a consulta de produtos
      const categoryFilter = category !== 'all' ? category : '';
      return getProducts(searchQuery, categoryFilter, 0, 100, false, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    refetchOnWindowFocus: false
  });

  // Use React Query to fetch categories with performance optimization
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => getCategories(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    refetchOnWindowFocus: false
  });

  // Memoizing filtered products to improve performance
  const lowStockProducts = products.filter(product => product.stock > 0 && product.stock < 10);
  const outOfStockProducts = products.filter(product => product.stock === 0);

  // Debounced search function optimized
  const debouncedSearch = useCallback(
    debounce(() => {
      refetchProducts();
    }, 300),
    [refetchProducts]
  );

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
    if (!userId) {
      toast.error("Você precisa estar logado para adicionar produtos");
      return;
    }

    setIsSubmitting(true);

    try {
      const newProduct = {
        name: data.name,
        price: data.price,
        purchase_price: data.purchase_price || 0,
        category: data.category,
        stock: data.stock,
        description: data.description || null,
        code: data.code || null,
        image: data.image || "/placeholder.svg",
        user_id: userId
      };
      
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();
      
      if (error) throw error;
      
      setIsAddDialogOpen(false);
      toast.success("Produto adicionado com sucesso!");
      // Invalidate and refetch products
      await queryClient.invalidateQueries({queryKey: ['products', userId]});
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      toast.error(`Erro ao adicionar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit product
  const handleEditProduct = async (data: ProductFormValues) => {
    if (!currentProduct || !userId) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          price: data.price,
          purchase_price: data.purchase_price || 0,
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
      // Invalidate and refetch products
      await queryClient.invalidateQueries({queryKey: ['products', userId]});
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Produto excluído com sucesso!");
      // Invalidate and refetch products
      await queryClient.invalidateQueries({queryKey: ['products', userId]});
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

  return {
    products,
    lowStockProducts,
    outOfStockProducts,
    categories,
    searchQuery,
    category,
    activeTab,
    isLoadingProducts,
    productsError,
    isSubmitting,
    isAddDialogOpen,
    isEditDialogOpen,
    currentProduct,
    refetchProducts,
    handleSearch,
    handleCategoryChange,
    setActiveTab,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    openEditDialog,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    updateProductInCache: async (productId: string, newData: Partial<Product>) => {
      await queryClient.invalidateQueries({queryKey: ['products', userId]});
    }
  };
};
