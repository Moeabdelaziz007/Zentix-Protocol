/**
 * Auto-Rollback Guard
 * Detects deployment failures and automatically rolls back to previous version
 * 
 * @module autoRollbackGuard
 * @version 1.0.0
 */

import { PerformanceMonitor, PerformanceMetrics } from '../monitoring/performanceMonitor';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

export interface Deployment {
  id: string;
  version: string;
  timestamp: string;
  status: 'deploying' | 'active' | 'failed' | 'rolled_back';
  metrics_before?: PerformanceMetrics;
  metrics_after?: PerformanceMetrics;
  error_details?: string;
}

export interface RollbackResult {
  success: boolean;
  from_version: string;
  to_version: string;
  reason: string;
  timestamp: string;
  recovery_time_ms: number;
}

export interface HealthCheck {
  timestamp: string;
  error_rate_percent: number;
  response_time_ms: number;
  memory_usage_mb: number;
  is_healthy: boolean;
  check_duration_ms: number;
}

/**
 * Auto-Rollback Guard
 */
export class AutoRollbackGuard {
  private static deploymentHistory: Deployment[] = [];
  private static healthCheckHistory: HealthCheck[] = [];
  private static currentVersion = '1.0.0';
  private static previousVersion = '0.9.9';
  private static readonly MAX_HISTORY = 100;
  private static healthCheckInterval: NodeJS.Timeout | null = null;
  private static readonly HEALTH_CHECK_INTERVAL_MS = 30000; // 30 seconds
  private static readonly DEGRADATION_THRESHOLD = {
    errorRate: 2.0, // 2% increase
    responseTime: 50, // 50ms increase
    memoryUsage: 100, // 100MB increase
  };

  /**
   * Initialize auto-rollback guard
   */
  static initialize(): void {
    AgentLogger.log(LogLevel.INFO, 'AutoRollbackGuard', 'initialized', {
      current_version: this.currentVersion,
      previous_version: this.previousVersion,
    });
  }

  /**
   * Record a new deployment
   */
  static recordDeployment(version: string): Deployment {
    const deployment: Deployment = {
      id: `deploy-${Date.now()}`,
      version,
      timestamp: new Date().toISOString(),
      status: 'deploying',
      metrics_before: PerformanceMonitor.getCurrentMetrics(),
    };

    this.deploymentHistory.push(deployment);
    this.previousVersion = this.currentVersion;
    this.currentVersion = version;

    AgentLogger.log(LogLevel.INFO, 'AutoRollbackGuard', 'deploymentRecorded', {
      version,
      id: deployment.id,
    });

    return deployment;
  }

