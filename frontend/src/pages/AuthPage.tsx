// File: frontend/src/pages/AuthPage.tsx

import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

/**
 * The main authentication page for the application.
 * It serves as a container for authentication-related components like registration and login forms.
 */
const AuthPage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to SynchBoard</h1>
      <section>
        <h2>Register</h2>
        <RegisterForm />
      </section>

      {/* TODO: Add the LoginForm component here once it's created.
        <section>
          <h2>Login</h2>
          <LoginForm />
        </section>
      */}

    </div>
  );
};

export default AuthPage;