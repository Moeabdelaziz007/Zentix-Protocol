/**
 * Affiliate Deal Evaluation Skill
 * Skill for evaluating the profitability of affiliate deals
 * 
 * @module affiliateDealEvaluationSkill
 * @version 1.0.0
 */

import { AgentLogger, LogLevel } from '../../utils/agentLogger';

/**
 * Affiliate Deal Evaluation Skill
 * Evaluates the profitability and quality of affiliate marketing opportunities
 */
export class AffiliateDealEvaluationSkill {
  /**
   * Evaluate an affiliate deal for profitability and quality
   * 
   * @param dealData - Data about the affiliate deal
   * @returns Evaluation result with score and recommendations
   */
  static async evaluateDeal(dealData: any): Promise<any> {
    AgentLogger.log(LogLevel.INFO, 'AffiliateDealEvaluationSkill', 'Evaluating affiliate deal', { 
      productName: dealData.productName,
      commissionRate: dealData.commissionRate 
    });
    
    try {
      // Extract key metrics for evaluation
      const { 
        productName, 
        commissionRate, 
        productPrice, 
        retailer, 
        category,
        conversionRate = 0.02, // Default 2% conversion rate
        competitionLevel = 'medium' // Default competition level
      } = dealData;
      
      // Calculate expected value per click
      const expectedValuePerClick = productPrice * commissionRate * conversionRate;
      
      // Evaluate based on multiple factors
      const factors = {
        commissionQuality: this.evaluateCommissionRate(commissionRate, category),
        retailerReputation: this.evaluateRetailerReputation(retailer),
        productDemand: this.evaluateProductDemand(category, competitionLevel),
        conversionPotential: conversionRate
      };
      
      // Calculate overall score (weighted average)
      const score = (
        factors.commissionQuality * 0.3 +
        factors.retailerReputation * 0.25 +
        factors.productDemand * 0.25 +
        factors.conversionPotential * 0.2
      ) * 100;
      
      // Generate recommendation
      const recommendation = this.generateRecommendation(score, factors);
      
      const result = {
        productName,
        score: Math.round(score),
        expectedValuePerClick: expectedValuePerClick.toFixed(2),
        factors,
        recommendation
      };
      
      AgentLogger.log(LogLevel.SUCCESS, 'AffiliateDealEvaluationSkill', 'Deal evaluation completed', { 
        productName, 
        score: result.score 
      });
      
      return result;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'AffiliateDealEvaluationSkill', 'Failed to evaluate deal', { 
        productName: dealData.productName 
      }, error as Error);
      throw error;
    }
  }
  
  /**
   * Evaluate commission rate quality
   * 
   * @param rate - Commission rate as decimal (0.05 = 5%)
   * @param category - Product category
   * @returns Quality score (0-1)
   */
  private static evaluateCommissionRate(rate: number, category: string): number {
    // Category-specific benchmarks
    const benchmarks: Record<string, number> = {
      'beauty': 0.08,
      'fashion': 0.06,
      'electronics': 0.04,
      'home': 0.05,
      'default': 0.05
    };
    
    const benchmark = benchmarks[category] || benchmarks.default;
    
    // Score based on how the rate compares to benchmark
    if (rate >= benchmark * 1.5) return 1.0;  // Excellent
    if (rate >= benchmark * 1.2) return 0.8;  // Good
    if (rate >= benchmark) return 0.6;        // Average
    if (rate >= benchmark * 0.7) return 0.4;  // Below average
    return 0.2;                               // Poor
  }
  
  /**
   * Evaluate retailer reputation
   * 
   * @param retailer - Retailer name
   * @returns Reputation score (0-1)
   */
  private static evaluateRetailerReputation(retailer: string): number {
    // Well-known, trusted retailers
    const trustedRetailers = [
      'amazon', 'sephora', 'nordstrom', 'best buy', 'walmart',
      'target', 'mac', 'sephora', 'ulta', 'hm', 'zara'
    ];
    
    const normalizedRetailer = retailer.toLowerCase();
    return trustedRetailers.some(tr => normalizedRetailer.includes(tr)) ? 0.9 : 0.5;
  }
  
  /**
   * Evaluate product demand based on category and competition
   * 
   * @param category - Product category
   * @param competitionLevel - Competition level ('low', 'medium', 'high')
   * @returns Demand score (0-1)
   */
  private static evaluateProductDemand(category: string, competitionLevel: string): number {
    // High demand categories
    const highDemandCategories = [
      'beauty', 'skincare', 'makeup', 'fashion', 'electronics',
      'fitness', 'wellness', 'home decor'
    ];
    
    const isHighDemand = highDemandCategories.some(cat => 
      category.toLowerCase().includes(cat)
    );
    
    // Competition impact
    let competitionFactor = 0.5;
    if (competitionLevel === 'low') competitionFactor = 0.9;
    if (competitionLevel === 'high') competitionFactor = 0.2;
    
    return isHighDemand ? 0.8 * competitionFactor : 0.4 * competitionFactor;
  }
  
  /**
   * Generate recommendation based on score and factors
   * 
   * @param score - Overall score
   * @param factors - Evaluation factors
   * @returns Recommendation object
   */
  private static generateRecommendation(score: number, factors: any): any {
    if (score >= 80) {
      return {
        action: 'promote',
        priority: 'high',
        reason: 'Excellent deal with high commission rate and strong demand'
      };
    }
    
    if (score >= 60) {
      return {
        action: 'consider',
        priority: 'medium',
        reason: 'Good deal with reasonable commission and demand'
      };
    }
    
    if (score >= 40) {
      return {
        action: 'monitor',
        priority: 'low',
        reason: 'Average deal, monitor for potential improvements'
      };
    }
    
    return {
      action: 'reject',
      priority: 'none',
      reason: 'Poor deal with low commission or weak demand'
    };
  }
}