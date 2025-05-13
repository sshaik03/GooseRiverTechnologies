import React, { useState } from 'react'; // No need for useEffect if not using local read state derived from prop
import '../css/Notification.css';
import { IoStar, IoSend, IoReader, IoChevronBack } from 'react-icons/io5'; // Ensure necessary icons are imported

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
  notificationData, // Receive the entire notification object
  onClick // Receive the click handler function from parent (MainWindow)
}) => {
  // Destructure properties from notificationData
  // Use defaults for safety in case properties are missing
  const {
      _id,
      subject = 'No Subject',
      body = 'No body content.',
      time_sent,
      is_read = false, // Default to false if missing
      notification_type = 'default' // Default type if missing
  } = notificationData || {}; // Handle case where notificationData might be null/undefined

  // Use a consistent key for COLOR_MAP lookup even if notification_type is missing
  const typeKey = notification_type === 'policy' ? 'policy' : notification_type; // Ensure 'policy' key is used if type is 'policy'

  // State for click flash effect (local state is fine for this visual effect)
  const [isFlashing, setIsFlashing] = useState(false);

  // Format the timestamp (apply manual UTC fix)
  let dt = time_sent ? new Date(time_sent) : null;
  if (dt) {
    // subtract local offset so that the timestamp is treated as UTC
    dt = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  }
  const now = new Date();
  const isToday = dt ? dt.toDateString() === now.toDateString() : false;

  const formattedStamp = dt
    ? (isToday
        ? dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : dt.toLocaleDateString([], { month: 'short', day: 'numeric' }))
    : 'Invalid Date'; // Display 'Invalid Date' if time_sent is not valid

  const dotColor = COLOR_MAP[typeKey] || '#ccc'; // Use typeKey for color lookup
  const flashColor = LIGHT_COLOR_MAP[typeKey] || '#eeeeee';

  const handleClick = () => {
    // Call the click handler function passed from the parent,
    // providing the full notification data.
    // Ensure notificationData is valid before calling onClick
    if (notificationData && onClick) {
      onClick(notificationData);
    }

    // Trigger the flash effect regardless, for visual feedback
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
    }, 300); // Flash duration in milliseconds
  };

  return (
    <div
      className={`notification-card ${is_read ? 'read' : ''} ${isFlashing ? 'flash-active' : ''}`}
      onClick={handleClick}
      style={{ '--dot-color': dotColor, '--flash-color': flashColor }}
    >
      {/* The dot styling is based on is_read from data */}
      {/* Only render the dot if the message is NOT read */}
      {!is_read && (
         <span
           className="notification-dot"
           style={{ backgroundColor: dotColor }}
         />
      )}
      {/* Render the outline dot if the message IS read */}
      {is_read && (
         <span
           className="notification-dot read-dot" // Added 'read-dot' class for potential specific styles if needed
           style={{ borderColor: dotColor }} // Use border for outline
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
