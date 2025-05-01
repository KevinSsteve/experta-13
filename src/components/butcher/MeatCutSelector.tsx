
import React, { useState } from 'react';
import { Check, ChevronDown, Beef } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MeatCut } from '@/lib/butcher/types';

export interface MeatCutSelectorProps {
  cuts: MeatCut[];
  value: string;
  onChange: (value: string) => void;
}

export const MeatCutSelector = ({ cuts = [], value, onChange }: MeatCutSelectorProps) => {
  const [open, setOpen] = useState(false);
  const selectedCut = cuts.find(cut => cut.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <Beef className="mr-2 h-4 w-4 text-primary" />
            {selectedCut ? selectedCut.name : "Selecionar corte de carne"}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Procurar corte de carne..." className="h-9" />
          <CommandEmpty>Nenhum corte encontrado.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {Array.isArray(cuts) && cuts.length > 0 ? (
              cuts.map((cut) => (
                <CommandItem
                  key={cut.id}
                  value={cut.name}
                  onSelect={() => {
                    onChange(cut.id);
                    setOpen(false);
                  }}
                  className="flex items-center"
                >
                  <div className={cn(
                    "flex items-center flex-1",
                    value === cut.id ? "font-medium" : ""
                  )}>
                    <span>{cut.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({cut.animal_type})
                    </span>
                  </div>
                  <span className="font-medium">
                    R$ {cut.price_per_kg.toFixed(2)}/kg
                  </span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === cut.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))
            ) : (
              <div className="py-6 text-center text-sm">Nenhum corte disponível</div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
