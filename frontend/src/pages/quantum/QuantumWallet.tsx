import { WalletConnect } from '@/components/quantum/WalletConnect';
import { TokenCard } from '@/components/quantum/TokenCard';
import { StakingCard } from '@/components/quantum/StakingCard';
import { mockWallet, mockTokenBalances, mockStaking } from '@/data/quantumMockData';

export function QuantumWallet() {
  const handleConnect = () => {
    console.log('Connect wallet');
  };

  const handleDisconnect = () => {
    console.log('Disconnect wallet');
  };

  const handleStake = () => {
    console.log('Stake tokens');
  };

  const handleUnstake = () => {
    console.log('Unstake tokens');
  };

  const handleClaimRewards = () => {
    console.log('Claim staking rewards');
  };

  return (
    <div className="space-y-8">
      {/* Header with Wallet Connect */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-quantum-text-primary">Wallet & Assets</h1>
          <p className="text-quantum-text-muted mt-1">Manage your tokens and staking</p>
        </div>
        <WalletConnect 
          wallet={mockWallet} 
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>

      {/* Token Balances */}
      <div>
        <h2 className="text-xl font-semibold text-quantum-text-primary mb-4">Token Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTokenBalances.map((token) => (
            <TokenCard key={token.symbol} token={token} />
          ))}
        </div>
      </div>

      {/* Staking */}
      <div>
        <h2 className="text-xl font-semibold text-quantum-text-primary mb-4">Staking</h2>
        <div className="max-w-2xl">
          <StakingCard 
            staking={mockStaking}
            onStake={handleStake}
            onUnstake={handleUnstake}
            onClaimRewards={handleClaimRewards}
          />
        </div>
      </div>
    </div>
  );
}