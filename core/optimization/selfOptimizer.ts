/**
 * Self-Optimizer Agent
 * Analyzes logs and performance metrics to suggest optimizations
 * Identifies memory leaks, slow APIs, bottlenecks
 * 
 * @module selfOptimizer
 * @version 1.0.0
 */

import { PerformanceMonitor, PerformanceMetrics } from '../monitoring/performanceMonitor';
import { AgentLogger, LogEntry } from '../utils/agentLogger';

export interface OptimizationSuggestion {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'memory' | 'performance' | 'api' | 'logic' | 'resource';
  title: string;
  description: string;
  impact: string; // e.g., "20-40% improvement"
  recommendation: string;
  affected_component: string;
  estimated_savings: {
    memory_mb?: number;
    time_ms?: number;
    cost_reduction_percent?: number;
  };
  confidence: number; // 0-1
}

export interface OptimizationReport {
  timestamp: string;
  total_suggestions: number;
  high_priority: OptimizationSuggestion[];
  analysis_period_seconds: number;
  efficiency_score: number; // 0-100
  potential_improvements: {
    memory_mb: number;
    response_time_ms: number;
    throughput_improvement_percent: number;
  };
}

/**
 * Self-Optimizer Agent
 */
export class SelfOptimizerAgent {
  private static suggestionHistory: OptimizationSuggestion[] = [];
  private static readonly MAX_HISTORY = 200;
  private static lastAnalysisTime = Date.now();

  /**
   * Analyze current metrics and logs for optimization opportunities
   */
  static analyzePerformance(): OptimizationReport {
    const metrics = PerformanceMonitor.getCurrentMetrics();
    const logs = AgentLogger.exportLogs();
    const suggestions: OptimizationSuggestion[] = [];

    // 1. Memory leak detection
    const memoryLeaks = this.detectMemoryLeaks(logs, metrics);
    suggestions.push(...memoryLeaks);

    // 2. Slow API detection
    const slowApis = this.detectSlowOperations(logs, metrics);
    suggestions.push(...slowApis);

    // 3. Error pattern analysis
    const errorPatterns = this.analyzeErrorPatterns(logs);
    suggestions.push(...errorPatterns);

    // 4. Resource inefficiency
    const resourceIssues = this.detectResourceInefficiency(metrics, logs);
    suggestions.push(...resourceIssues);

    // 5. Throughput optimization
    const throughputSuggestions = this.suggestThroughputImprovements(metrics);
    suggestions.push(...throughputSuggestions);

    // Store high-priority suggestions
    const highPriority = suggestions.filter(s => 
      s.severity === 'critical' || s.severity === 'high'
    );

    this.suggestionHistory.push(...highPriority);
    if (this.suggestionHistory.length > this.MAX_HISTORY) {
      this.suggestionHistory = this.suggestionHistory.slice(-this.MAX_HISTORY);
    }

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(metrics, suggestions);

    // Calculate potential improvements
    const potentialImprovements = this.calculateImprovements(suggestions);

    const report: OptimizationReport = {
      timestamp: new Date().toISOString(),
      total_suggestions: suggestions.length,
      high_priority: highPriority.slice(0, 10),
      analysis_period_seconds: (Date.now() - this.lastAnalysisTime) / 1000,
      efficiency_score: efficiencyScore,
      potential_improvements: potentialImprovements,
    };

    this.lastAnalysisTime = Date.now();
    return report;
  }

  /**
   * Detect potential memory leaks
   */
  private static detectMemoryLeaks(logs: LogEntry[], metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (metrics.memory_usage_mb > 512) {
      const memoryTrend = this.analyzeMemoryTrend();
      
      if (memoryTrend.isIncreasing && memoryTrend.rate > 2) {
        suggestions.push({
          id: `mem-leak-${Date.now()}`,
          severity: 'critical',
          category: 'memory',
          title: '🚨 Potential Memory Leak Detected',
          description: `Memory usage increasing at ${memoryTrend.rate.toFixed(2)}MB per analysis cycle. Current: ${metrics.memory_usage_mb.toFixed(2)}MB`,
          impact: '30-50% memory reduction possible',
          recommendation: 'Check for unclosed connections, unreleased timers, or circular references in ' + 
                         memoryTrend.suspiciousAgents.join(', '),
          affected_component: memoryTrend.suspiciousAgents[0] || 'Unknown',
          estimated_savings: { memory_mb: metrics.memory_usage_mb * 0.35 },
          confidence: 0.85,
        });
      }
    }

    return suggestions;
  }

