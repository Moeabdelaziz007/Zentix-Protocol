import { Badge } from '@/components/ui/Badge';
import type { ConsciousnessState } from '@/data/quantumMockData';

interface ConsciousnessBadgeProps {
  state: ConsciousnessState;
}

const consciousnessConfig = {
  fulfilled: {
    label: 'fulfilled',
    dotClass: 'bg-consciousness-fulfilled glow-consciousness-fulfilled',
    textClass: 'text-consciousness-fulfilled'
  },
  focused: {
    label: 'focused',
    dotClass: 'bg-consciousness-focused glow-consciousness-focused',
    textClass: 'text-consciousness-focused'
  },
  curious: {
    label: 'curious',
    dotClass: 'bg-consciousness-curious glow-consciousness-curious',
    textClass: 'text-consciousness-curious'
  }
};

export function ConsciousnessBadge({ state }: ConsciousnessBadgeProps) {
  const config = consciousnessConfig[state];

  return (
    <Badge variant="outline" className="border-quantum-border">
      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${config.dotClass}`} />
      <span className={config.textClass}>{config.label}</span>
    </Badge>
  );
}