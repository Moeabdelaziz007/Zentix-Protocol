import type { ReactNode } from 'react';

type ConsciousnessState = 'fulfilled' | 'focused' | 'curious';

interface ConsciousnessIndicatorProps {
  state: ConsciousnessState;
  label?: string;
  children?: ReactNode;
}

export function ConsciousnessIndicator({ state, label, children }: ConsciousnessIndicatorProps) {
  const stateConfig = {
    fulfilled: {
      color: 'bg-[#4ADE80]',
      glow: 'shadow-[0_0_15px_rgba(74,222,128,0.5)]',
      text: 'Fulfilled',
    },
    focused: {
      color: 'bg-[#60A5FA]',
      glow: 'shadow-[0_0_15px_rgba(96,165,250,0.5)]',
      text: 'Focused',
    },
    curious: {
      color: 'bg-[#FBBF24]',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
      text: 'Curious',
    },
  };

  const config = stateConfig[state];

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <div className={`w-2 h-2 rounded-full ${config.color} ${config.glow} consciousness-pulse`} />
      <span className="text-sm font-medium">{label || config.text}</span>
      {children}
    </div>
  );
}