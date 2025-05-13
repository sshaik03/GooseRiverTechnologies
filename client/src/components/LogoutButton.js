import React from 'react';
import { IoLogOutOutline } from 'react-icons/io5';

const LogoutButton = ({ onLogout }) => (
  <button className="compose-button" onClick={onLogout}>
    <span className="button-text">Logout</span>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <IoLogOutOutline className="button-icon" size={28} />
=======
    <IoLogOutOutline className="button-icon" size={32} />
>>>>>>> Stashed changes
=======
    <IoLogOutOutline className="button-icon" size={32} />
>>>>>>> Stashed changes
  </button>
);

export default LogoutButton;
