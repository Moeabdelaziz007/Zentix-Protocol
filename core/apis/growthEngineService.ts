import { ZentixID } from '../identity/zentixID';
import { Wallet } from '../economy/walletService';

/**
 * Growth Engine Service
 * Handles the Zentix Growth Engine features including XP tracking, challenges, leaderboards, and referrals
 */

// User profile with growth metrics
export interface GrowthProfile {
  userId: string;
  xp: number;
  level: number;
  achievements: string[];
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  activeReferrals: number;
  totalRewardsEarned: number;
  lastActive: string;
}

// Challenge definition
export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  zxtReward: number;
  criteria: any;
  deadline?: string;
  isActive: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  change: number;
}

// Referral record
export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  createdAt: string;
  status: 'pending' | 'active' | 'inactive';
  rewardsEarned: number;
}

// Trending item
export interface TrendingItem {
  id: string;
  title: string;
  description: string;
  type: 'agent' | 'app' | 'applet';
  popularity: number;
  creatorId: string;
  createdAt: string;
}

// In-memory storage for demo purposes
// In a real implementation, this would be stored in a database
const growthProfiles: Map<string, GrowthProfile> = new Map();
const challenges: Map<string, Challenge> = new Map();
const referrals: Map<string, Referral> = new Map();
const trendingItems: Map<string, TrendingItem> = new Map();

/**
 * Initialize a user's growth profile
 */
export const initializeGrowthProfile = async (userId: string): Promise<GrowthProfile> => {
  const profile: GrowthProfile = {
    userId,
    xp: 0,
    level: 1,
    achievements: [],
    referralCode: generateReferralCode(userId),
    referralCount: 0,
    activeReferrals: 0,
    totalRewardsEarned: 0,
    lastActive: new Date().toISOString()
  };
  
  growthProfiles.set(userId, profile);
  return profile;
};

/**
 * Get a user's growth profile
 */
export const getGrowthProfile = async (userId: string): Promise<GrowthProfile | undefined> => {
  return growthProfiles.get(userId);
};

/**
 * Award XP to a user
 */
export const awardXP = async (userId: string, amount: number, reason: string): Promise<GrowthProfile> => {
  let profile = growthProfiles.get(userId);
  
  if (!profile) {
    profile = await initializeGrowthProfile(userId);
  }
  
  profile.xp += amount;
  profile.lastActive = new Date().toISOString();
  
  // Check for level up
  const newLevel = calculateLevel(profile.xp);
  if (newLevel > profile.level) {
    profile.level = newLevel;
    // Award level up achievement
    profile.achievements.push(`level_${newLevel}`);
  }
  
  growthProfiles.set(userId, profile);
  
  // Log the XP award
  console.log(`Awarded ${amount} XP to user ${userId} for ${reason}`);
  
  return profile;
};

/**
 * Calculate user level based on XP
 */
