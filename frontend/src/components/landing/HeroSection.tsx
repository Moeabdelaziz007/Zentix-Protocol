import { Button } from '@/components/ui/button';
import { Rocket, FileText } from 'lucide-react';
import { QuantumOrb } from './QuantumOrb';

export function HeroSection() {
  return (
    <section className="relative h-[40vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Animated Quantum Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/20 via-[#0A0E1A] to-[#B47EFF]/20 gradient-shift" />
      
      {/* Floating Quantum Orbs */}
      <QuantumOrb size={120} delay={0} color="cyan" />
      <QuantumOrb size={80} delay={2} color="purple" />
      <QuantumOrb size={100} delay={4} color="green" />
      <QuantumOrb size={60} delay={1} color="cyan" />
      <QuantumOrb size={90} delay={3} color="purple" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold mb-6 fade-in-up">
          <span className="bg-gradient-to-r from-[#00D9FF] via-[#B47EFF] to-[#10B981] bg-clip-text text-transparent">
            Autonomous Intelligence
          </span>
          <br />
          <span className="text-white">Operating System</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto fade-in-up" style={{ animationDelay: '0.2s' }}>
          The next generation protocol for coordinating AI agents with quantum-inspired architecture
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] transition-all duration-300 text-lg px-8 py-6 group"
          >
            <Rocket className="mr-2 group-hover:translate-x-1 transition-transform" size={24} />
            Launch AIOS
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-[#00D9FF]/50 hover:bg-[#00D9FF]/10 hover:border-[#00D9FF] hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all duration-300 text-lg px-8 py-6 group"
          >
            <FileText className="mr-2 group-hover:scale-110 transition-transform" size={24} />
            View Documentation
          </Button>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0E1A] to-transparent" />
    </section>
  );
}