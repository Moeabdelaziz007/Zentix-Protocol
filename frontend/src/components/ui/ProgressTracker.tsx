import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProgressTracker({
  steps,
  currentStep,
  orientation = 'horizontal',
  className,
}: ProgressTrackerProps) {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = step.status === 'completed';
        const isError = step.status === 'error';
        const isInProgress = step.status === 'in-progress';

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center',
              orientation === 'horizontal' ? 'flex-row' : 'flex-col'
            )}
          >
            <div
              className={cn(
                'flex',
                orientation === 'horizontal' ? 'flex-col items-center' : 'flex-row items-start gap-3'
              )}
            >
              {/* Step indicator */}
              <div className="relative">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-success border-success text-white',
                    isError && 'bg-error border-error text-white',
                    isInProgress && 'bg-primary border-primary text-primary-foreground',
                    !isCompleted && !isError && !isInProgress && 'bg-background border-border text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isInProgress ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Pulse animation for active step */}
                {isActive && !isCompleted && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                )}
              </div>

              {/* Step content */}
              <div className={cn(orientation === 'horizontal' ? 'text-center mt-2' : 'flex-1')}>
                <p
                  className={cn(
                    'text-sm font-medium',
                    isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'transition-all',
                  orientation === 'horizontal'
                    ? 'h-0.5 flex-1 mx-2'
                    : 'w-0.5 h-12 ml-5 my-2',
                  isCompleted ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}