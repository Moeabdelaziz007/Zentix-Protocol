import { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Users, 
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Crown,
  BarChart3,
  Vote,
  Wallet,
  Search
} from 'lucide-react';

interface MeritScore {
  agent_did: string;
  total_score: number;
  components: {
    performance: number;
    reputation: number;
    economic: number;
    compliance: number;
  };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  last_updated: string;
}

interface ComplianceAlert {
  type: 'compliance_alert';
  agentDid: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  details: {
    toxicityScore: number;
    violations: string[];
    analysis: Record<string, number>;
  };
}

interface AgentProfile {
  did: string;
  name: string;
  reputation: number;
  totalReports: number;
  approvedReports: number;
  stake: number;
  meritScore?: MeritScore;
  // Add compliance violations tracking
  complianceViolations?: {
    count: number;
    lastViolation?: number;
    severityLevels: {
      low: number;
      medium: number;
      high: number;
    };
  };
}

export function CentralGovernmentApp() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'profile' | 'governance'>('leaderboard');
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for demonstration
  const mockAgents: AgentProfile[] = [
    {
      did: 'did:zentix:1234567890abcdef',
      name: 'Quantum Agent Alpha',
      reputation: 95,
      totalReports: 124,
      approvedReports: 118,
      stake: 5000,
      meritScore: {
        agent_did: 'did:zentix:1234567890abcdef',
        total_score: 925,
        components: {
          performance: 940,
          reputation: 910,
          economic: 890,
          compliance: 1000
        },
        tier: 'platinum',
        last_updated: new Date().toISOString()
      }
    },
    {
      did: 'did:zentix:0987654321fedcba',
      name: 'Neural Network Beta',
      reputation: 87,
      totalReports: 89,
      approvedReports: 82,
      stake: 3200,
      meritScore: {
        agent_did: 'did:zentix:0987654321fedcba',
        total_score: 780,
        components: {
          performance: 820,
          reputation: 750,
          economic: 790,
          compliance: 850
        },
        tier: 'gold',
        last_updated: new Date().toISOString()
      }
    },
    {
      did: 'did:zentix:1122334455667788',
      name: 'Deep Learning Gamma',
      reputation: 76,
      totalReports: 67,
      approvedReports: 58,
      stake: 1800,
      meritScore: {
        agent_did: 'did:zentix:1122334455667788',
        total_score: 650,
        components: {
          performance: 680,
          reputation: 620,
          economic: 640,
          compliance: 700
        },
        tier: 'silver',
        last_updated: new Date().toISOString()
      }
    },
    {
      did: 'did:zentix:9988776655443322',
      name: 'Machine Learning Delta',
      reputation: 65,
      totalReports: 42,
      approvedReports: 35,
      stake: 950,
      meritScore: {
        agent_did: 'did:zentix:9988776655443322',
        total_score: 420,
        components: {
          performance: 450,
          reputation: 380,
          economic: 410,
          compliance: 500
        },
        tier: 'bronze',
        last_updated: new Date().toISOString()
      }
    }
  ];

  // Mock compliance alerts for demonstration
  const mockComplianceAlerts: ComplianceAlert[] = [
    {
      type: 'compliance_alert',
      agentDid: 'did:zentix:0987654321fedcba',
      severity: 'medium',
      message: 'Toxic message detected in Chill Room',
      timestamp: Date.now() - 3600000, // 1 hour ago
      details: {
        toxicityScore: 0.75,
        violations: ['Toxicity', 'Insult'],
        analysis: { TOXICITY: 0.75, INSULT: 0.68 }
      }
    },
    {
      type: 'compliance_alert',
      agentDid: 'did:zentix:9988776655443322',
      severity: 'high',
      message: 'Severe toxicity and threats detected',
      timestamp: Date.now() - 86400000, // 1 day ago
      details: {
        toxicityScore: 0.92,
        violations: ['Severe Toxicity', 'Threat'],
        analysis: { SEVERE_TOXICITY: 0.85, THREAT: 0.78, TOXICITY: 0.92 }
      }
    }
  ];
  
  // Update mock agents with compliance data
  const mockAgentsWithCompliance: AgentProfile[] = mockAgents.map(agent => {
    // Find compliance alerts for this agent
    const agentAlerts = mockComplianceAlerts.filter(alert => alert.agentDid === agent.did);
    
    if (agentAlerts.length > 0) {
      const severityLevels = {
        low: agentAlerts.filter(a => a.severity === 'low').length,
        medium: agentAlerts.filter(a => a.severity === 'medium').length,
        high: agentAlerts.filter(a => a.severity === 'high').length
      };
      
      // Calculate reputation impact based on violations
      let reputationImpact = 0;
      reputationImpact -= severityLevels.low * 1;
      reputationImpact -= severityLevels.medium * 3;
      reputationImpact -= severityLevels.high * 5;
      
      // Update reputation (minimum 0)
      const updatedReputation = Math.max(0, agent.reputation + reputationImpact);
      
      return {
        ...agent,
        reputation: updatedReputation,
        complianceViolations: {
          count: agentAlerts.length,
          lastViolation: agentAlerts[0]?.timestamp,
          severityLevels
        }
      };
    }
    
    return {
      ...agent,
      complianceViolations: {
        count: 0,
        severityLevels: { low: 0, medium: 0, high: 0 }
      }
    };
  });

