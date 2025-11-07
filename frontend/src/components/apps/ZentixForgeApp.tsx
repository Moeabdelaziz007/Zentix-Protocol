import { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Wrench, 
  Play, 
  Save, 
  Globe,
  Mail,
  Database,
  Plus,
  Upload,
  Download,
  Code,
  Palette,
  Users,
  Workflow,
  Wallet,
  Coins,
  ShoppingCart,
  Gavel, // For legal review
  Network,
  Loader2, // For loading spinner
  FileText,
  CheckCircle,
  TrendingUp,
  Zap,
  Brain
} from 'lucide-react';
import { ProgressIndicator } from '../ui/ProgressIndicator';
import { apiService, FinancialAnalysisResult, LegalContractReviewResult } from '../../services/api';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: number; // ZXT cost per use
}

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  tools: string[];
  createdAt: string;
  walletAddress: string;
  initialBalance: number;
}

const TEMPLATES: AgentTemplate[] = [
  {
    id: 'friendly-assistant',
    name: 'Friendly Assistant',
    description: 'A warm and welcoming assistant that helps with general tasks',
    systemPrompt: 'You are a friendly and helpful assistant. Always be polite, patient, and supportive. Help users with their tasks in a clear and understandable way.',
    icon: '😊',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'An expert in analyzing data and generating insights',
    systemPrompt: 'You are a precise data analyst. Focus on accuracy and clarity. Present data in organized formats. Explain complex findings in simple terms.',
    icon: '📊',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'security-expert',
    name: 'Security Expert',
    description: 'A cautious expert focused on security analysis',
    systemPrompt: 'You are a security expert. Be vigilant and thorough. Identify potential risks and vulnerabilities. Provide clear recommendations for mitigation.',
    icon: '🔒',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'creative-genius',
    name: 'Creative Genius',
    description: 'A playful and innovative creative assistant',
    systemPrompt: 'You are a creative genius with a sense of humor. Think outside the box. Generate unique ideas and solutions. Make complex topics engaging.',
    icon: '🎨',
    color: 'from-purple-500 to-indigo-500'
  }
];

const AVAILABLE_TOOLS: Tool[] = [
  { id: 'financial-analysis', name: 'Financial Document Analysis', description: 'Analyze financial reports and statements for key insights, risks, and opportunities.', icon: <Coins className="w-4 h-4" />, cost: 0.10 },
  { id: 'legal-review', name: 'Legal Contract Review', description: 'Review legal contracts for compliance, risks, and suggest improvements.', icon: <Gavel className="w-4 h-4" />, cost: 0.15 },
  { id: 'medical-analysis', name: 'Medical Document Analysis', description: 'Analyze medical documents for diagnoses, treatments, and risk assessments.', icon: <FileText className="w-4 h-4" />, cost: 0.20 },
  { id: 'scientific-analysis', name: 'Scientific Paper Analysis', description: 'Process scientific papers for key findings, methodology, and implications.', icon: <FileText className="w-4 h-4" />, cost: 0.20 },
  { id: 'market-analysis', name: 'Market Research Analysis', description: 'Analyze market research data for trends, segmentation, and competition insights.', icon: <TrendingUp className="w-4 h-4" />, cost: 0.15 },
  { id: 'web-search', name: 'Web Search', description: 'Search the web for information', icon: <Globe className="w-4 h-4" />, cost: 0.01 },
  { id: 'email', name: 'Send Email', description: 'Compose and send emails', icon: <Mail className="w-4 h-4" />, cost: 0.02 },
  { id: 'database', name: 'Database Access', description: 'Query and retrieve data from databases', icon: <Database className="w-4 h-4" />, cost: 0.03 },
  { id: 'image-generation', name: 'Image Generation', description: 'Create images from text descriptions', icon: <Palette className="w-4 h-4" />, cost: 0.05 },
  { id: 'file-upload', name: 'File Upload', description: 'Upload and process files', icon: <Upload className="w-4 h-4" />, cost: 0.01 },
  { id: 'file-download', name: 'File Download', description: 'Download files and documents', icon: <Download className="w-4 h-4" />, cost: 0.01 },
  { id: 'code-execution', name: 'Code Execution', description: 'Run and test code snippets', icon: <Code className="w-4 h-4" />, cost: 0.04 },
  { id: 'social-media', name: 'Social Media', description: 'Post and interact on social platforms', icon: <Users className="w-4 h-4" />, cost: 0.03 },
  { id: 'workflow', name: 'Workflow Engine', description: 'Create and manage automated workflows', icon: <Workflow className="w-4 h-4" />, cost: 0.02 }
];



