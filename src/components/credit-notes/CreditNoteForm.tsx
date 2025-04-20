
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sale } from '@/lib/sales/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

const creditNoteSchema = z.object({
  reason: z.string().min(10, {
    message: 'O motivo deve ter pelo menos 10 caracteres',
  }),
  observations: z.string().optional(),
});

interface CreditNoteFormProps {
  sale: Sale;
  onSubmit: (data: z.infer<typeof creditNoteSchema>) => void;
  isSubmitting?: boolean;
}

export function CreditNoteForm({ sale, onSubmit, isSubmitting = false }: CreditNoteFormProps) {
  const form = useForm<z.infer<typeof creditNoteSchema>>({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: {
      reason: '',
      observations: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Está prestes a criar uma nota de crédito para a fatura FT {sale.id}
            </p>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">
                {typeof sale.customer === 'string' 
                  ? sale.customer 
                  : sale.customer.name || 'Cliente não identificado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-medium">{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data da Venda:</span>
              <span className="font-medium">{new Date(sale.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Nota de Crédito *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o motivo para emissão da nota de crédito..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Adicionais</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais (opcional)..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Emitir Nota de Crédito'}
        </Button>
      </form>
    </Form>
  );
}
