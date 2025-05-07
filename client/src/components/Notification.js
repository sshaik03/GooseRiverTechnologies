import React, { useState, useEffect } from 'react';
import '../css/Notification.css';

const COLOR_MAP = {
  news:   '#069435',
  policy: '#7D2CFF',
  claims: '#ff9b22',
};

const LIGHT_COLOR_MAP = {
  news:   '#e0f4e8', // Lighter green
  policy: '#ede0ff', // Lighter purple
  claims: '#ffeccc', // Lighter orange
};


const Notification = ({
  _id, // Receive the notification ID
  subject,
  body,
  timeSent,
  isRead, // Receive isRead prop
  notificationType,
  onMarkAsRead // Receive the handler function
}) => {
  // Use local state for read status, synchronized with prop
  const [readStatus, setReadStatus] = useState(isRead);
  const [isFlashing, setIsFlashing] = useState(false);

  // Synchronize local state with the prop whenever it changes
  useEffect(() => {
      setReadStatus(isRead);
  }, [isRead]);

  const dt = new Date(timeSent);
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();

  const formattedStamp = isToday
    ? dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const dotColor = COLOR_MAP[notificationType] || '#ccc';
  const flashColor = LIGHT_COLOR_MAP[notificationType] || '#eeeeee';

  const handleClick = () => {
    // Only trigger the mark as read action if it's not already read
    if (!readStatus) {
        // Call the parent handler to mark as read and update backend/state
        onMarkAsRead(_id);

        // Optimistically update local state for immediate feedback (optional but good UX)
        // The useEffect will eventually synchronize if the parent state update comes later
        setReadStatus(true);
    }

    // Trigger the flash effect regardless of initial read status
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 300); // Flash duration
  };

  return (
    <div
      className={`notification-card ${readStatus ? 'read' : ''} ${isFlashing ? 'flash-active' : ''}`}
      onClick={handleClick}
      style={{ '--dot-color': dotColor, '--flash-color': flashColor }}
    >
      <span
        className="notification-dot"
        style={{ backgroundColor: readStatus ? 'transparent' : dotColor }}
      />

      <div className="notification-content">
        <h3 className="notification-subject">{subject}</h3>
        <p className="notification-body">{body}</p>
      </div>

      <div className="notification-time">{formattedStamp}</div>
    </div>
  );
};

export default Notification;