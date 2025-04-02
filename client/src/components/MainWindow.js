import React, { useState } from 'react';
import '../css/MainWindow.css';
import { IoMail, IoCreate } from 'react-icons/io5';

const MainWindow = ({ setHeaderColor, setSideWindowMode }) => {
  const [activeTab, setActiveTab] = useState('Everything');

  const tabs = [
    { name: 'Everything', color: 'black' },
    { name: 'News', color: '#069435' },
    { name: 'Policies', color: '#7D2CFF' },
    { name: 'Claims', color: '#ff9b22' },
  ];

  // Find the color of the active tab
  const activeTabColor = tabs.find((tab) => tab.name === activeTab)?.color || 'black';

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
        <div className="empty-state">
          <IoMail size={62} className="empty-icon" />
          <p>You haven't received any messages yet.</p>
        </div>
      </div>
    </div>
  );
};

export default MainWindow;