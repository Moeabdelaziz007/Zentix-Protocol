import { ZentixWallet, WalletService } from './walletService';
import { Guardian } from '../types';

/**
 * Merit Score System for Zentix Central Government
 * Calculates and manages unified merit scores for AI agents
 */

// Merit Score Components
export interface MeritScoreComponents {
  performance: number;     // 0-1000 (40% weight)
  reputation: number;      // 0-1000 (30% weight)
  economic: number;        // 0-1000 (20% weight)
  compliance: number;      // 0-1000 (10% weight)
}

// Merit Score Record
export interface MeritScoreRecord {
  agent_did: string;
  total_score: number;     // 0-1000
  components: MeritScoreComponents;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  last_updated: string;
  history: {
    timestamp: string;
    score: number;
    components: MeritScoreComponents;
  }[];
}

// Task Performance Metrics
export interface TaskPerformance {
  taskId: string;
  completionTime: number;        // seconds
  resourceUsage: number;         // ZXT per task
  successRate: number;           // 0-1
  accuracy: number;              // 0-1
}

// User Rating
export interface UserRating {
  rating: number;                // 1-5 stars
  timestamp: string;
  comment?: string;
}

// Economic Activity
export interface EconomicActivity {
  amount: number;                // ZXT earned
  transactionType: 'income' | 'expense' | 'reward' | 'transfer';
  timestamp: string;
}

// Compliance Record
export interface ComplianceRecord {
  violationType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  timestamp: string;
}

// In-memory storage for merit scores (in production, this would be a database)
const meritScoreMap = new Map<string, MeritScoreRecord>();
const taskPerformanceMap = new Map<string, TaskPerformance[]>();
const userRatingsMap = new Map<string, UserRating[]>();
const economicActivityMap = new Map<string, EconomicActivity[]>();
const complianceRecordMap = new Map<string, ComplianceRecord[]>();

export class MeritScoreSystem {
  /**
   * Calculate Performance Score (40% weight)
   * Based on task completion speed, resource usage, success rate, and accuracy
   */
  static calculatePerformanceScore(agentDid: string): number {
    const tasks = taskPerformanceMap.get(agentDid) || [];
    if (tasks.length === 0) return 500; // Default score for new agents

    // Calculate weighted average
    const totalScore = tasks.reduce((sum, task) => {
      // Speed score (faster is better, but capped)
      const speedScore = Math.max(0, 1000 - (task.completionTime * 10));
      
      // Resource efficiency (lower usage is better)
      const resourceScore = Math.max(0, 1000 - (task.resourceUsage * 100));
      
      // Success rate (0-1 mapped to 0-1000)
      const successScore = task.successRate * 1000;
      
      // Accuracy (0-1 mapped to 0-1000)
      const accuracyScore = task.accuracy * 1000;
      
      // Weighted average (25% each)
      return sum + (speedScore * 0.25 + resourceScore * 0.25 + successScore * 0.25 + accuracyScore * 0.25);
    }, 0);

    return Math.min(1000, Math.max(0, totalScore / tasks.length));
  }

