/**
 * Quant-Finance Risk Agent
 * Part of the Quant-Finance AIZ Team
 * 
 * Specializes in ensuring quantitative finance content accuracy, managing financial risks
 * in content strategies, and validating data integrity in financial analyses.
 */

import { ZentixAgent } from '../../base/ZentixAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';

interface FinancialRegulation {
  id: string;
  name: string;
  description: string;
  applicableTo: ('all' | 'us' | 'eu' | 'asia' | 'crypto')[];
  severity: 'low' | 'medium' | 'high';
}

interface ContentRiskAssessment {
  id: string;
  contentId: string;
  contentPreview: string;
  risks: ContentRisk[];
  overallRiskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  complianceStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy: string;
  timestamp: Date;
}

interface ContentRisk {
  id: string;
  type: 'data_accuracy' | 'unsubstantiated_claim' | 'regulatory_violation' | 'market_manipulation' | 'disclaimer_missing';
  description: string;
  severity: 'low' | 'medium' | 'high';
  regulationReference?: string;
  suggestedFix: string;
}

export class QuantFinanceRiskAgent extends ZentixAgent {
  private static instance: QuantFinanceRiskAgent;
  private regulations: FinancialRegulation[];
  private riskAssessments: ContentRiskAssessment[];

  private constructor() {
    super({
      name: 'Quant-Finance Risk Agent',
      description: 'Specializes in ensuring quantitative finance content accuracy, managing financial risks in content strategies, and validating data integrity in financial analyses',
      capabilities: [
        'Financial regulation compliance',
        'Data accuracy validation',
        'Market manipulation prevention',
        'Quantitative claim verification',
        'Risk mitigation recommendations'
      ],
      version: '1.0.0'
    });

    // Initialize financial regulations
    this.regulations = [
      {
        id: 'sec-disclosure',
        name: 'SEC Disclosure Requirements',
        description: 'Securities and Exchange Commission disclosure requirements for financial content',
        applicableTo: ['us'],
        severity: 'high'
      },
      {
        id: 'crypto-regulation',
        name: 'Cryptocurrency Regulation',
        description: 'Regulations governing cryptocurrency and DeFi content',
        applicableTo: ['crypto'],
        severity: 'high'
      },
      {
        id: 'market-manipulation',
        name: 'Market Manipulation Prevention',
        description: 'Rules against content that could manipulate financial markets',
        applicableTo: ['all'],
        severity: 'high'
      },
      {
        id: 'disclaimer-requirement',
        name: 'Financial Disclaimer Requirement',
        description: 'Requirement for financial disclaimers in investment-related content',
        applicableTo: ['all'],
        severity: 'medium'
      }
    ];

    this.riskAssessments = [];
  }

  public static getInstance(): QuantFinanceRiskAgent {
    if (!QuantFinanceRiskAgent.instance) {
      QuantFinanceRiskAgent.instance = new QuantFinanceRiskAgent();
    }
    return QuantFinanceRiskAgent.instance;
  }

  /**
   * Assess content for financial compliance risks
   */
  async assessContentRisks(contentId: string, content: string, dataSources: string[]): Promise<ContentRiskAssessment> {
    return AgentLogger.measurePerformance(
      'QuantFinanceRiskAgent',
      'assessContentRisks',
      async () => {
        const risks: ContentRisk[] = [];
        
        // Check for data accuracy risks
        risks.push(...this.checkDataAccuracyRisks(content, dataSources));
        
        // Check for unsubstantiated claims
        risks.push(...this.checkUnsubstantiatedClaims(content));
        
        // Check for market manipulation potential
        risks.push(...this.checkMarketManipulation(content));
        
        // Check for regulatory violations
        risks.push(...this.checkRegulatoryViolations(content));
        
        // Check for missing disclaimers
        risks.push(...this.checkMissingDisclaimers(content));
        
        // Calculate overall risk level
        const overallRiskLevel = this.calculateOverallRiskLevel(risks);
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(risks);
        
        const assessment: ContentRiskAssessment = {
          id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contentId,
          contentPreview: content.substring(0, 100) + '...',
          risks,
          overallRiskLevel,
          recommendations,
          complianceStatus: risks.length > 0 ? 'pending' : 'approved',
          reviewedBy: this.name,
          timestamp: new Date()
        };
        
        this.riskAssessments.push(assessment);
        AgentLogger.log(LogLevel.INFO, 'QuantFinanceRiskAgent', `Completed risk assessment for content ${contentId} with ${risks.length} risks identified`);
        
        return assessment;
      }
    );
  }

  /**
   * Check for data accuracy risks
   */
  private checkDataAccuracyRisks(content: string, dataSources: string[]): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // Check for specific data accuracy patterns
    const accuracyPatterns = [
      /roi of \d+%/i,
      /guaranteed returns/i,
      /risk-free investment/i,
      /100% accuracy/i
    ];
    
