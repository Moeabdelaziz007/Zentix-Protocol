import { AlertTriangle } from 'lucide-react';

export function AlertsConsoleApp() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Alerts Console</h3>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
