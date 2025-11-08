import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

interface NetworkStatusCardProps {
  title: string;
  value: string | number;
  showProgress?: boolean;
  progressValue?: number;
}

export function NetworkStatusCard({ 
  title, 
  value, 
  showProgress = false, 
  progressValue = 0 
}: NetworkStatusCardProps) {
  return (
    <Card className="bg-quantum-surface border-quantum-border">
      <CardHeader>
        <CardTitle className="text-sm text-quantum-text-secondary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-quantum-cyan mb-2">{value}</div>
        {showProgress && (
          <Progress 
            value={progressValue} 
            className="h-2 bg-quantum-border"
          />
        )}
      </CardContent>
    </Card>
  );
}