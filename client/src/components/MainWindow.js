import React, { useState, useEffect } from 'react';
import '../css/MainWindow.css';
import { IoMail, IoCreate } from 'react-icons/io5';
import { getUserFromToken } from '../utils/auth';

const MainWindow = ({ setHeaderColor, setSideWindowMode }) => {
  const [activeTab, setActiveTab] = useState('Everything');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { name: 'Everything', color: 'black' },
    { name: 'News', color: '#069435' },
    { name: 'Policies', color: '#7D2CFF' },
    { name: 'Claims', color: '#ff9b22' },
  ];

  // Find the color of the active tab
  const activeTabColor = tabs.find((tab) => tab.name === activeTab)?.color || 'black';

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = getUserFromToken();
      if (!user) return;
  
      let url = `http://localhost:4000/notifications?recipient_id=${user.user_id}`;
  
      if (activeTab === 'News') {
        url += `&notification_type=news`;
      } else if (activeTab === 'Policies') {
        url += `&notification_type=policy`;
      } else if (activeTab === 'Claims') {
        url += `&notification_type=claims`;
      }
      // "Everything" just uses the base URL with recipient_id
  
      try {
        const res = await fetch(url);
        const data = await res.json();
        setNotifications(data);
      } catch (e) {
        console.error('Error fetching notifications:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab]); // Fetch notifications again when the active tab changes

  return (
    <div className="main-window">
      {/* Tabbed Header */}
      <div className="tab-header">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`tab-button ${activeTab === tab.name ? 'active' : ''}`}
            style={{ color: tab.color }}
            onClick={() => {
              setActiveTab(tab.name);
              setHeaderColor(tab.color);
              setSideWindowMode('normal');
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Search and Sort Area */}
      <div className="search-sort-area">
        <div className="search">
          <label>Search:</label>
          <input type="text" placeholder="Search messages" />
        </div>
        <div className="sort">
          <label>Sort By:</label>
          <select>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
        <button
          className="compose-button"
          style={{ backgroundColor: activeTabColor }}
          onClick={() => setSideWindowMode('compose')}
        >
          <span className="button-text">Compose</span>
          <IoCreate className="button-icon" size={32} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <IoMail size={62} className="empty-icon" />
            <p>No messages of this type yet.</p>
          </div>
        ) : (
          notifications.map((note) => (
            <div key={note._id} className="notification-card">
              <h3>{note.subject}</h3>
              <p>{note.body}</p>
              <small>{new Date(note.time_sent).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MainWindow;