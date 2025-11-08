import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuantumOrbProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'purple' | 'green';
  className?: string;
  delay?: number;
}

export function QuantumOrb({
  size = 'md',
  color = 'cyan',
  className,
  delay = 0,
}: QuantumOrbProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const colorClasses = {
    cyan: 'bg-gradient-to-br from-[#00D9FF]/30 to-[#00D9FF]/10 aiz-glow-cyan',
    purple: 'bg-gradient-to-br from-[#B47EFF]/30 to-[#B47EFF]/10 aiz-glow-purple',
    green: 'bg-gradient-to-br from-[#10B981]/30 to-[#10B981]/10 aiz-glow-green',
  };

  return (
    <motion.div
      className={cn(
        'rounded-full blur-xl',
        sizeClasses[size],
        colorClasses[color],
        'float-gentle',
        className
      )}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}