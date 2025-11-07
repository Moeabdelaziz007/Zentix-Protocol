import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  category: string;
}

interface NewsWidgetProps {
  className?: string;
}

export function NewsWidget({ className = '' }: NewsWidgetProps) {
  const news: NewsItem[] = [
    {
      id: '1',
      title: 'AI Breakthrough: New Model Achieves Human-Level Performance',
      source: 'Tech News',
      time: '2h ago',
      url: '#',
      category: 'Technology',
    },
    {
      id: '2',
      title: 'Cryptocurrency Markets Rally on Positive Regulation News',
      source: 'Finance Daily',
      time: '4h ago',
      url: '#',
      category: 'Finance',
    },
    {
      id: '3',
      title: 'Climate Summit Reaches Historic Agreement',
      source: 'World News',
      time: '6h ago',
      url: '#',
      category: 'Environment',
    },
    {
      id: '4',
      title: 'Space Exploration: New Mission to Mars Announced',
      source: 'Science Today',
      time: '8h ago',
      url: '#',
      category: 'Science',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-500/10 text-blue-500',
      Finance: 'bg-green-500/10 text-green-500',
      Environment: 'bg-emerald-500/10 text-emerald-500',
      Science: 'bg-purple-500/10 text-purple-500',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Latest News</h3>
      </div>
      <div className="space-y-4">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getCategoryColor(item.category))}>
                {item.category}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{item.source}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{item.time}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}