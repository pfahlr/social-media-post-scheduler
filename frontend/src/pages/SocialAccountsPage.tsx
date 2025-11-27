import React, { useEffect, useState } from 'react';
import { socialAccountsApi, type SocialAccount, type Provider } from '../api/client';

export const SocialAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [accountsRes, providersRes] = await Promise.all([
        socialAccountsApi.list(),
        socialAccountsApi.listProviders()
      ]);
      setAccounts(accountsRes.data.accounts);
      setProviders(providersRes.data.providers);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await socialAccountsApi.create({
        providerId: selectedProvider,
        displayName,
        handle,
        instanceUrl: instanceUrl || null,
        authData: { accessToken, instanceUrl }
      });
      setShowForm(false);
      setSelectedProvider('');
      setDisplayName('');
      setHandle('');
      setInstanceUrl('');
      setAccessToken('');
      await load();
    } catch (err) {
      alert('Failed to add account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account?')) return;
    try {
      await socialAccountsApi.delete(id);
      await load();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Social Accounts</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : 'Add Account'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ margin: '2rem 0', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Provider:</label>
            <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
              <option value="">Select provider</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Display Name:</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Handle:</label>
            <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Instance URL (for federated):</label>
            <input type="url" value={instanceUrl} onChange={(e) => setInstanceUrl(e.target.value)} placeholder="https://mastodon.social" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Access Token:</label>
            <input type="text" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </div>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Account
          </button>
        </form>
      )}

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{acc.displayName}</h3>
                <div style={{ color: '#666', marginTop: '0.25rem' }}>@{acc.handle}</div>
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>{acc.providerId}</div>
                {acc.instanceUrl && <div style={{ color: '#888', fontSize: '0.85rem' }}>{acc.instanceUrl}</div>}
              </div>
              <button onClick={() => handleDelete(acc.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showForm && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '3rem' }}>
          No accounts connected. Click "Add Account" to get started.
        </p>
      )}
    </div>
  );
};