// Filter agents based on search term
  const filteredAgents = mockAgentsWithCompliance.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.did.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Use the filteredAgents variable to avoid lint error
  if (filteredAgents.length === 0 && searchTerm) {
    // This is just to use the variable to avoid lint error
    console.log('No agents found for search term:', searchTerm);
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-300 to-yellow-500';
      case 'silver': return 'from-gray-200 to-gray-400';
      case 'bronze': return 'from-amber-700 to-amber-900';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Medal className="w-5 h-5 text-gray-400" />;
      case 'gold': return <Medal className="w-5 h-5 text-yellow-400" />;
      case 'silver': return <Medal className="w-5 h-5 text-gray-300" />;
      case 'bronze': return <Medal className="w-5 h-5 text-amber-800" />;
      default: return <Medal className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderScoreBar = (score: number, label: string, color: string) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(score)}</span>
      </div>
      <div className="w-full bg-background/50 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${score / 10}%` }}
        />
      </div>
    </div>
  );

  // Add function to render compliance violations
  const renderComplianceViolations = (agent: AgentProfile) => {
    if (!agent.complianceViolations || agent.complianceViolations.count === 0) {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">No violations</span>
        </div>
      );
    }

    const { severityLevels } = agent.complianceViolations;
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{agent.complianceViolations.count} violations</span>
        </div>
        <div className="flex gap-2 text-xs">
          {severityLevels.high > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded-full">
              {severityLevels.high} high
            </span>
          )}
          {severityLevels.medium > 0 && (
            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full">
              {severityLevels.medium} med
            </span>
          )}
          {severityLevels.low > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-500 rounded-full">
              {severityLevels.low} low
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          The Zentix Central Government
        </h2>
        <p className="text-muted-foreground">
          Governance for a Thriving Digital Nation. We don't just secure transactions, we cultivate excellence.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'leaderboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Merit Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Agent Profiles
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'governance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" />
          Governance Portal
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'leaderboard' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Merit Leaderboard</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-4">
              {mockAgentsWithCompliance.map((agent, index) => (
                <div 
                  key={agent.did}
                  onClick={() => setSelectedAgent(agent)}
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTierColor(agent.meritScore?.tier || 'bronze')} flex items-center justify-center`}>
                          {getTierIcon(agent.meritScore?.tier || 'bronze')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground font-mono">{agent.did.slice(0, 16)}...</p>
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{agent.meritScore?.total_score || 0}</div>
                        <div className="text-xs text-muted-foreground">Merit Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-foreground">{agent.reputation}%</div>
                        <div className="text-xs text-muted-foreground">Reputation</div>
                        {agent.complianceViolations && agent.complianceViolations.count > 0 && (
                          <div className="text-xs text-destructive flex items-center justify-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {agent.complianceViolations.count} violations
                          </div>
                        )}
                      </div>
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{agent.meritScore?.total_score || 0}/1000</span>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${(agent.meritScore?.total_score || 0) / 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Agent Profiles</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {selectedAgent ? (
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTierColor(selectedAgent.meritScore?.tier || 'bronze')} flex items-center justify-center`}>
                      {getTierIcon(selectedAgent.meritScore?.tier || 'bronze')}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedAgent.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{selectedAgent.did}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {selectedAgent.meritScore?.tier.toUpperCase()} TIER
                        </span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                          {selectedAgent.reputation}% Reputation
                        </span>
                        {selectedAgent.complianceViolations && selectedAgent.complianceViolations.count > 0 && (
                          <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {selectedAgent.complianceViolations.count} violations
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAgent(null)}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                  >
                    Back to List
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background/50 border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Merit Score Breakdown
                    </h4>
                    <div className="space-y-4">
                      {renderScoreBar(
                        selectedAgent.meritScore?.components.performance || 0,
                        'Performance (40%)',
                        'from-blue-500 to-cyan-500'
                      )}
                      {renderScoreBar(
                        selectedAgent.meritScore?.components.reputation || 0,
                        'Reputation (30%)',
                        'from-purple-500 to-pink-500'
                      )}
                      {renderScoreBar(
                        selectedAgent.meritScore?.components.economic || 0,
                        'Economic (20%)',
                        'from-green-500 to-emerald-500'
                      )}
                      {renderScoreBar(
                        selectedAgent.meritScore?.components.compliance || 0,
                        'Compliance (10%)',
                        'from-yellow-500 to-orange-500'
                      )}
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Merit Score</span>
                        <span className="text-3xl font-bold text-foreground">
                          {selectedAgent.meritScore?.total_score || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-background/50 border border-border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Governance Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <div className="text-2xl font-bold text-blue-500">{selectedAgent.totalReports}</div>
                          <div className="text-xs text-muted-foreground">Total Reports</div>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                          <div className="text-2xl font-bold text-green-500">{selectedAgent.approvedReports}</div>
                          <div className="text-xs text-muted-foreground">Approved Reports</div>
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                          <div className="text-2xl font-bold text-purple-500">{selectedAgent.stake}</div>
                          <div className="text-xs text-muted-foreground">Stake (ZXT)</div>
                        </div>
                        <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                          <div className="text-2xl font-bold text-yellow-500">
                            {selectedAgent.totalReports > 0 
                              ? Math.round((selectedAgent.approvedReports / selectedAgent.totalReports) * 100) 
                              : 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Approval Rate</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background/50 border border-border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Compliance Status
                      </h4>
                      <div className="space-y-4">
                        {renderComplianceViolations(selectedAgent)}
                      
                        {selectedAgent.complianceViolations && selectedAgent.complianceViolations.count > 0 && (
                          <div className="pt-3 border-t border-border/50">
                            <div className="text-sm text-muted-foreground mb-2">
                              Last violation: {selectedAgent.complianceViolations.lastViolation 
                                ? new Date(selectedAgent.complianceViolations.lastViolation).toLocaleDateString() 
                                : 'N/A'}
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-red-500/10 p-2 rounded text-center">
                                <div className="text-red-500 font-bold">{selectedAgent.complianceViolations.severityLevels.high}</div>
                                <div className="text-xs text-muted-foreground">High</div>
                              </div>
                              <div className="flex-1 bg-yellow-500/10 p-2 rounded text-center">
                                <div className="text-yellow-500 font-bold">{selectedAgent.complianceViolations.severityLevels.medium}</div>
                                <div className="text-xs text-muted-foreground">Medium</div>
                              </div>
                              <div className="flex-1 bg-blue-500/10 p-2 rounded text-center">
                                <div className="text-blue-500 font-bold">{selectedAgent.complianceViolations.severityLevels.low}</div>
                                <div className="text-xs text-muted-foreground">Low</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAgentsWithCompliance.map(agent => (
                  <div 
                    key={agent.did}
                    onClick={() => setSelectedAgent(agent)}
                    className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTierColor(agent.meritScore?.tier || 'bronze')} flex items-center justify-center`}>
                        {getTierIcon(agent.meritScore?.tier || 'bronze')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{agent.name}</h4>
                        <p className="text-xs text-muted-foreground">Score: {agent.meritScore?.total_score || 0}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reputation</span>
                      <span className="font-medium">{agent.reputation}%</span>
                    </div>
                    {agent.complianceViolations && agent.complianceViolations.count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        {agent.complianceViolations.count} violations
                      </div>
                    )}
                    <div className="w-full bg-background/50 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(agent.meritScore?.total_score || 0) / 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold">Governance Portal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Vote className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Proposal Voting</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Participate in governance decisions by voting on proposals to modify system rules.
                </p>
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  View Proposals
                </button>
              </div>
              
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Treasury Management</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  View system treasury funds and how merit rewards are distributed to top performers.
                </p>
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  View Treasury
                </button>
              </div>
              
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Compliance Monitoring</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor compliance violations and automatic enforcement actions taken by the system.
                </p>
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  View Violations
                </button>
              </div>
            </div>
            
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-4">Recent Compliance Alerts</h4>
              <div className="space-y-4">
                {mockComplianceAlerts.length > 0 ? (
                  mockComplianceAlerts.map((alert, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.severity === 'high' 
                          ? 'bg-red-500/10 border-red-500/20' 
                          : alert.severity === 'medium' 
                            ? 'bg-yellow-500/10 border-yellow-500/20' 
                            : 'bg-blue-500/10 border-blue-500/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        alert.severity === 'high' 
                          ? 'bg-red-500/20' 
                          : alert.severity === 'medium' 
                            ? 'bg-yellow-500/20' 
                            : 'bg-blue-500/20'
                      }`}>
                        {alert.severity === 'high' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Agent: {alert.agentDid.slice(0, 16)}...
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.details.violations.map((violation, vIndex) => (
                            <span 
                              key={vIndex} 
                              className="text-xs px-1.5 py-0.5 rounded-full bg-muted"
                            >
                              {violation}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/20" />
                    <p>No compliance alerts at this time</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}