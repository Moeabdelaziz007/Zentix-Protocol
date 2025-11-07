/**
 * Anomaly Detector (AI-powered)
 * Uses statistical analysis and pattern recognition to detect abnormal behavior
 * Predicts crashes before they happen
 * 
 * @module anomalyDetector
 * @version 1.0.0
 */

import { PerformanceMonitor, PerformanceMetrics } from '../monitoring/performanceMonitor';
import { AgentLogger, LogLevel, LogEntry } from '../utils/agentLogger';

export interface AnomalyScore {
  timestamp: string;
  overall_score: number; // 0-1, higher = more anomalous
  error_anomaly: number;
  performance_anomaly: number;
  memory_anomaly: number;
  pattern_anomaly: number;
  risk_level: 'normal' | 'warning' | 'alert' | 'critical';
  detected_patterns: string[];
}

export interface PredictedCrash {
  probability: number; // 0-1
  predicted_time_minutes: number;
  primary_cause: string;
  contributing_factors: string[];
  recommended_actions: string[];
  confidence: number;
}

/**
 * Anomaly Detector
 */
export class AnomalyDetector {
  private static metricsBaseline: PerformanceMetrics[] = [];
  private static anomalyHistory: AnomalyScore[] = [];
  private static readonly BASELINE_SIZE = 50;
  private static readonly MAX_HISTORY = 200;
  private static readonly ANOMALY_THRESHOLD = 0.7;

  /**
   * Initialize baseline from current metrics
   */
  static initializeBaseline(): void {
    const metrics = PerformanceMonitor.getCurrentMetrics();
    this.metricsBaseline.push(metrics);

    AgentLogger.log(LogLevel.INFO, 'AnomalyDetector', 'baselineInitialized', {
      baseline_size: this.metricsBaseline.length,
    });
  }

  /**
   * Update baseline with new metrics
   */
  static updateBaseline(): void {
    const metrics = PerformanceMonitor.getCurrentMetrics();
    this.metricsBaseline.push(metrics);

    if (this.metricsBaseline.length > this.BASELINE_SIZE) {
      this.metricsBaseline = this.metricsBaseline.slice(-this.BASELINE_SIZE);
    }
  }

  /**
   * Detect anomalies in current metrics
   */
  static detectAnomalies(): AnomalyScore {
    if (this.metricsBaseline.length < 5) {
      return this.createNormalScore();
    }

    const currentMetrics = PerformanceMonitor.getCurrentMetrics();
    const logs = AgentLogger.exportLogs();

    // Calculate individual anomaly scores
    const errorAnomaly = this.calculateErrorAnomaly(currentMetrics);
    const performanceAnomaly = this.calculatePerformanceAnomaly(currentMetrics);
    const memoryAnomaly = this.calculateMemoryAnomaly(currentMetrics);
    const patternAnomaly = this.calculatePatternAnomaly(logs);

    // Weighted overall score
    const overallScore = (
      errorAnomaly * 0.35 +
      performanceAnomaly * 0.30 +
      memoryAnomaly * 0.20 +
      patternAnomaly * 0.15
    );

    // Detect patterns
    const detectedPatterns = this.detectPatterns(currentMetrics, logs);

    // Determine risk level
    let riskLevel: 'normal' | 'warning' | 'alert' | 'critical' = 'normal';
    if (overallScore > 0.9) riskLevel = 'critical';
    else if (overallScore > 0.7) riskLevel = 'alert';
    else if (overallScore > 0.5) riskLevel = 'warning';

    const anomalyScore: AnomalyScore = {
      timestamp: new Date().toISOString(),
      overall_score: parseFloat(overallScore.toFixed(3)),
      error_anomaly: parseFloat(errorAnomaly.toFixed(3)),
      performance_anomaly: parseFloat(performanceAnomaly.toFixed(3)),
      memory_anomaly: parseFloat(memoryAnomaly.toFixed(3)),
      pattern_anomaly: parseFloat(patternAnomaly.toFixed(3)),
      risk_level: riskLevel,
      detected_patterns: detectedPatterns,
    };

    this.anomalyHistory.push(anomalyScore);
    if (this.anomalyHistory.length > this.MAX_HISTORY) {
      this.anomalyHistory = this.anomalyHistory.slice(-this.MAX_HISTORY);
    }

    if (riskLevel !== 'normal') {
      AgentLogger.log(LogLevel.WARN, 'AnomalyDetector', 'anomalyDetected', {
        overall_score: anomalyScore.overall_score,
        risk_level: riskLevel,
        patterns: detectedPatterns.length,
      });
    }

    return anomalyScore;
  }

