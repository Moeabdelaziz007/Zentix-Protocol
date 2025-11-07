import { AIXAgent, createAIXAgent } from '../aix/aixSchema';
import { DidService, ZentixDID } from './didService';

/**
 * DID-AIX Integration Layer
 * Connects Zentix Digital Identities with AIX Agent personas
 * 
 * @module didAixIntegration
 * @version 0.1.0
 */

/**
 * Unified agent with both AIX persona and DID identity
 */
export interface AgentWithDID {
  aix: AIXAgent;
  did: ZentixDID;
}

/**
 * Integration service for managing agents with digital identities
 */
export class DidAixIntegration {
  /**
   * Create a new agent with both AIX persona and DID identity
   * Automatically generates DID and links it to the AIX agent
   * 
   * @param aixData - Raw AIX agent data
   * @returns AgentWithDID containing both identity layers
   * 
   * @example
   * ```ts
   * const agent = DidAixIntegration.createAgentWithDID({
   *   id: 'agent-001',
   *   name: 'Jules',
   *   persona: { archetype: 'analyst', tone: 'thoughtful', values: ['truth'] }
   * });
   * ```
   */
  static createAgentWithDID(aixData: any): AgentWithDID {
    // Create AIX agent with validation
    const aix = createAIXAgent(aixData);

    // Create corresponding DID
    const did = DidService.create(aix.name);

    // Link them together
    return { aix, did };
  }

  /**
   * Record an agent event in both AIX and DID systems
   * Ensures consistency across identity and persona layers
   * 
   * @param agentWithDID - The agent to update
   * @param eventType - Type of event
   * @param details - Event-specific details
   * @returns Updated AgentWithDID
   * 
   * @example
   * ```ts
   * agent = DidAixIntegration.recordAgentEvent(
   *   agent,
   *   'learning',
   *   { skill: 'pattern_recognition', confidence: 0.85 }
   * );
   * ```
   */
  static recordAgentEvent(
    agentWithDID: AgentWithDID,
    eventType: 'success' | 'failure' | 'learning' | 'interaction',
    details: Record<string, any>
  ): AgentWithDID {
    const updated = { ...agentWithDID };

    // Update DID history with event
    updated.did = DidService.recordEvent(updated.did, eventType, {
      ...details,
      agent_id: updated.aix.id,
    });

    return updated;
  }

  /**
   * Get comprehensive identity card for an agent
   * Combines AIX persona with DID verification data
   * 
   * @param agentWithDID - The agent
   * @returns Identity card object
   */
  static getIdentityCard(agentWithDID: AgentWithDID) {
    const summary = DidService.getLifespanSummary(agentWithDID.did);
    const fingerprint = DidService.createFingerprint(agentWithDID.did);

    return {
      agent_name: agentWithDID.aix.name,
      agent_id: agentWithDID.aix.id,
      did: agentWithDID.did.did,
      fingerprint,
      persona: agentWithDID.aix.persona,
      created: agentWithDID.did.created_at,
      age_days: summary.age_days,
      age_hours: summary.age_hours,
      total_events: summary.total_events,
      current_feelings: agentWithDID.aix.feelings,
      skills_count: agentWithDID.aix.skills.length,
      blockchain: agentWithDID.did.blockchain,
    };
  }

  /**
   * Export agent with DID for storage or blockchain submission
   * 
   * @param agentWithDID - The agent to export
   * @returns Object with separate AIX and DID JSON strings
   */
  static exportAgentWithDID(agentWithDID: AgentWithDID): {
    aix: string;
    did: string;
  } {
    return {
      aix: JSON.stringify(agentWithDID.aix, null, 2),
      did: DidService.export(agentWithDID.did),
    };
  }

  /**
   * Verify agent authenticity and integrity
   * Checks DID format, name consistency, and genesis event
   * 
   * @param agentWithDID - The agent to verify
   * @returns Verification result with reason if invalid
   */
  static verifyAgentAuthenticity(agentWithDID: AgentWithDID): {
    valid: boolean;
    reason?: string;
  } {
    const { aix, did } = agentWithDID;

    // Check DID format validity
    if (!DidService.isValidDID(did.did)) {
      return { valid: false, reason: 'Invalid DID format' };
    }

    // Check agent name consistency
    if (did.agent_name !== aix.name) {
      return { valid: false, reason: 'Agent name mismatch between AIX and DID' };
    }

    // Check for genesis event (birth certificate)
    const genesisEvent = did.history.find((h) => h.event === 'genesis');
    if (!genesisEvent) {
      return { valid: false, reason: 'Missing genesis event - no birth record' };
    }

    return { valid: true };
  }

  /**
   * Import agent from exported data
   * 
   * @param exportedData - Object containing AIX and DID JSON strings
   * @returns Reconstructed AgentWithDID
   */
  static importAgentWithDID(exportedData: { aix: string; did: string }): AgentWithDID {
    const aix = JSON.parse(exportedData.aix) as AIXAgent;
    const did = DidService.import(exportedData.did);
    return { aix, did };
  }

  /**
   * Get agent evolution timeline
   * Returns chronological list of all recorded events
   * 
   * @param agentWithDID - The agent
   * @returns Array of events with timestamps
   */
  static getEvolutionTimeline(agentWithDID: AgentWithDID) {
    return agentWithDID.did.history.map((entry) => ({
      event: entry.event,
      timestamp: entry.timestamp,
      date: new Date(entry.timestamp).toLocaleString(),
      payload: entry.payload,
    }));
  }
}
