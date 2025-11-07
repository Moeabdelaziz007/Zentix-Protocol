/**
 * Metrics Intelligence Dashboard (UI Layer)
 * Real-time dashboard component integrating Healer, Optimizer, Alerts, Config, Anomaly, and Insights
 * 
 * @module metricsIntelligenceDashboard
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';

interface DashboardData {
  timestamp: string;
  performance_metrics: {
    operations_total: number;
    operations_per_second: number;
    avg_response_time_ms: number;
    error_rate_percent: number;
    memory_usage_mb: number;
  };
  healer_status: {
    total_healings: number;
    successful_healings: number;
    active_rules: number;
  };
  optimizer_report: {
    efficiency_score: number;
    high_priority_suggestions: number;
    potential_memory_savings: number;
  };
  alerts: {
    total_alerts: number;
    critical: number;
    warnings: number;
  };
  anomaly_score: {
    overall_score: number;
    risk_level: string;
    crash_probability: number;
  };
  config_status: {
    current_profile: string;
    memory_limit_mb: number;
  };
  insights: {
    health_status: string;
    top_findings: number;
  };
}

/**
 * Main Intelligence Dashboard Component
 */
export const MetricsIntelligenceDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/intelligence');
        const dashboardData = await response.json();
        setData(dashboardData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    // Fetch immediately and then every 2 seconds
    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading Intelligence Dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 Metrics Intelligence Dashboard</h1>
          <p className="text-slate-400">Real-time autonomous system monitoring and optimization</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Efficiency Score"
            value={data.optimizer_report.efficiency_score}
            unit="%"
            icon="📊"
            color="blue"
          />
          <KPICard
            title="Risk Level"
            value={data.anomaly_score.risk_level}
            unit=""
            icon="🚨"
            color={getRiskColor(data.anomaly_score.risk_level)}
          />
          <KPICard
            title="System Health"
            value={data.insights.health_status}
            unit=""
            icon="❤️"
            color={getHealthColor(data.insights.health_status)}
          />
          <KPICard
            title="Config Profile"
            value={data.config_status.current_profile}
            unit=""
            icon="⚙️"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Metrics */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">📈 Performance Metrics</h2>
            <div className="space-y-3">
              <MetricRow
                label="Operations/sec"
                value={data.performance_metrics.operations_per_second}
                unit="ops"
              />
              <MetricRow
                label="Avg Response"
                value={data.performance_metrics.avg_response_time_ms}
                unit="ms"
              />
              <MetricRow
                label="Error Rate"
                value={data.performance_metrics.error_rate_percent}
                unit="%"
                isAlert={data.performance_metrics.error_rate_percent > 5}
              />
              <MetricRow
                label="Memory Usage"
                value={data.performance_metrics.memory_usage_mb}
                unit="MB"
                isAlert={data.performance_metrics.memory_usage_mb > 512}
              />
            </div>
          </div>

          {/* Auto-Healer Status */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">🏥 Auto-Healer</h2>
            <div className="space-y-2 text-slate-300">
              <p>✅ Total Healings: <span className="font-bold text-green-400">{data.healer_status.total_healings}</span></p>
              <p>✨ Successful: <span className="font-bold text-green-400">{data.healer_status.successful_healings}</span></p>
              <p>🎯 Active Rules: <span className="font-bold text-blue-400">{data.healer_status.active_rules}</span></p>
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Optimizer */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">⚡ Self-Optimizer</h2>
            <div className="space-y-2 text-slate-300">
              <p>Efficiency: <span className="font-bold text-yellow-400">{data.optimizer_report.efficiency_score.toFixed(1)}%</span></p>
              <p>High-Priority Issues: <span className="font-bold text-orange-400">{data.optimizer_report.high_priority_suggestions}</span></p>
              <p>Memory Savings: <span className="font-bold text-green-400">{data.optimizer_report.potential_memory_savings.toFixed(0)}MB</span></p>
            </div>
          </div>

          {/* Anomaly Detector */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">🔮 Anomaly Detector</h2>
            <div className="space-y-2 text-slate-300">
              <p>Anomaly Score: <span className="font-bold">{(data.anomaly_score.overall_score * 100).toFixed(1)}%</span></p>
              <p>Crash Risk: <span className="font-bold text-red-400">{(data.anomaly_score.crash_probability * 100).toFixed(1)}%</span></p>
              <p>Risk Level: <span className={`font-bold ${getRiskLevelColor(data.anomaly_score.risk_level)}`}>{data.anomaly_score.risk_level.toUpperCase()}</span></p>
            </div>
          </div>

          {/* Alerts Summary */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">🚨 Alerts</h2>
            <div className="space-y-2 text-slate-300">
              <p>Total Alerts: <span className="font-bold">{data.alerts.total_alerts}</span></p>
              <p>Critical: <span className="font-bold text-red-400">{data.alerts.critical}</span></p>
              <p>Warnings: <span className="font-bold text-yellow-400">{data.alerts.warnings}</span></p>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-3">🎯 System Status Summary</h2>
          <p className="mb-2">
            Last Updated: <span className="font-mono text-blue-100">{new Date(data.timestamp).toLocaleTimeString()}</span>
          </p>
          <p className="text-sm text-blue-100">
            {getSystemStatusMessage(data)}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * KPI Card Component
 */
interface KPICardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600/20 border-blue-500 text-blue-400',
    green: 'bg-green-600/20 border-green-500 text-green-400',
    red: 'bg-red-600/20 border-red-500 text-red-400',
    yellow: 'bg-yellow-600/20 border-yellow-500 text-yellow-400',
    purple: 'bg-purple-600/20 border-purple-500 text-purple-400',
  };

  return (
    <div className={`rounded-lg p-6 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-300">{title}</p>
          <p className="text-2xl font-bold mt-2">
            {value}{unit && <span className="text-sm ml-1">{unit}</span>}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
};

/**
 * Metric Row Component
 */
interface MetricRowProps {
  label: string;
  value: number;
  unit: string;
  isAlert?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, unit, isAlert }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
      <span className="text-slate-300">{label}</span>
      <span className={`font-bold ${isAlert ? 'text-red-400' : 'text-green-400'}`}>
        {value.toFixed(2)} {unit}
      </span>
    </div>
  );
};

/**
 * Helper Functions
 */
function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical':
      return 'red';
    case 'alert':
      return 'yellow';
    case 'warning':
      return 'orange';
    default:
      return 'green';
  }
}

function getHealthColor(health: string): string {
  switch (health) {
    case 'excellent':
      return 'green';
    case 'good':
      return 'blue';
    case 'fair':
      return 'yellow';
    case 'poor':
      return 'red';
    default:
      return 'purple';
  }
}

function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical':
      return 'text-red-400';
    case 'alert':
      return 'text-yellow-400';
    case 'warning':
      return 'text-orange-400';
    default:
      return 'text-green-400';
  }
}

function getSystemStatusMessage(data: DashboardData): string {
  if (data.anomaly_score.risk_level === 'critical') {
    return '🚨 CRITICAL: Immediate attention required. System at risk of failure. Initiating emergency protocols.';
  }
  if (data.anomaly_score.crash_probability > 0.7) {
    return '⚠️ WARNING: High crash probability detected. Monitor closely and prepare for intervention.';
  }
  if (data.performance_metrics.error_rate_percent > 5) {
    return '⚡ ALERT: Elevated error rate. Auto-healer and optimizer running corrective actions.';
  }
  if (data.optimizer_report.efficiency_score < 70) {
    return '📊 OPTIMIZATION: System efficiency below target. Applying configuration adjustments.';
  }
  return '✅ NOMINAL: All systems operating normally. Continuous monitoring and optimization active.';
}

export default MetricsIntelligenceDashboard;