  /**
   * Calculate error rate anomaly
   */
  private static calculateErrorAnomaly(current: PerformanceMetrics): number {
    const baselineErrorRates = this.metricsBaseline.map(m => m.error_rate_percent);
    const mean = baselineErrorRates.reduce((a, b) => a + b) / baselineErrorRates.length;
    const variance = baselineErrorRates.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / baselineErrorRates.length;
    const stdDev = Math.sqrt(variance);

    // Z-score
    const zScore = stdDev > 0 ? Math.abs((current.error_rate_percent - mean) / stdDev) : 0;
    
    // Convert to anomaly score (0-1)
    return Math.min(1, zScore / 4); // 4 standard deviations = anomaly
  }

  /**
   * Calculate performance anomaly
   */
  private static calculatePerformanceAnomaly(current: PerformanceMetrics): number {
    const baselineResponseTimes = this.metricsBaseline.map(m => m.avg_response_time_ms);
    const mean = baselineResponseTimes.reduce((a, b) => a + b) / baselineResponseTimes.length;
    const variance = baselineResponseTimes.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / baselineResponseTimes.length;
    const stdDev = Math.sqrt(variance);

    const zScore = stdDev > 0 ? Math.abs((current.avg_response_time_ms - mean) / stdDev) : 0;
    return Math.min(1, zScore / 4);
  }

  /**
   * Calculate memory anomaly
   */
  private static calculateMemoryAnomaly(current: PerformanceMetrics): number {
    const baselineMemory = this.metricsBaseline.map(m => m.memory_usage_mb);
    const mean = baselineMemory.reduce((a, b) => a + b) / baselineMemory.length;
    const variance = baselineMemory.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / baselineMemory.length;
    const stdDev = Math.sqrt(variance);

    const zScore = stdDev > 0 ? Math.abs((current.memory_usage_mb - mean) / stdDev) : 0;
    return Math.min(1, zScore / 4);
  }

  /**
   * Calculate pattern anomaly in logs
   */
  private static calculatePatternAnomaly(logs: LogEntry[]): number {
    const recentLogs = logs.slice(-100);
    if (recentLogs.length < 10) return 0;

    // Check for error bursts
    const errorFrequency = recentLogs.filter(l => l.level === 'ERROR').length / recentLogs.length;
    const baselineErrorFrequency = 0.02; // 2% expected

    const errorBurstAnomaly = Math.min(1, (errorFrequency - baselineErrorFrequency) / baselineErrorFrequency);

    // Check for timeout patterns
    const slowLogs = recentLogs.filter(l => l.duration_ms && l.duration_ms > 1000);
    const slowRatio = slowLogs.length / recentLogs.length;
    const baselineSlowRatio = 0.05; // 5% expected

    const slowPatternAnomaly = Math.min(1, (slowRatio - baselineSlowRatio) / baselineSlowRatio);

    return Math.max(0, Math.max(errorBurstAnomaly, slowPatternAnomaly));
  }

  /**
   * Detect specific patterns
   */
  private static detectPatterns(current: PerformanceMetrics, logs: LogEntry[]): string[] {
    const patterns: string[] = [];

    // Pattern 1: Error spike
    if (current.error_rate_percent > 5) {
      patterns.push('⚠️ Error spike detected');
    }

    // Pattern 2: Memory leak
    if (current.memory_usage_mb > 512) {
      patterns.push('💾 High memory usage (potential leak)');
    }

    // Pattern 3: Response time degradation
    if (current.avg_response_time_ms > 200) {
      patterns.push('⏱️ Slow response times');
    }

    // Pattern 4: Repeated operation failures
    const errorLog = logs.slice(-50).filter(l => l.level === 'ERROR');
    if (errorLog.length > 3) {
      const errorOps = errorLog.map(l => l.operation).filter((v, i, a) => a.indexOf(v) === i);
      if (errorOps.length === 1) {
        patterns.push(`🔄 Repeated failures in ${errorOps[0]}`);
      }
    }

    // Pattern 5: Cascading failures
    if (current.error_rate_percent > 2 && current.avg_response_time_ms > 100) {
      patterns.push('🌊 Cascading failures detected');
    }

    return patterns;
  }

