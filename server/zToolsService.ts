/**
 * zTools Service
 * Specialized tools using z.ai Model API
 * 
 * @module zToolsService
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../core/utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * zTools Service
 * Provides access to specialized z.ai models for various domains
 */
export class ZToolsService {
  private static readonly ZAI_MODEL_API_URL = 'https://api.z.ai/v1/models';
  private static zaiApiKey = process.env.ZAI_API_KEY || '';

  /**
   * Analyze financial documents
   * @param document Financial document content
   * @param analysisType Type of financial analysis
   * @returns Financial analysis results
   */
  static async analyzeFinancialDocument(
    document: string,
    analysisType: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'ratio_analysis' = 'ratio_analysis'
  ): Promise<{
    metrics: Array<{
      name: string;
      value: number;
      benchmark?: number;
      interpretation: string;
    }>;
    risks: string[];
    opportunities: string[];
    summary: string;
  }> {
    return AgentLogger.measurePerformance(
      'ZToolsService',
      'analyzeFinancialDocument',
      async () => {
        if (!this.zaiApiKey) {
          throw new Error('ZAI_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.ZAI_MODEL_API_URL}/financial-analysis`,
            {
              document,
              analysis_type: analysisType
            },
            {
              headers: {
                'Authorization': `Bearer ${this.zaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai Model API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai Financial Analysis error:', error.response?.data || error.message);
          throw new Error(`z.ai Financial Analysis error: ${error.message}`);
        }
      },
      { analysisType }
    );
  }

  /**
   * Review legal contracts
   * @param contract Contract content
   * @param reviewType Type of legal review
   * @returns Legal review results
   */
  static async reviewLegalContract(
    contract: string,
    reviewType: 'compliance' | 'risk_assessment' | 'clarity' | 'completeness' = 'risk_assessment'
  ): Promise<{
    issues: Array<{
      clause: string;
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
    summary: string;
    compliance_score: number;
  }> {
    return AgentLogger.measurePerformance(
      'ZToolsService',
      'reviewLegalContract',
      async () => {
        if (!this.zaiApiKey) {
          throw new Error('ZAI_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.ZAI_MODEL_API_URL}/legal-review`,
            {
              contract,
              review_type: reviewType
            },
            {
              headers: {
                'Authorization': `Bearer ${this.zaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai Model API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai Legal Review error:', error.response?.data || error.message);
          throw new Error(`z.ai Legal Review error: ${error.message}`);
        }
      },
      { reviewType }
    );
  }

  /**
   * Analyze medical documents
   * @param document Medical document content
   * @param analysisType Type of medical analysis
   * @returns Medical analysis results
   */
  static async analyzeMedicalDocument(
    document: string,
    analysisType: 'diagnosis' | 'treatment' | 'risk_assessment' | 'summary' = 'summary'
  ): Promise<{
    findings: Array<{
      condition: string;
      confidence: number;
      evidence: string;
    }>;
    recommendations: string[];
    summary: string;
  }> {
    return AgentLogger.measurePerformance(
      'ZToolsService',
      'analyzeMedicalDocument',
      async () => {
        if (!this.zaiApiKey) {
          throw new Error('ZAI_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.ZAI_MODEL_API_URL}/medical-analysis`,
            {
              document,
              analysis_type: analysisType
            },
            {
              headers: {
                'Authorization': `Bearer ${this.zaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai Model API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai Medical Analysis error:', error.response?.data || error.message);
          throw new Error(`z.ai Medical Analysis error: ${error.message}`);
        }
      },
      { analysisType }
    );
  }

  /**
   * Process scientific papers
   * @param paper Scientific paper content
   * @param analysisType Type of scientific analysis
   * @returns Scientific analysis results
   */
  static async analyzeScientificPaper(
    paper: string,
    analysisType: 'summary' | 'methodology' | 'findings' | 'implications' = 'summary'
  ): Promise<{
    key_points: string[];
    methodology: string;
    findings: string;
    implications: string;
    confidence: number;
  }> {
    return AgentLogger.measurePerformance(
      'ZToolsService',
      'analyzeScientificPaper',
      async () => {
        if (!this.zaiApiKey) {
          throw new Error('ZAI_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.ZAI_MODEL_API_URL}/scientific-analysis`,
            {
              paper,
              analysis_type: analysisType
            },
            {
              headers: {
                'Authorization': `Bearer ${this.zaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai Model API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai Scientific Analysis error:', error.response?.data || error.message);
          throw new Error(`z.ai Scientific Analysis error: ${error.message}`);
        }
      },
      { analysisType }
    );
  }

  /**
   * Analyze market research data
   * @param data Market research data
   * @param analysisType Type of market analysis
   * @returns Market analysis results
   */
  static async analyzeMarketResearch(
    data: string,
    analysisType: 'trends' | 'segmentation' | 'competition' | 'forecast' = 'trends'
  ): Promise<{
    insights: Array<{
      category: string;
      finding: string;
      confidence: number;
    }>;
    recommendations: string[];
    summary: string;
  }> {
    return AgentLogger.measurePerformance(
      'ZToolsService',
      'analyzeMarketResearch',
      async () => {
        if (!this.zaiApiKey) {
          throw new Error('ZAI_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.ZAI_MODEL_API_URL}/market-analysis`,
            {
              data,
              analysis_type: analysisType
            },
            {
              headers: {
                'Authorization': `Bearer ${this.zaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai Model API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai Market Analysis error:', error.response?.data || error.message);
          throw new Error(`z.ai Market Analysis error: ${error.message}`);
        }
      },
      { analysisType }
    );
  }

  /**
   * Get available specialized models
   * @returns List of available models
   */
  static async getAvailableModels(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    domain: string;
    capabilities: string[];
  }>> {
    return AgentLogger.measurePerformance(
      'ZToolsService',
      'getAvailableModels',
      async () => {
        if (!this.zaiApiKey) {
          throw new Error('ZAI_API_KEY is not configured');
        }

        try {
          const response = await axios.get(
            `${this.ZAI_MODEL_API_URL}`,
            {
              headers: {
                'Authorization': `Bearer ${this.zaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai Model API');
          }

          return response.data.models || [];
        } catch (error: any) {
          console.error('z.ai Models List error:', error.response?.data || error.message);
          throw new Error(`z.ai Models List error: ${error.message}`);
        }
      }
    );
  }
}