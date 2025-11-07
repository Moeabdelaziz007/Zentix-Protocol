import { useState } from 'react';
import {
  Link,
  Bot,
  MessageSquare,
  Zap,
  Settings,
  Plus,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Telegram,
  Phone,
  Monitor,
  Database,
  Send,
  Command,
  Clock,
  User,
  Brain
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Bridge {
  id: string;
  name: string;
  platform: 'telegram' | 'whatsapp' | 'discord' | 'slack' | 'custom';
  agentId: string;
  agentName: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  lastActive: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  meritScore: number;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  authType: string;
}

export function NexusBridgeApp() {
  const [activeTab, setActiveTab] = useState<'bridges' | 'builder' | 'remote'>('bridges');
  const [commandHistory, setCommandHistory] = useState<any[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);

  const handleExecuteCommand = async () => {
    if (!commandInput.trim()) return;

    setIsExecutingCommand(true);
    try {
      const result = await apiService.executeRemoteCommand(commandInput);
      setCommandHistory(prev => [...prev, { command: commandInput, success: true, result, timestamp: new Date() }]);
      setCommandInput('');
    } catch (error: any) {
      setCommandHistory(prev => [...prev, { command: commandInput, success: false, error: error.message, timestamp: new Date() }]);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  const [bridges, setBridges] = useState<Bridge[]>([
    {
      id: 'bridge-1',
      name: 'Telegram Assistant',
      platform: 'telegram',
      agentId: 'agent-1',
      agentName: 'Personal Assistant',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'bridge-2',
      name: 'Discord Support Bot',
      platform: 'discord',
      agentId: 'agent-2',
      agentName: 'Customer Support',
      status: 'inactive',
      createdAt: new Date().toISOString(),
      lastActive: new Date(Date.now() - 86400000).toISOString()
    }
  ]);
  
  const [agents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Personal Assistant',
      description: 'General purpose AI assistant',
      meritScore: 842
    },
    {
      id: 'agent-2',
      name: 'Customer Support',
      description: 'Specialized in customer service',
      meritScore: 915
    },
    {
      id: 'agent-3',
      name: 'Content Creator',
      description: 'Expert in video and content creation',
      meritScore: 763
    }
  ]);
  
  const [platforms] = useState<Platform[]>([
    {
      id: 'telegram',
      name: 'Telegram Bot',
      icon: <Telegram className="w-5 h-5" />,
      description: 'Connect to Telegram bots for messaging',
      authType: 'API Token'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: <Phone className="w-5 h-5" />,
      description: 'Connect to WhatsApp Business API',
      authType: 'Access Token'
    },
    {
      id: 'discord',
      name: 'Discord Bot',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Connect to Discord bots for servers',
      authType: 'Bot Token'
    },
    {
      id: 'slack',
      name: 'Slack App',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Connect to Slack workspaces',
      authType: 'OAuth Token'
    }
  ]);
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [bridgeName, setBridgeName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createBridge = () => {
    if (!bridgeName.trim() || !selectedPlatform || !selectedAgent || !authToken.trim()) return;
    
    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newBridge: Bridge = {
        id: `bridge-${Date.now()}`,
        name: bridgeName,
        platform: selectedPlatform as any,
        agentId: selectedAgent,
        agentName: agents.find(a => a.id === selectedAgent)?.name || 'Unknown Agent',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      setBridges([...bridges, newBridge]);
      setBridgeName('');
      setSelectedPlatform('');
      setSelectedAgent('');
      setAuthToken('');
      setIsCreating(false);
      setActiveTab('bridges');
    }, 1500);
  };

  const deleteBridge = (bridgeId: string) => {
    setBridges(bridges.filter(bridge => bridge.id !== bridgeId));
  };

  const toggleBridgeStatus = (bridgeId: string) => {
    setBridges(bridges.map(bridge => 
      bridge.id === bridgeId 
        ? { ...bridge, status: bridge.status === 'active' ? 'inactive' : 'active' } 
        : bridge
    ));
  };

  const getPlatformIcon = (platform: string) => {
    const platformObj = platforms.find(p => p.id === platform);
    return platformObj ? platformObj.icon : <Bot className="w-5 h-5" />;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'telegram': return 'text-blue-500';
      case 'whatsapp': return 'text-green-500';
      case 'discord': return 'text-indigo-500';
      case 'slack': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600/10 to-indigo-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Link className="w-6 h-6 text-primary" />
          Nexus Bridge
        </h2>
        <p className="text-muted-foreground">
          Your Agents, Everywhere. Unleash your AI workforce beyond the desktop.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('bridges')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'bridges'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link className="w-4 h-4" />
          Active Bridges
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'builder'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Plus className="w-4 h-4" />
          Bridge Builder
        </button>
        <button
          onClick={() => setActiveTab('remote')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'remote'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Command className="w-4 h-4" />
          Remote Control
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'bridges' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Active Bridges</h3>
              <button
                onClick={() => setActiveTab('builder')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Bridge
              </button>
            </div>

            {bridges.length === 0 ? (
              <div className="text-center py-12">
                <Link className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No bridges created yet</h4>
                <p className="text-muted-foreground mb-4">
                  Create your first bridge to connect your agents to external platforms.
                </p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Bridge
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bridges.map((bridge) => (
                  <div key={bridge.id} className="bg-background/50 border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${getPlatformColor(bridge.platform)}`}>
                          {getPlatformIcon(bridge.platform)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{bridge.name}</h4>
                          <div className="text-xs text-muted-foreground">
                            {bridge.agentName}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleBridgeStatus(bridge.id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          aria-label={bridge.status === 'active' ? "Deactivate bridge" : "Activate bridge"}
                        >
                          {bridge.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteBridge(bridge.id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-red-500"
                          aria-label="Delete bridge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          bridge.status === 'active' ? 'bg-green-500' : 
                          bridge.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm capitalize">{bridge.status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bridge.lastActive).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(bridge.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Bridge Builder</h3>
            
            <div className="bg-background/50 border border-border rounded-xl p-6 mb-6">
              <h4 className="font-medium mb-4">1. Select Platform</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPlatform === platform.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        {platform.icon}
                      </div>
                      <div className="font-medium text-sm">{platform.name}</div>
                      <div className="text-xs text-muted-foreground text-center">
                        {platform.authType}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPlatform && (
              <>
                <div className="bg-background/50 border border-border rounded-xl p-6 mb-6">
                  <h4 className="font-medium mb-4">2. Authentication</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      {platforms.find(p => p.id === selectedPlatform)?.authType}
                    </label>
                    <input
                      type="text"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder={`Enter your ${platforms.find(p => p.id === selectedPlatform)?.authType}`}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Authentication token"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      {selectedPlatform === 'telegram' && (
                        <p>Go to @BotFather on Telegram, create a new bot, and paste the API token here.</p>
                      )}
                      {selectedPlatform === 'whatsapp' && (
                        <p>Obtain your WhatsApp Business API access token from the developer console.</p>
                      )}
                      {selectedPlatform === 'discord' && (
                        <p>Create a new application in Discord Developer Portal and paste the bot token.</p>
                      )}
                      {selectedPlatform === 'slack' && (
                        <p>Create a Slack app and install it to your workspace to get the OAuth token.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 border border-border rounded-xl p-6 mb-6">
                  <h4 className="font-medium mb-4">3. Select Agent</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedAgent === agent.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedAgent(agent.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {agent.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Brain className="w-3 h-3" />
                            <span>{agent.meritScore}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-background/50 border border-border rounded-xl p-6">
                  <h4 className="font-medium mb-4">4. Bridge Configuration</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Bridge Name</label>
                    <input
                      type="text"
                      value={bridgeName}
                      onChange={(e) => setBridgeName(e.target.value)}
                      placeholder="e.g., My Telegram Assistant"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Bridge name"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={createBridge}
                      disabled={isCreating || !bridgeName.trim() || !authToken.trim() || !selectedAgent}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Create Bridge
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'remote' && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Remote Control</h3>
            
            <div className="bg-background/50 border border-border rounded-xl p-6 mb-6">
              <h4 className="font-medium mb-4">Execute Remote Command</h4>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Enter command (e.g., 'open Luna Travel App')"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleExecuteCommand}
                  disabled={isExecutingCommand}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isExecutingCommand ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Executing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Execute
                    </>
                  )}
                </button>
              </div>

              <h4 className="font-medium mb-4">Command History</h4>
              <div className="bg-background border border-border rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm text-muted-foreground">
                {commandHistory.length === 0 ? (
                  <p>No commands executed yet.</p>
                ) : (
                  commandHistory.map((entry, index) => (
                    <div key={index} className="mb-2 pb-2 border-b border-border last:border-b-0">
                      <p className="text-primary-foreground">{`> ${entry.command}`}</p>
                      {entry.success ? (
                        <p className="text-green-500">Success: {JSON.stringify(entry.result)}</p>
                      ) : (
                        <p className="text-red-500">Error: {entry.error}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}