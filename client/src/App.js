import React, { useState } from 'react';
import './App.css';
import duckCreekHeader from './images/DuckCreekHeader.png';
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
  const handleLoginRedirect = () => setCurrentPage('login');

  return (
    <div className="App">
      <img src={duckCreekHeader} alt="Duck Creek Header" className="header-image" />
      <div className="spacer"></div>

      {currentPage === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterClick={handleRegisterRedirect} />
      )}

      {currentPage === 'register' && (
        <CreateAccount onRegisterSuccess={handleLoginRedirect} />
      )}

      {currentPage === 'main' && (
        <div className="main-window-wrapper">
          <MainWindow setHeaderColor={setHeaderColor} setSideWindowMode={setSideWindowMode} />
        </div>
      )}

      {currentPage === 'main' && (
        <SideWindow headerColor={headerColor} mode={sideWindowMode} setSideWindowMode={setSideWindowMode} />
      )}
    </div>
  );
};

export default App;