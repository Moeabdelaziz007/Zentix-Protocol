import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ripple-effect inline-flex items-center justify-center gap-2';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:scale-105',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg hover:scale-105',
    success: 'bg-success text-white hover:bg-success/90 hover:shadow-lg hover:shadow-success/30 hover:scale-105',
    error: 'bg-error text-white hover:bg-error/90 hover:shadow-lg hover:shadow-error/30 hover:scale-105',
    ghost: 'bg-transparent hover:bg-muted text-foreground hover:scale-105',
    gradient: 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:shadow-primary/40 hover:scale-105',
  };

  return (
    <button 
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} 
      {...props}
    >
      {children}
    </button>
  );
}