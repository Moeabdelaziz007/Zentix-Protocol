import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Wallet, Copy, ExternalLink } from 'lucide-react';
import type { WalletInfo } from '@/data/quantumMockData';
import { WalletStatus } from '@/data/quantumMockData';

interface WalletConnectProps {
  wallet: WalletInfo | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ wallet, onConnect, onDisconnect }: WalletConnectProps) {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
    }
  };

  if (!wallet || wallet.status === WalletStatus.DISCONNECTED) {
    return (
      <Button
        onClick={onConnect}
        className="bg-quantum-cyan text-quantum-bg hover:bg-quantum-cyan/90 glow-cyan"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-quantum-surface border border-quantum-border rounded-lg px-4 py-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-consciousness-fulfilled/20 text-consciousness-fulfilled border-consciousness-fulfilled">
          {wallet.chainName}
        </Badge>
        <span className="text-quantum-text-primary font-mono-code">
          {shortenAddress(wallet.address)}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={copyAddress}
          className="p-1 hover:bg-quantum-border rounded transition-colors"
          title="Copy address"
        >
          <Copy className="w-4 h-4 text-quantum-text-muted" />
        </button>
        <a
          href={`https://optimistic.etherscan.io/address/${wallet.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:bg-quantum-border rounded transition-colors"
          title="View on explorer"
        >
          <ExternalLink className="w-4 h-4 text-quantum-text-muted" />
        </a>
      </div>

      <div className="border-l border-quantum-border pl-3 ml-1">
        <div className="text-sm text-quantum-text-muted">Balance</div>
        <div className="text-quantum-cyan font-semibold">{wallet.balance} ETH</div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onDisconnect}
        className="border-quantum-border text-quantum-text-secondary hover:bg-quantum-border"
      >
        Disconnect
      </Button>
    </div>
  );
}