#!/usr/bin/env tsx
/**
 * Zentix Governance Daemon
 * Continuous monitoring and enforcement of ethical policies
 * 
 * Run: npm run governance:daemon
 */

import { GuardianAgent } from '../core/security/guardianAgent';
import { PolicyEngine } from '../core/security/policyEngine';
import { AgentFactory } from '../core/integration/agentFactory';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Governance statistics
 */
interface GovernanceStats {
  totalAudits: number;
  violationsDetected: number;
  penaltiesApplied: number;
  activeGuardians: number;
  averageComplianceScore: number;
  uptime: number;
}

/**
 * Governance Daemon - Continuous monitoring service
 */
class GovernanceDaemon {
  private stats: GovernanceStats = {
    totalAudits: 0,
    violationsDetected: 0,
    penaltiesApplied: 0,
    activeGuardians: 0,
    averageComplianceScore: 100,
    uptime: 0,
  };

  private startTime: number = Date.now();
  private running: boolean = false;
  private guardians: any[] = [];
  private monitoredAgents: Map<string, any> = new Map();

  /**
   * Initialize the daemon
   */
  async initialize(): Promise<void> {
    console.log('\n🛡️  Zentix Governance Daemon Initializing...\n');
    console.log('═'.repeat(60) + '\n');

    // Load ethics charter
    this.loadEthicsCharter();

    // Create guardian agents
    await this.createGuardians();

    console.log('✅ Governance Daemon Ready\n');
    console.log('📊 Initial Configuration:');
    console.log(`   Active Guardians: ${this.guardians.length}`);
    console.log(`   Monitoring: Enabled`);
    console.log(`   Auto-enforcement: Enabled`);
    console.log(`   Blockchain logging: Pending deployment\n`);
  }

  /**
   * Load ethics charter from YAML
   */
  private loadEthicsCharter(): void {
    try {
      const charterPath = path.join(__dirname, '..', 'zentix.ethics.yaml');
      const charterContent = fs.readFileSync(charterPath, 'utf8');
      const charter = yaml.load(charterContent) as any;

      PolicyEngine.loadEthicsCharter(charter);
      console.log(`📜 Ethics Charter Loaded`);
      console.log(`   Principles: ${charter.principles.length}`);
      console.log(`   Penalties: ${charter.penalties.length}`);
      console.log(`   Violation Rules: ${Object.keys(charter.violation_rules || {}).length}\n`);
    } catch (error) {
      console.error('❌ Failed to load ethics charter:', error);
      console.log('   Using simplified governance mode\n');
      // Don't throw - continue with default charter
    }
  }

  /**
   * Create guardian agents
   */
  private async createGuardians(): Promise<void> {
    console.log('🔒 Creating Guardian Agents...\n');

    const guardianRoles: Array<'security_auditor' | 'violation_detector' | 'penalty_enforcer' | 'community_moderator'> = [
      'security_auditor',
      'violation_detector',
      'penalty_enforcer',
      'community_moderator',
    ];

    for (const role of guardianRoles) {
      const guardian = AgentFactory.createCompleteAgent({
        name: `Guardian-${role}`,
        archetype: 'guardian',
        tone: 'vigilant and fair',
        values: ['security', 'fairness', 'transparency'],
        skills: [
          { name: 'security_audit', description: 'Audit agent security' },
          { name: 'violation_detection', description: 'Detect policy violations' },
          { name: 'penalty_enforcement', description: 'Enforce penalties' },
          { name: 'community_moderation', description: 'Moderate community' },
        ],
        workspace_id: 'zentix-governance',
        initial_balance: 100,
      });

      const registered = GuardianAgent.registerGuardian(guardian.aix_did, role);
      if (registered) {
        this.guardians.push(guardian.aix_did);
        this.stats.activeGuardians++;
        console.log(`   ✓ ${guardian.aix_did.aix.name} (${role})`);
      }
    }

    console.log('');
  }

  /**
   * Start monitoring loop
   */
  async start(): Promise<void> {
    this.running = true;
    console.log('🚀 Governance Daemon Started\n');
    console.log('━'.repeat(60) + '\n');

    // Monitor loop
    while (this.running) {
      await this.monitoringCycle();
      await this.sleep(10000); // Check every 10 seconds
    }
  }

