import React, { useState } from 'react';
import '../css/LoginPage.css';  // Importing the CSS file

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
        alert('Login successful');
        // Optionally store token: localStorage.setItem('token', data.token);
        localStorage.setItem('token', data.token); // Save token to localStorage
        onLoginSuccess(); // go to main window
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
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="input"  // Applying the input class from CSS
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"  // Applying the input class from CSS
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
          style={{ cursor: 'pointer', color: 'blue' }}
        >
          Create one
        </span>
      </p>
    </div>
  );
};

export default LoginPage;