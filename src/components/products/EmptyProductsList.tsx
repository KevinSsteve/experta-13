
import React from 'react';

interface EmptyProductsListProps {
  isStore?: boolean;
}

export const EmptyProductsList = ({ isStore = false }: EmptyProductsListProps) => {
  return (
    <div className="px-4 py-8 text-center text-muted-foreground">
      {isStore
        ? "Nenhum produto disponível na loja."
        : "Nenhum produto no seu estoque. Adicione produtos da loja ou crie um novo produto."}
    </div>
  );
};
