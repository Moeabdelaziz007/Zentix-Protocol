/**
 * Self-Tuning Config System
 * Automatically adjusts configuration based on system load
 * Dynamic scaling, timeout adjustments, concurrency control
 * 
 * @module selfTuningConfig
 * @version 1.0.0
 */

import { PerformanceMonitor, PerformanceMetrics } from '../monitoring/performanceMonitor';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

export interface ConfigProfile {
  name: string;
  description: string;
  max_concurrent_operations: number;
  request_timeout_ms: number;
  batch_size: number;
  cache_ttl_seconds: number;
  memory_limit_mb: number;
  error_threshold_percent: number;
  retry_max_attempts: number;
  retry_backoff_ms: number;
}

export interface ConfigAdjustment {
  timestamp: string;
  from_profile: string;
  to_profile: string;
  reason: string;
  metrics_trigger: Record<string, number>;
  estimated_savings: {
    memory_percent: number;
    latency_percent: number;
    cost_percent: number;
  };
}

export interface ConfigPrediction {
  suggested_profile: string;
  confidence: number;
  estimated_improvement_percent: number;
  reason: string;
}

/**
 * Configuration Profiles
 */
const CONFIG_PROFILES: Record<string, ConfigProfile> = {
  'eco-mode': {
    name: 'Eco Mode',
    description: 'Minimal resource usage, optimized for low traffic',
    max_concurrent_operations: 10,
    request_timeout_ms: 5000,
    batch_size: 5,
    cache_ttl_seconds: 300,
    memory_limit_mb: 256,
    error_threshold_percent: 2,
    retry_max_attempts: 2,
    retry_backoff_ms: 500,
  },
  'balanced-mode': {
    name: 'Balanced Mode',
    description: 'Moderate resource usage, good performance/cost ratio',
    max_concurrent_operations: 50,
    request_timeout_ms: 10000,
    batch_size: 20,
    cache_ttl_seconds: 600,
    memory_limit_mb: 512,
    error_threshold_percent: 5,
    retry_max_attempts: 3,
    retry_backoff_ms: 1000,
  },
  'performance-mode': {
    name: 'Performance Mode',
    description: 'Maximum throughput, optimized for high load',
    max_concurrent_operations: 200,
    request_timeout_ms: 15000,
    batch_size: 100,
    cache_ttl_seconds: 1200,
    memory_limit_mb: 1024,
    error_threshold_percent: 10,
    retry_max_attempts: 5,
    retry_backoff_ms: 2000,
  },
  'crisis-mode': {
    name: 'Crisis Mode',
    description: 'Survival mode for critical situations',
    max_concurrent_operations: 5,
    request_timeout_ms: 3000,
    batch_size: 1,
    cache_ttl_seconds: 60,
    memory_limit_mb: 128,
    error_threshold_percent: 1,
    retry_max_attempts: 1,
    retry_backoff_ms: 100,
  },
};

/**
 * Self-Tuning Config System
 */
export class SelfTuningConfig {
  private static currentProfile: ConfigProfile = CONFIG_PROFILES['balanced-mode'];
  private static adjustmentHistory: ConfigAdjustment[] = [];
  private static readonly MAX_HISTORY = 100;
  private static tuningInterval: NodeJS.Timeout | null = null;
  private static readonly TUNING_INTERVAL_MS = 60000; // 1 minute

  /**
   * Initialize self-tuning config system
   */
  static initialize(initialProfile: string = 'balanced-mode'): void {
    const profile = CONFIG_PROFILES[initialProfile];
    if (!profile) {
      throw new Error(`Profile not found: ${initialProfile}`);
    }

    this.currentProfile = { ...profile };

    AgentLogger.log(LogLevel.INFO, 'SelfTuningConfig', 'initialized', {
      profile: initialProfile,
      max_concurrent: this.currentProfile.max_concurrent_operations,
      timeout_ms: this.currentProfile.request_timeout_ms,
    });
  }

  /**
   * Start automatic tuning
   */
  static startAutoTuning(): void {
    if (this.tuningInterval) return;

    this.tuningInterval = setInterval(() => {
      this.autoTune();
    }, this.TUNING_INTERVAL_MS);

    AgentLogger.log(LogLevel.INFO, 'SelfTuningConfig', 'autoTuningStarted', {
      interval_ms: this.TUNING_INTERVAL_MS,
    });
  }

  /**
   * Stop automatic tuning
   */
  static stopAutoTuning(): void {
    if (this.tuningInterval) {
      clearInterval(this.tuningInterval);
      this.tuningInterval = null;

      AgentLogger.log(LogLevel.INFO, 'SelfTuningConfig', 'autoTuningStopped', {});
    }
  }

  /**
   * Automatic tuning logic
   */
  private static autoTune(): void {
    const metrics = PerformanceMonitor.getCurrentMetrics();
    const prediction = this.predictOptimalProfile(metrics);

    if (prediction.confidence > 0.7) {
      this.switchProfile(prediction.suggested_profile, prediction.reason);
    }
  }

