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
import { getUserFromToken } from '../utils/auth'; // Assuming this utility exists and works
import Notification from './Notification';

const PAGE_SIZE = 10;

// Receive the new handlers from App.js
const MainWindow = ({ setHeaderColor, handleNotificationClick, handleComposeClick }) => {
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

  // Effect to fetch notifications when the activeTab changes or on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const user = getUserFromToken();
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      // Map tab names to backend notification types
      const typeMap = { Everything: null, News: 'news', Policies: 'policy', Claims: 'claims' };
      // Construct the API URL
      let url = `http://localhost:4000/notifications?recipient_id=${user.user_id}`;
      // Add type filter if not 'Everything'
      if (typeMap[activeTab]) {
        url += `&notification_type=${typeMap[activeTab]}`;
      }
      // TODO: Add search and sort parameters to the URL based on user input


      try {
        const res  = await fetch(url);
        // Check if the response is ok (status 200-299)
        if (!res.ok) {
             const errorData = await res.json(); // Attempt to read error body
             console.error('API Error fetching notifications:', errorData.message || res.statusText);
             // Depending on the error (e.g., auth failure), you might want to redirect to login
             setNotifications([]); // Clear previous notifications on error
             return; // Stop execution
        }
        const data = await res.json();
         // Ensure data is an array; if API returns something else on success, handle it
        setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Fetch error fetching notifications:', e);
        setNotifications([]); // Clear notifications on fetch error
      } finally {
        setLoading(false);
        setCurrentPage(0); // Reset page when tab changes or data is fetched
      }
    };
    fetchNotifications();
  }, [activeTab]); // Rerun effect when activeTab changes


  // Function to handle marking a notification as read (internal to MainWindow)
  // This function is called by onNotificationCardClick
  const handleMarkAsRead = async (notificationId) => {
    try {
      // Assume PATCH /notifications/:id updates the notification
      const res = await fetch(`http://localhost:4000/notifications/${notificationId}`, {
        method: 'PATCH', // Use PATCH to update a portion of the resource
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if your API requires it, e.g.:
          // 'Authorization': `Bearer ${getUserToken()}` // Assuming getToken exists
        },
        body: JSON.stringify({ is_read: true }) // Send the field to update
      });

      if (!res.ok) {
        // Handle API error (e.g., not found, forbidden)
        const errorData = await res.json();
        console.error('Failed to mark notification as read:', errorData.message || res.statusText);
        // Optionally show a user-friendly error message (e.g., a toast)
        return; // Stop if API call failed
      }

      // If API call was successful, update the local state
      setNotifications(prevNotifications =>
        prevNotifications.map(note =>
          note._id === notificationId ? { ...note, is_read: true } : note // Update is_read for the matched note
        )
      );
      // No alert on success for marking as read, as the visual change is feedback
      console.log(`Notification ${notificationId} marked as read.`); // Log success
    } catch (e) {
      console.error('Fetch error marking notification as read:', e);
      // Optionally show a user-friendly error message for fetch failure
    }
  };

  // This is the function passed down to the Notification component's onClick prop
  // It combines marking as read and showing in the side window
  const onNotificationCardClick = (notificationData) => {
      // First, handle marking as read if it's not already read
      // We check the is_read status from the current notificationData prop
      if (!notificationData.is_read) {
          handleMarkAsRead(notificationData._id); // Call internal handler to update backend and local state
      }
      // Then, call the App-level handler to show the notification details in the SideWindow
      // This also changes the sideWindowMode to 'view' in App.js
      handleNotificationClick(notificationData);
  };


  // Calculate pagination details
  const totalItems = notifications.length;
  // Ensure totalPages is at least 1 even if there are no items
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = currentPage * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems); // Ensure we don't go past the end
  const pageItems  = notifications.slice(startIndex, endIndex);

  // Update currentPage state if the current page becomes invalid
  // (e.g., if filtering/tab change reduces the number of total pages)
  useEffect(() => {
      if (currentPage >= totalPages) {
          setCurrentPage(Math.max(0, totalPages - 1)); // Go to the last page or page 0
      }
  }, [totalPages, currentPage]); // Rerun effect when totalPages or currentPage changes


  return (
    <div className="main-window">
      {/* --- Container for sticky header --- */}
      {/* This div is now part of the normal flow, becoming sticky when it reaches 'top' */}
      <div className="fixed-header-area">
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
                  // When changing tabs, you might want to close the side window if it's open
                  // handleCloseSideWindow(); // Uncomment if desired behavior
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="pagination">
             {/* Displaying item range and total items is often more helpful */}
             <span>{`${startIndex + 1}-${endIndex} of ${totalItems}`}</span>
             {/*<span>Page {currentPage + 1} of {totalPages}</span>*/}
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

        {/* Search & Compose */}
        <div className="search-sort-area">
          <div className="search">
            <label htmlFor="search-input">Search:</label> {/* Added htmlFor */}
            <input id="search-input" type="text" placeholder="Search messages" /> {/* TODO: Add search functionality */}
          </div>
          <div className="sort">
            <label htmlFor="sort-select">Sort By:</label> {/* Added htmlFor */}
            <select id="sort-select"> {/* TODO: Add sort functionality */}
              <option value="newest">Newest</option> {/* Added value attribute */}
              <option value="oldest">Oldest</option> {/* Added value attribute */}
            </select>
          </div>
          <button
            className="compose-button"
            style={{ backgroundColor: activeTabColor }}
            // Use the handler from App.js to set compose mode
            onClick={handleComposeClick}
          >
            <span className="button-text">Compose</span>
            <IoCreate className="button-icon" size={32} />
          </button>
        </div>
      </div> {/* --- End of fixed-header-area --- */}


      {/* Notifications List - This is the content below the sticky header */}
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
            {/* Map over the items for the current page */}
            {pageItems.map(note => (
              <Notification
                key={note._id} // Use _id as key
                notificationData={note} // Pass the full notification object
                onClick={onNotificationCardClick} // Pass the local combined click handler
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainWindow;