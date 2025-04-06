
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/lib/products-data";
import { Product } from "@/contexts/CartContext";
import { generateId } from "@/lib/utils";

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories] = useState<string[]>(getCategories());
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: product ? {
      ...product
    } : {
      name: "",
      code: "",
      price: 0,
      stock: 0,
      category: "",
      description: "",
      image: "/placeholder.svg"
    }
  });
  
  const watchCategory = watch("category");
  
  const handleCategoryChange = (value: string) => {
    setValue("category", value);
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Se não tiver um ID, estamos criando um novo produto
      if (!product?.id) {
        // Gerar um ID para o novo produto
        const newId = generateId();
        
        // Em uma aplicação real, aqui faria a inserção no banco de dados
        // Por enquanto, apenas simulamos o sucesso
        toast.success("Produto adicionado com sucesso!");
        
        if (onSuccess) onSuccess();
      } else {
        // Em uma aplicação real, aqui faria a atualização no banco de dados
        // Por enquanto, apenas simulamos o sucesso
        toast.success("Produto atualizado com sucesso!");
        
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            {...register("name", { required: "Nome é obrigatório" })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message?.toString()}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            {...register("code", { required: "Código é obrigatório" })}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code.message?.toString()}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (AOA) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { 
              required: "Preço é obrigatório",
              valueAsNumber: true,
              min: { value: 0, message: "Preço deve ser maior que zero" }
            })}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message?.toString()}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque *</Label>
          <Input
            id="stock"
            type="number"
            {...register("stock", { 
              required: "Estoque é obrigatório",
              valueAsNumber: true,
              min: { value: 0, message: "Estoque não pode ser negativo" }
            })}
          />
          {errors.stock && (
            <p className="text-sm text-red-500">{errors.stock.message?.toString()}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select 
          value={watchCategory} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message?.toString()}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">URL da Imagem</Label>
        <Input
          id="image"
          {...register("image")}
          placeholder="/placeholder.svg"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : product ? "Atualizar Produto" : "Adicionar Produto"}
        </Button>
      </div>
    </form>
  );
}
