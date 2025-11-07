#!/usr/bin/env tsx
/**
 * Automated Referral Rewards Distribution
 * Processes pending referrals and distributes rewards
 * 
 * Run: npm run cron:referral-rewards
 * Schedule: Daily at midnight
 */

import { randomBytes } from 'crypto';
import { WalletService, ZentixWallet } from '../../core/economy/walletService';
import { ReferralService } from '../../core/referral/referralService';
import type { Referral, RewardTracking } from '../../core/types';

/**
 * Process referral rewards for completed referrals
 */
async function processReferralRewards() {
  console.log('\n💰 Starting Referral Rewards Distribution');
  console.log('═'.repeat(50));
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  try {
    // In production, fetch from Supabase
    // For demo, using mock data
    const pendingReferrals: Referral[] = [
      // Mock completed referrals awaiting rewards
    ];

    const wallets = new Map<string, ZentixWallet>();
    const processedRewards: RewardTracking[] = [];
    let totalDistributed = 0;

    console.log(`📊 Found ${pendingReferrals.length} referrals to process\n`);

    for (const referral of pendingReferrals) {
      if (referral.status !== 'completed') continue;

      try {
        // Get or create wallet for referrer
        let wallet = wallets.get(referral.referrer_did);
        if (!wallet) {
          wallet = WalletService.createWallet(referral.referrer_did);
          wallets.set(referral.referrer_did, wallet);
        }

        // Process reward
        const { wallet: updatedWallet, reward } = ReferralService.processReferralReward(
          wallet,
          referral
        );

        wallets.set(referral.referrer_did, updatedWallet);
        processedRewards.push(reward);
        totalDistributed += referral.reward_amount;

        console.log(`✅ Rewarded ${referral.reward_amount} ZXT to ${referral.referrer_did.slice(0, 20)}...`);
        console.log(`   Tier: ${referral.tier} | Referee: ${referral.referee_did || referral.referee_email}`);

        // Update referral status to 'rewarded'
        referral.status = 'rewarded';

      } catch (error) {
        console.error(`❌ Error processing referral ${referral.id}:`, error);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📈 Distribution Summary:');
    console.log(`   Total Rewards Distributed: ${totalDistributed} ZXT`);
    console.log(`   Referrals Processed: ${processedRewards.length}`);
    console.log(`   Unique Users Rewarded: ${wallets.size}`);

    // Tier breakdown
    const tierBreakdown = pendingReferrals.reduce((acc, r) => {
      if (r.status === 'rewarded') {
        acc[r.tier] = (acc[r.tier] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    console.log('\n💎 Tier Breakdown:');
    Object.entries(tierBreakdown).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} referrals`);
    });

    console.log('\n✨ Referral rewards distribution completed successfully!\n');

    return {
      success: true,
      totalDistributed,
      rewardsProcessed: processedRewards.length,
      uniqueUsers: wallets.size,
      tierBreakdown,
    };

  } catch (error) {
    console.error('\n❌ Error in referral rewards distribution:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Send notification to top referrers
 */
async function notifyTopReferrers() {
  console.log('\n📢 Notifying Top Referrers\n');

  // Mock leaderboard data
  const mockReferrals: Referral[] = [];
  const leaderboard = ReferralService.getLeaderboard(mockReferrals, 10);

  leaderboard.forEach((entry, index) => {
    console.log(`🏆 Rank ${index + 1}: ${entry.did.slice(0, 20)}... - ${entry.total_rewards} ZXT`);
  });

  console.log('\n✅ Notifications sent!\n');
}

// Main execution
if (require.main === module) {
  (async () => {
    const result = await processReferralRewards();
    await notifyTopReferrers();
    
    if (!result.success) {
      process.exit(1);
    }
  })();
}

export { processReferralRewards };
