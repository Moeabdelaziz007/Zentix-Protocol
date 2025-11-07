import { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Code, 
  Activity, 
  Brain, 
  Zap, 
  MessageSquare, 
  AlertTriangle, 
  Database,
  FileText,
  Bug,
  TestTube,
  Workflow,
  TrendingUp,
  Lightbulb,
  HardDrive,
  Shield,
  Globe,
  Mail,
  Image,
  Plus,
  GitBranch,
  XCircle
} from 'lucide-react';

import { apiService } from '../../services/api';
import type { CodeAnalysisResult } from '../../services/api';

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  history: number[];
}

interface Conversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function AmrikyyApp() {
  const [activeTab, setActiveTab] = useState<'copilot' | 'monitor' | 'orchestrator' | 'skills'>('copilot');
  const [userInput, setUserInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Amrikyy, your system co-pilot. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [metrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, status: 'healthy', history: [30, 35, 40, 45, 42, 45] },
    { name: 'Memory', value: 68, status: 'warning', history: [60, 62, 65, 67, 68, 68] },
    { name: 'Network', value: 22, status: 'healthy', history: [20, 25, 23, 22, 21, 22] },
    { name: 'Disk I/O', value: 15, status: 'healthy', history: [10, 12, 14, 15, 13, 15] }
  ]);
  
  // Coding Intelligence States
  const [editorContent, setEditorContent] = useState(`function calculatePerformanceScore(metrics: SystemMetrics) {
  const { cpu, memory, network } = metrics;
  // Weighted scoring algorithm
  const cpuScore = Math.max(0, 100 - cpu);
  const memoryScore = Math.max(0, 100 - memory);
  const networkScore = Math.max(0, 100 - network * 2);
  
  return (cpuScore * 0.4 + memoryScore * 0.4 + networkScore * 0.2);
}`);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const lastAnalysisTime = useRef<number>(Date.now());

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const newUserMessage: Conversation = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };
    
    setConversations(prev => [...prev, newUserMessage]);
    setUserInput('');
    
    // Call the generateCode API
    try {
      setIsGenerating(true);
      setGenerationError(null);
      
      const result = await apiService.generateCode(userInput, {
        projectName: 'ZentixOS',
        language: 'typescript',
        framework: 'React'
      });
      
      const newAssistantMessage: Conversation = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.explanation + '\n\n```' + result.language + '\n' + result.code + '\n```',
        timestamp: new Date().toISOString()
      };
      
      setConversations(prev => [...prev, newAssistantMessage]);
    } catch (error: unknown) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate code');
      const errorMessage: Conversation = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating code: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString()
      };
      setConversations(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    // In a real implementation, this would connect to speech recognition API
  };

  const analyzeCode = async () => {
    if (!editorContent.trim()) return;
    
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      const result = await apiService.analyzeCode(editorContent, 'typescript', {
        projectName: 'ZentixOS',
        filePath: 'function.ts',
        framework: 'React'
      });
      
      setCodeAnalysis(result);
      lastAnalysisTime.current = Date.now();
    } catch (error: unknown) {
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze code');
      setCodeAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Periodically analyze code (every 30 seconds or after significant changes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only analyze if it's been more than 30 seconds since last analysis
      if (Date.now() - lastAnalysisTime.current > 30000) {
        analyzeCode();
      }
    }, 10000); // Check every 10 seconds
    
    // Initial analysis
    analyzeCode();
    
    return () => clearInterval(interval);
  }, [editorContent]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Activity className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
      case 'security': return <Shield className="w-4 h-4 text-orange-500" />;
      case 'performance': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'maintainability': return <GitBranch className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'high': return 'border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const generateTestCode = () => {
    // In a real implementation, this would create an actual test file
    alert('Test code generated successfully! In a full implementation, this would create a test file in your project.');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Amrikyy - System Co-pilot
        </h2>
        <p className="text-muted-foreground">
          Your OS is now your Co-pilot. It doesn't just respond, it anticipates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'copilot'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Coding Co-pilot
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'monitor'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="w-4 h-4" />
          System Monitor
        </button>
        <button
          onClick={() => setActiveTab('orchestrator')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'orchestrator'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Task Orchestrator
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'skills'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="w-4 h-4" />
          Skill Manager
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'copilot' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Code Assistant
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-blue-500">Auto-Complete</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Intelligent code suggestions as you type
                  </p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4 text-green-500" />
                    <h4 className="font-medium text-green-500">Debug Assistant</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real-time error detection and fixes
                  </p>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="w-4 h-4 text-purple-500" />
                    <h4 className="font-medium text-purple-500">Test Generator</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatic unit test creation
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={generateTestCode}
                  className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Generate Tests
                </button>
                <button className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Explain Code
                </button>
                <button className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm transition-colors flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Optimize
                </button>
                <button 
                  onClick={analyzeCode}
                  disabled={isAnalyzing}
                  className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Analyze Code
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-background/50 border border-border rounded-lg p-4 font-mono text-sm mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">function.ts</span>
                  <span className="text-xs text-muted-foreground">TypeScript</span>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-40 bg-transparent text-foreground focus:outline-none resize-none"
                  placeholder="Enter your code here..."
                />
              </div>
              
              {/* Code Analysis Results */}
              {(isAnalyzing || codeAnalysis || analysisError) && (
                <div className="bg-background/50 border border-border rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Code Analysis Results
                  </h4>
                  
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing your code...</span>
                    </div>
                  )}
                  
                  {analysisError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-500 mb-1">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Analysis Error</span>
                      </div>
                      <p className="text-sm text-red-500">{analysisError}</p>
                    </div>
                  )}
                  
                  {codeAnalysis && !isAnalyzing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-foreground">
                              {codeAnalysis.score}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              codeAnalysis.score >= 80 
                                ? 'bg-green-500/20 text-green-500' 
                                : codeAnalysis.score >= 60 
                                  ? 'bg-yellow-500/20 text-yellow-500' 
                                  : 'bg-red-500/20 text-red-500'
                            }`}>
                              {codeAnalysis.score >= 80 ? 'Excellent' : codeAnalysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {codeAnalysis.issues.length} issues found
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {codeAnalysis.summary}
                      </p>
                      
                      {codeAnalysis.issues.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-foreground text-sm">Issues Detected:</h5>
                          {codeAnalysis.issues.map((issue, index) => (
                            <div 
                              key={index} 
                              className={`p-3 border rounded-lg ${getIssueColor(issue.severity)}`}
                            >
                              <div className="flex items-start gap-2">
                                {getIssueIcon(issue.type)}
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-foreground text-sm capitalize">
                                      {issue.type}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      issue.severity === 'critical' 
                                        ? 'bg-red-500/20 text-red-500' 
                                        : issue.severity === 'high' 
                                          ? 'bg-orange-500/20 text-orange-500' 
                                          : issue.severity === 'medium' 
                                            ? 'bg-yellow-500/20 text-yellow-500' 
                                            : 'bg-blue-500/20 text-blue-500'
                                    }`}>
                                      {issue.severity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {issue.description}
                                  </p>
                                  <p className="text-sm text-foreground mt-2">
                                    <span className="font-medium">Suggestion:</span> {issue.suggestion}
                                  </p>
                                  {issue.codeExample && (
                                    <pre className="mt-2 p-2 bg-background/50 rounded text-xs overflow-x-auto">
                                      {issue.codeExample}
                                    </pre>
                                  )}
                                  <div className="text-xs text-muted-foreground mt-2">
                                    Line {issue.location.line}, Column {issue.location.column}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {codeAnalysis.contextAwareSuggestions.length > 0 && (
                        <div className="pt-2">
                          <h5 className="font-medium text-foreground text-sm mb-2">Suggestions:</h5>
                          <ul className="space-y-1">
                            {codeAnalysis.contextAwareSuggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Context Aware Suggestions */}
              {codeAnalysis && codeAnalysis.contextAwareSuggestions.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-blue-500">Context-Aware Suggestions</h4>
                  </div>
                  <ul className="space-y-2">
                    {codeAnalysis.contextAwareSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversation
              </h3>
              
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {conversations.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary/10 border border-primary/20 ml-8' 
                        : 'bg-background/50 border border-border mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">
                        {msg.role === 'user' ? 'You' : 'Amrikyy'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-foreground">{msg.content}</p>
                  </div>
                ))}
                
                {/* Generation Status */}
                {isGenerating && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mr-8">
                    <div className="flex items-center gap-2 text-blue-500">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  </div>
                )}
                
                {/* Generation Error */}
                {generationError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mr-8">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Generation Error</span>
                    </div>
                    <p className="mt-1 text-sm text-red-500">{generationError}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Amrikyy anything about your system..."
                  className="flex-1 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={handleVoiceCommand}
                  className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-background/50 border border-border hover:bg-background/70'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-background/50 border border-border rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-foreground">{metric.name}</h3>
                    <div className={getStatusColor(metric.status)}>
                      {getStatusIcon(metric.status)}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{metric.value}%</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>{metric.history[metric.history.length - 1] - metric.history[metric.history.length - 2]}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health Overview
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <h4 className="font-medium text-green-500">All Systems Operational</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No critical issues detected. System performance is within normal parameters.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <h4 className="font-medium text-yellow-500">Memory Usage Warning</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Memory usage at 68%. Consider optimizing applications or adding more RAM.
                  </p>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-blue-500">Optimization Suggestion</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "I've noticed that the Creator Studio app is using more resources than usual. 
                    Would you like me to optimize its performance or restart the service?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orchestrator' && (
          <div>
            <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Active Tasks
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-background/50 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-foreground">Video Creation Pipeline</h4>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded">
                      Running
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">65%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Coordinated by Creator Studio → Zentix Forge → Luna Travel Agent
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-foreground">System Health Report</h4>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">100%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Generated by Guardians Control → Healer Dashboard
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-foreground">Data Analysis Request</h4>
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">0%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Waiting for resource allocation
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Workflow Optimization
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-blue-500">Parallel Processing</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    "I can run image search and script generation simultaneously to reduce total processing time by 40%."
                  </p>
                  <button className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded transition-colors">
                    Apply Optimization
                  </button>
                </div>
                
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-purple-500" />
                    <h4 className="font-medium text-purple-500">Memory Management</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    "I've detected that caching frequently used assets can reduce memory usage by 25%."
                  </p>
                  <button className="text-xs px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 rounded transition-colors">
                    Implement Caching
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Available Skills
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium text-foreground">Web Search</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Search the web for information and resources
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Used by 12 agents</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-green-500" />
                    <h4 className="font-medium text-foreground">Email</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send and receive emails
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Used by 8 agents</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4 text-purple-500" />
                    <h4 className="font-medium text-foreground">Image Generation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create images from text descriptions
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Used by 15 agents</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-yellow-500" />
                    <h4 className="font-medium text-foreground">Database</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Query and manipulate databases
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Used by 6 agents</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-red-500" />
                    <h4 className="font-medium text-foreground">Code Execution</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Execute and test code snippets
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Used by 4 agents</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-background/50 border border-dashed border-border rounded-lg hover:border-primary/50 transition-colors flex items-center justify-center">
                  <div className="text-center">
                    <Plus className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Add New Skill</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discover skills in the marketplace
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Skill Acquisition
              </h3>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <h4 className="font-medium text-blue-500">Automatic Skill Learning</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  "I noticed you're trying to post to Twitter, but I don't have that skill yet. 
                  I can search the Skill Forge marketplace or learn to build this skill. 
                  Would you like me to try learning it now?"
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                    Learn Skill
                  </button>
                  <button className="px-3 py-1 bg-background/50 border border-border text-sm rounded-lg hover:bg-background/70 transition-colors">
                    Search Marketplace
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}