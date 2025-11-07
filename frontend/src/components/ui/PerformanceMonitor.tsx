import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, X } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { cn } from '@/lib/utils';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(enabled);
  const [isExpanded, setIsExpanded] = useState(false);
  const metrics = usePerformanceMonitor('App');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-success';
    if (fps >= 30) return 'text-warning';
    return 'text-error';
  };

  return (
    <div
      className={cn(
        'fixed z-50 glass-card shadow-lg transition-all',
        positionClasses[position],
        isExpanded ? 'w-64' : 'w-auto'
      )}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <Activity className="w-4 h-4" />
            {isExpanded && <span>Performance</span>}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Close performance monitor"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">FPS</span>
              </div>
              <span className={cn('font-mono font-semibold', getFPSColor(metrics.fps))}>
                {metrics.fps}
              </span>
            </div>

            {metrics.memory && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Memory</span>
                </div>
                <span className="font-mono font-semibold">
                  {metrics.memory.toFixed(1)} MB
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">Render</span>
              </div>
              <span className="font-mono font-semibold">
                {metrics.renderTime.toFixed(1)} ms
              </span>
            </div>
          </div>
        )}
      </div>

      {!isExpanded && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-success animate-pulse" />
      )}
    </div>
  );
}