/**
 * Health-Aware Risk Agent
 * Part of the Health-Aware AIZ Team
 * 
 * Specializes in ensuring healthcare content compliance with medical regulations
 * and identifying potential risks in content strategies.
 */

import { ZentixAgent } from '../../base/ZentixAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';

interface HealthcareRegulation {
  id: string;
  name: string;
  description: string;
  applicableTo: ('all' | 'us' | 'eu' | 'specific_conditions')[];
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
  type: 'medical_advice' | 'unsubstantiated_claim' | 'privacy_violation' | 'misleading_information' | 'regulatory_violation';
  description: string;
  severity: 'low' | 'medium' | 'high';
  regulationReference?: string;
  suggestedFix: string;
}

export class HealthAwareRiskAgent extends ZentixAgent {
  private static instance: HealthAwareRiskAgent;
  private regulations: HealthcareRegulation[];
  private riskAssessments: ContentRiskAssessment[];

  private constructor() {
    super({
      name: 'Health-Aware Risk Agent',
      description: 'Specializes in ensuring healthcare content compliance with medical regulations and identifying potential risks in content strategies',
      capabilities: [
        'Medical regulation compliance',
        'Content risk assessment',
        'Privacy protection validation',
        'Regulatory guideline enforcement',
        'Risk mitigation recommendations'
      ],
      version: '1.0.0'
    });

    // Initialize healthcare regulations
    this.regulations = [
      {
        id: 'hipaa',
        name: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act - US privacy rule',
        applicableTo: ['us'],
        severity: 'high'
      },
      {
        id: 'fda-claims',
        name: 'FDA Medical Claims',
        description: 'FDA regulations on medical claims and device promotion',
        applicableTo: ['us'],
        severity: 'high'
      },
      {
        id: 'gdpr',
        name: 'GDPR',
        description: 'General Data Protection Regulation - EU privacy rule',
        applicableTo: ['eu'],
        severity: 'high'
      },
      {
        id: 'medical-disclaimer',
        name: 'Medical Disclaimer Requirement',
        description: 'Requirement for medical disclaimers in health-related content',
        applicableTo: ['all'],
        severity: 'medium'
      }
    ];

    this.riskAssessments = [];
  }

  public static getInstance(): HealthAwareRiskAgent {
    if (!HealthAwareRiskAgent.instance) {
      HealthAwareRiskAgent.instance = new HealthAwareRiskAgent();
    }
    return HealthAwareRiskAgent.instance;
  }

  /**
   * Assess content for healthcare compliance risks
   */
  async assessContentRisks(contentId: string, content: string): Promise<ContentRiskAssessment> {
    return AgentLogger.measurePerformance(
      'HealthAwareRiskAgent',
      'assessContentRisks',
      async () => {
        const risks: ContentRisk[] = [];
        
        // Check for medical advice risks
        risks.push(...this.checkMedicalAdviceRisks(content));
        
        // Check for unsubstantiated claims
        risks.push(...this.checkUnsubstantiatedClaims(content));
        
        // Check for privacy violations
        risks.push(...this.checkPrivacyViolations(content));
        
        // Check for misleading information
        risks.push(...this.checkMisleadingInformation(content));
        
        // Check for regulatory violations
        risks.push(...this.checkRegulatoryViolations(content));
        
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
        AgentLogger.log(LogLevel.INFO, 'HealthAwareRiskAgent', `Completed risk assessment for content ${contentId} with ${risks.length} risks identified`);
        
        return assessment;
      }
    );
  }

