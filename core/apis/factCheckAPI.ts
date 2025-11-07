/**
 * Google Fact Check Tools API Integration
 * Fact checking and verification
 * 
 * @module factCheckAPI
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Google Fact Check Tools API - Fact verification
 * Rate limit: 1000 requests/day (free tier)
 * Get API key: https://console.cloud.google.com/apis/api/factchecktools.googleapis.com
 */
export class FactCheckAPI {
  private static readonly BASE_URL = 'https://factchecktools.googleapis.com/v1alpha1';
  private static apiKey = process.env.FACTCHECK_API_KEY || '';

  /**
   * Search for fact checks
   */
  static async searchFactChecks(query: string, languageCode: string = 'en-US', maxResults: number = 10): Promise<Array<{
    text: string;
    claimReview: Array<{
      publisher: {
        name: string;
        site: string;
      };
      url: string;
      title: string;
      reviewDate: string;
      textualRating: string;
      languageCode: string;
    }>;
  }>> {
    return AgentLogger.measurePerformance(
      'FactCheckAPI',
      'searchFactChecks',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockFactChecks(query, maxResults);
        }

        try {
          const params = new URLSearchParams({
            key: this.apiKey,
            query: query,
            languageCode: languageCode,
            maxResults: maxResults.toString()
          });

          const response = await axios.get(`${this.BASE_URL}/claims:search?${params}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.data || !response.data.claims) {
            return [];
          }

          return response.data.claims;
        } catch (error: any) {
          console.error('Fact Check API error:', error.response?.data || error.message);
          throw new Error(`Fact Check API error: ${error.message}`);
        }
      },
      { query, languageCode, maxResults }
    );
  }

  /**
   * Get fact check by claim
   */
  static async getFactCheckByClaim(claim: string): Promise<Array<{
    publisher: {
      name: string;
      site: string;
    };
    url: string;
    title: string;
    reviewDate: string;
    textualRating: string;
    languageCode: string;
  }> | null> {
    return AgentLogger.measurePerformance(
      'FactCheckAPI',
      'getFactCheckByClaim',
      async () => {
        const results = await this.searchFactChecks(claim, 'en-US', 1);
        if (results.length > 0 && results[0].claimReview.length > 0) {
          return results[0].claimReview;
        }
        return null;
      },
      { claim }
    );
  }

  private static getMockFactChecks(query: string, maxResults: number): Array<any> {
    // Generate mock fact check results
    const mockResults = [];
    for (let i = 0; i < Math.min(maxResults, 3); i++) {
      mockResults.push({
        text: query,
        claimReview: [
          {
            publisher: {
              name: 'Mock Fact Checker',
              site: 'mock-fact-checker.com'
            },
            url: 'https://mock-fact-checker.com/article-' + i,
            title: `Fact Check Result for "${query}" #${i+1}`,
            reviewDate: new Date().toISOString(),
            textualRating: i % 2 === 0 ? 'True' : 'False',
            languageCode: 'en-US'
          }
        ]
      });
    }
    return mockResults;
  }

  /**
   * Extract claims from text for fact checking
   * @param text The text to analyze for claims
   * @returns Array of potential claims found in the text
   */
  static extractClaims(text: string): string[] {
    // Simple regex-based claim extraction
    // In a real implementation, this would use NLP techniques
    const claimPatterns = [
      /(?:claims?|states?|says?) that (.+?)(?:\.|\n|$)/gi,
      /"([^"]+)" is (?:true|false|misleading|accurate)/gi,
      /(?:according to|reports?|findings? show) (.+?)(?:\.|\n|$)/gi
    ];
    
    const claims: string[] = [];
    
    for (const pattern of claimPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          claims.push(match[1].trim());
        }
      }
    }
    
    // Remove duplicates and filter out short claims
    return [...new Set(claims)].filter(claim => claim.length > 10);
  }

  /**
   * Verify multiple claims at once
   * @param claims Array of claims to verify
   * @returns Verification results for each claim
   */
  static async verifyClaims(claims: string[]): Promise<Array<{
    claim: string;
    verification: Array<{
      publisher: {
        name: string;
        site: string;
      };
      url: string;
      title: string;
      reviewDate: string;
      textualRating: string;
      languageCode: string;
    }> | null;
    confidence: 'high' | 'medium' | 'low';
  }>> {
    return AgentLogger.measurePerformance(
      'FactCheckAPI',
      'verifyClaims',
      async () => {
        const results = [];
        
        for (const claim of claims) {
          try {
            const verification = await this.getFactCheckByClaim(claim);
            results.push({
              claim,
              verification,
              confidence: verification && verification.length > 0 ? ('high' as 'high' | 'medium' | 'low') : ('low' as 'high' | 'medium' | 'low')
            });
          } catch (error) {
            results.push({
              claim,
              verification: null,
              confidence: 'low' as 'high' | 'medium' | 'low'
            });
          }
        }
        
        return results;
      },
      { claims }
    );
  }

  /**
   * Generate a fact-check badge for UI display
   * @param verificationResult The result from getFactCheckByClaim or verifyClaims
   * @returns Badge information for UI display
   */
  static generateFactCheckBadge(verificationResult: Array<{
    publisher: {
      name: string;
      site: string;
    };
    url: string;
    title: string;
    reviewDate: string;
    textualRating: string;
    languageCode: string;
  }> | null): {
    type: 'fact_check_badge';
    rating: 'true' | 'false' | 'mixed' | 'unverified';
    confidence: 'high' | 'medium' | 'low';
    publishers: string[];
    message: string;
  } {
    if (!verificationResult || verificationResult.length === 0) {
      return {
        type: 'fact_check_badge',
        rating: 'unverified',
        confidence: 'low',
        publishers: [],
        message: 'No fact checks found for this claim'
      };
    }
    
    // Determine overall rating based on publisher ratings
    const ratings = verificationResult.map(result => result.textualRating.toLowerCase());
    const trueCount = ratings.filter(r => r.includes('true') || r.includes('correct')).length;
    const falseCount = ratings.filter(r => r.includes('false') || r.includes('incorrect') || r.includes('fake')).length;
    
    let rating: 'true' | 'false' | 'mixed' | 'unverified' = 'unverified';
    if (trueCount > 0 && falseCount === 0) {
      rating = 'true';
    } else if (falseCount > 0 && trueCount === 0) {
      rating = 'false';
    } else if (trueCount > 0 && falseCount > 0) {
      rating = 'mixed';
    }
    
    // Determine confidence based on number of sources
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (verificationResult.length >= 3) {
      confidence = 'high';
    } else if (verificationResult.length >= 2) {
      confidence = 'medium';
    }
    
    const publishers = verificationResult.map(result => result.publisher.name);
    
    let message = '';
    switch (rating) {
      case 'true':
        message = 'Verified as true by multiple sources';
        break;
      case 'false':
        message = 'Verified as false by multiple sources';
        break;
      case 'mixed':
        message = 'Mixed verification results from different sources';
        break;
      default:
        message = 'No clear verification consensus';
    }
    
    return {
      type: 'fact_check_badge',
      rating,
      confidence,
      publishers,
      message
    };
  }
}