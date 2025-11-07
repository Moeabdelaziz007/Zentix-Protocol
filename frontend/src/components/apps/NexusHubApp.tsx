import { useState } from 'react';
import { 
  Grid, 
  Plus, 
  Save, 
  Upload, 
  Download, 
  Bot, 
  TextCursor, 
  Square, 
  RectangleHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Share2,
  Zap,
  Database,
  Layers,
  Component,
  AppWindow,
  WorkflowIcon,
  FileText,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { SmartSearch } from '../ui/SmartSearch';

interface ComponentItem {
  id: string;
  type: 'input' | 'button' | 'textarea' | 'image' | 'dropdown' | 'agent-slot' | 'label';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
}

interface Agent {
  id: string;
  name: string;
  zentixId: string;
  description: string;
  skills: string[];
}

interface WorkflowStep {
  id: string;
  trigger: {
    componentId: string;
    action: string;
  };
  action: {
    agentId: string;
    task: string;
  };
  output: {
    componentId: string;
  };
}

interface AppProject {
  id: string;
  name: string;
  description: string;
  components: ComponentItem[];
  agents: Agent[];
  workflows: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export function NexusHubApp() {
  const [activeTab, setActiveTab] = useState<'builder' | 'marketplace' | 'my-apps'>('builder');
  const [projects] = useState<AppProject[]>([
    {
      id: 'project-1',
      name: 'Tweet Generator',
      description: 'Generate marketing tweets using AI agents',
      components: [
        { id: 'comp-1', type: 'input', name: 'Tweet Topic', x: 50, y: 50, width: 300, height: 40, properties: { placeholder: 'Enter tweet topic...' } },
        { id: 'comp-2', type: 'button', name: 'Generate Tweet', x: 50, y: 120, width: 120, height: 40, properties: { text: 'Generate' } },
        { id: 'comp-3', type: 'textarea', name: 'Suggested Tweets', x: 50, y: 190, width: 500, height: 200, properties: { placeholder: 'Generated tweets will appear here...' } },
        { id: 'comp-4', type: 'agent-slot', name: 'TweetMaster Agent', x: 400, y: 50, width: 150, height: 80, properties: { zentixId: 'agent-123' } }
      ],
      agents: [
        { id: 'agent-1', name: 'TweetMaster', zentixId: 'agent-123', description: 'Marketing tweet generator', skills: ['writing', 'social-media'] }
      ],
      workflows: [
        {
          id: 'wf-1',
          trigger: { componentId: 'comp-2', action: 'click' },
          action: { agentId: 'agent-1', task: 'Write 3 engaging tweets about the topic in "Tweet Topic"' },
          output: { componentId: 'comp-3' }
        }
      ],
      createdAt: '2025-11-06T10:00:00Z',
      updatedAt: '2025-11-06T10:00:00Z'
    }
  ]);
  
  const [currentProject, setCurrentProject] = useState<AppProject>(projects[0]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentItem | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [toolboxTab, setToolboxTab] = useState<'components' | 'agents' | 'logic'>('components');

  const componentLibrary = [
    { type: 'input', name: 'Text Input', icon: <TextCursor className="w-4 h-4" /> },
    { type: 'button', name: 'Button', icon: <Square className="w-4 h-4" /> },
    { type: 'textarea', name: 'Text Area', icon: <RectangleHorizontal className="w-4 h-4" /> },
    { type: 'dropdown', name: 'Dropdown', icon: <Layers className="w-4 h-4" /> },
    { type: 'image', name: 'Image Viewer', icon: <FileText className="w-4 h-4" /> },
    { type: 'label', name: 'Label', icon: <FileText className="w-4 h-4" /> },
    { type: 'agent-slot', name: 'Agent Slot', icon: <Bot className="w-4 h-4" /> }
  ];

  const agentTemplates = [
    { id: 'template-1', name: 'TweetMaster', description: 'Marketing tweet generator', skills: ['writing', 'social-media'] },
    { id: 'template-2', name: 'ContentCurator', description: 'Content research and curation', skills: ['research', 'writing'] },
    { id: 'template-3', name: 'DataAnalyzer', description: 'Data analysis and insights', skills: ['analytics', 'visualization'] }
  ];

  const handleAddComponent = (type: ComponentItem['type']) => {
    const newComponent: ComponentItem = {
      id: `comp-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${currentProject.components.filter(c => c.type === type).length + 1}`,
      x: 100,
      y: 100,
      width: type === 'button' ? 100 : type === 'input' || type === 'dropdown' ? 200 : 300,
      height: type === 'button' || type === 'input' || type === 'dropdown' ? 40 : type === 'agent-slot' ? 80 : 150,
      properties: {}
    };
    
    setCurrentProject({
      ...currentProject,
      components: [...currentProject.components, newComponent]
    });
  };

  const handleDeleteComponent = (id: string) => {
    setCurrentProject({
      ...currentProject,
      components: currentProject.components.filter(c => c.id !== id)
    });
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const handleComponentClick = (component: ComponentItem) => {
    setSelectedComponent(component);
  };

  const renderComponent = (component: ComponentItem) => {
    const isSelected = selectedComponent?.id === component.id;
    
    switch (component.type) {
      case 'input':
        return (
          <input
            type="text"
            placeholder={component.properties.placeholder || 'Enter text...'}
            className="w-full h-full px-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            onClick={() => handleComponentClick(component)}
          />
        );
      case 'button':
        return (
          <button
            className="w-full h-full bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
            onClick={() => handleComponentClick(component)}
          >
            {component.properties.text || component.name}
          </button>
        );
      case 'textarea':
        return (
          <textarea
            placeholder={component.properties.placeholder || 'Enter text...'}
            className="w-full h-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            onClick={() => handleComponentClick(component)}
          />
        );
      case 'agent-slot':
        return (
          <div 
            className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-2 ${
              isSelected ? 'border-primary bg-primary/10' : 'border-border'
            }`}
            onClick={() => handleComponentClick(component)}
          >
            <Bot className="w-6 h-6 text-primary mb-2" />
            <div className="text-sm font-medium text-foreground">{component.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {component.properties.zentixId || 'No agent assigned'}
            </div>
          </div>
        );
      case 'label':
        return (
          <div 
            className="w-full h-full flex items-center"
            onClick={() => handleComponentClick(component)}
          >
            <span className="text-foreground">{component.name}</span>
          </div>
        );
      default:
        return (
          <div 
            className={`w-full h-full border border-border rounded-md flex items-center justify-center ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleComponentClick(component)}
          >
            <Component className="w-6 h-6 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Grid className="w-6 h-6 text-primary" />
          Nexus Hub - App Builder & Agent Integration
        </h2>
        <p className="text-muted-foreground">
          Your Agents, Your Apps, Your Rules. The power to automate anything.
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
          <AppWindow className="w-4 h-4" />
          App Builder
        </button>
        <button
          onClick={() => setActiveTab('my-apps')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'my-apps'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="w-4 h-4" />
          My Apps
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'marketplace'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Marketplace
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'builder' && (
          <div className="h-full flex animate-fade-in">
            {/* Left Sidebar - Toolbox */}
            <div className="w-64 border-r border-border/50 bg-background/50 flex flex-col">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Toolbox</h3>
                <div className="flex gap-1 bg-background/50 rounded-lg p-1">
                  <button
                    onClick={() => setToolboxTab('components')}
                    className={`flex-1 py-2 text-xs rounded-md transition-colors ${
                      toolboxTab === 'components' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-background/70'
                    }`}
                  >
                    Components
                  </button>
                  <button
                    onClick={() => setToolboxTab('agents')}
                    className={`flex-1 py-2 text-xs rounded-md transition-colors ${
                      toolboxTab === 'agents' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-background/70'
                    }`}
                  >
                    Agents
                  </button>
                  <button
                    onClick={() => setToolboxTab('logic')}
                    className={`flex-1 py-2 text-xs rounded-md transition-colors ${
                      toolboxTab === 'logic' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-background/70'
                    }`}
                  >
                    Logic
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {toolboxTab === 'components' && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">UI Components</h4>
                    <div className="space-y-2">
                      {componentLibrary.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddComponent(item.type)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background/70 transition-colors text-left"
                        >
                          <div className="text-primary">{item.icon}</div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {toolboxTab === 'agents' && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Agent Templates</h4>
                    <div className="space-y-2">
                      {agentTemplates.map((agent, index) => (
                        <div 
                          key={index}
                          className="p-3 rounded-lg border border-border bg-background/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-primary" />
                            <div className="font-medium text-foreground">{agent.name}</div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.skills.map((skill, skillIndex) => (
                              <span 
                                key={skillIndex}
                                className="px-2 py-1 text-xs rounded bg-primary/10 text-primary"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {toolboxTab === 'logic' && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Workflow Builder</h4>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <div className="font-medium text-foreground">Create Workflow</div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Define triggers, actions, and outputs for your app
                        </p>
                        <button className="w-full py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                          Add Workflow Step
                        </button>
                      </div>
                      
                      <div className="p-3 rounded-lg border border-border bg-background/50">
                        <div className="flex items-center gap-2 mb-2">
                          <WorkflowIcon className="w-4 h-4 text-primary" />
                          <div className="font-medium text-foreground">Current Workflows</div>
                        </div>
                        <div className="space-y-2">
                          {currentProject.workflows.map((workflow, index) => (
                            <div key={index} className="p-2 rounded bg-background/50 border border-border">
                              <div className="text-xs font-medium text-foreground">
                                {workflow.trigger.componentId} → {workflow.action.agentId}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button 
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-background/50 border border-border rounded-md hover:bg-background/70 transition-colors text-sm"
                  >
                    {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isPreviewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
              {/* Project Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{currentProject.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 py-2 px-3 bg-background/50 border border-border rounded-md hover:bg-background/70 transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    Import AIX
                  </button>
                  <button className="flex items-center gap-2 py-2 px-3 bg-background/50 border border-border rounded-md hover:bg-background/70 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    Export App
                  </button>
                </div>
              </div>
              
              {/* Canvas */}
              <div className="flex-1 relative overflow-hidden bg-background/30">
                <div 
                  className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px]"
                  style={{ 
                    backgroundImage: 'linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.1) 1px, transparent 1px)'
                  }}
                />
                
                <div 
                  className="absolute inset-4 bg-background/50 border border-border/50 rounded-lg overflow-hidden"
                  style={{ minHeight: '500px' }}
                >
                  {isPreviewMode ? (
                    <div className="p-6">
                      <h4 className="font-medium text-foreground mb-4">App Preview: {currentProject.name}</h4>
                      <div className="space-y-4">
                        {currentProject.components.map(component => (
                          <div key={component.id} className="mb-4">
                            <label className="block text-sm font-medium text-foreground mb-1">
                              {component.name}
                            </label>
                            {renderComponent(component)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="relative w-full h-full"
                      style={{ 
                        backgroundImage: 'radial-gradient(circle, hsl(var(--border) / 0.2) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      {currentProject.components.map(component => (
                        <div
                          key={component.id}
                          className="absolute cursor-move"
                          style={{
                            left: `${component.x}px`,
                            top: `${component.y}px`,
                            width: `${component.width}px`,
                            height: `${component.height}px`
                          }}
                        >
                          <div className="relative w-full h-full">
                            {renderComponent(component)}
                            {!isPreviewMode && (
                              <button
                                onClick={() => handleDeleteComponent(component.id)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {currentProject.components.length === 0 && (
                        <EmptyState
                          icon={<Grid className="w-16 h-16" />}
                          title="Empty Canvas"
                          description="Drag components from the toolbox to start building your app. Add inputs, buttons, and agent slots to create powerful automations."
                          action={{
                            label: 'Add First Component',
                            onClick: () => handleAddComponent('input')
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Sidebar - Properties */}
            <div className="w-80 border-l border-border/50 bg-background/50 flex flex-col">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground">
                  {selectedComponent ? 'Component Properties' : 'Project Details'}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedComponent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Component Name
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.name}
                        onChange={(e) => {
                          const updatedComponents = currentProject.components.map(c => 
                            c.id === selectedComponent.id 
                              ? { ...c, name: e.target.value } 
                              : c
                          );
                          setCurrentProject({
                            ...currentProject,
                            components: updatedComponents
                          });
                          setSelectedComponent({
                            ...selectedComponent,
                            name: e.target.value
                          });
                        }}
                        className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Type
                      </label>
                      <div className="p-2 bg-background/50 border border-border rounded-md text-sm text-muted-foreground">
                        {selectedComponent.type}
                      </div>
                    </div>
                    
                    {selectedComponent.type === 'agent-slot' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Zentix ID
                        </label>
                        <input
                          type="text"
                          placeholder="Enter agent Zentix ID"
                          value={selectedComponent.properties.zentixId || ''}
                          onChange={(e) => {
                            const updatedComponents = currentProject.components.map(c => 
                              c.id === selectedComponent.id 
                                ? { 
                                    ...c, 
                                    properties: { 
                                      ...c.properties, 
                                      zentixId: e.target.value 
                                    } 
                                  } 
                                : c
                            );
                            setCurrentProject({
                              ...currentProject,
                              components: updatedComponents
                            });
                            setSelectedComponent({
                              ...selectedComponent,
                              properties: { 
                                ...selectedComponent.properties, 
                                zentixId: e.target.value 
                              }
                            });
                          }}
                          className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {selectedComponent.type === 'input' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          placeholder="Enter placeholder text"
                          value={selectedComponent.properties.placeholder || ''}
                          onChange={(e) => {
                            const updatedComponents = currentProject.components.map(c => 
                              c.id === selectedComponent.id 
                                ? { 
                                    ...c, 
                                    properties: { 
                                      ...c.properties, 
                                      placeholder: e.target.value 
                                    } 
                                  } 
                                : c
                            );
                            setCurrentProject({
                              ...currentProject,
                              components: updatedComponents
                            });
                            setSelectedComponent({
                              ...selectedComponent,
                              properties: { 
                                ...selectedComponent.properties, 
                                placeholder: e.target.value 
                              }
                            });
                          }}
                          className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    {selectedComponent.type === 'button' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          placeholder="Enter button text"
                          value={selectedComponent.properties.text || ''}
                          onChange={(e) => {
                            const updatedComponents = currentProject.components.map(c => 
                              c.id === selectedComponent.id 
                                ? { 
                                    ...c, 
                                    properties: { 
                                      ...c.properties, 
                                      text: e.target.value 
                                    } 
                                  } 
                                : c
                            );
                            setCurrentProject({
                              ...currentProject,
                              components: updatedComponents
                            });
                            setSelectedComponent({
                              ...selectedComponent,
                              properties: { 
                                ...selectedComponent.properties, 
                                text: e.target.value 
                              }
                            });
                          }}
                          className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-medium text-foreground mb-2">Position & Size</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">X</label>
                          <input
                            type="number"
                            value={selectedComponent.x}
                            onChange={(e) => {
                              const updatedComponents = currentProject.components.map(c => 
                                c.id === selectedComponent.id 
                                  ? { ...c, x: parseInt(e.target.value) || 0 } 
                                  : c
                              );
                              setCurrentProject({
                                ...currentProject,
                                components: updatedComponents
                              });
                              setSelectedComponent({
                                ...selectedComponent,
                                x: parseInt(e.target.value) || 0
                              });
                            }}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Y</label>
                          <input
                            type="number"
                            value={selectedComponent.y}
                            onChange={(e) => {
                              const updatedComponents = currentProject.components.map(c => 
                                c.id === selectedComponent.id 
                                  ? { ...c, y: parseInt(e.target.value) || 0 } 
                                  : c
                              );
                              setCurrentProject({
                                ...currentProject,
                                components: updatedComponents
                              });
                              setSelectedComponent({
                                ...selectedComponent,
                                y: parseInt(e.target.value) || 0
                              });
                            }}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Width</label>
                          <input
                            type="number"
                            value={selectedComponent.width}
                            onChange={(e) => {
                              const updatedComponents = currentProject.components.map(c => 
                                c.id === selectedComponent.id 
                                  ? { ...c, width: parseInt(e.target.value) || 0 } 
                                  : c
                              );
                              setCurrentProject({
                                ...currentProject,
                                components: updatedComponents
                              });
                              setSelectedComponent({
                                ...selectedComponent,
                                width: parseInt(e.target.value) || 0
                              });
                            }}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Height</label>
                          <input
                            type="number"
                            value={selectedComponent.height}
                            onChange={(e) => {
                              const updatedComponents = currentProject.components.map(c => 
                                c.id === selectedComponent.id 
                                  ? { ...c, height: parseInt(e.target.value) || 0 } 
                                  : c
                              );
                              setCurrentProject({
                                ...currentProject,
                                components: updatedComponents
                              });
                              setSelectedComponent({
                                ...selectedComponent,
                                height: parseInt(e.target.value) || 0
                              });
                            }}
                            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={currentProject.name}
                        onChange={(e) => setCurrentProject({
                          ...currentProject,
                          name: e.target.value
                        })}
                        className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Description
                      </label>
                      <textarea
                        value={currentProject.description}
                        onChange={(e) => setCurrentProject({
                          ...currentProject,
                          description: e.target.value
                        })}
                        className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Components
                      </label>
                      <div className="p-3 bg-background/50 border border-border rounded-md">
                        <div className="text-sm text-foreground">
                          {currentProject.components.length} components
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Agents
                      </label>
                      <div className="p-3 bg-background/50 border border-border rounded-md">
                        <div className="text-sm text-foreground">
                          {currentProject.agents.length} agents
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Workflows
                      </label>
                      <div className="p-3 bg-background/50 border border-border rounded-md">
                        <div className="text-sm text-foreground">
                          {currentProject.workflows.length} workflows
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'my-apps' && (
          <div className="p-6 animate-fade-in">
            {/* Search and Stats */}
            <div className="mb-6 space-y-4">
              <SmartSearch
                placeholder="Search your apps..."
                suggestions={[]}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Apps</span>
                    <AppWindow className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">1.2K</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <Sparkles className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">$4.2K</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">My Applications</h3>
              <button className="flex items-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                New App
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id}
                  className="bg-background/50 border border-border rounded-lg p-5 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setCurrentProject(project);
                    setActiveTab('builder');
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <AppWindow className="w-5 h-5" />
                    </div>
                    <h4 className="font-medium text-foreground">{project.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{project.components.length} components</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'marketplace' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">App Marketplace</h3>
              <p className="text-muted-foreground">
                Discover and purchase applications created by the community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'market-1',
                  name: 'Social Media Manager',
                  description: 'Automate your social media posts across multiple platforms',
                  creator: 'AgentMaster Pro',
                  price: '25 ZXT',
                  rating: 4.8,
                  downloads: '1.2K'
                },
                {
                  id: 'market-2',
                  name: 'Data Dashboard',
                  description: 'Create beautiful dashboards with real-time data visualization',
                  creator: 'DataViz Studio',
                  price: 'Free',
                  rating: 4.5,
                  downloads: '856'
                },
                {
                  id: 'market-3',
                  name: 'Customer Support Bot',
                  description: '24/7 customer support automation with sentiment analysis',
                  creator: 'SupportAI',
                  price: '45 ZXT',
                  rating: 4.9,
                  downloads: '2.1K'
                }
              ].map((app, index) => (
                <div key={index} className="bg-background/50 border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                      <AppWindow className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{app.name}</h4>
                      <p className="text-xs text-muted-foreground">by {app.creator}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {app.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-foreground">{app.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{app.downloads} downloads</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{app.price}</span>
                    <button className="py-1 px-3 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
                      Get
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}