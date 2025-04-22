import React, { useState } from 'react';
import '../css/SideWindow.css';
import { IoStar, IoSend, IoReader, IoChevronBack } from 'react-icons/io5';

const SideWindow = ({ headerColor, mode, setSideWindowMode }) => {
  // In normal mode, we track which sub-state is active ("stars", "sent", "drafts")
  const [activeState, setActiveState] = useState("stars");
  const btnColor = headerColor || 'black';

  // State to track the selected category in compose mode ("news", "policies", "claims")
  const [selectedCategory, setSelectedCategory] = useState("news");

  // Define the categories and their colors
  const categories = {
    news: { name: "News", color: '#069435' },
    policies: { name: "Policies", color: '#7D2CFF' },
    claims: { name: "Claims", color: '#ff9b22' },
  };

  if (mode === "compose") {
    return (
      <div className="side-window">
        {/* Compose Mode Header */}
        <div className="compose-header">
          <button className="back-button" onClick={() => setSideWindowMode('normal')}>
            <IoChevronBack size={24} />
          </button>
          <span className="compose-header-text">New Message</span>
        </div>
        {/* Compose Form Content */}
        <div className="compose-content">
          <div className="compose-form">
            <div className="form-group">
              <label>Recipients</label>
              <input type="text" placeholder="Enter recipients" />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input type="text" placeholder="Enter title" />
            </div>
            <div className="form-group">
              <label>Body</label>
              <textarea placeholder="Enter message body"></textarea>
            </div>
          </div>
          <div className="compose-footer">
            <div className="mark-buttons">
              <button
                className={`mark-button ${selectedCategory === "news" ? "selected" : ""}`}
                style={{ backgroundColor: categories.news.color }}
                onClick={() => setSelectedCategory("news")}
              >
                News
              </button>
              <button
                className={`mark-button ${selectedCategory === "policies" ? "selected" : ""}`}
                style={{ backgroundColor: categories.policies.color }}
                onClick={() => setSelectedCategory("policies")}
              >
                Policies
              </button>
              <button
                className={`mark-button ${selectedCategory === "claims" ? "selected" : ""}`}
                style={{ backgroundColor: categories.claims.color }}
                onClick={() => setSelectedCategory("claims")}
              >
                Claims
              </button>
            </div>
            <button
              className="send-button"
              style={{ backgroundColor: categories[selectedCategory].color }}
            >
              <span>Send</span>
              <IoSend size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal mode view (stars, sent, drafts)
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