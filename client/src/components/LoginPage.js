// src/js/loginPage.js
import React, { useState } from 'react';
import '../css/LoginPage.css';
import logo from '../images/gooseRiverLogo.png';

const LoginPage = ({ onLoginSuccess, onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred while trying to log in.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="login-page">
      <img src={logo} alt="Goose River Logo" className="goose-river-logo" />
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <p>
          Don’t have an account?{' '}
          <span
            className="link"
            onClick={onRegisterClick}
            style={{ cursor: 'pointer' }}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
