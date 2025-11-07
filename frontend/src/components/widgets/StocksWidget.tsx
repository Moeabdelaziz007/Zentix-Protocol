import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StocksWidgetProps {
  className?: string;
}

export function StocksWidget({ className = '' }: StocksWidgetProps) {
  const stocks: Stock[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.34, changePercent: 1.33 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.67, change: -1.23, changePercent: -0.85 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.89, change: 5.67, changePercent: 1.39 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.56, change: -3.45, changePercent: -1.45 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.23, change: 1.89, changePercent: 1.07 },
  ];

  return (
    <div className={cn('p-6', className)}>
      <h3 className="text-lg font-bold text-foreground mb-4">Market Overview</h3>
      <div className="space-y-3">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{stock.symbol}</p>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">${stock.price.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  stock.change >= 0 ? 'text-success' : 'text-error'
                )}
              >
                {stock.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
              </div>
              <p
                className={cn(
                  'text-xs font-medium',
                  stock.changePercent >= 0 ? 'text-success' : 'text-error'
                )}
              >
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}