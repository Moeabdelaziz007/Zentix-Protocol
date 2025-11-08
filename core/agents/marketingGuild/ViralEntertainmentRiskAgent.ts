/**
 * Viral-Entertainment Risk Agent
 * Part of the Viral-Entertainment AIZ Team
 * 
 * Specializes in ensuring viral content doesn't pose cultural risks,
 * managing "cancel culture" exposure, and validating trend relevance.
 */

import { ZentixAgent } from '../../base/ZentixAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';

interface CulturalRiskDatabase {
  [key: string]: {
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
    alternatives: string[];
  };
}

interface ContentRiskAssessment {
  id: string;
  contentId: string;
  contentPreview: string;
  risks: ContentRisk[];
  overallRiskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  culturalStatus: 'safe' | 'caution' | 'risky' | 'dangerous';
  reviewedBy: string;
  timestamp: Date;
}

interface ContentRisk {
  id: string;
  type: 'cultural_sensitivity' | 'trend_relevance' | 'cancel_culture' | 'brand_alignment' | 'offensive_content';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestedFix: string;
}

export class ViralEntertainmentRiskAgent extends ZentixAgent {
  private static instance: ViralEntertainmentRiskAgent;
  private riskDatabase: CulturalRiskDatabase;
  private riskAssessments: ContentRiskAssessment[];

  private constructor() {
    super({
      name: 'Viral-Entertainment Risk Agent',
      description: 'Specializes in ensuring viral content doesn\'t pose cultural risks, managing "cancel culture" exposure, and validating trend relevance',
      capabilities: [
        'Cultural sensitivity assessment',
        'Trend relevance validation',
        'Cancel culture risk management',
        'Meme appropriateness checking',
        'Brand alignment verification'
      ],
      version: '1.0.0'
    });

    // Initialize cultural risk database
    this.riskDatabase = {
      'offensive_language': {
        riskLevel: 'high',
        description: 'Content contains potentially offensive language or slurs',
        alternatives: ['Use more inclusive language', 'Remove offensive terms', 'Provide context if historically relevant']
      },
      'cultural_appropriation': {
        riskLevel: 'high',
        description: 'Content may appropriate cultural elements without proper context or respect',
        alternatives: ['Provide proper cultural context', 'Credit original sources', 'Consult cultural experts']
      },
      'political_content': {
        riskLevel: 'medium',
        description: 'Content contains political statements that may polarize audience',
        alternatives: ['Focus on non-political aspects', 'Present multiple viewpoints', 'Add neutral framing']
      },
      'outdated_trend': {
        riskLevel: 'medium',
        description: 'Content references trends that may be outdated or overused',
        alternatives: ['Update with current trends', 'Add fresh perspective', 'Combine with newer trends']
      },
      'sensitive_topics': {
        riskLevel: 'medium',
        description: 'Content touches on sensitive topics like mental health, trauma, or tragedy',
        alternatives: ['Add appropriate content warnings', 'Provide resources for support', 'Focus on positive aspects']
      }
    };

    this.riskAssessments = [];
  }

  public static getInstance(): ViralEntertainmentRiskAgent {
    if (!ViralEntertainmentRiskAgent.instance) {
      ViralEntertainmentRiskAgent.instance = new ViralEntertainmentRiskAgent();
    }
    return ViralEntertainmentRiskAgent.instance;
  }

  /**
   * Assess content for cultural and viral risks
   */
  async assessContentRisks(contentId: string, content: string, format: string): Promise<ContentRiskAssessment> {
    return AgentLogger.measurePerformance(
      'ViralEntertainmentRiskAgent',
      'assessContentRisks',
      async () => {
        const risks: ContentRisk[] = [];
        
        // Check for cultural sensitivity risks
        risks.push(...this.checkCulturalSensitivity(content));
        
        // Check for trend relevance
        risks.push(...this.checkTrendRelevance(content, format));
        
        // Check for cancel culture exposure
        risks.push(...this.checkCancelCultureExposure(content));
        
        // Check for brand alignment
        risks.push(...this.checkBrandAlignment(content));
        
        // Check for offensive content
        risks.push(...this.checkOffensiveContent(content));
        
        // Calculate overall risk level
        const overallRiskLevel = this.calculateOverallRiskLevel(risks);
        
        // Determine cultural status
        const culturalStatus = this.determineCulturalStatus(risks);
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(risks);
        
        const assessment: ContentRiskAssessment = {
          id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          contentId,
          contentPreview: content.substring(0, 100) + '...',
          risks,
          overallRiskLevel,
          recommendations,
          culturalStatus,
          reviewedBy: this.name,
          timestamp: new Date()
        };
        
        this.riskAssessments.push(assessment);
        AgentLogger.log(LogLevel.INFO, 'ViralEntertainmentRiskAgent', `Completed risk assessment for content ${contentId} with ${risks.length} risks identified`);
        
        return assessment;
      }
    );
  }

