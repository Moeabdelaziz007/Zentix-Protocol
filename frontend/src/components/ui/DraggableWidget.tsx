import { useState, useRef, useEffect, type ReactNode } from 'react';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: () => void;
  onResize?: (width: number, height: number) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  className?: string;
  headerColor?: string;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export function DraggableWidget({
  id,
  title,
  children,
  onRemove,
  onResize,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 400, height: 300 },
  className = '',
  headerColor = 'from-blue-600 to-cyan-500',
  isDraggable = true,
  isResizable = true,
}: DraggableWidgetProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && isDraggable) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }

      if (isResizing && isResizable) {
        const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
        onResize?.(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, isDraggable, isResizable, onResize]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isDraggable || isMaximized) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isResizable || isMaximized) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div
      ref={widgetRef}
      className={cn(
        'absolute glass-card overflow-hidden transition-all duration-300',
        isDragging && 'cursor-grabbing shadow-2xl scale-105',
        isMaximized && 'inset-4 !w-auto !h-auto',
        className
      )}
      style={
        isMaximized
          ? undefined
          : {
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
            }
      }
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-3 bg-gradient-to-r text-white cursor-grab active:cursor-grabbing',
          headerColor
        )}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-60" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMaximize}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-red-500/30 rounded transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-48px)] overflow-auto bg-background/95 backdrop-blur-sm">
        {children}
      </div>

      {/* Resize Handle */}
      {isResizable && !isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-white/50 rounded-sm" />
        </div>
      )}
    </div>
  );
}