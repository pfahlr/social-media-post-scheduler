import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scheduledPostsApi, type ScheduledPost } from '../api/client';

export const PostsListPage: React.FC = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await scheduledPostsApi.list();
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this post?')) return;
    try {
      await scheduledPostsApi.cancel(id);
      await load();
    } catch (err) {
      alert('Failed to cancel post');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Scheduled Posts</h1>
        <Link to="/posts/new" style={{ padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
          New Post
        </Link>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No posts scheduled yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{post.postDraft?.title || 'Untitled'}</h3>
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    {post.postDraft?.bodyText.substring(0, 150)}...
                  </p>
                  <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    <div>Scheduled for: {new Date(post.scheduledFor).toLocaleString()}</div>
                    <div>Status: <span style={{ color: post.status === 'completed' ? 'green' : post.status === 'failed' ? 'red' : 'orange' }}>{post.status}</span></div>
                    <div>Targets: {post.postTargets?.length || 0} accounts</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {post.status === 'pending' && (
                    <button onClick={() => handleCancel(post.id)} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
