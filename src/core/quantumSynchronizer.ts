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

// src/core/quantumSynchronizer.ts
import { EventEmitter } from 'events';

interface QuantumMessage {
  taskId: string;
  from: string;
  to: string;
  payload: any;
  confidence: number;
  timestamp: number;
}

class QuantumSynchronizer extends EventEmitter {
  private agents: Map<string, any>;
  private messageQueue: QuantumMessage[];
  
  constructor() {
    super();
    this.agents = new Map();
    this.messageQueue = [];
    console.log('🌀 Quantum Synchronizer initialized');
  }
  
  // Register an agent with the synchronizer
  registerAgent(agentId: string, agent: any) {
    this.agents.set(agentId, agent);
    console.log(`🔗 Agent ${agentId} registered with Quantum Synchronizer`);
    
    // Listen for agent events if the agent has an emitter
    if (agent.getEmitter) {
      const emitter = agent.getEmitter();
      emitter.on('decision-ready', (data: any) => {
        this.broadcastDecision(agentId, data);
      });
      
      emitter.on('context-update', (data: any) => {
        this.syncContext(agentId, data);
      });
    }
  }
  
  // Broadcast a decision to all agents
  broadcastDecision(fromAgent: string, data: any) {
    const message: QuantumMessage = {
      taskId: data.taskId || `task-${Date.now()}`,
      from: fromAgent,
      to: 'all',
      payload: data,
      confidence: data.confidence || 0.5,
      timestamp: Date.now()
    };
    
    console.log(`📡 Broadcasting decision from ${fromAgent}:`, message);
    
    // Send to all registered agents
    this.agents.forEach((agent, agentId) => {
      if (agentId !== fromAgent && agent.receiveDecision) {
        agent.receiveDecision(message);
      }
    });
    
    // Emit event for external listeners
    this.emit('decision-broadcast', message);
  }
  
  // Synchronize context between agents
  syncContext(fromAgent: string, data: any) {
    const message: QuantumMessage = {
      taskId: data.taskId || `context-${Date.now()}`,
      from: fromAgent,
      to: 'all',
      payload: data,
      confidence: data.confidence || 0.5,
      timestamp: Date.now()
    };
    
    console.log(`🔄 Syncing context from ${fromAgent}:`, message);
    
    // Send to all registered agents
    this.agents.forEach((agent, agentId) => {
      if (agentId !== fromAgent && agent.receiveContext) {
        agent.receiveContext(message);
      }
    });
    
    // Emit event for external listeners
    this.emit('context-sync', message);
  }
  
  // Send a direct message to a specific agent
  sendMessage(fromAgent: string, toAgent: string, data: any) {
    const message: QuantumMessage = {
      taskId: data.taskId || `msg-${Date.now()}`,
      from: fromAgent,
      to: toAgent,
      payload: data,
      confidence: data.confidence || 0.5,
      timestamp: Date.now()
    };
    
    console.log(`✉️ Sending message from ${fromAgent} to ${toAgent}:`, message);
    
    const targetAgent = this.agents.get(toAgent);
    if (targetAgent && targetAgent.receiveMessage) {
      targetAgent.receiveMessage(message);
    }
    
    // Emit event for external listeners
    this.emit('message-sent', message);
  }
  
  // Get all registered agents
  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }
  
  // Remove an agent from the synchronizer
  unregisterAgent(agentId: string) {
    this.agents.delete(agentId);
    console.log(`❌ Agent ${agentId} unregistered from Quantum Synchronizer`);
  }
}

// Create a singleton instance
const quantumSynchronizer = new QuantumSynchronizer();

export { QuantumSynchronizer, quantumSynchronizer, QuantumMessage };