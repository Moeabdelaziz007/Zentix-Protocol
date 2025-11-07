#!/usr/bin/env tsx
/**
 * Referral Agent Demo - Automated Invite & Reward System
 * Zero-cost viral growth with automatic ZXT rewards
 */

import { ReferralAgent } from '../core/agents/referralAgent';

async function main() {
  console.log('\n🎯 Zentix Referral Agent - Automated Invite System');
  console.log('═'.repeat(60));

  // User DIDs
  const alice = 'zxdid:zentix:0xALICE123456789ABCDEF0123456789AB';
  const bob = 'zxdid:zentix:0xBOB9876543210FEDCBA9876543210FED';
  const charlie = 'zxdid:zentix:0xCHARLIE456789ABCDEF0123456789AB';

  // ============================================
  // 1. GENERATE INVITE LINK
  // ============================================
  console.log('\n💎 1. Generate Invite Link\n');

  const aliceInvite = ReferralAgent.generateInviteLink(alice);
  console.log('✅ Alice\'s Referral Link Generated:');
  console.log(`   Code: ${aliceInvite.code}`);
  console.log(`   Link: ${aliceInvite.link}`);
  console.log(`   QR Code: ${aliceInvite.qr_code}\n`);

  // ============================================
  // 2. TRACK REFERRALS - DIFFERENT TIERS
  // ============================================
  console.log('👥 2. Track Referrals (Bronze → Platinum)\n');

  // Bronze: Bob signs up through Alice's link
  const bobSignup = await ReferralAgent.trackReferral(
    alice,
    bob,
    'bob@example.com',
    'bronze'
  );
  console.log(`📊 BRONZE Tier (Signup):`);
  console.log(`   ${bobSignup.message}`);
  console.log(`   Alice's Balance: ${bobSignup.new_balance} ZXT\n`);

  // Silver: Bob completes first task
  const bobFirstTask = await ReferralAgent.trackReferral(
    alice,
    charlie,
    'charlie@example.com',
    'silver'
  );
  console.log(`📊 SILVER Tier (First Activity):`);
  console.log(`   ${bobFirstTask.message}`);
  console.log(`   Alice's Balance: ${bobFirstTask.new_balance} ZXT\n`);

  // Simulate more referrals
  const users = [
    { did: 'zxdid:zentix:0xUSER1', email: 'user1@example.com', tier: 'bronze' as const },
    { did: 'zxdid:zentix:0xUSER2', email: 'user2@example.com', tier: 'silver' as const },
    { did: 'zxdid:zentix:0xUSER3', email: 'user3@example.com', tier: 'gold' as const },
    { did: 'zxdid:zentix:0xUSER4', email: 'user4@example.com', tier: 'platinum' as const },
  ];

  for (const user of users) {
    await ReferralAgent.trackReferral(alice, user.did, user.email, user.tier);
  }

  // ============================================
  // 3. GET REFERRAL POINTS
  // ============================================
  console.log('💰 3. Check Referral Points\n');

  const alicePoints = ReferralAgent.getPoints(alice);
  console.log(`   Alice's Total Points: ${alicePoints} ZXT`);

  const stats = ReferralAgent.getStats(alice);
  console.log(`\n📈 Alice's Statistics:`);
  console.log(`   Total Referrals: ${stats.total_referrals}`);
  console.log(`   Completed: ${stats.completed_referrals}`);
  console.log(`   Conversion Rate: ${stats.conversion_rate.toFixed(1)}%`);
  console.log(`   Total Rewards: ${stats.total_rewards_earned} ZXT`);
  console.log(`   Current Balance: ${stats.current_balance} ZXT`);
  console.log(`\n   Tier Breakdown:`);
  Object.entries(stats.tier_breakdown).forEach(([tier, count]) => {
    console.log(`      ${tier}: ${count} referrals`);
  });

  // ============================================
  // 4. REFERRAL CAMPAIGN (2x BONUS)
  // ============================================
  console.log('\n\n🎊 4. Launch Referral Campaign\n');

  const campaign = ReferralAgent.createCampaign(
    alice,
    'Launch Week Special',
    2.0, // 2x rewards!
    7    // 7 days
  );

  console.log(`✅ Campaign Created:`);
  console.log(`   Name: ${campaign.name}`);
  console.log(`   Bonus: ${campaign.bonus_multiplier}x rewards`);
  console.log(`   Duration: 7 days`);
  console.log(`   Status: ${campaign.status}\n`);

  // Track referral during campaign
  const campaignReferral = await ReferralAgent.trackReferral(
    alice,
    'zxdid:zentix:0xCAMPAIGNUSER',
    'campaign@example.com',
    'gold'
  );

  console.log(`💎 Referral During Campaign:`);
  console.log(`   ${campaignReferral.message}`);
  console.log(`   Base Reward: 50 ZXT`);
  console.log(`   Campaign Bonus: 2x`);
  console.log(`   Total Earned: ${campaignReferral.reward_earned} ZXT`);
  console.log(`   New Balance: ${campaignReferral.new_balance} ZXT\n`);

  // ============================================
  // 5. TIER UPGRADE
  // ============================================
  console.log('⬆️  5. Upgrade Referral Tier\n');

  // Bob becomes active user, upgrade from bronze to gold
  const upgrade = await ReferralAgent.upgradeReferralTier(
    bobSignup.referral.id,
    'gold',
    alice
  );

  console.log(`✨ ${upgrade.message}`);
  console.log(`   Previous Tier: bronze (10 ZXT)`);
  console.log(`   New Tier: gold (50 ZXT)`);
  console.log(`   Bonus Earned: ${upgrade.reward_earned} ZXT`);
  console.log(`   Alice's Balance: ${upgrade.new_balance} ZXT\n`);

  // ============================================
  // 6. SEND BULK INVITES
  // ============================================
  console.log('📧 6. Send Automated Invites\n');

  const emailList = [
    'friend1@example.com',
    'friend2@example.com',
    'friend3@example.com',
  ];

  const inviteResults = await ReferralAgent.sendInvites(alice, emailList);

  console.log(`   Sent ${inviteResults.filter(r => r.sent).length}/${emailList.length} invites:`);
  inviteResults.forEach((result) => {
    const status = result.sent ? '✅' : '❌';
    console.log(`      ${status} ${result.email}`);
  });

  // ============================================
  // 7. LEADERBOARD
  // ============================================
  console.log('\n\n🏆 7. Referral Leaderboard\n');

  const leaderboard = ReferralAgent.getLeaderboard(5);

  leaderboard.forEach((entry, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
    console.log(`   ${medal} #${entry.rank} ${entry.did.slice(0, 25)}...`);
    console.log(`      Referrals: ${entry.total_referrals} | Rewards: ${entry.total_rewards} ZXT`);
  });

  // ============================================
  // 8. CAMPAIGN STATS
  // ============================================
  console.log('\n\n📊 8. Campaign Performance\n');

  const campaigns = ReferralAgent.getAllCampaigns();
  campaigns.forEach((camp) => {
    console.log(`   Campaign: ${camp.name}`);
    console.log(`      Total Referrals: ${camp.total_referrals}`);
    console.log(`      Rewards Distributed: ${camp.total_rewards_distributed} ZXT`);
    console.log(`      Multiplier: ${camp.bonus_multiplier}x`);
    console.log(`      Status: ${camp.status}\n`);
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═'.repeat(60));
  console.log('✨ Referral Agent Demo Complete!\n');
  
  const finalStats = ReferralAgent.getStats(alice);
  console.log('💡 Final Results:');
  console.log(`   ✅ Total Referrals: ${finalStats.total_referrals}`);
  console.log(`   ✅ Total Earnings: ${finalStats.total_rewards_earned} ZXT`);
  console.log(`   ✅ Conversion Rate: ${finalStats.conversion_rate.toFixed(1)}%`);
  console.log(`   ✅ Campaign Bonus: 2x during active campaigns`);
  console.log(`   ✅ Tier Upgrades: Automatic bonus on user activity`);
  
  console.log('\n🚀 Key Features:');
  console.log('   💰 Zero upfront cost');
  console.log('   📈 Scalable viral growth');
  console.log('   🎁 Multi-tier rewards (10-100 ZXT)');
  console.log('   🎊 Campaign bonuses (up to 3x)');
  console.log('   ⬆️  Automatic tier upgrades');
  console.log('   📧 Bulk invite automation');
  console.log('   🏆 Real-time leaderboards\n');
}

main().catch(console.error);
