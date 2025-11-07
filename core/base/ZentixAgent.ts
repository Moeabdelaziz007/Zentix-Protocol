/**
 * ZentixAgent Base Class
 * 
 * Base class for all Zentix Protocol agents providing common functionality
 * and structure for agent initialization, configuration, and lifecycle management.
 */

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  version: string;
}

export abstract class ZentixAgent {
  protected config: AgentConfig;
  protected initialized: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    this.initialized = true;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Check if agent is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Abstract method that must be implemented by subclasses
   * for executing agent-specific tasks
   */
  abstract executeTask(task: any): Promise<any>;
}