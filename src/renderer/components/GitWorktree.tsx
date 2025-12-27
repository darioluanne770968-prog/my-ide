import React, { useState, useEffect } from 'react';

interface Worktree {
  path: string;
  branch: string;
  head: string;
  isMain: boolean;
  isLocked: boolean;
}

interface GitWorktreeProps {
  rootPath: string;
  onOpen: (path: string) => void;
  onClose: () => void;
}

function GitWorktree({ rootPath, onOpen, onClose }: GitWorktreeProps) {
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorktreePath, setNewWorktreePath] = useState('');
  const [newWorktreeBranch, setNewWorktreeBranch] = useState('');
  const [createNewBranch, setCreateNewBranch] = useState(true);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);

  useEffect(() => {
    loadWorktrees();
    loadBranches();
  }, [rootPath]);

  const loadWorktrees = async () => {
    setIsLoading(true);

    // Simulate loading worktrees - in real implementation would run git worktree list
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockWorktrees: Worktree[] = [
      {
        path: rootPath,
        branch: 'main',
        head: 'abc1234',
        isMain: true,
        isLocked: false
      },
      {
        path: `${rootPath}-feature`,
        branch: 'feature/new-ui',
        head: 'def5678',
        isMain: false,
        isLocked: false
      }
    ];

    setWorktrees(mockWorktrees);
    setIsLoading(false);
  };

  const loadBranches = async () => {
    // Simulate loading branches
    setAvailableBranches(['main', 'develop', 'feature/auth', 'feature/ui', 'bugfix/login']);
  };

  const addWorktree = async () => {
    if (!newWorktreePath || !newWorktreeBranch) return;

    setIsLoading(true);

    // Simulate adding worktree
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newWorktree: Worktree = {
      path: newWorktreePath,
      branch: newWorktreeBranch,
      head: 'new0000',
      isMain: false,
      isLocked: false
    };

    setWorktrees([...worktrees, newWorktree]);
    setShowAddForm(false);
    setNewWorktreePath('');
    setNewWorktreeBranch('');
    setIsLoading(false);
  };

  const removeWorktree = async (path: string) => {
    if (!confirm(`Remove worktree at ${path}?`)) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setWorktrees(worktrees.filter(w => w.path !== path));
    setIsLoading(false);
  };

  const lockWorktree = async (path: string) => {
    setWorktrees(worktrees.map(w =>
      w.path === path ? { ...w, isLocked: true } : w
    ));
  };

  const unlockWorktree = async (path: string) => {
    setWorktrees(worktrees.map(w =>
      w.path === path ? { ...w, isLocked: false } : w
    ));
  };

  const pruneWorktrees = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real implementation, this would run git worktree prune
    setIsLoading(false);
    alert('Pruned stale worktrees');
  };

  return (
    <div className="git-worktree">
      <div className="worktree-header">
        <h3>Git Worktrees</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="worktree-info">
        <p>Worktrees allow you to have multiple working directories attached to the same repository.</p>
      </div>

      <div className="worktree-toolbar">
        <button onClick={() => setShowAddForm(true)} disabled={isLoading}>
          + Add Worktree
        </button>
        <button onClick={loadWorktrees} disabled={isLoading}>
          🔄 Refresh
        </button>
        <button onClick={pruneWorktrees} disabled={isLoading}>
          🧹 Prune
        </button>
      </div>

      {showAddForm && (
        <div className="worktree-add-form">
          <h4>Add New Worktree</h4>
          <div className="form-group">
            <label>Path:</label>
            <input
              type="text"
              value={newWorktreePath}
              onChange={(e) => setNewWorktreePath(e.target.value)}
              placeholder="/path/to/new/worktree"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={createNewBranch}
                onChange={(e) => setCreateNewBranch(e.target.checked)}
              />
              Create new branch
            </label>
          </div>

          <div className="form-group">
            <label>{createNewBranch ? 'New branch name:' : 'Existing branch:'}</label>
            {createNewBranch ? (
              <input
                type="text"
                value={newWorktreeBranch}
                onChange={(e) => setNewWorktreeBranch(e.target.value)}
                placeholder="feature/my-branch"
              />
            ) : (
              <select
                value={newWorktreeBranch}
                onChange={(e) => setNewWorktreeBranch(e.target.value)}
              >
                <option value="">Select branch...</option>
                {availableBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-actions">
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
            <button
              onClick={addWorktree}
              disabled={!newWorktreePath || !newWorktreeBranch || isLoading}
              className="primary"
            >
              {isLoading ? 'Creating...' : 'Create Worktree'}
            </button>
          </div>
        </div>
      )}

      <div className="worktree-list">
        {worktrees.map(worktree => (
          <div key={worktree.path} className={`worktree-item ${worktree.isMain ? 'main' : ''}`}>
            <div className="worktree-info">
              <div className="worktree-branch">
                <span className="branch-icon">🌿</span>
                <span className="branch-name">{worktree.branch}</span>
                {worktree.isMain && <span className="main-badge">main</span>}
                {worktree.isLocked && <span className="lock-badge">🔒</span>}
              </div>
              <div className="worktree-path" title={worktree.path}>
                {worktree.path}
              </div>
              <div className="worktree-head">
                HEAD: {worktree.head.substring(0, 7)}
              </div>
            </div>

            <div className="worktree-actions">
              <button
                onClick={() => onOpen(worktree.path)}
                title="Open in IDE"
              >
                📂 Open
              </button>
              {!worktree.isMain && (
                <>
                  {worktree.isLocked ? (
                    <button onClick={() => unlockWorktree(worktree.path)} title="Unlock">
                      🔓
                    </button>
                  ) : (
                    <button onClick={() => lockWorktree(worktree.path)} title="Lock">
                      🔒
                    </button>
                  )}
                  <button
                    onClick={() => removeWorktree(worktree.path)}
                    disabled={worktree.isLocked}
                    title="Remove"
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {worktrees.length === 0 && !isLoading && (
          <div className="worktree-empty">
            <p>No worktrees found</p>
          </div>
        )}
      </div>

      <div className="worktree-help">
        <h4>Tips</h4>
        <ul>
          <li>Use worktrees to work on multiple branches simultaneously</li>
          <li>Lock worktrees to prevent accidental removal</li>
          <li>Prune removes worktrees with missing directories</li>
        </ul>
      </div>
    </div>
  );
}

export default GitWorktree;
