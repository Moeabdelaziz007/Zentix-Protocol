import { Button } from '@/components/ui/button';
import { Rocket, Users } from 'lucide-react';
import { QuantumOrb } from './QuantumOrb';

export function CTASection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/20 via-[#B47EFF]/20 to-[#10B981]/20 gradient-shift" />
      
      {/* Floating Orbs */}
      <QuantumOrb size={150} delay={0} color="cyan" />
      <QuantumOrb size={100} delay={2} color="purple" />
      <QuantumOrb size={120} delay={4} color="green" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-5xl md:text-6xl font-bold mb-6">
          Ready to <span className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">Deploy</span>?
        </h2>
        
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Join the future of autonomous intelligence coordination. Start building with AIOS today.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] hover:shadow-[0_0_40px_rgba(0,217,255,0.6)] transition-all duration-300 text-lg px-10 py-7 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <Rocket className="mr-2 group-hover:translate-x-1 transition-transform" size={24} />
              Deploy Your First AIZ
            </span>
            {/* Ripple Effect */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-lg transition-transform duration-500" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-[#B47EFF]/50 hover:bg-[#B47EFF]/10 hover:border-[#B47EFF] hover:shadow-[0_0_30px_rgba(180,126,255,0.4)] transition-all duration-300 text-lg px-10 py-7 group"
          >
            <Users className="mr-2 group-hover:scale-110 transition-transform" size={24} />
            Join the Protocol
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">1000+</div>
            <div className="text-sm text-gray-400 mt-1">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#B47EFF] to-[#10B981] bg-clip-text text-transparent">50K+</div>
            <div className="text-sm text-gray-400 mt-1">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-[#10B981] to-[#00D9FF] bg-clip-text text-transparent">99.9%</div>
            <div className="text-sm text-gray-400 mt-1">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}