  /**
   * Start health monitoring after deployment
   */
  static startHealthMonitoring(deploymentId: string, gracePeriodMs: number = 60000): void {
    const deployment = this.deploymentHistory.find(d => d.id === deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Wait for grace period, then start monitoring
    setTimeout(() => {
      this.monitorHealth(deploymentId);
    }, gracePeriodMs);

    AgentLogger.log(LogLevel.INFO, 'AutoRollbackGuard', 'healthMonitoringStarted', {
      deployment_id: deploymentId,
      grace_period_ms: gracePeriodMs,
    });
  }

  /**
   * Monitor deployment health continuously
   */
  private static monitorHealth(deploymentId: string): void {
    const deployment = this.deploymentHistory.find(d => d.id === deploymentId);
    if (!deployment) return;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    let consecutiveFailures = 0;
    const maxFailures = 3; // Rollback after 3 consecutive bad checks

    this.healthCheckInterval = setInterval(async () => {
      const startTime = Date.now();
      const metrics = PerformanceMonitor.getCurrentMetrics();
      const checkDuration = Date.now() - startTime;

      const healthCheck: HealthCheck = {
        timestamp: new Date().toISOString(),
        error_rate_percent: metrics.error_rate_percent,
        response_time_ms: metrics.avg_response_time_ms,
        memory_usage_mb: metrics.memory_usage_mb,
        is_healthy: true,
        check_duration_ms: checkDuration,
      };

      // Check if deployment is degraded
      const isDegraded = this.isDeploymentDegraded(deployment, metrics);

      if (isDegraded) {
        consecutiveFailures++;
        healthCheck.is_healthy = false;

        AgentLogger.log(LogLevel.WARN, 'AutoRollbackGuard', 'degradationDetected', {
          deployment_id: deploymentId,
          failures: consecutiveFailures,
          error_rate: metrics.error_rate_percent,
          response_time: metrics.avg_response_time_ms,
        });

        if (consecutiveFailures >= maxFailures) {
          clearInterval(this.healthCheckInterval!);
          this.performRollback(deploymentId, 'Health degradation threshold exceeded');
        }
      } else {
        consecutiveFailures = 0;
        deployment.status = 'active';
        deployment.metrics_after = metrics;
      }

      this.healthCheckHistory.push(healthCheck);
      if (this.healthCheckHistory.length > this.MAX_HISTORY) {
        this.healthCheckHistory = this.healthCheckHistory.slice(-this.MAX_HISTORY);
      }
    }, this.HEALTH_CHECK_INTERVAL_MS);
  }

  /**
   * Check if deployment is degraded compared to baseline
   */
  private static isDeploymentDegraded(deployment: Deployment, currentMetrics: PerformanceMetrics): boolean {
    if (!deployment.metrics_before) return false;

    const before = deployment.metrics_before;
    const errorRateIncrease = currentMetrics.error_rate_percent - before.error_rate_percent;
    const responseTimeIncrease = currentMetrics.avg_response_time_ms - before.avg_response_time_ms;
    const memoryIncrease = currentMetrics.memory_usage_mb - before.memory_usage_mb;

    // Check for critical degradation
    if (currentMetrics.error_rate_percent > 10) return true;
    if (currentMetrics.avg_response_time_ms > 500) return true;
    if (currentMetrics.memory_usage_mb > 1024) return true;

    // Check for significant increase
    if (errorRateIncrease > this.DEGRADATION_THRESHOLD.errorRate) return true;
    if (responseTimeIncrease > this.DEGRADATION_THRESHOLD.responseTime) return true;
    if (memoryIncrease > this.DEGRADATION_THRESHOLD.memoryUsage) return true;

    return false;
  }

  /**
   * Perform automatic rollback
   */
  private static performRollback(deploymentId: string, reason: string): RollbackResult {
    const deployment = this.deploymentHistory.find(d => d.id === deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const startTime = Date.now();

    AgentLogger.log(LogLevel.ERROR, 'AutoRollbackGuard', 'rollbackInitiated', {
      deployment_id: deploymentId,
      reason,
      from_version: this.currentVersion,
      to_version: this.previousVersion,
    });

    // Simulate rollback process
    deployment.status = 'rolled_back';
    deployment.error_details = reason;

    // In production, this would:
    // 1. Stop current deployment
    // 2. Restore previous version
    // 3. Restart services
    // 4. Verify health

    const recoveryTime = Date.now() - startTime;

    this.currentVersion = this.previousVersion;

    const result: RollbackResult = {
      success: true,
      from_version: deployment.version,
      to_version: this.previousVersion,
      reason,
      timestamp: new Date().toISOString(),
      recovery_time_ms: recoveryTime,
    };

    AgentLogger.log(LogLevel.SUCCESS, 'AutoRollbackGuard', 'rollbackCompleted', {
      from_version: result.from_version,
      to_version: result.to_version,
      recovery_time_ms: result.recovery_time_ms,
    });

    return result;
  }

  /**
   * Get deployment history
   */
  static getDeploymentHistory(limit: number = 20): Deployment[] {
    return this.deploymentHistory.slice(-limit);
  }

  /**
   * Get health check history for deployment
   */
  static getHealthCheckHistory(limit: number = 50): HealthCheck[] {
    return this.healthCheckHistory.slice(-limit);
  }

  /**
   * Get current deployment status
   */
  static getStatus(): {
    current_version: string;
    previous_version: string;
    active_deployments: Deployment[];
    recent_rollbacks: Deployment[];
  } {
    const active = this.deploymentHistory.filter(d => d.status === 'active');
    const rollbacks = this.deploymentHistory.filter(d => d.status === 'rolled_back').slice(-5);

    return {
      current_version: this.currentVersion,
      previous_version: this.previousVersion,
      active_deployments: active,
      recent_rollbacks: rollbacks,
    };
  }

  /**
   * Manual rollback trigger
   */
  static manualRollback(reason: string = 'Manual rollback requested'): RollbackResult {
    const lastDeployment = this.deploymentHistory[this.deploymentHistory.length - 1];
    if (!lastDeployment) {
      throw new Error('No deployments found');
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    return this.performRollback(lastDeployment.id, reason);
  }

  /**
   * Stop health monitoring
   */
  static stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;

      AgentLogger.log(LogLevel.INFO, 'AutoRollbackGuard', 'healthMonitoringStopped', {});
    }
  }
}
