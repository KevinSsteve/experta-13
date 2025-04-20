
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditNoteForm } from './CreditNoteForm';
import { Sale } from '@/lib/sales/types';
import { FileText } from 'lucide-react';

interface CreateCreditNoteDialogProps {
  sale: Sale;
  onCreateCreditNote: (data: { reason: string; observations?: string }) => Promise<void>;
}

export function CreateCreditNoteDialog({ sale, onCreateCreditNote }: CreateCreditNoteDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: { reason: string; observations?: string }) => {
    setIsSubmitting(true);
    try {
      await onCreateCreditNote(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao criar nota de crédito:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Emitir Nota de Crédito
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Emitir Nota de Crédito</DialogTitle>
          <DialogDescription>
            Preencha os dados para emitir uma nota de crédito para esta venda.
          </DialogDescription>
        </DialogHeader>
        <CreditNoteForm 
          sale={sale} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
}

