import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
    success: 'bg-success/10 text-success border border-success/20 hover:bg-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20',
    error: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
    destructive: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
    secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80',
    outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-200 hover:scale-105',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}