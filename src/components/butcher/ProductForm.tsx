
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
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar, Package } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres',
  }),
  code: z.string().optional(),
  animalType: z.string().min(1, {
    message: 'Selecione o tipo de animal',
  }),
  cutType: z.string().min(1, {
    message: 'Selecione o tipo de corte',
  }),
  pricePerKg: z.number().min(0.01, {
    message: 'O preço deve ser maior que zero',
  }),
  stock: z.number().min(0, {
    message: 'O estoque não pode ser negativo',
  }),
  expirationDate: z.date().optional(),
  description: z.string().optional(),
  supplier: z.string().optional(),
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

const CUT_TYPES = {
  beef: [
    { value: 'filet', label: 'Filé Mignon' },
    { value: 'ribeye', label: 'Contra-Filé' },
    { value: 'sirloin', label: 'Alcatra' },
    { value: 'rump', label: 'Picanha' },
    { value: 'chuck', label: 'Acém' },
    { value: 'brisket', label: 'Peito' },
    { value: 'ground', label: 'Moída' },
  ],
  pork: [
    { value: 'loin', label: 'Lombo' },
    { value: 'belly', label: 'Barriga' },
    { value: 'ribs', label: 'Costela' },
    { value: 'shoulder', label: 'Paleta' },
    { value: 'leg', label: 'Pernil' },
  ],
  lamb: [
    { value: 'rack', label: 'Carré' },
    { value: 'leg', label: 'Pernil' },
    { value: 'shoulder', label: 'Paleta' },
    { value: 'loin', label: 'Lombo' },
  ],
  chicken: [
    { value: 'breast', label: 'Peito' },
    { value: 'thigh', label: 'Coxa' },
    { value: 'drumstick', label: 'Sobrecoxa' },
    { value: 'wing', label: 'Asa' },
    { value: 'whole', label: 'Inteiro' },
  ],
  goat: [
    { value: 'leg', label: 'Pernil' },
    { value: 'shoulder', label: 'Paleta' },
    { value: 'loin', label: 'Lombo' },
  ],
  game: [
    { value: 'venison', label: 'Veado' },
    { value: 'wild_boar', label: 'Javali' },
    { value: 'rabbit', label: 'Coelho' },
  ],
};

interface ProductFormProps {
  initialData?: FormValues;
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

export const ProductForm = ({ initialData, onSubmit, isLoading = false }: ProductFormProps) => {
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedAnimalType, setSelectedAnimalType] = useState(initialData?.animalType || '');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      code: '',
      animalType: '',
      cutType: '',
      pricePerKg: 0,
      stock: 0,
      description: '',
      supplier: '',
    },
  });

  const handleBarcodeDetected = (code: string) => {
    form.setValue('code', code);
    setShowBarcodeScanner(false);
  };

  const availableCuts = CUT_TYPES[selectedAnimalType as keyof typeof CUT_TYPES] || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="code"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="animalType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Animal</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedAnimalType(value);
                    form.setValue('cutType', '');
                  }} 
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

          <FormField
            control={form.control}
            name="cutType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Corte</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!selectedAnimalType}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de corte" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCuts.map((cut) => (
                      <SelectItem key={cut.value} value={cut.value}>
                        {cut.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricePerKg"
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
            name="stock"
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
        </div>

        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de validade</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do fornecedor" />
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
