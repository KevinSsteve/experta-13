
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
} from '@/components/ui/dialog';
import { InvoiceTemplate } from './InvoiceTemplate';
import { Sale } from '@/lib/sales/types';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceModalProps {
  sale: Sale;
  trigger?: React.ReactNode;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, trigger }) => {
  const [open, setOpen] = React.useState(false);

  // Adicionar estilos para impressão ao abrir o modal
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('invoice-print-mode');
    } else {
      document.body.classList.remove('invoice-print-mode');
    }
    
    return () => {
      document.body.classList.remove('invoice-print-mode');
    };
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Receipt className="mr-2 h-4 w-4" />
            Ver Fatura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-fit p-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
        <InvoiceTemplate sale={sale} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
