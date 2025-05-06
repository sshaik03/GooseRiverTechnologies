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

const PAGE_SIZE = 10;

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
      const typeMap = { News: 'news', Policies: 'policy', Claims: 'claims' };
      let url = `http://localhost:4000/notifications?recipient_id=${user.user_id}`;
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
        setCurrentPage(0);
      }
    };
    fetchNotifications();
  }, [activeTab]);

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);
  const startIndex = currentPage * PAGE_SIZE;
  const pageItems  = notifications.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="main-window">
      {/* Top Row: Tabs (left) & Pagination (right) */}
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
                setSideWindowMode('normal');
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="pagination">
          <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
            <IoPlayBackSharp size={20} />
          </button>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0}>
            <IoChevronBackSharp size={20} />
          </button>
          <span>Page {currentPage + 1} of {totalPages}</span>
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

      {/* Search & Compose */}
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

      {/* Notifications List */}
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
                key={note._id}
                subject={note.subject}
                body={note.body}
                timeSent={note.time_sent}
                isRead={note.is_read}
                notificationType={note.notification_type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainWindow;
