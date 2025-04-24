
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string | number;
  onSave: (value: string) => void;
  type?: "text" | "number";
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  formatter?: (value: any) => string;
}

export function InlineEdit({
  value,
  onSave,
  type = "text",
  className,
  min,
  max,
  step,
  formatter
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

  const handleSave = () => {
    if (type === "number") {
      const num = parseFloat(editValue);
      if (isNaN(num)) {
        setEditValue(value.toString());
        setIsEditing(false);
        return;
      }
      if (min !== undefined && num < min) {
        setEditValue(min.toString());
        onSave(min.toString());
      } else if (max !== undefined && num > max) {
        setEditValue(max.toString());
        onSave(max.toString());
      } else {
        onSave(editValue);
      }
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        className={cn("h-7 w-24", className)}
      />
    );
  }

  const displayValue = formatter ? formatter(value) : value;

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        "px-2 py-1 rounded hover:bg-muted/50 transition-colors",
        className
      )}
    >
      {displayValue}
    </button>
  );
}
