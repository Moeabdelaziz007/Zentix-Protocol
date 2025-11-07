import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CardSkeleton } from '../ui/SkeletonLoader';
import type { Guardian } from '../../types';

export function GuardiansControlApp() {
  const { data: guardiansData, loading, error } = useApi(
    () => apiService.getGuardians(),
    []
  );

  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);

  const getStatusColor = (guardian: Guardian) => {
    if (!guardian.active) return 'text-gray-500';
    if (guardian.reputation > 80) return 'text-green-500';
    if (guardian.reputation > 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (guardian: Guardian) => {
    if (!guardian.active) return <XCircle className="w-5 h-5" />;
    if (guardian.reputation > 80) return <CheckCircle className="w-5 h-5" />;
    if (guardian.reputation > 60) return <AlertCircle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Connection Error</h3>
          <p className="text-muted-foreground">
            Unable to connect to Guardian API. Make sure the server is running.
          </p>
        </div>
      </div>
    );
  }

  const guardians = guardiansData || [];
  const activeGuardians = guardians.filter(g => g.active).length;
  const totalReputation = guardians.reduce((sum, g) => sum + g.reputation, 0) / Math.max(guardians.length, 1);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Stats */}
      <div className="p-6 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Guardians Control Center
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Total Guardians</div>
            <div className="text-3xl font-bold text-foreground">{guardians.length}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-green-500/20">
            <div className="text-sm text-muted-foreground mb-1">Active Now</div>
            <div className="text-3xl font-bold text-green-500">{activeGuardians}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Avg. Reputation</div>
            <div className="text-3xl font-bold text-foreground">{totalReputation.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Guardians List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guardians.map((guardian) => (
            <div
              key={guardian.did}
              onClick={() => setSelectedGuardian(guardian)}
              className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20`}>
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      Guardian {guardian.did.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      DID: {guardian.did.slice(-6)}
                    </div>
                  </div>
                </div>
                <div className={`${getStatusColor(guardian)}`}>
                  {getStatusIcon(guardian)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Reputation</span>
                  <span className="text-sm font-semibold text-foreground">{guardian.reputation}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      guardian.reputation > 80 ? 'bg-green-500' :
                      guardian.reputation > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${guardian.reputation}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs mt-3">
                  <div>
                    <div className="text-muted-foreground">Reports</div>
                    <div className="font-semibold text-foreground">{guardian.totalReports}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Approved</div>
                    <div className="font-semibold text-green-500">{guardian.approvedReports}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Stake</div>
                    <div className="font-semibold text-foreground">{guardian.stake}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Guardian Details */}
      {selectedGuardian && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedGuardian(null)}>
          <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Guardian Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">DID</div>
                  <div className="text-sm font-mono text-foreground break-all">{selectedGuardian.did}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Public Key</div>
                  <div className="text-sm font-mono text-foreground break-all">{selectedGuardian.publicKey}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Reputation</div>
                  <div className="text-2xl font-bold text-blue-500">{selectedGuardian.reputation}%</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Reports</div>
                  <div className="text-2xl font-bold text-green-500">{selectedGuardian.totalReports}</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Stake</div>
                  <div className="text-2xl font-bold text-purple-500">{selectedGuardian.stake}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedGuardian(null)}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
