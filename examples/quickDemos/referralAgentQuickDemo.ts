#!/usr/bin/env tsx
/**
 * Quick Demo: Referral Agent
 * Minimal example of automated referral tracking
 */

import { ReferralAgent } from '../../core/agents/referralAgent';
import { AgentLogger } from '../../core/utils/agentLogger';

async function main() {
  console.log('\n🎯 Referral Agent - Quick Demo\n');

  const userDID = 'zxdid:zentix:demo-alice';

  // Generate invite link
  const invite = await AgentLogger.measurePerformance(
    'ReferralAgent',
    'generateInviteLink',
    () => ReferralAgent.generateInviteLink(userDID)
  );

  console.log(`Referral Code: ${invite.code}`);
  console.log(`Share Link: ${invite.link}\n`);

  // Track referral
  const result = await AgentLogger.measurePerformance(
    'ReferralAgent',
    'trackReferral',
    () =>
      ReferralAgent.trackReferral(
        userDID,
        'zxdid:zentix:demo-bob',
        'bob@example.com',
        'silver'
      ),
    { tier: 'silver' }
  );

  console.log(result.message);
  console.log(`Reward Earned: ${result.reward_earned} ZXT`);
  console.log(`New Balance: ${result.new_balance} ZXT\n`);

  // Get stats
  const stats = ReferralAgent.getStats(userDID);
  console.log('Referral Stats:');
  console.log(`  Total: ${stats.total_referrals}`);
  console.log(`  Rewards: ${stats.total_rewards_earned} ZXT\n`);

  // Performance
  const perfStats = AgentLogger.getStats();
  console.log(`Operations: ${perfStats.total_operations}, Avg: ${perfStats.avg_duration_ms.toFixed(1)}ms\n`);
}

main().catch(console.error);
