import { randomBytes } from 'crypto';
import type { AnalyticsEvent, AgentActivity, RewardTracking, Referral, MicroInvestment } from '../types';

/**
 * Analytics Dashboard Service
 * User activity tracking and insights
 * 
 * @module analyticsDashboard
 * @version 1.0.0
 */

/**
 * User dashboard summary
 */
export interface DashboardSummary {
  user_did: string;
  total_rewards_earned: number;
  active_investments: number;
  total_referrals: number;
  pending_rewards: number;
  activities_this_week: number;
  portfolio_value: number;
  rank: number;
  badges: string[];
}

/**
 * Activity timeline item
 */
export interface TimelineItem {
  id: string;
  type: 'reward' | 'referral' | 'investment' | 'achievement';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  icon: string;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  period: '7d' | '30d' | '90d' | 'all';
  total_earnings: number;
  avg_daily_earnings: number;
  best_day: { date: string; amount: number };
  growth_rate: number; // percentage
  earnings_by_source: Record<string, number>;
  investment_performance: {
    total_invested: number;
    current_value: number;
    total_return: number;
    roi_percentage: number;
  };
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  user_did: string;
  display_name?: string;
  total_rewards: number;
  referrals_count: number;
  badge: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

/**
 * AnalyticsDashboard - Comprehensive user analytics
 */
export class AnalyticsDashboard {
  /**
   * Generate user dashboard summary
   * 
   * @param userDID - User's DID
   * @param rewards - User's reward history
   * @param investments - User's investments
   * @param referrals - User's referrals
   * @param activities - User's activities
   * @returns Dashboard summary
   */
  static generateDashboardSummary(
    userDID: string,
    rewards: RewardTracking[],
    investments: MicroInvestment[],
    referrals: Referral[],
    activities: AgentActivity[]
  ): DashboardSummary {
    const totalRewards = rewards
      .filter((r) => r.status === 'processed' || r.status === 'claimed')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingRewards = rewards
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    const activeInvestments = investments.filter((i) => i.status === 'active').length;

    const portfolioValue = investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + i.current_value, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const activitiesThisWeek = activities.filter(
      (a) => new Date(a.timestamp) >= weekAgo
    ).length;

    const badges = this.calculateBadges(totalRewards, referrals.length, activeInvestments);

    return {
      user_did: userDID,
      total_rewards_earned: totalRewards,
      active_investments: activeInvestments,
      total_referrals: referrals.filter((r) => r.status === 'completed').length,
      pending_rewards: pendingRewards,
      activities_this_week: activitiesThisWeek,
      portfolio_value: portfolioValue,
      rank: 0, // Calculate from leaderboard
      badges,
    };
  }

