// src/App.js
import React, { useState } from 'react';
import './App.css';
import SideWindow from './components/SideWindow';
import MainWindow from './components/MainWindow';
import LoginPage from './components/LoginPage';
import CreateAccount from './components/CreateAccount';
import logo from './images/gooseRiverLogo.png';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [headerColor, setHeaderColor] = useState('black');
  const [sideWindowMode, setSideWindowMode] = useState('normal'); // 'normal', 'compose', 'view'
  // State to hold the notification data being viewed in the side window
  const [viewedNotification, setViewedNotification] = useState(null);

  const handleLoginSuccess = () => setCurrentPage('main');
  const handleRegisterRedirect = () => setCurrentPage('register');
  const handleLoginRedirect = () => setCurrentPage('login');

  // Handler for clicking a notification in MainWindow
  // This function is called by MainWindow when a notification card is clicked.
  const handleNotificationClick = (notificationData) => {
    setViewedNotification(notificationData);
    setSideWindowMode('view'); // Switch SideWindow to view mode
  };

  // Handler for closing the viewed notification or compose view in SideWindow
  // This function is called by the back button in the SideWindow header.
  const handleCloseSideWindow = () => {
    setViewedNotification(null); // Clear viewed notification
    setSideWindowMode('normal'); // Switch SideWindow back to normal mode
  };

  // Handler for opening compose mode
  // This function is called by the Compose button in MainWindow.
  const handleComposeClick = () => {
    setViewedNotification(null); // Clear viewed notification when composing
    setSideWindowMode('compose'); // Switch SideWindow to compose mode
  };


  return (
    <div className="App">
      <img src={logo} alt="Goose River Logo" className="header-image" />

      {currentPage === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={handleRegisterRedirect}
        />
      )}

      {currentPage === 'register' && (
        <CreateAccount onRegisterSuccess={handleLoginRedirect} />
      )}

      {currentPage === 'main' && (
        <div className="main-layout-container">
          <div className="main-window-wrapper">
            <MainWindow
              setHeaderColor={setHeaderColor}
              // Pass handlers for side window interaction
              handleNotificationClick={handleNotificationClick} // Pass handler for clicking notifications
              handleComposeClick={handleComposeClick} // Pass handler for compose button
            />
          </div>
          <SideWindow
            headerColor={headerColor}
            mode={sideWindowMode}
            viewedNotification={viewedNotification} // Pass the notification data
            handleCloseSideWindow={handleCloseSideWindow} // Pass the handler to close any side window view
          />
        </div>
      )}
    </div>
  );
};

export default App;