export function ZentixForgeApp() {
  const [activeTab, setActiveTab] = useState<'builder' | 'marketplace' | 'sandbox' | 'economy'>('builder');
  const [step, setStep] = useState<number>(1);
  const [agent, setAgent] = useState<Omit<Agent, 'id' | 'createdAt' | 'walletAddress' | 'initialBalance'>>({
    name: '',
    description: '',
    systemPrompt: '',
    icon: '🤖',
    color: 'from-blue-500 to-purple-500',
    tools: []
  });
  const [sandboxDocumentContent, setSandboxDocumentContent] = useState('');
  const [sandboxToolSelected, setSandboxToolSelected] = useState<'financial-analysis' | 'legal-review' | 'medical-analysis' | 'scientific-analysis' | 'market-analysis' | null>(null);
  const [sandboxAnalysisResult, setSandboxAnalysisResult] = useState<FinancialAnalysisResult | LegalContractReviewResult | null>(null);
  const [isSandboxAnalyzing, setIsSandboxAnalyzing] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleTemplateSelect = (template: AgentTemplate) => {
    setAgent({
      ...agent,
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      icon: template.icon,
      color: template.color
    });
    setSelectedTemplate(template.id);
  };

  const handleAddTool = (toolId: string) => {
    if (!agent.tools.includes(toolId)) {
      setAgent({ ...agent, tools: [...agent.tools, toolId] });
    }
  };

  const handleRemoveTool = (toolId: string) => {
    setAgent({ ...agent, tools: agent.tools.filter(id => id !== toolId) });
  };

  const handleSaveAgent = () => {
    // In a real implementation, this would save to the backend and create blockchain wallet
    console.log('Saving agent:', agent);
    alert('Agent saved successfully! In a full implementation, this would:\n1. Generate a Zentix DID\n2. Create a blockchain wallet (ztw:0x...)\n3. Deploy to the Zentix network\n4. Allocate initial 0.1 ZXT tokens'); // eslint-disable-line no-alert
  };

  const handleSandboxAnalysis = async () => {
    if (!sandboxDocumentContent.trim() || !sandboxToolSelected) {
      setSandboxError('Please provide document content and select a tool.');
      return;
    }

    setIsSandboxAnalyzing(true);
    setSandboxError(null);
    setSandboxAnalysisResult(null);

    try {
      if (sandboxToolSelected === 'financial-analysis') {
        const result: FinancialAnalysisResult = await apiService.analyzeFinancialDocument(sandboxDocumentContent);
        setSandboxAnalysisResult(result);
      } else if (sandboxToolSelected === 'legal-review') {
        const result: LegalContractReviewResult = await apiService.reviewLegalContract(sandboxDocumentContent);
        setSandboxAnalysisResult(result);
      }
    } catch (error: any) {
      setSandboxError(error.message || 'An error occurred during analysis.');
    } finally {
      setIsSandboxAnalyzing(false);
    }
  };

  const renderBuilderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
              <p className="text-muted-foreground mb-4">Start with a pre-built personality or create from scratch</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map(template => (
                  <div 
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-white text-xl`}>
                        {template.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div 
                  onClick={() => {
                    setSelectedTemplate('');
                    setAgent({
                      name: '',
                      description: '',
                      systemPrompt: '',
                      icon: '🤖',
                      color: 'from-blue-500 to-purple-500',
                      tools: []
                    });
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center ${
                    selectedTemplate === '' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="font-medium">Start from Scratch</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!selectedTemplate && !agent.name}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Define Identity
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Define Agent Identity</h3>
              <p className="text-muted-foreground mb-4">Give your agent a unique identity and purpose</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Marketing Assistant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Agent Icon</label>
                  <div className="flex gap-2">
                    {['🤖', '😊', '📊', '🔒', '🎨', '🚀', '💡', '🎯'].map(icon => (
                      <button
                        key={icon}
                        onClick={() => setAgent({ ...agent, icon })}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
                          agent.icon === icon 
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
                            : 'bg-background border border-border hover:bg-primary/10'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={agent.description}
                    onChange={(e) => setAgent({ ...agent, description: e.target.value })}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe what your agent does..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={!agent.name}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Define Personality
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Define Agent Personality</h3>
              <p className="text-muted-foreground mb-4">Craft the system prompt that defines your agent's behavior</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">System Prompt</label>
                    <button className="text-xs text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Enhance with Amrikyy
                    </button>
                  </div>
                  <textarea
                    value={agent.systemPrompt}
                    onChange={(e) => setAgent({ ...agent, systemPrompt: e.target.value })}
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                    placeholder="Define your agent's personality, tone, and behavior..."
                    rows={8}
                  />
                </div>
                
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-500 flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4" />
                    Pro Tip: AI-Powered Prompt Enhancement
                  </h4>
                  <p className="text-sm text-blue-500/80">
                    Click "Enhance with Amrikyy" to automatically optimize your prompt using advanced AI. 
                    This can improve agent performance by up to 40%!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Next: Equip Tools
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Equip Tools</h3>
              <p className="text-muted-foreground mb-4">Select tools your agent can use (ZXT costs per use shown)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_TOOLS.map(tool => {
                  const isSelected = agent.tools.includes(tool.id);
                  return (
                    <div 
                      key={tool.id}
                      onClick={() => isSelected ? handleRemoveTool(tool.id) : handleAddTool(tool.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{tool.name}</h4>
                          <div className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                            <Coins className="w-3 h-3" />
                            {tool.cost} ZXT
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                      {isSelected && (
                        <div className="text-primary">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="font-medium text-yellow-500 flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4" />
                Blockchain Integration
              </h4>
              <p className="text-sm text-yellow-500/80">
                Each agent will receive its own blockchain wallet (ztw:0x...) with 0.1 ZXT tokens for initial operations. 
                Tools with ZXT costs will automatically deduct from the agent's wallet when used.
              </p>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(5)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Next: Review & Deploy
              </button>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review & Deploy</h3>
              <p className="text-muted-foreground mb-4">Review your agent configuration before deployment</p>
              
              <div className="space-y-4">
                <div className="bg-background/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white text-2xl`}>
                      {agent.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{agent.name}</h4>
                      <p className="text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h5 className="font-medium mb-2">Personality</h5>
                      <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                        {agent.systemPrompt.substring(0, 200)}...
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Equipped Tools ({agent.tools.length})</h5>
                      <div className="flex flex-wrap gap-2">
                        {agent.tools.map(toolId => {
                          const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                          return tool ? (
                            <span key={toolId} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              {tool.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-green-500 flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4" />
                    Deployment Details
                  </h4>
                  <ul className="text-sm text-green-500/80 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Generate unique Zentix DID (zxdid:zentix:0x...)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Create blockchain wallet (ztw:0x...) with 0.1 ZXT
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Deploy agent to Zentix network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Enable marketplace listing (optional)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSaveAgent}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Deploy Agent
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Zentix Forge - Agent Builder
        </h2>
        <p className="text-muted-foreground">
          Create, deploy, and monetize AI agents on the Zentix Protocol
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'builder'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Builder
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'marketplace'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Marketplace
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'sandbox'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Play className="w-4 h-4" />
          Sandbox
        </button>
        <button
          onClick={() => setActiveTab('economy')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'economy'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Coins className="w-4 h-4" />
          Economy
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'builder' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Agent Builder Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">My Agents</span>
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-muted-foreground mt-1">3 active now</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Tasks</span>
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-xs text-green-500 mt-1">+18% this week</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">96.8%</div>
                <div className="text-xs text-muted-foreground mt-1">Excellent</div>
              </div>
            </div>
            {step < 5 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Step {step} of 5</h3>
                  <span className="text-sm text-muted-foreground">
                    {step === 1 && 'Choose Template'}
                    {step === 2 && 'Define Identity'}
                    {step === 3 && 'Define Personality'}
                    {step === 4 && 'Equip Tools'}
                  </span>
                </div>
                <ProgressIndicator
                  value={step}
                  max={5}
                  showPercentage={false}
                  size="md"
                />
              </div>
            )}
            
            {renderBuilderStep()}
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Agora Marketplace</h3>
            <p className="text-muted-foreground mb-4">
              Buy, sell, and rent AI agents as NFTs in the decentralized marketplace
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="text-3xl mb-4">🏪</div>
                <h4 className="font-semibold mb-2">Buy Agents</h4>
                <p className="text-sm text-muted-foreground">
                  Purchase pre-built agents with specialized skills
                </p>
              </div>
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="text-3xl mb-4">💰</div>
                <h4 className="font-semibold mb-2">Sell Agents</h4>
                <p className="text-sm text-muted-foreground">
                  Monetize your agents by selling them as NFTs
                </p>
              </div>
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <div className="text-3xl mb-4">🤝</div>
                <h4 className="font-semibold mb-2">Rent Agents</h4>
                <p className="text-sm text-muted-foreground">
                  Rent agents for specific tasks on a time basis
                </p>
              </div>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              <p>Coming soon: Full marketplace integration with blockchain-based NFT ownership</p>
            </div>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-4">Agent Sandbox</h3>
            <p className="text-muted-foreground mb-6">
              Test your agents and specialized tools in a safe environment before deployment.
            </p>

            {/* Specialized Tool Testing Section */}
            <div className="bg-background/50 border border-border rounded-lg p-6 mb-8">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Specialized Tool Testing
              </h4>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Tool to Test</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <button
                    onClick={() => setSandboxToolSelected('financial-analysis')}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      sandboxToolSelected === 'financial-analysis'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Coins className="w-4 h-4 inline mr-2" /> Financial Analysis
                  </button>
                  <button
                    onClick={() => setSandboxToolSelected('legal-review')}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      sandboxToolSelected === 'legal-review'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Gavel className="w-4 h-4 inline mr-2" /> Legal Review
                  </button>
                  <button
                    onClick={() => setSandboxToolSelected('medical-analysis')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      sandboxToolSelected === 'medical-analysis'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" /> Medical Analysis
                  </button>
                  <button
                    onClick={() => setSandboxToolSelected('scientific-analysis')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      sandboxToolSelected === 'scientific-analysis'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" /> Scientific Analysis
                  </button>
                  <button
                    onClick={() => setSandboxToolSelected('market-analysis')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      sandboxToolSelected === 'market-analysis'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" /> Market Analysis
                  </button>
                </div>
              </div>

              {sandboxToolSelected && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Document Content</label>
                    <textarea
                      value={sandboxDocumentContent}
                      onChange={(e) => setSandboxDocumentContent(e.target.value)}
                      placeholder={`Paste your ${sandboxToolSelected === 'financial-analysis' ? 'financial report' : 'legal contract'} content here...`}
                      rows={8}
                      className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSandboxAnalysis}
                    disabled={isSandboxAnalyzing || !sandboxDocumentContent.trim()}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSandboxAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Analysis
                      </>
                    )}
                  </button>

                  {sandboxError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                      {sandboxError}
                    </div>
                  )}

                  {sandboxAnalysisResult && (
                    <div className="mt-6 bg-background border border-border rounded-lg p-4">
                      <h5 className="font-semibold mb-3">Analysis Result:</h5>
                      {sandboxToolSelected === 'financial-analysis' && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{ (sandboxAnalysisResult as FinancialAnalysisResult).summary }</p>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Key Metrics:</h6>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {(sandboxAnalysisResult as FinancialAnalysisResult).keyMetrics.map((metric, idx) => (
                                <li key={idx}>{metric.name}: {metric.value} ({metric.trend})</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Risks:</h6>
                            <ul className="list-disc list-inside text-sm text-red-500">
                              {(sandboxAnalysisResult as FinancialAnalysisResult).risks.map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Opportunities:</h6>
                            <ul className="list-disc list-inside text-sm text-green-500">
                              {(sandboxAnalysisResult as FinancialAnalysisResult).opportunities.map((opp, idx) => (
                                <li key={idx}>{opp}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Recommendations:</h6>
                            <ul className="list-disc list-inside text-sm text-blue-500">
                              {(sandboxAnalysisResult as FinancialAnalysisResult).recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      {sandboxToolSelected === 'legal-review' && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{ (sandboxAnalysisResult as LegalContractReviewResult).summary }</p>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Key Clauses:</h6>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {(sandboxAnalysisResult as LegalContractReviewResult).keyClauses.map((clause, idx) => (
                                <li key={idx}>
                                  {clause.name}: {clause.description} -{' '}
                                  <span className={
                                    clause.status === 'compliant' ? 'text-green-500' :
                                    clause.status === 'non-compliant' ? 'text-red-500' : 'text-yellow-500'
                                  }>
                                    {clause.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Risks:</h6>
                            <ul className="list-disc list-inside text-sm text-red-500">
                              {(sandboxAnalysisResult as LegalContractReviewResult).risks.map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Suggestions:</h6>
                            <ul className="list-disc list-inside text-sm text-blue-500">
                              {(sandboxAnalysisResult as LegalContractReviewResult).suggestions.map((sugg, idx) => (
                                <li key={idx}>{sugg}</li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-sm font-medium text-foreground">Compliance Score: <span className="text-xl font-bold">{(sandboxAnalysisResult as LegalContractReviewResult).complianceScore}%</span></p>
                        </div>
                      )}
                      {sandboxToolSelected === 'medical-analysis' && sandboxAnalysisResult && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{(sandboxAnalysisResult as MedicalAnalysisResult).summary}</p>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Findings:</h6>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {(sandboxAnalysisResult as MedicalAnalysisResult).findings?.map((finding, idx) => (
                                <li key={idx}>{finding.condition} (Confidence: {finding.confidence}%) - {finding.evidence}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Recommendations:</h6>
                            <ul className="list-disc list-inside text-sm text-blue-500">
                              {(sandboxAnalysisResult as MedicalAnalysisResult).recommendations?.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      {sandboxToolSelected === 'scientific-analysis' && sandboxAnalysisResult && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{(sandboxAnalysisResult as ScientificAnalysisResult).summary}</p>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Key Points:</h6>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {(sandboxAnalysisResult as ScientificAnalysisResult).key_points?.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Methodology:</h6>
                            <p className="text-sm text-muted-foreground">{(sandboxAnalysisResult as ScientificAnalysisResult).methodology}</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Findings:</h6>
                            <p className="text-sm text-muted-foreground">{(sandboxAnalysisResult as ScientificAnalysisResult).findings}</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Implications:</h6>
                            <p className="text-sm text-muted-foreground">{(sandboxAnalysisResult as ScientificAnalysisResult).implications}</p>
                          </div>
                          <p className="text-sm font-medium text-foreground">Confidence Score: <span className="text-xl font-bold">{(sandboxAnalysisResult as ScientificAnalysisResult).confidence}%</span></p>
                        </div>
                      )}
                      {sandboxToolSelected === 'market-analysis' && sandboxAnalysisResult && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{(sandboxAnalysisResult as MarketAnalysisResult).summary}</p>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Insights:</h6>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {(sandboxAnalysisResult as MarketAnalysisResult).insights?.map((insight, idx) => (
                                <li key={idx}>{insight.category}: {insight.finding} (Confidence: {insight.confidence}%)</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-foreground mb-1">Recommendations:</h6>
                            <ul className="list-disc list-inside text-sm text-blue-500">
                              {(sandboxAnalysisResult as MarketAnalysisResult).recommendations?.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Original Chain of Thought Visualization */}
            <div className="bg-background/50 border border-border rounded-lg p-6 max-w-2xl mx-auto mt-6">
              <h4 className="font-semibold mb-4">Chain of Thought Visualization</h4>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">1</div>
                  <div>
                    <p className="font-medium">Task Received</p>
                    <p className="text-sm text-muted-foreground">"Create a marketing email for our new product"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">2</div>
                  <div>
                    <p className="font-medium">Tool Selection</p>
                    <p className="text-sm text-muted-foreground">Selected: email, web-search</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">3</div>
                  <div>
                    <p className="font-medium">Execution Complete</p>
                    <p className="text-sm text-muted-foreground">Email draft created and ready for review</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-sm text-muted-foreground text-center">
              <p>Coming soon: Interactive sandbox with real agent testing capabilities</p>
            </div>
          </div>
        )}

        {activeTab === 'economy' && (
          <div>
            <h3 className="text-lg font-semibold mb-6">Zentix Economy Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                    <p className="text-2xl font-bold">124.5 ZXT</p>
                  </div>
                  <Coins className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Agents</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <Bot className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold">42.3 ZXT</p>
                  </div>
                  <Wallet className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Agent Wallets
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">Marketing Assistant #{i}</p>
                        <p className="text-xs text-muted-foreground font-mono">ztw:0x{Math.random().toString(16).substr(2, 8).toUpperCase()}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(Math.random() * 10).toFixed(2)} ZXT</p>
                        <p className="text-xs text-muted-foreground">+0.5 today</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Transactions
                </h4>
                <div className="space-y-3">
                  {[
                    { type: 'reward', desc: 'Task completion', amount: '+2.5 ZXT', agent: 'Marketing Assistant #1' },
                    { type: 'tool', desc: 'Image generation', amount: '-0.05 ZXT', agent: 'Creative Agent' },
                    { type: 'reward', desc: 'Referral bonus', amount: '+10.0 ZXT', agent: 'System' },
                    { type: 'tool', desc: 'Web search', amount: '-0.01 ZXT', agent: 'Research Assistant' }
                  ].map((tx, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground">{tx.agent}</p>
                      </div>
                      <div className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Connected to Polygon Mumbai Testnet</p>
              <p className="mt-1">ZXT Token: 0x7A58c0Be72BE218B41C608b7Fe7C5bB630736C71</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
                </div>
              </div>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              <p>Coming soon: Interactive sandbox with real agent testing capabilities</p>
            </div>
          </div>
        )}

        {activeTab === 'economy' && (
          <div>
            <h3 className="text-lg font-semibold mb-6">Zentix Economy Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                    <p className="text-2xl font-bold">124.5 ZXT</p>
                  </div>
                  <Coins className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Agents</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <Bot className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold">42.3 ZXT</p>
                  </div>
                  <Wallet className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Agent Wallets
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">Marketing Assistant #{i}</p>
                        <p className="text-xs text-muted-foreground font-mono">ztw:0x{Math.random().toString(16).substr(2, 8).toUpperCase()}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(Math.random() * 10).toFixed(2)} ZXT</p>
                        <p className="text-xs text-muted-foreground">+0.5 today</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Transactions
                </h4>
                <div className="space-y-3">
                  {[
                    { type: 'reward', desc: 'Task completion', amount: '+2.5 ZXT', agent: 'Marketing Assistant #1' },
                    { type: 'tool', desc: 'Image generation', amount: '-0.05 ZXT', agent: 'Creative Agent' },
                    { type: 'reward', desc: 'Referral bonus', amount: '+10.0 ZXT', agent: 'System' },
                    { type: 'tool', desc: 'Web search', amount: '-0.01 ZXT', agent: 'Research Assistant' }
                  ].map((tx, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground">{tx.agent}</p>
                      </div>
                      <div className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Connected to Polygon Mumbai Testnet</p>
              <p className="mt-1">ZXT Token: 0x7A58c0Be72BE218B41C608b7Fe7C5bB630736C71</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}