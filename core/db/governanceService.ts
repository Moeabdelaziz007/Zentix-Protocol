import { supabaseClient } from './supabaseClient';
import { Agent, Guardian, Violation, Audit } from '../types';

export class GovernanceService {
  private static instance: GovernanceService;
  private governanceStats: {
    totalViolations: number;
    totalAudits: number;
    activeGuardians: number;
    averageCompliance: number;
  };

  private constructor() {
    this.governanceStats = {
      totalViolations: 0,
      totalAudits: 0,
      activeGuardians: 4,
      averageCompliance: 100,
    };
  }

  public static getInstance(): GovernanceService {
    if (!GovernanceService.instance) {
      GovernanceService.instance = new GovernanceService();
    }
    return GovernanceService.instance;
  }

  // Governance Stats Methods
  public async getGovernanceStats() {
    // Try to fetch from database first
    const dbStats = await supabaseClient.readOne('analytics_events', 'governance_stats');
    if (dbStats) {
      return dbStats;
    }
    // Return in-memory stats if not found in database
    return this.governanceStats;
  }

  public async updateGovernanceStats(stats: Partial<typeof this.governanceStats>) {
    this.governanceStats = { ...this.governanceStats, ...stats };
    
    // Save to database
    const existing = await supabaseClient.readOne('analytics_events', 'governance_stats');
    if (existing) {
      await supabaseClient.update('analytics_events', 'governance_stats', {
        event_data: this.governanceStats
      });
    } else {
      await supabaseClient.create('analytics_events', {
        id: 'governance_stats',
        event_type: 'governance_stats',
        event_data: this.governanceStats,
        timestamp: new Date().toISOString()
      });
    }
    
    return this.governanceStats;
  }

  // Agent Methods
  public async getAllAgents(): Promise<Agent[] | null> {
    return await supabaseClient.readAll('agents');
  }

  public async getAgentById(id: string): Promise<Agent | null> {
    return await supabaseClient.readOne('agents', id);
  }

  public async createAgent(agent: Omit<Agent, 'id'>): Promise<Agent | null> {
    return await supabaseClient.create('agents', agent);
  }

  public async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    return await supabaseClient.update('agents', id, updates);
  }

  public async deleteAgent(id: string): Promise<boolean> {
    return await supabaseClient.delete('agents', id);
  }

  // Guardian Methods
  public async getAllGuardians(): Promise<Guardian[] | null> {
    return await supabaseClient.readAll('guardians');
  }

  public async getGuardianById(id: string): Promise<Guardian | null> {
    return await supabaseClient.readOne('guardians', id);
  }

  public async createGuardian(guardian: Omit<Guardian, 'id'>): Promise<Guardian | null> {
    return await supabaseClient.create('guardians', guardian);
  }

  public async updateGuardian(id: string, updates: Partial<Guardian>): Promise<Guardian | null> {
    return await supabaseClient.update('guardians', id, updates);
  }

  public async deleteGuardian(id: string): Promise<boolean> {
    return await supabaseClient.delete('guardians', id);
  }

  // Violation Methods
  public async getAllViolations(): Promise<Violation[] | null> {
    return await supabaseClient.readAll('violations');
  }

  public async getViolationById(id: string): Promise<Violation | null> {
    return await supabaseClient.readOne('violations', id);
  }

  public async createViolation(violation: Omit<Violation, 'id'>): Promise<Violation | null> {
    const result = await supabaseClient.create('violations', violation);
    if (result) {
      // Update governance stats
      await this.updateGovernanceStats({ totalViolations: this.governanceStats.totalViolations + 1 });
    }
    return result;
  }

  public async updateViolation(id: string, updates: Partial<Violation>): Promise<Violation | null> {
    return await supabaseClient.update('violations', id, updates);
  }

  public async deleteViolation(id: string): Promise<boolean> {
    return await supabaseClient.delete('violations', id);
  }

  // Audit Methods
  public async getAllAudits(): Promise<Audit[] | null> {
    return await supabaseClient.readAll('audits');
  }

  public async getAuditById(id: string): Promise<Audit | null> {
    return await supabaseClient.readOne('audits', id);
  }

  public async createAudit(audit: Omit<Audit, 'id'>): Promise<Audit | null> {
    const result = await supabaseClient.create('audits', audit);
    if (result) {
      // Update governance stats
      await this.updateGovernanceStats({ totalAudits: this.governanceStats.totalAudits + 1 });
    }
    return result;
  }

  public async updateAudit(id: string, updates: Partial<Audit>): Promise<Audit | null> {
    return await supabaseClient.update('audits', id, updates);
  }

  public async deleteAudit(id: string): Promise<boolean> {
    return await supabaseClient.delete('audits', id);
  }
}