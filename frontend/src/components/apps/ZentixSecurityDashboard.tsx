import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Eye, FileText, TrendingUp, Network, Dna, Zap } from 'lucide-react';
import { ZentixAgent } from '../../../../core/agents/zentixAgent';
import { quantumSynchronizer } from '../../../../src/core/quantumSynchronizer';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'open' | 'resolved' | 'investigating';
  description: string;
}

interface ComplianceReport {
  policy: string;
  status: 'compliant' | 'non-compliant' | 'review-required';
  lastChecked: string;
  issues: number;
  recommendations: string[];
}

interface RiskAssessment {
  category: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  score: number;
  mitigation: string;
}

interface AgentDNA {
  meta: {
    app_name: string;
    version: string;
  };
  main_agent: {
    id: string;
    persona: {
      role: string;
      tone: string;
    };
    skills: string[];
  };
  sub_agents: any[];
}

export function ZentixSecurityDashboard() {
  const [agent] = useState(() => new ZentixAgent());
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'compliance' | 'risk' | 'collaboration'>('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [agentDNA, setAgentDNA] = useState<AgentDNA | null>(null);
  const [collaborationEvents, setCollaborationEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        await agent.initialize();
        console.log('ZentixAgent initialized with governance protocol');
        
        // Get agent DNA
        const dna = agent.getAgentDNA();
        setAgentDNA(dna);
        
        // Load mock data
        loadMockData();
        
        // Listen for quantum sync events
        quantumSynchronizer.on('decision-broadcast', (message) => {
          setCollaborationEvents(prev => [...prev, {
            id: Date.now(),
            type: 'decision-broadcast',
            from: message.from,
            to: message.to,
            timestamp: new Date().toISOString(),
            payload: message.payload
          }]);
        });
        
        quantumSynchronizer.on('context-sync', (message) => {
          setCollaborationEvents(prev => [...prev, {
            id: Date.now(),
            type: 'context-sync',
            from: message.from,
            to: message.to,
            timestamp: new Date().toISOString(),
            payload: message.payload
          }]);
        });
        
        quantumSynchronizer.on('message-sent', (message) => {
          setCollaborationEvents(prev => [...prev, {
            id: Date.now(),
            type: 'direct-message',
            from: message.from,
            to: message.to,
            timestamp: new Date().toISOString(),
            payload: message.payload
          }]);
        });
      } catch (error) {
        console.error('Failed to initialize ZentixAgent:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAgent();
  }, [agent]);

  const loadMockData = () => {
    // Mock security events
    setSecurityEvents([
      {
        id: 'evt-001',
        type: 'Unauthorized Access Attempt',
        severity: 'high',
        timestamp: '2025-11-08T10:30:00Z',
        status: 'investigating',
        description: 'Multiple failed login attempts detected from external IP'
      },
      {
        id: 'evt-002',
        type: 'Data Exfiltration Alert',
        severity: 'critical',
        timestamp: '2025-11-08T09:15:00Z',
        status: 'open',
        description: 'Large data transfer detected to unauthorized external server'
      },
      {
        id: 'evt-003',
        type: 'Vulnerability Scan',
        severity: 'medium',
        timestamp: '2025-11-08T08:45:00Z',
        status: 'resolved',
        description: 'Automated vulnerability scanning detected from known scanner'
      }
    ]);

    // Mock compliance reports
    setComplianceReports([
      {
        policy: 'GDPR Compliance',
        status: 'compliant',
        lastChecked: '2025-11-07',
        issues: 0,
        recommendations: ['Regular audit recommended', 'Update privacy policy']
      },
      {
        policy: 'SOC 2 Type II',
        status: 'review-required',
        lastChecked: '2025-11-06',
        issues: 2,
        recommendations: ['Address access control gaps', 'Implement additional logging']
      },
      {
        policy: 'ISO 27001',
        status: 'compliant',
        lastChecked: '2025-11-05',
        issues: 0,
        recommendations: ['Maintain current controls', 'Schedule annual review']
      }
    ]);

    // Mock risk assessments
    setRiskAssessments([
      {
        category: 'Network Security',
        level: 'medium',
        score: 7.2,
        mitigation: 'Implement zero-trust architecture and micro-segmentation'
      },
      {
        category: 'Data Protection',
        level: 'low',
        score: 4.1,
        mitigation: 'Enhance encryption for data at rest and in transit'
      },
      {
        category: 'Access Control',
        level: 'high',
        score: 8.7,
        mitigation: 'Deploy multi-factor authentication and role-based access controls'
      },
      {
        category: 'Incident Response',
        level: 'medium',
        score: 6.5,
        mitigation: 'Conduct regular tabletop exercises and update response procedures'
      }
    ]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'investigating': return <Eye className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-500';
      case 'non-compliant': return 'text-red-500';
      case 'review-required': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'decision-broadcast': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'context-sync': return <Network className="w-4 h-4 text-purple-500" />;
      case 'direct-message': return <Eye className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Zentix Security Dashboard</h2>
              <p className="text-muted-foreground">AI-powered security monitoring and compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
            <Lock className="w-4 h-4 text-green-500" />
            <span className="text-sm text-foreground">Security Protocol: Active</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'events', label: 'Security Events', icon: AlertTriangle },
            { id: 'compliance', label: 'Compliance', icon: FileText },
            { id: 'risk', label: 'Risk Assessment', icon: Shield },
            { id: 'collaboration', label: 'Collaboration', icon: Network }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-background/50 text-muted-foreground hover:bg-background/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-5 border border-blue-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Threats</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-5 border border-green-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Compliant Policies</p>
                    <p className="text-2xl font-bold">2/3</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg p-5 border border-purple-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                    <p className="text-2xl font-bold">6.6</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-5 border border-orange-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Actions</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* AIX DNA Information */}
            {agentDNA && (
              <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-lg p-6 border border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Dna className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Agent DNA Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">App Name</p>
                        <p className="font-medium">{agentDNA.meta.app_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Version</p>
                        <p className="font-medium">{agentDNA.meta.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Main Agent</p>
                        <p className="font-medium">{agentDNA.main_agent.id}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {agentDNA.main_agent.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sub Agents</p>
                      <p className="font-medium">{agentDNA.sub_agents.length} configured</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Security Status</h3>
                  <p className="text-muted-foreground mb-4">
                    System security is currently stable with 2 active threats under investigation. 
                    All critical systems are protected with the latest security protocols.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Run Security Scan
                    </button>
                    <button className="px-4 py-2 bg-background/50 text-foreground rounded-lg hover:bg-background/80 transition-colors text-sm font-medium">
                      View Detailed Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Events Tab */}
        {activeTab === 'events' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Security Events</h3>
            <div className="space-y-4">
              {securityEvents.map(event => (
                <div key={event.id} className="bg-background/50 border border-border rounded-lg p-4 hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{event.type}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className="text-sm capitalize">{event.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Compliance Reports</h3>
            <div className="space-y-4">
              {complianceReports.map((report, index) => (
                <div key={index} className="bg-background/50 border border-border rounded-lg p-4 hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-foreground">{report.policy}</h4>
                    <span className={`text-sm font-medium ${getComplianceColor(report.status)}`}>
                      {report.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">Last checked: {report.lastChecked}</span>
                    <span className="text-sm text-muted-foreground">{report.issues} issues</span>
                  </div>
                  {report.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Recommendations:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 'risk' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Risk Assessment</h3>
            <div className="space-y-4">
              {riskAssessments.map((risk, index) => (
                <div key={index} className="bg-background/50 border border-border rounded-lg p-4 hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{risk.category}</h4>
                    <span className={`text-sm font-medium ${getSeverityColor(risk.level)}`}>
                      {risk.level.toUpperCase()} ({risk.score})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{risk.mitigation}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        risk.level === 'critical' ? 'bg-red-500' : 
                        risk.level === 'high' ? 'bg-orange-500' : 
                        risk.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${risk.score * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Agent Collaboration</h3>
            <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 rounded-lg p-6 border border-blue-500/20 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Quantum Synchronization</h3>
                  <p className="text-muted-foreground mb-4">
                    Real-time collaboration between agents through the Quantum Synchronizer. 
                    Agents share decisions, context, and messages to maintain a unified security posture.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => {
                        // Simulate a decision broadcast
                        agent.analyzeSecurityRisk({
                          system: "collaboration-test",
                          threats: ["simulation"],
                          assets: ["demo-data"]
                        });
                      }}
                    >
                      Simulate Security Analysis
                    </button>
                    <button 
                      className="px-4 py-2 bg-background/50 text-foreground rounded-lg hover:bg-background/80 transition-colors text-sm font-medium"
                      onClick={() => {
                        // Clear collaboration events
                        setCollaborationEvents([]);
                      }}
                    >
                      Clear Events
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {collaborationEvents.length > 0 ? (
                [...collaborationEvents].reverse().map(event => (
                  <div key={event.id} className="bg-background/50 border border-border rounded-lg p-4 hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventTypeIcon(event.type)}
                        <h4 className="font-semibold text-foreground capitalize">
                          {event.type.replace('-', ' ')}
                        </h4>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">From:</span> {event.from} → <span className="font-medium">To:</span> {event.to}
                    </div>
                    <div className="text-sm bg-black/10 p-2 rounded">
                      <pre className="overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p>No collaboration events yet. Trigger a security analysis to see quantum synchronization in action.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}