
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CreditNote, Sale } from '@/lib/sales/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getCreditNotes } from '@/lib/credit-notes';
import { CreditNoteDetails } from '@/components/credit-notes/CreditNoteDetails';
import { CreditNoteStatusBadge } from '@/components/credit-notes/CreditNoteStatusBadge';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Search, CheckCircle, XCircle } from 'lucide-react';

export default function CreditNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<CreditNote | null>(null);

  // Buscar todas as notas de crédito
  const { data: creditNotes, isLoading } = useQuery({
    queryKey: ['creditNotes', user?.id],
    queryFn: () => getCreditNotes(user?.id),
    enabled: !!user?.id,
  });

  // Mutação para aprovar uma nota de crédito
  const approveMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('credit_notes')
        .update({ status: 'approved' })
        .eq('id', noteId);

      if (error) throw error;
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      toast.success('Nota de crédito aprovada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao aprovar nota de crédito:', error);
      toast.error('Erro ao aprovar nota de crédito');
    },
  });

  // Mutação para rejeitar uma nota de crédito
  const rejectMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('credit_notes')
        .update({ status: 'rejected' })
        .eq('id', noteId);

      if (error) throw error;
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
      toast.success('Nota de crédito rejeitada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao rejeitar nota de crédito:', error);
      toast.error('Erro ao rejeitar nota de crédito');
    },
  });

  // Filtrar notas de crédito com base na aba e no termo de pesquisa
  const filteredNotes = creditNotes?.filter((note) => {
    const matchesStatus = 
      selectedTab === 'all' || 
      note.status === selectedTab;
    
    const matchesSearch = 
      !searchTerm || 
      note.reason.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.original_sale_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Função para abrir detalhes da nota de crédito
  const handleViewDetails = (note: CreditNote) => {
    setSelectedNote(note);
  };

  // Função para aprovar uma nota de crédito
  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  // Função para rejeitar uma nota de crédito
  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              {Array(5).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestão de Notas de Crédito
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todas as notas de crédito emitidas
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notas de Crédito</CardTitle>
              <CardDescription>
                Aprove, rejeite ou visualize detalhes das notas de crédito
              </CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Tabs 
                  defaultValue="all" 
                  value={selectedTab} 
                  onValueChange={setSelectedTab}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="pending">Pendentes</TabsTrigger>
                    <TabsTrigger value="approved">Aprovadas</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar notas de crédito..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filteredNotes && filteredNotes.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>ID da Venda</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(note.date)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {note.original_sale_id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {note.reason}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(note.total)}
                          </TableCell>
                          <TableCell>
                            <CreditNoteStatusBadge status={note.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleViewDetails(note)}
                                title="Ver detalhes"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              
                              {note.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(note.id)}
                                    title="Aprovar nota"
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(note.id)}
                                    title="Rejeitar nota"
                                    disabled={rejectMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-semibold">Nenhuma nota de crédito encontrada</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm 
                      ? 'Tente ajustar sua pesquisa' 
                      : selectedTab === 'all' 
                        ? 'Não existem notas de crédito cadastradas' 
                        : `Não existem notas de crédito com status "${selectedTab}"`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo para exibir detalhes da nota selecionada */}
      {selectedNote && (
        <CreditNoteDetails 
          note={selectedNote} 
          isOpen={!!selectedNote} 
          onClose={() => setSelectedNote(null)}
          onApprove={note => note.status === 'pending' && handleApprove(note.id)}
          onReject={note => note.status === 'pending' && handleReject(note.id)}
        />
      )}
    </MainLayout>
  );
}
