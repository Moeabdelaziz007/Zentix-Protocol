import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { QuantumOrb } from './QuantumOrb';
import { Button } from '@/components/ui/Button';

export function ProtocolHero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-quantum-bg">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <QuantumOrb size="lg" color="cyan" className="absolute top-20 left-10" delay={0} />
        <QuantumOrb size="md" color="purple" className="absolute top-40 right-20" delay={0.2} />
        <QuantumOrb size="sm" color="green" className="absolute bottom-20 left-1/4" delay={0.4} />
        <QuantumOrb size="md" color="cyan" className="absolute bottom-40 right-1/3" delay={0.6} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full aiz-glass border border-aiz-primary/30"
          >
            <Sparkles className="w-4 h-4 text-aiz-primary" />
            <span className="text-sm font-medium">Introducing AIOS v2.0</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight">
            <span className="block">Autonomous Intelligence</span>
            <span className="block bg-gradient-to-r from-aiz-primary via-aiz-secondary to-aiz-accent bg-clip-text text-transparent gradient-shift">
              Operating System
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Build, deploy, and manage autonomous AI zones with blockchain-backed identity,
            decentralized governance, and intelligent collaboration.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-aiz-primary to-aiz-secondary hover:opacity-90 text-white font-semibold px-8 py-6 text-lg group"
            >
              Launch AIOS
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-aiz-primary/50 hover:bg-aiz-primary/10 px-8 py-6 text-lg"
            >
              View Documentation
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto"
          >
            {[
              { label: 'Active Zones', value: '12+' },
              { label: 'Agents Deployed', value: '150+' },
              { label: 'Decisions Logged', value: '10K+' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-aiz-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}