  /**
   * Check for medical advice risks
   */
  private checkMedicalAdviceRisks(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    const medicalAdvicePatterns = [
      /you should.*medical/i,
      /take this medication/i,
      /this treatment cures/i,
      /doctor recommends/i,
      /medical advice/i
    ];
    
    for (const pattern of medicalAdvicePatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'medical_advice',
          description: 'Content appears to provide specific medical advice',
          severity: 'high',
          regulationReference: 'medical-disclaimer',
          suggestedFix: 'Add clear disclaimer that content is for informational purposes only and not medical advice. Recommend consulting healthcare professionals.'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for unsubstantiated claims
   */
  private checkUnsubstantiatedClaims(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    const claimPatterns = [
      /scientifically proven/i,
      /clinically tested/i,
      /100% effective/i,
      /cures.*disease/i,
      /eliminates.*risk/i
    ];
    
    for (const pattern of claimPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'unsubstantiated_claim',
          description: 'Content contains potentially unsubstantiated medical claims',
          severity: 'high',
          regulationReference: 'fda-claims',
          suggestedFix: 'Ensure all medical claims are substantiated with references to peer-reviewed studies. Add appropriate disclaimers for preliminary research.'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for privacy violations
   */
  private checkPrivacyViolations(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    const privacyPatterns = [
      /patient.*name/i,
      /medical record/i,
      /personal health/i,
      /confidential.*health/i
    ];
    
    for (const pattern of privacyPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'privacy_violation',
          description: 'Content may reference protected health information',
          severity: 'high',
          regulationReference: 'hipaa',
          suggestedFix: 'Remove any references to specific patients or personal health information. Use anonymized case studies only.'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for misleading information
   */
  private checkMisleadingInformation(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    const misleadingPatterns = [
      /miracle cure/i,
      /detox.*cleanse/i,
      /all natural.*cure/i,
      /no side effects/i
    ];
    
    for (const pattern of misleadingPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'misleading_information',
          description: 'Content may contain misleading health information',
          severity: 'medium',
          suggestedFix: 'Revise language to be more accurate and evidence-based. Include appropriate disclaimers.'
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
      recommendations.push('Content appears compliant with healthcare regulations');
      return recommendations;
    }
    
    // Add general recommendations
    recommendations.push('Add clear medical disclaimer');
    recommendations.push('Review content with qualified healthcare professional');
    recommendations.push('Ensure all claims are substantiated with credible sources');
    
    // Add specific recommendations based on risk types
    const riskTypes = new Set(risks.map(risk => risk.type));
    
    if (riskTypes.has('medical_advice')) {
      recommendations.push('Remove any specific medical advice and refer readers to healthcare professionals');
    }
    
    if (riskTypes.has('privacy_violation')) {
      recommendations.push('Remove any references to personal health information');
    }
    
    if (riskTypes.has('unsubstantiated_claim')) {
      recommendations.push('Provide evidence for all medical claims or revise language');
    }
    
    return recommendations;
  }

  /**
   * Approve content after risk assessment
   */
  async approveContent(contentId: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'HealthAwareRiskAgent',
      'approveContent',
      async () => {
        const assessment = this.riskAssessments.find(a => a.contentId === contentId);
        if (!assessment) {
          throw new Error(`No risk assessment found for content ${contentId}`);
        }
        
        if (assessment.overallRiskLevel === 'high') {
          AgentLogger.log(LogLevel.WARN, 'HealthAwareRiskAgent', `Cannot approve content ${contentId} due to high risk level`);
          return false;
        }
        
        assessment.complianceStatus = 'approved';
        AgentLogger.log(LogLevel.INFO, 'HealthAwareRiskAgent', `Content ${contentId} approved`);
        return true;
      }
    );
  }

  /**
   * Reject content after risk assessment
   */
  async rejectContent(contentId: string, reason: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'HealthAwareRiskAgent',
      'rejectContent',
      async () => {
        const assessment = this.riskAssessments.find(a => a.contentId === contentId);
        if (!assessment) {
          throw new Error(`No risk assessment found for content ${contentId}`);
        }
        
        assessment.complianceStatus = 'rejected';
        assessment.recommendations.push(`Rejected: ${reason}`);
        AgentLogger.log(LogLevel.INFO, 'HealthAwareRiskAgent', `Content ${contentId} rejected: ${reason}`);
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
          return await this.assessContentRisks(task.contentId, task.content);
        case 'APPROVE_CONTENT':
          return await this.approveContent(task.contentId);
        case 'REJECT_CONTENT':
          return await this.rejectContent(task.contentId, task.reason);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'HealthAwareRiskAgent', `Task execution failed: ${error.message}`);
      throw error;
    }
  }
}