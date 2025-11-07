import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { FileText } from 'lucide-react';
import { CardSkeleton } from '../ui/SkeletonLoader';
import type { GuardianReport } from '../../types';

export function ReportsViewerApp() {
  const [filter, setFilter] = useState({ status: '', severity: '' });
  const { data: reportsData, loading } = useApi(
    () => apiService.getGuardianReports(filter),
    [filter]
  );

  const [selectedReport, setSelectedReport] = useState<GuardianReport | null>(null);

  const reports = reportsData || [];

  return (
    <div className="h-full flex bg-background">
      {/* Reports List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports
          </h3>
          
          {/* Filters */}
          <div className="space-y-2">
            <select
              value={filter.status}
              onChange={e => setFilter({...filter, status: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filter.severity}
              onChange={e => setFilter({...filter, severity: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              aria-label="Filter by severity"
            >
              <option value="">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 cursor-pointer hover:bg-primary/5 transition-colors ${
                    selectedReport?.id === report.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">
                      Report #{report.id.slice(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      report.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                      report.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                      report.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(report.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Details */}
      <div className="flex-1 overflow-auto p-6">
        {selectedReport ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Report #{selectedReport.id.slice(0, 8)}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(selectedReport.timestamp).toLocaleString()}</span>
                <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                  {selectedReport.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedReport.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Evidence</h3>
                <div className="bg-background/50 border border-border/50 rounded-lg p-4">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify((selectedReport as any).evidence || selectedReport, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Votes</h3>
                <div className="flex gap-4">
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Approved</div>
                    <div className="text-2xl font-bold text-green-500">{(selectedReport as any).votesFor || 0}</div>
                  </div>
                  <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Rejected</div>
                    <div className="text-2xl font-bold text-red-500">{(selectedReport as any).votesAgainst || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Select a report to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
