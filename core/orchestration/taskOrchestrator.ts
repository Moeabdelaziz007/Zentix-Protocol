/**
 * Task Orchestration System
 * Integration with Temporal.io, Prefect, and GitHub Actions
 * Zero-cost workflow automation
 * 
 * @module taskOrchestrator
 * @version 1.0.0
 */

import { AgentLogger, LogLevel } from '../utils/agentLogger';

/**
 * Task definition
 */
export interface Task {
  id: string;
  name: string;
  type: 'agent' | 'cron' | 'webhook' | 'scheduled';
  schedule?: string; // Cron expression
  handler: () => Promise<void>;
  retries?: number;
  timeout_ms?: number;
  metadata?: Record<string, any>;
}

/**
 * Task execution result
 */
export interface TaskResult {
  task_id: string;
  status: 'success' | 'failed' | 'timeout' | 'retry';
  started_at: string;
  completed_at: string;
  duration_ms: number;
  error?: string;
  retry_count?: number;
}

/**
 * Workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  tasks: Task[];
  parallel?: boolean;
  on_failure?: 'stop' | 'continue' | 'retry';
}

/**
 * Task Orchestrator
 * Manages agent workflows and scheduled tasks
 */
export class TaskOrchestrator {
  private static tasks = new Map<string, Task>();
  private static workflows = new Map<string, Workflow>();
  private static executionHistory: TaskResult[] = [];
  private static maxHistorySize = 1000;

  /**
   * Register a task
   */
  static registerTask(task: Task): void {
    this.tasks.set(task.id, task);
    AgentLogger.log(
      LogLevel.INFO,
      'TaskOrchestrator',
      'registerTask',
      { task_id: task.id, name: task.name, type: task.type }
    );
  }

  /**
   * Execute a task
   */
  static async executeTask(taskId: string): Promise<TaskResult> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const startTime = Date.now();
    let status: TaskResult['status'] = 'success';
    let error: string | undefined;
    let retryCount = 0;

    try {
      await AgentLogger.measurePerformance(
        'TaskOrchestrator',
        `executeTask:${task.name}`,
        async () => {
          // Timeout handling
          if (task.timeout_ms) {
            await Promise.race([
              task.handler(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Task timeout')), task.timeout_ms)
              ),
            ]);
          } else {
            await task.handler();
          }
        },
        { task_id: taskId }
      );
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);

      // Retry logic
      if (task.retries && retryCount < task.retries) {
        status = 'retry';
        retryCount++;
        
        AgentLogger.log(
          LogLevel.WARN,
          'TaskOrchestrator',
          'retryTask',
          { task_id: taskId, retry_count: retryCount }
        );

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.executeTask(taskId); // Recursive retry
      } else {
        status = error.includes('timeout') ? 'timeout' : 'failed';
      }
    }

    const result: TaskResult = {
      task_id: taskId,
      status,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      error,
      retry_count: retryCount,
    };

    // Store in history
    this.executionHistory.push(result);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }

    return result;
  }

  /**
   * Register a workflow
   */
  static registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    
    AgentLogger.log(
      LogLevel.INFO,
      'TaskOrchestrator',
      'registerWorkflow',
      { workflow_id: workflow.id, tasks: workflow.tasks.length }
    );
  }

  /**
   * Execute a workflow
   */
  static async executeWorkflow(workflowId: string): Promise<TaskResult[]> {
    const workflow = this.workflows.get(workflowId);

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    AgentLogger.log(
      LogLevel.INFO,
      'TaskOrchestrator',
      'executeWorkflow',
      { workflow_id: workflowId, parallel: workflow.parallel }
    );

    const results: TaskResult[] = [];

    if (workflow.parallel) {
      // Execute tasks in parallel
      const promises = workflow.tasks.map(task => this.executeTask(task.id));
      results.push(...await Promise.all(promises));
    } else {
      // Execute tasks sequentially
      for (const task of workflow.tasks) {
        const result = await this.executeTask(task.id);
        results.push(result);

        // Handle failure
        if (result.status === 'failed' && workflow.on_failure === 'stop') {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Get execution history
   */
  static getExecutionHistory(limit: number = 50): TaskResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get task statistics
   */
  static getStats(): {
    total_tasks: number;
    total_workflows: number;
    total_executions: number;
    success_rate: number;
    avg_duration_ms: number;
  } {
    const successCount = this.executionHistory.filter(r => r.status === 'success').length;
    const totalDuration = this.executionHistory.reduce((sum, r) => sum + r.duration_ms, 0);

    return {
      total_tasks: this.tasks.size,
      total_workflows: this.workflows.size,
      total_executions: this.executionHistory.length,
      success_rate: this.executionHistory.length > 0
        ? (successCount / this.executionHistory.length) * 100
        : 0,
      avg_duration_ms: this.executionHistory.length > 0
        ? totalDuration / this.executionHistory.length
        : 0,
    };
  }

  /**
   * Generate GitHub Actions workflow YAML
   */
  static generateGitHubActionsYAML(workflow: Workflow): string {
    const tasks = workflow.tasks.map((task, index) => `
      - name: ${task.name}
        run: npm run task:${task.id}
        timeout-minutes: ${(task.timeout_ms || 300000) / 60000}
    `).join('\n');

    return `
name: ${workflow.name}
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  ${workflow.id}:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
${tasks}
    `.trim();
  }

  /**
   * Export to Prefect Cloud format
   */
  static exportToPrefect(workflow: Workflow): Record<string, any> {
    return {
      name: workflow.name,
      description: `Zentix workflow: ${workflow.id}`,
      tasks: workflow.tasks.map(task => ({
        name: task.name,
        type: task.type,
        max_retries: task.retries || 0,
        timeout_seconds: (task.timeout_ms || 0) / 1000,
        tags: ['zentix', 'agent', task.type],
      })),
      flow: {
        parallel: workflow.parallel || false,
        on_failure: workflow.on_failure || 'stop',
      },
    };
  }
}

/**
 * Cron scheduler for recurring tasks
 */
export class CronScheduler {
  private static intervals = new Map<string, NodeJS.Timeout>();

  /**
   * Schedule a recurring task
   */
  static schedule(taskId: string, cronExpression: string): void {
    // Simple cron parser (supports basic patterns)
    const intervalMs = this.parseCronToMs(cronExpression);

    const interval = setInterval(async () => {
      try {
        await TaskOrchestrator.executeTask(taskId);
      } catch (error) {
        AgentLogger.log(
          LogLevel.ERROR,
          'CronScheduler',
          'scheduleTask',
          { task_id: taskId },
          error as Error
        );
      }
    }, intervalMs);

    this.intervals.set(taskId, interval);

    AgentLogger.log(
      LogLevel.INFO,
      'CronScheduler',
      'schedule',
      { task_id: taskId, cron: cronExpression }
    );
  }

  /**
   * Unschedule a task
   */
  static unschedule(taskId: string): void {
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }
  }

  /**
   * Parse cron expression to milliseconds (simplified)
   */
  private static parseCronToMs(cron: string): number {
    // Simple patterns: */5 * * * * = every 5 minutes
    const patterns: Record<string, number> = {
      '* * * * *': 60000, // Every minute
      '*/5 * * * *': 300000, // Every 5 minutes
      '*/15 * * * *': 900000, // Every 15 minutes
      '0 * * * *': 3600000, // Every hour
      '0 */6 * * *': 21600000, // Every 6 hours
      '0 0 * * *': 86400000, // Daily
    };

    return patterns[cron] || 3600000; // Default: 1 hour
  }
}
