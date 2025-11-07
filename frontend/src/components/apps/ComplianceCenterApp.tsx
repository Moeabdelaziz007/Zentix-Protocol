import { CheckCircle } from 'lucide-react';

export function ComplianceCenterApp() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Compliance Center</h3>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
