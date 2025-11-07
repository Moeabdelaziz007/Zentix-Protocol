#!/usr/bin/env tsx
/**
 * Referral System Demo
 * Demonstrates viral growth and passive income through referrals
 */

import { ReferralService, REFERRAL_REWARDS } from '../core/referral/referralService';
import { WalletService } from '../core/economy/walletService';
import { AnalyticsDashboard } from '../core/analytics/analyticsDashboard';
import { LandingPageAgent, SocialMediaAgent, EmailFunnelAgent } from '../core/agents/utilityAgents';
import type { Referral, RewardTracking, AgentActivity } from '../core/types';

async function main() {
  console.log('\n🎯 Zentix Referral System Demo');
  console.log('═'.repeat(60));

  // ============================================
  // 1. REFERRAL CODE GENERATION
  // ============================================
  console.log('\n💎 1. Generate Referral Code\n');

  const referrerDID = 'zxdid:zentix:0xREFERRER123456789ABCDEF012345678';
  const code = ReferralService.generateReferralCode(referrerDID);
  const link = ReferralService.generateReferralLink(code.code);

  console.log(`✅ Referral Code Generated:`);
  console.log(`   Code: ${code.code}`);
  console.log(`   Owner: ${code.owner_did.slice(0, 40)}...`);
  console.log(`   Link: ${link}`);
  console.log(`   Expires: ${code.expires_at?.split('T')[0] || 'Never'}`);

  // ============================================
  // 2. REFERRAL TRACKING
  // ============================================
  console.log('\n\n👥 2. Referral Tracking & Rewards\n');

  const referrals: Referral[] = [];
  const rewards: RewardTracking[] = [];

  // Create referrals at different tiers
  const referees = [
    { email: 'user1@example.com', tier: 'bronze' as const },
    { email: 'user2@example.com', tier: 'silver' as const },
    { email: 'user3@example.com', tier: 'gold' as const },
    { email: 'user4@example.com', tier: 'platinum' as const },
  ];

  let referrerWallet = WalletService.createWallet(referrerDID);

  console.log('📊 Processing Referrals:\n');

  for (const referee of referees) {
    // Create referral
    let referral = ReferralService.createReferral(referrerDID, referee.email);
    
    // Simulate user signup and activity
    const refereeDID = `zxdid:zentix:0x${Math.random().toString(16).slice(2, 34).toUpperCase()}`;
    referral = ReferralService.completeReferral(referral, refereeDID, referee.tier);
    
    // Process reward
    const { wallet: updatedWallet, reward } = ReferralService.processReferralReward(
      referrerWallet,
      referral
    );
    
    referrerWallet = updatedWallet;
    referrals.push(referral);
    rewards.push(reward);

    console.log(`   ${referee.tier.toUpperCase()} Tier: ${referee.email}`);
    console.log(`   Reward: ${REFERRAL_REWARDS[referee.tier]} ZXT`);
    console.log('');
  }

  console.log(`✅ Total Earned: ${referrerWallet.balance} ZXT\n`);

  // Get referral stats
  const stats = ReferralService.getReferralStats(referrals);
  console.log('📈 Referral Statistics:');
  console.log(`   Total Referrals: ${stats.total_referrals}`);
  console.log(`   Completed: ${stats.completed_referrals}`);
  console.log(`   Conversion Rate: ${stats.conversion_rate.toFixed(1)}%`);
  console.log(`   Total Rewards: ${stats.total_rewards_earned} ZXT`);
  console.log('\n   Tier Breakdown:');
  Object.entries(stats.tier_breakdown).forEach(([tier, count]) => {
    console.log(`      ${tier}: ${count}`);
  });

  // ============================================
  // 3. MULTI-TIER REWARDS
  // ============================================
  console.log('\n\n🌟 3. Multi-Tier Viral Rewards\n');

  const tier1Referrer = 'zxdid:zentix:0xTIER1REFERRER789ABCDEF0123456789';
  const tier2Referrer = referrerDID; // Original referrer

  const multiTierRewards = ReferralService.calculateMultiTierRewards(
    tier1Referrer,
    tier2Referrer,
    50
  );

  console.log('💰 Reward Distribution:');
  multiTierRewards.forEach((r) => {
    console.log(`   Tier ${r.tier}: ${r.did.slice(0, 30)}... → ${r.amount} ZXT`);
  });

  // ============================================
  // 4. LEADERBOARD
  // ============================================
  console.log('\n\n🏆 4. Referral Leaderboard\n');

  const leaderboard = ReferralService.getLeaderboard(referrals, 5);

  leaderboard.forEach((entry) => {
    console.log(`   #${entry.total_referrals} ${entry.did.slice(0, 30)}...`);
    console.log(`      Referrals: ${entry.total_referrals} | Rewards: ${entry.total_rewards} ZXT`);
  });

  // ============================================
  // 5. ANALYTICS DASHBOARD
  // ============================================
  console.log('\n\n📊 5. User Analytics Dashboard\n');

  const activities: AgentActivity[] = referrals.map((r) => ({
    id: r.id,
    agent_did: referrerDID,
    activity_type: 'referral' as const,
    description: `Referred ${r.referee_email}`,
    reward_earned: r.reward_amount,
    timestamp: r.created_at,
  }));

  const dashboard = AnalyticsDashboard.generateDashboardSummary(
    referrerDID,
    rewards,
    [],
    referrals,
    activities
  );

  console.log('🎯 Dashboard Summary:');
  console.log(`   Total Rewards: ${dashboard.total_rewards_earned} ZXT`);
  console.log(`   Total Referrals: ${dashboard.total_referrals}`);
  console.log(`   Activities This Week: ${dashboard.activities_this_week}`);
  console.log(`   Badges: ${dashboard.badges.join(', ')}`);

  const timeline = AnalyticsDashboard.generateTimeline(activities, rewards, referrals, 5);
  console.log('\n📅 Recent Activity:');
  timeline.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.icon} ${item.title}`);
    console.log(`      ${item.description}`);
  });

  // ============================================
  // 6. CONTENT GENERATION
  // ============================================
  console.log('\n\n✍️  6. Marketing Content Generation\n');

  // Landing page
  const landingPage = LandingPageAgent.generateReferralPage(code.code, 'Alex');
  console.log('📄 Generated Referral Landing Page:');
  console.log(`   Title: ${landingPage.title}`);
  console.log(`   Headline: ${landingPage.headline}`);
  console.log(`   CTA: ${landingPage.cta_text}`);
  console.log(`   HTML Length: ${landingPage.html.length} characters`);

  // Social media posts
  console.log('\n📱 Social Media Posts:\n');
  
  const platforms = ['twitter', 'linkedin', 'instagram'] as const;
  platforms.forEach((platform) => {
    const post = SocialMediaAgent.generatePost({
      platform,
      topic: 'Zentix Referral Program',
      tone: 'excited',
    });
    
    console.log(`   ${platform.toUpperCase()}:`);
    console.log(`      ${post.content.slice(0, 100)}...`);
    console.log(`      Hashtags: ${post.hashtags.slice(0, 3).join(', ')}`);
    console.log(`      Est. Engagement: ${post.engagement_estimate}%`);
    console.log('');
  });

  // Email funnel
  const emailFunnel = EmailFunnelAgent.generateOnboardingFunnel('referral');
  console.log('📧 Email Funnel Generated:');
  console.log(`   Name: ${emailFunnel.name}`);
  console.log(`   Emails: ${emailFunnel.emails.length}`);
  console.log(`   Goal: ${emailFunnel.conversion_goal}`);
  emailFunnel.emails.forEach((email, i) => {
    console.log(`      ${i + 1}. ${email.subject} (Day ${email.delay_days})`);
  });

  console.log('\n\n═'.repeat(60));
  console.log('✨ Referral System Demo Complete!');
  console.log('\n💡 Key Features:');
  console.log('   ✅ Multi-tier reward system');
  console.log('   ✅ Viral growth mechanics');
  console.log('   ✅ Real-time analytics');
  console.log('   ✅ Auto-generated marketing content');
  console.log('   ✅ Zero-cost passive income\n');
}

main().catch(console.error);
