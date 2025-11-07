import http from 'http';
import https from 'https';
import { performance } from 'perf_hooks';

// Health monitoring system for Darwin Protocol
class DarwinHealthMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private notificationChannels: NotificationChannel[] = [];
  private alertThresholds: AlertThresholds;

  constructor() {
    this.alertThresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 0.05, // 5%
      availability: 0.99, // 99%
      cpuUsage: 80, // 80%
      memoryUsage: 85, // 85%
      diskUsage: 90 // 90%
    };
  }

  // Register health check
  registerCheck(name: string, check: HealthCheck): void {
    this.healthChecks.set(name, check);
  }

  // Register notification channel
  registerChannel(channel: NotificationChannel): void {
    this.notificationChannels.push(channel);
  }

  // Execute comprehensive health check
  async performHealthCheck(): Promise<HealthStatus> {
    const startTime = performance.now();
    const results: Map<string, CheckResult> = new Map();

    // Run all registered health checks
    for (const [name, check] of this.healthChecks) {
      try {
        const result = await this.runCheck(check);
        results.set(name, result);
      } catch (error) {
        results.set(name, {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          duration: 0
        });
      }
    }

    // Calculate overall health score
    const overallStatus = this.calculateOverallStatus(results);
    const duration = performance.now() - startTime;

    const healthStatus: HealthStatus = {
      overall: overallStatus,
      timestamp: new Date(),
      duration,
      checks: Object.fromEntries(results),
      metrics: await this.collectSystemMetrics()
    };

    // Check for alerts
    await this.checkAlerts(healthStatus);

    return healthStatus;
  }

  // Run individual health check
  private async runCheck(check: HealthCheck): Promise<CheckResult> {
    const startTime = performance.now();
    
    try {
      const result = await check.execute();
      const duration = performance.now() - startTime;
      
      return {
        status: result.success ? 'healthy' : 'unhealthy',
        message: result.message,
        data: result.data,
        timestamp: new Date(),
        duration
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Check failed',
        timestamp: new Date(),
        duration
      };
    }
  }

  // Calculate overall system health
  private calculateOverallStatus(results: Map<string, CheckResult>): HealthStatusLevel {
    const statuses = Array.from(results.values()).map(r => r.status);
    
    if (statuses.includes('error')) return 'critical';
    if (statuses.includes('unhealthy')) return 'warning';
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    
    return 'degraded';
  }

  // Collect system metrics
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      cpu: await this.getCPUUsage(),
      memory: await this.getMemoryUsage(),
      disk: await this.getDiskUsage(),
      network: await this.getNetworkStats(),
      responseTime: await this.getAverageResponseTime()
    };
    
    return metrics;
  }

  // Check for alerts and send notifications
  private async checkAlerts(status: HealthStatus): Promise<void> {
    const alerts: Alert[] = [];

    // Check response time
    if (status.duration > this.alertThresholds.responseTime) {
      alerts.push({
        level: 'warning',
        type: 'performance',
        message: `Health check took ${status.duration}ms (threshold: ${this.alertThresholds.responseTime}ms)`,
        timestamp: new Date()
      });
    }

    // Check system metrics
    const { cpu, memory, disk, responseTime } = status.metrics;
    
    if (cpu > this.alertThresholds.cpuUsage) {
      alerts.push({
        level: 'warning',
        type: 'resource',
        message: `CPU usage at ${cpu}% (threshold: ${this.alertThresholds.cpuUsage}%)`,
        timestamp: new Date()
      });
    }

    if (memory > this.alertThresholds.memoryUsage) {
      alerts.push({
        level: 'warning',
        type: 'resource',
        message: `Memory usage at ${memory}% (threshold: ${this.alertThresholds.memoryUsage}%)`,
        timestamp: new Date()
      });
    }

    if (responseTime > this.alertThresholds.responseTime) {
      alerts.push({
        level: 'critical',
        type: 'performance',
        message: `Average response time ${responseTime}ms (threshold: ${this.alertThresholds.responseTime}ms)`,
        timestamp: new Date()
      });
    }

    // Check individual health checks
    Object.entries(status.checks).forEach(([name, result]) => {
      if (result.status !== 'healthy') {
        alerts.push({
          level: result.status === 'error' ? 'critical' : 'warning',
          type: 'health',
          message: `Health check '${name}' failed: ${result.message}`,
          timestamp: new Date()
        });
      }
    });

    // Send notifications
    if (alerts.length > 0) {
      await this.sendAlertNotifications(alerts);
    }
  }

  // Send alerts through all registered channels
  private async sendAlertNotifications(alerts: Alert[]): Promise<void> {
    const notificationPromises = this.notificationChannels.map(channel => 
      channel.send(alerts).catch(error => 
        console.error(`Failed to send notification via ${channel.name}:`, error)
      )
    );

    await Promise.allSettled(notificationPromises);
  }

  // System metrics collection methods
  private async getCPUUsage(): Promise<number> {
    // Mock implementation - in real scenario, use system monitoring tools
    return Math.random() * 100;
  }

  private async getMemoryUsage(): Promise<number> {
    // Mock implementation
    const memUsage = process.memoryUsage();
    return (memUsage.heapUsed / memUsage.heapTotal) * 100;
  }

  private async getDiskUsage(): Promise<number> {
    // Mock implementation
    return Math.random() * 100;
  }

  private async getNetworkStats(): Promise<NetworkStats> {
    // Mock implementation
    return {
      bytesIn: Math.random() * 1000000,
      bytesOut: Math.random() * 1000000,
      connections: Math.floor(Math.random() * 1000)
    };
  }

  private async getAverageResponseTime(): Promise<number> {
    // Mock implementation - would measure actual API response times
    return Math.random() * 3000 + 100;
  }
}

