import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Shield, 
  Activity, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Network, 
  Bot, 
  Video, 
  Brain, 
  Grid, 
  Crown, 
  BookOpen,
  Globe,
  Mic,
  Users,
  Palette,
  Link,
  Workflow
} from 'lucide-react';
import { GuardiansControlApp } from '../components/apps/GuardiansControlApp';
import { HealerDashboardApp } from '../components/apps/HealerDashboardApp';
import { ReportsViewerApp } from '../components/apps/ReportsViewerApp';
import { ComplianceCenterApp } from '../components/apps/ComplianceCenterApp';
import { AlertsConsoleApp } from '../components/apps/AlertsConsoleApp';
import { LunaTravelApp } from '../components/apps/LunaTravelApp';
import { ZentixForgeApp } from '../components/apps/ZentixForgeApp';
import { CreatorStudioApp } from '../components/apps/CreatorStudioApp';
import { AmrikyyApp } from '../components/apps/AmrikyyApp';
import { LingoLeapApp } from '../components/apps/LingoLeapApp';
import { NexusHubApp } from '../components/apps/NexusHubApp';
import { CentralGovernmentApp } from '../components/apps/CentralGovernmentApp';
import { CognitoSphereApp } from '../components/apps/CognitoSphereApp';
import { CognitoBrowserApp } from '../components/apps/CognitoBrowserApp';
import { AmrikyyVoiceApp } from '../components/apps/AmrikyyVoiceApp';
import { ChillRoomApp } from '../components/apps/ChillRoomApp';
import { ZentixChameleonApp } from '../components/apps/ZentixChameleonApp';
import { NexusBridgeApp } from '../components/apps/NexusBridgeApp';
import { NexusAutomataApp } from '../components/apps/NexusAutomataApp';
import { AppletMarketplaceApp } from '../components/apps/AppletMarketplaceApp';
import { AgoraHubApp } from '../components/apps/AgoraHubApp';

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  color: string;
  category: 'security' | 'monitoring' | 'ai-agents';
}

interface OpenWindow {
  appId: string;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
}

