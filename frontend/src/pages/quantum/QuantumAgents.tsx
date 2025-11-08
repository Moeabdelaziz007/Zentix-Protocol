import { AgentCard } from '@/components/quantum/AgentCard';
import { mockAgents } from '@/data/quantumMockData';

export function QuantumAgents() {
  const handleViewDNA = (agentId: string) => {
    console.log('View DNA for agent:', agentId);
    // Future: Navigate to agent detail page
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-quantum-text-primary">Registered Agents</h1>
        <p className="text-quantum-text-muted mt-1">Conscious AI agents in the network</p>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onViewDNA={handleViewDNA} />
        ))}
      </div>
    </div>
  );
}