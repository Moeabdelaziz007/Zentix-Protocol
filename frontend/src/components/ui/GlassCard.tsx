import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient-border' | 'neu';
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className = '', variant = 'default', hover = true, glow = false }: GlassCardProps) {
  const variants = {
    default: 'bg-card border border-border shadow-md',
    glass: 'glass-card',
    'gradient-border': 'gradient-border shadow-lg',
    neu: 'neu-card',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-2xl hover:scale-[1.01]',
        glow && 'hover:glow',
        'animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function GlassCardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-xl font-semibold text-card-foreground', className)}>{children}</h3>;
}

export function GlassCardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}