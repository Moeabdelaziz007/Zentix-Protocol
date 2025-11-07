import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ContextualTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  aiSuggestion?: string;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function ContextualTooltip({
  children,
  content,
  aiSuggestion,
  delay = 300,
  position = 'top',
  className,
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let x = rect.left + rect.width / 2;
        let y = rect.top;

        switch (position) {
          case 'top':
            y = rect.top - 10;
            break;
          case 'bottom':
            y = rect.bottom + 10;
            break;
          case 'left':
            x = rect.left - 10;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 10;
            y = rect.top + rect.height / 2;
            break;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const tooltipContent = (
    <div
      className={cn(
        'fixed z-50 animate-fade-in-up',
        position === 'top' && '-translate-x-1/2 -translate-y-full',
        position === 'bottom' && '-translate-x-1/2',
        position === 'left' && '-translate-x-full -translate-y-1/2',
        position === 'right' && '-translate-y-1/2'
      )}
      style={{ left: coords.x, top: coords.y }}
    >
      <div
        className={cn(
          'glass-card px-3 py-2 text-sm text-foreground shadow-lg max-w-xs',
          className
        )}
      >
        {content}
        {aiSuggestion && (
          <div className="mt-2 pt-2 border-t border-border/50 flex items-start gap-2">
            <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{aiSuggestion}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
}