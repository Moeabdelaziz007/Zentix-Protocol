import type { GuardianReport } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDID } from '@/utils/formatters';
import { ReportStatus, ReportSeverity } from '@/types/enums';

interface ReportCardProps {
  report: GuardianReport;
  onVote?: (reportId: string, approve: boolean) => void;
}

export function ReportCard({ report, onVote }: ReportCardProps) {
  const getStatusVariant = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.APPROVED:
        return 'success';
      case ReportStatus.REJECTED:
        return 'error';
      default:
        return 'warning';
    }
  };

  const getSeverityVariant = (severity: ReportSeverity) => {
    switch (severity) {
      case ReportSeverity.CRITICAL:
        return 'error';
      case ReportSeverity.HIGH:
        return 'warning';
      case ReportSeverity.MEDIUM:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
            <Badge variant={getSeverityVariant(report.severity)}>{report.severity}</Badge>
          </div>
          <p className="text-foreground">{report.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Agent DID</p>
              <p className="font-mono">{formatDID(report.agentDID)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Timestamp</p>
              <p>{formatDate(report.timestamp)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Votes:</span>
            <span className="text-success">Approve: {report.votes.approve}</span>
            <span className="text-error">Reject: {report.votes.reject}</span>
          </div>
          {report.status === ReportStatus.PENDING && onVote && (
            <div className="flex gap-2 pt-2">
              <Button variant="success" onClick={() => onVote(report.id, true)}>
                Approve
              </Button>
              <Button variant="error" onClick={() => onVote(report.id, false)}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}