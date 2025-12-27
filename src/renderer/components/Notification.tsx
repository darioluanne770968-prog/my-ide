import React, { useEffect, useState } from 'react';

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

function Notification({ notifications, onDismiss }: NotificationProps) {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: NotificationItem;
  onDismiss: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`notification-toast ${notification.type} ${isExiting ? 'exiting' : ''}`}
    >
      <span className="notification-icon">{getIcon()}</span>
      <span className="notification-message">{notification.message}</span>
      {notification.action && (
        <button
          className="notification-action"
          onClick={notification.action.onClick}
        >
          {notification.action.label}
        </button>
      )}
      <button className="notification-close" onClick={handleDismiss}>
        ×
      </button>
    </div>
  );
}

export default Notification;
