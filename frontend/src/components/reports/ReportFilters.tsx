import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

interface ReportFiltersProps {
  statusFilter: string;
  severityFilter: string;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
}

export function ReportFilters({
  statusFilter,
  severityFilter,
  onStatusChange,
  onSeverityChange,
}: ReportFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="status-filter">Filter by Status</Label>
        <Select id="status-filter" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="severity-filter">Filter by Severity</Label>
        <Select id="severity-filter" value={severityFilter} onChange={(e) => onSeverityChange(e.target.value)}>
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
      </div>
    </div>
  );
}