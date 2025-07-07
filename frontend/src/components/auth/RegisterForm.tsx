// File: frontend/src/components/auth/RegisterForm.tsx

import React, { useState } from 'react';
import { register } from '../../services/authService';
import type { RegisterRequest } from '../../types/user.types';
import axios from 'axios';

/**
 * A form component for user registration.
 * It manages its own state for form inputs and handles the submission process.
 */
const RegisterForm: React.FC = () => {
  // State to hold the form data. Initialized with empty strings.
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  /**
   * A generic handler that updates the form state when an input value changes.
   * It uses the input's 'name' attribute to determine which field in the state to update.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handles the form submission event.
   * It prevents the default browser form submission, calls the registration service,
   * and provides user feedback via alerts.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      const response = await register(formData);
      alert('Registration Successful!');
      console.log(response);
      // TODO: Optionally, clear the form on successful registration.
      // setFormData({ email: '', password: '', ... });
    } catch (error) {
      console.error('Registration failed', error);
      let errorMessage = 'An unexpected error occurred.';

      // Check if the error is from Axios to get a specific backend message.
      if (axios.isAxiosError(error) && error.response) {
      // Assumes the backend sends a plain text error message in the response body.
      errorMessage = error.response.data;
      } else if (error instanceof Error) {
      errorMessage = error.message;

      // TODO: Display the error message in the UI instead of using an alert.
      alert(`Registration Failed: ${errorMessage}`);
  }

    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;