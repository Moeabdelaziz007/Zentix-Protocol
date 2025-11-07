import { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Settings, 
  HelpCircle,
  Circle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  text: string;
  timestamp: string;
  status: 'processing' | 'completed' | 'failed';
}

interface HologramState {
  color: string;
  intensity: number;
  animation: string;
}

export function AmrikyyVoiceApp() {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(80);
  const [sensitivity, setSensitivity] = useState(70);
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [hologramState, setHologramState] = useState<HologramState>({
    color: 'blue',
    intensity: 50,
    animation: 'pulse'
  });
  const [currentCommand, setCurrentCommand] = useState('');

  // Simulate voice recognition
  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(() => {
        if (isListening) {
          // Simulate receiving a command
          const commands = [
            "Open Creator Studio and start a new video project about renewable energy",
            "Show me the status of my AI agents in Zentix Forge",
            "What is the current weather in New York?",
            "Play some music in The Chill Room",
            "Create a new agent in Zentix Forge with image generation capabilities"
          ];
          
          const randomCommand = commands[Math.floor(Math.random() * commands.length)];
          setCurrentCommand(randomCommand);
          
          // Process the command
          processVoiceCommand(randomCommand);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  const processVoiceCommand = (command: string) => {
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      text: command,
      timestamp: new Date().toISOString(),
      status: 'processing'
    };
    
    setVoiceCommands(prev => [newCommand, ...prev]);
    
    // Update hologram state based on command
    setHologramState({
      color: 'yellow',
      intensity: 80,
      animation: 'pulse'
    });
    
    // Simulate processing
    setTimeout(() => {
      setVoiceCommands(prev => 
        prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { ...cmd, status: 'completed' } 
            : cmd
        )
      );
      
      // Update hologram state to completed
      setHologramState({
        color: 'green',
        intensity: 100,
        animation: 'pulse'
      });
      
      // Reset after a delay
      setTimeout(() => {
        setHologramState({
          color: 'blue',
          intensity: 50,
          animation: 'pulse'
        });
      }, 2000);
    }, 2000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setHologramState({
        color: 'blue',
        intensity: 70,
        animation: 'pulse'
      });
    } else {
      setHologramState({
        color: 'blue',
        intensity: 50,
        animation: 'pulse'
      });
      setCurrentCommand('');
    }
  };

  const getHologramColor = () => {
    switch (hologramState.color) {
      case 'blue': return 'from-blue-500 to-cyan-500';
      case 'green': return 'from-green-500 to-emerald-500';
      case 'yellow': return 'from-yellow-500 to-orange-500';
      case 'red': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Circle className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/10 to-blue-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Amrikyy Voice
        </h2>
        <p className="text-muted-foreground">
          Your System, Your Voice. The omnipresent AI that listens and assists.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holographic Voice Interface */}
          <div className="lg:col-span-2 bg-background/50 border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Holographic Voice Interface</h3>
            
            <div className="flex flex-col items-center justify-center h-96">
              {/* Hologram Visualization */}
              <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${getHologramColor()} opacity-80 flex items-center justify-center mb-8 ${hologramState.animation === 'pulse' ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-4 rounded-full bg-background/30 backdrop-blur-sm"></div>
                <div className="absolute inset-8 rounded-full bg-background/20 backdrop-blur-sm"></div>
                <div className="absolute inset-12 rounded-full bg-background/10 backdrop-blur-sm"></div>
                
                {/* Animated lines */}
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute top-1/2 left-1/2 w-full h-0.5 bg-white/30 origin-center"
                      style={{ 
                        transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                        animation: `spin ${10 + i * 2}s linear infinite`
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Center icon */}
                <div className="relative z-10">
                  {isListening ? (
                    <Mic className="w-12 h-12 text-white" />
                  ) : (
                    <MicOff className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="text-center mb-6">
                <div className="text-lg font-medium mb-2">
                  {isListening ? 'Listening...' : 'Ready'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentCommand || 'Say something to activate Amrikyy Voice'}
                </div>
              </div>
              
              {/* Control Button */}
              <button
                onClick={toggleListening}
                className={`px-8 py-4 rounded-full flex items-center gap-2 text-lg font-medium transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Listening
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          <div className="bg-background/50 border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Voice Settings</h3>
            
            <div className="space-y-6">
              {/* Volume Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Volume</label>
                  <div className="flex items-center gap-2">
                    {volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">{volume}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  aria-label="Volume control"
                />
              </div>
              
              {/* Sensitivity Control */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Sensitivity</label>
                  <span className="text-sm text-muted-foreground">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  aria-label="Sensitivity control"
                />
              </div>
              
              {/* Quick Actions */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-1" aria-label="Settings">
                    <Settings className="w-5 h-5 text-primary" />
                    <span className="text-xs">Settings</span>
                  </button>
                  <button className="p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-1" aria-label="Help">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span className="text-xs">Help</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Command History */}
          <div className="lg:col-span-3 bg-background/50 border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Voice Command History</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {voiceCommands.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No voice commands yet</p>
                  <p className="text-sm mt-1">Start listening to see commands appear here</p>
                </div>
              ) : (
                voiceCommands.map((command) => (
                  <div 
                    key={command.id} 
                    className="p-4 bg-background border border-border rounded-lg flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(command.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{command.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(command.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {command.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}