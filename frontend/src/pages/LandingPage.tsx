import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div>
      <h1>Social Media Post Scheduler</h1>
      <p>Self-hosted, plugin-based social media scheduler.</p>
      <p>
        <Link to="/signup">Get started</Link> or <Link to="/login">log in</Link>.
      </p>
    </div>
  );
};