  /**
   * Predict optimal configuration profile
   */
  private static predictOptimalProfile(metrics: PerformanceMetrics): ConfigPrediction {
    const opsPerSecond = metrics.operations_per_second;
    const errorRate = metrics.error_rate_percent;
    const memoryUsage = metrics.memory_usage_mb;
    const responseTime = metrics.avg_response_time_ms;

    // Determine load level
    let loadLevel = 'low';
    let targetProfile = 'eco-mode';
    let confidence = 0.5;

    if (opsPerSecond < 1 && memoryUsage < 300) {
      // Low load
      targetProfile = 'eco-mode';
      confidence = 0.8;
      loadLevel = 'low';
    } else if (opsPerSecond > 1 && opsPerSecond < 10 && errorRate < 3) {
      // Balanced
      targetProfile = 'balanced-mode';
      confidence = 0.8;
      loadLevel = 'balanced';
    } else if (opsPerSecond >= 10 && errorRate < 5 && memoryUsage < 800) {
      // High load but stable
      targetProfile = 'performance-mode';
      confidence = 0.75;
      loadLevel = 'high';
    } else if (errorRate > 8 || memoryUsage > 900 || responseTime > 500) {
      // Crisis situation
      targetProfile = 'crisis-mode';
      confidence = 0.9;
      loadLevel = 'crisis';
    }

    let reason = `Load level: ${loadLevel}. Ops/s: ${opsPerSecond.toFixed(1)}, Error rate: ${errorRate.toFixed(1)}%, Memory: ${memoryUsage.toFixed(0)}MB`;

    // Calculate estimated improvement
    const currentProfile = this.currentProfile;
    const targetProfileObj = CONFIG_PROFILES[targetProfile];
    
    let improvementPercent = 0;
    if (targetProfile === 'eco-mode') {
      improvementPercent = (currentProfile.memory_limit_mb - targetProfileObj.memory_limit_mb) / currentProfile.memory_limit_mb * 100;
    } else if (targetProfile === 'performance-mode') {
      improvementPercent = (targetProfileObj.max_concurrent_operations - currentProfile.max_concurrent_operations) / currentProfile.max_concurrent_operations * 100;
    }

    return {
      suggested_profile: targetProfile,
      confidence,
      estimated_improvement_percent: improvementPercent,
      reason,
    };
  }

  /**
   * Switch configuration profile
   */
  static switchProfile(profileName: string, reason: string = 'Manual switch'): void {
    const newProfile = CONFIG_PROFILES[profileName];
    if (!newProfile) {
      throw new Error(`Profile not found: ${profileName}`);
    }

    const oldProfile = this.currentProfile;
    this.currentProfile = { ...newProfile };

    // Calculate savings
    const memorySavings = ((oldProfile.memory_limit_mb - newProfile.memory_limit_mb) / oldProfile.memory_limit_mb) * 100;
    const throughputImprovement = ((newProfile.max_concurrent_operations - oldProfile.max_concurrent_operations) / oldProfile.max_concurrent_operations) * 100;
    const costSavings = (memorySavings + (throughputImprovement > 0 ? 0 : Math.abs(throughputImprovement))) / 2;

    const adjustment: ConfigAdjustment = {
      timestamp: new Date().toISOString(),
      from_profile: oldProfile.name,
      to_profile: newProfile.name,
      reason,
      metrics_trigger: {
        max_concurrent: newProfile.max_concurrent_operations,
        timeout_ms: newProfile.request_timeout_ms,
        batch_size: newProfile.batch_size,
      },
      estimated_savings: {
        memory_percent: Math.max(0, memorySavings),
        latency_percent: 0,
        cost_percent: Math.max(0, costSavings),
      },
    };

    this.adjustmentHistory.push(adjustment);
    if (this.adjustmentHistory.length > this.MAX_HISTORY) {
      this.adjustmentHistory = this.adjustmentHistory.slice(-this.MAX_HISTORY);
    }

    AgentLogger.log(LogLevel.INFO, 'SelfTuningConfig', 'profileSwitched', {
      from: oldProfile.name,
      to: newProfile.name,
      reason,
      estimated_memory_savings: `${Math.abs(memorySavings).toFixed(1)}%`,
    });
  }

  /**
   * Get current configuration
   */
  static getCurrentConfig(): ConfigProfile {
    return { ...this.currentProfile };
  }

  /**
   * Get available profiles
   */
  static getAvailableProfiles(): Record<string, ConfigProfile> {
    return Object.fromEntries(
      Object.entries(CONFIG_PROFILES).map(([key, profile]) => [
        key,
        { ...profile },
      ])
    );
  }

  /**
   * Get adjustment history
   */
  static getAdjustmentHistory(limit: number = 50): ConfigAdjustment[] {
    return this.adjustmentHistory.slice(-limit);
  }

  /**
   * Get status
   */
  static getStatus(): {
    current_profile: ConfigProfile;
    adjustment_count: number;
    last_adjustment: ConfigAdjustment | null;
    memory_usage_mb: number;
    concurrent_operations: number;
  } {
    const lastAdjustment = this.adjustmentHistory[this.adjustmentHistory.length - 1] || null;

    return {
      current_profile: { ...this.currentProfile },
      adjustment_count: this.adjustmentHistory.length,
      last_adjustment: lastAdjustment,
      memory_usage_mb: this.currentProfile.memory_limit_mb,
      concurrent_operations: this.currentProfile.max_concurrent_operations,
    };
  }

  /**
   * Get config for specific parameter
   */
  static getConfigValue(key: keyof ConfigProfile): any {
    return (this.currentProfile as any)[key];
  }

  /**
   * Manually set config value
   */
  static setConfigValue(key: keyof ConfigProfile, value: any): void {
    (this.currentProfile as any)[key] = value;

    AgentLogger.log(LogLevel.INFO, 'SelfTuningConfig', 'configValueUpdated', {
      key,
      value,
    });
  }

  /**
   * Get tuning recommendations
   */
  static getTuningRecommendations(): ConfigPrediction[] {
    const metrics = PerformanceMonitor.getCurrentMetrics();
    const recommendation = this.predictOptimalProfile(metrics);

    return [recommendation];
  }
}
