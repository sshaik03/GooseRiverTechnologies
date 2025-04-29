import React, { useState } from 'react';
import '../css/SideWindow.css';
import { IoStar, IoSend, IoReader, IoChevronBack } from 'react-icons/io5';
import { getUserFromToken } from '../utils/auth'; // adjust path if needed

const SideWindow = ({ headerColor, mode, setSideWindowMode }) => {
  // In normal mode, we track which sub-state is active ("stars", "sent", "drafts")
  const [activeState, setActiveState] = useState("stars");
  const btnColor = headerColor || 'black';

  // State to track the selected category in compose mode ("news", "policies", "claims")
  const [selectedCategory, setSelectedCategory] = useState("news");
  const [recipients, setRecipients] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // Define the categories and their colors
  const categories = {
    news: { name: "News", color: '#069435' },
    policies: { name: "Policies", color: '#7D2CFF' },
    claims: { name: "Claims", color: '#ff9b22' },
  };

  const handleSend = async () => {
    const user = getUserFromToken();
    if (!user) {
      alert('You must be logged in to send a message.');
      return;
    }

    if (!recipients || !title || !body) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      // 1. Fetch recipient's unique_id
      const res1 = await fetch('http://localhost:4000/user-by-username-or-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: recipients })
      });
      const recipientData = await res1.json();
      if (!res1.ok) throw new Error(recipientData.message);

      const recipient_id = recipientData.unique_id;

      // 2. Send the message
      const res2 = await fetch('http://localhost:4000/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: selectedCategory === "policies" ? "policy" : selectedCategory,
          sender_id: user.user_id,
          recipient_id,
          subject: title,
          body,
          is_important: false
        })
      });

      const result = await res2.json();
      if (!res2.ok) throw new Error(result.message);

      alert('Message sent successfully!');
      // Clear fields
      setRecipients('');
      setTitle('');
      setBody('');
      setSelectedCategory('news');
      setSideWindowMode('normal'); // optionally close compose window
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    }
  };

  if (mode === "compose") {
    return (
      <div className="side-window">
        <div className="compose-header">
          <button className="back-button" onClick={() => setSideWindowMode('normal')}>
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
              style={{ backgroundColor: categories[selectedCategory].color }}
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

  // Normal mode view
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