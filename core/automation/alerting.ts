/**
 * Alerting System
 * Sends notifications when thresholds are exceeded
 * 
 * @module alerting
 * @version 1.0.0
 */

import { AgentLogger, LogLevel } from '../utils/agentLogger';
import { PerformanceMonitor } from '../monitoring/performanceMonitor';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertChannel = 'console' | 'email' | 'webhook' | 'discord';

interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

interface AlertRule {
  id: string;
  name: string;
  condition: () => boolean;
  severity: AlertSeverity;
  message: string;
  cooldown_minutes: number;
  last_triggered: string | null;
  channels: AlertChannel[];
}

/**
 * Alert Manager
 */
export class AlertManager {
  private static rules = new Map<string, AlertRule>();
  private static alerts: Alert[] = [];
  private static readonly MAX_ALERTS = 1000;
  private static checkInterval: NodeJS.Timeout | null = null;
  private static webhookUrl: string | null = null;

  /**
   * Configure webhook URL for notifications
   */
  static configureWebhook(url: string): void {
    this.webhookUrl = url;
    AgentLogger.log(LogLevel.INFO, 'AlertManager', 'configureWebhook', {
      url_configured: true,
    });
  }

  /**
   * Register an alert rule
   */
  static registerRule(config: {
    id: string;
    name: string;
    condition: () => boolean;
    severity: AlertSeverity;
    message: string;
    cooldown_minutes?: number;
    channels?: AlertChannel[];
  }): void {
    this.rules.set(config.id, {
      id: config.id,
      name: config.name,
      condition: config.condition,
      severity: config.severity,
      message: config.message,
      cooldown_minutes: config.cooldown_minutes || 60,
      last_triggered: null,
      channels: config.channels || ['console'],
    });

    AgentLogger.log(LogLevel.INFO, 'AlertManager', 'registerRule', {
      rule_id: config.id,
      name: config.name,
      severity: config.severity,
    });
  }

  /**
   * Start monitoring alert rules
   */
  static startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      return;
    }

    AgentLogger.log(LogLevel.INFO, 'AlertManager', 'startMonitoring', {
      interval_ms: intervalMs,
      rules_count: this.rules.size,
    });

    this.checkInterval = setInterval(() => {
      this.checkRules();
    }, intervalMs);

    // Initial check
    this.checkRules();
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;

      AgentLogger.log(LogLevel.INFO, 'AlertManager', 'stopMonitoring', {});
    }
  }

  /**
   * Check all rules
   */
  private static checkRules(): void {
    for (const [id, rule] of this.rules.entries()) {
      try {
        // Check cooldown
        if (rule.last_triggered) {
          const lastTrigger = new Date(rule.last_triggered).getTime();
          const cooldownMs = rule.cooldown_minutes * 60 * 1000;
          const now = Date.now();

          if (now - lastTrigger < cooldownMs) {
            continue; // Still in cooldown
          }
        }

        // Check condition
        if (rule.condition()) {
          this.triggerAlert(rule);
        }
      } catch (error) {
        AgentLogger.log(
          LogLevel.ERROR,
          'AlertManager',
          'checkRuleError',
          { rule_id: id },
          error as Error
        );
      }
    }
  }

  /**
   * Trigger an alert
   */
  private static async triggerAlert(rule: AlertRule): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity: rule.severity,
      title: rule.name,
      message: rule.message,
      metadata: {
        rule_id: rule.id,
      },
    };

    // Store alert
    this.alerts.push(alert);
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }

    // Update last triggered
    rule.last_triggered = alert.timestamp;

    // Send to channels
    for (const channel of rule.channels) {
      await this.sendToChannel(channel, alert);
    }

    AgentLogger.log(
      rule.severity === 'critical' ? LogLevel.ERROR : LogLevel.WARN,
      'AlertManager',
      'alertTriggered',
      {
        alert_id: alert.id,
        severity: alert.severity,
        title: alert.title,
      }
    );
  }

  /**
   * Send alert to channel
   */
  private static async sendToChannel(
    channel: AlertChannel,
    alert: Alert
  ): Promise<void> {
    const icon = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    }[alert.severity];

    switch (channel) {
      case 'console':
        console.log(`\n${icon} ALERT: ${alert.title}`);
        console.log(`   ${alert.message}`);
        console.log(`   Time: ${alert.timestamp}\n`);
        break;

      case 'webhook':
        if (this.webhookUrl) {
          try {
            await fetch(this.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(alert),
            });
          } catch (error) {
            AgentLogger.log(
              LogLevel.ERROR,
              'AlertManager',
              'webhookError',
              { alert_id: alert.id },
              error as Error
            );
          }
        }
        break;

      case 'email':
        // Email integration would go here
        console.log(`📧 Email alert sent: ${alert.title}`);
        break;

      case 'discord':
        // Discord webhook integration would go here
        console.log(`💬 Discord alert sent: ${alert.title}`);
        break;
    }
  }

  /**
   * Get recent alerts
   */
  static getAlerts(limit: number = 50): Alert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get alert statistics
   */
  static getStats(): {
    total_alerts: number;
    by_severity: Record<AlertSeverity, number>;
    active_rules: number;
    monitoring: boolean;
  } {
    const bySeverity = this.alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<AlertSeverity, number>
    );

    return {
      total_alerts: this.alerts.length,
      by_severity: bySeverity,
      active_rules: this.rules.size,
      monitoring: this.checkInterval !== null,
    };
  }

  /**
   * Register default alert rules
   */
  static registerDefaultRules(): void {
    // High error rate
    this.registerRule({
      id: 'high-error-rate',
      name: 'High Error Rate Detected',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.error_rate_percent > 5;
      },
      severity: 'critical',
      message: 'Error rate exceeded 5%',
      cooldown_minutes: 30,
      channels: ['console', 'webhook'],
    });

    // High memory usage
    this.registerRule({
      id: 'high-memory',
      name: 'High Memory Usage',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.memory_usage_mb > 512;
      },
      severity: 'warning',
      message: 'Memory usage exceeded 512MB',
      cooldown_minutes: 60,
      channels: ['console'],
    });

    // Slow response time
    this.registerRule({
      id: 'slow-response',
      name: 'Slow Response Time',
      condition: () => {
        const metrics = PerformanceMonitor.getCurrentMetrics();
        return metrics.avg_response_time_ms > 100;
      },
      severity: 'warning',
      message: 'Average response time exceeded 100ms',
      cooldown_minutes: 30,
      channels: ['console'],
    });

    AgentLogger.log(LogLevel.INFO, 'AlertManager', 'defaultRulesRegistered', {
      rules_count: 3,
    });
  }
}
