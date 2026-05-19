import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Notification } from '@novu/js';

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { subject, body, createdAt, isRead } = notification;

  const handleClick = () => {
    if (onClick) onClick(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${subject ?? body}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isRead ? 'opacity-70' : 'bg-muted/30',
      ].join(' ')}
    >
      {/* Unread indicator */}
      <span
        aria-hidden="true"
        className={[
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          isRead ? 'bg-transparent' : 'bg-primary',
        ].join(' ')}
      />

      <div className="min-w-0 flex-1">
        {subject && (
          <p className="truncate text-sm font-semibold text-foreground leading-snug">
            {subject}
          </p>
        )}
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2 leading-snug">
          {body}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {dayjs(createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
}

export default NotificationItem;
