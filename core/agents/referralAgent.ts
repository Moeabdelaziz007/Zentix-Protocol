import { randomBytes } from 'crypto';
import { WalletService, ZentixWallet } from '../economy/walletService';
import { ReferralService } from '../referral/referralService';
import type { Referral, AgentActivity, RewardTracking } from '../types';

/**
 * Zentix Referral Agent - Automated Friend Invite System
 * Zero-cost passive income through viral growth
 * 
 * @module referralAgent
 * @version 1.0.0
 */

/**
 * Referral tracking result
 */
export interface ReferralTrackingResult {
  success: boolean;
  referral: Referral;
  reward_earned: number;
  new_balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  message: string;
}

/**
 * Referral campaign
 */
export interface ReferralCampaign {
  id: string;
  name: string;
  creator_did: string;
  bonus_multiplier: number; // 1.0 = normal, 2.0 = double rewards
  start_date: string;
  end_date?: string;
  total_referrals: number;
  total_rewards_distributed: number;
  status: 'active' | 'paused' | 'ended';
}

/**
 * ReferralAgent - Automated referral tracking and rewards
 */
export class ReferralAgent {
  private static campaigns = new Map<string, ReferralCampaign>();
  private static referrals = new Map<string, Referral[]>();
  private static wallets = new Map<string, ZentixWallet>();

