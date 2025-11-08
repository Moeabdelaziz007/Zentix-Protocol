import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import type { RewardInfo, RewardTier } from '@/data/quantumMockData';
import { formatTimestamp } from '@/utils/quantumFormatters';

interface RewardCardProps {
  reward: RewardInfo;
  onClaim?: (rewardId: string) => void;
}

const tierColors: Record<RewardTier, string> = {
  Bronze: 'bg-orange-500/20 text-orange-400 border-orange-400',
  Silver: 'bg-slate-400/20 text-slate-300 border-slate-300',
  Gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-400',
  Platinum: 'bg-cyan-400/20 text-cyan-300 border-cyan-300'
};

export function RewardCard({ reward, onClaim }: RewardCardProps) {
  return (
    <Card className={`bg-quantum-surface border-quantum-border ${reward.earned ? 'border-quantum-cyan glow-cyan' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`w-5 h-5 ${reward.earned ? 'text-quantum-cyan' : 'text-quantum-text-muted'}`} />
            <CardTitle className="text-quantum-text-primary">{reward.title}</CardTitle>
          </div>
          <Badge variant="outline" className={tierColors[reward.tier]}>
            {reward.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-quantum-text-secondary">{reward.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-quantum-text-muted">Reward Amount</div>
            <div className="text-xl font-bold text-quantum-cyan font-mono-code">
              {reward.amount} {reward.tokenSymbol}
            </div>
          </div>
          
          {reward.earned && reward.claimable && (
            <Button
              onClick={() => onClaim?.(reward.id)}
              className="bg-quantum-cyan text-quantum-bg hover:bg-quantum-cyan/90"
            >
              Claim Reward
            </Button>
          )}
          
          {reward.earned && !reward.claimable && reward.claimedAt && (
            <div className="flex items-center gap-2 text-consciousness-fulfilled">
              <CheckCircle className="w-4 h-4" />
              <div className="text-xs">
                <div>Claimed</div>
                <div className="text-quantum-text-muted">{formatTimestamp(reward.claimedAt)}</div>
              </div>
            </div>
          )}
          
          {!reward.earned && (
            <div className="flex items-center gap-2 text-quantum-text-muted">
              <Lock className="w-4 h-4" />
              <span className="text-xs">Locked</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}