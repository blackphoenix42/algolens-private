import { Download, RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { usePWA } from "@/services";
import { cn } from "@/utils";

interface NotificationProps {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
}

interface NotificationSystemProps {
  maxNotifications?: number;
}

export function NotificationSystem({
  maxNotifications = 3,
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const { isOnline, canInstall, showInstallPrompt } = usePWA();

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: NotificationProps) => {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notification.id);
        const updated = [...filtered, notification];
        return updated.slice(-maxNotifications);
      });

      if (!notification.persistent && notification.duration) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      }
    },
    [maxNotifications, removeNotification]
  );

  // Show connection status notifications
  useEffect(() => {
    const handleOnline = () => {
      addNotification({
        id: "online",
        type: "success",
        title: "Back Online",
        message: "Internet connection restored. Syncing data...",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      addNotification({
        id: "offline",
        type: "warning",
        title: "Offline Mode",
        message: "Working offline. Some features may be limited.",
        persistent: true,
      });
    };

    if (isOnline) {
      // Remove offline notification when back online
      removeNotification("offline");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline, addNotification, removeNotification]);

  // Show install prompt notification
  useEffect(() => {
    if (canInstall) {
      addNotification({
        id: "install",
        type: "info",
        title: "Install AlgoLens",
        message: "Add AlgoLens to your home screen for the best experience.",
        action: {
          label: "Install",
          onClick: async () => {
            const success = await showInstallPrompt();
            if (success) {
              removeNotification("install");
            }
          },
        },
        persistent: true,
      });
    }
  }, [canInstall, showInstallPrompt, addNotification, removeNotification]);

  // Listen for service worker updates
  useEffect(() => {
    const handleUpdateFound = () => {
      addNotification({
        id: "update",
        type: "info",
        title: "Update Available",
        message: "A new version of AlgoLens is available.",
        action: {
          label: "Refresh",
          onClick: () => {
            window.location.reload();
          },
        },
        persistent: true,
      });
    };

    // Listen for service worker update events (skip on mobile)
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
        navigator.userAgent
      ) ||
      /Mobi|Android/i.test(navigator.userAgent) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768;

    if (!isMobile && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "UPDATE_AVAILABLE") {
          handleUpdateFound();
        }
      });
    }
  }, [addNotification]);

  // Reuse memoized addNotification/removeNotification for internal logic

  const getNotificationIcon = (type: NotificationProps["type"]) => {
    switch (type) {
      case "success":
        return <Wifi className="h-5 w-5 text-green-500" />;
      case "warning":
        return <WifiOff className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <X className="h-5 w-5 text-red-500" />;
      case "info":
        return <Download className="h-5 w-5 text-blue-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: NotificationProps["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "flex max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg",
            "animate-in slide-in-from-top-2 duration-300",
            getNotificationBg(notification.type)
          )}
        >
          {getNotificationIcon(notification.type)}

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>

            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className={cn(
                  "mt-2 rounded px-3 py-1 text-xs font-medium",
                  "border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
                  "transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {notification.action.label}
              </button>
            )}
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            className="rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            title="Close notification"
            aria-label="Close notification"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook for adding notifications from anywhere in the app
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    // Use crypto-secure randomness for notification IDs
    let randomPart: string;
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.getRandomValues
    ) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      randomPart = array[0].toString(36);
    } else {
      // Fallback using timestamp-based randomness for environments without crypto
      randomPart = (Date.now() + performance.now()).toString(36);
    }
    const id = `notification-${Date.now()}-${randomPart}`;
    const fullNotification = { ...notification, id };

    setNotifications((prev) => [...prev, fullNotification]);

    // Auto-remove non-persistent notifications
    if (!notification.persistent && notification.duration !== undefined) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}