const calculateLevel = (xp: number): number => {
  // Simple level calculation: level = sqrt(xp / 100) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Generate a unique referral code
 */
const generateReferralCode = (userId: string): string => {
  // Simple referral code generation
  return `ref_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
};

/**
 * Get referral code for a user
 */
export const getReferralCode = async (userId: string): Promise<string> => {
  const profile = growthProfiles.get(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  return profile.referralCode;
};

/**
 * Process a referral
 */
export const processReferral = async (
  referrerId: string, 
  referredId: string, 
  referralCode: string
): Promise<{ success: boolean; message: string; rewards: { referrer: number; referred: number } }> => {
  // Verify referral code
  const referrerProfile = growthProfiles.get(referrerId);
  if (!referrerProfile || referrerProfile.referralCode !== referralCode) {
    return {
      success: false,
      message: 'Invalid referral code',
      rewards: { referrer: 0, referred: 0 }
    };
  }
  
  // Check if referral already exists
  for (const [_, referral] of referrals) {
    if (referral.referredId === referredId) {
      return {
        success: false,
        message: 'User already referred',
        rewards: { referrer: 0, referred: 0 }
      };
    }
  }
  
  // Create referral record
  const referral: Referral = {
    id: `ref_${Date.now()}`,
    referrerId,
    referredId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    rewardsEarned: 0
  };
  
  referrals.set(referral.id, referral);
  
  // Update referrer profile
  referrerProfile.referralCount += 1;
  growthProfiles.set(referrerId, referrerProfile);
  
  // Award initial referral rewards (10 ZXT + 100 XP for both parties)
  const referrerWallet = new Wallet(`ztw:${referrerId}`);
  const referredWallet = new Wallet(`ztw:${referredId}`);
  
  await referrerWallet.deposit(10, 'ZXT', 'Referral reward');
  await referredWallet.deposit(10, 'ZXT', 'Referral reward');
  
  await awardXP(referrerId, 100, 'Referral bonus');
  await awardXP(referredId, 100, 'Referral bonus');
  
  // Update referral record with rewards
  referral.rewardsEarned = 10;
  referral.status = 'active';
  referrals.set(referral.id, referral);
  
  return {
    success: true,
    message: 'Referral processed successfully',
    rewards: { referrer: 10, referred: 10 }
  };
};

/**
 * Get user's referrals
 */
export const getUserReferrals = async (userId: string): Promise<Referral[]> => {
  const userReferrals: Referral[] = [];
  
  referrals.forEach(referral => {
    if (referral.referrerId === userId) {
      userReferrals.push(referral);
    }
  });
  
  return userReferrals;
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  const entries: LeaderboardEntry[] = [];
  
  // Convert map to array and sort by XP
  const profiles = Array.from(growthProfiles.values());
  profiles.sort((a, b) => b.xp - a.xp);
  
  // Create leaderboard entries
  profiles.slice(0, limit).forEach((profile, index) => {
    entries.push({
      userId: profile.userId,
      username: `User_${profile.userId.substring(0, 8)}`,
      score: profile.xp,
      rank: index + 1,
      change: 0 // In a real implementation, this would track rank changes
    });
  });
  
  return entries;
};

/**
 * Get available challenges
 */
export const getAvailableChallenges = async (): Promise<Challenge[]> => {
  const availableChallenges: Challenge[] = [];
  
  challenges.forEach(challenge => {
    if (challenge.isActive) {
      availableChallenges.push(challenge);
    }
  });
  
  return availableChallenges;
};

/**
 * Complete a challenge
 */
export const completeChallenge = async (
  userId: string, 
  challengeId: string
): Promise<{ success: boolean; message: string; rewards: { xp: number; zxt: number } }> => {
  const challenge = challenges.get(challengeId);
  if (!challenge || !challenge.isActive) {
    return {
      success: false,
      message: 'Challenge not found or inactive',
      rewards: { xp: 0, zxt: 0 }
    };
  }
  
  // Award rewards
  await awardXP(userId, challenge.xpReward, `Challenge completion: ${challenge.title}`);
  
  const wallet = new Wallet(`ztw:${userId}`);
  await wallet.deposit(challenge.zxtReward, 'ZXT', `Challenge completion: ${challenge.title}`);
  
  return {
    success: true,
    message: 'Challenge completed successfully',
    rewards: { xp: challenge.xpReward, zxt: challenge.zxtReward }
  };
};

/**
 * Add a trending item
 */
export const addTrendingItem = async (item: Omit<TrendingItem, 'id'>): Promise<TrendingItem> => {
  const trendingItem: TrendingItem = {
    ...item,
    id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  trendingItems.set(trendingItem.id, trendingItem);
  return trendingItem;
};

/**
 * Get trending items
 */
export const getTrendingItems = async (limit: number = 10): Promise<TrendingItem[]> => {
  // In a real implementation, this would sort by popularity metrics
  // For now, we'll just return the most recently added items
  const items = Array.from(trendingItems.values());
  return items.slice(-limit).reverse();
};

/**
 * Initialize default challenges
 */
export const initializeDefaultChallenges = async (): Promise<void> => {
  const defaultChallenges: Challenge[] = [
    {
      id: 'challenge_1',
      title: 'Create a Telegram Bot',
      description: 'Build a customer service bot for Telegram this week',
      xpReward: 500,
      zxtReward: 25,
      criteria: { type: 'agent', tags: ['telegram', 'customer-service'] },
      isActive: true
    },
    {
      id: 'challenge_2',
      title: 'Build a Content Generator',
      description: 'Create an app that generates social media content',
      xpReward: 750,
      zxtReward: 50,
      criteria: { type: 'app', tags: ['content', 'social-media'] },
      isActive: true
    },
    {
      id: 'challenge_3',
      title: 'Design a Travel Planner',
      description: 'Build an AI-powered travel itinerary planner',
      xpReward: 1000,
      zxtReward: 75,
      criteria: { type: 'applet', tags: ['travel', 'ai'] },
      isActive: true
    }
  ];
  
  defaultChallenges.forEach(challenge => {
    challenges.set(challenge.id, challenge);
  });
};

// Initialize default challenges
initializeDefaultChallenges().catch(console.error);