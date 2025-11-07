import type { Violation } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { ReportSeverity } from '@/types/enums';

interface ViolationTimelineProps {
  violations: Violation[];
}

export function ViolationTimeline({ violations }: ViolationTimelineProps) {
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
    <div className="space-y-4">
      {violations.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No violations found</p>
      ) : (
        violations.map((violation) => (
          <div key={violation.id} className="flex gap-4 p-4 border border-border rounded-lg">
            <div className="flex-shrink-0 w-2 bg-border rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityVariant(violation.severity)}>{violation.severity}</Badge>
                <span className="text-sm text-muted-foreground">{formatDate(violation.timestamp)}</span>
              </div>
              <p className="font-medium">{violation.type}</p>
              <p className="text-sm text-muted-foreground">{violation.description}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}