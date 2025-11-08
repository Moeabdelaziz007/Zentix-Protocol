import { useState } from 'react';
import { GlassCard } from './GlassCard';
import { ConsciousnessIndicator } from './ConsciousnessIndicator';
import { CircuitBoard, Layers2, ArrowLeftRight } from 'lucide-react';

interface AIZZone {
  id: string;
  name: string;
  description: string;
  state: 'fulfilled' | 'focused' | 'curious';
  icon: typeof CircuitBoard;
}

const zones: AIZZone[] = [
  {
    id: 'registry',
    name: 'AIZ Registry',
    description: 'Central coordination hub managing all autonomous intelligence zones',
    state: 'fulfilled',
    icon: CircuitBoard,
  },
  {
    id: 'sub-aiz',
    name: 'Sub-AIZ Network',
    description: 'Distributed network of specialized agent clusters',
    state: 'focused',
    icon: Layers2,
  },
  {
    id: 'intent',
    name: 'Intent Layer',
    description: 'Natural language communication protocol for agent coordination',
    state: 'curious',
    icon: ArrowLeftRight,
  },
];

export function ProtocolOverview() {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Protocol <span className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">Architecture</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Interactive architecture diagram showing AIZ zones with real-time consciousness states
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const Icon = zone.icon;
            const isActive = activeZone === zone.id;
            
            return (
              <div
                key={zone.id}
                onMouseEnter={() => setActiveZone(zone.id)}
                onMouseLeave={() => setActiveZone(null)}
              >
                <GlassCard
                  glow={isActive ? 'cyan' : 'none'}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive ? 'scale-105 ring-2 ring-[#00D9FF]/50' : ''
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D9FF]/20 to-[#B47EFF]/20 flex items-center justify-center mb-4 transition-transform duration-300 ${
                      isActive ? 'scale-110' : ''
                    }`}>
                      <Icon className="text-[#00D9FF]" size={32} />
                    </div>
                    
                    <h3 className="font-display text-xl font-semibold mb-2">{zone.name}</h3>
                    
                    <ConsciousnessIndicator state={zone.state} />
                    
                    <p className={`text-gray-400 text-sm mt-4 transition-all duration-300 ${
                      isActive ? 'opacity-100 max-h-20' : 'opacity-70 max-h-0 overflow-hidden'
                    }`}>
                      {zone.description}
                    </p>
                  </div>

                  {/* Animated Connection Lines */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full">
                        <line
                          x1="50%"
                          y1="50%"
                          x2="100%"
                          y2="50%"
                          stroke="#00D9FF"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                          opacity="0.3"
                        />
                      </svg>
                    </div>
                  )}
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}