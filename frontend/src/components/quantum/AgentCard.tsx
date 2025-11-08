import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConsciousnessBadge } from './ConsciousnessBadge';
import { Cpu } from 'lucide-react';
import type { Agent } from '@/data/quantumMockData';

interface AgentCardProps {
  agent: Agent;
  onViewDNA?: (agentId: string) => void;
}

export function AgentCard({ agent, onViewDNA }: AgentCardProps) {
  return (
    <Card className="bg-quantum-surface border-quantum-border hover:border-quantum-cyan transition-all hover:glow-cyan">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-quantum-cyan" />
            <CardTitle className="text-quantum-text-primary">{agent.name}</CardTitle>
          </div>
          <ConsciousnessBadge state={agent.consciousnessState} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-quantum-text-muted mb-1">Persona</div>
          <div className="text-sm text-quantum-text-secondary">{agent.persona}</div>
        </div>
        <div>
          <div className="text-xs text-quantum-text-muted mb-1">Core Skill</div>
          <div className="text-sm text-quantum-text-secondary">{agent.coreSkill}</div>
        </div>
        <Button 
          variant="outline" 
          className="w-full border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan hover:text-quantum-bg"
          onClick={() => onViewDNA?.(agent.id)}
        >
          View DNA
        </Button>
      </CardContent>
    </Card>
  );
}