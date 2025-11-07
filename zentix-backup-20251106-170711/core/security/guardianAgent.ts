/**
 * Guardian Agent - Autonomous Security & Ethics Monitor
 * Special agents that monitor and enforce protocol compliance
 * 
 * @module guardianAgent
 * @version 0.5.0
 */

import { AgentWithDID } from '../identity/didAixIntegration';
import { PolicyEngine, Violation } from './policyEngine';
import { ZLXMessaging } from '../../network/zlx/zlxMessaging';

/**
 * Guardian agent role types
 */
export type GuardianRole =
  | 'security_auditor'
  | 'violation_detector'
  | 'penalty_enforcer'
  | 'community_moderator';

/**
 * Guardian report
 */
export interface GuardianReport {
  id: string;
  guardian_did: string;
  target_agent_did: string;
  report_type: 'violation' | 'warning' | 'recommendation' | 'clearance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  findings: string;
  evidence: Record<string, any>;
  timestamp: string;
  reviewed_by?: string[];
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Guardian Agent System
 * Autonomous agents that monitor and enforce protocol rules
 */
export class GuardianAgent {
  private static guardians: Map<string, AgentWithDID> = new Map();
  private static reports: GuardianReport[] = [];
  private static readonly GUARDIAN_SKILLS = [
    'security_audit',
    'violation_detection',
    'penalty_enforcement',
    'community_moderation',
  ];

  /**
   * Register an agent as a guardian
   * 
   * @param agent - Agent to register as guardian
   * @param role - Guardian role
   * @returns true if registered successfully
   */
  static registerGuardian(
    agent: AgentWithDID,
    role: GuardianRole
  ): boolean {
    // Check if agent has required skills
    const hasRequiredSkills = this.GUARDIAN_SKILLS.some((skill) =>
      agent.aix.skills.some((s) => s.name === skill)
    );

    if (!hasRequiredSkills) {
      console.warn(
        `⚠️  Agent ${agent.aix.name} lacks required guardian skills`
      );
      return false;
    }

    this.guardians.set(agent.did.did, agent);
    console.log(`✅ Guardian registered: ${agent.aix.name} (${role})`);

    // Register in network
    ZLXMessaging.registerEndpoint(
      agent.did.did,
      'guardian-network',
      `ws://zentix.guardian/${agent.did.did}`
    );

    return true;
  }

  /**
   * Monitor agent activity for violations
   * 
   * @param targetAgent - Agent to monitor
   * @param action - Action performed
   * @param metadata - Action context
   * @returns Guardian report if issues found
   */
  static async monitorActivity(
    targetAgent: AgentWithDID,
    action: string,
    metadata: Record<string, any>
  ): Promise<GuardianReport | null> {
    // Check for policy violations
    const violation = await PolicyEngine.enforce(
      targetAgent.did.did,
      action,
      metadata
    );

    if (!violation) {
      return null;
    }

    // Select a guardian to handle this
    const guardian = this.selectGuardian();
    if (!guardian) {
      console.warn('⚠️  No guardians available to handle violation');
      return null;
    }

    // Create report
    const report: GuardianReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      guardian_did: guardian.did.did,
      target_agent_did: targetAgent.did.did,
      report_type: 'violation',
      severity: violation.severity,
      findings: `Violation detected: ${violation.violation_type}`,
      evidence: {
        action,
        metadata,
        violation_details: violation,
      },
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    this.reports.push(report);

    console.log(
      `👮 Guardian ${guardian.aix.name} created report ${report.id}`
    );

    // Notify other guardians
    await this.notifyGuardians(report);

    return report;
  }

  /**
   * Select a guardian to handle a case
   * 
   * @private
   * @returns Selected guardian or null
   */
  private static selectGuardian(): AgentWithDID | null {
    const guardiansArray = Array.from(this.guardians.values());
    if (guardiansArray.length === 0) return null;

    // Simple random selection (can be improved with workload balancing)
    return guardiansArray[
      Math.floor(Math.random() * guardiansArray.length)
    ];
  }

  /**
   * Notify all guardians about a report
   * 
   * @private
   * @param report - Report to broadcast
   */
  private static async notifyGuardians(
    report: GuardianReport
  ): Promise<void> {
    this.guardians.forEach((guardian) => {
      const message = ZLXMessaging.sendMessage({
        version: '1.0',
        sender: 'zentix-governance',
        receiver: guardian.did.did,
        messageType: 'event',
        payload: {
          type: 'guardian_alert',
          report_id: report.id,
          severity: report.severity,
        },
        timestamp: new Date().toISOString(),
      });

      console.log(
        `📨 Alert sent to guardian ${guardian.aix.name}: ${message.status}`
      );
    });
  }

  /**
   * Review a report (guardian voting)
   * 
   * @param reportId - Report ID
   * @param guardianDID - Reviewing guardian's DID
   * @param approved - Approval decision
   */
  static reviewReport(
    reportId: string,
    guardianDID: string,
    approved: boolean
  ): void {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) {
      console.warn(`⚠️  Report ${reportId} not found`);
      return;
    }

    if (!report.reviewed_by) {
      report.reviewed_by = [];
    }

    report.reviewed_by.push(guardianDID);

    // Check if enough reviews (simple majority)
    const minReviews = Math.ceil(this.guardians.size * 0.66);
    if (report.reviewed_by.length >= minReviews) {
      report.status = approved ? 'approved' : 'rejected';
      console.log(`✅ Report ${reportId} ${report.status} by guardians`);
    }
  }

  /**
   * Get all active guardians
   * 
   * @returns Array of guardian agents
   */
  static getActiveGuardians(): AgentWithDID[] {
    return Array.from(this.guardians.values());
  }

  /**
   * Get reports for a specific agent
   * 
   * @param agentDID - Agent's DID
   * @returns Array of reports
   */
  static getAgentReports(agentDID: string): GuardianReport[] {
    return this.reports.filter((r) => r.target_agent_did === agentDID);
  }

  /**
   * Get all pending reports
   * 
   * @returns Array of pending reports
   */
  static getPendingReports(): GuardianReport[] {
    return this.reports.filter((r) => r.status === 'pending');
  }

  /**
   * Get guardian network statistics
   * 
   * @returns Statistics object
   */
  static getStats() {
    return {
      total_guardians: this.guardians.size,
      total_reports: this.reports.length,
      pending_reports: this.reports.filter((r) => r.status === 'pending')
        .length,
      approved_reports: this.reports.filter((r) => r.status === 'approved')
        .length,
      rejected_reports: this.reports.filter((r) => r.status === 'rejected')
        .length,
    };
  }

  /**
   * Perform security audit on agent
   * 
   * @param agent - Agent to audit
   * @returns Audit report
   */
  static async auditAgent(agent: AgentWithDID): Promise<{
    compliant: boolean;
    score: number;
    violations: number;
    recommendations: string[];
  }> {
    const complianceScore = PolicyEngine.getComplianceScore(agent.did.did);
    const violations = PolicyEngine.getViolationHistory(agent.did.did);
    const recommendations = [];

    if (complianceScore < 70) {
      recommendations.push('Improve compliance to avoid penalties');
    }

    if (violations.length > 5) {
      recommendations.push('Review past violations and adjust behavior');
    }

    if (agent.wallet.balance > 1000) {
      recommendations.push('Consider distributing excess tokens');
    }

    return {
      compliant: complianceScore >= 70,
      score: complianceScore,
      violations: violations.length,
      recommendations,
    };
  }
}
