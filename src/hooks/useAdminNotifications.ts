import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCounts, useNotifications } from '@novu/react';
import type { Notification } from '@novu/js';
import type { RootState } from '../redux/rootReducer';
import { fetchSubscriberHmac } from '../services/notificationService';

// ---------------------------------------------------------------------------
// Subscriber setup — resolves subscriber ID and fetches HMAC from backend.
// This hook can be called anywhere (no NovuProvider context required).
// ---------------------------------------------------------------------------

export interface AdminSubscriberSetup {
  subscriberId: string;
  subscriberHash: string | null;
  isLoading: boolean;
  error: Error | null;
}

function resolveSubscriberId(
  reduxUserId: string | null | undefined,
  localStorageUserData: any
): string {
  const roles: string[] =
    localStorageUserData?.roles ||
    localStorageUserData?.user?.roles ||
    localStorageUserData?.user?.realmRoles ||
    [];

  const isSuperAdmin = roles.some((r) =>
    ['super_admin', 'SUPER_ADMIN', 'superadmin'].includes(r)
  );

  if (isSuperAdmin) return 'admin_global';

  // Use Keycloak sub (stored as userId in Redux)
  if (reduxUserId) return String(reduxUserId);

  return 'admin_global';
}

export function useAdminSubscriberSetup(): AdminSubscriberSetup {
  const reduxUserId = useSelector((state: RootState) => state.block.userId);

  const localStorageUserData = (() => {
    try {
      return JSON.parse(localStorage.getItem('userData') ?? '{}');
    } catch {
      return {};
    }
  })();

  const subscriberId = resolveSubscriberId(reduxUserId, localStorageUserData);

  const [subscriberHash, setSubscriberHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchSubscriberHmac(subscriberId)
      .then((hash) => {
        if (!cancelled) {
          setSubscriberHash(hash);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subscriberId]);

  return { subscriberId, subscriberHash, isLoading, error };
}

// ---------------------------------------------------------------------------
// Notification data hook — wraps Novu's useCounts + useNotifications.
// MUST be called inside a component tree that is a child of <NovuProvider>.
// AdminNotificationBell renders that provider automatically.
// ---------------------------------------------------------------------------

export interface AdminNotificationsData {
  unreadCount: number;
  notifications: Notification[];
  markAsRead: (notification: Notification) => Promise<unknown>;
  markAllAsRead: () => Promise<unknown>;
  isLoading: boolean;
}

export function useAdminNotifications(): AdminNotificationsData {
  const { counts, isLoading: countsLoading } = useCounts({
    filters: [{ read: false }],
  });

  const { notifications, readAll, isLoading: notifLoading } = useNotifications();

  return {
    unreadCount: counts?.[0]?.count ?? 0,
    notifications: notifications ?? [],
    markAsRead: (notification: Notification) => notification.read(),
    markAllAsRead: readAll,
    isLoading: countsLoading || notifLoading,
  };
}
