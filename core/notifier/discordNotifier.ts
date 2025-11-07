/**
 * Discord Notifier
 * Sends real-time alerts to Discord channels
 * 
 * @module discordNotifier
 * @version 1.0.0
 */

import { AgentLogger, LogLevel } from '../utils/agentLogger';

export interface DiscordMessage {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

/**
 * Discord Notifier
 */
export class DiscordNotifier {
  private static webhookUrl: string | null = null;
  private static enabled: boolean = false;
  private static messageQueue: DiscordMessage[] = [];
  private static readonly MAX_QUEUE_SIZE = 100;

  /**
   * Configure Discord webhook
   */
  static configure(webhookUrl: string): void {
    this.webhookUrl = webhookUrl;
    this.enabled = true;

    AgentLogger.log(LogLevel.INFO, 'DiscordNotifier', 'configured', {
      webhook_configured: true,
    });
  }

  /**
   * Send simple text message
   */
  static async send(message: string): Promise<boolean> {
    return this.sendMessage({ content: message });
  }

  /**
   * Send formatted message with embeds
   */
  static async sendMessage(message: DiscordMessage): Promise<boolean> {
    if (!this.enabled || !this.webhookUrl) {
      // Queue message for later if webhook not configured
      this.messageQueue.push(message);
      if (this.messageQueue.length > this.MAX_QUEUE_SIZE) {
        this.messageQueue = this.messageQueue.slice(-this.MAX_QUEUE_SIZE);
      }

      AgentLogger.log(LogLevel.WARN, 'DiscordNotifier', 'notConfigured', {
        queued: true,
      });

      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.statusText}`);
      }

      AgentLogger.log(LogLevel.SUCCESS, 'DiscordNotifier', 'messageSent', {
        content_length: message.content?.length || 0,
      });

      return true;
    } catch (error) {
      AgentLogger.log(
        LogLevel.ERROR,
        'DiscordNotifier',
        'sendFailed',
        {},
        error as Error
      );

      return false;
    }
  }

  /**
   * Send alert notification
   */
  static async sendAlert(
    severity: 'info' | 'warning' | 'critical',
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const colors = {
      info: 0x3498db, // Blue
      warning: 0xf39c12, // Orange
      critical: 0xe74c3c, // Red
    };

    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    };

    const fields: Array<{ name: string; value: string; inline?: boolean }> = [];

    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        fields.push({
          name: key.replace(/_/g, ' ').toUpperCase(),
          value: String(value),
          inline: true,
        });
      }
    }

    return this.sendMessage({
      embeds: [
        {
          title: `${icons[severity]} ${title}`,
          description: message,
          color: colors[severity],
          fields,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /**
   * Send performance report
   */
  static async sendPerformanceReport(metrics: {
    operations_total: number;
    operations_per_second: number;
    avg_response_time_ms: number;
    error_rate_percent: number;
    memory_usage_mb: number;
  }): Promise<boolean> {
    return this.sendMessage({
      embeds: [
        {
          title: '📊 Performance Report',
          description: 'Zentix Protocol System Metrics',
          color: 0x2ecc71, // Green
          fields: [
            {
              name: 'Total Operations',
              value: metrics.operations_total.toString(),
              inline: true,
            },
            {
              name: 'Ops/Second',
              value: metrics.operations_per_second.toFixed(2),
              inline: true,
            },
            {
              name: 'Avg Response',
              value: `${metrics.avg_response_time_ms.toFixed(2)}ms`,
              inline: true,
            },
            {
              name: 'Error Rate',
              value: `${metrics.error_rate_percent.toFixed(2)}%`,
              inline: true,
            },
            {
              name: 'Memory Usage',
              value: `${metrics.memory_usage_mb.toFixed(2)}MB`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /**
   * Send healing notification
   */
  static async sendHealingNotification(
    action: string,
    success: boolean,
    details?: string
  ): Promise<boolean> {
    const severity = success ? 'info' : 'critical';
    const title = success
      ? '✅ Auto-Healing Successful'
      : '❌ Auto-Healing Failed';

    return this.sendAlert(severity, title, `Action: ${action}`, {
      success: success ? 'Yes' : 'No',
      details: details || 'N/A',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send agent status update
   */
  static async sendAgentStatus(
    agentName: string,
    status: 'started' | 'stopped' | 'failed' | 'recovered'
  ): Promise<boolean> {
    const statusIcons = {
      started: '🟢',
      stopped: '🟡',
      failed: '🔴',
      recovered: '🟢',
    };

    const statusColors = {
      started: 0x2ecc71,
      stopped: 0xf39c12,
      failed: 0xe74c3c,
      recovered: 0x2ecc71,
    };

    return this.sendMessage({
      embeds: [
        {
          title: `${statusIcons[status]} Agent ${status.toUpperCase()}`,
          description: `Agent: **${agentName}**`,
          color: statusColors[status],
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }

  /**
   * Flush queued messages
   */
  static async flushQueue(): Promise<number> {
    if (!this.enabled || !this.webhookUrl || this.messageQueue.length === 0) {
      return 0;
    }

    let sentCount = 0;

    for (const message of this.messageQueue) {
      const success = await this.sendMessage(message);
      if (success) {
        sentCount++;
      }

      // Rate limit: wait 1 second between messages
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.messageQueue = [];

    AgentLogger.log(LogLevel.INFO, 'DiscordNotifier', 'queueFlushed', {
      messages_sent: sentCount,
    });

    return sentCount;
  }

  /**
   * Get status
   */
  static getStatus(): {
    enabled: boolean;
    webhook_configured: boolean;
    queued_messages: number;
  } {
    return {
      enabled: this.enabled,
      webhook_configured: this.webhookUrl !== null,
      queued_messages: this.messageQueue.length,
    };
  }

  /**
   * Disable notifications
   */
  static disable(): void {
    this.enabled = false;

    AgentLogger.log(LogLevel.INFO, 'DiscordNotifier', 'disabled', {});
  }

  /**
   * Enable notifications
   */
  static enable(): void {
    if (this.webhookUrl) {
      this.enabled = true;

      AgentLogger.log(LogLevel.INFO, 'DiscordNotifier', 'enabled', {});
    }
  }
}
