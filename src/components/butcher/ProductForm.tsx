
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
import { BarcodeScanner } from './BarcodeScanner';
import { useAuth } from '@/contexts/AuthContext';
import { Package } from 'lucide-react';
import { MeatCut, AnimalType } from '@/lib/butcher/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres',
  }),
  barcode: z.string().optional(),
  animal_type: z.string().min(1, {
    message: 'Selecione o tipo de animal',
  }),
  price_per_kg: z.number().min(0.01, {
    message: 'O preço deve ser maior que zero',
  }),
  cost_per_kg: z.number().min(0, {
    message: 'O custo não pode ser negativo',
  }),
  stock_weight: z.number().min(0, {
    message: 'O estoque não pode ser negativo',
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ANIMAL_TYPES = [
  { value: 'beef', label: 'Bovino' },
  { value: 'pork', label: 'Suíno' },
  { value: 'lamb', label: 'Cordeiro/Carneiro' },
  { value: 'chicken', label: 'Frango' },
  { value: 'goat', label: 'Caprino' },
  { value: 'game', label: 'Caça' },
];

interface ProductFormProps {
  initialData?: MeatCut;
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
      animal_type: initialData.animal_type,
      price_per_kg: initialData.price_per_kg,
      cost_per_kg: initialData.cost_per_kg,
      stock_weight: initialData.stock_weight,
      description: initialData.description || '',
    } : {
      name: '',
      barcode: '',
      animal_type: '',
      price_per_kg: 0,
      cost_per_kg: 0,
      stock_weight: 0,
      description: '',
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
                <Input {...field} placeholder="Ex: Picanha Premium" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="animal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Animal</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de animal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ANIMAL_TYPES.map((animal) => (
                    <SelectItem key={animal.value} value={animal.value}>
                      {animal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price_per_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço por Kg (R$)</FormLabel>
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
            name="cost_per_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo por Kg (R$)</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="stock_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estoque (Kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.001" 
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
