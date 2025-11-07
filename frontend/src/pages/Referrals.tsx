import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatDate, formatDID } from '../utils/formatters';
import { apiService, type ReferralStats, type LeaderboardEntry } from '../services/api';
import { Users, Gift, TrendingUp, Link2, Mail, Award } from 'lucide-react';

export default function Referrals() {
  const [userDID] = useState('zxdid:zentix:0xUSER123456789ABCDEF0123456789AB');
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      // Generate invite link
      const inviteData = await apiService.generateInviteLink(userDID);
      setReferralCode(inviteData.code);
      setReferralLink(inviteData.link);

      // Get stats
      const pointsData = await apiService.getReferralPoints(userDID);
      setStats(pointsData.stats);

      // Get leaderboard
      const leaderData = await apiService.getReferralLeaderboard(10);
      setLeaderboard(leaderData);
    } catch (error) {
      console.error('Failed to load referral data:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('✅ Copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const sendInvites = async () => {
    if (!inviteEmails.trim()) return;

    setLoading(true);
    try {
      const emails = inviteEmails.split('\n').map(e => e.trim()).filter(Boolean);
      const data = await apiService.sendInvites(userDID, emails);
      
      setMessage(`✅ Sent ${data.sent}/${data.total} invites!`);
      setInviteEmails('');
      loadReferralData();
    } catch (error) {
      setMessage('❌ Failed to send invites');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'text-orange-600',
      silver: 'text-gray-400',
      gold: 'text-yellow-500',
      platinum: 'text-purple-600',
    };
    return colors[tier] || 'text-gray-500';
  };

  const getTierReward = (tier: string) => {
    const rewards: Record<string, number> = {
      bronze: 10,
      silver: 25,
      gold: 50,
      platinum: 100,
    };
    return rewards[tier] || 0;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Referral System</h1>
        {message && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
            {message}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats?.total_referrals || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Completed: {stats?.completed_referrals || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">{stats?.total_rewards_earned || 0} ZXT</div>
            <p className="text-sm text-muted-foreground mt-2">
              Balance: {stats?.current_balance || 0} ZXT
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats?.conversion_rate?.toFixed(1) || 0}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Pending: {stats?.pending_referrals || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Best Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.tier_breakdown && Object.keys(stats.tier_breakdown).length > 0
                ? Object.entries(stats.tier_breakdown).sort((a, b) => b[1] - a[1])[0][0].toUpperCase()
                : 'NONE'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats?.tier_breakdown && Object.keys(stats.tier_breakdown).length > 0
                ? `${Object.entries(stats.tier_breakdown).sort((a, b) => b[1] - a[1])[0][1]} referrals`
                : 'No referrals yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Referral Code</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="flex-1 px-4 py-2 bg-muted rounded-md font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Share Link</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-2 bg-muted rounded-md text-sm"
              />
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Copy
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
              <div key={tier} className="p-4 border border-border rounded-lg">
                <div className={`text-xl font-bold ${getTierColor(tier)} capitalize mb-2`}>
                  {tier}
                </div>
                <div className="text-2xl font-bold mb-1">{getTierReward(tier)} ZXT</div>
                <div className="text-sm text-muted-foreground">
                  {stats?.tier_breakdown?.[tier] || 0} referrals
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Invites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Bulk Invites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
            placeholder="Enter email addresses (one per line)&#10;friend1@example.com&#10;friend2@example.com"
            className="w-full px-4 py-3 bg-muted rounded-md min-h-32 text-sm"
          />
          <button
            onClick={sendInvites}
            disabled={loading || !inviteEmails.trim()}
            className="w-full px-4 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Invites'}
          </button>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-muted-foreground w-8">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </div>
                  <div>
                    <div className="font-mono text-sm">{formatDID(entry.user_did)}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.total_referrals} referrals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-success">{entry.total_rewards} ZXT</div>
                  <div className="text-sm text-muted-foreground capitalize">{entry.badge}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