  /**
   * Predict crash probability
   */
  static predictCrash(): PredictedCrash {
    const anomalyScore = this.detectAnomalies();

    // Trend analysis
    const recentAnomalies = this.anomalyHistory.slice(-10);
    const trend = this.calculateTrend(recentAnomalies.map(a => a.overall_score));

    // Crash probability based on anomaly score and trend
    let crashProbability = anomalyScore.overall_score;
    if (trend > 0) {
      crashProbability = Math.min(1, crashProbability + trend * 0.3);
    }

    // Predict time to crash (minutes)
    let predictedTime = 60; // Default 1 hour
    if (crashProbability > 0.8) {
      predictedTime = 5; // 5 minutes
    } else if (crashProbability > 0.6) {
      predictedTime = 15; // 15 minutes
    } else if (crashProbability > 0.4) {
      predictedTime = 30; // 30 minutes
    }

    // Determine primary cause
    let primaryCause = 'Unknown';
    if (anomalyScore.error_anomaly > 0.7) {
      primaryCause = 'High error rate';
    } else if (anomalyScore.memory_anomaly > 0.7) {
      primaryCause = 'Memory issue (leak or overflow)';
    } else if (anomalyScore.performance_anomaly > 0.7) {
      primaryCause = 'Performance degradation';
    }

    // Contributing factors
    const contributingFactors: string[] = [];
    if (anomalyScore.error_anomaly > 0.5) contributingFactors.push('Error rate elevated');
    if (anomalyScore.memory_anomaly > 0.5) contributingFactors.push('Memory usage elevated');
    if (anomalyScore.performance_anomaly > 0.5) contributingFactors.push('Response time elevated');
    if (anomalyScore.pattern_anomaly > 0.5) contributingFactors.push('Unusual patterns detected');

    // Recommended actions
    const recommendedActions: string[] = [];
    if (crashProbability > 0.7) {
      recommendedActions.push('Immediately increase monitoring frequency');
      recommendedActions.push('Prepare rollback procedure');
      recommendedActions.push('Alert on-call engineers');
    }
    if (anomalyScore.memory_anomaly > 0.6) {
      recommendedActions.push('Check for memory leaks');
      recommendedActions.push('Consider immediate scaling or restart');
    }
    if (anomalyScore.error_anomaly > 0.6) {
      recommendedActions.push('Review error logs for patterns');
      recommendedActions.push('Check external API availability');
    }

    return {
      probability: parseFloat(crashProbability.toFixed(3)),
      predicted_time_minutes: predictedTime,
      primary_cause: primaryCause,
      contributing_factors: contributingFactors,
      recommended_actions: recommendedActions,
      confidence: parseFloat((0.7 + (this.anomalyHistory.length / this.MAX_HISTORY) * 0.3).toFixed(2)),
    };
  }

  /**
   * Calculate trend from anomaly scores
   */
  private static calculateTrend(scores: number[]): number {
    if (scores.length < 2) return 0;

    const recent = scores.slice(-5);
    const older = scores.slice(-10, -5);

    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b) / older.length : recentAvg;

    return (recentAvg - olderAvg) / Math.max(olderAvg, 0.01);
  }

  /**
   * Get anomaly history
   */
  static getHistory(limit: number = 50): AnomalyScore[] {
    return this.anomalyHistory.slice(-limit);
  }

  /**
   * Get current status
   */
  static getStatus(): {
    baseline_size: number;
    recent_anomaly: AnomalyScore | null;
    crash_prediction: PredictedCrash | null;
    anomaly_history_count: number;
  } {
    const recent = this.anomalyHistory[this.anomalyHistory.length - 1] || null;
    const prediction = recent ? this.predictCrash() : null;

    return {
      baseline_size: this.metricsBaseline.length,
      recent_anomaly: recent,
      crash_prediction: prediction,
      anomaly_history_count: this.anomalyHistory.length,
    };
  }

  /**
   * Create normal score when not enough baseline
   */
  private static createNormalScore(): AnomalyScore {
    return {
      timestamp: new Date().toISOString(),
      overall_score: 0,
      error_anomaly: 0,
      performance_anomaly: 0,
      memory_anomaly: 0,
      pattern_anomaly: 0,
      risk_level: 'normal',
      detected_patterns: [],
    };
  }
}
