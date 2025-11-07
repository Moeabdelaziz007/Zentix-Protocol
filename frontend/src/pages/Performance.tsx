/**
 * Performance Monitoring Dashboard
 * Real-time agent performance metrics
 */

import React, { useState, useEffect } from 'react';
import { Activity, Zap, AlertTriangle, TrendingUp, Clock, Database } from 'lucide-react';

interface PerformanceMetrics {
  timestamp: string;
  operations_total: number;
  operations_per_second: number;
  avg_response_time_ms: number;
  error_rate_percent: number;
  memory_usage_mb: number;
  active_agents: string[];
  agent_breakdown: Record<string, {
    count: number;
    avg_duration_ms: number;
    error_count: number;
  }>;
}

export default function Performance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000); // Update every 2s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/performance/metrics');
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted">Loading performance data...</div>
      </div>
    );
  }

  const getStatusColor = (value: number, threshold: number, inverse = false) => {
    const exceeded = inverse ? value < threshold : value > threshold;
    return exceeded ? 'text-red-500' : 'text-green-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Performance Monitoring</h1>
        <p className="text-muted">Real-time agent performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          title="Operations"
          value={metrics.operations_total.toLocaleString()}
          subtitle={`${metrics.operations_per_second.toFixed(1)} ops/sec`}
          trend="up"
        />

        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          title="Avg Response Time"
          value={`${metrics.avg_response_time_ms.toFixed(1)}ms`}
          subtitle="Average duration"
          className={getStatusColor(metrics.avg_response_time_ms, 100)}
        />

        <MetricCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Error Rate"
          value={`${metrics.error_rate_percent.toFixed(2)}%`}
          subtitle="Of total operations"
          className={getStatusColor(metrics.error_rate_percent, 5)}
        />

        <MetricCard
          icon={<Database className="w-5 h-5" />}
          title="Memory Usage"
          value={`${metrics.memory_usage_mb.toFixed(1)}MB`}
          subtitle="Heap memory"
          className={getStatusColor(metrics.memory_usage_mb, 512)}
        />

        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          title="Active Agents"
          value={metrics.active_agents.length.toString()}
          subtitle="Running processes"
          trend="up"
        />

        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Throughput"
          value={`${(metrics.operations_per_second * 60).toFixed(0)}`}
          subtitle="Operations per minute"
        />
      </div>

      {/* Agent Breakdown */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Agent Performance Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(metrics.agent_breakdown).map(([agent, stats]) => (
            <div key={agent} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">{agent}</div>
                <div className="text-sm text-muted">
                  {stats.count} operations · {stats.avg_duration_ms.toFixed(1)}ms avg
                </div>
              </div>
              <div className="text-right">
                {stats.error_count > 0 ? (
                  <span className="text-red-500 text-sm">
                    {stats.error_count} errors
                  </span>
                ) : (
                  <span className="text-green-500 text-sm">✓ Healthy</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="space-y-2">
          <HealthIndicator
            label="Response Time"
            status={metrics.avg_response_time_ms < 100 ? 'good' : 'warning'}
            value={`${metrics.avg_response_time_ms.toFixed(1)}ms`}
          />
          <HealthIndicator
            label="Error Rate"
            status={metrics.error_rate_percent < 5 ? 'good' : 'critical'}
            value={`${metrics.error_rate_percent.toFixed(2)}%`}
          />
          <HealthIndicator
            label="Memory"
            status={metrics.memory_usage_mb < 512 ? 'good' : 'warning'}
            value={`${metrics.memory_usage_mb.toFixed(1)}MB`}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down';
  className?: string;
}

function MetricCard({ icon, title, value, subtitle, trend, className = '' }: MetricCardProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-muted">{icon}</div>
        {trend && (
          <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
        )}
      </div>
      <div className="text-sm text-muted mb-1">{title}</div>
      <div className={`text-2xl font-bold mb-1 ${className}`}>{value}</div>
      <div className="text-xs text-muted">{subtitle}</div>
    </div>
  );
}

interface HealthIndicatorProps {
  label: string;
  status: 'good' | 'warning' | 'critical';
  value: string;
}

function HealthIndicator({ label, status, value }: HealthIndicatorProps) {
  const colors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <span>{label}</span>
      </div>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
