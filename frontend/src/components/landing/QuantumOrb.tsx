import { useEffect, useState } from 'react';

interface QuantumOrbProps {
  size?: number;
  delay?: number;
  color?: 'cyan' | 'purple' | 'green';
}

export function QuantumOrb({ size = 100, delay = 0, color = 'cyan' }: QuantumOrbProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    });
  }, []);

  const colorMap = {
    cyan: 'from-[#00D9FF]/30 to-[#00D9FF]/10',
    purple: 'from-[#B47EFF]/30 to-[#B47EFF]/10',
    green: 'from-[#10B981]/30 to-[#10B981]/10',
  };

  const glowMap = {
    cyan: 'shadow-[0_0_40px_rgba(0,217,255,0.4)]',
    purple: 'shadow-[0_0_40px_rgba(180,126,255,0.4)]',
    green: 'shadow-[0_0_40px_rgba(16,185,129,0.4)]',
  };

  return (
    <div
      className="absolute rounded-full blur-xl float-gentle pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorMap[color]} ${glowMap[color]} animate-pulse`} />
    </div>
  );
}