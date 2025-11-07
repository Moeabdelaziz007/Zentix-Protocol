import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Trophy, 
  Users, 
  Star, 
  Zap, 
  Crown, 
  Medal, 
  Target, 
  Gift, 
  Share2, 
  Copy, 
  Check,
  ExternalLink,
  Calendar,
  Award,
  Flame,
  Heart,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface GrowthProfile {
  userId: string;
  xp: number;
  level: number;
  achievements: string[];
  referralCode: string;
  referralCount: number;
  activeReferrals: number;
  totalRewardsEarned: number;
  lastActive: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  zxtReward: number;
  deadline?: string;
  isActive: boolean;
  completed: boolean;
}

interface LeaderboardUser {
  userId: string;
  username: string;
  score: number;
  rank: number;
  change: number;
}

interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  createdAt: string;
  status: 'pending' | 'active' | 'inactive';
  rewardsEarned: number;
}

interface TrendingItem {
  id: string;
  title: string;
  description: string;
  type: 'agent' | 'app' | 'applet';
  popularity: number;
  creatorId: string;
  createdAt: string;
}

export function AgoraHubApp() {
  const [activeTab, setActiveTab] = useState<'trending' | 'challenges' | 'leaderboard' | 'referrals'>('trending');
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    rewardsEarned: 0,
    referralLink: '',
    copied: false
  });
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch growth profile
        const profileResponse = await fetch('/api/growth/profile');
        if (profileResponse.ok) {
          const profile: GrowthProfile = await profileResponse.json();
          setXp(profile.xp);
          setReferralStats(prev => ({
            ...prev,
            referralLink: `https://zentixos.com/ref/${profile.referralCode}`
          }));
        }
        
        // Fetch trending items
        const trendingResponse = await fetch('/api/growth/trending?limit=10');
        if (trendingResponse.ok) {
          const items: TrendingItem[] = await trendingResponse.json();
          // Convert to the format used in the UI
          const formattedItems = items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            popularity: item.popularity || Math.floor(Math.random() * 30) + 70, // Mock popularity
            creatorId: item.creatorId,
            createdAt: new Date(item.createdAt).toLocaleDateString()
          }));
          setTrendingItems(formattedItems);
        }
        
        // Fetch challenges
        const challengesResponse = await fetch('/api/growth/challenges');
        if (challengesResponse.ok) {
          const challengeData: Challenge[] = await challengesResponse.json();
          // Convert to the format used in the UI
          const formattedChallenges = challengeData.map(challenge => ({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            xpReward: challenge.xpReward,
            zxtReward: challenge.zxtReward,
            deadline: challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'Ongoing',
            isActive: challenge.isActive,
            completed: false // In a real implementation, this would be based on user progress
          }));
          setChallenges(formattedChallenges);
        }
        
        // Fetch leaderboard
        const leaderboardResponse = await fetch('/api/growth/leaderboard?limit=10');
        if (leaderboardResponse.ok) {
          const leaderboardData: LeaderboardUser[] = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
        
        // Fetch referrals
        const referralsResponse = await fetch('/api/growth/referrals');
        if (referralsResponse.ok) {
          const referralsData: Referral[] = await referralsResponse.json();
          const activeReferrals = referralsData.filter(r => r.status === 'active').length;
          const totalRewards = referralsData.reduce((sum, r) => sum + r.rewardsEarned, 0);
          
          setReferralStats(prev => ({
            ...prev,
            totalReferrals: referralsData.length,
            activeReferrals,
            rewardsEarned: totalRewards
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
        
        // Use mock data on error
        setTrendingItems([
          {
            id: '1',
            title: 'Social Media Content Engine',
            description: 'Generate daily creative posts for Twitter and Instagram',
            type: 'applet',
            popularity: 95,
            creatorId: 'user_alex123',
            createdAt: '2023-06-15'
          },
          {
            id: '2',
            title: 'Customer Support Agent',
            description: '24/7 automated customer service bot',
            type: 'agent',
            popularity: 88,
            creatorId: 'user_maria456',
            createdAt: '2023-06-10'
          },
          {
            id: '3',
            title: 'Email Sorter',
            description: 'Automatically categorize incoming emails',
            type: 'applet',
            popularity: 82,
            creatorId: 'user_david789',
            createdAt: '2023-06-05'
          },
          {
            id: '4',
            title: 'YouTube Content Generator',
            description: 'Create video ideas based on trending topics',
            type: 'app',
            popularity: 79,
            creatorId: 'user_sarah012',
            createdAt: '2023-06-01'
          }
        ]);

        setLeaderboard([
          {
            userId: 'user_alex123',
            username: 'Alex Johnson',
            score: 12500,
            rank: 1,
            change: 2
          },
          {
            userId: 'user_maria456',
            username: 'Maria Garcia',
            score: 11200,
            rank: 2,
            change: -1
          },
          {
            userId: 'user_david789',
            username: 'David Chen',
            score: 9800,
            rank: 3,
            change: 1
          },
          {
            userId: 'user_sarah012',
            username: 'Sarah Williams',
            score: 8750,
            rank: 4,
            change: 0
          },
          {
            userId: 'user_current',
            username: 'You',
            score: 3420,
            rank: 127,
            change: 5
          }
        ]);

        setChallenges([
          {
            id: '1',
            title: 'Create a Telegram Bot',
            description: 'Build a customer service bot for Telegram this week',
            xpReward: 500,
            zxtReward: 25,
            deadline: '2023-06-30',
            isActive: true,
            completed: false
          },
          {
            id: '2',
            title: 'Build a Content Generator',
            description: 'Create an app that generates social media content',
            xpReward: 750,
            zxtReward: 50,
            deadline: '2023-07-07',
            isActive: true,
            completed: true
          },
          {
            id: '3',
            title: 'Design a Travel Planner',
            description: 'Build an AI-powered travel itinerary planner',
            xpReward: 1000,
            zxtReward: 75,
            deadline: '2023-07-14',
            isActive: true,
            completed: false
          }
        ]);
      }
    };

    fetchData();
  }, []);



  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralStats.referralLink);
    setReferralStats({...referralStats, copied: true});
    setTimeout(() => {
      setReferralStats({...referralStats, copied: false});
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent': return <Zap className="w-4 h-4" />;
      case 'app': return <ExternalLink className="w-4 h-4" />;
      case 'applet': return <Star className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agent': return 'bg-blue-500/10 text-blue-500';
      case 'app': return 'bg-purple-500/10 text-purple-500';
      case 'applet': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Agora Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              The Pulse of the Ecosystem. Where contribution is celebrated, and growth is the game.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-foreground">{xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'challenges', label: 'Challenges', icon: Target },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'referrals', label: 'Referrals', icon: Share2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'trending' | 'challenges' | 'leaderboard' | 'referrals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-background/50 border border-border/50 hover:bg-background/70'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Loading Agora Hub...</h3>
              <p className="text-muted-foreground">Fetching the latest community data</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Error loading data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Trending Section */}
            {activeTab === 'trending' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Top Agents</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-500 mb-1">24</div>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </GlassCard>
                  
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <ExternalLink className="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Popular Apps</h3>
                    </div>
                    <div className="text-3xl font-bold text-purple-500 mb-1">18</div>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </GlassCard>
                  
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Star className="w-5 h-5 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Active Applets</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-500 mb-1">42</div>
                    <p className="text-sm text-muted-foreground">This week</p>
                  </GlassCard>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Trending This Week</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {trendingItems.map(item => (
                      <GlassCard key={item.id} className="p-4 hover:scale-[1.02] transition-transform">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                              {getTypeIcon(item.type)}
                              <span className="ml-1 capitalize">{item.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">{item.popularity}%</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            by {item.creatorId}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{item.createdAt}</span>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Challenges Section */}
            {activeTab === 'challenges' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Weekly Challenges</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>Complete challenges to earn XP</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map(challenge => (
                    <GlassCard key={challenge.id} className={`p-6 ${challenge.completed ? 'border-green-500/30' : ''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${challenge.completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                          {challenge.completed ? (
                            <Check className="w-6 h-6 text-green-500" />
                          ) : (
                            <Target className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        {challenge.completed && (
                          <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                            Completed
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold mb-2">{challenge.title}</h4>
                      <p className="text-muted-foreground text-sm mb-4">{challenge.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">+{challenge.xpReward} XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Due {challenge.deadline}</span>
                        </div>
                      </div>
                      
                      <button 
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          challenge.completed 
                            ? 'bg-green-500/20 text-green-500 cursor-not-allowed' 
                            : 'bg-primary/20 hover:bg-primary/30 text-primary'
                        }`}
                        disabled={challenge.completed}
                      >
                        {challenge.completed ? 'Challenge Completed' : 'Accept Challenge'}
                      </button>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard Section */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Community Leaderboards</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>Ranked by XP</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Creators Leaderboard */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <h4 className="text-lg font-semibold">Top Creators</h4>
                    </div>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map(user => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                              user.rank === 2 ? 'bg-gray-500/20 text-gray-500' :
                              user.rank === 3 ? 'bg-amber-800/20 text-amber-800' :
                              'bg-background/50'
                            }`}>
                              {user.rank}
                            </div>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{user.score.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  
                  {/* Wealthiest Users */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Medal className="w-5 h-5 text-purple-500" />
                      <h4 className="text-lg font-semibold">Wealthiest Users</h4>
                    </div>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map(user => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                              user.rank === 2 ? 'bg-gray-500/20 text-gray-500' :
                              user.rank === 3 ? 'bg-amber-800/20 text-amber-800' :
                              'bg-background/50'
                            }`}>
                              {user.rank}
                            </div>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Gift className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">1,250 ZXT</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  
                  {/* Top Engineers */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-blue-500" />
                      <h4 className="text-lg font-semibold">Top Engineers</h4>
                    </div>
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map(user => (
                        <div key={user.userId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                              user.rank === 2 ? 'bg-gray-500/20 text-gray-500' :
                              user.rank === 3 ? 'bg-amber-800/20 text-amber-800' :
                              'bg-background/50'
                            }`}>
                              {user.rank}
                            </div>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">98%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* Referrals Section */}
            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Referral Program</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Share & Earn</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <GlassCard className="p-6 text-center">
                    <div className="p-3 bg-blue-500/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{referralStats.totalReferrals}</div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                  </GlassCard>
                  
                  <GlassCard className="p-6 text-center">
                    <div className="p-3 bg-green-500/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{referralStats.activeReferrals}</div>
                    <p className="text-sm text-muted-foreground">Active Referrals</p>
                  </GlassCard>
                  
                  <GlassCard className="p-6 text-center">
                    <div className="p-3 bg-purple-500/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{referralStats.rewardsEarned} ZXT</div>
                    <p className="text-sm text-muted-foreground">Rewards Earned</p>
                  </GlassCard>
                </div>
                
                <GlassCard className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Your Referral Link</h4>
                  <div className="flex gap-3">
                    <div className="flex-1 px-4 py-3 bg-background/50 rounded-lg border border-border font-mono text-sm">
                      {referralStats.referralLink}
                    </div>
                    <button
                      onClick={copyReferralLink}
                      className="px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors flex items-center gap-2"
                    >
                      {referralStats.copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <h5 className="font-medium mb-3">How it works:</h5>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Share your referral link</p>
                          <p className="text-sm text-muted-foreground">Invite friends to join ZentixOS</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium">They sign up</p>
                          <p className="text-sm text-muted-foreground">Both you and your friend get 10 ZXT + 100 XP</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium">They become successful creators</p>
                          <p className="text-sm text-muted-foreground">Get additional royalty bonuses when they reach Gold tier</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}