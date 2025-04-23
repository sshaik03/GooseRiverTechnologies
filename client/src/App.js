import React, { useState } from 'react';
import './App.css';
import SideWindow from './components/SideWindow';
import MainWindow from './components/MainWindow';
import LoginPage from './components/LoginPage';
import CreateAccount from './components/CreateAccount';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [headerColor, setHeaderColor] = useState('black');
  const [sideWindowMode, setSideWindowMode] = useState('normal');

  const handleLoginSuccess = () => setCurrentPage('main');
  const handleRegisterRedirect = () => setCurrentPage('register');
  const handleLoginRedirect = () => setCurrentPage('login'); // After registration, typically go back to login

  return (
    <div className="App">
      {/* The spacer div is removed as the new flex layout handles centering */}
      {/* It was causing issues with centering the login/create pages */}

      {currentPage === 'login' && (
        // LoginPage is a direct child of .App when active, centered by .App flex styles
        <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterRedirect} />
      )}

      {currentPage === 'register' && (
        // CreateAccount is a direct child of .App when active, centered by .App flex styles
        <CreateAccount onRegisterSuccess={handleLoginRedirect} />
      )}

      {currentPage === 'main' && (
        // New container to hold Main and Side windows side-by-side and center them
        <div className="main-layout-container">
          {/* The wrapper is kept but padding is removed in CSS */}
          <div className="main-window-wrapper">
            <MainWindow setHeaderColor={setHeaderColor} setSideWindowMode={setSideWindowMode} />
          </div>
          {/* SideWindow is now part of the flex layout */}
          <SideWindow headerColor={headerColor} mode={sideWindowMode} setSideWindowMode={setSideWindowMode} />
        </div>
      )}
    </div>
  );
};

export default App;