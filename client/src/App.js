import React, { useState } from 'react';
import './App.css';
import duckCreekHeader from './images/DuckCreekHeader.png';
import SideWindow from './components/SideWindow';

function App() {
  // headerColor controls the background color for the side window header buttons in normal mode.
  // sideWindowMode controls whether we're in normal or compose mode.
  const [headerColor, setHeaderColor] = useState('black');
  const [sideWindowMode, setSideWindowMode] = useState('normal'); // "normal" or "compose"

  return (
    <div className="App">
      <img
        src={duckCreekHeader}
        alt="Duck Creek Header"
        className="header-image"
      />
      <div className="external-buttons">
        <button onClick={() => { setHeaderColor('black'); setSideWindowMode('normal'); }}>
          Everything
        </button>
        <button onClick={() => { setHeaderColor('#069435'); setSideWindowMode('normal'); }}>
          News
        </button>
        <button onClick={() => { setHeaderColor('#7D2CFF'); setSideWindowMode('normal'); }}>
          Policies
        </button>
        <button onClick={() => { setHeaderColor('#ff9b22'); setSideWindowMode('normal'); }}>
          Claims
        </button>
        <button 
          onClick={() => setSideWindowMode('compose')}
          style={{ backgroundColor: 'black', color: 'white' }}
        >
          Compose
        </button>
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
