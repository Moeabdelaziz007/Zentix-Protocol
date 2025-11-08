/**
 * Performance Monitoring System
 * Real-time metrics aggregation and dashboard
 */

import { AgentLogger, LogEntry } from '../utils/agentLogger';
import { MetaSelfMonitoringLoop } from './metaSelfMonitoringLoop';

export interface PerformanceMetrics {
  timestamp: string;
  operations_total: number;
  operations_per_second: number;
  avg_response_time_ms: number;
  error_rate_percent: number;
  memory_usage_mb: number;
  active_agents: string[];
  slowest_operations: Array<{
    agent: string;
    operation: string;
    duration_ms: number;
  }>;
  agent_breakdown: Record<string, {
    count: number;
    avg_duration_ms: number;
    error_count: number;
  }>;
}

export interface PerformanceDashboard {
  current: PerformanceMetrics;
  history: PerformanceMetrics[];
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
}

/**
 * Performance Monitor
 * Tracks and aggregates agent performance metrics
 */
export class PerformanceMonitor {
  private static startTime = Date.now();
  private static metricsHistory: PerformanceMetrics[] = [];
  private static readonly MAX_HISTORY = 100;
  private static alertThresholds = {
    avgResponseTime: 100, // ms
    errorRate: 5, // percent
    memoryUsage: 512, // MB
  };

  /**
   * Get current performance snapshot
   */
  static getCurrentMetrics(): PerformanceMetrics {
    const stats = AgentLogger.getStats();
    const logs = AgentLogger.exportLogs();
    const now = Date.now();
    const uptimeSeconds = (now - this.startTime) / 1000;

    // Calculate operations per second
    const opsPerSecond = stats.total_operations / uptimeSeconds;

    // Calculate error rate
    const errorCount = stats.by_level?.ERROR || 0;
    const errorRate = stats.total_operations > 0
      ? (errorCount / stats.total_operations) * 100
      : 0;

    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryMB = memUsage.heapUsed / 1024 / 1024;

    // Active agents
    const activeAgents = Object.keys(stats.by_agent || {});

    // Slowest operations
    const slowest = logs
      .filter(log => log.duration_ms)
      .sort((a, b) => (b.duration_ms || 0) - (a.duration_ms || 0))
      .slice(0, 5)
      .map(log => ({
        agent: log.agent,
        operation: log.operation,
        duration_ms: log.duration_ms || 0,
      }));

    // Agent breakdown
    const agentBreakdown: Record<string, {
      count: number;
      avg_duration_ms: number;
      error_count: number;
    }> = {};

    Object.keys(stats.by_agent || {}).forEach(agent => {
      const agentLogs = logs.filter(log => log.agent === agent);
      const durationsLogs = agentLogs.filter(log => log.duration_ms);
      const avgDuration = durationsLogs.length > 0
        ? durationsLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / durationsLogs.length
        : 0;
      const errors = agentLogs.filter(log => log.level === 'ERROR').length;

      agentBreakdown[agent] = {
        count: stats.by_agent[agent],
        avg_duration_ms: avgDuration,
        error_count: errors,
      };
    });

    const metrics = {
      timestamp: new Date().toISOString(),
      operations_total: stats.total_operations,
      operations_per_second: parseFloat(opsPerSecond.toFixed(2)),
      avg_response_time_ms: parseFloat(stats.avg_duration_ms.toFixed(2)),
      error_rate_percent: parseFloat(errorRate.toFixed(2)),
      memory_usage_mb: parseFloat(memoryMB.toFixed(2)),
      active_agents: activeAgents,
      slowest_operations: slowest,
      agent_breakdown: agentBreakdown,
    };

    // Notify meta self-monitoring loop of new metrics
    // This enables the loop to observe and adapt based on performance data
    MetaSelfMonitoringLoop.observeCognitiveProcess({
      id: `metrics-${now}`,
      agentId: 'PerformanceMonitor',
      processType: 'metrics-collection',
      startTime: now,
      inputs: [],
      outputs: [metrics],
      confidence: 1.0,
      resourcesUsed: {
        cpu: process.cpuUsage().user / 1000000, // Convert to seconds
        memory: memoryMB,
        network: 0 // Would need to track network usage separately
      },
      decisionPath: ['collect-metrics', 'analyze-data', 'generate-report']
    });

    return metrics;
  }

  /**
   * Get full dashboard with alerts
   */
  static getDashboard(): PerformanceDashboard {
    const current = this.getCurrentMetrics();

    // Store in history
    this.metricsHistory.push(current);
    if (this.metricsHistory.length > this.MAX_HISTORY) {
      this.metricsHistory = this.metricsHistory.slice(-this.MAX_HISTORY);
    }

    // Generate alerts
    const alerts: PerformanceDashboard['alerts'] = [];

    if (current.avg_response_time_ms > this.alertThresholds.avgResponseTime) {
      alerts.push({
        severity: 'warning',
        message: `Average response time (${current.avg_response_time_ms}ms) exceeds threshold (${this.alertThresholds.avgResponseTime}ms)`,
        timestamp: current.timestamp,
      });
    }

    if (current.error_rate_percent > this.alertThresholds.errorRate) {
      alerts.push({
        severity: 'critical',
        message: `Error rate (${current.error_rate_percent}%) exceeds threshold (${this.alertThresholds.errorRate}%)`,
        timestamp: current.timestamp,
      });
    }

    if (current.memory_usage_mb > this.alertThresholds.memoryUsage) {
      alerts.push({
        severity: 'warning',
        message: `Memory usage (${current.memory_usage_mb}MB) exceeds threshold (${this.alertThresholds.memoryUsage}MB)`,
        timestamp: current.timestamp,
      });
    }

    return {
      current,
      history: this.metricsHistory.slice(-20), // Last 20 snapshots
      alerts,
    };
  }

  /**
   * Export metrics for external monitoring
   */
  static exportPrometheusMetrics(): string {
    const metrics = this.getCurrentMetrics();

    return `
# HELP zentix_operations_total Total number of operations
# TYPE zentix_operations_total counter
zentix_operations_total ${metrics.operations_total}

# HELP zentix_operations_per_second Operations per second
# TYPE zentix_operations_per_second gauge
zentix_operations_per_second ${metrics.operations_per_second}

# HELP zentix_avg_response_time_ms Average response time in milliseconds
# TYPE zentix_avg_response_time_ms gauge
zentix_avg_response_time_ms ${metrics.avg_response_time_ms}

# HELP zentix_error_rate_percent Error rate percentage
# TYPE zentix_error_rate_percent gauge
zentix_error_rate_percent ${metrics.error_rate_percent}

# HELP zentix_memory_usage_mb Memory usage in megabytes
# TYPE zentix_memory_usage_mb gauge
zentix_memory_usage_mb ${metrics.memory_usage_mb}

# HELP zentix_active_agents Number of active agents
# TYPE zentix_active_agents gauge
zentix_active_agents ${metrics.active_agents.length}
`.trim();
  }

  /**
   * Reset monitoring
   */
  static reset(): void {
    this.startTime = Date.now();
    this.metricsHistory = [];
    AgentLogger.clear();
  }

  /**
   * Set custom alert thresholds
   */
  static setThresholds(thresholds: Partial<typeof PerformanceMonitor.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }
}