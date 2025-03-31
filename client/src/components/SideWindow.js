import React, { useState } from 'react';
import '../css/SideWindow.css';
import { IoStar, IoSend, IoReader } from 'react-icons/io5';

const SideWindow = ({ headerColor, children }) => {
  // "stars", "sent", or "drafts" content state
  const [activeState, setActiveState] = useState("stars");
  const btnColor = headerColor || 'black';

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
