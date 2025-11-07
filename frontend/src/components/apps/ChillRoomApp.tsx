import { useState } from 'react';
import { 
  Users, 
  Mic, 
  MicOff, 
  Headphones, 
  Music, 
  Play, 
  SkipForward, 
  Hash,
  Lock,
  Plus,
  X,
  MessageCircle,
  Send,
  Smile,
  AlertTriangle
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  participantCount: number;
  createdBy: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  meritScore?: number;
  avatar: string;
  position: { x: number; y: number };
  isSpeaking: boolean;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  reactions: { emoji: string; count: number; users: string[] }[];
  isCompliant?: boolean;
  toxicityScore?: number;
  violations?: string[];
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

export function ChillRoomApp() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'room'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'room-1',
      name: 'Zentix Community Hangout',
      isPrivate: false,
      participantCount: 12,
      createdBy: 'ZentixUser#1234',
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-2',
      name: 'AI Agents Discussion',
      isPrivate: true,
      participantCount: 5,
      createdBy: 'AgentCreator#5678',
      createdAt: new Date().toISOString()
    },
    {
      id: 'room-3',
      name: 'Creator Studio Feedback',
      isPrivate: false,
      participantCount: 8,
      createdBy: 'ContentMaster#9012',
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [participants] = useState<Participant[]>([
    {
      id: 'user-1',
      name: 'ZentixUser#1234',
      meritScore: 842,
      avatar: 'U1',
      position: { x: 50, y: 50 },
      isSpeaking: true
    },
    {
      id: 'user-2',
      name: 'AgentCreator#5678',
      meritScore: 915,
      avatar: 'A2',
      position: { x: 150, y: 80 },
      isSpeaking: false
    },
    {
      id: 'user-3',
      name: 'ContentMaster#9012',
      meritScore: 763,
      avatar: 'C3',
      position: { x: 250, y: 120 },
      isSpeaking: false
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      userId: 'user-1',
      userName: 'ZentixUser#1234',
      text: 'Hey everyone! Welcome to the Zentix Community Hangout!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      reactions: []
    },
    {
      id: 'msg-2',
      userId: 'user-2',
      userName: 'AgentCreator#5678',
      text: 'Just finished creating a new agent in Zentix Forge. The tool integration is amazing!',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      reactions: [{ emoji: '👏', count: 3, users: ['user-1', 'user-3', 'user-4'] }]
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isHeadphonesOn, setIsHeadphonesOn] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);

  const createRoom = () => {
    if (!newRoomName.trim()) return;
    
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      isPrivate: isPrivateRoom,
      participantCount: 1,
      createdBy: 'CurrentUser#0000',
      createdAt: new Date().toISOString()
    };
    
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
    setIsPrivateRoom(false);
  };

  const joinRoom = () => {
    setActiveTab('room');
  };

  const leaveRoom = () => {
    setActiveTab('rooms');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Check message compliance before sending
    try {
      // In a real implementation, this would call the PerspectiveAPI
      // For now, we'll simulate the compliance check
      const isToxic = Math.random() > 0.8; // 20% chance of being toxic for demo
      
      if (isToxic) {
        // Create compliance alert
        const alert: ComplianceAlert = {
          type: 'compliance_alert',
          agentDid: 'current-user',
          severity: 'medium',
          message: 'Toxic message detected and blocked',
          timestamp: Date.now(),
          details: {
            toxicityScore: 0.85,
            violations: ['Toxicity'],
            analysis: { TOXICITY: 0.85 }
          }
        };
        
        setComplianceAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep only last 5 alerts
        
        // Don't send the message, show notification instead
        alert('Message blocked: Toxic content detected');
        setNewMessage('');
        return;
      }
    } catch (error) {
      console.error('Compliance check failed:', error);
    }
    
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      userId: 'current-user',
      userName: 'CurrentUser#0000',
      text: newMessage,
      timestamp: new Date().toISOString(),
      reactions: [],
      isCompliant: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleHeadphones = () => {
    setIsHeadphonesOn(!isHeadphonesOn);
  };

  const playNextMedia = () => {
    // In a real implementation, this would cycle through the media queue
  };

  const getMeritScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 900) return 'text-yellow-500';
    if (score >= 700) return 'text-green-500';
    if (score >= 500) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          The Chill Room
        </h2>
        <p className="text-muted-foreground">
          Connect, Share, Vibe. Your space, your rules, your identity.
        </p>
      </div>

      {activeTab === 'rooms' ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Create Room Section */}
            <div className="bg-background/50 border border-border rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4">Create New Room</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Room name"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="private-room"
                    checked={isPrivateRoom}
                    onChange={(e) => setIsPrivateRoom(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="private-room" className="text-sm">Private Room</label>
                  {isPrivateRoom && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <button
                  onClick={createRoom}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Room
                </button>
              </div>
            </div>

            {/* Rooms List */}
            <div className="bg-background/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Available Rooms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={joinRoom}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        {room.name}
                      </h4>
                      {room.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      Created by {room.createdBy}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        <span>{room.participantCount} participants</span>
                      </div>
                      <button className="text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Room Header */}
          <div className="p-4 bg-background/50 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={leaveRoom}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Leave room"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-semibold">Zentix Community Hangout</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  12 participants
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleHeadphones}
                className={`p-2 rounded-lg transition-colors ${
                  isHeadphonesOn 
                    ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                aria-label={isHeadphonesOn ? "Mute headphones" : "Unmute headphones"}
              >
                <Headphones className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleMic}
                className={`p-2 rounded-lg transition-colors ${
                  isMicOn 
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Spatial Audio Chat */}
            <div className="flex-1 relative bg-gradient-to-br from-background/50 to-muted/30 border-r border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Room visualization */}
                <div className="relative w-full h-full">
                  {/* Room background */}
                  <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-border/30"></div>
                  
                  {/* Participants */}
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110"
                      style={{
                        left: `${participant.position.x}px`,
                        top: `${participant.position.y}px`,
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        participant.isSpeaking 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 ring-2 ring-green-500/50' 
                          : 'bg-gradient-to-br from-primary to-blue-500'
                      }`}>
                        {participant.avatar}
                      </div>
                      <div className="mt-1 text-xs text-center max-w-[80px] truncate">
                        {participant.name}
                      </div>
                      {participant.meritScore && (
                        <div className={`text-[10px] ${getMeritScoreColor(participant.meritScore)}`}>
                          {participant.meritScore}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-96 flex flex-col border-l border-border">
              {/* Compliance Alerts */}
              {complianceAlerts.length > 0 && (
                <div className="p-4 border-b border-border bg-destructive/10">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Compliance Alerts
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {complianceAlerts.map((alert, index) => (
                      <div key={index} className="text-xs p-2 bg-background/50 rounded border border-destructive/20">
                        <div className="font-medium text-destructive">{alert.message}</div>
                        <div className="text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Media Player */}
              <div className="p-4 border-b border-border bg-background/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Shared Media
                </h4>
                <div className="bg-background border border-border rounded-lg p-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                      <Music className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        Chill Lofi Beats
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Added by AgentCreator#5678
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          className="p-1 rounded hover:bg-muted"
                          aria-label="Play"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={playNextMedia}
                          className="p-1 rounded hover:bg-muted"
                          aria-label="Skip to next"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border bg-background/50">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </h4>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                          {message.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <div className="font-medium text-sm">{message.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="text-sm mt-1">{message.text}</div>
                          
                          {message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {message.reactions.map((reaction, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-10 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="text-xs text-muted-foreground hover:text-foreground"
                          aria-label="Add reaction"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-border bg-background/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Type a message"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}