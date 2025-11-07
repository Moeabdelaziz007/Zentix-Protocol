/**
 * Google Perspective API Integration
 * Content moderation and toxicity detection
 * 
 * @module perspectiveAPI
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Google Perspective API - Toxicity detection
 * Rate limit: 1000 requests/day (free tier)
 * Get API key: https://console.cloud.google.com/apis/api/commentanalyzer.googleapis.com
 */
export class PerspectiveAPI {
  private static readonly BASE_URL = 'https://commentanalyzer.googleapis.com/v1alpha1';
  private static apiKey = process.env.PERSPECTIVE_API_KEY || '';

  /**
   * Analyze text for toxicity and other attributes
   */
  static async analyzeText(text: string, attributes: string[] = ['TOXICITY']): Promise<Record<string, number>> {
    return AgentLogger.measurePerformance(
      'PerspectiveAPI',
      'analyzeText',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockAnalysis(attributes);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/comments:analyze?key=${this.apiKey}`,
            {
              comment: {
                text: text
              },
              requestedAttributes: attributes.reduce((acc, attr) => {
                acc[attr] = {};
                return acc;
              }, {} as Record<string, any>),
              languages: ['en']
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.attributeScores) {
            throw new Error('Invalid response from Perspective API');
          }

          const results: Record<string, number> = {};
          for (const [attribute, scoreData] of Object.entries(response.data.attributeScores)) {
            results[attribute] = (scoreData as any).summaryScore.value;
          }

          return results;
        } catch (error: any) {
          console.error('Perspective API error:', error.response?.data || error.message);
          throw new Error(`Perspective API error: ${error.message}`);
        }
      },
      { text, attributes }
    );
  }

  /**
   * Check if text exceeds toxicity threshold
   */
  static async isToxic(text: string, threshold: number = 0.7): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'PerspectiveAPI',
      'isToxic',
      async () => {
        const analysis = await this.analyzeText(text, ['TOXICITY']);
        return analysis.TOXICITY > threshold;
      },
      { text, threshold }
    );
  }

  private static getMockAnalysis(attributes: string[]): Record<string, number> {
    const mockResults: Record<string, number> = {};
    for (const attr of attributes) {
      // Generate random scores for mock data
      mockResults[attr] = Math.random() * 0.3; // Keep mock scores low
    }
    return mockResults;
  }

  /**
   * Comprehensive text analysis for compliance monitoring
   * @param text The text to analyze
   * @param agentDid The DID of the agent who sent the text
   * @returns Detailed analysis with compliance report
   */
  static async analyzeForCompliance(text: string, agentDid: string): Promise<{
    isCompliant: boolean;
    toxicityScore: number;
    analysis: Record<string, number>;
    complianceReport: {
      agentDid: string;
      timestamp: number;
      violations: string[];
      severity: 'low' | 'medium' | 'high';
    }
  }> {
    return AgentLogger.measurePerformance(
      'PerspectiveAPI',
      'analyzeForCompliance',
      async () => {
        // Analyze with multiple attributes for comprehensive assessment
        const attributes = ['TOXICITY', 'SEVERE_TOXICITY', 'IDENTITY_ATTACK', 'INSULT', 'PROFANITY', 'THREAT'];
        const analysis = await this.analyzeText(text, attributes);
        
        // Calculate overall toxicity score
        const toxicityScore = analysis.TOXICITY || 0;
        
        // Determine compliance based on thresholds
        const isCompliant = toxicityScore < 0.7;
        
        // Identify specific violations
        const violations: string[] = [];
        if (analysis.SEVERE_TOXICITY && analysis.SEVERE_TOXICITY > 0.5) {
          violations.push('Severe Toxicity');
        }
        if (analysis.IDENTITY_ATTACK && analysis.IDENTITY_ATTACK > 0.5) {
          violations.push('Identity Attack');
        }
        if (analysis.INSULT && analysis.INSULT > 0.6) {
          violations.push('Insult');
        }
        if (analysis.PROFANITY && analysis.PROFANITY > 0.6) {
          violations.push('Profanity');
        }
        if (analysis.THREAT && analysis.THREAT > 0.5) {
          violations.push('Threat');
        }
        
        // Determine severity level
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (toxicityScore > 0.8 || violations.length > 2) {
          severity = 'high';
        } else if (toxicityScore > 0.5 || violations.length > 0) {
          severity = 'medium';
        }
        
        return {
          isCompliant,
          toxicityScore,
          analysis,
          complianceReport: {
            agentDid,
            timestamp: Date.now(),
            violations,
            severity
          }
        };
      },
      { text, agentDid }
    );
  }

  /**
   * Generate a compliance alert for the Central Government system
   * @param complianceResult The result from analyzeForCompliance
   * @returns A formatted alert for the governance system
   */
  static generateComplianceAlert(complianceResult: {
    isCompliant: boolean;
    toxicityScore: number;
    analysis: Record<string, number>;
    complianceReport: {
      agentDid: string;
      timestamp: number;
      violations: string[];
      severity: 'low' | 'medium' | 'high';
    }
  }): {
    type: 'compliance_alert';
    agentDid: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: number;
    details: {
      toxicityScore: number;
      violations: string[];
      analysis: Record<string, number>;
    }
  } {
    const { complianceReport, toxicityScore, analysis } = complianceResult;
    
    let message = `Compliance violation detected for agent ${complianceReport.agentDid}`;
    if (complianceReport.violations.length > 0) {
      message += `: ${complianceReport.violations.join(', ')}`;
    }
    
    return {
      type: 'compliance_alert',
      agentDid: complianceReport.agentDid,
      severity: complianceReport.severity,
      message,
      timestamp: complianceReport.timestamp,
      details: {
        toxicityScore,
        violations: complianceReport.violations,
        analysis
      }
    };
  }
}