/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

/**
 * Zentix Sentinel Multi-Agent System (ZSMAS) Base Agent
 * Abstract base class for all ZSMAS agents
 */

import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import { v4 as uuidv4 } from 'uuid';
import type { ZSMASAgentType } from './types';

/**
 * Base Agent Class for ZSMAS
 */
export abstract class BaseZSMASAgent {
  protected agentId: string;
  protected agentType: ZSMASAgentType;
  protected name: string;
  protected isActive: boolean;
  protected createdAt: string;

  constructor(agentType: ZSMASAgentType, name: string) {
    this.agentId = uuidv4();
    this.agentType = agentType;
    this.name = name;
    this.isActive = true;
    this.createdAt = new Date().toISOString();
    
    AgentLogger.log(
      LogLevel.INFO,
      'ZSMAS',
      'agent_initialized',
      { agentId: this.agentId, agentType, name }
    );
  }

  /**
   * Get agent ID
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Get agent type
   */
  getAgentType(): ZSMASAgentType {
    return this.agentType;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Check if agent is active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Activate agent
   */
  activate(): void {
    this.isActive = true;
    AgentLogger.log(
      LogLevel.INFO,
      'ZSMAS',
      'agent_activated',
      { agentId: this.agentId, agentType: this.agentType }
    );
  }

  /**
   * Deactivate agent
   */
  deactivate(): void {
    this.isActive = false;
    AgentLogger.log(
      LogLevel.INFO,
      'ZSMAS',
      'agent_deactivated',
      { agentId: this.agentId, agentType: this.agentType }
    );
  }

  /**
   * Abstract method to be implemented by concrete agents
   */
  abstract process(data: any): Promise<any>;

  /**
   * Log agent activity
   */
  protected log(level: LogLevel, operation: string, metadata?: Record<string, any>): void {
    AgentLogger.log(
      level,
      `ZSMAS.${this.agentType}`,
      operation,
      { 
        agentId: this.agentId,
        agentName: this.name,
        ...metadata 
      }
    );
  }

  /**
   * Measure performance of agent operations
   */
  protected async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    return AgentLogger.measurePerformance(
      `ZSMAS.${this.agentType}`,
      operation,
      fn,
      { 
        agentId: this.agentId,
        agentName: this.name,
        ...metadata 
      }
    );
  }
}