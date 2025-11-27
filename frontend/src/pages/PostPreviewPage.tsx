import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { draftsApi, scheduledPostsApi, socialAccountsApi, type PostDraft, type SocialAccount } from '../api/client';

export const PostPreviewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState<PostDraft | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    
    try {
      const draftRes = await draftsApi.get(id);
      setDraft(draftRes.data);

      const accountsRes = await socialAccountsApi.list();
      setAccounts(accountsRes.data.accounts);

      if (location.state?.selectedAccounts) {
        setSelectedAccounts(location.state.selectedAccounts);
      }

      const now = new Date();
      now.setHours(now.getHours() + 1);
      setScheduledFor(now.toISOString().slice(0, 16));
    } catch (err) {
      console.error('Failed to load preview data:', err);
      alert('Failed to load draft');
      navigate('/posts');
    }
  }

  const handleSubmit = async () => {
    if (!draft || selectedAccounts.length === 0) return;

    setLoading(true);
    try {
      const targets = selectedAccounts.map(accountId => {
        const account = accounts.find(a => a.id === accountId);
        return {
          socialAccountId: accountId,
          providerId: account!.providerId
        };
      });

      await scheduledPostsApi.create({
        postDraftId: draft.id,
        publishImmediately,
        scheduledFor: publishImmediately ? undefined : scheduledFor,
        targets
      });

      alert(publishImmediately ? 'Post queued for immediate publishing!' : 'Post scheduled successfully!');
      navigate('/posts');
    } catch (err) {
      alert('Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  if (!draft) return <div>Loading...</div>;

  const selectedAccountsList = accounts.filter(a => selectedAccounts.includes(a.id));

  return (
    <div>
      <h1>Preview & Schedule</h1>

      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1.5rem', borderRadius: '4px', background: '#f9f9f9' }}>
        {draft.title && <h2 style={{ marginTop: 0 }}>{draft.title}</h2>}
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{draft.bodyText}</p>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          Post Type: {draft.postType}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Targets ({selectedAccountsList.length} accounts)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          {selectedAccountsList.map(acc => (
            <div key={acc.id} style={{ padding: '0.5rem 1rem', background: '#e3f2fd', borderRadius: '4px' }}>
              <strong>{acc.displayName}</strong> (@{acc.handle})
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Schedule Options</h3>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              type="radio"
              checked={publishImmediately}
              onChange={() => setPublishImmediately(true)}
              style={{ marginRight: '0.5rem' }}
            />
            Publish immediately
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              checked={!publishImmediately}
              onChange={() => setPublishImmediately(false)}
              style={{ marginRight: '0.5rem' }}
            />
            Schedule for later
          </label>
        </div>

        {!publishImmediately && (
          <div style={{ marginTop: '1rem' }}>
            <label>Schedule Date & Time:</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={handleSubmit} disabled={loading || selectedAccounts.length === 0} style={{ padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
          {publishImmediately ? 'Post Now' : 'Schedule Post'}
        </button>
        <button onClick={() => navigate(`/posts/${id}/edit`)} style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Edit
        </button>
        <button onClick={() => navigate('/posts')} style={{ padding: '0.75rem 1.5rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};
