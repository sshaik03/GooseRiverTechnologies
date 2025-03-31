import React, { useState } from 'react';
import './App.css';
import duckCreekHeader from './images/DuckCreekHeader.png';
import SideWindow from './components/SideWindow';

function App() {
  // headerColor state drives the background color of the side window header buttons
  const [headerColor, setHeaderColor] = useState('black');

  return (
    <div className="App">
      <img
        src={duckCreekHeader}
        alt="Duck Creek Header"
        className="header-image"
      />
      <div className="external-buttons">
        <button onClick={() => setHeaderColor('black')}>Everything</button>
        <button onClick={() => setHeaderColor('#069435')}>News</button>
        <button onClick={() => setHeaderColor('#7D2CFF')}>Policies</button>
        <button onClick={() => setHeaderColor('#ff9b22')}>Claims</button>
      </div>
      <SideWindow headerColor={headerColor} />
    </div>
  );
}

export default App;
