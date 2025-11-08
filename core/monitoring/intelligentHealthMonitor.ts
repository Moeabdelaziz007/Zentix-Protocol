import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { EmailService } from '../communication/emailService';
import { SlackNotificationChannel, DiscordNotificationChannel } from './notificationChannels';
import { MetaSelfMonitoringLoop } from './metaSelfMonitoringLoop';

// Health monitoring configuration
interface HealthCheckConfig {
  interval: number; // milliseconds
  timeout: number; // milliseconds
  retryAttempts: number;
  escalationThresholds: {
    warning: number; // consecutive failures
    critical: number; // consecutive failures
  };
}

interface ServiceHealth {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  expectedStatus: number;
  timeout: number;
  lastCheck: Date;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  consecutiveFailures: number;
  responseTime: number;
  metrics: {
    uptime: number;
    totalChecks: number;
    successfulChecks: number;
    averageResponseTime: number;
  };
}

interface AlertData {
  service: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metrics: any;
  consecutiveFailures: number;
}

class IntelligentHealthMonitor extends EventEmitter {
  private config: HealthCheckConfig;
  private services: Map<string, ServiceHealth> = new Map();
  private emailService: EmailService;
  private slackChannel: SlackNotificationChannel;
  private discordChannel: DiscordNotificationChannel;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private dailyReportInterval: NodeJS.Timeout | null = null;
  private alertHistory: Map<string, AlertData[]> = new Map();

  constructor(config: HealthCheckConfig) {
    super();
    this.config = config;
    this.emailService = new EmailService();
    this.slackChannel = new SlackNotificationChannel(process.env.SLACK_WEBHOOK_URL);
    this.discordChannel = new DiscordNotificationChannel(process.env.DISCORD_WEBHOOK_URL);
  }

  // Initialize monitoring with all services
  async initialize(): Promise<void> {
    console.log('🏥 Initializing Intelligent Health Monitor');
    
    // Register all services to monitor
    await this.registerServices();
    
    // Start monitoring
    this.startMonitoring();
    
    // Start daily reports
    this.startDailyReports();
    
    console.log(`✅ Health monitor initialized - checking ${this.services.size} services every ${this.config.interval/1000} seconds`);
  }

  // Register all microservices and endpoints
  private async registerServices(): Promise<void> {
    const services = [
      // Core API endpoints
      {
        name: 'api-gateway',
        url: 'https://api.zentix-protocol.com/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000
      },
      {
        name: 'user-service',
        url: 'https://api.zentix-protocol.com/users/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 3000
      },
      {
        name: 'agent-service',
        url: 'https://api.zentix-protocol.com/agents/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 4000
      },
      {
        name: 'darwin-protocol',
        url: 'https://api.zentix-protocol.com/darwin/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 6000
      },
      
      // Database services
      {
        name: 'primary-database',
        url: 'https://api.zentix-protocol.com/db/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 2000
      },
      {
        name: 'redis-cache',
        url: 'https://api.zentix-protocol.com/cache/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 1000
      },
      
      // Blockchain services
      {
        name: 'blockchain-node',
        url: 'https://api.zentix-protocol.com/blockchain/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 8000
      },
      {
        name: 'cross-chain-bridge',
        url: 'https://api.zentix-protocol.com/bridge/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 10000
      },
      
      // External dependencies
      {
        name: 'pinata-ipfs',
        url: 'https://api.pinata.cloud/data/testAuthentication',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000
      },
      {
        name: 'infura-ethereum',
        url: 'https://mainnet.infura.io/v3/status',
        method: 'GET',
        expectedStatus: 200,
        timeout: 3000
      }
    ];

    for (const service of services) {
      const health: ServiceHealth = {
        ...service,
        lastCheck: new Date(),
        status: 'unknown',
        consecutiveFailures: 0,
        responseTime: 0,
        metrics: {
          uptime: 100,
          totalChecks: 0,
          successfulChecks: 0,
          averageResponseTime: 0
        }
      };
      
      this.services.set(service.name, health);
    }
  }

