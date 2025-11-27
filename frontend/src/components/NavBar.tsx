import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';

export const NavBar: React.FC = () => {
  const { user, setUser } = useAuth();

  async function handleLogout() {
    await apiClient.post('/auth/logout');
    setUser(null);
  }

  return (
    <nav style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Scheduler</Link>
      {' | '}
      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          {' | '}
          <Link to="/accounts">Accounts</Link>
          {' | '}
          <Link to="/posts">Posts</Link>
          {' | '}
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          {' | '}
          <Link to="/signup">Sign up</Link>
        </>
      )}
    </nav>
  );
};
