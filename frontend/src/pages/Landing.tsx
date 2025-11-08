import { HeroSection } from '@/components/landing/HeroSection';
import { AgentNetworkViz } from '@/components/landing/AgentNetworkViz';
import { ProtocolOverview } from '@/components/landing/ProtocolOverview';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { TechStack } from '@/components/landing/TechStack';
import { CTASection } from '@/components/landing/CTASection';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white overflow-hidden">
      <HeroSection />
      <AgentNetworkViz />
      <ProtocolOverview />
      <FeaturesGrid />
      <DashboardPreview />
      <TechStack />
      <CTASection />
    </div>
  );
}