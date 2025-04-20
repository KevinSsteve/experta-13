
import { useEffect, useState } from 'react';
import { getCreditNotesByOriginalSale } from '@/lib/credit-notes';
import { CreditNote } from '@/lib/sales/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditNoteStatusBadge } from './CreditNoteStatusBadge';
import { CreditNoteDetails } from './CreditNoteDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface SaleCreditNotesListProps {
  saleId: string;
}

export function SaleCreditNotesList({ saleId }: SaleCreditNotesListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);

  useEffect(() => {
    const loadCreditNotes = async () => {
      setIsLoading(true);
      try {
        const data = await getCreditNotesByOriginalSale(saleId);
        setCreditNotes(data);
      } catch (error) {
        console.error('Erro ao carregar notas de crédito:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreditNotes();
  }, [saleId]);

  // Não faz nada, apenas fecha o diálogo
  const handleClose = () => setSelectedNote(null);
  const handleViewDetails = (note: CreditNote) => setSelectedNote(note);
  const noopHandler = () => {}; // Handler vazio para as ações que não são permitidas aqui

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (creditNotes.length === 0) {
    return (
      <div className="text-center py-4 border rounded-md">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground opacity-30" />
        <p className="text-sm text-muted-foreground mt-2">
          Não existem notas de crédito para esta venda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Notas de Crédito Associadas</h3>
      
      <div className="space-y-2">
        {creditNotes.map((note) => (
          <div 
            key={note.id} 
            className="border rounded-md p-3 hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => handleViewDetails(note)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{formatDate(note.date)}</p>
                  <CreditNoteStatusBadge status={note.status} />
                </div>
                <p className="text-sm text-muted-foreground truncate">{note.reason}</p>
              </div>
              <p className="font-semibold">{formatCurrency(note.total)}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedNote && (
        <CreditNoteDetails
          note={selectedNote}
          isOpen={!!selectedNote}
          onClose={handleClose}
          onApprove={noopHandler}
          onReject={noopHandler}
        />
      )}
    </div>
  );
}
