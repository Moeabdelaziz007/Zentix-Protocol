import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  animation?: 'pulse' | 'wave' | 'none';
}

export function EnhancedSkeleton({ 
  className, 
  variant = 'rectangular',
  animation = 'wave'
}: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full w-12 h-12',
    rectangular: 'rounded-lg w-full h-24',
    card: 'rounded-xl w-full h-64'
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'shimmer',
    none: ''
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variants[variant],
        animations[animation],
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-background/50 border border-border rounded-xl p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <EnhancedSkeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <EnhancedSkeleton variant="text" className="h-4 w-3/4" />
          <EnhancedSkeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <EnhancedSkeleton variant="rectangular" className="h-32" />
      <div className="flex gap-2">
        <EnhancedSkeleton variant="rectangular" className="h-8 w-20" />
        <EnhancedSkeleton variant="rectangular" className="h-8 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-fade-in">
      <EnhancedSkeleton variant="rectangular" className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <EnhancedSkeleton key={i} variant="rectangular" className="h-16 w-full" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-background/50 border border-border rounded-xl p-6">
            <EnhancedSkeleton variant="text" className="h-3 w-20 mb-2" />
            <EnhancedSkeleton variant="text" className="h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}