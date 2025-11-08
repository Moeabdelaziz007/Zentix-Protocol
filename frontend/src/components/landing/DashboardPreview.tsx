import { GlassCard } from './GlassCard';
import { ConsciousnessIndicator } from './ConsciousnessIndicator';
import { Activity, TrendingUp, Zap } from 'lucide-react';

const performanceData = [
  { time: '00:00', value: 65 },
  { time: '04:00', value: 72 },
  { time: '08:00', value: 85 },
  { time: '12:00', value: 78 },
  { time: '16:00', value: 92 },
  { time: '20:00', value: 88 },
];

const activityData = [
  { name: 'Mon', agents: 45 },
  { name: 'Tue', agents: 52 },
  { name: 'Wed', agents: 61 },
  { name: 'Thu', agents: 58 },
  { name: 'Fri', agents: 70 },
];

const recentActivities = [
  { agent: 'Agent-Alpha-001', action: 'Completed task synthesis', state: 'fulfilled' as const, time: '2m ago' },
  { agent: 'Agent-Beta-042', action: 'Processing data stream', state: 'focused' as const, time: '5m ago' },
  { agent: 'Agent-Gamma-128', action: 'Exploring new patterns', state: 'curious' as const, time: '8m ago' },
];

export function DashboardPreview() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Live <span className="bg-gradient-to-r from-[#00D9FF] to-[#B47EFF] bg-clip-text text-transparent">Dashboard</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time metrics and agent activity monitoring
          </p>
        </div>

        <GlassCard glow="cyan" className="p-8">
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Stat Cards */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Active Agents</span>
                <Activity className="text-[#00D9FF]" size={20} />
              </div>
              <div className="text-3xl font-bold">247</div>
              <div className="text-green-400 text-sm mt-1">+12% from last hour</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Tasks Completed</span>
                <TrendingUp className="text-[#B47EFF]" size={20} />
              </div>
              <div className="text-3xl font-bold">1,842</div>
              <div className="text-green-400 text-sm mt-1">+8% from yesterday</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Network Health</span>
                <Zap className="text-[#10B981]" size={20} />
              </div>
              <div className="text-3xl font-bold">98.5%</div>
              <div className="text-green-400 text-sm mt-1">Optimal performance</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D9FF] shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
                Performance Metrics
              </h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {performanceData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-[#00D9FF] to-[#00D9FF]/30 rounded-t-lg transition-all duration-300 hover:from-[#00D9FF]/80"
                      style={{ height: `${data.value}%` }}
                    />
                    <span className="text-xs text-gray-500">{data.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#B47EFF] shadow-[0_0_10px_rgba(180,126,255,0.5)] consciousness-pulse" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0">
                    <ConsciousnessIndicator state={activity.state} label="" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{activity.agent}</div>
                      <div className="text-gray-400 text-xs">{activity.action}</div>
                    </div>
                    <div className="text-gray-500 text-xs whitespace-nowrap">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}