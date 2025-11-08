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
 * Zentix Sentinel Multi-Agent System (ZSMAS) Audit Agent
 * The "compliance" layer that ensures strategies follow protocol rules
 */

import { BaseZSMASAgent } from './baseAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import type { 
  StrategyProposal, 
  AuditReport 
} from './types';

/**
 * Protocol Rule Interface
 */
interface ProtocolRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'performance' | 'governance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: () => boolean;
  violation_message: string;
}

/**
 * Audit Agent Class
 */
export class AuditAgent extends BaseZSMASAgent {
  private protocolRules: ProtocolRule[] = [];

  constructor(name: string = 'AuditAgent') {
    super('audit', name);
    this.initializeProtocolRules();
  }

  /**
   * Process strategy proposal and perform audit
   */
  async process(strategy: StrategyProposal): Promise<AuditReport> {
    return this.measurePerformance(
      'audit_strategy',
      async () => {
        this.log(LogLevel.INFO, 'auditing_strategy', { 
          strategyId: strategy.id,
          userDid: strategy.user_did
        });

        // Check compliance with protocol rules
        const complianceCheck = this.checkProtocolCompliance(strategy);
        
        // Check regulatory compliance (simplified)
        const regulatoryCompliance = this.checkRegulatoryCompliance(strategy);
        
        // Determine if strategy is approved
        const approved = complianceCheck.passed && regulatoryCompliance.passed;
        
        const auditReport: AuditReport = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          strategy_id: strategy.id,
          agent_id: this.getAgentId(),
          compliance_check: complianceCheck.passed,
          protocol_rules_violations: complianceCheck.violations,
          regulatory_compliance: regulatoryCompliance.passed,
          regulatory_issues: regulatoryCompliance.issues,
          approved,
          audit_notes: this.generateAuditNotes(complianceCheck, regulatoryCompliance),
          created_at: new Date().toISOString()
        };
        
        this.log(LogLevel.SUCCESS, 'audit_completed', { 
          auditId: auditReport.id,
          approved: auditReport.approved,
          violations: auditReport.protocol_rules_violations.length
        });
        
        return auditReport;
      }
    );
  }

  /**
   * Initialize protocol rules
   */
  private initializeProtocolRules(): void {
    this.protocolRules = [
      {
        id: 'max_risk',
        name: 'Maximum Risk Threshold',
        description: 'Strategy risk score must not exceed 80%',
        category: 'security',
        severity: 'critical',
        condition: (strategy: StrategyProposal) => strategy.risk_score <= 80,
        violation_message: 'Strategy risk score exceeds maximum threshold of 80%'
      },
      {
        id: 'min_diversification',
        name: 'Minimum Diversification',
        description: 'Portfolio must have at least 2 different assets',
        category: 'risk',
        severity: 'medium',
        condition: (strategy: StrategyProposal) => Object.keys(strategy.proposed_allocation).length >= 2,
        violation_message: 'Portfolio must contain at least 2 different assets'
      },
      {
        id: 'no_blacklisted_assets',
        name: 'No Blacklisted Assets',
        description: 'Strategy must not include blacklisted assets',
        category: 'security',
        severity: 'high',
        condition: (strategy: StrategyProposal) => {
          const blacklisted = ['XXX', 'YYY', 'ZZZ']; // Example blacklisted assets
          return !Object.keys(strategy.proposed_allocation).some(asset => 
            blacklisted.includes(asset)
          );
        },
        violation_message: 'Strategy includes blacklisted assets'
      },
      {
        id: 'max_single_asset',
        name: 'Maximum Single Asset Allocation',
        description: 'No single asset can exceed 50% of portfolio',
        category: 'risk',
        severity: 'medium',
        condition: (strategy: StrategyProposal) => {
          return !Object.values(strategy.proposed_allocation).some(allocation => 
            allocation > 50
          );
        },
        violation_message: 'Single asset allocation exceeds 50% limit'
      },
      {
        id: 'min_expected_return',
        name: 'Minimum Expected Return',
        description: 'Strategy must have positive expected return',
        category: 'performance',
        severity: 'medium',
        condition: (strategy: StrategyProposal) => strategy.expected_return > 0,
        violation_message: 'Strategy has non-positive expected return'
      },
      {
        id: 'supported_chains',
        name: 'Supported Chains Only',
        description: 'Strategy must only use supported blockchain networks',
        category: 'security',
        severity: 'high',
        condition: (strategy: StrategyProposal) => {
          // For now, we'll assume all strategies use supported chains
          // In a real implementation, this would check against a list of supported chains
          return true;
        },
        violation_message: 'Strategy uses unsupported blockchain networks'
      }
    ];
    
    this.log(LogLevel.INFO, 'protocol_rules_initialized', { 
      count: this.protocolRules.length 
    });
  }

  /**
   * Check compliance with protocol rules
   */
  private checkProtocolCompliance(strategy: StrategyProposal): { 
    passed: boolean; 
    violations: string[] 
  } {
    this.log(LogLevel.DEBUG, 'checking_protocol_compliance', { 
      strategyId: strategy.id,
      ruleCount: this.protocolRules.length
    });
    
    const violations: string[] = [];
    
    for (const rule of this.protocolRules) {
      try {
        if (!rule.condition(strategy)) {
          violations.push(rule.violation_message);
          this.log(LogLevel.WARN, 'rule_violation', { 
            ruleId: rule.id,
            violation: rule.violation_message
          });
        }
      } catch (error) {
        this.log(LogLevel.ERROR, 'rule_evaluation_error', { 
          ruleId: rule.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    const passed = violations.length === 0;
    
    return { passed, violations };
  }

  /**
   * Check regulatory compliance (simplified)
   */
  private checkRegulatoryCompliance(strategy: StrategyProposal): { 
    passed: boolean; 
    issues: string[] 
  } {
    this.log(LogLevel.DEBUG, 'checking_regulatory_compliance', { 
      strategyId: strategy.id
    });
    
    const issues: string[] = [];
    
    // Simplified regulatory checks
    // In a real implementation, this would connect to regulatory compliance services
    
    // Check for jurisdiction restrictions
    // For this demo, we'll assume no jurisdiction issues
    const jurisdictionCompliant = true;
    
    // Check for accredited investor requirements
    // For this demo, we'll assume all users are compliant
    const accreditedInvestorCompliant = true;
    
    // Check for asset-specific regulations
    // For this demo, we'll assume no asset-specific issues
    const assetRegulationCompliant = true;
    
    if (!jurisdictionCompliant) {
      issues.push('Jurisdiction restrictions apply');
    }
    
    if (!accreditedInvestorCompliant) {
      issues.push('Accredited investor requirements not met');
    }
    
    if (!assetRegulationCompliant) {
      issues.push('Asset-specific regulatory restrictions apply');
    }
    
    const passed = issues.length === 0;
    
    return { passed, issues };
  }

  /**
   * Generate audit notes
   */
  private generateAuditNotes(
    complianceCheck: { passed: boolean; violations: string[] },
    regulatoryCompliance: { passed: boolean; issues: string[] }
  ): string {
    const notes = [];
    
    if (complianceCheck.passed) {
      notes.push('✅ Strategy passes all protocol compliance checks');
    } else {
      notes.push(`❌ Strategy failed ${complianceCheck.violations.length} protocol compliance checks`);
      complianceCheck.violations.forEach(violation => {
        notes.push(`   - ${violation}`);
      });
    }
    
    if (regulatoryCompliance.passed) {
      notes.push('✅ Strategy passes regulatory compliance checks');
    } else {
      notes.push(`❌ Strategy has ${regulatoryCompliance.issues.length} regulatory compliance issues`);
      regulatoryCompliance.issues.forEach(issue => {
        notes.push(`   - ${issue}`);
      });
    }
    
    return notes.join('\n');
  }

  /**
   * Add custom protocol rule
   */
  addProtocolRule(rule: ProtocolRule): void {
    this.protocolRules.push(rule);
    this.log(LogLevel.INFO, 'protocol_rule_added', { 
      ruleId: rule.id,
      ruleName: rule.name
    });
  }

  /**
   * Remove protocol rule
   */
  removeProtocolRule(ruleId: string): void {
    const initialLength = this.protocolRules.length;
    this.protocolRules = this.protocolRules.filter(r => r.id !== ruleId);
    
    if (this.protocolRules.length < initialLength) {
      this.log(LogLevel.INFO, 'protocol_rule_removed', { ruleId });
    } else {
      this.log(LogLevel.WARN, 'protocol_rule_not_found', { ruleId });
    }
  }

  /**
   * Update existing protocol rule
   */
  updateProtocolRule(ruleId: string, updates: Partial<ProtocolRule>): void {
    const ruleIndex = this.protocolRules.findIndex(r => r.id === ruleId);
    
    if (ruleIndex !== -1) {
      this.protocolRules[ruleIndex] = { ...this.protocolRules[ruleIndex], ...updates };
      this.log(LogLevel.INFO, 'protocol_rule_updated', { ruleId });
    } else {
      this.log(LogLevel.WARN, 'protocol_rule_not_found_for_update', { ruleId });
    }
  }
}