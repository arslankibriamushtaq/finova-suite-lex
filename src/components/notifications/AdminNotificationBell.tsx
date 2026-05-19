import { NovuProvider, Inbox } from '@novu/react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/skeleton';
import { useAdminSubscriberSetup } from '../../hooks/useAdminNotifications';

const APP_IDENTIFIER =
  import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER ||
  (typeof process !== 'undefined'
    ? process.env?.REACT_APP_NOVU_APPLICATION_IDENTIFIER
    : undefined) ||
  '6nwZO95IADDN';

// ---------------------------------------------------------------------------
// Bell skeleton — shown while HMAC is being fetched from the backend.
// Matches the 40×40 footprint of Novu's default bell icon.
// ---------------------------------------------------------------------------
function BellSkeleton() {
  return (
    <div
      aria-label="Loading notifications"
      className="flex items-center justify-center"
      style={{ minWidth: 40, minHeight: 40 }}
    >
      <Skeleton className="h-7 w-7 rounded-full" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner bell — rendered inside NovuProvider so it can safely use Novu hooks
// (useAdminNotifications, useCounts, etc.) if needed by child components.
// ---------------------------------------------------------------------------
function InnerBell() {
  const navigate = useNavigate();

  const handleRouterPush = (path: string) => {
    try {
      // External URL → open in new tab; in-app path → React Router navigation
      const url = new URL(path, window.location.origin);
      if (url.origin !== window.location.origin) {
        window.open(path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(url.pathname + url.search + url.hash);
      }
    } catch {
      navigate(path);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minWidth: 40, minHeight: 40 }}
    >
      <Inbox
        // applicationIdentifier and subscriberId are inherited from NovuProvider
        routerPush={handleRouterPush}
        appearance={{
          variables: {
            colorPrimary: 'var(--primary)',
            colorPrimaryForeground: 'var(--primary-foreground)',
            colorSecondary: 'var(--secondary)',
            colorSecondaryForeground: 'var(--secondary-foreground)',
            colorBackground: 'var(--background)',
            colorForeground: 'var(--foreground)',
            colorNeutral: 'var(--muted)',
            fontSize: '14px',
            borderRadius: 'var(--radius)',
          },
          elements: {
            bellIcon: {
              // Inherit header text color so it matches surrounding icons
              color: 'var(--theme-heading-text-color, currentColor)',
              width: '22px',
              height: '22px',
            },
            bellDot: {
              // Unread badge uses the primary accent color
              background: 'var(--primary)',
            },
            notificationDot: {
              background: 'var(--primary)',
            },
            dropdownContent: {
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid var(--border)',
            },
          },
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminNotificationBell — public component to mount in the admin header.
//
// Responsibilities:
//   1. Resolve subscriber ID (Keycloak `sub` from Redux / admin_global fallback)
//   2. Fetch HMAC from the notification service before mounting Novu
//   3. Render a skeleton while HMAC is in flight
//   4. Provide NovuProvider context so child hooks (useAdminNotifications) work
// ---------------------------------------------------------------------------
export function AdminNotificationBell() {
  const { subscriberId, subscriberHash, isLoading } = useAdminSubscriberSetup();

  if (isLoading) return <BellSkeleton />;

  return (
    <NovuProvider
      applicationIdentifier={APP_IDENTIFIER}
      subscriberId={subscriberId}
      // subscriberHash is null when HMAC endpoint is absent (dev fallback)
      {...(subscriberHash ? { subscriberHash } : {})}
    >
      <InnerBell />
    </NovuProvider>
  );
}

export default AdminNotificationBell;