  /**
   * Generate activity timeline
   * 
   * @param activities - User activities
   * @param rewards - User rewards
   * @param referrals - User referrals
   * @param limit - Max items to return
   * @returns Timeline items
   */
  static generateTimeline(
    activities: AgentActivity[],
    rewards: RewardTracking[],
    referrals: Referral[],
    limit = 20
  ): TimelineItem[] {
    const timeline: TimelineItem[] = [];

    // Add activities
    activities.forEach((a) => {
      timeline.push({
        id: a.id,
        type: a.activity_type === 'referral' ? 'referral' : 'reward',
        title: a.description,
        description: `Earned ${a.reward_earned} ZXT`,
        amount: a.reward_earned,
        timestamp: a.timestamp,
        icon: this.getIconForActivity(a.activity_type),
      });
    });

    // Add referrals
    referrals.forEach((r) => {
      if (r.status === 'completed') {
        timeline.push({
          id: r.id,
          type: 'referral',
          title: 'Referral Completed',
          description: `${r.tier} tier - ${r.reward_amount} ZXT`,
          amount: r.reward_amount,
          timestamp: r.completed_at || r.created_at,
          icon: '👥',
        });
      }
    });

    // Add milestone achievements
    if (rewards.length === 1) {
      timeline.push({
        id: randomBytes(8).toString('hex'),
        type: 'achievement',
        title: '🎉 First Reward!',
        description: 'You earned your first reward on Zentix',
        timestamp: rewards[0].created_at,
        icon: '🏆',
      });
    }

    // Sort by timestamp and limit
    return timeline
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Calculate performance metrics
   * 
   * @param rewards - User rewards
   * @param investments - User investments
   * @param period - Time period
   * @returns Performance metrics
   */
  static calculatePerformance(
    rewards: RewardTracking[],
    investments: MicroInvestment[],
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): PerformanceMetrics {
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 99999;
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const periodRewards = rewards.filter(
      (r) => new Date(r.created_at) >= cutoffDate && (r.status === 'processed' || r.status === 'claimed')
    );

    const totalEarnings = periodRewards.reduce((sum, r) => sum + r.amount, 0);
    const avgDailyEarnings = totalEarnings / periodDays;

    // Find best day
    const earningsByDay = periodRewards.reduce((acc, r) => {
      const day = r.created_at.split('T')[0];
      acc[day] = (acc[day] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    const bestDay = Object.entries(earningsByDay).reduce(
      (best, [date, amount]) => (amount > best.amount ? { date, amount } : best),
      { date: '', amount: 0 }
    );

    // Earnings by source
    const earningsBySource = periodRewards.reduce((acc, r) => {
      acc[r.reward_type] = (acc[r.reward_type] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

    // Investment performance
    const totalInvested = investments.reduce((sum, i) => sum + i.initial_amount, 0);
    const currentValue = investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + i.current_value, 0);
    const totalReturn = currentValue - totalInvested;
    const roiPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Growth rate (compare first half vs second half of period)
    const midpoint = new Date(cutoffDate.getTime() + (now.getTime() - cutoffDate.getTime()) / 2);
    const firstHalf = periodRewards.filter((r) => new Date(r.created_at) < midpoint);
    const secondHalf = periodRewards.filter((r) => new Date(r.created_at) >= midpoint);
    const firstHalfTotal = firstHalf.reduce((sum, r) => sum + r.amount, 0);
    const secondHalfTotal = secondHalf.reduce((sum, r) => sum + r.amount, 0);
    const growthRate = firstHalfTotal > 0 ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100 : 0;

    return {
      period,
      total_earnings: totalEarnings,
      avg_daily_earnings: avgDailyEarnings,
      best_day: bestDay,
      growth_rate: growthRate,
      earnings_by_source: earningsBySource,
      investment_performance: {
        total_invested: totalInvested,
        current_value: currentValue,
        total_return: totalReturn,
        roi_percentage: roiPercentage,
      },
    };
  }

  /**
   * Generate leaderboard
   * 
   * @param allRewards - All rewards in system
   * @param allReferrals - All referrals in system
   * @param limit - Top N users
   * @returns Leaderboard
   */
  static generateLeaderboard(
    allRewards: RewardTracking[],
    allReferrals: Referral[],
    limit = 100
  ): LeaderboardEntry[] {
    const userStats = new Map<string, { rewards: number; referrals: number }>();

    // Aggregate rewards
    allRewards.forEach((r) => {
      if (r.status === 'processed' || r.status === 'claimed') {
        const current = userStats.get(r.user_did) || { rewards: 0, referrals: 0 };
        userStats.set(r.user_did, {
          ...current,
          rewards: current.rewards + r.amount,
        });
      }
    });

    // Aggregate referrals
    allReferrals.forEach((r) => {
      if (r.status === 'completed') {
        const current = userStats.get(r.referrer_did) || { rewards: 0, referrals: 0 };
        userStats.set(r.referrer_did, {
          ...current,
          referrals: current.referrals + 1,
        });
      }
    });

    // Create leaderboard
    return Array.from(userStats.entries())
      .map(([did, stats]) => ({
        rank: 0, // Will be set after sorting
        user_did: did,
        total_rewards: stats.rewards,
        referrals_count: stats.referrals,
        badge: this.getBadgeForRewards(stats.rewards),
      }))
      .sort((a, b) => b.total_rewards - a.total_rewards)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }

  /**
   * Track analytics event
   * 
   * @param eventType - Type of event
   * @param userDID - User's DID (optional)
   * @param eventData - Event data
   * @returns Analytics event
   */
  static trackEvent(
    eventType: 'page_view' | 'signup' | 'referral_click' | 'reward_claim' | 'investment_start' | 'content_share',
    userDID: string | undefined,
    eventData: Record<string, any> = {}
  ): AnalyticsEvent {
    return {
      id: randomBytes(8).toString('hex'),
      user_did: userDID,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate user badges based on achievements
   */
  private static calculateBadges(totalRewards: number, referrals: number, investments: number): string[] {
    const badges: string[] = [];

    // Reward milestones
    if (totalRewards >= 1000) badges.push('💎 Diamond Earner');
    else if (totalRewards >= 500) badges.push('🥇 Gold Earner');
    else if (totalRewards >= 100) badges.push('🥈 Silver Earner');
    else if (totalRewards >= 10) badges.push('🥉 Bronze Earner');

    // Referral achievements
    if (referrals >= 50) badges.push('🌟 Super Influencer');
    else if (referrals >= 20) badges.push('📢 Influencer');
    else if (referrals >= 5) badges.push('👥 Networker');

    // Investment badges
    if (investments >= 10) badges.push('📈 Portfolio Master');
    else if (investments >= 5) badges.push('💼 Active Investor');
    else if (investments >= 1) badges.push('🌱 Investor');

    return badges;
  }

  /**
   * Get badge tier based on total rewards
   */
  private static getBadgeForRewards(rewards: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
    if (rewards >= 10000) return 'diamond';
    if (rewards >= 5000) return 'platinum';
    if (rewards >= 1000) return 'gold';
    if (rewards >= 100) return 'silver';
    return 'bronze';
  }

  /**
   * Get icon for activity type
   */
  private static getIconForActivity(type: string): string {
    const icons: Record<string, string> = {
      task: '✅',
      referral: '👥',
      arbitrage: '💹',
      investment: '💰',
      content_generation: '✍️',
      monitoring: '👁️',
    };
    return icons[type] || '📊';
  }

  /**
   * Export dashboard data as JSON
   * 
   * @param summary - Dashboard summary
   * @param timeline - Activity timeline
   * @param performance - Performance metrics
   * @returns JSON string
   */
  static exportDashboardData(
    summary: DashboardSummary,
    timeline: TimelineItem[],
    performance: PerformanceMetrics
  ): string {
    return JSON.stringify(
      {
        summary,
        timeline,
        performance,
        exported_at: new Date().toISOString(),
      },
      null,
      2
    );
  }
}