export function ZentixOS() {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [highestZIndex, setHighestZIndex] = useState(1000);

  const apps: App[] = [
    {
      id: 'guardians',
      name: 'Guardians Control',
      icon: <Shield className="w-8 h-8" />,
      component: <GuardiansControlApp />,
      color: 'from-blue-600 to-cyan-500',
      category: 'security'
    },
    {
      id: 'healer',
      name: 'Self-Healing Dashboard',
      icon: <Activity className="w-8 h-8" />,
      component: <HealerDashboardApp />,
      color: 'from-green-600 to-emerald-500',
      category: 'monitoring'
    },
    {
      id: 'reports',
      name: 'Reports Viewer',
      icon: <FileText className="w-8 h-8" />,
      component: <ReportsViewerApp />,
      color: 'from-purple-600 to-pink-500',
      category: 'monitoring'
    },
    {
      id: 'compliance',
      name: 'Compliance Center',
      icon: <CheckCircle className="w-8 h-8" />,
      component: <ComplianceCenterApp />,
      color: 'from-indigo-600 to-blue-500',
      category: 'security'
    },
    {
      id: 'alerts',
      name: 'Alerts Console',
      icon: <AlertTriangle className="w-8 h-8" />,
      component: <AlertsConsoleApp />,
      color: 'from-red-600 to-orange-500',
      category: 'monitoring'
    },
    {
      id: 'luna',
      name: 'Luna Travel Agent',
      icon: <span className="text-3xl">🌍</span>,
      component: <LunaTravelApp />,
      color: 'from-blue-500 to-purple-500',
      category: 'ai-agents'
    },
    {
      id: 'forge',
      name: 'Zentix Forge',
      icon: <Bot className="w-8 h-8" />,
      component: <ZentixForgeApp />,
      color: 'from-purple-600 to-pink-500',
      category: 'ai-agents'
    },
    {
      id: 'creator',
      name: 'Creator Studio',
      icon: <Video className="w-8 h-8" />,
      component: <CreatorStudioApp />,
      color: 'from-purple-600 to-pink-500',
      category: 'ai-agents'
    },
    {
      id: 'amrikyy',
      name: 'Amrikyy OS',
      icon: <Brain className="w-8 h-8" />,
      component: <AmrikyyApp />,
      color: 'from-blue-500 to-cyan-500',
      category: 'ai-agents'
    },
    {
      id: 'lingoleap',
      name: 'LingoLeap',
      icon: <span className="text-3xl">📚</span>,
      component: <LingoLeapApp />,
      color: 'from-blue-500 to-purple-500',
      category: 'ai-agents'
    },
    {
      id: 'nexushub',
      name: 'Nexus Hub',
      icon: <Grid className="w-8 h-8" />,
      component: <NexusHubApp />,
      color: 'from-purple-500 to-pink-500',
      category: 'ai-agents'
    },
    {
      id: 'government',
      name: 'Central Government',
      icon: <Crown className="w-8 h-8" />,
      component: <CentralGovernmentApp />,
      color: 'from-yellow-500 to-orange-500',
      category: 'security'
    },
    {
      id: 'cognitosphere',
      name: 'CognitoSphere',
      icon: <BookOpen className="w-8 h-8" />,
      component: <CognitoSphereApp />,
      color: 'from-indigo-500 to-purple-500',
      category: 'ai-agents'
    },
    {
      id: 'cognitobrowser',
      name: 'Cognito Browser',
      icon: <Globe className="w-8 h-8" />,
      component: <CognitoBrowserApp />,
      color: 'from-blue-500 to-cyan-500',
      category: 'ai-agents'
    },
    {
      id: 'amrikyyvoice',
      name: 'Amrikyy Voice',
      icon: <Mic className="w-8 h-8" />,
      component: <AmrikyyVoiceApp />,
      color: 'from-purple-500 to-pink-500',
      category: 'ai-agents'
    },
    {
      id: 'chillroom',
      name: 'The Chill Room',
      icon: <Users className="w-8 h-8" />,
      component: <ChillRoomApp />,
      color: 'from-pink-500 to-rose-500',
      category: 'ai-agents'
    },
    {
      id: 'chameleon',
      name: 'Zentix Chameleon',
      icon: <Palette className="w-8 h-8" />,
      component: <ZentixChameleonApp />,
      color: 'from-indigo-500 to-purple-500',
      category: 'ai-agents'
    },
    {
      id: 'nexusbridge',
      name: 'Nexus Bridge',
      icon: <Link className="w-8 h-8" />,
      component: <NexusBridgeApp />,
      color: 'from-blue-500 to-indigo-500',
      category: 'ai-agents'
    },
    {
      id: 'nexusautomata',
      name: 'Nexus Automata',
      icon: <Workflow className="w-8 h-8" />,
      component: <NexusAutomataApp />,
      color: 'from-purple-500 to-pink-500',
      category: 'ai-agents'
    },
    {
      id: 'appletmarketplace',
      name: 'Applet Marketplace',
      icon: <Grid className="w-8 h-8" />,
      component: <AppletMarketplaceApp />,
      color: 'from-green-500 to-teal-500',
      category: 'ai-agents'
    },
    {
      id: 'agorahub',
      name: 'Agora Hub',
      icon: <Users className="w-8 h-8" />,
      component: <AgoraHubApp />,
      color: 'from-purple-500 to-pink-500',
      category: 'ai-agents'
    }
  ];

  const openApp = (appId: string) => {
    const existingWindow = openWindows.find(w => w.appId === appId);
    
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setOpenWindows(openWindows.map(w => 
          w.appId === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
        ));
        setHighestZIndex(highestZIndex + 1);
      } else {
        focusWindow(appId);
      }
    } else {
      setOpenWindows([...openWindows, { 
        appId, 
        isMaximized: false, 
        isMinimized: false,
        zIndex: highestZIndex + 1,
        position: { x: 100 + (openWindows.length * 30), y: 80 + (openWindows.length * 30) }
      }]);
      setHighestZIndex(highestZIndex + 1);
    }
  };

  const closeApp = (appId: string) => {
    setOpenWindows(openWindows.filter(w => w.appId !== appId));
  };

  const toggleMaximize = (appId: string) => {
    setOpenWindows(openWindows.map(w => 
      w.appId === appId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const toggleMinimize = (appId: string) => {
    setOpenWindows(openWindows.map(w => 
      w.appId === appId ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const focusWindow = (appId: string) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    setOpenWindows(openWindows.map(w => 
      w.appId === appId ? { ...w, zIndex: newZIndex } : w
    ));
  };

  const groupedApps = {
    security: apps.filter(a => a.category === 'security'),
    monitoring: apps.filter(a => a.category === 'monitoring'),
    'ai-agents': apps.filter(a => a.category === 'ai-agents')
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-purple-950/20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(76,29,149,0.4),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.3),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(168,85,247,0.3),_transparent_50%)]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-xl border-b border-border/50 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <span className="font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              ZentixOS
            </span>
          </div>
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>System Online</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* App Launcher Grid */}
      <div className="absolute top-20 left-8 right-8 bottom-24 overflow-y-auto z-40 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          {openWindows.length === 0 && (
            <div className="pointer-events-auto">
              <div className="text-center mb-12 pt-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-success uppercase tracking-wide">All Systems Active</span>
                </div>
                <h1 className="text-7xl font-bold gradient-text mb-4 animate-fade-in">
                  Welcome to ZentixOS
                </h1>
                <p className="text-xl text-muted-foreground font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  The Autonomous Security & Operations System - Launch any app instantly
                </p>
              </div>

              <div className="space-y-8">
                {Object.entries(groupedApps).map(([category, categoryApps], idx) => (
                  <div key={category} className="animate-slide-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      {category === 'security' && <Shield className="w-5 h-5 text-primary" />}
                      {category === 'monitoring' && <Activity className="w-5 h-5 text-accent" />}
                      {category === 'ai-agents' && <Zap className="w-5 h-5 text-success" />}
                      {category.replace('-', ' ')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {categoryApps.map((app, appIdx) => (
                        <button
                          key={app.id}
                          onClick={() => openApp(app.id)}
                          className="group relative overflow-hidden rounded-2xl glass-card border border-border/50 hover:border-primary/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-scale-in"
                          style={{ animationDelay: `${appIdx * 0.05}s` }}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                          <div className="relative">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                              {app.icon}
                            </div>
                            <h3 className="font-semibold text-foreground text-center group-hover:gradient-text transition-all duration-300">
                              {app.name}
                            </h3>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Open Windows */}
      {openWindows.filter(w => !w.isMinimized).map(window => {
        const app = apps.find(a => a.id === window.appId);
        if (!app) return null;

        return (
          <div
            key={window.appId}
            onClick={() => focusWindow(window.appId)}
            style={{ 
              zIndex: window.zIndex,
              left: window.isMaximized ? '2rem' : window.position?.x,
              top: window.isMaximized ? '4rem' : window.position?.y,
              right: window.isMaximized ? '2rem' : undefined,
              bottom: window.isMaximized ? '6rem' : undefined,
              width: window.isMaximized ? 'auto' : '70%',
              height: window.isMaximized ? 'auto' : '75vh'
            }}
            className="absolute transition-all duration-300 pointer-events-auto"
          >
            <GlassCard className="h-full flex flex-col overflow-hidden shadow-2xl">
              {/* Window Title Bar */}
              <div className={`flex items-center justify-between p-3 bg-gradient-to-r ${app.color} text-white cursor-move`}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {app.icon}
                  </div>
                  <span className="font-semibold">{app.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMinimize(window.appId); }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMaximize(window.appId); }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title={window.isMaximized ? "Restore" : "Maximize"}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeApp(window.appId); }}
                    className="p-2 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-auto bg-background">
                {app.component}
              </div>
            </GlassCard>
          </div>
        );
      })}

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex gap-3 p-3 rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl">
          {openWindows.map(window => {
            const app = apps.find(a => a.id === window.appId);
            if (!app) return null;

            return (
              <button
                key={window.appId}
                onClick={() => window.isMinimized ? openApp(window.appId) : focusWindow(window.appId)}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  window.isMinimized ? 'opacity-60' : 'opacity-100'
                } hover:scale-110`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg`}>
                  {app.icon}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
