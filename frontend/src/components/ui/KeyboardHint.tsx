import { useState, useEffect } from 'react';
import { Command } from 'lucide-react';

export function KeyboardHint() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 animate-slide-in-up">
      <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm">
        <Command className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">Press</span>
        <kbd className="px-2 py-1 rounded bg-muted border border-border text-foreground font-mono text-xs">⌘K</kbd>
        <span className="text-muted-foreground">to open command palette</span>
        <button
          onClick={() => setShow(false)}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}