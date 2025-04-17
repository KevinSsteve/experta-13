
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { VoiceSearchButton } from './VoiceSearchButton';
import { useToast } from '@/components/ui/use-toast';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const { toast } = useToast();

  // Função para atualizar o valor da busca quando o reconhecimento de voz retornar um resultado
  const handleVoiceResult = (text: string) => {
    // Simulando um evento de alteração para manter a compatibilidade com o handler atual
    const syntheticEvent = {
      target: { value: text },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  // Função para lidar com múltiplas buscas de produtos
  const handleMultiSearch = (products: string[]) => {
    if (products.length > 0) {
      // Primeiro produto vai para o campo de busca
      handleVoiceResult(products[0]);
      
      // Se houver mais de um produto, mostra toast informativo
      if (products.length > 1) {
        toast({
          title: "Múltiplos produtos",
          description: `Use comandos como "adicionar ao carrinho" para processar múltiplos produtos de uma vez.`,
        });
      }
    }
  };
  
  return (
    <div className="relative max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Pesquisar produtos por nome ou código..."
        className="pl-10 pr-10"
        value={value}
        onChange={onChange}
      />
      <VoiceSearchButton 
        onResult={handleVoiceResult} 
        onMultiSearch={handleMultiSearch}
      />
    </div>
  );
};
