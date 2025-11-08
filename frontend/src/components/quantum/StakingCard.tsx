import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Coins, TrendingUp, Clock } from 'lucide-react';
import type { StakingInfo } from '@/data/quantumMockData';
import { formatTimestamp } from '@/utils/quantumFormatters';

interface StakingCardProps {
  staking: StakingInfo;
  onStake?: () => void;
  onUnstake?: () => void;
  onClaimRewards?: () => void;
}

export function StakingCard({ staking, onStake, onUnstake, onClaimRewards }: StakingCardProps) {
  const isLocked = staking.unlockDate && new Date() < staking.unlockDate;
  const daysUntilUnlock = staking.unlockDate 
    ? Math.ceil((staking.unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card className="bg-quantum-surface border-quantum-border border-quantum-cyan glow-cyan">
      <CardHeader>
        <CardTitle className="text-quantum-text-primary flex items-center gap-2">
          <Coins className="w-5 h-5 text-quantum-cyan" />
          Staking Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Staked Amount */}
        <div>
          <div className="text-xs text-quantum-text-muted mb-1">Total Staked</div>
          <div className="text-3xl font-bold text-quantum-cyan font-mono-code">
            {staking.stakedAmount} ZTX
          </div>
        </div>

        {/* APR */}
        <div className="flex items-center justify-between p-3 bg-quantum-bg rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-consciousness-fulfilled" />
            <span className="text-sm text-quantum-text-secondary">Annual APR</span>
          </div>
          <span className="text-lg font-bold text-consciousness-fulfilled">
            {staking.apr}%
          </span>
        </div>

        {/* Rewards Earned */}
        <div>
          <div className="text-xs text-quantum-text-muted mb-2">Rewards Earned</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-quantum-purple font-mono-code">
              {staking.rewardsEarned} ZTX
            </div>
            <Button
              onClick={onClaimRewards}
              className="bg-quantum-purple text-quantum-bg hover:bg-quantum-purple/90"
            >
              Claim Rewards
            </Button>
          </div>
        </div>

        {/* Lock Period */}
        {isLocked && staking.unlockDate && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-quantum-text-muted">
                <Clock className="w-4 h-4" />
                <span>Lock Period: {staking.lockPeriod}</span>
              </div>
              <span className="text-quantum-cyan">{daysUntilUnlock} days left</span>
            </div>
            <Progress 
              value={(90 - daysUntilUnlock) / 90 * 100} 
              className="h-2 bg-quantum-border"
            />
            <div className="text-xs text-quantum-text-muted">
              Unlocks: {formatTimestamp(staking.unlockDate)}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onStake}
            variant="outline"
            className="flex-1 border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan hover:text-quantum-bg"
          >
            Stake More
          </Button>
          <Button
            onClick={onUnstake}
            variant="outline"
            disabled={isLocked}
            className="flex-1 border-quantum-border text-quantum-text-secondary hover:bg-quantum-border disabled:opacity-50"
          >
            {isLocked ? 'Locked' : 'Unstake'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}