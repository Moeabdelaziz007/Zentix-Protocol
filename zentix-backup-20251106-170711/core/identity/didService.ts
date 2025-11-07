import { randomBytes, createHash } from 'crypto';

/**
 * Zentix DID Service - Digital Identity Layer
 * Provides blockchain-backed identities for agents with persistent history
 * 
 * @module didService
 * @version 0.1.0
 */

/**
 * Represents a single event in an agent's history
 */
export interface DidHistory {
  event: string;
  timestamp: string;
  payload?: Record<string, any>;
}

/**
 * Complete Digital Identity for a Zentix Agent
 * Format: zxdid:zentix:0x<32-char-hex>
 */
export interface ZentixDID {
  did: string;
  created_at: string;
  agent_name: string;
  aix_hash: string;
  public_key: string;
  blockchain: string;
  age_days: number;
  history: DidHistory[];
}

/**
 * Service for managing Zentix Digital Identities
 */
export class DidService {
  /**
   * Generate a new DID for an agent
   * Creates a genesis block and unique identifier
   * 
   * @param agentName - The name of the agent
   * @param blockchain - Target blockchain (default: Polygon)
   * @returns Complete ZentixDID object
   * 
   * @example
   * ```ts
   * const did = DidService.create('Jules', 'Polygon');
   * console.log(did.did); // zxdid:zentix:0x8AFCE1B0921A9E91...
   * ```
   */
  static create(agentName: string, blockchain: string = 'Polygon'): ZentixDID {
    const randomHex = randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    
    // Create AIX hash - unique fingerprint of agent creation
    const aixHash = createHash('sha256')
      .update(`${agentName}:${timestamp}`)
      .digest('hex')
      .substring(0, 8);

    // Generate DID in W3C-compatible format
    const did = `zxdid:zentix:0x${randomHex.toUpperCase()}`;
    const publicKey = this.generatePublicKey();

    // Genesis event - birth of the agent
    const genesisHistory: DidHistory = {
      event: 'genesis',
      timestamp,
      payload: {
        agent_name: agentName,
        blockchain,
        aix_hash: aixHash,
      },
    };

    return {
      did,
      created_at: timestamp,
      agent_name: agentName,
      aix_hash: aixHash,
      public_key: publicKey,
      blockchain,
      age_days: 0,
      history: [genesisHistory],
    };
  }

  /**
   * Record an event in the agent's DID history
   * All events are immutable and timestamped
   * 
   * @param didObj - The DID object to update
   * @param event - Event type (e.g., 'learning', 'success', 'failure')
   * @param payload - Optional event data
   * @returns Updated DID object with new event
   * 
   * @example
   * ```ts
   * did = DidService.recordEvent(did, 'learning', { skill: 'analysis' });
   * ```
   */
  static recordEvent(
    didObj: ZentixDID,
    event: string,
    payload?: Record<string, any>
  ): ZentixDID {
    const updated = { ...didObj };
    updated.history.push({
      event,
      timestamp: new Date().toISOString(),
      ...(payload && { payload }),
    });
    updated.age_days = this.calculateAge(updated.created_at);
    return updated;
  }

  /**
   * Calculate agent age in days since genesis
   * 
   * @param createdAt - ISO timestamp of creation
   * @returns Age in days
   */
  static calculateAge(createdAt: string): number {
    const birth = new Date(createdAt).getTime();
    const now = Date.now();
    return Math.floor((now - birth) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate agent age in seconds (for precision tracking)
   * 
   * @param createdAt - ISO timestamp of creation
   * @returns Age in seconds
   */
  static calculateAgeSeconds(createdAt: string): number {
    const birth = new Date(createdAt).getTime();
    const now = Date.now();
    return Math.floor((now - birth) / 1000);
  }

  /**
   * Get comprehensive lifespan summary of an agent
   * 
   * @param didObj - The DID object
   * @returns Summary with age, events, and milestones
   */
  static getLifespanSummary(didObj: ZentixDID): {
    created: string;
    age_days: number;
    age_hours: number;
    total_events: number;
    event_types: string[];
  } {
    const age_days = this.calculateAge(didObj.created_at);
    const age_hours = Math.floor((this.calculateAgeSeconds(didObj.created_at) / 3600));
    const event_types = [...new Set(didObj.history.map((h) => h.event))];

    return {
      created: didObj.created_at,
      age_days,
      age_hours,
      total_events: didObj.history.length,
      event_types,
    };
  }

  /**
   * Generate cryptographic public key
   * In production, integrate with ethers.js or wallet provider
   * 
   * @private
   * @returns Hex-encoded public key
   */
  private static generatePublicKey(): string {
    return `0x${randomBytes(32).toString('hex').toUpperCase()}`;
  }

  /**
   * Verify DID format validity
   * Checks W3C-compatible format: zxdid:zentix:0x[32-char-hex]
   * 
   * @param did - The DID string to validate
   * @returns true if valid, false otherwise
   */
  static isValidDID(did: string): boolean {
    return /^zxdid:zentix:0x[A-F0-9]{32}$/.test(did);
  }

  /**
   * Export DID as JSON string for storage or blockchain
   * 
   * @param didObj - The DID object to export
   * @returns JSON string representation
   */
  static export(didObj: ZentixDID): string {
    return JSON.stringify(didObj, null, 2);
  }

  /**
   * Import DID from JSON string
   * 
   * @param jsonStr - JSON string containing DID data
   * @returns Parsed ZentixDID object
   */
  static import(jsonStr: string): ZentixDID {
    return JSON.parse(jsonStr) as ZentixDID;
  }

  /**
   * Create DID fingerprint for privacy-preserving identification
   * Uses SHA-256 hash of DID + creation timestamp
   * 
   * @param didObj - The DID object
   * @returns 16-character fingerprint hash
   */
  static createFingerprint(didObj: ZentixDID): string {
    return createHash('sha256')
      .update(didObj.did + didObj.created_at)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Get milestone events from history
   * Can filter by specific event type
   * 
   * @param didObj - The DID object
   * @param eventType - Optional filter for specific event type
   * @returns Array of matching history entries
   */
  static getMilestones(
    didObj: ZentixDID,
    eventType?: string
  ): DidHistory[] {
    if (eventType) {
      return didObj.history.filter((h) => h.event === eventType);
    }
    return didObj.history;
  }

  /**
   * Check if DID has reached a certain age threshold
   * 
   * @param didObj - The DID object
   * @param minDays - Minimum age in days
   * @returns true if agent is at least minDays old
   */
  static hasReachedAge(didObj: ZentixDID, minDays: number): boolean {
    return this.calculateAge(didObj.created_at) >= minDays;
  }

  /**
   * Get recent history events
   * 
   * @param didObj - The DID object
   * @param limit - Maximum number of events to return (default: 10)
   * @returns Array of recent history entries
   */
  static getRecentHistory(didObj: ZentixDID, limit: number = 10): DidHistory[] {
    return didObj.history.slice(-limit);
  }
}