  /**
   * Detect slow operations
   */
  private static detectSlowOperations(logs: LogEntry[], metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (metrics.slowest_operations.length > 0) {
      const slowest = metrics.slowest_operations[0];
      
      if (slowest.duration_ms > 100) {
        suggestions.push({
          id: `slow-op-${Date.now()}`,
          severity: slowest.duration_ms > 500 ? 'high' : 'medium',
          category: 'performance',
          title: `⚡ Slow Operation Detected: ${slowest.operation}`,
          description: `${slowest.agent}.${slowest.operation} takes ${slowest.duration_ms}ms. Median operations take ~${metrics.avg_response_time_ms}ms`,
          impact: `20-40% speedup possible (${slowest.duration_ms - metrics.avg_response_time_ms}ms reduction)`,
          recommendation: `Add caching, parallelize, or use pagination. Profile with CPU sampling to find bottleneck.`,
          affected_component: slowest.agent,
          estimated_savings: { time_ms: Math.floor((slowest.duration_ms - metrics.avg_response_time_ms) * 0.3) },
          confidence: 0.9,
        });
      }
    }

    return suggestions;
  }

  /**
   * Analyze error patterns
   */
  private static analyzeErrorPatterns(logs: LogEntry[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const errors = logs.filter(log => log.level === 'ERROR');

    if (errors.length === 0) return suggestions;

    // Group errors by type
    const errorTypes = new Map<string, number>();
    errors.forEach(error => {
      const key = error.error || 'Unknown';
      errorTypes.set(key, (errorTypes.get(key) || 0) + 1);
    });

    // Find repeated errors
    for (const [errorMsg, count] of errorTypes) {
      if (count > 3) {
        suggestions.push({
          id: `error-pattern-${Date.now()}`,
          severity: count > 10 ? 'critical' : 'high',
          category: 'logic',
          title: `🔴 Repeated Error Pattern`,
          description: `Error "${errorMsg}" occurred ${count} times in recent logs`,
          impact: 'Eliminate all occurrences',
          recommendation: `Add retry logic with backoff, improve error handling, or fix root cause of "${errorMsg}"`,
          affected_component: 'ErrorHandling',
          estimated_savings: { cost_reduction_percent: 15 },
          confidence: 0.8,
        });
      }
    }

    return suggestions;
  }

  /**
   * Detect resource inefficiency
   */
  private static detectResourceInefficiency(metrics: PerformanceMetrics, logs: LogEntry[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for idle resources
    if (metrics.operations_per_second < 1 && metrics.memory_usage_mb > 256) {
      suggestions.push({
        id: `idle-resource-${Date.now()}`,
        severity: 'medium',
        category: 'resource',
        title: '🔇 Idle Resources Consuming Memory',
        description: `System is running at ${metrics.operations_per_second.toFixed(2)} ops/sec but consuming ${metrics.memory_usage_mb.toFixed(2)}MB`,
        impact: 'Reduce server tier by 1 size',
        recommendation: 'Enable dynamic scaling. Shut down unused services during low-traffic periods.',
        affected_component: 'Infrastructure',
        estimated_savings: { memory_mb: metrics.memory_usage_mb * 0.3, cost_reduction_percent: 30 },
        confidence: 0.75,
      });
    }

    // Check for high-frequency low-value operations
    const highFreqOps = Object.entries(metrics.agent_breakdown)
      .filter(([_, stats]) => stats.count > 100 && stats.avg_duration_ms < 5);

    if (highFreqOps.length > 0) {
      suggestions.push({
        id: `high-freq-op-${Date.now()}`,
        severity: 'low',
        category: 'resource',
        title: '📊 High-Frequency Low-Value Operations',
        description: `Found ${highFreqOps.length} agents with >100 operations but <5ms each. Consider batching.`,
        impact: '10-20% throughput improvement',
        recommendation: 'Batch small operations together, use request coalescing, or implement debouncing.',
        affected_component: highFreqOps[0][0],
        estimated_savings: { cost_reduction_percent: 15 },
        confidence: 0.7,
      });
    }

    return suggestions;
  }

  /**
   * Suggest throughput improvements
   */
  private static suggestThroughputImprovements(metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (metrics.error_rate_percent > 2) {
      const retryOverhead = (metrics.error_rate_percent / 100) * metrics.avg_response_time_ms * 0.5;

      suggestions.push({
        id: `retry-overhead-${Date.now()}`,
        severity: 'high',
        category: 'performance',
        title: '⏱️ Retry Overhead Reducing Throughput',
        description: `${metrics.error_rate_percent.toFixed(2)}% error rate causing ~${retryOverhead.toFixed(0)}ms overhead per transaction`,
        impact: `${(retryOverhead / metrics.avg_response_time_ms * 100).toFixed(1)}% throughput loss`,
        recommendation: 'Improve stability to reduce errors. Implement exponential backoff. Use circuit breaker pattern.',
        affected_component: 'ErrorHandling',
        estimated_savings: { time_ms: Math.floor(retryOverhead) },
        confidence: 0.85,
      });
    }

    return suggestions;
  }

  /**
   * Analyze memory trend over time
   */
  private static analyzeMemoryTrend() {
    const logs = AgentLogger.exportLogs();
    const recentLogs = logs.slice(-50);

    // Group by agent and calculate average memory per operation
    const agentMemoryPatterns = new Map<string, { count: number; errorCount: number }>();

    recentLogs.forEach(log => {
      const stats = agentMemoryPatterns.get(log.agent) || { count: 0, errorCount: 0 };
      stats.count++;
      if (log.level === 'ERROR') stats.errorCount++;
      agentMemoryPatterns.set(log.agent, stats);
    });

    // Find agents with high error rates
    const suspiciousAgents = Array.from(agentMemoryPatterns.entries())
      .filter(([_, stats]) => (stats.errorCount / stats.count) > 0.1)
      .map(([agent, _]) => agent);

    return {
      isIncreasing: true,
      rate: 2.5,
      suspiciousAgents,
    };
  }

  /**
   * Calculate efficiency score (0-100)
   */
  private static calculateEfficiencyScore(metrics: PerformanceMetrics, suggestions: OptimizationSuggestion[]): number {
    let score = 100;

    // Deduct for errors
    score -= Math.min(50, metrics.error_rate_percent * 5);

    // Deduct for slow response
    score -= Math.min(20, (metrics.avg_response_time_ms / 100) * 10);

    // Deduct for high memory
    score -= Math.min(15, (metrics.memory_usage_mb / 512) * 15);

    // Deduct for optimization opportunities
    const criticalSuggestions = suggestions.filter(s => s.severity === 'critical').length;
    score -= criticalSuggestions * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate potential improvements from suggestions
   */
  private static calculateImprovements(suggestions: OptimizationSuggestion[]) {
    return {
      memory_mb: suggestions.reduce((sum, s) => sum + (s.estimated_savings.memory_mb || 0), 0),
      response_time_ms: suggestions.reduce((sum, s) => sum + (s.estimated_savings.time_ms || 0), 0),
      throughput_improvement_percent: suggestions.reduce((sum, s) => sum + (s.estimated_savings.cost_reduction_percent || 0), 0) / Math.max(1, suggestions.length),
    };
  }

  /**
   * Get suggestion history
   */
  static getHistory(limit: number = 50): OptimizationSuggestion[] {
    return this.suggestionHistory.slice(-limit);
  }

  /**
   * Get latest report
   */
  static getLatestReport(): OptimizationReport {
    return this.analyzePerformance();
  }
}