    for (const pattern of accuracyPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'data_accuracy',
          description: 'Content contains potentially misleading accuracy claims',
          severity: 'high',
          suggestedFix: 'Verify all numerical claims with cited sources. Include confidence intervals where applicable.'
        });
      }
    }
    
    // Check for missing data sources
    if (dataSources.length === 0) {
      risks.push({
        id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'data_accuracy',
        description: 'No data sources cited for quantitative claims',
        severity: 'medium',
        suggestedFix: 'Include references to all data sources used in analysis.'
      });
    }
    
    return risks;
  }

  /**
   * Check for unsubstantiated claims
   */
  private checkUnsubstantiatedClaims(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    const claimPatterns = [
      /this strategy will.*return/i,
      /guaranteed.*profit/i,
      /risk-free.*return/i,
      /100%.*success/i,
      /beat the market/i
    ];
    
    for (const pattern of claimPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'unsubstantiated_claim',
          description: 'Content contains potentially unsubstantiated financial claims',
          severity: 'high',
          regulationReference: 'sec-disclosure',
          suggestedFix: 'Add appropriate disclaimers and cite backtesting results with methodology.'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for market manipulation potential
   */
  private checkMarketManipulation(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    const manipulationPatterns = [
      /buy.*now before.*price.*goes.*up/i,
      /sell.*everything.*crash.*coming/i,
      /inside.*information.*revealed/i,
      /secret.*trading.*strategy/i
    ];
    
    for (const pattern of manipulationPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'market_manipulation',
          description: 'Content may contain market manipulation language',
          severity: 'high',
          regulationReference: 'market-manipulation',
          suggestedFix: 'Remove any language that could be interpreted as market manipulation. Focus on educational content.'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for regulatory violations
   */
  private checkRegulatoryViolations(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    // This would be more sophisticated in a real implementation
    return risks;
  }

  /**
   * Check for missing disclaimers
   */
  private checkMissingDisclaimers(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // Check if content contains financial advice but no disclaimer
    const financialTerms = [
      /investment advice/i,
      /trading strategy/i,
      /portfolio allocation/i,
      /risk management/i
    ];
    
    let containsFinancialTerms = false;
    for (const term of financialTerms) {
      if (term.test(content)) {
        containsFinancialTerms = true;
        break;
      }
    }
    
    if (containsFinancialTerms && !/disclaimer/i.test(content)) {
      risks.push({
        id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'disclaimer_missing',
        description: 'Financial content missing required disclaimer',
        severity: 'medium',
        regulationReference: 'disclaimer-requirement',
        suggestedFix: 'Add standard financial disclaimer about content being for educational purposes only.'
      });
    }
    
    return risks;
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRiskLevel(risks: ContentRisk[]): 'low' | 'medium' | 'high' {
    if (risks.length === 0) return 'low';
    
    let highSeverityCount = 0;
    let mediumSeverityCount = 0;
    
    for (const risk of risks) {
      if (risk.severity === 'high') highSeverityCount++;
      if (risk.severity === 'medium') mediumSeverityCount++;
    }
    
    if (highSeverityCount > 0) return 'high';
    if (mediumSeverityCount > 2) return 'high';
    if (mediumSeverityCount > 0) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations based on identified risks
   */
  private generateRecommendations(risks: ContentRisk[]): string[] {
    const recommendations: string[] = [];
    
    if (risks.length === 0) {
      recommendations.push('Content appears compliant with financial regulations');
      return recommendations;
    }
    
    // Add general recommendations
    recommendations.push('Add clear financial disclaimer');
    recommendations.push('Verify all quantitative claims with cited sources');
    recommendations.push('Remove any language that could be interpreted as investment advice');
    
    // Add specific recommendations based on risk types
    const riskTypes = new Set(risks.map(risk => risk.type));
    
    if (riskTypes.has('data_accuracy')) {
      recommendations.push('Include confidence intervals for all numerical claims');
    }
    
    if (riskTypes.has('market_manipulation')) {
      recommendations.push('Reframe content to be purely educational');
    }
    
    if (riskTypes.has('unsubstantiated_claim')) {
      recommendations.push('Provide backtesting results or cite academic research');
    }
    
    return recommendations;
  }

  /**
   * Approve content after risk assessment
   */
  async approveContent(contentId: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QuantFinanceRiskAgent',
      'approveContent',
      async () => {
        const assessment = this.riskAssessments.find(a => a.contentId === contentId);
        if (!assessment) {
          throw new Error(`No risk assessment found for content ${contentId}`);
        }
        
        if (assessment.overallRiskLevel === 'high') {
          AgentLogger.log(LogLevel.WARN, 'QuantFinanceRiskAgent', `Cannot approve content ${contentId} due to high risk level`);
          return false;
        }
        
        assessment.complianceStatus = 'approved';
        AgentLogger.log(LogLevel.INFO, 'QuantFinanceRiskAgent', `Content ${contentId} approved`);
        return true;
      }
    );
  }

  /**
   * Reject content after risk assessment
   */
  async rejectContent(contentId: string, reason: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QuantFinanceRiskAgent',
      'rejectContent',
      async () => {
        const assessment = this.riskAssessments.find(a => a.contentId === contentId);
        if (!assessment) {
          throw new Error(`No risk assessment found for content ${contentId}`);
        }
        
        assessment.complianceStatus = 'rejected';
        assessment.recommendations.push(`Rejected: ${reason}`);
        AgentLogger.log(LogLevel.INFO, 'QuantFinanceRiskAgent', `Content ${contentId} rejected: ${reason}`);
        return true;
      }
    );
  }

  /**
   * Get risk assessment history
   */
  getRiskAssessmentHistory(limit: number = 10): ContentRiskAssessment[] {
    return this.riskAssessments.slice(-limit);
  }

  /**
   * Execute risk assessment tasks as part of a workflow
   */
  async executeTask(task: any): Promise<any> {
    try {
      switch (task.type) {
        case 'ASSESS_CONTENT_RISKS':
          return await this.assessContentRisks(task.contentId, task.content, task.dataSources || []);
        case 'APPROVE_CONTENT':
          return await this.approveContent(task.contentId);
        case 'REJECT_CONTENT':
          return await this.rejectContent(task.contentId, task.reason);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'QuantFinanceRiskAgent', `Task execution failed: ${error.message}`);
      throw error;
    }
  }
}