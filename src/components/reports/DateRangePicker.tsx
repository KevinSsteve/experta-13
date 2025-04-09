
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  value: { from: Date; to: Date } | undefined;
  onChange: (value: { from: Date; to: Date } | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: value?.from, to: value?.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange(range as { from: Date; to: Date });
              } else if (range?.from) {
                onChange({ from: range.from, to: range.from });
              } else {
                onChange(undefined);
              }
            }}
            locale={ptBR}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
