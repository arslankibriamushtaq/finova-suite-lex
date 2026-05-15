import { Inbox } from '@novu/react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/rootReducer';

function NotificationInbox() {
  // Safely check env vars
  const envId = import.meta.env?.VITE_NOVU_APPLICATION_IDENTIFIER;
  const procId = typeof process !== 'undefined' ? process.env?.REACT_APP_NOVU_APPLICATION_IDENTIFIER : undefined;
  
  const applicationIdentifier = envId || procId || "6nwZO95IADDN";

  const subscriberId = useSelector((state: RootState) => state.block.userId) || "6a06f2c638dc4a625be7b616";
  
  if (!applicationIdentifier) {
    console.error('Novu Application Identifier is missing');
    return null;
  }

  return (
    <div className="novu-inbox-wrapper" style={{ marginRight: '15px', display: 'flex', alignItems: 'center', minWidth: '40px', minHeight: '40px', border: '1px dashed red' }}>
      <span style={{ color: 'black', marginRight: '5px' }}>🔔</span>
      <Inbox
        applicationIdentifier={applicationIdentifier}
        subscriberId={subscriberId}
        appearance={{
          variables: {
            colorPrimary: '#000000',
            colorPrimaryForeground: '#ffffff',
            colorSecondary: '#eb0d0d',
            colorSecondaryForeground: '#ffffff',
            colorBackground: '#ffffff',
            colorForeground: '#000000',
            colorNeutral: '#dddddd',
            fontSize: '14px',
          },
          elements: {
            bellIcon: {
              color: '#000000',
              width: '24px',
              height: '24px'
            },
          },
        }}
      />
    </div>
  );
}

export default NotificationInbox;