  /**
   * Single monitoring cycle
   */
  private async monitoringCycle(): Promise<void> {
    const now = new Date();
    this.stats.uptime = Math.floor((Date.now() - this.startTime) / 1000);

    // Log heartbeat every minute
    if (this.stats.uptime % 60 === 0) {
      console.log(`💓 [${now.toISOString()}] Heartbeat - Uptime: ${this.formatUptime(this.stats.uptime)}`);
      this.printStats();
    }

    // Audit monitored agents
    for (const [did, agent] of this.monitoredAgents) {
      await this.auditAgent(agent);
    }

    // Check for new agents to monitor
    // In production, this would query a registry or API
    await this.discoverNewAgents();
  }

  /**
   * Audit a single agent
   */
  private async auditAgent(agent: any): Promise<void> {
    this.stats.totalAudits++;

    const result = await GuardianAgent.auditAgent(agent.aix_did);

    if (!result.compliant) {
      this.stats.violationsDetected++;
      console.log(`\n⚠️  Compliance Issue Detected`);
      console.log(`   Agent: ${agent.aix_did.aix.name}`);
      console.log(`   Score: ${result.score}/100`);
      console.log(`   Action: Monitoring increased\n`);
    }

    // Update average compliance
    const scores = Array.from(this.monitoredAgents.values()).map((a) =>
      PolicyEngine.getComplianceScore(a.aix_did.did.did)
    );
    this.stats.averageComplianceScore =
      scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);
  }

  /**
   * Discover new agents to monitor
   */
  private async discoverNewAgents(): Promise<void> {
    // In production, query agent registry
    // For demo, this is a placeholder
  }

  /**
   * Monitor agent activity (called by external system)
   */
  async monitorActivity(
    agent: any,
    action: string,
    metadata: Record<string, any>
  ): Promise<void> {
    // Add agent to monitoring list
    if (!this.monitoredAgents.has(agent.aix_did.did.did)) {
      this.monitoredAgents.set(agent.aix_did.did.did, agent);
      console.log(`\n📍 New Agent Registered for Monitoring`);
      console.log(`   DID: ${agent.aix_did.did.did}`);
      console.log(`   Name: ${agent.aix_did.aix.name}\n`);
    }

    // Monitor the action
    const report = await GuardianAgent.monitorActivity(agent, action, metadata);

    if (report) {
      this.stats.violationsDetected++;
      this.stats.penaltiesApplied++;

      console.log(`\n🚨 Violation Detected and Reported`);
      console.log(`   Report ID: ${report.id}`);
      console.log(`   Agent: ${agent.aix_did.aix.name}`);
      console.log(`   Violation: ${report.findings}`);
      console.log(`   Severity: ${report.severity}`);
      console.log(`   Guardian: ${report.guardian_did}`);
      console.log(`   Status: ${report.status}\n`);

      // Log to metrics (for Manus monitoring)
      this.logMetric('governance.violations.detected', 1);
      this.logMetric('governance.penalties.applied', 1);
    }
  }

  /**
   * Print current statistics
   */
  private printStats(): void {
    console.log('\n📊 Governance Statistics:');
    console.log(`   Total Audits: ${this.stats.totalAudits}`);
    console.log(`   Violations Detected: ${this.stats.violationsDetected}`);
    console.log(`   Penalties Applied: ${this.stats.penaltiesApplied}`);
    console.log(`   Active Guardians: ${this.stats.activeGuardians}`);
    console.log(
      `   Avg Compliance Score: ${this.stats.averageComplianceScore.toFixed(1)}/100`
    );
    console.log(`   Uptime: ${this.formatUptime(this.stats.uptime)}\n`);
  }

  /**
   * Get current statistics
   */
  getStats(): GovernanceStats {
    return { ...this.stats };
  }

  /**
   * Health check endpoint
   */
  healthCheck(): { status: string; uptime: number; guardians: number } {
    return {
      status: this.running ? 'healthy' : 'stopped',
      uptime: this.stats.uptime,
      guardians: this.stats.activeGuardians,
    };
  }

  /**
   * Log metric (for Manus monitoring)
   */
  private logMetric(name: string, value: number): void {
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      console.log(`METRIC: ${name}=${value}`);
    }
  }

  /**
   * Format uptime
   */
  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Stop the daemon
   */
  stop(): void {
    this.running = false;
    console.log('\n👋 Governance Daemon Stopping...');
    console.log('   Final Statistics:\n');
    this.printStats();
    console.log('✅ Shutdown Complete\n');
  }
}

// ===============================================================
// Start Daemon
// ===============================================================

const daemon = new GovernanceDaemon();

// Initialize and start
daemon
  .initialize()
  .then(() => daemon.start())
  .catch((error) => {
    console.error('❌ Daemon Error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  daemon.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  daemon.stop();
  process.exit(0);
});

// Export for API access
export { daemon, GovernanceDaemon };