  /**
   * Track new referral and reward referrer
   * 
   * @param userDID - Referrer's DID
   * @param referredDID - Referred user's DID
   * @param referredEmail - Referred user's email (if DID not available yet)
   * @param tier - Reward tier based on activity
   * @returns Referral tracking result
   * 
   * @example
   * ```ts
   * const result = await ReferralAgent.trackReferral(
   *   'zxdid:zentix:0xREFERRER...',
   *   'zxdid:zentix:0xNEWUSER...',
   *   'newuser@example.com',
   *   'silver'
   * );
   * console.log(`Earned ${result.reward_earned} ZXT!`);
   * ```
   */
  static async trackReferral(
    userDID: string,
    referredDID: string,
    referredEmail?: string,
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze'
  ): Promise<ReferralTrackingResult> {
    try {
      // Get or create wallet
      let wallet = this.wallets.get(userDID);
      if (!wallet) {
        wallet = WalletService.createWallet(userDID);
        this.wallets.set(userDID, wallet);
      }

      // Create referral
      let referral = ReferralService.createReferral(
        userDID,
        referredEmail || referredDID
      );

      // Complete referral with tier
      referral = ReferralService.completeReferral(referral, referredDID, tier);

      // Apply campaign bonus if active
      const activeCampaign = this.getActiveCampaign(userDID);
      const finalReward = activeCampaign
        ? referral.reward_amount * activeCampaign.bonus_multiplier
        : referral.reward_amount;

      // Update reward amount if bonus applied
      if (activeCampaign) {
        referral.reward_amount = finalReward;
      }

      // Process reward
      const { wallet: updatedWallet, reward } = ReferralService.processReferralReward(
        wallet,
        referral
      );

      // Update storage
      this.wallets.set(userDID, updatedWallet);
      
      const userReferrals = this.referrals.get(userDID) || [];
      userReferrals.push(referral);
      this.referrals.set(userDID, userReferrals);

      // Update campaign stats
      if (activeCampaign) {
        activeCampaign.total_referrals++;
        activeCampaign.total_rewards_distributed += finalReward;
      }

      // Log activity
      const activity: AgentActivity = {
        id: randomBytes(8).toString('hex'),
        agent_did: userDID,
        activity_type: 'referral',
        description: `Referred ${referredEmail || referredDID}`,
        reward_earned: finalReward,
        metadata: {
          referral_id: referral.id,
          tier,
          campaign: activeCampaign?.name,
        },
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        referral,
        reward_earned: finalReward,
        new_balance: updatedWallet.balance,
        tier,
        message: activeCampaign
          ? `🎉 ${finalReward} ZXT earned (${activeCampaign.bonus_multiplier}x campaign bonus)!`
          : `✅ ${finalReward} ZXT earned from ${tier} tier referral!`,
      };
    } catch (error) {
      throw new Error(`Failed to track referral: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get referral points for user
   * 
   * @param userDID - User's DID
   * @returns Total points earned
   */
  static getPoints(userDID: string): number {
    const wallet = this.wallets.get(userDID);
    return wallet ? wallet.balance : 0;
  }

  /**
   * Get user's referral statistics
   * 
   * @param userDID - User's DID
   * @returns Referral stats
   */
  static getStats(userDID: string) {
    const referrals = this.referrals.get(userDID) || [];
    const stats = ReferralService.getReferralStats(referrals);
    const wallet = this.wallets.get(userDID);

    return {
      ...stats,
      current_balance: wallet?.balance || 0,
      wallet_address: wallet?.address || null,
    };
  }

  /**
   * Create referral campaign with bonus rewards
   * 
   * @param creatorDID - Campaign creator
   * @param name - Campaign name
   * @param bonusMultiplier - Reward multiplier (e.g., 2.0 for double rewards)
   * @param durationDays - Campaign duration in days
   * @returns Campaign object
   */
  static createCampaign(
    creatorDID: string,
    name: string,
    bonusMultiplier: number = 1.5,
    durationDays: number = 30
  ): ReferralCampaign {
    const campaign: ReferralCampaign = {
      id: randomBytes(8).toString('hex'),
      name,
      creator_did: creatorDID,
      bonus_multiplier: bonusMultiplier,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      total_referrals: 0,
      total_rewards_distributed: 0,
      status: 'active',
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Get active campaign for user
   */
  private static getActiveCampaign(userDID: string): ReferralCampaign | null {
    const now = new Date();
    
    for (const campaign of this.campaigns.values()) {
      if (
        campaign.status === 'active' &&
        new Date(campaign.start_date) <= now &&
        (!campaign.end_date || new Date(campaign.end_date) >= now)
      ) {
        return campaign;
      }
    }
    
    return null;
  }

  /**
   * Get leaderboard
   * 
   * @param limit - Top N users
   * @returns Leaderboard
   */
  static getLeaderboard(limit: number = 10) {
    const allReferrals: Referral[] = [];
    
    for (const refs of this.referrals.values()) {
      allReferrals.push(...refs);
    }

    return ReferralService.getLeaderboard(allReferrals, limit);
  }

  /**
   * Generate shareable invite link
   * 
   * @param userDID - User's DID
   * @returns Referral code and link
   */
  static generateInviteLink(userDID: string) {
    const code = ReferralService.generateReferralCode(userDID);
    const link = ReferralService.generateReferralLink(code.code);

    return {
      code: code.code,
      link,
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`,
    };
  }

  /**
   * Upgrade referral tier based on referee activity
   * 
   * @param referralId - Referral ID
   * @param newTier - New tier to upgrade to
   * @param referrerDID - Referrer's DID
   * @returns Updated referral result
   */
  static async upgradeReferralTier(
    referralId: string,
    newTier: 'silver' | 'gold' | 'platinum',
    referrerDID: string
  ): Promise<ReferralTrackingResult> {
    const userReferrals = this.referrals.get(referrerDID) || [];
    const referral = userReferrals.find((r) => r.id === referralId);

    if (!referral) {
      throw new Error('Referral not found');
    }

    const oldTier = referral.tier;
    const oldReward = referral.reward_amount;

    // Update tier
    referral.tier = newTier;
    referral.reward_amount = ReferralService['REFERRAL_REWARDS'][newTier];

    // Calculate bonus (difference between new and old tier)
    const bonus = referral.reward_amount - oldReward;

    // Add bonus to wallet
    let wallet = this.wallets.get(referrerDID);
    if (!wallet) {
      wallet = WalletService.createWallet(referrerDID);
    }

    wallet = WalletService.reward(
      wallet,
      bonus,
      `Tier upgrade bonus: ${oldTier} → ${newTier}`,
      { referral_id: referralId }
    );

    this.wallets.set(referrerDID, wallet);

    return {
      success: true,
      referral,
      reward_earned: bonus,
      new_balance: wallet.balance,
      tier: newTier,
      message: `🎊 Tier upgraded! Earned ${bonus} ZXT bonus!`,
    };
  }

  /**
   * Send automated invite emails
   * 
   * @param userDID - User's DID
   * @param emails - Email addresses to invite
   * @returns Invite results
   */
  static async sendInvites(
    userDID: string,
    emails: string[]
  ): Promise<Array<{ email: string; sent: boolean; referral_id: string }>> {
    const results: Array<{ email: string; sent: boolean; referral_id: string }> = [];
    const { code, link } = this.generateInviteLink(userDID);

    for (const email of emails) {
      try {
        // Create pending referral
        const referral = ReferralService.createReferral(userDID, email);
        
        const userReferrals = this.referrals.get(userDID) || [];
        userReferrals.push(referral);
        this.referrals.set(userDID, userReferrals);

        // In production, send actual email here
        // await emailService.send(email, link);

        results.push({
          email,
          sent: true,
          referral_id: referral.id,
        });
      } catch (error) {
        results.push({
          email,
          sent: false,
          referral_id: '',
        });
      }
    }

    return results;
  }

  /**
   * Get all campaigns
   */
  static getAllCampaigns(): ReferralCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Reset agent state (for testing)
   */
  static reset(): void {
    this.campaigns.clear();
    this.referrals.clear();
    this.wallets.clear();
  }
}
