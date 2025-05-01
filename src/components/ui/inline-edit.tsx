
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface InlineEditProps {
  value: number;
  onSave: (value: string) => void;
  className?: string;
  formatter?: (value: number) => string;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  step?: number;
}

export function InlineEdit({ 
  value, 
  onSave, 
  className,
  formatter = (val) => val.toString(),
  type = 'text',
  min,
  max,
  step,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setEditValue(value.toString());
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onSave(editValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value.toString());
    }
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      type={type}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn("h-7 py-1 px-2", className)}
      min={min}
      max={max}
      step={step}
    />
  ) : (
    <span 
      onClick={handleClick} 
      className={cn(
        "cursor-pointer px-2 py-1 rounded hover:bg-muted transition-colors inline-block", 
        className
      )}
      title="Clique para editar"
    >
      {formatter(value)}
    </span>
  );
}