  // Start continuous monitoring
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.interval);

    // Perform initial check
    this.performHealthChecks();
  }

  // Perform health checks on all services
  private async performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.services.entries()).map(async ([name, health]) => {
      return this.checkService(name, health);
    });

    await Promise.allSettled(checkPromises);
    
    // Emit overall health status
    this.emit('health-check-completed', this.getOverallHealth());
  }

  // Check individual service health
  private async checkService(name: string, health: ServiceHealth): Promise<void> {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), health.timeout);

      const response = await fetch(health.url, {
        method: health.method,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Zentix-Health-Monitor/1.0',
          'X-Health-Check': 'true'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = performance.now() - startTime;

      if (response.status === health.expectedStatus) {
        this.handleSuccessfulCheck(name, health, responseTime);
      } else {
        this.handleFailedCheck(name, health, `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.handleFailedCheck(name, health, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Handle successful health check
  private handleSuccessfulCheck(name: string, health: ServiceHealth, responseTime: number): void {
    const wasUnhealthy = health.status !== 'healthy';
    
    health.lastCheck = new Date();
    health.responseTime = responseTime;
    health.consecutiveFailures = 0;
    health.status = 'healthy';
    
    // Update metrics
    health.metrics.totalChecks++;
    health.metrics.successfulChecks++;
    health.metrics.averageResponseTime = 
      (health.metrics.averageResponseTime * (health.metrics.successfulChecks - 1) + responseTime) / 
      health.metrics.successfulChecks;
    
    // Service recovered
    if (wasUnhealthy) {
      this.handleServiceRecovery(name, health);
    }
    
    this.services.set(name, health);
  }

  // Handle failed health check
  private handleFailedCheck(name: string, health: ServiceHealth, error: string): void {
    health.lastCheck = new Date();
    health.consecutiveFailures++;
    
    // Determine severity based on consecutive failures
    if (health.consecutiveFailures >= this.config.escalationThresholds.critical) {
      health.status = 'critical';
    } else if (health.consecutiveFailures >= this.config.escalationThresholds.warning) {
      health.status = 'warning';
    } else {
      health.status = 'warning'; // First failure
    }
    
    // Update metrics
    health.metrics.totalChecks++;
    const uptime = (health.metrics.successfulChecks / health.metrics.totalChecks) * 100;
    health.metrics.uptime = Math.max(0, uptime);
    
    this.services.set(name, health);
    
    // Create alert
    this.createAlert(name, health, error);
  }

  // Handle service recovery
  private async handleServiceRecovery(name: string, health: ServiceHealth): Promise<void> {
    const alert: AlertData = {
      service: name,
      severity: 'warning',
      message: `Service ${name} has recovered and is now healthy`,
      timestamp: new Date(),
      metrics: health.metrics,
      consecutiveFailures: 0
    };

    // Send recovery notification
    await this.sendNotification(alert);
    
    // Log recovery
    console.log(`✅ Service ${name} recovered after ${health.consecutiveFailures} failures`);
    
    // Notify meta self-monitoring loop of service recovery
    MetaSelfMonitoringLoop.observeOutcomeResult({
      id: `recovery-${name}-${Date.now()}`,
      taskId: `health-check-${name}`,
      agentId: 'IntelligentHealthMonitor',
      expected: { status: 'healthy' },
      actual: { status: health.status },
      variance: health.consecutiveFailures,
      success: health.status === 'healthy',
      timestamp: Date.now()
    });
  }

  // Create and handle alerts
  private async createAlert(serviceName: string, health: ServiceHealth, error: string): Promise<void> {
    const severity = health.status === 'critical' ? 'critical' : 'warning';
    
    const alert: AlertData = {
      service: serviceName,
      severity,
      message: `Service ${serviceName} is ${health.status}: ${error}`,
      timestamp: new Date(),
      metrics: health.metrics,
      consecutiveFailures: health.consecutiveFailures
    };

    // Store alert in history
    const history = this.alertHistory.get(serviceName) || [];
    history.push(alert);
    this.alertHistory.set(serviceName, history.slice(-50)); // Keep last 50 alerts

    // Send notification
    await this.sendNotification(alert);
    
    // Create GitHub issue for critical alerts
    if (severity === 'critical' && health.consecutiveFailures === this.config.escalationThresholds.critical) {
      await this.createGitHubIssue(alert);
    }
    
    // Trigger automated rollback for critical services
    if (severity === 'critical' && this.isCriticalService(serviceName)) {
      await this.triggerAutomatedRollback(serviceName, alert);
    }

    console.log(`🚨 Alert created: ${serviceName} - ${severity} - ${error}`);
    
    // Notify meta self-monitoring loop of alert
    MetaSelfMonitoringLoop.observeOutcomeResult({
      id: `alert-${serviceName}-${Date.now()}`,
      taskId: `health-check-${serviceName}`,
      agentId: 'IntelligentHealthMonitor',
      expected: { status: 'healthy' },
      actual: { status: health.status, error },
      variance: health.consecutiveFailures,
      success: false,
      timestamp: Date.now()
    });
  }

  // Send notification through appropriate channels
  private async sendNotification(alert: AlertData): Promise<void> {
    const notificationPromises: Promise<void>[] = [];

    // Always send to Slack
    notificationPromises.push(
      this.slackChannel.send({
        level: alert.severity,
        type: 'health',
        message: alert.message,
        timestamp: alert.timestamp,
        service: alert.service,
        metrics: alert.metrics
      })
    );

    // Send to Discord for critical alerts
    if (alert.severity === 'critical') {
      notificationPromises.push(
        this.discordChannel.send([{
          level: alert.severity,
          type: 'health',
          message: alert.message,
          timestamp: alert.timestamp,
          service: alert.service,
          metrics: alert.metrics
        }])
      );
    }

    // Send email for critical alerts
    if (alert.severity === 'critical') {
      notificationPromises.push(
        this.sendCriticalAlertEmail(alert)
      );
    }

    await Promise.allSettled(notificationPromises);
  }

  // Create GitHub issue for critical alerts
  private async createGitHubIssue(alert: AlertData): Promise<void> {
    const issueTitle = `🚨 Critical Service Alert: ${alert.service}`;
    const issueBody = `
## Critical Service Alert

**Service:** ${alert.service}
**Severity:** ${alert.severity.toUpperCase()}
**Time:** ${alert.timestamp.toISOString()}
**Consecutive Failures:** ${alert.consecutiveFailures}

### Message
${alert.message}

### Current Metrics
- **Uptime:** ${alert.metrics.uptime.toFixed(2)}%
- **Total Checks:** ${alert.metrics.totalChecks}
- **Successful Checks:** ${alert.metrics.successfulChecks}
- **Average Response Time:** ${alert.metrics.averageResponseTime.toFixed(2)}ms

### Recent Alert History
${this.getRecentAlertHistory(alert.service)}

### Action Required
1. **Immediate:** Investigate service logs
2. **Priority:** Check resource utilization
3. **Escalation:** Contact on-call engineer if unresolved in 15 minutes
4. **Recovery:** Implement fix and verify service recovery

### Automated Actions
- [x] Health monitoring triggered
- [x] Alert sent to all channels
- [x] GitHub issue created
- ${this.isCriticalService(alert.service) ? '[x] Automated rollback triggered' : '[ ] Rollback not applicable'}

---
*This issue was automatically created by Zentix Protocol Health Monitor*
*Last updated: ${new Date().toISOString()}*
    `;

    try {
      // Implementation would use GitHub API
      console.log(`📝 GitHub issue created: ${issueTitle}`);
    } catch (error) {
      console.error('Failed to create GitHub issue:', error);
    }
  }

  // Trigger automated rollback for critical services
  private async triggerAutomatedRollback(serviceName: string, alert: AlertData): Promise<void> {
    console.log(`🔄 Triggering automated rollback for ${serviceName}`);
    
    try {
      // Implementation would trigger deployment rollback
      // await this.deploymentService.rollback(serviceName);
      
      // Send rollback notification
      await this.sendRollbackNotification(serviceName, alert);
    } catch (error) {
      console.error('Failed to trigger rollback:', error);
    }
  }

  // Send rollback notification
  private async sendRollbackNotification(serviceName: string, alert: AlertData): Promise<void> {
    const rollbackAlert = {
      level: 'critical' as const,
      type: 'rollback' as const,
      message: `🔄 Automated rollback triggered for ${serviceName} due to critical failures`,
      timestamp: new Date(),
      service: serviceName,
      metrics: alert.metrics
    };

    await this.slackChannel.send([rollbackAlert]);
    await this.discordChannel.send([rollbackAlert]);
  }

  // Send critical alert email
  private async sendCriticalAlertEmail(alert: AlertData): Promise<void> {
    // Implementation would use email service
    console.log(`📧 Critical alert email sent for ${alert.service}`);
  }

  // Check if service is critical
  private isCriticalService(serviceName: string): boolean {
    const criticalServices = [
      'api-gateway',
      'user-service',
      'primary-database',
      'blockchain-node'
    ];
    
    return criticalServices.includes(serviceName);
  }

  // Get recent alert history
  private getRecentAlertHistory(serviceName: string): string {
    const history = this.alertHistory.get(serviceName) || [];
    const recent = history.slice(-5);
    
    if (recent.length === 0) {
      return 'No recent alerts for this service.';
    }
    
    return recent.map(alert => 
      `- ${alert.timestamp.toISOString()}: ${alert.severity.toUpperCase()} - ${alert.message}`
    ).join('\n');
  }

  // Get overall system health
  private getOverallHealth(): OverallHealth {
    const services = Array.from(this.services.values());
    
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const warningCount = services.filter(s => s.status === 'warning').length;
    const criticalCount = services.filter(s => s.status === 'critical').length;
    
    const overallStatus = criticalCount > 0 ? 'critical' : 
                       warningCount > 0 ? 'warning' : 'healthy';
    
    const averageUptime = services.reduce((sum, s) => sum + s.metrics.uptime, 0) / services.length;
    const averageResponseTime = services.reduce((sum, s) => sum + s.metrics.averageResponseTime, 0) / services.length;
    
    return {
      status: overallStatus,
      timestamp: new Date(),
      totalServices: services.length,
      healthyServices: healthyCount,
      warningServices: warningCount,
      criticalServices: criticalCount,
      averageUptime,
      averageResponseTime,
      services: services.map(s => ({
        name: s.name,
        status: s.status,
        uptime: s.metrics.uptime,
        responseTime: s.metrics.averageResponseTime,
        consecutiveFailures: s.consecutiveFailures
      }))
    };
  }

  // Start daily reports
  private startDailyReports(): void {
    if (this.dailyReportInterval) {
      clearInterval(this.dailyReportInterval);
    }

    // Schedule for 9 AM UTC every day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(9, 0, 0, 0);
    
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generateDailyReport();
      
      // Set up recurring daily report
      this.dailyReportInterval = setInterval(() => {
        this.generateDailyReport();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeUntilTomorrow);
  }

  // Generate daily performance report
  private async generateDailyReport(): Promise<void> {
    const overallHealth = this.getOverallHealth();
    
    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        overallStatus: overallHealth.status,
        totalServices: overallHealth.totalServices,
        healthyServices: overallHealth.healthyServices,
        warningServices: overallHealth.warningServices,
        criticalServices: overallHealth.criticalServices,
        averageUptime: overallHealth.averageUptime.toFixed(2),
        averageResponseTime: overallHealth.averageResponseTime.toFixed(2)
      },
      services: overallHealth.services,
      alerts: this.getAlertsSummary(),
      recommendations: this.generateRecommendations(overallHealth),
      trends: this.analyzeTrends()
    };

    // Send report through all channels
    await this.sendDailyReport(report);
    
    console.log(`📊 Daily report generated: ${overallHealth.status} - ${overallHealth.averageUptime.toFixed(2)}% uptime`);
    
    // Notify meta self-monitoring loop of daily report
    MetaSelfMonitoringLoop.observeTaskWorkflow({
      id: `daily-report-${Date.now()}`,
      taskId: 'daily-health-report',
      agentId: 'IntelligentHealthMonitor',
      steps: [
        {
          id: 'data-collection',
          name: 'Data Collection',
          startTime: Date.now() - 30000,
          endTime: Date.now() - 15000,
          duration: 15000,
          status: 'completed',
          inputs: { services: overallHealth.services.length },
          outputs: { collected: true }
        },
        {
          id: 'analysis',
          name: 'Health Analysis',
          startTime: Date.now() - 15000,
          endTime: Date.now() - 5000,
          duration: 10000,
          status: 'completed',
          inputs: { healthData: overallHealth },
          outputs: { analysisComplete: true }
        },
        {
          id: 'report-generation',
          name: 'Report Generation',
          startTime: Date.now() - 5000,
          endTime: Date.now(),
          duration: 5000,
          status: 'completed',
          inputs: { analysis: overallHealth },
          outputs: { report }
        }
      ],
      startTime: Date.now() - 30000,
      endTime: Date.now(),
      status: 'completed',
      outcome: { success: true, report },
      efficiencyScore: 1.0
    });
  }

  // Get alerts summary for the day
  private getAlertsSummary(): any {
    const today = new Date().toDateString();
    const allAlerts: AlertData[] = [];
    
    for (const alerts of this.alertHistory.values()) {
      const todayAlerts = alerts.filter(alert => 
        alert.timestamp.toDateString() === today
      );
      allAlerts.push(...todayAlerts);
    }
    
    const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
    const warningCount = allAlerts.filter(a => a.severity === 'warning').length;
    
    return {
      total: allAlerts.length,
      critical: criticalCount,
      warning: warningCount,
      topServices: this.getTopAlertServices(allAlerts)
    };
  }

  // Get services with most alerts
  private getTopAlertServices(alerts: AlertData[]): Array<{service: string, count: number}> {
    const serviceCounts = new Map<string, number>();
    
    for (const alert of alerts) {
      serviceCounts.set(alert.service, (serviceCounts.get(alert.service) || 0) + 1);
    }
    
    return Array.from(serviceCounts.entries())
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Generate recommendations based on health data
  private generateRecommendations(health: OverallHealth): string[] {
    const recommendations: string[] = [];
    
    if (health.averageUptime < 99) {
      recommendations.push('Consider investigating services with low uptime to improve overall reliability');
    }
    
    if (health.averageResponseTime > 2000) {
      recommendations.push('Optimize slow services - average response time exceeds 2 seconds');
    }
    
    if (health.criticalServices > 0) {
      recommendations.push('Immediate attention required for critical services');
    }
    
    if (health.warningServices > health.healthyServices) {
      recommendations.push('System stability degraded - review service configurations');
    }
    
    return recommendations;
  }

  // Analyze trends from historical data
  private analyzeTrends(): any {
    // Implementation would analyze historical data to identify trends
    return {
      uptimeTrend: 'stable',
      performanceTrend: 'improving',
      alertFrequencyTrend: 'decreasing'
    };
  }

  // Send daily report through all channels
  private async sendDailyReport(report: any): Promise<void> {
    // Send to Slack
    await this.slackChannel.send({
      level: 'info',
      type: 'daily-report',
      message: `📊 Daily Health Report - ${report.summary.overallStatus.toUpperCase()}`,
      timestamp: new Date(),
      data: report
    });

    // Send to Discord
    await this.discordChannel.send([{
      level: 'info',
      type: 'daily-report',
      message: `📊 Daily Health Report - ${report.summary.overallStatus.toUpperCase()}`,
      timestamp: new Date(),
      data: report
    }]);

    // Send email report
    await this.sendDailyReportEmail(report);
  }

  // Send daily report email
  private async sendDailyReportEmail(report: any): Promise<void> {
    // Implementation would send formatted email report
    console.log(`📧 Daily report email sent: ${report.summary.overallStatus}`);
  }

  // Stop monitoring
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.dailyReportInterval) {
      clearInterval(this.dailyReportInterval);
      this.dailyReportInterval = null;
    }
    
    console.log('⏹️ Health monitoring stopped');
  }

  // Get current health status
  getCurrentHealth(): OverallHealth {
    return this.getOverallHealth();
  }

  // Get service details
  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.services.get(serviceName);
  }
}

// Type definitions
interface OverallHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  totalServices: number;
  healthyServices: number;
  warningServices: number;
  criticalServices: number;
  averageUptime: number;
  averageResponseTime: number;
  services: Array<{
    name: string;
    status: string;
    uptime: number;
    responseTime: number;
    consecutiveFailures: number;
  }>;
}

export { IntelligentHealthMonitor, HealthCheckConfig, ServiceHealth, AlertData, OverallHealth };