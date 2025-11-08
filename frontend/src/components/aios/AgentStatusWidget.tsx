import { motion } from 'framer-motion';
import { Activity, Brain, Zap } from 'lucide-react';
import { AizCard } from './AizCard';
import { cn } from '@/lib/utils';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'processing';
  consciousness: 'fulfilled' | 'focused' | 'curious';
  performance: number;
}

interface AgentStatusWidgetProps {
  agent: AgentStatus;
  className?: string;
}

export function AgentStatusWidget({ agent, className }: AgentStatusWidgetProps) {
  const statusColors = {
    active: 'text-green-500',
    idle: 'text-yellow-500',
    processing: 'text-blue-500',
  };

  const consciousnessColors = {
    fulfilled: 'bg-[#4ADE80]',
    focused: 'bg-[#60A5FA]',
    curious: 'bg-[#FBBF24]',
  };

  const consciousnessGlow = {
    fulfilled: 'glow-consciousness-fulfilled',
    focused: 'glow-consciousness-focused',
    curious: 'glow-consciousness-curious',
  };

  return (
    <AizCard variant="glass" className={cn('relative overflow-hidden', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-aiz-primary/5 to-aiz-secondary/5 opacity-50" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-3 h-3 rounded-full quantum-pulse',
              consciousnessColors[agent.consciousness],
              consciousnessGlow[agent.consciousness]
            )} />
            <h3 className="font-semibold text-lg">{agent.name}</h3>
          </div>
          <span className={cn('text-sm font-medium', statusColors[agent.status])}>
            {agent.status}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center gap-1">
            <Brain className="w-5 h-5 text-aiz-primary" />
            <span className="text-xs text-muted-foreground">Consciousness</span>
            <span className="text-sm font-medium capitalize">{agent.consciousness}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Activity className="w-5 h-5 text-aiz-secondary" />
            <span className="text-xs text-muted-foreground">Performance</span>
            <span className="text-sm font-medium">{agent.performance}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-5 h-5 text-aiz-accent" />
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>

        {/* Performance bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-aiz-primary to-aiz-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${agent.performance}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </AizCard>
  );
}