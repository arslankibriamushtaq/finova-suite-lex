import { Inbox } from '@novu/react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';

function NotificationInbox() {
  const envId = import.meta.env?.VITE_NOVU_APPLICATION_IDENTIFIER;
  const procId = typeof process !== 'undefined' ? process.env?.REACT_APP_NOVU_APPLICATION_IDENTIFIER : undefined;
  const applicationIdentifier = envId || procId || "6nwZO95IADDN";

  const subscriberId = useSelector((state: RootState) => state.block.userId) || "6a06f2c638dc4a625be7b616";

  // Reactively pick variables based on the current theme so the inbox popover
  // (which renders inside Novu's own component tree) stays in sync.
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  if (!applicationIdentifier) {
    console.error('Novu Application Identifier is missing');
    return null;
  }

  return (
    <div className="novu-inbox-wrapper">
      <Inbox
        applicationIdentifier={applicationIdentifier}
        subscriberId={subscriberId}
        appearance={{
          variables: {
            colorPrimary: isDark ? '#262a36' : '#0f172a',
            colorPrimaryForeground: '#ffffff',
            colorSecondary: isDark ? '#1c1f2a' : '#f1f5f9',
            colorSecondaryForeground: isDark ? '#e6eaf2' : '#0f172a',
            colorBackground: isDark ? '#161821' : '#ffffff',
            colorForeground: isDark ? '#e6eaf2' : '#0f172a',
            colorNeutral: isDark ? '#262a36' : '#e2e8f0',
            fontSize: '14px',
            borderRadius: '6px',
          },
          elements: {
            bellContainer: {
              width: 42,
              height: 42,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '1px solid var(--border, #e2e8f0)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease',
              cursor: 'pointer',
              position: 'relative',
            },
            bellIcon: {
              color: 'var(--foreground, #0f172a)',
              width: 20,
              height: 20,
              transition: 'color 0.15s ease, transform 0.2s ease',
            },
            bellDot: {
              backgroundColor: 'var(--color-error, #ef4444)',
              border: '2px solid #ffffff',
              boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.18)',
              width: 10,
              height: 10,
              top: 6,
              right: 6,
            },
            popoverContent: {
              border: '1px solid var(--border, #e2e8f0)',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
              borderRadius: 6,
              overflow: 'hidden',
            },
          },
        }}
      />
      <style>{`
        .novu-inbox-wrapper {
          display: inline-flex;
          align-items: center;
          margin-right: 12px;
        }
        .novu-inbox-wrapper .nv-bellContainer:hover {
          background: linear-gradient(180deg, #ffffff 0%, var(--muted, #f1f5f9) 100%) !important;
          border-color: var(--foreground, #0f172a) !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
          transform: translateY(-1px);
        }
        .novu-inbox-wrapper .nv-bellContainer:hover .nv-bellIcon {
          color: var(--foreground, #0f172a) !important;
          transform: rotate(-8deg);
        }
        .novu-inbox-wrapper .nv-bellContainer:active {
          transform: translateY(0);
        }
        @keyframes novu-bell-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18); }
          50%      { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.05); }
        }
        .novu-inbox-wrapper .nv-bellDot {
          animation: novu-bell-pulse 1.8s ease-in-out infinite;
        }

        /* Dark-mode bell — charcoal disc, white icon */
        html.dark .novu-inbox-wrapper .nv-bellContainer {
          background: linear-gradient(180deg, #22252f 0%, #161821 100%) !important;
          border: 1px solid #2c3140 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
        }
        html.dark .novu-inbox-wrapper .nv-bellContainer:hover {
          background: linear-gradient(180deg, #2c3140 0%, #22252f 100%) !important;
          border-color: #3a4050 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }
        html.dark .novu-inbox-wrapper .nv-bellIcon {
          color: #ffffff !important;
        }
        html.dark .novu-inbox-wrapper .nv-bellContainer:hover .nv-bellIcon {
          color: #ffffff !important;
        }
        html.dark .novu-inbox-wrapper .nv-bellDot {
          border-color: #060c1a !important;
        }
        html.dark .novu-inbox-wrapper .nv-popoverContent {
          background: #060c1a !important;
          border: 1px solid #142037 !important;
          color: #e2e8f0 !important;
        }

        /* Dark-mode notification dropdown — global (popover is portaled to body) */
        html.dark [data-novu-component="Popover"],
        html.dark [class*="nv-popover"],
        html.dark .nv-popoverContent,
        html.dark .nv-inbox,
        html.dark [class*="nv-inbox"] {
          background-color: #060c1a !important;
          color: #e2e8f0 !important;
          border-color: #142037 !important;
        }

        /* Notification list rows */
        html.dark .nv-notificationListNewNotificationsNotice,
        html.dark [class*="nv-notification"] {
          color: #e2e8f0 !important;
          background-color: transparent !important;
        }
        html.dark [class*="nv-notification"]:hover {
          background-color: #0a1224 !important;
        }

        /* Section headers / dividers */
        html.dark [class*="nv-tabs"],
        html.dark [class*="nv-header"],
        html.dark [class*="nv-footer"] {
          background-color: #060c1a !important;
          border-color: #142037 !important;
          color: #e2e8f0 !important;
        }

        /* Primary action buttons — dark themed (was rendering pure white) */
        html.dark [class*="nv-button"],
        html.dark [class*="nv-action"],
        html.dark [class*="nv-primaryAction"],
        html.dark [class*="nv-secondaryAction"] {
          background-color: #1a2238 !important;
          color: #ffffff !important;
          border: 1px solid #233354 !important;
          border-radius: 8px !important;
          padding: 6px 14px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          transition: background-color 0.15s ease, border-color 0.15s ease !important;
        }
        html.dark [class*="nv-button"]:hover,
        html.dark [class*="nv-action"]:hover,
        html.dark [class*="nv-primaryAction"]:hover,
        html.dark [class*="nv-secondaryAction"]:hover {
          background-color: #233354 !important;
          border-color: #344768 !important;
        }

        /* Icons (settings / ellipsis / dropdown caret) inside the inbox header */
        html.dark [class*="nv-popoverContent"] svg,
        html.dark .nv-popoverContent svg {
          color: #cbd5e1 !important;
          fill: currentColor;
        }

        /* "Development mode" footer band */
        html.dark [class*="nv-footer"],
        html.dark [class*="nv-developmentBanner"] {
          background: linear-gradient(180deg, transparent 0%, #142037 100%) !important;
          color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
}

export default NotificationInbox;
