/**
 * Centralized Agent Logging System
 * Performance monitoring and tracing for all agents
 * 
 * @module agentLogger
 * @version 1.0.0
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  agent: string;
  operation: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Centralized Agent Logger
 */
export class AgentLogger {
  private static logs: LogEntry[] = [];
  private static readonly MAX_LOGS = 1000;

  /**
   * Log agent activity
   */
  static log(
    level: LogLevel,
    agent: string,
    operation: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      agent,
      operation,
      metadata,
      error: error?.message,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Console output with colors
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[37m',  // White
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      SUCCESS: '\x1b[32m', // Green
    };

    const icon = {
      DEBUG: '🔍',
      INFO: 'ℹ️ ',
      WARN: '⚠️ ',
      ERROR: '❌',
      SUCCESS: '✅',
    };

    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    
    console.log(
      `${colors[level]}${icon[level]} [${timestamp}] ${agent}.${operation}${reset}`,
      metadata ? JSON.stringify(metadata) : ''
    );

    if (error) {
      console.error(`${colors.ERROR}   Error: ${error.message}${reset}`);
    }
  }

  /**
   * Measure operation performance
   */
  static async measurePerformance<T>(
    agent: string,
    operation: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    
    this.log(LogLevel.DEBUG, agent, operation, { ...metadata, status: 'started' });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.log(LogLevel.SUCCESS, agent, operation, {
        ...metadata,
        duration_ms: duration,
        status: 'completed',
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.log(
        LogLevel.ERROR,
        agent,
        operation,
        { ...metadata, duration_ms: duration, status: 'failed' },
        error as Error
      );

      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  static getStats(): {
    total_operations: number;
    by_agent: Record<string, number>;
    by_level: Record<string, number>;
    avg_duration_ms: number;
    recent_errors: LogEntry[];
  } {
    const byAgent = this.logs.reduce((acc, log) => {
      acc[log.agent] = (acc[log.agent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const durationsLogs = this.logs.filter((log) => log.duration_ms);
    const avgDuration =
      durationsLogs.length > 0
        ? durationsLogs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / durationsLogs.length
        : 0;

    const recentErrors = this.logs
      .filter((log) => log.level === LogLevel.ERROR)
      .slice(-10);

    return {
      total_operations: this.logs.length,
      by_agent: byAgent,
      by_level: byLevel,
      avg_duration_ms: avgDuration,
      recent_errors: recentErrors,
    };
  }

  /**
   * Export logs
   */
  static exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  static clear(): void {
    this.logs = [];
  }
}
