
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Edit, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import type { OrderList } from "@/pages/VoiceOrderLists";
import { Input } from "@/components/ui/input";
import { SimpleProductSuggestions } from "./SimpleProductSuggestions";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SimpleVoiceOrdersListProps {
  lists: OrderList[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onToCheckout: (id: string) => void;
  onEditItem: (listId: string, itemIndex: number, newValue: string) => void;
  onRemoveItem: (listId: string, itemIndex: number) => void;
}

export function SimpleVoiceOrdersList({
  lists,
  onRemove,
  onClear,
  onToCheckout,
  onEditItem,
  onRemoveItem
}: SimpleVoiceOrdersListProps) {
  const { user } = useAuth();
  const [editing, setEditing] = useState<{ [k: string]: boolean }>({});
  const [editValue, setEditValue] = useState<{ [k: string]: string }>({});
  const [expandedItems, setExpandedItems] = useState<{ [k: string]: boolean }>({});
  
  // Generate a unique key for each item in the list
  const getKey = (listId: string, itemIndex: number) => {
    return `${listId}-${itemIndex}`;
  };
  
  // Toggle the expanded state of an item
  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Function to format product item display
  const formatProductItem = (item: string): string => {
    try {
      // Check if the item is a JSON string
      if (typeof item === 'string' && (item.startsWith('{') || item.startsWith('['))) {
        const parsedItem = JSON.parse(item);
        if (parsedItem && typeof parsedItem === 'object' && parsedItem.name) {
          return parsedItem.name;
        }
      }
      return item;
    } catch (e) {
      // If parsing fails, return the original item
      return item;
    }
  };

  // Format date to relative time
  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (e) {
      return 'Data desconhecida';
    }
  };

  if (lists.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">
          Nenhuma lista criada ainda. Use o microfone acima para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Minhas listas</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-1" /> Limpar todas
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja limpar todas as suas listas? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onClear}>Limpar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="grid gap-4">
        {lists.map((list) => (
          <Card key={list.id} className="overflow-hidden">
            <CardHeader className="bg-muted/10 pb-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Lista {list.id.substring(0, 6)}</CardTitle>
                  <Badge variant={list.status === "enviado" ? "secondary" : "outline"}>
                    {list.status === "enviado" ? "Enviada" : "Em aberto"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(list.createdAt)}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <ul className="space-y-3">
                {list.products.map((prod, idx) => {
                  const key = getKey(list.id, idx);
                  const isEditing = editing[key] === true;
                  const isExpanded = expandedItems[key] === true;
                  const formattedProduct = formatProductItem(prod);
                  
                  return (
                    <li key={idx} className="relative group">
                      <div className="flex items-center gap-2 border rounded-md p-2 bg-card">
                        {isEditing ? (
                          <>
                            <Input
                              value={editValue[key] ?? formattedProduct}
                              onChange={e =>
                                setEditValue(v => ({ ...v, [key]: e.target.value }))
                              }
                              className="h-7 px-2 text-sm flex-1"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7"
                                onClick={() => {
                                  onEditItem(list.id, idx, editValue[key] ?? formattedProduct);
                                  setEditing(ed => ({ ...ed, [key]: false }));
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => setEditing(ed => ({ ...ed, [key]: false }))}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 truncate">{formattedProduct}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditing(ed => ({ ...ed, [key]: true }));
                                  setEditValue(v => ({ ...v, [key]: formattedProduct }));
                                }}
                                aria-label="Editar item"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => onRemoveItem(list.id, idx)}
                                aria-label="Remover item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => toggleExpanded(key)}
                                title={isExpanded ? "Esconder sugestões" : "Mostrar sugestões"}
                                aria-label={isExpanded ? "Esconder sugestões" : "Mostrar sugestões"}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Sugestões de produtos limitadas a 3 */}
                      {!isEditing && isExpanded && (
                        <div className="mt-1 ml-2 bg-background border rounded-md p-2">
                          <SimpleProductSuggestions 
                            productName={formattedProduct} 
                            userId={user?.id}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  onClick={() => onToCheckout(list.id)}
                  size="sm"
                  variant={list.status === "enviado" ? "secondary" : "default"}
                  disabled={list.status === "enviado"}
                  className="w-full sm:w-auto"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" /> 
                  {list.status === "enviado" ? "Enviada" : "Adicionar ao carrinho"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => onRemove(list.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
