import { useState, useCallback } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimisticUpdateProps {
  onUpdate: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  children: (props: {
    isUpdating: boolean;
    isSuccess: boolean;
    isError: boolean;
    trigger: () => void;
  }) => React.ReactNode;
}

export function OptimisticUpdate({
  onUpdate,
  successMessage = 'Updated successfully',
  errorMessage = 'Update failed',
  children,
}: OptimisticUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const trigger = useCallback(async () => {
    setIsUpdating(true);
    setIsSuccess(false);
    setIsError(false);

    try {
      await onUpdate();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      setIsError(true);
      setTimeout(() => setIsError(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  }, [onUpdate]);

  return (
    <>
      {children({ isUpdating, isSuccess, isError, trigger })}
      
      {/* Status indicator */}
      {(isUpdating || isSuccess || isError) && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-bottom">
          <div
            className={cn(
              'glass-card px-4 py-3 flex items-center gap-3 shadow-lg',
              isSuccess && 'border-success',
              isError && 'border-error'
            )}
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            {isSuccess && <Check className="w-4 h-4 text-success" />}
            {isError && <X className="w-4 h-4 text-error" />}
            <span className="text-sm font-medium">
              {isUpdating && 'Updating...'}
              {isSuccess && successMessage}
              {isError && errorMessage}
            </span>
          </div>
        </div>
      )}
    </>
  );
}