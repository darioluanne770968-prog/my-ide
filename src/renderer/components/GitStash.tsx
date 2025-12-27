import React, { useState, useEffect } from 'react';

interface StashEntry {
  index: number;
  message: string;
  date: string;
}

interface GitStashProps {
  rootPath: string | null;
  onStashChange: () => void;
}

function GitStash({ rootPath, onStashChange }: GitStashProps) {
  const [stashes, setStashes] = useState<StashEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stashMessage, setStashMessage] = useState('');
  const [showStashForm, setShowStashForm] = useState(false);

  const loadStashes = async () => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      const stashList = await window.electronAPI.gitStashList(rootPath);
      setStashes(stashList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStashes();
  }, [rootPath]);

  const handleStash = async () => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitStash(rootPath, stashMessage || undefined);
      setStashMessage('');
      setShowStashForm(false);
      await loadStashes();
      onStashChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStashPop = async (index: number) => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitStashPop(rootPath, index);
      await loadStashes();
      onStashChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStashApply = async (index: number) => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitStashApply(rootPath, index);
      onStashChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStashDrop = async (index: number) => {
    if (!rootPath) return;
    if (!confirm('Drop this stash?')) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitStashDrop(rootPath, index);
      await loadStashes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="git-stash">
      <div className="git-stash-header">
        <span>Stashes ({stashes.length})</span>
        <button onClick={() => setShowStashForm(true)} title="Create Stash">
          +
        </button>
      </div>

      {error && <div className="git-stash-error">{error}</div>}

      {showStashForm && (
        <div className="stash-form">
          <input
            type="text"
            placeholder="Stash message (optional)"
            value={stashMessage}
            onChange={(e) => setStashMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStash()}
          />
          <div className="stash-form-actions">
            <button onClick={handleStash}>Stash</button>
            <button onClick={() => setShowStashForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="stash-list">
        {stashes.length === 0 ? (
          <div className="stash-empty">No stashes</div>
        ) : (
          stashes.map((stash) => (
            <div key={stash.index} className="stash-item">
              <div className="stash-info">
                <span className="stash-index">stash@{`{${stash.index}}`}</span>
                <span className="stash-message">{stash.message}</span>
                <span className="stash-date">{stash.date}</span>
              </div>
              <div className="stash-actions">
                <button
                  onClick={() => handleStashPop(stash.index)}
                  title="Pop (apply and remove)"
                >
                  Pop
                </button>
                <button
                  onClick={() => handleStashApply(stash.index)}
                  title="Apply (keep stash)"
                >
                  Apply
                </button>
                <button
                  onClick={() => handleStashDrop(stash.index)}
                  title="Drop"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GitStash;
