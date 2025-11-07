/**
 * ZentixLink (ZLX) Messaging Protocol
 * Enables agent-to-agent communication across workspaces
 * 
 * @module zlxMessaging
 * @version 0.3.0
 */

import { ZLXMessage } from './zlxParser';

/**
 * Message delivery status
 */
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed';

/**
 * Extended ZLX message with routing and delivery info
 */
export interface ZLXEnvelope {
  message: ZLXMessage;
  status: MessageStatus;
  sent_at: string;
  delivered_at?: string;
  retry_count: number;
  route?: string[]; // Routing path through network
}

/**
 * Agent communication endpoint
 */
export interface AgentEndpoint {
  agent_did: string;
  workspace_id: string;
  network_address: string; // WebSocket/HTTP endpoint
  last_seen: string;
  is_online: boolean;
}

/**
 * Message queue for agent
 */
export interface MessageQueue {
  agent_did: string;
  inbox: ZLXEnvelope[];
  outbox: ZLXEnvelope[];
}

/**
 * ZLX Messaging Service
 * Handles routing and delivery of messages between agents
 */
export class ZLXMessaging {
  private static endpoints: Map<string, AgentEndpoint> = new Map();
  private static queues: Map<string, MessageQueue> = new Map();

  /**
   * Register an agent endpoint for communication
   * 
   * @param agentDID - Agent's DID
   * @param workspaceId - Workspace identifier
   * @param networkAddress - Network endpoint (ws:// or http://)
   */
  static registerEndpoint(
    agentDID: string,
    workspaceId: string,
    networkAddress: string
  ): void {
    this.endpoints.set(agentDID, {
      agent_did: agentDID,
      workspace_id: workspaceId,
      network_address: networkAddress,
      last_seen: new Date().toISOString(),
      is_online: true,
    });

    // Initialize message queue if not exists
    if (!this.queues.has(agentDID)) {
      this.queues.set(agentDID, {
        agent_did: agentDID,
        inbox: [],
        outbox: [],
      });
    }
  }

  /**
   * Send a message to another agent
   * 
   * @param message - ZLX message to send
   * @returns Message envelope with delivery status
   */
  static sendMessage(message: ZLXMessage): ZLXEnvelope {
    const envelope: ZLXEnvelope = {
      message,
      status: 'pending',
      sent_at: new Date().toISOString(),
      retry_count: 0,
      route: [message.sender],
    };

    // Add to sender's outbox
    const senderQueue = this.queues.get(message.sender);
    if (senderQueue) {
      senderQueue.outbox.push(envelope);
    }

    // Attempt delivery
    const delivered = this.deliverMessage(envelope);
    if (delivered) {
      envelope.status = 'delivered';
      envelope.delivered_at = new Date().toISOString();
    } else {
      envelope.status = 'failed';
    }

    return envelope;
  }

  /**
   * Deliver message to recipient's inbox
   * 
   * @private
   * @param envelope - Message envelope
   * @returns true if delivered successfully
   */
  private static deliverMessage(envelope: ZLXEnvelope): boolean {
    const recipientDID = envelope.message.receiver;

    // Check if broadcast
    if (recipientDID === 'broadcast') {
      // Deliver to all registered agents
      this.queues.forEach((queue) => {
        if (queue.agent_did !== envelope.message.sender) {
          queue.inbox.push({ ...envelope });
        }
      });
      return true;
    }

    // Check if recipient exists
    const recipientQueue = this.queues.get(recipientDID);
    if (!recipientQueue) {
      return false;
    }

    // Add to recipient's inbox
    recipientQueue.inbox.push(envelope);
    envelope.route?.push(recipientDID);

    return true;
  }

  /**
   * Get inbox messages for an agent
   * 
   * @param agentDID - Agent's DID
   * @param limit - Maximum messages to return
   * @returns Array of message envelopes
   */
  static getInbox(agentDID: string, limit = 50): ZLXEnvelope[] {
    const queue = this.queues.get(agentDID);
    if (!queue) return [];
    return queue.inbox.slice(-limit);
  }

  /**
   * Get unread messages for an agent
   * 
   * @param agentDID - Agent's DID
   * @returns Array of unread message envelopes
   */
  static getUnreadMessages(agentDID: string): ZLXEnvelope[] {
    const queue = this.queues.get(agentDID);
    if (!queue) return [];
    
    // Filter messages that haven't been marked as read
    // In a real implementation, you'd track read status
    return queue.inbox.filter((env) => env.status === 'delivered');
  }

  /**
   * Clear inbox for an agent
   * 
   * @param agentDID - Agent's DID
   */
  static clearInbox(agentDID: string): void {
    const queue = this.queues.get(agentDID);
    if (queue) {
      queue.inbox = [];
    }
  }

  /**
   * Check if agent is online
   * 
   * @param agentDID - Agent's DID
   * @returns true if agent is registered and online
   */
  static isOnline(agentDID: string): boolean {
    const endpoint = this.endpoints.get(agentDID);
    return endpoint?.is_online ?? false;
  }

  /**
   * Get all registered agents
   * 
   * @returns Array of agent endpoints
   */
  static getRegisteredAgents(): AgentEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Broadcast message to all agents
   * 
   * @param sender - Sender's DID
   * @param messageType - Type of broadcast message
   * @param payload - Message payload
   * @returns Message envelope
   */
  static broadcast(
    sender: string,
    messageType: 'query' | 'response' | 'event' | 'command',
    payload: any
  ): ZLXEnvelope {
    const message: ZLXMessage = {
      version: '1.0',
      sender,
      receiver: 'broadcast',
      messageType,
      payload,
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage(message);
  }

  /**
   * Find agents by workspace
   * 
   * @param workspaceId - Workspace identifier
   * @returns Array of agents in that workspace
   */
  static getAgentsByWorkspace(workspaceId: string): AgentEndpoint[] {
    return Array.from(this.endpoints.values()).filter(
      (ep) => ep.workspace_id === workspaceId
    );
  }

  /**
   * Update agent's online status
   * 
   * @param agentDID - Agent's DID
   * @param isOnline - Online status
   */
  static updateStatus(agentDID: string, isOnline: boolean): void {
    const endpoint = this.endpoints.get(agentDID);
    if (endpoint) {
      endpoint.is_online = isOnline;
      endpoint.last_seen = new Date().toISOString();
    }
  }

  /**
   * Get network statistics
   * 
   * @returns Network stats object
   */
  static getNetworkStats() {
    const totalAgents = this.endpoints.size;
    const onlineAgents = Array.from(this.endpoints.values()).filter(
      (ep) => ep.is_online
    ).length;

    let totalMessages = 0;
    this.queues.forEach((queue) => {
      totalMessages += queue.inbox.length + queue.outbox.length;
    });

    return {
      total_agents: totalAgents,
      online_agents: onlineAgents,
      total_messages: totalMessages,
      workspaces: new Set(
        Array.from(this.endpoints.values()).map((ep) => ep.workspace_id)
      ).size,
    };
  }
}
