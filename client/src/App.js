// src/App.js
import React, { useState } from 'react';
import './App.css';
import SideWindow from './components/SideWindow';
import MainWindow from './components/MainWindow';
import LoginPage from './components/LoginPage';
import CreateAccount from './components/CreateAccount';
import LogoutButton from './components/LogoutButton';  // ← import it here
import logo from './images/gooseRiverLogo.png';

const App = () => {
  const [currentPage, setCurrentPage]             = useState('login');
  const [headerColor, setHeaderColor]             = useState('black');
  const [sideWindowMode, setSideWindowMode]       = useState('normal');
  const [viewedNotification, setViewedNotification] = useState(null);

  const handleLoginSuccess     = () => setCurrentPage('main');
  const handleRegisterRedirect = () => setCurrentPage('register');
  const handleLoginRedirect    = () => setCurrentPage('login');

  // ← clear token & back to login
  const handleLogout = () => {
    localStorage.removeItem('token');   // or however you store it
    setCurrentPage('login');
  };

  const handleNotificationClick = (notificationData) => {
    setViewedNotification(notificationData);
    setSideWindowMode('view');
  };

  const handleCloseSideWindow = () => {
    setViewedNotification(null);
    setSideWindowMode('normal');
  };

  const handleComposeClick = () => {
    setViewedNotification(null);
    setSideWindowMode('compose');
  };

  return (
    <div className="App">
      {/* logo at top left */}
      <img src={logo} alt="Goose River Logo" className="header-image" />

      {/* logout at top right, only on main */}
      {currentPage === 'main' && (
        <div className="logout-wrapper">
          <LogoutButton onLogout={handleLogout} />
        </div>
      )}

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
              handleNotificationClick={handleNotificationClick}
              handleComposeClick={handleComposeClick}
            />
          </div>
          <SideWindow
            headerColor={headerColor}
            mode={sideWindowMode}
            viewedNotification={viewedNotification}
            handleCloseSideWindow={handleCloseSideWindow}
          />
        </div>
      )}
    </div>
  );
};

export default App;
