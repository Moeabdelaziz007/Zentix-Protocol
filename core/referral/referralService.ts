import { randomBytes } from 'crypto';
import { WalletService, ZentixWallet } from '../economy/walletService';
import type { Referral, Lead, RewardTracking } from '../types';

/**
 * Zentix Referral Service - Smart Passive Income System
 * Tracks referrals, manages rewards, and creates viral growth loops
 * 
 * @module referralService
 * @version 1.0.0
 */

/**
 * Referral tier rewards configuration
 */
export const REFERRAL_REWARDS = {
  bronze: 10,    // New user signup
  silver: 25,    // User completes first task
  gold: 50,      // User generates $10+ in value
  platinum: 100, // User becomes active contributor
} as const;

/**
 * Referral code format: ZXT-<8-chars>
 */
export interface ReferralCode {
  code: string;
  owner_did: string;
  uses: number;
  max_uses?: number;
  created_at: string;
  expires_at?: string;
}

/**
 * Referral statistics
 */
export interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  tier_breakdown: Record<string, number>;
  conversion_rate: number;
}

/**
 * Service for managing referral system
 */
export class ReferralService {
  /**
   * Generate unique referral code
   * 
   * @param ownerDID - DID of the referrer
   * @param maxUses - Optional maximum uses
   * @returns Referral code object
   * 
   * @example
   * ```ts
   * const code = ReferralService.generateReferralCode('zxdid:zentix:0x...');
   * console.log(code.code); // ZXT-A1B2C3D4
   * ```
   */
  static generateReferralCode(
    ownerDID: string,
    maxUses?: number
  ): ReferralCode {
    const code = `ZXT-${randomBytes(4).toString('hex').toUpperCase()}`;
    
    return {
      code,
      owner_did: ownerDID,
      uses: 0,
      max_uses: maxUses,
      created_at: new Date().toISOString(),
      expires_at: maxUses ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Create referral when someone uses a code
   * 
   * @param referrerDID - DID of the referrer
   * @param refereeEmail - Email or DID of referee
   * @returns New referral object
   */
  static createReferral(
    referrerDID: string,
    refereeEmail: string
  ): Referral {
    return {
      id: randomBytes(8).toString('hex'),
      referrer_did: referrerDID,
      referee_email: refereeEmail,
      status: 'pending',
      reward_amount: REFERRAL_REWARDS.bronze,
      tier: 'bronze',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Complete referral and upgrade tier
   * 
   * @param referral - The referral to complete
   * @param refereeDID - DID of the new user
   * @param tier - Completion tier
   * @returns Updated referral
   */
  static completeReferral(
    referral: Referral,
    refereeDID: string,
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze'
  ): Referral {
    return {
      ...referral,
      referee_did: refereeDID,
      status: 'completed',
      tier,
      reward_amount: REFERRAL_REWARDS[tier],
      completed_at: new Date().toISOString(),
    };
  }

  /**
   * Process referral reward to wallet
   * 
   * @param wallet - Referrer's wallet
   * @param referral - Completed referral
   * @returns Updated wallet and reward tracking
   */
  static processReferralReward(
    wallet: ZentixWallet,
    referral: Referral
  ): { wallet: ZentixWallet; reward: RewardTracking } {
    if (referral.status !== 'completed') {
      throw new Error('Cannot reward incomplete referral');
    }

    const updatedWallet = WalletService.reward(
      wallet,
      referral.reward_amount,
      `Referral reward - ${referral.tier} tier`,
      {
        referral_id: referral.id,
        referee: referral.referee_did || referral.referee_email,
        tier: referral.tier,
      }
    );

    const reward: RewardTracking = {
      id: randomBytes(8).toString('hex'),
      user_did: wallet.agent_did || '',
      reward_type: 'referral',
      amount: referral.reward_amount,
      source_id: referral.id,
      status: 'processed',
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
    };

    return { wallet: updatedWallet, reward };
  }

  /**
   * Get referral statistics for a user
   * 
   * @param referrals - All referrals by user
   * @returns Referral statistics
   */
  static getReferralStats(referrals: Referral[]): ReferralStats {
    const total = referrals.length;
    const completed = referrals.filter((r) => r.status === 'completed').length;
    const pending = referrals.filter((r) => r.status === 'pending').length;

    const tierBreakdown = referrals.reduce((acc, r) => {
      if (r.status === 'completed') {
        acc[r.tier] = (acc[r.tier] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalRewards = referrals
      .filter((r) => r.status === 'completed' || r.status === 'rewarded')
      .reduce((sum, r) => sum + r.reward_amount, 0);

    return {
      total_referrals: total,
      completed_referrals: completed,
      pending_referrals: pending,
      total_rewards_earned: totalRewards,
      tier_breakdown: tierBreakdown,
      conversion_rate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  /**
   * Create lead from referral link
   * 
   * @param email - Lead email
   * @param referrerDID - Optional referrer DID
   * @param source - Lead source
   * @returns New lead object
   */
  static createLead(
    email: string,
    referrerDID?: string,
    source: 'landing' | 'referral' | 'social' | 'campaign' = 'referral'
  ): Lead {
    return {
      id: randomBytes(8).toString('hex'),
      email,
      source,
      status: 'new',
      created_at: new Date().toISOString(),
      referrer_did: referrerDID,
    };
  }

  /**
   * Calculate multi-tier referral rewards
   * For viral growth: reward referrer and their referrer
   * 
   * @param tier1ReferrerDID - Direct referrer
   * @param tier2ReferrerDID - Referrer's referrer (optional)
   * @param baseReward - Base reward amount
   * @returns Reward distribution
   */
  static calculateMultiTierRewards(
    tier1ReferrerDID: string,
    tier2ReferrerDID: string | null,
    baseReward: number
  ): Array<{ did: string; amount: number; tier: number }> {
    const rewards = [
      {
        did: tier1ReferrerDID,
        amount: baseReward,
        tier: 1,
      },
    ];

    // 20% bonus to tier-2 referrer (viral incentive)
    if (tier2ReferrerDID) {
      rewards.push({
        did: tier2ReferrerDID,
        amount: Math.floor(baseReward * 0.2),
        tier: 2,
      });
    }

    return rewards;
  }

  /**
   * Track referral link click
   * 
   * @param code - Referral code
   * @param metadata - Click metadata (IP, user-agent, etc.)
   * @returns Analytics event
   */
  static trackReferralClick(
    code: string,
    metadata: Record<string, any> = {}
  ) {
    return {
      id: randomBytes(8).toString('hex'),
      event_type: 'referral_click' as const,
      event_data: {
        referral_code: code,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate referral code format
   * 
   * @param code - Code to validate
   * @returns true if valid
   */
  static isValidCode(code: string): boolean {
    return /^ZXT-[A-F0-9]{8}$/.test(code);
  }

  /**
   * Generate shareable referral link
   * 
   * @param code - Referral code
   * @param baseUrl - Base URL for the platform
   * @returns Full referral URL
   */
  static generateReferralLink(code: string, baseUrl = 'https://zentix.network'): string {
    return `${baseUrl}/join?ref=${code}`;
  }

  /**
   * Calculate referral leaderboard
   * 
   * @param allReferrals - All referrals in system
   * @param limit - Top N users
   * @returns Leaderboard
   */
  static getLeaderboard(
    allReferrals: Referral[],
    limit = 10
  ): Array<{ did: string; total_referrals: number; total_rewards: number }> {
    const userStats = new Map<string, { count: number; rewards: number }>();

    allReferrals.forEach((r) => {
      if (r.status === 'completed' || r.status === 'rewarded') {
        const current = userStats.get(r.referrer_did) || { count: 0, rewards: 0 };
        userStats.set(r.referrer_did, {
          count: current.count + 1,
          rewards: current.rewards + r.reward_amount,
        });
      }
    });

    return Array.from(userStats.entries())
      .map(([did, stats]) => ({
        did,
        total_referrals: stats.count,
        total_rewards: stats.rewards,
      }))
      .sort((a, b) => b.total_rewards - a.total_rewards)
      .slice(0, limit);
  }
}
