import { RewardCard } from '@/components/quantum/RewardCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Trophy, Star } from 'lucide-react';
import { mockRewards } from '@/data/quantumMockData';

export function QuantumRewards() {
  const handleClaimReward = (rewardId: string) => {
    console.log('Claim reward:', rewardId);
  };

  const earnedRewards = mockRewards.filter(r => r.earned);
  const totalRewards = mockRewards.length;
  const completionRate = (earnedRewards.length / totalRewards) * 100;

  const claimableRewards = earnedRewards.filter(r => r.claimable);
  const totalClaimableValue = claimableRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-quantum-text-primary">Rewards & Achievements</h1>
        <p className="text-quantum-text-muted mt-1">Earn rewards for protocol participation</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-quantum-surface border-quantum-border">
          <CardHeader>
            <CardTitle className="text-sm text-quantum-text-secondary">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-quantum-cyan">{earnedRewards.length}/{totalRewards}</div>
            <Progress value={completionRate} className="h-2 bg-quantum-border mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-quantum-surface border-quantum-border">
          <CardHeader>
            <CardTitle className="text-sm text-quantum-text-secondary">Claimable Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-consciousness-fulfilled font-mono-code">
              {totalClaimableValue.toLocaleString()}
            </div>
            <div className="text-xs text-quantum-text-muted mt-1">
              {claimableRewards.length} reward{claimableRewards.length !== 1 ? 's' : ''} ready
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-surface border-quantum-border">
          <CardHeader>
            <CardTitle className="text-sm text-quantum-text-secondary">Achievement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <div className="text-3xl font-bold text-quantum-purple">
                {Math.round(completionRate)}
              </div>
            </div>
            <div className="text-xs text-quantum-text-muted mt-1">Completion rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-quantum-cyan" />
          <h2 className="text-xl font-semibold text-quantum-text-primary">Available Rewards</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onClaim={handleClaimReward} />
          ))}
        </div>
      </div>
    </div>
  );
}