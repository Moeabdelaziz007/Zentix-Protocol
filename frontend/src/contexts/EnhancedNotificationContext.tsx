import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'ai-suggestion';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'system' | 'workflow' | 'agent' | 'user' | 'security';
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  persistent?: boolean;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearByCategory: (category: string) => void;
  unreadCount: number;
  getByCategory: (category: string) => Notification[];
  getByPriority: (priority: Notification['priority']) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function EnhancedNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [persistentNotifications, setPersistentNotifications] = useLocalStorage<Notification[]>(
    'persistent-notifications',
    []
  );

  // Load persistent notifications on mount
  useEffect(() => {
    if (persistentNotifications.length > 0) {
      setNotifications((prev) => [
        ...persistentNotifications.map((n) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })),
        ...prev,
      ]);
    }
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        id,
        timestamp: new Date(),
        read: false,
        priority: notification.priority || 'medium',
        autoClose: notification.autoClose !== false,
        duration: notification.duration || 5000,
        ...notification,
      };

      setNotifications((prev) => {
        // Sort by priority: urgent > high > medium > low
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const sorted = [newNotification, ...prev].sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        return sorted;
      });

      // Save persistent notifications
      if (notification.persistent) {
        setPersistentNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      }

      // Auto-remove non-persistent notifications
      if (newNotification.autoClose && !notification.persistent) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, newNotification.duration);
      }

      // Play notification sound for high priority
      if (notification.priority === 'urgent' || notification.priority === 'high') {
        playNotificationSound();
      }

      return id;
    },
    [setPersistentNotifications]
  );

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setPersistentNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [setPersistentNotifications]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setPersistentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [setPersistentNotifications]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setPersistentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setPersistentNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setPersistentNotifications([]);
  }, [setPersistentNotifications]);

  const clearByCategory = useCallback(
    (category: string) => {
      setNotifications((prev) => prev.filter((n) => n.category !== category));
      setPersistentNotifications((prev) => prev.filter((n) => n.category !== category));
    },
    [setPersistentNotifications]
  );

  const getByCategory = useCallback(
    (category: string) => {
      return notifications.filter((n) => n.category === category);
    },
    [notifications]
  );

  const getByPriority = useCallback(
    (priority: Notification['priority']) => {
      return notifications.filter((n) => n.priority === priority);
    },
    [notifications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        clearByCategory,
        unreadCount,
        getByCategory,
        getByPriority,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useEnhancedNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotifications must be used within EnhancedNotificationProvider');
  }
  return context;
}

// Helper function to play notification sound
function playNotificationSound() {
  if (typeof Audio !== 'undefined') {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBhpvO3nnk0QDFA=');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio playback fails
      });
    } catch (error) {
      // Ignore errors
    }
  }
}