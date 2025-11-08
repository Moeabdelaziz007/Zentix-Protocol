import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Coins } from 'lucide-react';
import type { TokenBalance, TokenType } from '@/data/quantumMockData';

interface TokenCardProps {
  token: TokenBalance;
}

const tokenTypeColors: Record<TokenType, string> = {
  Governance: 'bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan',
  Utility: 'bg-quantum-purple/20 text-quantum-purple border-quantum-purple',
  Reward: 'bg-consciousness-fulfilled/20 text-consciousness-fulfilled border-consciousness-fulfilled'
};

export function TokenCard({ token }: TokenCardProps) {
  return (
    <Card className="bg-quantum-surface border-quantum-border hover:border-quantum-cyan transition-all hover:glow-cyan">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-quantum-cyan" />
            <CardTitle className="text-quantum-text-primary">{token.symbol}</CardTitle>
          </div>
          <Badge variant="outline" className={tokenTypeColors[token.type]}>
            {token.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-quantum-text-muted mb-1">{token.name}</div>
          <div className="text-2xl font-bold text-quantum-text-primary font-mono-code">
            {token.balance}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-consciousness-fulfilled" />
          <span className="text-quantum-text-secondary">{token.value}</span>
        </div>
      </CardContent>
    </Card>
  );
}