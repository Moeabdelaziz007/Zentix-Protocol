import { Pool } from 'pg';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

/**
 * Aether Core Orchestrator Database Schema
 * 
 * This file defines the database schema for the Aether Content & Revenue Network.
 * It includes tables for managing agents, tasks, credentials, assets, and analytics.
 */

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'aether_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aether_network',
  password: process.env.DB_PASSWORD || 'secure_password',
  port: parseInt(process.env.DB_PORT || '5432'),
};

// Create database connection pool
export const dbPool = new Pool(dbConfig);

// Initialize database tables
export async function initializeAetherDatabase(): Promise<void> {
  try {
    // Create agents table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'inactive',
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create tasks table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agents(id),
        task_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority INTEGER DEFAULT 1,
        payload JSONB,
        result JSONB,
        scheduled_at TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create credentials table (encrypted)
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS credentials (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agents(id),
        platform VARCHAR(50) NOT NULL,
        credential_key VARCHAR(100) NOT NULL,
        credential_value TEXT NOT NULL,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create assets table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        path VARCHAR(500),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create analytics table
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agents(id),
        metric_name VARCHAR(100) NOT NULL,
        value NUMERIC,
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await dbPool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
      CREATE INDEX IF NOT EXISTS idx_credentials_agent_id ON credentials(agent_id);
      CREATE INDEX IF NOT EXISTS idx_credentials_platform ON credentials(platform);
      CREATE INDEX IF NOT EXISTS idx_analytics_agent_id ON analytics(agent_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON analytics(recorded_at);
    `);
    
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Aether database initialized successfully');
  } catch (error) {
    AgentLogger.log(LogLevel.ERROR, 'AetherDatabase', 'Failed to initialize Aether database', {}, error as Error);
    throw error;
  }
}

// Agent model
export interface AetherAgent {
  id?: number;
  name: string;
  type: 'youtube' | 'telegram' | 'music' | 'orchestrator';
  status: 'active' | 'inactive' | 'error';
  config?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Task model
export interface AetherTask {
  id?: number;
  agentId: number;
  taskType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  payload: Record<string, any>;
  result?: Record<string, any>;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Credential model
export interface AetherCredential {
  id?: number;
  agentId: number;
  platform: string;
  credentialKey: string;
  credentialValue: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Asset model
export interface AetherAsset {
  id?: number;
  name: string;
  type: string;
  path?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Analytics model
export interface AetherAnalytics {
  id?: number;
  agentId: number;
  metricName: string;
  value: number;
  metadata?: Record<string, any>;
  recordedAt?: Date;
}

// Database service class
export class AetherDatabaseService {
  private static instance: AetherDatabaseService;

  private constructor() {
  }

  public static getInstance(): AetherDatabaseService {
    if (!AetherDatabaseService.instance) {
      AetherDatabaseService.instance = new AetherDatabaseService();
    }
    return AetherDatabaseService.instance;
  }

  // Agent operations
  async createAgent(agent: AetherAgent): Promise<AetherAgent> {
    const result = await dbPool.query(
      `INSERT INTO agents (name, type, status, config) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [agent.name, agent.type, agent.status, agent.config || {}]
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Created agent', { agentId: result.rows[0].id, agentName: agent.name });
    return result.rows[0];
  }

  async getAgentById(id: number): Promise<AetherAgent | null> {
    const result = await dbPool.query('SELECT * FROM agents WHERE id = $1', [id]);
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved agent by ID', { agentId: id, found: result.rows.length > 0 });
    return result.rows.length ? result.rows[0] : null;
  }

  async getAgentByName(name: string): Promise<AetherAgent | null> {
    const result = await dbPool.query('SELECT * FROM agents WHERE name = $1', [name]);
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved agent by name', { agentName: name, found: result.rows.length > 0 });
    return result.rows.length ? result.rows[0] : null;
  }

  async getAllAgents(): Promise<AetherAgent[]> {
    const result = await dbPool.query('SELECT * FROM agents ORDER BY created_at DESC');
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved all agents', { count: result.rows.length });
    return result.rows;
  }

  async updateAgent(id: number, updates: Partial<AetherAgent>): Promise<AetherAgent> {
    const fields = [];
    const values = [];
    let index = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(updates.name);
    }
    if (updates.type !== undefined) {
      fields.push(`type = $${index++}`);
      values.push(updates.type);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(updates.status);
    }
    if (updates.config !== undefined) {
      fields.push(`config = $${index++}`);
      values.push(updates.config);
    }
    
    values.push(id);
    const result = await dbPool.query(
      `UPDATE agents SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${index} RETURNING *`,
      values
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Updated agent', { agentId: id });
    return result.rows[0];
  }

  // Task operations
  async createTask(task: AetherTask): Promise<AetherTask> {
    const result = await dbPool.query(
      `INSERT INTO tasks (agent_id, task_type, status, priority, payload, scheduled_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [task.agentId, task.taskType, task.status, task.priority, task.payload, task.scheduledAt]
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Created task', { taskId: result.rows[0].id, taskType: task.taskType });
    return result.rows[0];
  }

  async getTaskById(id: number): Promise<AetherTask | null> {
    const result = await dbPool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved task by ID', { taskId: id, found: result.rows.length > 0 });
    return result.rows.length ? result.rows[0] : null;
  }

  async getTasksByAgentId(agentId: number): Promise<AetherTask[]> {
    const result = await dbPool.query('SELECT * FROM tasks WHERE agent_id = $1 ORDER BY created_at DESC', [agentId]);
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved tasks by agent ID', { agentId, count: result.rows.length });
    return result.rows;
  }

  async getPendingTasks(): Promise<AetherTask[]> {
    const result = await dbPool.query("SELECT * FROM tasks WHERE status = 'pending' ORDER BY priority DESC, created_at ASC");
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved pending tasks', { count: result.rows.length });
    return result.rows;
  }

  async updateTaskStatus(id: number, status: string, result?: Record<string, any>): Promise<AetherTask> {
    const resultObj = await dbPool.query(
      `UPDATE tasks SET status = $1, result = $2, updated_at = CURRENT_TIMESTAMP,
       ${status === 'in_progress' ? 'started_at = CURRENT_TIMESTAMP' : ''}
       ${status === 'completed' ? ', completed_at = CURRENT_TIMESTAMP' : ''}
       WHERE id = $3 RETURNING *`,
      [status, result || null, id]
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Updated task status', { taskId: id, status });
    return resultObj.rows[0];
  }

  // Credential operations
  async storeCredential(credential: AetherCredential): Promise<AetherCredential> {
    const result = await dbPool.query(
      `INSERT INTO credentials (agent_id, platform, credential_key, credential_value, expires_at) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [credential.agentId, credential.platform, credential.credentialKey, credential.credentialValue, credential.expiresAt]
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Stored credential', { agentId: credential.agentId, platform: credential.platform });
    return result.rows[0];
  }

  async getCredential(agentId: number, platform: string, key: string): Promise<AetherCredential | null> {
    const result = await dbPool.query(
      'SELECT * FROM credentials WHERE agent_id = $1 AND platform = $2 AND credential_key = $3',
      [agentId, platform, key]
    );
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved credential', { agentId, platform, key, found: result.rows.length > 0 });
    return result.rows.length ? result.rows[0] : null;
  }

  // Asset operations
  async createAsset(asset: AetherAsset): Promise<AetherAsset> {
    const result = await dbPool.query(
      `INSERT INTO assets (name, type, path, metadata) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [asset.name, asset.type, asset.path, asset.metadata || {}]
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Created asset', { assetId: result.rows[0].id, assetName: asset.name });
    return result.rows[0];
  }

  async getAssetById(id: number): Promise<AetherAsset | null> {
    const result = await dbPool.query('SELECT * FROM assets WHERE id = $1', [id]);
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved asset by ID', { assetId: id, found: result.rows.length > 0 });
    return result.rows.length ? result.rows[0] : null;
  }

  // Analytics operations
  async recordMetric(analytics: AetherAnalytics): Promise<AetherAnalytics> {
    const result = await dbPool.query(
      `INSERT INTO analytics (agent_id, metric_name, value, metadata) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [analytics.agentId, analytics.metricName, analytics.value, analytics.metadata || {}]
    );
    AgentLogger.log(LogLevel.INFO, 'AetherDatabase', 'Recorded metric', { agentId: analytics.agentId, metricName: analytics.metricName, value: analytics.value });
    return result.rows[0];
  }

  async getMetrics(agentId: number, metricName?: string, limit: number = 100): Promise<AetherAnalytics[]> {
    let query = 'SELECT * FROM analytics WHERE agent_id = $1';
    const params: any[] = [agentId];
    
    if (metricName) {
      query += ' AND metric_name = $2';
      params.push(metricName);
    }
    
    query += ' ORDER BY recorded_at DESC LIMIT $3';
    params.push(limit);
    
    const result = await dbPool.query(query, params);
    AgentLogger.log(LogLevel.DEBUG, 'AetherDatabase', 'Retrieved metrics', { agentId, metricName, count: result.rows.length });
    return result.rows;
  }
}