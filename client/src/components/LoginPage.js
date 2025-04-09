import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const invalidUser = /[^ \w@.]/;

    if (invalidUser.test(username) || username.length === 0 || password.length === 0) {
      alert('Invalid input. Please check your username and password.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (response.ok) {
        await response.json();
        alert('Login successful');
        localStorage.setItem('loggedInUsername', username);
        navigate('/user-profile-page');
      } else {
        const error = await response.json();
        alert(error.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <div>
      <header>
        <div className="header-bar">
          <div className="webLogo" onClick={() => navigate('/main-posts-page')}>
            <span className="web-name">Duck Creek Technologies</span>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="box">
          <div className="info">User Login</div>
          <input
            type="text"
            className="input"
            placeholder="username/email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="input"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button" onClick={handleLogin}>Sign In</button>
        </div>

        <div className="box">
          <div className="info">New User?</div>
          <button className="button" onClick={handleCreateAccount}>Create New Account</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
