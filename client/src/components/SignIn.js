import React, { useState } from 'react';
import axios from 'axios';

function SignIn({ onSignInSuccess }) {
  const [formData, setFormData] = useState({
    identifier: '', // Changed from email to identifier
    password: ''
  });
  const [errors, setErrors] = useState({});
  const isOnline = navigator.onLine;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!isOnline) {
      setErrors({ general: 'No internet connection. Please connect and try again.' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/users/login', formData, {
        withCredentials: true
      });
      onSignInSuccess(response.data.user);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrors({ general: 'Invalid identifier or password.' });
      } else {
        setErrors({ general: 'An error occurred. Please try again. Make sure you use a valid email address and the correct password.' });
      }
    }
  };

  return (
    <div className="signin-form">
      <h1 className="signin-title">Sign In</h1>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text" // Changed type to text to accept both email and username
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          placeholder="Email or Username"
          required
          disabled={!isOnline}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          disabled={!isOnline}
        />
        <button type="submit" disabled={!isOnline}>Log In</button>
      </form>
      {!isOnline && <p className="error-message">Internet connection is required to sign in.</p>}
    </div>
  );
}

export default SignIn;
