// src/components/MainWindow.js
import React, { useState, useEffect } from 'react';
import '../css/MainWindow.css';
import {
  IoMail,
  IoCreate,
  IoPlayBackSharp,
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoPlayForwardSharp
} from 'react-icons/io5';
import { getUserFromToken } from '../utils/auth';
import Notification from './Notification';

const PAGE_SIZE = 10; // Changed back to 10 as per original code, adjust if needed

const MainWindow = ({ setHeaderColor, setSideWindowMode }) => {
  const [activeTab, setActiveTab]         = useState('Everything');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(0);

  const tabs = [
    { name: 'Everything', color: 'black' },
    { name: 'News',       color: '#069435' },
    { name: 'Policies',   color: '#7D2CFF' },
    { name: 'Claims',     color: '#ff9b22' },
  ];
  const activeTabColor = tabs.find((t) => t.name === activeTab)?.color || 'black';

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const user = getUserFromToken();
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const typeMap = { Everything: null, News: 'news', Policies: 'policy', Claims: 'claims' };
      let url = `http://localhost:4000/notifications?recipient_id=${user.user_id}`;
      // Only add type filter if not 'Everything'
      if (typeMap[activeTab]) url += `&notification_type=${typeMap[activeTab]}`;
      try {
        const res  = await fetch(url);
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching notifications:', e);
        setNotifications([]);
      } finally {
        setLoading(false);
        setCurrentPage(0); // Reset page when tab changes
      }
    };
    fetchNotifications();
  }, [activeTab]); // Depend on activeTab

  // Function to handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:4000/notifications/${notificationId}`, {
        method: 'PATCH', // Use PATCH to update a portion of the resource
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if your API requires it
          // 'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ is_read: true })
      });

      if (!res.ok) {
        // Handle API error
        const errorData = await res.json();
        console.error('Failed to mark notification as read:', errorData.message);
        // Optionally show an error to the user
        return;
      }

      // Update the local state to reflect the change immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(note =>
          note._id === notificationId ? { ...note, is_read: true } : note
        )
      );

    } catch (e) {
      console.error('Error marking notification as read:', e);
      // Optionally show an error to the user
    }
  };


  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE)); // Ensure totalPages is at least 1
  const startIndex = currentPage * PAGE_SIZE;
  const pageItems  = notifications.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="main-window">
      <div className="fixed-header-area">
        <div className="tab-pagination-header">
          <div className="tab-header">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                className={`tab-button ${activeTab === tab.name ? 'active' : ''}`}
                style={{ color: tab.color }}
                onClick={() => {
                  setActiveTab(tab.name);
                  setHeaderColor(tab.color);
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="pagination">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
              <IoPlayBackSharp size={20} />
            </button>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0}>
              <IoChevronBackSharp size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <IoChevronForwardSharp size={20} />
            </button>
            <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}>
              <IoPlayForwardSharp size={20} />
            </button>
          </div>
        </div>

        <div className="search-sort-area">
          <div className="search">
            <label>Search:</label>
            <input type="text" placeholder="Search messages" /> {/* TODO: Add search functionality */}
          </div>
          <div className="sort">
            <label>Sort By:</label>
            <select> {/* TODO: Add sort functionality */}
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
      </div>

      <div className="main-content">
        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <IoMail size={62} className="empty-icon" />
            <p>No messages of this type yet.</p>
          </div>
        ) : (
          <div className="notification-list">
            {pageItems.map(note => (
              <Notification
                key={note._id} // Keep the key
                _id={note._id} // Pass the ID to the child component
                subject={note.subject}
                body={note.body}
                timeSent={note.time_sent}
                isRead={note.is_read}
                notificationType={note.notification_type}
                onMarkAsRead={handleMarkAsRead} // Pass the handler down
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainWindow;