/**
 * Watchdog - Self-Healing Agent Monitor
 * Automatically restarts failed agents and logs issues
 * 
 * @module watchdog
 * @version 1.0.0
 */

import { AgentLogger, LogLevel } from '../utils/agentLogger';
import { PerformanceMonitor } from '../monitoring/performanceMonitor';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AgentProcess {
  id: string;
  name: string;
  command: string;
  pid?: number;
  status: 'running' | 'stopped' | 'failed';
  restart_count: number;
  last_restart: string | null;
  max_restarts: number;
}

/**
 * Watchdog - Monitors and restarts failed agents
 */
export class Watchdog {
  private static agents = new Map<string, AgentProcess>();
  private static monitorInterval: NodeJS.Timeout | null = null;
  private static readonly CHECK_INTERVAL_MS = 60000; // 1 minute
  private static readonly MAX_RESTART_ATTEMPTS = 5;

  /**
   * Register an agent for monitoring
   */
  static registerAgent(config: {
    id: string;
    name: string;
    command: string;
    max_restarts?: number;
  }): void {
    this.agents.set(config.id, {
      id: config.id,
      name: config.name,
      command: config.command,
      status: 'stopped',
      restart_count: 0,
      last_restart: null,
      max_restarts: config.max_restarts || this.MAX_RESTART_ATTEMPTS,
    });

    AgentLogger.log(
      LogLevel.INFO,
      'Watchdog',
      'registerAgent',
      { agent_id: config.id, name: config.name }
    );
  }

  /**
   * Start monitoring all registered agents
   */
  static startMonitoring(): void {
    if (this.monitorInterval) {
      return; // Already monitoring
    }

    AgentLogger.log(LogLevel.INFO, 'Watchdog', 'startMonitoring', {
      agents_count: this.agents.size,
      interval_ms: this.CHECK_INTERVAL_MS,
    });

    this.monitorInterval = setInterval(() => {
      this.checkAgents();
    }, this.CHECK_INTERVAL_MS);

    // Initial check
    this.checkAgents();
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;

      AgentLogger.log(LogLevel.INFO, 'Watchdog', 'stopMonitoring', {});
    }
  }

  /**
   * Check all agents and restart if needed
   */
  private static async checkAgents(): Promise<void> {
    const perfMetrics = PerformanceMonitor.getCurrentMetrics();

    // Check for system-level issues
    if (perfMetrics.error_rate_percent > 10) {
      AgentLogger.log(
        LogLevel.WARN,
        'Watchdog',
        'highErrorRate',
        { error_rate: perfMetrics.error_rate_percent }
      );
    }

    if (perfMetrics.memory_usage_mb > 768) {
      AgentLogger.log(
        LogLevel.WARN,
        'Watchdog',
        'highMemoryUsage',
        { memory_mb: perfMetrics.memory_usage_mb }
      );
    }

    // Check individual agents
    for (const [id, agent] of this.agents.entries()) {
      await this.checkAgent(agent);
    }
  }

  /**
   * Check individual agent health
   */
  private static async checkAgent(agent: AgentProcess): Promise<void> {
    try {
      // Simulate agent health check
      const isHealthy = await this.isAgentHealthy(agent);

      if (!isHealthy && agent.status === 'running') {
        AgentLogger.log(
          LogLevel.ERROR,
          'Watchdog',
          'agentUnhealthy',
          { agent_id: agent.id, name: agent.name }
        );

        agent.status = 'failed';
        await this.restartAgent(agent);
      }
    } catch (error) {
      AgentLogger.log(
        LogLevel.ERROR,
        'Watchdog',
        'checkAgentError',
        { agent_id: agent.id },
        error as Error
      );
    }
  }

  /**
   * Check if agent is healthy (simplified)
   */
  private static async isAgentHealthy(agent: AgentProcess): Promise<boolean> {
    // In production, this would check actual process health
    // For now, we check performance metrics
    const stats = AgentLogger.getStats();

    if (!stats.by_agent[agent.name]) {
      return false; // Agent not active
    }

    return true;
  }

  /**
   * Restart a failed agent
   */
  private static async restartAgent(agent: AgentProcess): Promise<void> {
    if (agent.restart_count >= agent.max_restarts) {
      AgentLogger.log(
        LogLevel.ERROR,
        'Watchdog',
        'maxRestartsReached',
        {
          agent_id: agent.id,
          restart_count: agent.restart_count,
          max_restarts: agent.max_restarts,
        }
      );
      return;
    }

    agent.restart_count++;
    agent.last_restart = new Date().toISOString();

    AgentLogger.log(
      LogLevel.INFO,
      'Watchdog',
      'restartingAgent',
      {
        agent_id: agent.id,
        name: agent.name,
        attempt: agent.restart_count,
      }
    );

    try {
      // Execute restart command
      const { stdout, stderr } = await execAsync(agent.command);

      if (stderr) {
        AgentLogger.log(
          LogLevel.WARN,
          'Watchdog',
          'restartWarning',
          { agent_id: agent.id, stderr }
        );
      }

      agent.status = 'running';

      AgentLogger.log(
        LogLevel.SUCCESS,
        'Watchdog',
        'agentRestarted',
        { agent_id: agent.id, name: agent.name }
      );
    } catch (error) {
      agent.status = 'failed';

      AgentLogger.log(
        LogLevel.ERROR,
        'Watchdog',
        'restartFailed',
        { agent_id: agent.id },
        error as Error
      );
    }
  }

  /**
   * Get watchdog status
   */
  static getStatus(): {
    monitoring: boolean;
    agents: Array<{
      id: string;
      name: string;
      status: string;
      restart_count: number;
      last_restart: string | null;
    }>;
  } {
    return {
      monitoring: this.monitorInterval !== null,
      agents: Array.from(this.agents.values()).map((agent) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        restart_count: agent.restart_count,
        last_restart: agent.last_restart,
      })),
    };
  }

  /**
   * Reset agent restart counter
   */
  static resetAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.restart_count = 0;
      agent.last_restart = null;

      AgentLogger.log(LogLevel.INFO, 'Watchdog', 'resetAgent', {
        agent_id: agentId,
      });
    }
  }
}
