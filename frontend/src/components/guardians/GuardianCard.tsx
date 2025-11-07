import type { Guardian } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate, formatDID } from '@/utils/formatters';

interface GuardianCardProps {
  guardian: Guardian;
}

export function GuardianCard({ guardian }: GuardianCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{guardian.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">DID</p>
          <p className="font-mono text-sm">{formatDID(guardian.did)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-medium capitalize">{guardian.role}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="text-sm">{formatDate(guardian.created)}</p>
        </div>
      </CardContent>
    </Card>
  );
}