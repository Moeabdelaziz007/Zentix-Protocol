import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  children: ReactNode;
  variant?: 'default' | 'error';
  className?: string;
}

export function Alert({ children, variant = 'default', className }: AlertProps) {
  const variants = {
    default: 'bg-background text-foreground border-border',
    error: 'bg-error/10 text-error border-error',
  };

  return (
    <div className={cn('relative w-full rounded-lg border p-4', variants[variant], className)}>
      {children}
    </div>
  );
}