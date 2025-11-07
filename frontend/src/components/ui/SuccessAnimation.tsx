import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function SuccessAnimation({ message, onComplete }: { message: string; onComplete?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="glass-card p-8 flex flex-col items-center gap-4 animate-scale-in">
        <div className="relative">
          <CheckCircle className="h-16 w-16 text-success animate-scale-in" />
          <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
        </div>
        <p className="text-foreground font-medium text-lg">{message}</p>
      </div>
    </div>
  );
}