import { Inbox } from '@novu/react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';

function NotificationInbox() {
  const envId = import.meta.env?.VITE_NOVU_APPLICATION_IDENTIFIER;
  const procId = typeof process !== 'undefined' ? process.env?.REACT_APP_NOVU_APPLICATION_IDENTIFIER : undefined;
  const applicationIdentifier = envId || procId || "6nwZO95IADDN";

  const subscriberId = useSelector((state: RootState) => state.block.userId) || "6a06f2c638dc4a625be7b616";

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
            colorPrimary: 'var(--primary, #0f172a)',
            colorPrimaryForeground: '#ffffff',
            colorSecondary: 'var(--muted, #f1f5f9)',
            colorSecondaryForeground: 'var(--foreground, #0f172a)',
            colorBackground: '#ffffff',
            colorForeground: 'var(--foreground, #0f172a)',
            colorNeutral: 'var(--border, #e2e8f0)',
            fontSize: '14px',
            borderRadius: '10px',
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
              borderRadius: 14,
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
      `}</style>
    </div>
  );
}

export default NotificationInbox;
