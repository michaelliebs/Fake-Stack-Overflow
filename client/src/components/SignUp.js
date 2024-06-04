import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SignUp({ onSignUpSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check internet status of User
  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset errors
    setErrors({});

    // Check if User is online
    if (!isOnline) {
      setErrors({ general: 'No internet connection. Please connect and try again.' });
      return;
    }

    // Validate email and password
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Invalid email address.' });
      return;
    }
    if (!validatePassword(formData.password, formData)) {
      setErrors({ password: 'Password must not contain your name or email and must meet other criteria.' });
      return;
    }
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      return;
    }

    // API Request to register the user
    try {
      const response = await axios.post('http://localhost:8000/users/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      onSignUpSuccess(response.data);  // Navigate on success
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        console.error('Signup failed:', error);
        if (error.response && error.response.status === 409) {
          setErrors({ general: 'Email already in use.' });
        } else {
        setErrors({ general: 'Failed to create account. Please try again.' });
        }
      }
    }
  };

  return (
    <div className="signup-form">
      <h1 className="signup-title">Create Account</h1>
      {errors.general && <p className="error">{errors.general}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
          disabled={!isOnline}
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
          disabled={!isOnline}
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
          disabled={!isOnline}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          disabled={!isOnline}
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          disabled={!isOnline}
        />
        {errors.password && <p className="error">{errors.password}</p>}
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          disabled={!isOnline}
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
        <button type="submit" disabled={!isOnline}>Sign Up</button>
      </form>
      {!isOnline && <p className="error-message">Internet connection is required to create an account.</p>}
    </div>
  );
}

const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const validatePassword = (password, { firstName, lastName, username, email }) => {
  if (password.length < 8 || password.includes(username) || password.includes(firstName) || password.includes(lastName) || password.includes(email.split('@')[0])) {
    return false;
  }
  return true;
};

export default SignUp;
