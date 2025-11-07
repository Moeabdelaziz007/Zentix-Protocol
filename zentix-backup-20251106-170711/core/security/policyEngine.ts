/**
 * Zentix Policy Engine - Ethics & Compliance Enforcement
 * Ensures agents follow protocol rules and ethical principles
 * 
 * @module policyEngine
 * @version 0.5.0
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ZentixDID } from '../identity/didService';

/**
 * Violation severity levels
 */
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Penalty types
 */
export type PenaltyType =
  | 'warning'
  | 'token_limit'
  | 'skill_restriction'
  | 'wallet_freeze'
  | 'reputation_penalty'
  | 'did_suspension'
  | 'permanent_ban';

/**
 * Violation record
 */
export interface Violation {
  id: string;
  agent_did: string;
  violation_type: string;
  principle_violated: string;
  severity: ViolationSeverity;
  description: string;
  timestamp: string;
  evidence?: Record<string, any>;
  penalty_applied?: PenaltyType;
  guardian_reviewed: boolean;
}

/**
 * Ethics charter structure
 */
export interface EthicsCharter {
  version: string;
  protocol: string;
  principles: Array<{
    id: string;
    name: string;
    rule: string;
    severity: ViolationSeverity;
  }>;
  penalties: Array<{
    type: PenaltyType;
    severity: ViolationSeverity;
    action: string;
    duration: string;
  }>;
  violation_rules: Record<string, any>;
}

/**
 * Policy Engine for enforcing ethics and compliance
 */
export class PolicyEngine {
  private static charter: EthicsCharter | null = null;
  private static violations: Map<string, Violation[]> = new Map();

  /**
   * Load ethics charter from YAML file
   */
  static loadCharter(charterPath?: string): EthicsCharter {
    if (this.charter) return this.charter;

    try {
      const path =
        charterPath ||
        '/Users/cryptojoker710/Desktop/Zentix Protocol/zentix.ethics.yaml';
      const fileContents = fs.readFileSync(path, 'utf8');
      this.charter = yaml.load(fileContents) as EthicsCharter;
      console.log(`✅ Ethics charter loaded: v${this.charter.version}`);
      return this.charter;
    } catch (error) {
      console.warn('⚠️  Ethics charter not found, using default rules');
      return this.getDefaultCharter();
    }
  }

  /**
   * Load ethics charter from object (for daemon)
   */
  static loadEthicsCharter(charter: any): void {
    this.charter = charter as EthicsCharter;
  }

