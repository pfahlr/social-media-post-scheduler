import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { draftsApi, socialAccountsApi, scheduledPostsApi, type SocialAccount, type Provider } from '../api/client';

export const PostEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [postType, setPostType] = useState('short');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const [accountsRes, providersRes] = await Promise.all([
        socialAccountsApi.list(),
        socialAccountsApi.listProviders()
      ]);
      setAccounts(accountsRes.data.accounts);
      setProviders(providersRes.data.providers);

      if (id) {
        const draftRes = await draftsApi.get(id);
        setTitle(draftRes.data.title || '');
        setBodyText(draftRes.data.bodyText);
        setPostType(draftRes.data.postType);
        setDraftId(draftRes.data.id);
      }
    } catch (err) {
      console.error('Failed to load editor data:', err);
    }
  }

  const getMaxTextLength = () => {
    if (selectedAccounts.length === 0) return null;
    
    const selectedProviderIds = selectedAccounts.map(accId => {
      const acc = accounts.find(a => a.id === accId);
      return acc?.providerId;
    });

    const relevantProviders = providers.filter(p => selectedProviderIds.includes(p.id));
    const lengths = relevantProviders
      .map(p => p.capabilities.maxTextLength)
      .filter(l => l !== null) as number[];

    return lengths.length > 0 ? Math.min(...lengths) : null;
  };

  const maxLength = getMaxTextLength();
  const remainingChars = maxLength ? maxLength - bodyText.length : null;

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      let savedDraftId = draftId;
      
      if (draftId) {
        await draftsApi.update(draftId, { title, bodyText, postType });
      } else {
        const res = await draftsApi.create({ title, bodyText, postType });
        savedDraftId = res.data.id;
        setDraftId(savedDraftId);
      }
      
      alert('Draft saved!');
    } catch (err) {
      alert('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!draftId) {
      alert('Please save draft first');
      return;
    }
    if (selectedAccounts.length === 0) {
      alert('Please select at least one account');
      return;
    }
    navigate(`/posts/${draftId}/preview`, {
      state: { draftId, selectedAccounts }
    });
  };

  const toggleAccount = (id: string) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h1>{id ? 'Edit Post' : 'Create Post'}</h1>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Title (optional):</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Post Type:</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
            <option value="short">Short</option>
            <option value="long_form">Long Form</option>
            <option value="image_gallery">Image Gallery</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label>Body:</label>
            {remainingChars !== null && (
              <span style={{ fontSize: '0.9rem', color: remainingChars < 0 ? 'red' : '#666' }}>
                {remainingChars} characters remaining
              </span>
            )}
          </div>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={8}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
          />
          {remainingChars !== null && remainingChars < 0 && (
            <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Text exceeds maximum length for selected accounts
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Accounts:</label>
          {accounts.length === 0 ? (
            <p style={{ color: '#666' }}>No accounts connected. Please add accounts first.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
              {accounts.map(acc => (
                <label key={acc.id} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: selectedAccounts.includes(acc.id) ? '#e3f2fd' : 'white' }}>
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(acc.id)}
                    onChange={() => toggleAccount(acc.id)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <div>
                    <div>{acc.displayName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>@{acc.handle} ({acc.providerId})</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={handleSaveDraft} disabled={loading || !bodyText} style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Draft
          </button>
          <button onClick={handlePreview} disabled={loading || !bodyText || selectedAccounts.length === 0 || !draftId} style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Preview & Schedule
          </button>
          <button onClick={() => navigate('/posts')} style={{ padding: '0.75rem 1.5rem', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
