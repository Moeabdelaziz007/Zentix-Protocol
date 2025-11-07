import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap, TrendingUp } from 'lucide-react';

interface HealingEvent {
  id: string;
  timestamp: string;
  issue: string;
  action: string;
  status: 'success' | 'failed' | 'in_progress';
  duration?: number;
  details: string;
}

export function HealerDashboardApp() {
  const [healingEvents, setHealingEvents] = useState<HealingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    successfulHeals: 0,
    failedHeals: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    fetchHealingEvents();
    const interval = setInterval(fetchHealingEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealingEvents = async () => {
    try {
      // Mock data - replace with real API call
      const mockEvents: HealingEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          issue: 'Guardian Agent Unresponsive',
          action: 'Restarted Guardian Process',
          status: 'success',
          duration: 2300,
          details: 'Guardian gd-001 was not responding to health checks. System automatically restarted the process and restored functionality.'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          issue: 'High Memory Usage Detected',
          action: 'Cleared Cache & Optimized Memory',
          status: 'success',
          duration: 1800,
          details: 'Memory usage reached 85%. System cleared temporary caches and optimized memory allocation.'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          issue: 'Database Connection Lost',
          action: 'Reconnected to Database',
          status: 'success',
          duration: 5200,
          details: 'Lost connection to Supabase. System automatically reconnected and restored all pending operations.'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          issue: 'API Rate Limit Exceeded',
          action: 'Activated Fallback Mode',
          status: 'in_progress',
          details: 'Gemini API rate limit reached. System switched to backup provider and queued requests.'
        }
      ];

      setHealingEvents(mockEvents);
      setStats({
        totalEvents: mockEvents.length,
        successfulHeals: mockEvents.filter(e => e.status === 'success').length,
        failedHeals: mockEvents.filter(e => e.status === 'failed').length,
        avgResponseTime: mockEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / mockEvents.length
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch healing events:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: HealingEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: HealingEvent['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10';
      case 'failed':
        return 'border-red-500/20 bg-red-500/10';
      case 'in_progress':
        return 'border-yellow-500/20 bg-yellow-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-500" />
          Self-Healing Dashboard
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Events</span>
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalEvents}</div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Successful</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-500">{stats.successfulHeals}</div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Failed</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-500">{stats.failedHeals}</div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Response</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{(stats.avgResponseTime / 1000).toFixed(1)}s</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Healing Events</h3>
        
        <div className="space-y-4">
          {healingEvents.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-4 ${getStatusColor(event.status)} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(event.status)}
                  <div>
                    <h4 className="font-semibold text-foreground">{event.issue}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{event.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  {event.duration && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {(event.duration / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background/50 rounded p-3 text-sm text-muted-foreground">
                {event.details}
              </div>

              {/* Progress Bar for in-progress events */}
              {event.status === 'in_progress' && (
                <div className="mt-3">
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="h-2 rounded-full bg-yellow-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {healingEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No healing events recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
