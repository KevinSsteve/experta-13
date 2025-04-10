
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/lib/products-data";
import { Product } from "@/contexts/CartContext";

// Esquema de validação para o formulário de produto
const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  price: z.coerce.number().positive("O preço deve ser positivo"),
  purchase_price: z.coerce.number().min(0, "O preço de compra não pode ser negativo"),
  category: z.string().min(1, "Selecione uma categoria"),
  stock: z.coerce.number().int("A quantidade deve ser um número inteiro").min(0, "Não pode ser negativo"),
  description: z.string().optional(),
  code: z.string().optional(),
  image: z.string().default("/placeholder.svg"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Partial<Product>;
  isSubmitting?: boolean;
}

export function ProductForm({ onSubmit, defaultValues, isSubmitting = false }: ProductFormProps) {
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesList = await getCategories();
        setCategories(categoriesList);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories(["Alimentos Básicos", "Laticínios", "Hortifruti", "Carnes", "Padaria", "Bebidas", "Limpeza", "Higiene"]);
      }
    };
    
    fetchCategories();
  }, []);

  // Calcular a margem de lucro (apenas para exibição)
  const calculateProfitMargin = (price: number, purchasePrice: number): string => {
    if (!purchasePrice || purchasePrice <= 0) return "N/A";
    const margin = ((price - purchasePrice) / purchasePrice) * 100;
    return `${margin.toFixed(2)}%`;
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      price: defaultValues?.price || 0,
      purchase_price: (defaultValues as any)?.purchase_price || 0,
      category: defaultValues?.category || "",
      stock: defaultValues?.stock || 0,
      description: defaultValues?.description || "",
      code: defaultValues?.code || "",
      image: defaultValues?.image || "/placeholder.svg",
    },
  });

  // Observar alterações nos campos de preço e preço de compra para mostrar a margem de lucro
  const [profitMargin, setProfitMargin] = useState<string>("N/A");
  const price = form.watch("price");
  const purchasePrice = form.watch("purchase_price");

  useEffect(() => {
    setProfitMargin(calculateProfitMargin(price, purchasePrice));
  }, [price, purchasePrice]);

  function handleSubmit(data: ProductFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Compra (Kz)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda (Kz)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Margem de lucro: {profitMargin}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade em Estoque</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite uma descrição para o produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="URL da imagem (recomendado: imagem leve)" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Use imagens leves para melhor desempenho. Se não fornecer uma URL, será usada uma imagem padrão.
              </p>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-4">
          {isSubmitting ? "Salvando..." : defaultValues?.id ? "Atualizar Produto" : "Adicionar Produto"}
        </Button>
      </form>
    </Form>
  );
}