  /**
   * Check for cultural sensitivity risks
   */
  private checkCulturalSensitivity(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // This would connect to a more comprehensive database in a real implementation
    const sensitiveTerms = [
      /offensive.*term/i,
      /culturally.*inappropriate/i,
      /misrepresent.*culture/i
    ];
    
    for (const pattern of sensitiveTerms) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'cultural_sensitivity',
          description: 'Content may contain culturally insensitive elements',
          severity: 'medium',
          suggestedFix: 'Review content for cultural sensitivity and provide proper context where needed'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for trend relevance
   */
  private checkTrendRelevance(content: string, format: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // Check if content references potentially outdated trends
    const outdatedTrends = [
      /that.*trend.*is.*so.*2020/i,
      /old.*meme.*format/i,
      /overused.*challenge/i
    ];
    
    for (const pattern of outdatedTrends) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'trend_relevance',
          description: 'Content may reference outdated or overused trends',
          severity: 'medium',
          suggestedFix: 'Update content with current trends or add a fresh twist to classic formats'
        });
      }
    }
    
    // Check if format matches current platform preferences
    const formatMismatch = [
      /long.*video.*tiktok/i,
      /text.*heavy.*reel/i
    ];
    
    for (const pattern of formatMismatch) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'trend_relevance',
          description: 'Content format may not align with platform trends',
          severity: 'low',
          suggestedFix: 'Adjust format to match current platform best practices'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for cancel culture exposure
   */
  private checkCancelCultureExposure(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // Check for potentially controversial content
    const controversialPatterns = [
      /controversial.*opinion/i,
      /polarizing.*view/i,
      /hot.*take.*on/i
    ];
    
    for (const pattern of controversialPatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'cancel_culture',
          description: 'Content may expose brand to cancel culture risks',
          severity: 'high',
          suggestedFix: 'Reframe content to be more neutral or add context to prevent misinterpretation'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for brand alignment
   */
  private checkBrandAlignment(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // Check if content aligns with brand values
    const brandMismatch = [
      /conflicts.*with.*brand/i,
      /inconsistent.*messaging/i,
      /off.*brand.*content/i
    ];
    
    for (const pattern of brandMismatch) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'brand_alignment',
          description: 'Content may not align with brand values or messaging',
          severity: 'medium',
          suggestedFix: 'Adjust content to better reflect brand values and consistent messaging'
        });
      }
    }
    
    return risks;
  }

  /**
   * Check for offensive content
   */
  private checkOffensiveContent(content: string): ContentRisk[] {
    const risks: ContentRisk[] = [];
    
    // Check for potentially offensive content
    const offensivePatterns = [
      /offensive.*joke/i,
      /inappropriate.*humor/i,
      /rude.*comment/i
    ];
    
    for (const pattern of offensivePatterns) {
      if (pattern.test(content)) {
        risks.push({
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'offensive_content',
          description: 'Content may contain offensive or inappropriate material',
          severity: 'high',
          suggestedFix: 'Remove or reframe offensive content to be more inclusive and appropriate'
        });
      }
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
   * Determine cultural status based on risks
   */
  private determineCulturalStatus(risks: ContentRisk[]): 'safe' | 'caution' | 'risky' | 'dangerous' {
    const overallRisk = this.calculateOverallRiskLevel(risks);
    
    // Count high severity risks
    const highRisks = risks.filter(risk => risk.severity === 'high').length;
    
    if (highRisks > 1) return 'dangerous';
    if (overallRisk === 'high') return 'risky';
    if (overallRisk === 'medium') return 'caution';
    return 'safe';
  }

  /**
   * Generate recommendations based on identified risks
   */
  private generateRecommendations(risks: ContentRisk[]): string[] {
    const recommendations: string[] = [];
    
    if (risks.length === 0) {
      recommendations.push('Content appears culturally safe and trend-relevant');
      return recommendations;
    }
    
    // Add general recommendations
    recommendations.push('Review content with diverse perspectives before publishing');
    recommendations.push('Add content warnings where appropriate');
    recommendations.push('Ensure alignment with current brand values');
    
    // Add specific recommendations based on risk types
    const riskTypes = new Set(risks.map(risk => risk.type));
    
    if (riskTypes.has('cultural_sensitivity')) {
      recommendations.push('Consult with cultural experts or sensitivity readers');
    }
    
    if (riskTypes.has('trend_relevance')) {
      recommendations.push('Verify trend relevance with current social media monitoring');
    }
    
    if (riskTypes.has('cancel_culture')) {
      recommendations.push('Reframe controversial content to be more neutral');
    }
    
    if (riskTypes.has('offensive_content')) {
      recommendations.push('Remove or reframe potentially offensive material');
    }
    
    return recommendations;
  }

  /**
   * Approve content after risk assessment
   */
  async approveContent(contentId: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'ViralEntertainmentRiskAgent',
      'approveContent',
      async () => {
        const assessment = this.riskAssessments.find(a => a.contentId === contentId);
        if (!assessment) {
          throw new Error(`No risk assessment found for content ${contentId}`);
        }
        
        if (assessment.culturalStatus === 'dangerous' || assessment.culturalStatus === 'risky') {
          AgentLogger.log(LogLevel.WARN, 'ViralEntertainmentRiskAgent', `Cannot approve content ${contentId} due to high cultural risk (${assessment.culturalStatus})`);
          return false;
        }
        
        AgentLogger.log(LogLevel.INFO, 'ViralEntertainmentRiskAgent', `Content ${contentId} approved with status: ${assessment.culturalStatus}`);
        return true;
      }
    );
  }

  /**
   * Reject content after risk assessment
   */
  async rejectContent(contentId: string, reason: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'ViralEntertainmentRiskAgent',
      'rejectContent',
      async () => {
        const assessment = this.riskAssessments.find(a => a.contentId === contentId);
        if (!assessment) {
          throw new Error(`No risk assessment found for content ${contentId}`);
        }
        
        assessment.culturalStatus = 'dangerous';
        assessment.recommendations.push(`Rejected: ${reason}`);
        AgentLogger.log(LogLevel.INFO, 'ViralEntertainmentRiskAgent', `Content ${contentId} rejected: ${reason}`);
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
          return await this.assessContentRisks(task.contentId, task.content, task.format);
        case 'APPROVE_CONTENT':
          return await this.approveContent(task.contentId);
        case 'REJECT_CONTENT':
          return await this.rejectContent(task.contentId, task.reason);
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'ViralEntertainmentRiskAgent', `Task execution failed: ${error.message}`);
      throw error;
    }
  }
}