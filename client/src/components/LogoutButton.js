import React from 'react';
import { IoLogOutOutline } from 'react-icons/io5';

const LogoutButton = ({ onLogout }) => (
  <button className="compose-button" onClick={onLogout}>
    <span className="button-text">Logout</span>
    <IoLogOutOutline className="button-icon" size={32} />
  </button>
);

export default LogoutButton;
