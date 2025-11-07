import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Shield, FileText, Radio, CheckCircle, X } from 'lucide-react';

interface Command {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const commands: Command[] = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      icon: <Home className="h-4 w-4" />,
      action: () => navigate('/'),
      keywords: ['dashboard', 'home', 'overview'],
    },
    {
      id: 'guardians',
      title: 'Go to Guardians',
      icon: <Shield className="h-4 w-4" />,
      action: () => navigate('/guardians'),
      keywords: ['guardians', 'security', 'protection'],
    },
    {
      id: 'reports',
      title: 'Go to Reports',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/reports'),
      keywords: ['reports', 'violations', 'issues'],
    },
    {
      id: 'relayer',
      title: 'Go to Relayer',
      icon: <Radio className="h-4 w-4" />,
      action: () => navigate('/relayer'),
      keywords: ['relayer', 'transactions', 'relay'],
    },
    {
      id: 'compliance',
      title: 'Go to Compliance',
      icon: <CheckCircle className="h-4 w-4" />,
      action: () => navigate('/compliance'),
      keywords: ['compliance', 'audit', 'score'],
    },
  ];

  const filteredCommands = commands.filter((command) =>
    command.keywords.some((keyword) => keyword.toLowerCase().includes(search.toLowerCase())) ||
    command.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const executeCommand = (command: Command) => {
    command.action();
    setIsOpen(false);
    setSearch('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-scale-in">
        <div className="glass-card mx-4 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No commands found
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left animate-slide-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                      {command.icon}
                    </div>
                    <span className="text-foreground">{command.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>Press ESC to close</span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-background border border-border">⌘</kbd>
              <kbd className="px-2 py-1 rounded bg-background border border-border">K</kbd>
              to open
            </span>
          </div>
        </div>
      </div>
    </>
  );
}