import { useState } from 'react';
import { 
  Palette, 
  Layout, 
  Grid, 
  Sliders, 
  Sun, 
  Moon, 
  Zap, 
  Cpu, 
  Monitor, 
  Smartphone, 
  Tablet,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Image,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    border: string;
    text: string;
  };
  background: string;
  iconStyle: string;
}

interface Widget {
  id: string;
  name: string;
  type: 'weather' | 'crypto' | 'stock' | 'news' | 'github' | 'agent' | 'custom';
  data: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  layout: string;
}

export function ZentixChameleonApp() {
  const [activeTab, setActiveTab] = useState<'themes' | 'dashboard' | 'widgets'>('themes');
  const [selectedTheme, setSelectedTheme] = useState('quantum');
  const [aiPrompt, setAiPrompt] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'widget-1',
      name: 'Weather',
      type: 'weather',
      data: { location: 'New York', temperature: '22°C' },
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 }
    },
    {
      id: 'widget-2',
      name: 'Crypto Prices',
      type: 'crypto',
      data: { coins: ['BTC', 'ETH', 'ZXT'] },
      position: { x: 320, y: 0 },
      size: { width: 300, height: 200 }
    }
  ]);
  const [layoutTemplate, setLayoutTemplate] = useState('default');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const themes: Theme[] = [
    {
      id: 'quantum',
      name: 'Quantum Leap',
      description: 'Neon blue and purple colors with quantum particle background',
      colors: {
        primary: 'from-blue-500 to-purple-500',
        secondary: 'from-purple-500 to-pink-500',
        background: 'from-slate-900 to-slate-800',
        border: 'border-blue-500/30',
        text: 'text-blue-100'
      },
      background: 'quantum-bg',
      iconStyle: 'neon'
    },
    {
      id: 'matrix',
      name: 'Cyberspace Matrix',
      description: 'Classic green neon on black with digital rain effect',
      colors: {
        primary: 'from-green-500 to-emerald-500',
        secondary: 'from-emerald-500 to-teal-500',
        background: 'from-black to-gray-900',
        border: 'border-green-500/30',
        text: 'text-green-100'
      },
      background: 'matrix-bg',
      iconStyle: 'glow'
    },
    {
      id: 'starlight',
      name: 'Starlight Voyager',
      description: 'Deep space colors with twinkling stars and nebula background',
      colors: {
        primary: 'from-indigo-500 to-purple-500',
        secondary: 'from-purple-500 to-pink-500',
        background: 'from-gray-900 to-indigo-900',
        border: 'border-indigo-500/30',
        text: 'text-indigo-100'
      },
      background: 'starlight-bg',
      iconStyle: 'cosmic'
    },
    {
      id: 'crypto',
      name: 'Crypto Trader',
      description: 'Gold and black with moving candlestick charts',
      colors: {
        primary: 'from-yellow-500 to-amber-500',
        secondary: 'from-amber-500 to-orange-500',
        background: 'from-gray-900 to-black',
        border: 'border-yellow-500/30',
        text: 'text-yellow-100'
      },
      background: 'crypto-bg',
      iconStyle: 'metallic'
    }
  ];

  const layoutTemplates: LayoutTemplate[] = [
    {
      id: 'default',
      name: 'Default Layout',
      description: 'Standard grid layout with sidebar',
      layout: 'default'
    },
    {
      id: 'compact',
      name: 'Compact View',
      description: 'Minimal space usage for smaller screens',
      layout: 'compact'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Focus',
      description: 'Large central dashboard with small utility panels',
      layout: 'dashboard'
    },
    {
      id: 'fullscreen',
      name: 'Fullscreen Mode',
      description: 'Maximized content area with hidden panels',
      layout: 'fullscreen'
    }
  ];

  const generateAiTheme = () => {
    if (!aiPrompt.trim()) return;
    
    // In a real implementation, this would call an AI service
    alert(`AI Theme Generator would create a theme based on: "${aiPrompt}"`);
  };

  const applyTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    // In a real implementation, this would apply the theme to the entire OS
  };

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      type,
      data: {},
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 }
    };
    
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };

  const getSelectedTheme = () => {
    return themes.find(theme => theme.id === selectedTheme) || themes[0];
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600/10 to-purple-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          Zentix Chameleon
        </h2>
        <p className="text-muted-foreground">
          Your OS, Your Identity. A system that not only works for you, but looks and feels like you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'themes'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4" />
          Theme Manager
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layout className="w-4 h-4" />
          Dashboard Builder
        </button>
        <button
          onClick={() => setActiveTab('widgets')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'widgets'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Grid className="w-4 h-4" />
          Widget Library
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'themes' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Theme Generator */}
              <div className="lg:col-span-2 bg-background/50 border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  AI Theme Generator
                </h3>
                <p className="text-muted-foreground mb-4">
                  Describe the look and feel you want for your ZentixOS. Our AI will generate a custom theme for you.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., '80s cyberpunk with Miami sunset colors'"
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    aria-label="Describe your desired theme"
                  />
                  <button
                    onClick={generateAiTheme}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </div>

              {/* Preview Controls */}
              <div className="bg-background/50 border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Preview</h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    {isPreviewMode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span>{isPreviewMode ? 'Exit Preview' : 'Preview Theme'}</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Theme</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Import Theme</span>
                  </button>
                </div>
              </div>

              {/* Preset Themes */}
              <div className="lg:col-span-3 bg-background/50 border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Preset Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTheme === theme.id
                          ? 'ring-2 ring-primary border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => applyTheme(theme.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{theme.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {theme.description}
                          </p>
                        </div>
                        {selectedTheme === theme.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="h-20 rounded overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-br ${theme.colors.background}`}></div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${theme.colors.primary}`}></div>
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${theme.colors.secondary}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Dashboard Builder Controls */}
              <div className="lg:col-span-1 bg-background/50 border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Layout Templates</h3>
                <div className="space-y-3">
                  {layoutTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        layoutTemplate === template.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setLayoutTemplate(template.id)}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold text-lg mt-6 mb-4">Widgets</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addWidget('weather')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Sun className="w-4 h-4" />
                    Weather Widget
                  </button>
                  <button
                    onClick={() => addWidget('crypto')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Crypto Price Ticker
                  </button>
                  <button
                    onClick={() => addWidget('stock')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Cpu className="w-4 h-4" />
                    Stock Portfolio
                  </button>
                  <button
                    onClick={() => addWidget('news')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                    AI News Feed
                  </button>
                  <button
                    onClick={() => addWidget('github')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    GitHub Commits
                  </button>
                  <button
                    onClick={() => addWidget('agent')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Cpu className="w-4 h-4" />
                    Agent Status
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4" />
                    Save Dashboard
                  </button>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="lg:col-span-3 bg-background/50 border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Dashboard Preview</h3>
                <div className="bg-gradient-to-br from-background to-muted/30 border border-border rounded-lg h-96 relative overflow-hidden">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="absolute bg-background/80 border border-border rounded-lg p-3"
                      style={{
                        left: `${widget.position.x}px`,
                        top: `${widget.position.y}px`,
                        width: `${widget.size.width}px`,
                        height: `${widget.size.height}px`
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{widget.name}</div>
                        <button
                          onClick={() => removeWidget(widget.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Remove ${widget.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {widget.type === 'weather' && (
                          <div className="flex items-center gap-2">
                            <Sun className="w-5 h-5 text-yellow-500" />
                            <span>22°C, Sunny</span>
                          </div>
                        )}
                        {widget.type === 'crypto' && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>BTC</span>
                              <span className="text-green-500">$43,250 (+2.3%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ETH</span>
                              <span className="text-red-500">$2,450 (-1.2%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ZXT</span>
                              <span className="text-green-500">$0.45 (+5.7%)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {widgets.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Grid className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No widgets added yet</p>
                        <p className="text-sm mt-1">Add widgets from the panel on the left</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'widgets' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-background/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Custom Widget Builder</h3>
              <p className="text-muted-foreground mb-6">
                Create your own custom widgets by connecting to data sources and choosing display options.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Source Configuration */}
                <div className="bg-background border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Data Source
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data Source Type</label>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>API Endpoint</option>
                        <option>guardianAPI Endpoint</option>
                        <option>Local Data</option>
                        <option>Manual Input</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Endpoint URL</label>
                      <input
                        type="text"
                        placeholder="https://api.example.com/data"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        aria-label="Endpoint URL"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data Field</label>
                      <input
                        type="text"
                        placeholder="meritScore"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        aria-label="Data field"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Display Configuration */}
                <div className="bg-background border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Display Options
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Display Type</label>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>Number</option>
                        <option>Line Chart</option>
                        <option>Gauge</option>
                        <option>List</option>
                        <option>Table</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Widget Title</label>
                      <input
                        type="text"
                        placeholder="My Custom Widget"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        aria-label="Widget title"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Refresh Interval</label>
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>5 seconds</option>
                        <option>30 seconds</option>
                        <option>1 minute</option>
                        <option>5 minutes</option>
                        <option>Manual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex justify-end">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Create Widget
                </button>
              </div>
            </div>
            
            {/* Widget Preview */}
            <div className="mt-6 bg-background/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Widget Preview</h3>
              <div className="bg-gradient-to-br from-background to-muted/30 border border-border rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Configure your widget settings to see a preview</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function X() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Github() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}