import React from 'react';
import '../css/Notification.css';

const COLOR_MAP = {
  news:   '#069435',
  policy: '#7D2CFF',
  claims: '#ff9b22',
};

const Notification = ({
  subject,
  body,
  timeSent,
  isRead,
  notificationType
}) => {
  const dt = new Date(timeSent);
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();

  const formattedStamp = isToday
    ? dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const dotColor = COLOR_MAP[notificationType] || '#ccc';

  return (
    <div className="notification-card">
      {!isRead && (
        <span
          className="notification-dot"
          style={{ backgroundColor: dotColor }}
        />
      )}

      <div className="notification-content">
        <h3 className="notification-subject">{subject}</h3>
        <p className="notification-body">{body}</p>
      </div>

      <div className="notification-time">{formattedStamp}</div>
    </div>
  );
};

export default Notification;
