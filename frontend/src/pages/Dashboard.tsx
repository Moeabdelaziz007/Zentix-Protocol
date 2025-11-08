import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../components/ui/GlassCard';
import { EnhancedStatCard } from '../components/dashboard/EnhancedStatCard';
import { ComplianceChart } from '@/components/charts/ComplianceChart';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { mockDashboardData } from '../data/dashboardMockData';
import { Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { data, loading, error } = useApi(
    () => apiService.getDashboardData().catch(() => mockDashboardData),
    []
  );

  const complianceChartData = [
    { date: '2025-01-14', score: 97.2 },
    { date: '2025-01-15', score: 96.8 },
    { date: '2025-01-16', score: 98.1 },
    { date: '2025-01-17', score: 97.5 },
    { date: '2025-01-18', score: 95.5 },
    { date: '2025-01-19', score: 96.0 },
    { date: '2025-01-20', score: 95.5 },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-10 w-64 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-error">Error loading dashboard data</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 glass-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-medium text-success">All Systems Operational</span>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-lg">Welcome back! Here's what's happening with your Zentix Protocol.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-slide-in-up delay-100">
          <EnhancedStatCard
            title="Active Guardians"
            value={data.guardians.active}
            subtitle={`Total: ${data.guardians.total}`}
            icon={<Shield />}
            trend={{ value: 12.5, isPositive: true }}
            sparklineData={[45, 52, 48, 55, 58, 62, 65]}
          />
        </div>

        <div className="animate-slide-in-up delay-200">
          <EnhancedStatCard
            title="Total Reports"
            value={data.reports.total}
            subtitle={`${data.reports.pending} pending review`}
            icon={<FileText />}
            trend={{ value: 8.3, isPositive: false }}
            sparklineData={[120, 135, 128, 142, 138, 145, 150]}
          />
        </div>

        <div className="animate-slide-in-up delay-300">
          <EnhancedStatCard
            title="Compliance Score"
            value={`${data.networkHealth.averageCompliance}%`}
            subtitle={`Status: ${data.networkHealth.status}`}
            icon={<CheckCircle />}
            trend={{ value: 2.1, isPositive: true }}
            sparklineData={[94, 95, 96, 95, 97, 96, 97]}
          />
        </div>

        <div className="animate-slide-in-up delay-400">
          <EnhancedStatCard
            title="Total Audits"
            value={data.governance.totalAudits}
            subtitle={`${data.governance.totalViolations} violations`}
            icon={<AlertTriangle />}
            trend={{ value: 5.7, isPositive: true }}
            sparklineData={[1200, 1350, 1280, 1420, 1380, 1450, 1500]}
          />
        </div>
      </div>

      <GlassCard variant="glass" className="animate-slide-in-up delay-500">
        <GlassCardHeader>
          <GlassCardTitle>Compliance Score Trend</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="transition-all duration-300 hover:scale-[1.01]">
            <ComplianceChart data={complianceChartData} />
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
