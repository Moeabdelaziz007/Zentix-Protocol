/**
 * Log-to-Insight AI
 * Transforms daily logs into intelligent, concise natural language reports
 * Identifies patterns, trends, and actionable insights
 * 
 * @module logInsightAI
 * @version 1.0.0
 */

import { AgentLogger, LogEntry, LogLevel } from '../utils/agentLogger';
import { PerformanceMonitor } from '../monitoring/performanceMonitor';

export interface LogInsight {
  category: string;
  finding: string;
  severity: 'info' | 'warning' | 'critical';
  evidence: string;
  recommendation: string;
}

export interface DailyReport {
  date: string;
  period_hours: number;
  total_operations: number;
  total_errors: number;
  summary: string;
  insights: LogInsight[];
  statistics: {
    avg_response_time_ms: number;
    error_rate_percent: number;
    most_active_agent: string;
    slowest_operation: string;
    busiest_hour: string;
  };
  health_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  natural_language_summary: string;
}

/**
 * Log-to-Insight AI
 */
export class LogInsightAI {
  private static reportHistory: DailyReport[] = [];
  private static readonly MAX_HISTORY = 100;

  /**
   * Generate daily report from logs
   */
  static generateDailyReport(periodHours: number = 24): DailyReport {
    const logs = AgentLogger.exportLogs();
    const metrics = PerformanceMonitor.getCurrentMetrics();

    // Filter logs for the period
    const cutoffTime = Date.now() - periodHours * 60 * 60 * 1000;
    const periodLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime > cutoffTime;
    });

    if (periodLogs.length === 0) {
      return this.createEmptyReport(periodHours);
    }

    // Extract statistics
    const stats = this.extractStatistics(periodLogs, metrics, periodHours);

    // Generate insights
    const insights = this.generateInsights(periodLogs, stats, metrics);

    // Determine health status
    const healthStatus = this.determineHealthStatus(metrics, insights);

    // Generate natural language summary
    const nlSummary = this.generateNaturalLanguageSummary(stats, insights, healthStatus, periodHours);

    // Create executive summary
    const summary = this.createExecutiveSummary(stats, insights);

    const report: DailyReport = {
      date: new Date().toISOString().split('T')[0],
      period_hours: periodHours,
      total_operations: stats.total_operations,
      total_errors: stats.total_errors,
      summary,
      insights: insights.slice(0, 10), // Top 10 insights
      statistics: stats,
      health_status: healthStatus,
      natural_language_summary: nlSummary,
    };

    this.reportHistory.push(report);
    if (this.reportHistory.length > this.MAX_HISTORY) {
      this.reportHistory = this.reportHistory.slice(-this.MAX_HISTORY);
    }

    return report;
  }

  /**
   * Extract statistics from logs
   */
  private static extractStatistics(
    logs: LogEntry[],
    metrics: any,
    periodHours: number
  ): DailyReport['statistics'] {
    const errors = logs.filter(l => l.level === 'ERROR');
    const durations = logs.filter(l => l.duration_ms).map(l => l.duration_ms || 0);

    // Find most active agent
    const agentCounts = new Map<string, number>();
    logs.forEach(log => {
      agentCounts.set(log.agent, (agentCounts.get(log.agent) || 0) + 1);
    });
    const mostActiveAgent = Array.from(agentCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    // Find slowest operation
    const slowestOp = logs
      .filter(l => l.duration_ms)
      .sort((a, b) => (b.duration_ms || 0) - (a.duration_ms || 0))[0];

    // Find busiest hour (simplified)
    const hourCounts = new Map<string, number>();
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const key = `${hour}:00`;
      hourCounts.set(key, (hourCounts.get(key) || 0) + 1);
    });
    const busiestHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      avg_response_time_ms: durations.length > 0
        ? durations.reduce((a, b) => a + b) / durations.length
        : 0,
      error_rate_percent: logs.length > 0 ? (errors.length / logs.length) * 100 : 0,
      most_active_agent: mostActiveAgent,
      slowest_operation: slowestOp ? `${slowestOp.agent}.${slowestOp.operation}` : 'N/A',
      busiest_hour: busiestHour,
    };
  }

  /**
   * Generate insights from logs
   */
  private static generateInsights(
    logs: LogEntry[],
    stats: any,
    metrics: any
  ): LogInsight[] {
    const insights: LogInsight[] = [];

    // Insight 1: Error patterns
    const errors = logs.filter(l => l.level === 'ERROR');
    if (errors.length > 10) {
      const errorTypes = new Map<string, number>();
      errors.forEach(err => {
        const key = err.error || 'Unknown';
        errorTypes.set(key, (errorTypes.get(key) || 0) + 1);
      });

      const topError = Array.from(errorTypes.entries())
        .sort((a, b) => b[1] - a[1])[0];

      insights.push({
        category: 'Error Patterns',
        finding: `Most common error: "${topError[0]}" (${topError[1]} occurrences)`,
        severity: topError[1] > 20 ? 'critical' : 'warning',
        evidence: `Found ${errors.length} total errors in ${logs.length} operations (${stats.error_rate_percent.toFixed(1)}% error rate)`,
        recommendation: `Investigate root cause of "${topError[0]}". Consider adding retry logic or improving validation.`,
      });
    }

    // Insight 2: Performance degradation
    const slowOps = logs.filter(l => l.duration_ms && l.duration_ms > 100);
    if (slowOps.length / logs.length > 0.1) {
      insights.push({
        category: 'Performance',
        finding: `${((slowOps.length / logs.length) * 100).toFixed(1)}% of operations exceed 100ms`,
        severity: 'warning',
        evidence: `Average response time: ${stats.avg_response_time_ms.toFixed(1)}ms. Slowest: ${logs
          .filter(l => l.duration_ms)
          .sort((a, b) => (b.duration_ms || 0) - (a.duration_ms || 0))[0]?.duration_ms || 'N/A'}ms`,
        recommendation: 'Profile slow operations. Consider caching, optimization, or scaling.',
      });
    }

    // Insight 3: Agent load distribution
    const agentOps = new Map<string, number>();
    logs.forEach(log => {
      agentOps.set(log.agent, (agentOps.get(log.agent) || 0) + 1);
    });

    const agents = Array.from(agentOps.entries()).sort((a, b) => b[1] - a[1]);
    const topAgent = agents[0];
    if (topAgent && topAgent[1] / logs.length > 0.5) {
      insights.push({
        category: 'Load Distribution',
        finding: `Single agent (${topAgent[0]}) handles ${((topAgent[1] / logs.length) * 100).toFixed(1)}% of traffic`,
        severity: 'info',
        evidence: `${topAgent[1]} out of ${logs.length} operations from ${topAgent[0]}`,
        recommendation: 'Consider load balancing or distributing work across multiple agents.',
      });
    }

    // Insight 4: Stability trend
    const successCount = logs.filter(l => l.level === 'SUCCESS').length;
    if (successCount / logs.length > 0.95) {
      insights.push({
        category: 'Stability',
        finding: `High stability: ${((successCount / logs.length) * 100).toFixed(1)}% success rate`,
        severity: 'info',
        evidence: `${successCount} successful operations out of ${logs.length}`,
        recommendation: 'System is performing well. Continue current practices.',
      });
    }

    // Insight 5: Resource utilization
    if (metrics.memory_usage_mb > 512) {
      insights.push({
        category: 'Resources',
        finding: `High memory usage: ${metrics.memory_usage_mb.toFixed(0)}MB`,
        severity: 'warning',
        evidence: `Current memory: ${metrics.memory_usage_mb.toFixed(0)}MB. Threshold: 512MB`,
        recommendation: 'Check for memory leaks. Consider garbage collection or scaling.',
      });
    }

    return insights;
  }

  /**
   * Determine overall health status
   */
  private static determineHealthStatus(
    metrics: any,
    insights: LogInsight[]
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const criticalIssues = insights.filter(i => i.severity === 'critical').length;
    const warnings = insights.filter(i => i.severity === 'warning').length;

    if (criticalIssues > 0 || metrics.error_rate_percent > 10) {
      return 'critical';
    }
    if (warnings > 3 || metrics.error_rate_percent > 5) {
      return 'poor';
    }
    if (warnings > 0 || metrics.error_rate_percent > 2) {
      return 'fair';
    }
    if (metrics.error_rate_percent > 0.5) {
      return 'good';
    }
    return 'excellent';
  }

  /**
   * Generate natural language summary
   */
  private static generateNaturalLanguageSummary(
    stats: any,
    insights: LogInsight[],
    healthStatus: string,
    periodHours: number
  ): string {
    const lines: string[] = [];

    lines.push(`📊 **${periodHours}-Hour System Report**\n`);

    // Health summary
    const healthEmojis = {
      excellent: '✅',
      good: '👍',
      fair: '⚠️',
      poor: '🔴',
      critical: '🚨',
    };

    lines.push(`Status: ${healthEmojis[healthStatus as keyof typeof healthEmojis]} ${healthStatus.toUpperCase()}\n`);

    // Key metrics
    lines.push(`📈 **Key Metrics:**`);
    lines.push(`• Total Operations: ${stats.total_operations}`);
    lines.push(`• Error Rate: ${stats.error_rate_percent.toFixed(2)}%`);
    lines.push(`• Avg Response: ${stats.avg_response_time_ms.toFixed(0)}ms`);
    lines.push(`• Most Active: ${stats.most_active_agent}`);
    lines.push(`• Busiest Hour: ${stats.busiest_hour}\n`);

    // Top insights
    if (insights.length > 0) {
      lines.push(`💡 **Top Findings:**`);
      insights.slice(0, 3).forEach(insight => {
        const severityIcon = {
          info: 'ℹ️',
          warning: '⚠️',
          critical: '🚨',
        };
        lines.push(`${severityIcon[insight.severity]} ${insight.finding}`);
      });
      lines.push('');
    }

    // Recommendation
    const criticalInsights = insights.filter(i => i.severity === 'critical');
    if (criticalInsights.length > 0) {
      lines.push(`⚡ **Immediate Action Required:**`);
      lines.push(`${criticalInsights[0].recommendation}\n`);
    }

    return lines.join('\n');
  }

  /**
   * Create executive summary
   */
  private static createExecutiveSummary(stats: any, insights: LogInsight[]): string {
    const topInsights = insights.slice(0, 3);
    const summaryLines: string[] = [];

    summaryLines.push(`Processed ${stats.total_operations} operations with ${stats.error_rate_percent.toFixed(2)}% error rate.`);

    if (topInsights.length > 0) {
      summaryLines.push(`Key findings: ${topInsights.map(i => i.finding.toLowerCase()).join('; ')}.`);
    }

    if (stats.error_rate_percent > 5) {
      summaryLines.push('Action required: High error rate detected.');
    }

    return summaryLines.join(' ');
  }

  /**
   * Get report history
   */
  static getReportHistory(limit: number = 30): DailyReport[] {
    return this.reportHistory.slice(-limit);
  }

  /**
   * Get latest report
   */
  static getLatestReport(): DailyReport | null {
    return this.reportHistory[this.reportHistory.length - 1] || null;
  }

  /**
   * Create empty report for period with no logs
   */
  private static createEmptyReport(periodHours: number): DailyReport {
    return {
      date: new Date().toISOString().split('T')[0],
      period_hours: periodHours,
      total_operations: 0,
      total_errors: 0,
      summary: 'No operations recorded in this period.',
      insights: [],
      statistics: {
        avg_response_time_ms: 0,
        error_rate_percent: 0,
        most_active_agent: 'N/A',
        slowest_operation: 'N/A',
        busiest_hour: 'N/A',
      },
      health_status: 'good',
      natural_language_summary: '✅ No activity recorded. System idle.',
    };
  }
}
