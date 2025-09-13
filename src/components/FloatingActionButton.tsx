import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  className,
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-strong",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-200 hover:scale-110 active:scale-95",
        "focus:ring-4 focus:ring-primary/30",
        className
      )}
      size="icon"
    >
      <Plus className="w-6 h-6" />
    </Button>
  );
};