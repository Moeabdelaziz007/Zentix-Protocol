import { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Zap, 
  Database, 
  Bot, 
  Workflow, 
  Plus, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Calendar,
  GitBranch,
  GitMerge,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Brain,
  MessageSquare,
  Video,
  Globe,
  Users,
  Palette,
  Link,
  Code,
  Layers,
  Repeat,
  Timer
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  meritScore: number;
  color: string;
}

interface Application {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface NodeData {
  id: string;
  name: string;
  description: string;
  meritScore?: number;
  color?: string;
  icon?: React.ReactNode;
}

interface Node {
  id: string;
  type: 'agent' | 'app' | 'logic' | 'trigger';
  data: NodeData;
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  lastRun?: string;
  status: 'active' | 'inactive' | 'running' | 'scheduled';
  schedule?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    days?: string[];
  };
}

export function NexusAutomataApp() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'library' | 'workflows' | 'scheduler'>('canvas');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [workflows] = useState<Workflow[]>([
    {
      id: 'workflow-1',
      name: 'Weekly Market Report',
      description: 'AI analysis of stock market trends with presentation',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      status: 'active',
      schedule: {
        type: 'weekly',
        time: '09:00',
        days: ['monday']
      }
    },
    {
      id: 'workflow-2',
      name: 'Content Creation Pipeline',
      description: 'Research, write, and publish social media content',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      status: 'inactive'
    }
  ]);
  
  const [agents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Amrikyy OS',
      description: 'General AI assistant and coordinator',
      meritScore: 920,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'agent-2',
      name: 'CognitoSphere',
      description: 'Knowledge researcher and analyzer',
      meritScore: 875,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'agent-3',
      name: 'Creator Studio',
      description: 'Content and media creator',
      meritScore: 842,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'agent-4',
      name: 'Luna Travel',
      description: 'Travel planning specialist',
      meritScore: 798,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'agent-5',
      name: 'Customer Support',
      description: 'Customer service specialist',
      meritScore: 815,
      color: 'from-orange-500 to-red-500'
    }
  ]);
  
  const [applications] = useState<Application[]>([
    {
      id: 'app-1',
      name: 'Creator Studio',
      icon: <Video className="w-4 h-4" />,
      description: 'Video and content creation'
    },
    {
      id: 'app-2',
      name: 'Cognito Browser',
      icon: <Globe className="w-4 h-4" />,
      description: 'Web research and browsing'
    },
    {
      id: 'app-3',
      name: 'Zentix Forge',
      icon: <Bot className="w-4 h-4" />,
      description: 'AI agent creation and management'
    },
    {
      id: 'app-4',
      name: 'The Chill Room',
      icon: <Users className="w-4 h-4" />,
      description: 'Social hub and collaboration'
    },
    {
      id: 'app-5',
      name: 'Zentix Chameleon',
      icon: <Palette className="w-4 h-4" />,
      description: 'Customization engine'
    },
    {
      id: 'app-6',
      name: 'Nexus Bridge',
      icon: <Link className="w-4 h-4" />,
      description: 'External platform integration'
    }
  ]);
  
  const [logicNodes] = useState([
    {
      id: 'logic-1',
      name: 'IF/ELSE Condition',
      icon: <GitBranch className="w-4 h-4" />,
      description: 'Conditional branching logic'
    },
    {
      id: 'logic-2',
      name: 'Loop',
      icon: <Repeat className="w-4 h-4" />,
      description: 'Repeat tasks in a loop'
    },
    {
      id: 'logic-3',
      name: 'Wait',
      icon: <Timer className="w-4 h-4" />,
      description: 'Pause workflow for specified time'
    }
  ]);
  
  const [triggerNodes] = useState([
    {
      id: 'trigger-1',
      name: 'Schedule Trigger',
      icon: <Clock className="w-4 h-4" />,
      description: 'Trigger workflow on schedule'
    },
    {
      id: 'trigger-2',
      name: 'Email Trigger',
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Trigger workflow on email receipt'
    },
    {
      id: 'trigger-3',
      name: 'Webhook Trigger',
      icon: <Code className="w-4 h-4" />,
      description: 'Trigger workflow on webhook'
    }
  ]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const addNode = (type: Node['type'], data: NodeData) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      data,
      position: { x: 100, y: 100 }
    };
    
    setNodes([...nodes, newNode]);
  };

  const saveWorkflow = () => {
    // In a real implementation, this would save to the backend
    console.log('Saving workflow:', { nodes, edges });
  };
  
  const runWorkflow = () => {
    // In a real implementation, this would execute the workflow
    console.log('Running workflow in', isSandboxMode ? 'sandbox' : 'production', 'mode');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'running': return 'text-blue-500';
      case 'scheduled': return 'text-yellow-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/10 to-indigo-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Workflow className="w-6 h-6 text-primary" />
          Nexus Automata
        </h2>
        <p className="text-muted-foreground">
          The Conductor's Podium. Orchestrate your AI agents into a symphony of automation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'canvas'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GitMerge className="w-4 h-4" />
          Automation Canvas
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'library'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          Node Library
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'workflows'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="w-4 h-4" />
          Saved Workflows
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'scheduler'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Scheduler
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'canvas' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Visual Automation Canvas</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSandboxMode(!isSandboxMode)}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                      isSandboxMode 
                        ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isSandboxMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {isSandboxMode ? 'Sandbox Mode' : 'Production Mode'}
                  </button>
                  <button
                    onClick={saveWorkflow}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Workflow
                  </button>
                  <button
                    onClick={runWorkflow}
                    className="px-3 py-1.5 bg-green-500 text-green-foreground rounded-lg text-sm flex items-center gap-2 hover:bg-green-500/90 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </button>
                </div>
              </div>
              
              <div 
                ref={canvasRef}
                className="flex-1 bg-background/50 border border-border rounded-xl relative overflow-hidden"
                style={{ minHeight: '500px' }}
              >
                {/* Canvas grid background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                
                {/* Canvas content */}
                <div className="relative w-full h-full">
                  {nodes.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <GitMerge className="w-12 h-12 mb-4" />
                      <h4 className="text-lg font-medium mb-2">Empty Canvas</h4>
                      <p className="text-center max-w-md mb-4">
                        Start building your automation workflow by dragging nodes from the library
                      </p>
                      <button
                        onClick={() => setActiveTab('library')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Open Node Library
                      </button>
                    </div>
                  ) : (
                    <div className="p-4">
                      {/* Nodes would be rendered here in a real implementation */}
                      <div className="text-center text-muted-foreground py-12">
                        <div className="flex justify-center gap-8 mb-6">
                          <div className="bg-background border border-border rounded-lg p-4 w-48">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">Amrikyy OS</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Coordinator Agent</p>
                          </div>
                          
                          <div className="flex items-center">
                            <GitBranch className="w-6 h-6 text-muted-foreground" />
                          </div>
                          
                          <div className="bg-background border border-border rounded-lg p-4 w-48">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="w-5 h-5 text-purple-500" />
                              <span className="font-medium">CognitoSphere</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Research Agent</p>
                          </div>
                          
                          <div className="flex items-center">
                            <GitBranch className="w-6 h-6 text-muted-foreground" />
                          </div>
                          
                          <div className="bg-background border border-border rounded-lg p-4 w-48">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="w-5 h-5 text-indigo-500" />
                              <span className="font-medium">Creator Studio</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Content Creator</p>
                          </div>
                        </div>
                        
                        <p className="text-sm">Visual workflow editor - drag and connect nodes to create automation pipelines</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'library' && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-lg font-semibold mb-6">Node Library</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-background/50 border border-border rounded-xl p-5">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Agents
                  </h4>
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div 
                        key={agent.id}
                        className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => addNode('agent', agent)}
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
                
                <div className="bg-background/50 border border-border rounded-xl p-5">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Zentix Applications
                  </h4>
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div 
                        key={app.id}
                        className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => addNode('app', app)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-muted">
                            {app.icon}
                          </div>
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {app.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-background/50 border border-border rounded-xl p-5">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <GitBranch className="w-5 h-5" />
                      Logic Nodes
                    </h4>
                    <div className="space-y-3">
                      {logicNodes.map((node) => (
                        <div 
                          key={node.id}
                          className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => addNode('logic', node)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-muted">
                              {node.icon}
                            </div>
                            <div>
                              <div className="font-medium">{node.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {node.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-background/50 border border-border rounded-xl p-5">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Trigger Nodes
                    </h4>
                    <div className="space-y-3">
                      {triggerNodes.map((node) => (
                        <div 
                          key={node.id}
                          className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => addNode('trigger', node)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-muted">
                              {node.icon}
                            </div>
                            <div>
                              <div className="font-medium">{node.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {node.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'workflows' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Saved Workflows</h3>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Workflow
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="bg-background/50 border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {workflow.description}
                        </p>
                      </div>
                      <div className={`p-1.5 rounded ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(workflow.createdAt).toLocaleDateString()}
                      </div>
                      {workflow.lastRun && (
                        <div className="text-xs text-muted-foreground">
                          Last run {new Date(workflow.lastRun).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {workflow.schedule && (
                      <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg p-2 mb-4">
                        <Clock className="w-3 h-3" />
                        <span>
                          {workflow.schedule.type === 'daily' && `Daily at ${workflow.schedule.time}`}
                          {workflow.schedule.type === 'weekly' && `Weekly on ${workflow.schedule.days?.join(', ')} at ${workflow.schedule.time}`}
                          {workflow.schedule.type === 'monthly' && `Monthly at ${workflow.schedule.time}`}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <button className="text-xs px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        Edit
                      </button>
                      <button className="text-xs px-3 py-1.5 bg-green-500 text-green-foreground rounded-lg hover:bg-green-500/90 transition-colors flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'scheduler' && (
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-6">Workflow Scheduler</h3>
              
              <div className="bg-background/50 border border-border rounded-xl p-6 mb-6">
                <h4 className="font-medium mb-4">Schedule a Workflow</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Workflow</label>
                    <select 
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Select workflow"
                    >
                      <option>Select a workflow</option>
                      {workflows.map((workflow) => (
                        <option key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </option>
                      ))}
                    </select>

                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule Type</label>
                    <select 
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Schedule type"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Custom</option>
                    </select>

                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Schedule time"
                    />

                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Days (for weekly)</label>
                    <div className="flex gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <button 
                          key={day}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Schedule Workflow
                  </button>
                </div>
              </div>
              
              <div className="bg-background/50 border border-border rounded-xl p-6">
                <h4 className="font-medium mb-4">Scheduled Workflows</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-sm font-medium">Workflow</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Schedule</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Next Run</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-3">
                          <div className="font-medium">Weekly Market Report</div>
                          <div className="text-xs text-muted-foreground">AI analysis of stock market</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            Weekly on Monday at 09:00
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm">
                          {new Date(Date.now() + 86400000).toLocaleDateString()} at 09:00
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <button 
                              className="p-1.5 rounded hover:bg-muted transition-colors"
                              aria-label="Pause workflow"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1.5 rounded hover:bg-muted transition-colors text-red-500"
                              aria-label="Delete workflow"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}