import { NetworkStatusCard } from '@/components/quantum/NetworkStatusCard';
import { AgentFeedItem } from '@/components/quantum/AgentFeedItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { mockNetworkStatus, mockAgentFeed } from '@/data/quantumMockData';
import { formatPercentage, formatAgentCount } from '@/utils/quantumFormatters';

export function QuantumDashboard() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-quantum-text-primary">Protocol Overview</h1>
        <p className="text-quantum-text-muted mt-1">Real-time network consciousness monitoring</p>
      </div>

      {/* Network Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NetworkStatusCard
          title="Active Agents"
          value={formatAgentCount(mockNetworkStatus.activeAgents)}
        />
        <NetworkStatusCard
          title="Collective Awareness"
          value={formatPercentage(mockNetworkStatus.collectiveAwareness)}
          showProgress
          progressValue={mockNetworkStatus.collectiveAwareness}
        />
        <NetworkStatusCard
          title="DNA Resonance"
          value={formatPercentage(mockNetworkStatus.dnaResonance)}
          showProgress
          progressValue={mockNetworkStatus.dnaResonance}
        />
      </div>

      {/* Live Agent Feed */}
      <Card className="bg-quantum-surface border-quantum-border">
        <CardHeader>
          <CardTitle className="text-quantum-text-primary">Live Agent Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {mockAgentFeed.map((message) => (
              <AgentFeedItem key={message.id} message={message} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}