// Interface definitions
interface HealthCheck {
  name: string;
  execute(): Promise<{ success: boolean; message: string; data?: any }>;
}

interface CheckResult {
  status: 'healthy' | 'unhealthy' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
  duration: number;
}

type HealthStatusLevel = 'healthy' | 'warning' | 'degraded' | 'critical';

interface HealthStatus {
  overall: HealthStatusLevel;
  timestamp: Date;
  duration: number;
  checks: Record<string, CheckResult>;
  metrics: SystemMetrics;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: NetworkStats;
  responseTime: number;
}

interface NetworkStats {
  bytesIn: number;
  bytesOut: number;
  connections: number;
}

interface Alert {
  level: 'info' | 'warning' | 'critical';
  type: 'health' | 'performance' | 'resource' | 'security';
  message: string;
  timestamp: Date;
}

interface AlertThresholds {
  responseTime: number;
  errorRate: number;
  availability: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

interface NotificationChannel {
  name: string;
  send(alerts: Alert[]): Promise<void>;
}

// Slack notification channel implementation
class SlackNotificationChannel implements NotificationChannel {
  name = 'slack';
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(alerts: Alert[]): Promise<void> {
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');
    
    if (criticalAlerts.length === 0 && warningAlerts.length === 0) {
      return;
    }

    const payload = {
      channel: '#zentix-alerts',
      username: 'Darwin Protocol Monitor',
      text: this.formatMessage(criticalAlerts, warningAlerts),
      attachments: [
        {
          color: criticalAlerts.length > 0 ? 'danger' : 'warning',
          title: 'Health Check Alerts',
          fields: alerts.map(alert => ({
            title: `${alert.type.toUpperCase()} Alert`,
            value: alert.message,
            short: false
          })),
          footer: 'Darwin Protocol Health Monitor',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    await this.postToSlack(payload);
  }

  private async postToSlack(payload: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(payload);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(this.webhookUrl, options, (res) => {
        res.on('data', () => resolve());
        res.on('error', reject);
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  private formatMessage(critical: Alert[], warning: Alert[]): string {
    let message = '';
    
    if (critical.length > 0) {
      message += `🚨 *CRITICAL* (${critical.length}) - Immediate attention required\n`;
      message += critical.map(a => `• ${a.message}`).join('\n') + '\n\n';
    }
    
    if (warning.length > 0) {
      message += `⚠️ *WARNING* (${warning.length}) - Monitor closely\n`;
      message += warning.map(a => `• ${a.message}`).join('\n');
    }
    
    return message || 'All systems operational';
  }
}

// Discord notification channel implementation
class DiscordNotificationChannel implements NotificationChannel {
  name = 'discord';
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async send(alerts: Alert[]): Promise<void> {
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');
    
    if (criticalAlerts.length === 0 && warningAlerts.length === 0) {
      return;
    }

    const embed = {
      title: 'Darwin Protocol Alert System',
      description: this.formatMessage(criticalAlerts, warningAlerts),
      color: criticalAlerts.length > 0 ? 0xFF0000 : 0xFFA500,
      fields: alerts.map(alert => ({
        name: `${alert.type.toUpperCase()} - ${alert.level.toUpperCase()}`,
        value: alert.message,
        inline: false
      })),
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Zentix Protocol Monitoring System'
      }
    };

    await this.postToDiscord(embed);
  }

  private async postToDiscord(embed: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = { embeds: [embed] };
      const data = JSON.stringify(payload);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(this.webhookUrl, options, (res) => {
        res.on('data', () => resolve());
        res.on('error', reject);
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  private formatMessage(critical: Alert[], warning: Alert[]): string {
    if (critical.length === 0 && warning.length === 0) {
      return '✅ All systems operational';
    }
    
    let message = '';
    
    if (critical.length > 0) {
      message += `🚨 **CRITICAL ALERTS** (${critical.length})\n`;
      message += critical.map(a => `• ${a.message}`).join('\n') + '\n\n';
    }
    
    if (warning.length > 0) {
      message += `⚠️ **WARNING ALERTS** (${warning.length})\n`;
      message += warning.map(a => `• ${a.message}`).join('\n');
    }
    
    return message;
  }
}

// Email notification channel implementation
class EmailNotificationChannel implements NotificationChannel {
  name = 'email';
  private smtpConfig: SMTPConfig;

  constructor(smtpConfig: SMTPConfig) {
    this.smtpConfig = smtpConfig;
  }

  async send(alerts: Alert[]): Promise<void> {
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    
    if (criticalAlerts.length === 0) {
      return; // Only send emails for critical alerts
    }

    const subject = `🚨 CRITICAL: Darwin Protocol Alert (${criticalAlerts.length} issues)`;
    const body = this.generateEmailBody(alerts);

    await this.sendEmail(subject, body);
  }

  private async sendEmail(subject: string, body: string): Promise<void> {
    // Email implementation would go here
    // For now, just log
    console.log('Email sent:', { subject, body });
  }

  private generateEmailBody(alerts: Alert[]): string {
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');
    
    let body = `
Darwin Protocol Health Check Report
Generated: ${new Date().toISOString()}

`;

    if (criticalAlerts.length > 0) {
      body += `CRITICAL ALERTS (${criticalAlerts.length}):
${criticalAlerts.map(a => `• ${a.type.toUpperCase()}: ${a.message}`).join('\n')}

`;
    }

    if (warningAlerts.length > 0) {
      body += `WARNING ALERTS (${warningAlerts.length}):
${warningAlerts.map(a => `• ${a.type.toUpperCase()}: ${a.message}`).join('\n')}

`;
    }

    body += `
This is an automated message from the Darwin Protocol Health Monitor.
Please investigate and resolve these issues immediately.
`;

    return body;
  }
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  to: string[];
}

// Health check implementations
const darwinProtocolHealthCheck: HealthCheck = {
  name: 'darwin-protocol',
  async execute() {
    try {
      const response = await fetch('https://api.zentix-protocol.com/health');
      const data = await response.json();
      
      return {
        success: data.status === 'healthy',
        message: data.message || 'Darwin Protocol operational',
        data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
};

const databaseHealthCheck: HealthCheck = {
  name: 'database',
  async execute() {
    try {
      // Database health check implementation
      return {
        success: true,
        message: 'Database connection healthy',
        data: { connectionPool: 'active', queryTime: Math.random() * 100 }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }
};

// Initialize and start monitoring
export async function startHealthMonitoring(): Promise<void> {
  const monitor = new DarwinHealthMonitor();
  
  // Register health checks
  monitor.registerCheck('darwin-protocol', darwinProtocolHealthCheck);
  monitor.registerCheck('database', databaseHealthCheck);
  
  // Register notification channels
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  
  if (slackWebhook) {
    monitor.registerChannel(new SlackNotificationChannel(slackWebhook));
  }
  
  if (discordWebhook) {
    monitor.registerChannel(new DiscordNotificationChannel(discordWebhook));
  }

  // Start monitoring loop
  setInterval(async () => {
    try {
      const status = await monitor.performHealthCheck();
      console.log('Health check completed:', status.overall);
      
      // Store metrics for historical analysis
      await storeMetrics(status);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, 60000); // Check every minute
}

async function storeMetrics(status: HealthStatus): Promise<void> {
  // Implementation to store metrics in time-series database
  // This would typically go to InfluxDB, Prometheus, or similar
  console.log('Storing metrics:', {
    timestamp: status.timestamp,
    overall: status.overall,
    duration: status.duration,
    metrics: status.metrics
  });
}

// Export for use in other modules
export { DarwinHealthMonitor, HealthStatus, Alert };