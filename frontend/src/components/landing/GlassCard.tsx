import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'cyan' | 'purple' | 'green' | 'none';
}

export function GlassCard({ children, className = '', hover = true, glow = 'none' }: GlassCardProps) {
  const glowClasses = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,217,255,0.3)]',
    purple: 'hover:shadow-[0_0_30px_rgba(180,126,255,0.3)]',
    green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    none: '',
  };

  return (
    <div
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6
        ${hover ? 'transition-all duration-300 hover:-translate-y-2' : ''}
        ${glowClasses[glow]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}