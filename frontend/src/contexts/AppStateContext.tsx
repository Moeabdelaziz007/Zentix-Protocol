import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AppState {
  quickActionsOpen: boolean;
  commandPaletteOpen: boolean;
  aiCopilotOpen: boolean;
  sidebarCollapsed: boolean;
  recentPages: string[];
  userPreferences: {
    animations: boolean;
    compactMode: boolean;
    showHints: boolean;
  };
}

interface AppStateContextType {
  state: AppState;
  toggleQuickActions: () => void;
  toggleCommandPalette: () => void;
  toggleAICopilot: () => void;
  toggleSidebar: () => void;
  addRecentPage: (page: string) => void;
  updatePreferences: (prefs: Partial<AppState['userPreferences']>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useLocalStorage<AppState['userPreferences']>(
    'app-preferences',
    {
      animations: true,
      compactMode: false,
      showHints: true,
    }
  );

  const [recentPages, setRecentPages] = useLocalStorage<string[]>('recent-pages', []);

  const [state, setState] = useState<AppState>({
    quickActionsOpen: false,
    commandPaletteOpen: false,
    aiCopilotOpen: false,
    sidebarCollapsed: false,
    recentPages,
    userPreferences: preferences,
  });

  const toggleQuickActions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      quickActionsOpen: !prev.quickActionsOpen,
      commandPaletteOpen: false,
    }));
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setState((prev) => ({
      ...prev,
      commandPaletteOpen: !prev.commandPaletteOpen,
      quickActionsOpen: false,
    }));
  }, []);

  const toggleAICopilot = useCallback(() => {
    setState((prev) => ({ ...prev, aiCopilotOpen: !prev.aiCopilotOpen }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const addRecentPage = useCallback(
    (page: string) => {
      const newRecent = [page, ...recentPages.filter((p) => p !== page)].slice(0, 10);
      setRecentPages(newRecent);
      setState((prev) => ({ ...prev, recentPages: newRecent }));
    },
    [recentPages, setRecentPages]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<AppState['userPreferences']>) => {
      const newPrefs = { ...preferences, ...prefs };
      setPreferences(newPrefs);
      setState((prev) => ({ ...prev, userPreferences: newPrefs }));
    },
    [preferences, setPreferences]
  );

  return (
    <AppStateContext.Provider
      value={{
        state,
        toggleQuickActions,
        toggleCommandPalette,
        toggleAICopilot,
        toggleSidebar,
        addRecentPage,
        updatePreferences,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}