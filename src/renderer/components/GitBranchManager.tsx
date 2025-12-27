import React, { useState, useEffect } from 'react';

interface Branch {
  name: string;
  current: boolean;
  tracking?: string;
}

interface GitBranchManagerProps {
  rootPath: string | null;
  onBranchChange: () => void;
}

function GitBranchManager({ rootPath, onBranchChange }: GitBranchManagerProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const loadBranches = async () => {
    if (!rootPath) return;
    setIsLoading(true);
    setError(null);
    try {
      const branchList = await window.electronAPI.gitBranches(rootPath);
      setBranches(branchList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [rootPath]);

  const handleCheckout = async (branchName: string) => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitCheckout(rootPath, branchName);
      await loadBranches();
      onBranchChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!rootPath || !newBranchName.trim()) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitCreateBranch(rootPath, newBranchName.trim());
      setNewBranchName('');
      setShowNewBranch(false);
      await loadBranches();
      onBranchChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (!rootPath) return;
    if (!confirm(`Delete branch "${branchName}"?`)) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitDeleteBranch(rootPath, branchName);
      await loadBranches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async (branchName: string) => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitMerge(rootPath, branchName);
      onBranchChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="branch-manager">
      <div className="branch-manager-header">
        <span>Branches</span>
        <div className="branch-manager-actions">
          <button onClick={loadBranches} disabled={isLoading} title="Refresh">
            🔄
          </button>
          <button onClick={() => setShowNewBranch(true)} title="New Branch">
            +
          </button>
        </div>
      </div>

      {error && <div className="branch-error">{error}</div>}

      {showNewBranch && (
        <div className="new-branch-form">
          <input
            type="text"
            placeholder="Branch name"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
          />
          <button onClick={handleCreateBranch}>Create</button>
          <button onClick={() => setShowNewBranch(false)}>Cancel</button>
        </div>
      )}

      <div className="branch-list">
        {branches.map((branch) => (
          <div
            key={branch.name}
            className={`branch-item ${branch.current ? 'current' : ''}`}
          >
            <span className="branch-icon">{branch.current ? '●' : '○'}</span>
            <span className="branch-name">{branch.name}</span>
            {branch.tracking && (
              <span className="branch-tracking">{branch.tracking}</span>
            )}
            {!branch.current && (
              <div className="branch-item-actions">
                <button
                  onClick={() => handleCheckout(branch.name)}
                  title="Checkout"
                >
                  ↵
                </button>
                <button
                  onClick={() => handleMerge(branch.name)}
                  title="Merge into current"
                >
                  ⎇
                </button>
                <button
                  onClick={() => handleDeleteBranch(branch.name)}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GitBranchManager;
