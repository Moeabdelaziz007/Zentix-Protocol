import type { AgentFeedMessage } from '@/data/quantumMockData';
import { formatTimestamp } from '@/utils/quantumFormatters';

interface AgentFeedItemProps {
  message: AgentFeedMessage;
}

export function AgentFeedItem({ message }: AgentFeedItemProps) {
  return (
    <div className="py-3 px-4 border-b border-quantum-border hover:bg-quantum-surface/50 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-quantum-cyan font-mono-code font-semibold">
          [{message.agentName}]
        </span>
        <span className="text-quantum-text-secondary">&gt;</span>
        <span className="text-quantum-text-primary flex-1">{message.message}</span>
      </div>
      <div className="text-xs text-quantum-text-muted mt-1 font-mono-code">
        {formatTimestamp(message.timestamp)}
      </div>
    </div>
  );
}