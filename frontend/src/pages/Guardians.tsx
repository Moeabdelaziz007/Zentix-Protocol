import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { formatDate, formatDID } from '../utils/formatters';
import { mockGuardians } from '../data/dashboardMockData';
import { Shield, Search, Users } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function Guardians() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useApi(
    () => apiService.getGuardians().catch(() => mockGuardians),
    []
  );

  const filteredGuardians = data?.filter(
    (guardian) =>
      guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guardian.did.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading guardians...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-error">Error loading guardians</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 glass-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Security Network</span>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Guardian Management
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Monitor and manage your network of security guardians
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="gradient-border" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Guardians</p>
              <p className="text-2xl font-bold gradient-text">{data?.length || 0}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard variant="gradient-border" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Guardians</p>
              <p className="text-2xl font-bold text-success">{data?.filter(g => g.role === 'validator').length || 0}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard variant="gradient-border" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Auditors</p>
              <p className="text-2xl font-bold text-accent">{data?.filter(g => g.role === 'auditor').length || 0}</p>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search guardians by name or DID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGuardians && filteredGuardians.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No guardians found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuardians?.map((guardian, idx) => (
          <GlassCard 
            key={guardian.did} 
            variant="gradient-border" 
            className="animate-scale-in"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <GlassCardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {guardian.name}
                </GlassCardTitle>
                <Badge variant={guardian.role === 'validator' ? 'success' : 'default'}>
                  {guardian.role}
                </Badge>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">DID</p>
                <p className="font-mono text-sm font-medium">{formatDID(guardian.did)}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(guardian.created)}</span>
              </div>
            </GlassCardContent>
          </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}