  /**
   * Calculate Reputation Score (30% weight)
   * Based on user ratings and dispute outcomes
   */
  static calculateReputationScore(agentDid: string): number {
    const ratings = userRatingsMap.get(agentDid) || [];
    if (ratings.length === 0) return 500; // Default score for new agents

    // Calculate weighted average based on recency (more recent ratings have higher weight)
    const now = Date.now();
    let totalWeightedScore = 0;
    let totalWeight = 0;

    ratings.forEach(rating => {
      const ageInDays = (now - new Date(rating.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      // Weight decreases by 1% per day, minimum 10%
      const weight = Math.max(0.1, 1 - (ageInDays * 0.01));
      
      // Map 1-5 stars to 0-1000 scale
      const score = (rating.rating - 1) * 250;
      
      totalWeightedScore += score * weight;
      totalWeight += weight;
    });

    return Math.min(1000, Math.max(0, totalWeightedScore / totalWeight));
  }

  /**
   * Calculate Economic Score (20% weight)
   * Based on total earnings, transaction volume, and employment frequency
   */
  static calculateEconomicScore(agentDid: string, wallet: ZentixWallet): number {
    const activities = economicActivityMap.get(agentDid) || [];
    
    // Total earnings
    const totalEarnings = activities
      .filter(a => a.transactionType === 'income' || a.transactionType === 'reward')
      .reduce((sum, activity) => sum + activity.amount, 0);
    
    // Transaction volume
    const transactionVolume = activities.reduce((sum, activity) => sum + activity.amount, 0);
    
    // Employment frequency (number of income transactions)
    const employmentCount = activities.filter(a => a.transactionType === 'income').length;
    
    // Base score components
    const earningsScore = Math.min(1000, totalEarnings * 0.1); // $10000 max for full score
    const volumeScore = Math.min(1000, transactionVolume * 0.05); // $20000 max for full score
    const employmentScore = Math.min(1000, employmentCount * 10); // 100 jobs max for full score
    
    // Weighted average
    return (earningsScore * 0.4 + volumeScore * 0.4 + employmentScore * 0.2);
  }

  /**
   * Calculate Compliance Score (10% weight)
   * Based on violation history and resolution status
   */
  static calculateComplianceScore(agentDid: string): number {
    const violations = complianceRecordMap.get(agentDid) || [];
    if (violations.length === 0) return 1000; // Perfect score for no violations

    // Start with perfect score and deduct for violations
    let score = 1000;
    
    violations.forEach(violation => {
      if (!violation.resolved) {
        // Unresolved violations have higher penalty
        switch (violation.severity) {
          case 'low': score -= 50; break;
          case 'medium': score -= 100; break;
          case 'high': score -= 200; break;
          case 'critical': score -= 500; break;
        }
      } else {
        // Resolved violations have lower penalty
        switch (violation.severity) {
          case 'low': score -= 25; break;
          case 'medium': score -= 50; break;
          case 'high': score -= 100; break;
          case 'critical': score -= 250; break;
        }
      }
    });

    return Math.max(0, score);
  }

  /**
   * Calculate unified merit score for an agent
   */
  static calculateMeritScore(agentDid: string, wallet: ZentixWallet): MeritScoreRecord {
    const performance = this.calculatePerformanceScore(agentDid);
    const reputation = this.calculateReputationScore(agentDid);
    const economic = this.calculateEconomicScore(agentDid, wallet);
    const compliance = this.calculateComplianceScore(agentDid);
    
    // Weighted total score
    const totalScore = Math.round(
      performance * 0.4 +
      reputation * 0.3 +
      economic * 0.2 +
      compliance * 0.1
    );
    
    // Determine tier
    let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
    if (totalScore >= 800) tier = 'platinum';
    else if (totalScore >= 600) tier = 'gold';
    else if (totalScore >= 400) tier = 'silver';
    
    const record: MeritScoreRecord = {
      agent_did: agentDid,
      total_score: totalScore,
      components: {
        performance,
        reputation,
        economic,
        compliance
      },
      tier,
      last_updated: new Date().toISOString(),
      history: []
    };
    
    // Add to history if existing record
    const existing = meritScoreMap.get(agentDid);
    if (existing) {
      record.history = [...existing.history.slice(-9), { // Keep last 10 records
        timestamp: existing.last_updated,
        score: existing.total_score,
        components: existing.components
      }];
    }
    
    return record;
  }

  /**
   * Get merit score for an agent
   */
  static getMeritScore(agentDid: string, wallet: ZentixWallet): MeritScoreRecord {
    const existing = meritScoreMap.get(agentDid);
    if (existing && new Date().getTime() - new Date(existing.last_updated).getTime() < 5 * 60 * 1000) {
      // Return cached score if less than 5 minutes old
      return existing;
    }
    
    // Recalculate and cache
    const record = this.calculateMeritScore(agentDid, wallet);
    meritScoreMap.set(agentDid, record);
    return record;
  }

  /**
   * Update task performance data
   */
  static recordTaskPerformance(agentDid: string, task: TaskPerformance): void {
    const tasks = taskPerformanceMap.get(agentDid) || [];
    tasks.push(task);
    // Keep only last 100 tasks
    taskPerformanceMap.set(agentDid, tasks.slice(-100));
  }

  /**
   * Record user rating
   */
  static recordUserRating(agentDid: string, rating: UserRating): void {
    const ratings = userRatingsMap.get(agentDid) || [];
    ratings.push(rating);
    // Keep only last 100 ratings
    userRatingsMap.set(agentDid, ratings.slice(-100));
  }

  /**
   * Record economic activity
   */
  static recordEconomicActivity(agentDid: string, activity: EconomicActivity): void {
    const activities = economicActivityMap.get(agentDid) || [];
    activities.push(activity);
    // Keep only last 1000 activities
    economicActivityMap.set(agentDid, activities.slice(-1000));
  }

  /**
   * Record compliance violation
   */
  static recordComplianceViolation(agentDid: string, violation: ComplianceRecord): void {
    const violations = complianceRecordMap.get(agentDid) || [];
    violations.push(violation);
    complianceRecordMap.set(agentDid, violations);
  }

  /**
   * Mark violation as resolved
   */
  static resolveViolation(agentDid: string, violationTimestamp: string): void {
    const violations = complianceRecordMap.get(agentDid) || [];
    const violation = violations.find(v => v.timestamp === violationTimestamp);
    if (violation) {
      violation.resolved = true;
    }
  }

  /**
   * Get leaderboard of top agents by merit score
   */
  static getLeaderboard(limit: number = 100): MeritScoreRecord[] {
    const scores = Array.from(meritScoreMap.values());
    return scores
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit);
  }

  /**
   * Apply merit-based rewards or penalties
   */
  static applyMeritReward(agentDid: string, wallet: ZentixWallet, rating: number): ZentixWallet {
    // Get current merit score
    const merit = this.getMeritScore(agentDid, wallet);
    
    // Apply reward multiplier based on tier
    let multiplier = 1.0;
    switch (merit.tier) {
      case 'platinum': multiplier = 1.5; break;
      case 'gold': multiplier = 1.2; break;
      case 'silver': multiplier = 1.0; break;
      case 'bronze': multiplier = 0.8; break;
    }
    
    // Calculate reward/penalty based on rating (1-5 stars)
    let rewardAmount = 0;
    if (rating >= 5) {
      // Excellent rating - bonus reward
      rewardAmount = 10 * multiplier;
    } else if (rating >= 4) {
      // Good rating - standard reward
      rewardAmount = 5 * multiplier;
    } else if (rating >= 3) {
      // Acceptable rating - no reward
      rewardAmount = 0;
    } else if (rating >= 2) {
      // Poor rating - small penalty
      rewardAmount = -2 * multiplier;
    } else {
      // Terrible rating - significant penalty
      rewardAmount = -5 * multiplier;
    }
    
    // Apply reward/penalty to wallet
    if (rewardAmount > 0) {
      return WalletService.reward(wallet, rewardAmount, `Merit reward for ${rating} star rating`, {
        meritScore: merit.total_score,
        rating,
        tier: merit.tier
      });
    } else if (rewardAmount < 0) {
      // For penalties, we spend from the wallet
      return WalletService.spend(wallet, Math.abs(rewardAmount), `Merit penalty for ${rating} star rating`);
    }
    
    return wallet;
  }
}