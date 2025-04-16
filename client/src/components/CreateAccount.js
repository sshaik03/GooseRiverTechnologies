import React, { useState } from 'react';

const CreateAccount = ({ onRegisterSuccess }) => {
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
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Account created successfully!');
        onRegisterSuccess(); // Go back to login or next step
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred while registering.');
    }
  
    setIsSubmitting(false);
  };

  return (
    <div className="create-account-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" id="username" placeholder="Username" value={form.username} onChange={handleChange} />
        <input type="email" id="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="password" id="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <input type="password" id="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <span className="link" onClick={onRegisterSuccess} style={{ cursor: 'pointer', color: 'blue' }}>
          Login here
        </span>
      </p>
    </div>
  );
};

export default CreateAccount; 