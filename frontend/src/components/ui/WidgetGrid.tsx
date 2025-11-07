import { useState, type ReactNode } from 'react';
import { Plus, Grid3x3, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Widget {
  id: string;
  title: string;
  component: ReactNode;
  gridArea?: string;
  minWidth?: number;
  minHeight?: number;
}

interface WidgetGridProps {
  widgets: Widget[];
  onAddWidget?: () => void;
  onRemoveWidget?: (id: string) => void;
  className?: string;
  columns?: number;
  gap?: number;
}

export function WidgetGrid({
  widgets,
  onAddWidget,
  onRemoveWidget,
  className = '',
  columns = 3,
  gap = 4,
}: WidgetGridProps) {
  const [layout, setLayout] = useState<'grid' | 'masonry'>('grid');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayout('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              layout === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            title="Grid Layout"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('masonry')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              layout === 'masonry'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            title="Masonry Layout"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        {onAddWidget && (
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Widget</span>
          </button>
        )}
      </div>

      {/* Widget Grid */}
      <div
        className={cn(
          'grid gap-4',
          layout === 'grid' && `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`,
          layout === 'masonry' && 'auto-rows-auto'
        )}
        style={{ gap: `${gap * 4}px` }}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="glass-card rounded-xl overflow-hidden animate-scale-in hover:shadow-xl transition-all duration-300"
            style={{
              gridArea: widget.gridArea,
              minWidth: widget.minWidth,
              minHeight: widget.minHeight,
            }}
          >
            {widget.component}
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No widgets added</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first widget to get started
          </p>
          {onAddWidget && (
            <button
              onClick={onAddWidget}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Widget</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}