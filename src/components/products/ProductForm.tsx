
import { useState } from "react";
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
import { toast } from "sonner";
import { getCategories } from "@/lib/products-data";
import { Product } from "@/contexts/CartContext";

// Esquema de validação para o formulário de produto
const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  price: z.coerce.number().positive("O preço deve ser positivo"),
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
  const [categories] = useState(getCategories);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      price: defaultValues?.price || 0,
      category: defaultValues?.category || "",
      stock: defaultValues?.stock || 0,
      description: defaultValues?.description || "",
      code: defaultValues?.code || "",
      image: defaultValues?.image || "/placeholder.svg",
    },
  });

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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (Kz)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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

        <Button type="submit" disabled={isSubmitting} className="mt-4">
          {isSubmitting ? "Salvando..." : defaultValues?.id ? "Atualizar Produto" : "Adicionar Produto"}
        </Button>
      </form>
    </Form>
  );
}
