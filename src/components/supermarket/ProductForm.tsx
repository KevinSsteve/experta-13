
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarcodeScanner } from '@/components/butcher/BarcodeScanner';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Calendar } from 'lucide-react';
import { SupermarketProduct, CategoryType, categoryTypeLabels } from '@/lib/supermarket/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres',
  }),
  barcode: z.string().optional(),
  category_type: z.string().min(1, {
    message: 'Selecione uma categoria',
  }),
  price: z.number().min(0.01, {
    message: 'O preço deve ser maior que zero',
  }),
  cost: z.number().min(0, {
    message: 'O custo não pode ser negativo',
  }),
  stock: z.number().min(0, {
    message: 'O estoque não pode ser negativo',
  }),
  description: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().optional(),
  expiry_date: z.string().optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORY_TYPES = [
  { value: 'groceries', label: 'Mercearia' },
  { value: 'dairy', label: 'Lacticínios' },
  { value: 'meat', label: 'Carnes' },
  { value: 'produce', label: 'Frutas e Legumes' },
  { value: 'bakery', label: 'Padaria' },
  { value: 'beverages', label: 'Bebidas' },
  { value: 'household', label: 'Produtos Domésticos' },
  { value: 'personal', label: 'Higiene Pessoal' },
  { value: 'frozen', label: 'Congelados' },
  { value: 'snacks', label: 'Petiscos e Snacks' },
];

interface ProductFormProps {
  initialData?: SupermarketProduct;
  onSubmit: (data: FormValues & { user_id: string }) => void;
  isLoading?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, isLoading = false }: ProductFormProps) => {
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      barcode: initialData.barcode || '',
      category_type: initialData.category_type,
      price: initialData.price,
      cost: initialData.cost,
      stock: initialData.stock,
      description: initialData.description || '',
      brand: initialData.brand || '',
      unit: initialData.unit || '',
      expiry_date: initialData.expiry_date || '',
      discount_percentage: initialData.discount_percentage || 0,
    } : {
      name: '',
      barcode: '',
      category_type: '',
      price: 0,
      cost: 0,
      stock: 0,
      description: '',
      brand: '',
      unit: '',
      expiry_date: '',
      discount_percentage: 0,
    },
  });

  const handleBarcodeDetected = (code: string) => {
    form.setValue('barcode', code);
    setShowBarcodeScanner(false);
  };

  const handleFormSubmit = (values: FormValues) => {
    if (!user?.id) {
      return;
    }

    onSubmit({
      ...values,
      user_id: user.id
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do produto</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Arroz Tio João 1kg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Tio João" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: kg, pacote, unidade" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 items-end">
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Código de barras</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 7891234567890" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
            className="mb-0.5"
          >
            <Package className="h-4 w-4 mr-2" />
            {showBarcodeScanner ? 'Fechar' : 'Escanear'}
          </Button>
        </div>

        {showBarcodeScanner && (
          <div className="mb-4">
            <BarcodeScanner onDetected={handleBarcodeDetected} />
          </div>
        )}

        <FormField
          control={form.control}
          name="category_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_TYPES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (Kz)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo (Kz)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    min="0" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de validade</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      {...field} 
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    min="0"
                    max="100"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
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
                <Textarea 
                  {...field} 
                  placeholder="Descreva detalhes sobre o produto..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>
      </form>
    </Form>
  );
};
