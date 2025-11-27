import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Social Media Post Scheduler</h1>
      <p style={{ fontSize: '1.2rem', margin: '2rem 0' }}>
        Schedule posts across multiple social media platforms from one place
      </p>
      {user ? (
        <Link to="/dashboard" style={{ padding: '1rem 2rem', background: '#007bff', color: 'white', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>
          Go to Dashboard
        </Link>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/signup" style={{ padding: '1rem 2rem', background: '#28a745', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
            Get Started
          </Link>
          <Link to="/login" style={{ padding: '1rem 2rem', background: '#007bff', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
};
