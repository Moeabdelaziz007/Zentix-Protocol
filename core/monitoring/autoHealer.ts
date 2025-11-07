/**
 * Auto-Healer System
 * Automatically detects and recovers from failures
 * Self-healing infrastructure for autonomous agents
 * 
 * @module autoHealer
 * @version 1.0.0
 */

import { PerformanceMonitor } from './performanceMonitor';
import { AgentLogger, LogLevel } from '../utils/agentLogger';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface HealingAction {
  id: string;
  timestamp: string;
  trigger: string;
  action_taken: string;
  success: boolean;
  details?: string;
}

interface HealingRule {
  id: string;
  name: string;
  condition: () => boolean;
  action: () => Promise<void>;
  cooldown_ms: number;
  last_executed: number | null;
  enabled: boolean;
}

/**
 * Auto-Healer - Self-healing system monitor
 */
export class AutoHealer {
  private static healingHistory: HealingAction[] = [];
  private static rules = new Map<string, HealingRule>();
  private static monitorInterval: NodeJS.Timeout | null = null;
  private static readonly CHECK_INTERVAL_MS = 60000; // 1 minute
  private static readonly MAX_HISTORY = 500;
  private static isHealing = false;

  /**
   * Initialize auto-healer with default rules
   */
  static initialize(): void {
    this.registerDefaultRules();
    AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'initialize', {
      rules_count: this.rules.size,
    });
  }

  /**
   * Register default healing rules
   */
  private static registerDefaultRules(): void {
    // Rule 1: High error rate
    this.registerRule({
      id: 'high-error-rate',
      name: 'High Error Rate Recovery',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.error_rate_percent > 5;
      },
      action: async () => {
        AgentLogger.log(
          LogLevel.WARN,
          'AutoHealer',
          'highErrorRateDetected',
          { threshold: 5 }
        );

        // Clear error state
        AgentLogger.clear();

        // Restart critical services (simulated)
        await this.restartAgents();
      },
      cooldown_ms: 300000, // 5 minutes
      enabled: true,
    });

    // Rule 2: High memory usage
    this.registerRule({
      id: 'high-memory',
      name: 'Memory Cleanup',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.memory_usage_mb > 768;
      },
      action: async () => {
        AgentLogger.log(
          LogLevel.WARN,
          'AutoHealer',
          'highMemoryDetected',
          { threshold_mb: 768 }
        );

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'garbageCollected', {});
        }
      },
      cooldown_ms: 600000, // 10 minutes
      enabled: true,
    });

    // Rule 3: Slow response time
    this.registerRule({
      id: 'slow-response',
      name: 'Performance Optimization',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.avg_response_time_ms > 200;
      },
      action: async () => {
        AgentLogger.log(
          LogLevel.WARN,
          'AutoHealer',
          'slowResponseDetected',
          { threshold_ms: 200 }
        );

        // Clear performance cache
        PerformanceMonitor.reset();
      },
      cooldown_ms: 300000, // 5 minutes
      enabled: true,
    });

    // Rule 4: No operations (system idle/crashed)
    this.registerRule({
      id: 'system-idle',
      name: 'System Activity Recovery',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.operations_total === 0 && Date.now() > 120000; // After 2 minutes
      },
      action: async () => {
        AgentLogger.log(
          LogLevel.ERROR,
          'AutoHealer',
          'systemIdleDetected',
          {}
        );

        // Restart monitoring
        await this.restartMonitoring();
      },
      cooldown_ms: 600000, // 10 minutes
      enabled: true,
    });
  }

  /**
   * Register a custom healing rule
   */
  static registerRule(config: {
    id: string;
    name: string;
    condition: () => boolean;
    action: () => Promise<void>;
    cooldown_ms?: number;
    enabled?: boolean;
  }): void {
    this.rules.set(config.id, {
      id: config.id,
      name: config.name,
      condition: config.condition,
      action: config.action,
      cooldown_ms: config.cooldown_ms || 300000,
      last_executed: null,
      enabled: config.enabled !== false,
    });

    AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'ruleRegistered', {
      rule_id: config.id,
      name: config.name,
    });
  }

  /**
   * Start monitoring and auto-healing
   */
  static startMonitoring(): void {
    if (this.monitorInterval) {
      return; // Already monitoring
    }

    AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'startMonitoring', {
      interval_ms: this.CHECK_INTERVAL_MS,
      rules_count: this.rules.size,
    });

    this.monitorInterval = setInterval(() => {
      this.checkAndHeal();
    }, this.CHECK_INTERVAL_MS);

    // Initial check
    this.checkAndHeal();
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;

      AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'stopMonitoring', {});
    }
  }

  /**
   * Check all rules and execute healing actions
   */
  private static async checkAndHeal(): Promise<void> {
    if (this.isHealing) {
      return; // Already healing, skip this check
    }

    const now = Date.now();

    for (const [id, rule] of this.rules.entries()) {
      if (!rule.enabled) {
        continue;
      }

      // Check cooldown
      if (rule.last_executed && now - rule.last_executed < rule.cooldown_ms) {
        continue;
      }

      try {
        // Check condition
        if (rule.condition()) {
          this.isHealing = true;

          await AgentLogger.measurePerformance(
            'AutoHealer',
            `heal:${rule.id}`,
            async () => {
              await rule.action();

              // Record healing action
              const action: HealingAction = {
                id: `heal-${Date.now()}`,
                timestamp: new Date().toISOString(),
                trigger: rule.name,
                action_taken: rule.id,
                success: true,
              };

              this.healingHistory.push(action);
              if (this.healingHistory.length > this.MAX_HISTORY) {
                this.healingHistory = this.healingHistory.slice(-this.MAX_HISTORY);
              }

              rule.last_executed = now;

              AgentLogger.log(
                LogLevel.SUCCESS,
                'AutoHealer',
                'healingCompleted',
                { rule_id: rule.id, name: rule.name }
              );
            },
            { rule_id: id }
          );

          this.isHealing = false;
        }
      } catch (error) {
        this.isHealing = false;

        AgentLogger.log(
          LogLevel.ERROR,
          'AutoHealer',
          'healingFailed',
          { rule_id: id },
          error as Error
        );

        // Record failed action
        const action: HealingAction = {
          id: `heal-${Date.now()}`,
          timestamp: new Date().toISOString(),
          trigger: rule.name,
          action_taken: rule.id,
          success: false,
          details: (error as Error).message,
        };

        this.healingHistory.push(action);
      }
    }
  }

  /**
   * Restart agents (simulated)
   */
  private static async restartAgents(): Promise<void> {
    AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'restartingAgents', {});

    // In production, this would restart actual agent processes
    // For now, we reset the monitoring state
    PerformanceMonitor.reset();

    AgentLogger.log(LogLevel.SUCCESS, 'AutoHealer', 'agentsRestarted', {});
  }

  /**
   * Restart monitoring systems
   */
  private static async restartMonitoring(): Promise<void> {
    AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'restartingMonitoring', {});

    this.stopMonitoring();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.startMonitoring();

    AgentLogger.log(LogLevel.SUCCESS, 'AutoHealer', 'monitoringRestarted', {});
  }

  /**
   * Get healing history
   */
  static getHistory(limit: number = 50): HealingAction[] {
    return this.healingHistory.slice(-limit);
  }

  /**
   * Get statistics
   */
  static getStats(): {
    total_healings: number;
    successful_healings: number;
    failed_healings: number;
    active_rules: number;
    monitoring: boolean;
    recent_actions: HealingAction[];
  } {
    const successful = this.healingHistory.filter((a) => a.success).length;
    const failed = this.healingHistory.filter((a) => !a.success).length;

    return {
      total_healings: this.healingHistory.length,
      successful_healings: successful,
      failed_healings: failed,
      active_rules: Array.from(this.rules.values()).filter((r) => r.enabled)
        .length,
      monitoring: this.monitorInterval !== null,
      recent_actions: this.healingHistory.slice(-10),
    };
  }

  /**
   * Enable/disable a rule
   */
  static setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;

      AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'ruleToggled', {
        rule_id: ruleId,
        enabled,
      });
    }
  }

  /**
   * Force healing check (manual trigger)
   */
  static async forceHeal(): Promise<void> {
    AgentLogger.log(LogLevel.INFO, 'AutoHealer', 'forceHealTriggered', {});
    await this.checkAndHeal();
  }
}
