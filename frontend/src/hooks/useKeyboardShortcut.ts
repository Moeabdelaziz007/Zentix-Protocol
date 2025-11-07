import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  callback: () => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { key, ctrl = false, shift = false, alt = false, meta = false } = config;

      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;
      const metaMatch = meta ? event.metaKey : !event.metaKey;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch &&
        metaMatch
      ) {
        event.preventDefault();
        callback();
      }
    },
    [config, callback, enabled]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

export function useKeyboardShortcuts(
  shortcuts: Array<{ config: ShortcutConfig; callback: () => void; enabled?: boolean }>
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ config, callback, enabled = true }) => {
        if (!enabled) return;

        const { key, ctrl = false, shift = false, alt = false, meta = false } = config;

        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        const metaMatch = meta ? event.metaKey : !event.metaKey;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          metaMatch
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}