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
  const [sideWindowMode, setSideWindowMode] = useState('normal');

  const handleLoginSuccess = () => setCurrentPage('main');
  const handleRegisterRedirect = () => setCurrentPage('register');
  const handleLoginRedirect = () => setCurrentPage('login');

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
              setSideWindowMode={setSideWindowMode}
            />
          </div>
          <SideWindow
            headerColor={headerColor}
            mode={sideWindowMode}
            setSideWindowMode={setSideWindowMode}
          />
        </div>
      )}
    </div>
  );
};

export default App;
