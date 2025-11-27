import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/client';

export const NavBar: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav style={{ background: '#333', color: 'white', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Social Post Scheduler
        </Link>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ color: 'white' }}>Dashboard</Link>
            <Link to="/accounts" style={{ color: 'white' }}>Accounts</Link>
            <Link to="/posts" style={{ color: 'white' }}>Posts</Link>
            <Link to="/posts/new" style={{ color: 'white' }}>New Post</Link>
            <span>{user.email}</span>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'white' }}>Login</Link>
            <Link to="/signup" style={{ color: 'white' }}>Signup</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
