import React, { useState, useEffect } from 'react';

interface GPGKey {
  id: string;
  email: string;
  name: string;
  fingerprint: string;
  expires: Date | null;
  isExpired: boolean;
}

interface CommitSigningProps {
  rootPath: string;
  onClose: () => void;
}

function CommitSigning({ rootPath, onClose }: CommitSigningProps) {
  const [keys, setKeys] = useState<GPGKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [signCommits, setSignCommits] = useState(false);
  const [signTags, setSignTags] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'unconfigured' | 'configured' | 'error'>('unconfigured');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadKeys();
    loadConfig();
  }, [rootPath]);

  const loadKeys = async () => {
    setIsLoading(true);

    // Simulate loading GPG keys
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockKeys: GPGKey[] = [
      {
        id: 'ABC123DEF456',
        email: 'developer@example.com',
        name: 'John Developer',
        fingerprint: 'ABCD EF12 3456 7890 ABCD EF12 3456 7890 ABCD EF12',
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isExpired: false
      },
      {
        id: 'XYZ789ABC012',
        email: 'work@company.com',
        name: 'John Developer (Work)',
        fingerprint: 'XYZ7 89AB C012 3456 XYZ7 89AB C012 3456 XYZ7 89AB',
        expires: null,
        isExpired: false
      }
    ];

    setKeys(mockKeys);
    setIsLoading(false);
  };

  const loadConfig = async () => {
    // Simulate loading git config
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if commit signing is configured
    setSignCommits(false);
    setSignTags(false);
    setStatus('unconfigured');
  };

  const saveConfig = async () => {
    if (!selectedKey) {
      setMessage('Please select a GPG key');
      return;
    }

    setIsLoading(true);

    // Simulate saving git config
    await new Promise(resolve => setTimeout(resolve, 500));

    // In real implementation would run:
    // git config user.signingkey <key>
    // git config commit.gpgsign true/false
    // git config tag.gpgsign true/false

    setStatus('configured');
    setMessage('Commit signing configured successfully!');
    setIsLoading(false);
  };

  const disableSigning = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setSignCommits(false);
    setSignTags(false);
    setSelectedKey('');
    setStatus('unconfigured');
    setMessage('Commit signing disabled');
    setIsLoading(false);
  };

  const generateNewKey = () => {
    // In real implementation, this would guide through GPG key generation
    alert('To generate a new GPG key, run: gpg --full-generate-key');
  };

  const exportPublicKey = async (keyId: string) => {
    // Simulate exporting public key
    const mockPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGXx...
...
-----END PGP PUBLIC KEY BLOCK-----`;

    navigator.clipboard.writeText(mockPublicKey);
    setMessage('Public key copied to clipboard! Add it to GitHub/GitLab.');
  };

  return (
    <div className="commit-signing">
      <div className="signing-header">
        <h3>Commit Signing</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="signing-info">
        <p>Sign your commits with GPG to verify their authenticity.</p>
        <div className={`status-badge ${status}`}>
          {status === 'configured' ? '✅ Configured' : status === 'error' ? '❌ Error' : '⚠️ Not Configured'}
        </div>
      </div>

      {message && (
        <div className={`signing-message ${status === 'error' ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="signing-content">
        <div className="keys-section">
          <div className="section-header">
            <h4>Available GPG Keys</h4>
            <button onClick={generateNewKey} className="generate-btn">
              + Generate New Key
            </button>
          </div>

          <div className="keys-list">
            {keys.map(key => (
              <div
                key={key.id}
                className={`key-item ${selectedKey === key.id ? 'selected' : ''} ${key.isExpired ? 'expired' : ''}`}
                onClick={() => setSelectedKey(key.id)}
              >
                <div className="key-select">
                  <input
                    type="radio"
                    checked={selectedKey === key.id}
                    onChange={() => setSelectedKey(key.id)}
                  />
                </div>
                <div className="key-info">
                  <div className="key-identity">
                    <span className="key-name">{key.name}</span>
                    <span className="key-email">&lt;{key.email}&gt;</span>
                  </div>
                  <div className="key-details">
                    <span className="key-id">ID: {key.id}</span>
                    {key.expires && (
                      <span className={`key-expires ${key.isExpired ? 'expired' : ''}`}>
                        {key.isExpired ? 'Expired' : `Expires: ${key.expires.toLocaleDateString()}`}
                      </span>
                    )}
                  </div>
                  <div className="key-fingerprint" title={key.fingerprint}>
                    {key.fingerprint}
                  </div>
                </div>
                <div className="key-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportPublicKey(key.id);
                    }}
                    title="Copy public key"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}

            {keys.length === 0 && !isLoading && (
              <div className="keys-empty">
                <p>No GPG keys found</p>
                <button onClick={generateNewKey}>Generate a new key</button>
              </div>
            )}
          </div>
        </div>

        <div className="options-section">
          <h4>Signing Options</h4>

          <label className="option-item">
            <input
              type="checkbox"
              checked={signCommits}
              onChange={(e) => setSignCommits(e.target.checked)}
            />
            <div className="option-info">
              <span className="option-title">Sign all commits</span>
              <span className="option-desc">Automatically sign every commit with your GPG key</span>
            </div>
          </label>

          <label className="option-item">
            <input
              type="checkbox"
              checked={signTags}
              onChange={(e) => setSignTags(e.target.checked)}
            />
            <div className="option-info">
              <span className="option-title">Sign all tags</span>
              <span className="option-desc">Automatically sign annotated tags with your GPG key</span>
            </div>
          </label>
        </div>

        <div className="verification-section">
          <h4>Verification</h4>
          <p>To verify signed commits, run: <code>git log --show-signature</code></p>
          <p>Add your public key to GitHub/GitLab to show verified badges.</p>
        </div>
      </div>

      <div className="signing-actions">
        {status === 'configured' && (
          <button onClick={disableSigning} className="disable-btn">
            Disable Signing
          </button>
        )}
        <button
          onClick={saveConfig}
          disabled={!selectedKey || isLoading}
          className="save-btn"
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

export default CommitSigning;
