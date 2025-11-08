import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AizCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glow' | 'gradient';
  glowColor?: 'cyan' | 'purple' | 'green';
  hover?: boolean;
  animate?: boolean;
}

export function AizCard({
  children,
  className,
  variant = 'default',
  glowColor = 'cyan',
  hover = true,
  animate = true,
}: AizCardProps) {
  const baseClasses = 'rounded-lg p-6 transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-card border border-border',
    glass: 'aiz-glass',
    glow: cn(
      'bg-card/50 border border-border',
      glowColor === 'cyan' && 'aiz-glow-cyan',
      glowColor === 'purple' && 'aiz-glow-purple',
      glowColor === 'green' && 'aiz-glow-green'
    ),
    gradient: 'aiz-gradient-primary text-white',
  };

  const hoverClasses = hover
    ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer'
    : '';

  const CardWrapper = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {};

  return (
    <CardWrapper
      className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}
      {...animationProps}
    >
      {children}
    </CardWrapper>
  );
}