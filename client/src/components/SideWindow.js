import React, { useState } from 'react';
import '../css/SideWindow.css';
import { IoStar, IoSend, IoReader, IoChevronBack } from 'react-icons/io5';
import { getUserFromToken } from '../utils/auth'; // Assuming this utility exists and works

// Receive viewedNotification and the handler to close the side window
const SideWindow = ({ headerColor, mode, viewedNotification, handleCloseSideWindow }) => {
  // State for normal mode sub-states
  const [activeState, setActiveState] = useState("stars");
  const btnColor = headerColor || 'black';

  // State for compose mode form
  const [selectedCategory, setSelectedCategory] = useState("news");
  const [recipients, setRecipients] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // State for the reply message body in view mode (New)
  const [replyBody, setReplyBody] = useState('');


  // Define the categories and their colors for compose mode
  const categories = {
    news: { name: "News", color: '#069435' },
    policy: { name: "Policies", color: '#7D2CFF' },
    claims: { name: "Claims", color: '#ff9b22' },
  };

  // Function to handle sending a new message (from compose mode)
  const handleSend = async () => {
    const user = getUserFromToken(); // Current logged-in user is the sender
    if (!user) {
      alert('You must be logged in to send a message.');
      return;
    }

    if (!recipients || !title || !body) {
      alert('Please fill out all fields.');
      return;
    }

    // Basic validation for recipient format (optional but good practice)
    // This assumes recipients is a single username or email
    // If multiple recipients are allowed, this logic needs to be more complex
     if (!recipients.includes('@') && recipients.length < 3) { // Example simple check for username
         alert('Please enter a valid recipient username or email.');
         return;
     }


    try {
      // 1. Fetch recipient's unique_id based on username or email
      // This assumes your backend has an endpoint like POST /user-by-username-or-email
      const res1 = await fetch('http://localhost:4000/user-by-username-or-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: recipients })
      });
      const recipientData = await res1.json();
      if (!res1.ok) {
         // If recipient not found or other error
         throw new Error(recipientData.message || 'Recipient not found.');
      }
      if (!recipientData || !recipientData.unique_id) {
           throw new Error('Could not retrieve recipient ID.');
      }

      const recipient_id = recipientData.unique_id;

      // 2. Send the message
      // This assumes your backend has an endpoint like POST /notifications
      const res2 = await fetch('http://localhost:4000/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: selectedCategory === "policies" ? "policy" : selectedCategory, // Map 'Policies' to 'policy' if needed by backend
          sender_id: user.user_id, // Assuming user object from getToken has user_id property
          recipient_id: recipient_id,
          subject: title,
          body: body,
          is_important: false // Default or add a checkbox for this
        })
      });

      const result = await res2.json();
      if (!res2.ok) {
         // If sending failed
         throw new Error(result.message || 'Failed to send message.');
      }

      alert('Message sent successfully!');
      // Clear fields after successful send
      setRecipients('');
      setTitle('');
      setBody('');
      setSelectedCategory('news'); // Reset category
      // Optionally close compose window after sending
      // handleCloseSideWindow(); // Uncomment this line if you want to close the side window after sending
    } catch (err) {
      console.error('Error sending message:', err);
      // Display user-friendly error message
      alert('Failed to send message: ' + err.message);
    }
  };

  // Function to handle sending a reply (New)
  const handleSendReply = async () => {
      const user = getUserFromToken(); // Current logged-in user is the sender
      if (!user) {
          alert('You must be logged in to send a reply.');
          return;
      }

      if (!replyBody.trim()) { // Check if reply body is empty or only whitespace
          alert('Reply body cannot be empty.');
          return;
      }

      if (!viewedNotification) {
          alert('Cannot send reply: No message selected.');
          return;
      }

      const originalSenderId = viewedNotification.sender_id; // Sender of the original message is the recipient of the reply
      const originalSubject = viewedNotification.subject;
      const replySubject = `REPLY - ${originalSubject}`;
      const replyMessageType = viewedNotification.notification_type; // Use the same type as the original message

      // Assuming you can send a reply using the same /notifications POST endpoint
      try {
          const res = await fetch('http://localhost:4000/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  notification_type: replyMessageType,
                  sender_id: user.user_id, // Current user
                  recipient_id: originalSenderId, // Original sender
                  subject: replySubject,
                  body: replyBody,
                  is_important: false // Replies are not automatically important, adjust if needed
              })
          });

          const result = await res.json();
          if (!res.ok) {
              throw new Error(result.message || 'Failed to send reply.');
          }

          alert('Reply sent successfully!');
          setReplyBody(''); // Clear the reply textarea after successful send
          // Keep the view mode open
      } catch (err) {
          console.error('Error sending reply:', err);
          alert('Failed to send reply: ' + err.message);
      }
  };


  // Helper function to format time for the view mode
  const formatViewTime = (timeSent) => {
      if (!timeSent) return '';
      const dt = new Date(timeSent);
      return dt.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }); // Example format
  };


  // --- Conditional Rendering Based on Mode ---

  if (mode === "compose") {
    return (
      <div className="side-window">
        <div className="compose-header">
          {/* Back button in compose mode goes back to normal view */}
          <button className="back-button" onClick={handleCloseSideWindow}>
            <IoChevronBack size={24} />
          </button>
          <span className="compose-header-text">New Message</span>
        </div>
        <div className="compose-content">
          <div className="compose-form">
            <div className="form-group">
              <label>Recipients</label>
              <input
                type="text"
                placeholder="Enter recipient username or email"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Body</label>
              <textarea
                placeholder="Enter message body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>
          <div className="compose-footer">
            <div className="mark-buttons">
              {Object.entries(categories).map(([key, { name, color }]) => (
                <button
                  key={key}
                  className={`mark-button ${selectedCategory === key ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedCategory(key)}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              className="send-button"
              style={{ backgroundColor: categories[selectedCategory]?.color || 'black' }}
              onClick={handleSend}
            >
              <span>Send</span>
              <IoSend size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New View mode rendering
  if (mode === "view" && viewedNotification) {
      // Format the time for display in view mode
      const formattedViewTime = formatViewTime(viewedNotification.time_sent);

      // Determine color for the reply button (optional, could default to black)
      // Using the color of the original message's type for consistency
      const replyButtonColor = categories[viewedNotification.notification_type]?.color || 'black';

      // Check if sender_username is available before displaying
      const senderUsername = viewedNotification.sender_username || 'Unknown Sender';


      return (
          <div className="side-window">
              <div className="view-header"> {/* Use view-header class */}
                  {/* Back button in view mode goes back to normal view */}
                  <button className="back-button" onClick={handleCloseSideWindow}>
                      <IoChevronBack size={24} />
                  </button>
                   {/* Display a title for the view mode including sender */}
                  <span className="view-header-text">Message</span>
              </div>
              <div className="view-content"> {/* Use view-content class */}
                  <div className="view-message-details">
                      <h3>{viewedNotification.subject}</h3>
                      <p>{viewedNotification.body}</p>
                      <span className="view-time">{formattedViewTime}</span>
                      {/* You could add sender details here if they are in the viewedNotification object */}
                      {/* Example: <p>From: {viewedNotification.sender_name}</p> */}
                  </div>

                  {/* Reply Area (New) */}
                  <div className="reply-area">
                      <label>Reply:</label>
                      <textarea
                          placeholder="Type your reply here..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                      />
                      <button
                          className="send-button" // Reuse send-button style
                          style={{ backgroundColor: replyButtonColor }}
                          onClick={handleSendReply}
                      >
                          <span>Send Reply</span>
                          <IoSend size={24} />
                      </button>
                  </div> {/* End Reply Area */}

              </div>
          </div>
      );
  }


  // Default Normal mode view
  return (
    <div className="side-window">
      <div className="side-window-header">
        <div className="button-container">
          <button
            className={`header-button ${activeState === "stars" ? "active" : ""}`}
            style={{ backgroundColor: btnColor }}
            onClick={() => setActiveState("stars")}
          >
            <span className="button-text">Stars</span>
            <IoStar className="button-icon" size={24} />
          </button>
          <button
            className={`header-button ${activeState === "sent" ? "active" : ""}`}
            style={{ backgroundColor: btnColor }}
            onClick={() => setActiveState("sent")}
          >
            <span className="button-text">Sent</span>
            <IoSend className="button-icon" size={24} />
          </button>
          <button
            className={`header-button ${activeState === "drafts" ? "active" : ""}`}
            style={{ backgroundColor: btnColor }}
            onClick={() => setActiveState("drafts")}
          >
            <span className="button-text">Drafts</span>
            <IoReader className="button-icon" size={24} />
          </button>
        </div>
      </div>
      <div className="side-window-content">
        <div className="state-content">
          {activeState === "stars" && (
            <div className="state-message">
              <IoStar size={62} className="state-icon" />
              <p>You haven't starred any messages yet.</p>
            </div>
          )}
          {activeState === "sent" && (
            <div className="state-message">
              <IoSend size={62} className="state-icon" />
              <p>You haven't sent any messages yet.</p>
            </div>
          )}
          {activeState === "drafts" && (
            <div className="state-message">
              <IoReader size={62} className="state-icon" />
              <p>You haven't drafted any messages yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideWindow;