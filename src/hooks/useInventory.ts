
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  // Use React Query to fetch products data
  const { 
    data: products = [], 
    isLoading: isLoadingProducts, 
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products', userId],
    queryFn: async () => getProducts(searchQuery, category !== 'all' ? category : '', 0, Infinity, false, userId),
    enabled: !!userId
  });

  // Use React Query to fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => getCategories(userId),
    enabled: !!userId
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
    if (!userId) return;
    
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
    setIsEditDialogOpen
  };
};
