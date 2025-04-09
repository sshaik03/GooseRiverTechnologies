import React, { useState } from 'react';
import './CreateAccount.css';

export default function CreateAccount() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { username, email, password, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        alert('Account created successfully');
        window.location.href = 'LoginPage.html';
      } else {
        const error = await response.json();
        alert(error.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="header-bar">
        <div className="webLogo">
          <span className="web-name" onClick={() => window.location.href = '../main-posts-page/index.html'}>
            Duck Creek Technologies
          </span>
        </div>
      </header>

      <main className="container">
        <section className="form-box">
          <h2>Create Account</h2>
          <input type="text" id="username" className="input" placeholder="Username" value={form.username} onChange={handleChange} />
          <input type="text" id="email" className="input" placeholder="Email" value={form.email} onChange={handleChange} />
          <input type="password" id="password" className="input" placeholder="Password" value={form.password} onChange={handleChange} />
          <input type="password" id="confirmPassword" className="input" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
          <button className="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </section>

        <section className="form-box secondary">
          <p>Already have an account?</p>
          <button className="button outline" onClick={() => window.location.href = 'LoginPage.html'}>
            Sign in here!
          </button>
        </section>
      </main>
    </div>
  );
}
