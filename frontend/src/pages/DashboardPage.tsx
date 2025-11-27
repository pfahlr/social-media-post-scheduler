import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socialAccountsApi, scheduledPostsApi, type SocialAccount, type ScheduledPost } from '../api/client';

export const DashboardPage: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [accountsRes, postsRes] = await Promise.all([
          socialAccountsApi.list(),
          scheduledPostsApi.list()
        ]);
        setAccounts(accountsRes.data.accounts);
        setPosts(postsRes.data.posts);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <div>Loading...</div>;

  const upcomingPosts = posts.filter(p => p.status === 'pending').slice(0, 5);

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Connected Accounts ({accounts.length})</h2>
        {accounts.length === 0 ? (
          <p>No accounts connected. <Link to="/accounts">Add an account</Link></p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
                <strong>{acc.displayName}</strong>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>@{acc.handle}</div>
                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>{acc.providerId}</div>
              </div>
            ))}
          </div>
        )}
        <Link to="/accounts" style={{ display: 'inline-block', marginTop: '1rem', color: '#007bff' }}>
          Manage Accounts →
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Upcoming Posts ({upcomingPosts.length})</h2>
        {upcomingPosts.length === 0 ? (
          <p>No upcoming posts. <Link to="/posts/new">Create a post</Link></p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {upcomingPosts.map(post => (
              <div key={post.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div><strong>{post.postDraft?.title || 'Untitled'}</strong></div>
                <div style={{ color: '#666', marginTop: '0.5rem' }}>
                  {post.postDraft?.bodyText.substring(0, 100)}...
                </div>
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Scheduled for: {new Date(post.scheduledFor).toLocaleString()}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  Status: <span style={{ color: post.status === 'completed' ? 'green' : 'orange' }}>{post.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/posts" style={{ display: 'inline-block', marginTop: '1rem', color: '#007bff' }}>
          View All Posts →
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/posts/new" style={{ padding: '1rem 2rem', background: '#007bff', color: 'white', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>
          Create New Post
        </Link>
      </div>
    </div>
  );
};
