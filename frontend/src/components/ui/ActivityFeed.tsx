import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface ActivityItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'success',
      message: 'New guardian registered successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
      id: '2',
      type: 'info',
      message: 'Compliance score updated to 97.5%',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '3',
      type: 'warning',
      message: 'Report pending review',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
    },
  ]);

  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        'Transaction relayed successfully',
        'New audit completed',
        'Guardian vote recorded',
        'Compliance check passed',
        'System health check completed',
      ];
      const types: ActivityItem['type'][] = ['success', 'info', 'warning'];
      
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(),
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 15000); // Add new activity every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="glass-card p-3 rounded-full hover:scale-110 transition-all duration-300 pulse-glow"
        >
          <Activity className="h-6 w-6 text-primary" />
          {activities.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-success text-white text-xs flex items-center justify-center animate-pulse">
              {activities.length}
            </span>
          )}
        </button>
      ) : (
        <div className="glass-card w-80 max-h-96 overflow-hidden animate-scale-in">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Live Activity</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-slide-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.timestamp.toISOString())}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}