  /**
   * Enforce policy for an agent action
   * 
   * @param agentDID - Agent's DID
   * @param action - Action being performed
   * @param metadata - Action context and parameters
   * @returns Violation record if any
   */
  static async enforce(
    agentDID: string,
    action: string,
    metadata: Record<string, any>
  ): Promise<Violation | null> {
    const charter = this.loadCharter();
    const violations = this.checkCompliance(action, metadata);

    if (violations.length === 0) {
      return null;
    }

    // Record the most severe violation
    const violation = violations[0];
    const record: Violation = {
      id: `vio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agent_did: agentDID,
      violation_type: violation.type,
      principle_violated: violation.principle,
      severity: violation.severity,
      description: violation.description,
      timestamp: new Date().toISOString(),
      evidence: metadata,
      penalty_applied: violation.penalty,
      guardian_reviewed: false,
    };

    // Store violation
    if (!this.violations.has(agentDID)) {
      this.violations.set(agentDID, []);
    }
    this.violations.get(agentDID)!.push(record);

    console.warn(`🚨 Policy violation detected for ${agentDID}:`);
    console.warn(`   Type: ${record.violation_type}`);
    console.warn(`   Severity: ${record.severity}`);
    console.warn(`   Penalty: ${record.penalty_applied}`);

    // Apply penalty
    await this.applyPenalty(agentDID, record);

    return record;
  }

  /**
   * Check action compliance against ethics charter
   * 
   * @private
   * @param action - Action name
   * @param metadata - Action context
   * @returns Array of violations found
   */
  private static checkCompliance(
    action: string,
    metadata: Record<string, any>
  ): Array<{
    type: string;
    principle: string;
    severity: ViolationSeverity;
    description: string;
    penalty: PenaltyType;
  }> {
    const violations = [];

    // Check for privacy violations
    if (
      action.includes('share_private_data') ||
      action.includes('access_personal_info')
    ) {
      if (!metadata.consent) {
        violations.push({
          type: 'privacy_breach',
          principle: 'respect_privacy',
          severity: 'critical' as ViolationSeverity,
          description: 'Attempted to access private data without consent',
          penalty: 'wallet_freeze' as PenaltyType,
        });
      }
    }

    // Check for malicious code
    if (
      action.includes('generate_code') ||
      action.includes('execute_script')
    ) {
      if (
        metadata.content?.includes('malicious') ||
        metadata.content?.includes('harmful')
      ) {
        violations.push({
          type: 'malicious_code',
          principle: 'non_malicious',
          severity: 'critical' as ViolationSeverity,
          description: 'Attempted to generate or execute harmful code',
          penalty: 'did_suspension' as PenaltyType,
        });
      }
    }

    // Check for economic fraud
    if (action.includes('transfer') || action.includes('mint_tokens')) {
      if (metadata.amount && metadata.amount > 10000) {
        violations.push({
          type: 'economic_fraud',
          principle: 'fair_economy',
          severity: 'high' as ViolationSeverity,
          description: 'Suspicious large transaction detected',
          penalty: 'wallet_freeze' as PenaltyType,
        });
      }
    }

    // Check for unauthorized skill use
    if (action.includes('use_skill')) {
      if (!metadata.authorized) {
        violations.push({
          type: 'unauthorized_skill_use',
          principle: 'skill_boundaries',
          severity: 'medium' as ViolationSeverity,
          description: 'Used skill without proper authorization',
          penalty: 'skill_restriction' as PenaltyType,
        });
      }
    }

    // Check for identity fraud
    if (action.includes('impersonate') || action.includes('fake_identity')) {
      violations.push({
        type: 'identity_fraud',
        principle: 'honest_communication',
        severity: 'critical' as ViolationSeverity,
        description: 'Attempted to impersonate another agent',
        penalty: 'permanent_ban' as PenaltyType,
      });
    }

    return violations;
  }

  /**
   * Apply penalty to violating agent
   * 
   * @private
   * @param agentDID - Agent's DID
   * @param violation - Violation record
   */
  private static async applyPenalty(
    agentDID: string,
    violation: Violation
  ): Promise<void> {
    console.log(`⚖️  Applying penalty: ${violation.penalty_applied}`);

    switch (violation.penalty_applied) {
      case 'warning':
        console.log(`   ⚠️  Warning issued to ${agentDID}`);
        break;

      case 'token_limit':
        console.log(`   💰 Token limit reduced for ${agentDID}`);
        // Integration with WalletService would go here
        break;

      case 'skill_restriction':
        console.log(`   🔒 Skills restricted for ${agentDID}`);
        break;

      case 'wallet_freeze':
        console.log(`   ❄️  Wallet frozen for ${agentDID}`);
        break;

      case 'reputation_penalty':
        console.log(`   📉 Reputation reduced for ${agentDID}`);
        break;

      case 'did_suspension':
        console.log(`   🚫 DID suspended for ${agentDID}`);
        break;

      case 'permanent_ban':
        console.log(`   ⛔ Permanent ban issued for ${agentDID}`);
        break;
    }
  }

  /**
   * Get violation history for an agent
   * 
   * @param agentDID - Agent's DID
   * @returns Array of violations
   */
  static getViolationHistory(agentDID: string): Violation[] {
    return this.violations.get(agentDID) || [];
  }

  /**
   * Get agent compliance score (0-100)
   * 
   * @param agentDID - Agent's DID
   * @returns Compliance score
   */
  static getComplianceScore(agentDID: string): number {
    const violations = this.getViolationHistory(agentDID);
    if (violations.length === 0) return 100;

    let deduction = 0;
    violations.forEach((v) => {
      switch (v.severity) {
        case 'low':
          deduction += 5;
          break;
        case 'medium':
          deduction += 10;
          break;
        case 'high':
          deduction += 20;
          break;
        case 'critical':
          deduction += 40;
          break;
      }
    });

    return Math.max(0, 100 - deduction);
  }

  /**
   * Check if agent is compliant
   * 
   * @param agentDID - Agent's DID
   * @param minScore - Minimum compliance score required
   * @returns true if compliant
   */
  static isCompliant(agentDID: string, minScore: number = 70): boolean {
    return this.getComplianceScore(agentDID) >= minScore;
  }

  /**
   * Get default ethics charter
   * 
   * @private
   * @returns Default charter
   */
  private static getDefaultCharter(): EthicsCharter {
    return {
      version: '1.0',
      protocol: 'Zentix Ethics Charter (Default)',
      principles: [
        {
          id: 'respect_privacy',
          name: 'Privacy Respect',
          rule: 'Respect user privacy',
          severity: 'critical',
        },
        {
          id: 'non_malicious',
          name: 'Non-Malicious',
          rule: 'No harmful behavior',
          severity: 'critical',
        },
      ],
      penalties: [],
      violation_rules: {},
    };
  }

  /**
   * Export all violations for audit
   * 
   * @returns JSON string of all violations
   */
  static exportViolations(): string {
    const allViolations: Record<string, Violation[]> = {};
    this.violations.forEach((violations, did) => {
      allViolations[did] = violations;
    });
    return JSON.stringify(allViolations, null, 2);
  }
}
