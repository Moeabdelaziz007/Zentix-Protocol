import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory?: number;
  renderTime: number;
  componentName?: string;
}

export function usePerformanceMonitor(componentName?: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    componentName,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef(performance.now());

  useEffect(() => {
    renderStartRef.current = performance.now();

    let animationFrameId: number;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        const memory = (performance as any).memory?.usedJSHeapSize / 1048576; // MB

        setMetrics({
          fps,
          memory,
          renderTime: currentTime - renderStartRef.current,
          componentName,
        });

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [componentName]);

  return metrics;
}

export function useRenderCount(componentName?: string) {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName || 'Component'}] Render count: ${renderCountRef.current}`);
    }
  });

  return renderCountRef.current;
}