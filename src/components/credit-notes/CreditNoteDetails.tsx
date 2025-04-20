
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditNote } from "@/lib/sales/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditNoteStatusBadge } from "./CreditNoteStatusBadge";
import { CheckCircle, XCircle } from "lucide-react";

interface CreditNoteDetailsProps {
  note: CreditNote;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (note: CreditNote) => void;
  onReject: (note: CreditNote) => void;
}

export function CreditNoteDetails({ 
  note, 
  isOpen, 
  onClose,
  onApprove,
  onReject
}: CreditNoteDetailsProps) {
  // Obter informações do cliente da nota de crédito
  const getCustomerInfo = () => {
    if (!note.customer) return "Cliente não identificado";
    
    if (typeof note.customer === 'string') {
      return note.customer;
    }
    
    // Tenta extrair o nome do cliente do objeto JSON
    try {
      const customer = note.customer as any;
      if (customer.name) return customer.name;
      if (customer.email) return customer.email;
      return "Cliente não identificado";
    } catch (e) {
      return "Cliente não identificado";
    }
  };

  // Formatar os itens da nota de crédito
  const formatItems = () => {
    if (!note.items) return [];
    
    try {
      const items = note.items as any;
      
      // Se for um array, retornar diretamente
      if (Array.isArray(items)) {
        return items.map(item => ({
          name: item.product?.name || 'Produto',
          price: item.product?.price || 0,
          quantity: item.quantity || 1
        }));
      }
      
      // Se for outro formato, tentar extrair informações
      if (typeof items === 'object') {
        if (items.products && Array.isArray(items.products)) {
          return items.products.map((item: any) => ({
            name: item.productName || item.name || 'Produto',
            price: item.price || 0,
            quantity: item.quantity || 1
          }));
        }
      }
      
      return [];
    } catch (e) {
      console.error("Erro ao processar itens da nota de crédito:", e);
      return [];
    }
  };

  const items = formatItems();

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Nota de Crédito</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Cabeçalho com status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Nota de Crédito</p>
              <p className="font-mono text-sm">{note.id}</p>
            </div>
            <CreditNoteStatusBadge status={note.status} />
          </div>
          
          <Separator />
          
          {/* Informações principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Data de Emissão</p>
              <p>{formatDate(note.date)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">ID da Venda Original</p>
              <p className="font-mono text-sm">{note.original_sale_id}</p>
            </div>
            
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p>{getCustomerInfo()}</p>
            </div>
            
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Motivo</p>
              <p>{note.reason}</p>
            </div>
            
            {note.observations && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Observações</p>
                <p>{note.observations}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-lg font-semibold">{formatCurrency(note.total)}</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Itens da nota */}
          <div>
            <p className="font-medium mb-2">Itens</p>
            
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Detalhes dos itens não disponíveis</p>
            )}
          </div>
          
          {/* Ações */}
          {note.status === 'pending' && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="border-green-300 hover:border-green-400 hover:bg-green-50"
                onClick={() => onApprove(note)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
              
              <Button
                variant="outline"
                className="border-red-300 hover:border-red-400 hover:bg-red-50"
                onClick={() => onReject(note)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
