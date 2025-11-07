import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/GlassCard';

interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  variant?: 'default' | 'glass' | 'gradient-border';
}

export function EnhancedStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  sparklineData,
  variant = 'gradient-border',
}: EnhancedStatCardProps) {
  return (
    <GlassCard variant={variant} className="relative overflow-hidden group" glow>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {icon && (
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <div className="text-6xl text-primary">{icon}</div>
        </div>
      )}
      
      <GlassCardHeader>
        <GlassCardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </GlassCardTitle>
      </GlassCardHeader>
      
      <GlassCardContent>
        <div className="space-y-4 relative z-10">
          <div className="flex items-baseline justify-between">
            <div className="text-4xl font-bold gradient-text animate-scale-in">
              {value}
            </div>
            {trend && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  trend.isPositive 
                    ? 'bg-success/10 text-success' 
                    : 'bg-error/10 text-error'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
          )}
          
          {sparklineData && (
            <div className="h-14 flex items-end gap-1 pt-2">
              {sparklineData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-primary/30 to-primary/60 rounded-t transition-all duration-300 hover:from-primary/50 hover:to-primary/80 animate-slide-in-up"
                  style={{
                    height: `${(value / Math.max(...sparklineData)) * 100}%`,
                    animationDelay: `${index * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}