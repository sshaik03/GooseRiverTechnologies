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

const MainWindow = ({ setHeaderColor, handleNotificationClick, handleComposeClick }) => {
  const [activeTab, setActiveTab]         = useState('Everything');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(0);

  // search state
  const [searchTerm, setSearchTerm]   = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // NEW: sort state
  const [sortOrder, setSortOrder]     = useState('newest');

  const tabs = [
    { name: 'Everything', color: 'black' },
    { name: 'News',       color: '#069435' },
    { name: 'Policies',   color: '#7D2CFF' },
    { name: 'Claims',     color: '#ff9b22' },
  ];
  const activeTabColor = tabs.find(t => t.name === activeTab)?.color || 'black';

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
      if (typeMap[activeTab]) url += `&notification_type=${typeMap[activeTab]}`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('API Error:', await res.text());
          setNotifications([]);
          return;
        }
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Fetch error:', e);
        setNotifications([]);
      } finally {
        setLoading(false);
        setCurrentPage(0);
        setSearchQuery('');
        setSearchTerm('');
      }
    };
    fetchNotifications();
  }, [activeTab]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:4000/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });
      if (!res.ok) {
        console.error('Mark-as-read failed:', await res.text());
        return;
      }
      setNotifications(ns =>
        ns.map(n => n._id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (e) {
      console.error('Fetch error marking read:', e);
    }
  };

  const onNotificationCardClick = (notificationData) => {
    if (!notificationData.is_read) handleMarkAsRead(notificationData._id);
    handleNotificationClick(notificationData);
  };

  // 1) filter by searchQuery
  const filtered = searchQuery
    ? notifications.filter(n =>
        n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notifications;

  // 2) sort by time_sent
  const sortedNotifications = [...filtered].sort((a, b) => {
    const ta = new Date(a.time_sent).getTime();
    const tb = new Date(b.time_sent).getTime();
    return sortOrder === 'newest' ? tb - ta : ta - tb;
  });

  // 3) paginate
  const totalItems = sortedNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = currentPage * PAGE_SIZE;
  const endIndex   = Math.min(startIndex + PAGE_SIZE, totalItems);
  const pageItems  = sortedNotifications.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  return (
    <div className="main-window">
      <div className="fixed-header-area">
        {/* Tabs & Pagination */}
        <div className="tab-pagination-header">
          <div className="tab-header">
            {tabs.map(tab => (
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
            <span>{`${startIndex + 1}-${endIndex} of ${totalItems}`}</span>
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

        {/* Search, Sort & Compose */}
        <div className="search-sort-area">
          <div className="search">
            <label htmlFor="search-input">Search:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Type and hit enter"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearchQuery(searchTerm.trim());
                  setCurrentPage(0);
                }
              }}
            />
          </div>
          <div className="sort">
            <label htmlFor="sort-select">Sort By:</label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={e => {
                setSortOrder(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          <button
            className="compose-button"
            style={{ backgroundColor: activeTabColor }}
            onClick={handleComposeClick}
          >
            <span className="button-text">Compose</span>
            <IoCreate className="button-icon" size={32} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="main-content">
        {loading ? (
          <p>Loading notifications...</p>
        ) : sortedNotifications.length === 0 ? (
          <div className="empty-state">
            <IoMail size={62} className="empty-icon" />
            <p>{searchQuery ? 'No matching messages.' : 'No messages of this type yet.'}</p>
          </div>
        ) : (
          <div className="notification-list">
            {pageItems.map(note => (
              <Notification
                key={note._id}
                notificationData={note}
                onClick={onNotificationCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainWindow;
