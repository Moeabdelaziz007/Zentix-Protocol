import { GlassCard } from './GlassCard';
import { CircuitBoard, Layers2, ArrowLeftRight, Store, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: CircuitBoard,
    title: 'AIZ Registry',
    description: 'Decentralized registry for autonomous intelligence zones with real-time discovery',
    color: 'cyan' as const,
    badges: ['Distributed', 'Real-time'],
  },
  {
    icon: Layers2,
    title: 'Sub-AIZ Systems',
    description: 'Hierarchical agent clusters with specialized capabilities and autonomous coordination',
    color: 'purple' as const,
    badges: ['Scalable', 'Modular'],
  },
  {
    icon: ArrowLeftRight,
    title: 'Intent-Based Communication',
    description: 'Natural language protocol enabling seamless agent-to-agent interaction',
    color: 'green' as const,
    badges: ['NLP', 'Semantic'],
  },
  {
    icon: Store,
    title: 'Tool Marketplace',
    description: 'Dynamic marketplace for agent capabilities with live performance metrics',
    color: 'cyan' as const,
    badges: ['Live Stats', 'P2P'],
  },
  {
    icon: ShieldCheck,
    title: 'Accountability Layer',
    description: 'Blockchain-backed accountability ensuring transparent agent operations',
    color: 'purple' as const,
    badges: ['Blockchain', 'Auditable'],
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-transparent via-[#151B2E]/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Key <span className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful capabilities designed for the next generation of AI coordination
          </p>
        </div>

        {/* Asymmetric Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = index === 0 || index === 4;
            
            return (
              <GlassCard
                key={feature.title}
                glow={feature.color}
                className={`group ${isLarge ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                    feature.color === 'cyan' ? 'from-[#00D9FF]/20 to-[#00D9FF]/5' :
                    feature.color === 'purple' ? 'from-[#B47EFF]/20 to-[#B47EFF]/5' :
                    'from-[#10B981]/20 to-[#10B981]/5'
                  } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`${
                      feature.color === 'cyan' ? 'text-[#00D9FF]' :
                      feature.color === 'purple' ? 'text-[#B47EFF]' :
                      'text-[#10B981]'
                    }`} size={28} />
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  
                  <p className="text-gray-400 text-sm mb-4 flex-grow">{feature.description}</p>

                  <div className="flex gap-2 flex-wrap">
                    {feature.badges.map((badge) => (
                      <Badge
                        key={badge}
                        variant="outline"
                        className="border-white/20 bg-white/5 text-xs"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}