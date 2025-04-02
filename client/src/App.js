import React, { useState } from 'react';
import './App.css';
import duckCreekHeader from './images/DuckCreekHeader.png';
import SideWindow from './components/SideWindow';
import MainWindow from './components/MainWindow';

function App() {
  const [headerColor, setHeaderColor] = useState('black');
  const [sideWindowMode, setSideWindowMode] = useState('normal');

  return (
    <div className="App">
      <img
        src={duckCreekHeader}
        alt="Duck Creek Header"
        className="header-image"
      />
      <div className="spacer"></div>
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
  );
}

export default App;