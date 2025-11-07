import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface SmartSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: SearchResult[];
  className?: string;
}

export function SmartSearch({ 
  placeholder = 'Search with AI...', 
  onSearch,
  suggestions = [],
  className 
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches] = useState<string[]>([
    'Create new agent',
    'Generate video',
    'Build app'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query);
      setIsOpen(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="w-full h-12 bg-background/80 backdrop-blur-sm border border-border rounded-xl pl-11 pr-20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">⌘K</kbd>
        </div>
      </div>

      {isOpen && (query || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-in-bottom">
          {query && filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                AI Suggestions
              </div>
              {filteredSuggestions.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    result.action();
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  {result.icon && (
                    <div className="mt-1 text-primary">{result.icon}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{result.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.description}</div>
                  </div>
                  <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                    {result.category}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{search}</span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border p-2">
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Press Enter to search • ESC to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}