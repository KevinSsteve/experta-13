
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VoiceSearchButton } from './VoiceSearchButton';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMultiSearch?: (searchQuery: string) => void;
}

export function SearchBar({ 
  value, 
  onChange, 
  onMultiSearch
}: SearchBarProps) {
  const [multiValue, setMultiValue] = React.useState('');
  
  const handleMultiSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onMultiSearch && multiValue.trim()) {
      onMultiSearch(multiValue.trim());
    }
  };

  const handleClear = () => {
    const emptyEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(emptyEvent);
  };

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-8 w-full"
            value={value}
            onChange={onChange}
          />
          {value && (
            <button 
              onClick={handleClear}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {onMultiSearch && (
          <VoiceSearchButton 
            onResult={(text) => {
              setMultiValue(text);
              onMultiSearch(text);
            }}
          />
        )}
      </div>
      
      {onMultiSearch && (
        <form onSubmit={handleMultiSearchSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite vários produtos separados por vírgula..."
            className="flex-1"
            value={multiValue}
            onChange={(e) => setMultiValue(e.target.value)}
          />
          <Button type="submit" className="shrink-0">Pesquisar</Button>
        </form>
      )}
    </div>
  );
}
