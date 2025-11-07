import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { ExportButton } from '../components/ui/ExportButton';
import { formatDate, formatDID } from '../utils/formatters';
import { mockReports } from '../data/dashboardMockData';
import { useNotifications } from '../contexts/NotificationContext';
import type { ReportStatus, ReportSeverity, GuardianReport } from '../types';
import { FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function Reports() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const { addNotification } = useNotifications();

  const { data: allReports, loading, error, refetch } = useApi(
    () => apiService.getGuardianReports({ 
      status: statusFilter || undefined, 
      severity: severityFilter || undefined 
    }).catch(() => mockReports),
    [statusFilter, severityFilter]
  );

  const handleVote = async (reportId: string, approve: boolean) => {
    try {
      await apiService.voteOnReport(reportId, 'current-guardian-did', approve);
      await refetch();
      addNotification(
        `Vote ${approve ? 'approved' : 'rejected'} successfully!`,
        'success'
      );
    } catch (err) {
      console.error('Vote failed:', err);
      addNotification('Failed to submit vote', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-error">Error loading reports</div>;
  }

  const getSeverityVariant = (severity: ReportSeverity): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants = {
      low: 'secondary' as const,
      medium: 'outline' as const,
      high: 'default' as const,
      critical: 'destructive' as const,
    };
    return variants[severity] || 'default';
  };

  const getStatusVariant = (status: ReportStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants = {
      pending: 'outline' as const,
      approved: 'default' as const,
      rejected: 'destructive' as const,
    };
    return variants[status] || 'default';
  };

  const columns = useMemo<ColumnDef<GuardianReport>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={getStatusVariant(row.original.status)} className="capitalize">
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => (
          <Badge variant={getSeverityVariant(row.original.severity)} className="capitalize">
            {row.original.severity}
          </Badge>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-md truncate" title={row.original.description}>
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: 'agentDID',
        header: 'Agent DID',
        cell: ({ row }) => (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {formatDID(row.original.agentDID)}
          </code>
        ),
      },
      {
        accessorKey: 'guardianDID',
        header: 'Guardian DID',
        cell: ({ row }) => (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {formatDID(row.original.guardianDID)}
          </code>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => <span className="text-sm">{formatDate(row.original.timestamp)}</span>,
      },
      {
        accessorKey: 'votes',
        header: 'Votes',
        cell: ({ row }) => (
          <div className="text-sm">
            <span className="text-success">✓ {row.original.votes.approve}</span>
            {' / '}
            <span className="text-error">✗ {row.original.votes.reject}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          if (row.original.status !== 'pending') return null;
          return (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleVote(row.original.id, true)}
                className="bg-success hover:bg-success/90"
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleVote(row.original.id, false)}
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 glass-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Security Reports</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold gradient-text mb-3">
                Guardian Reports
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                Review and vote on security incident reports
              </p>
            </div>
            <div className="flex gap-3">
              {allReports && <ExportButton data={allReports} filename="guardian-reports" />}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Reports</p>
              <p className="text-2xl font-bold gradient-text">{allReports?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pending</p>
              <p className="text-2xl font-bold text-warning">{allReports?.filter(r => r.status === 'pending').length || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Approved</p>
              <p className="text-2xl font-bold text-success">{allReports?.filter(r => r.status === 'approved').length || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-error/10">
              <XCircle className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Rejected</p>
              <p className="text-2xl font-bold text-error">{allReports?.filter(r => r.status === 'rejected').length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg bg-card text-foreground font-medium transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          value={severityFilter} 
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg bg-card text-foreground font-medium transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 animate-pulse">Loading reports...</div>
      ) : error ? (
        <div className="text-center py-12 text-error">Error loading reports</div>
      ) : allReports ? (
        <DataTable
          columns={columns}
          data={allReports}
          searchKey="description"
          searchPlaceholder="Search by description or DID..."
        />
      ) : null}
    </div>
  );
}