import { useState } from 'react';

interface SubmoduleManagerProps {
  rootPath: string;
  onClose: () => void;
}

interface Submodule {
  name: string;
  path: string;
  url: string;
  branch: string;
  commit: string;
  status: 'synced' | 'modified' | 'uninitialized' | 'outdated';
}

export default function SubmoduleManager({
  rootPath,
  onClose
}: SubmoduleManagerProps) {
  const [submodules, setSubmodules] = useState<Submodule[]>([
    { name: 'shared-components', path: 'libs/shared', url: 'https://github.com/org/shared-components.git', branch: 'main', commit: 'abc1234', status: 'synced' },
    { name: 'utils', path: 'libs/utils', url: 'https://github.com/org/utils.git', branch: 'develop', commit: 'def2345', status: 'outdated' },
    { name: 'docs', path: 'docs', url: 'https://github.com/org/docs.git', branch: 'main', commit: 'ghi3456', status: 'uninitialized' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubmodule, setNewSubmodule] = useState({ url: '', path: '', branch: 'main' });
  const [selectedSubmodule, setSelectedSubmodule] = useState<string | null>(null);

  const getStatusColor = (status: Submodule['status']) => {
    const colors = {
      synced: '#27ae60',
      modified: '#f39c12',
      uninitialized: '#95a5a6',
      outdated: '#e74c3c'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Submodule['status']) => {
    const icons = {
      synced: '✓',
      modified: '●',
      uninitialized: '○',
      outdated: '↓'
    };
    return icons[status];
  };

  const initSubmodule = async (name: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmodules(prev => prev.map(s =>
      s.name === name ? { ...s, status: 'synced' } : s
    ));
    setIsLoading(false);
  };

  const updateSubmodule = async (name: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmodules(prev => prev.map(s =>
      s.name === name ? { ...s, status: 'synced', commit: 'new1234' } : s
    ));
    setIsLoading(false);
  };

  const updateAll = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmodules(prev => prev.map(s => ({ ...s, status: 'synced' })));
    setIsLoading(false);
  };

  const removeSubmodule = async (name: string) => {
    if (confirm(`Are you sure you want to remove submodule "${name}"?`)) {
      setSubmodules(prev => prev.filter(s => s.name !== name));
    }
  };

  const addSubmodule = async () => {
    if (!newSubmodule.url || !newSubmodule.path) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const name = newSubmodule.url.split('/').pop()?.replace('.git', '') || 'new-submodule';
    setSubmodules(prev => [...prev, {
      name,
      path: newSubmodule.path,
      url: newSubmodule.url,
      branch: newSubmodule.branch,
      commit: 'new0000',
      status: 'synced'
    }]);

    setNewSubmodule({ url: '', path: '', branch: 'main' });
    setShowAddModal(false);
    setIsLoading(false);
  };

  return (
    <div className="submodule-manager">
      <div className="sm-header">
        <h3>Submodule Manager</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="sm-content">
        <div className="toolbar">
          <button
            className="add-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Submodule
          </button>
          <button
            className="update-all-btn"
            onClick={updateAll}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update All'}
          </button>
        </div>

        <div className="submodules-list">
          {submodules.map(sub => (
            <div
              key={sub.name}
              className={`submodule-item ${selectedSubmodule === sub.name ? 'selected' : ''}`}
              onClick={() => setSelectedSubmodule(sub.name === selectedSubmodule ? null : sub.name)}
            >
              <div className="sub-main">
                <div
                  className="status-indicator"
                  style={{ color: getStatusColor(sub.status) }}
                  title={sub.status}
                >
                  {getStatusIcon(sub.status)}
                </div>

                <div className="sub-info">
                  <div className="sub-name">{sub.name}</div>
                  <div className="sub-path">{sub.path}</div>
                </div>

                <div className="sub-meta">
                  <span className="branch">{sub.branch}</span>
                  <span className="commit">{sub.commit}</span>
                </div>
              </div>

              {selectedSubmodule === sub.name && (
                <div className="sub-details">
                  <div className="detail-row">
                    <span className="label">URL:</span>
                    <span className="value">{sub.url}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(sub.status) }}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="sub-actions">
                    {sub.status === 'uninitialized' && (
                      <button
                        className="init-btn"
                        onClick={() => initSubmodule(sub.name)}
                        disabled={isLoading}
                      >
                        Initialize
                      </button>
                    )}
                    {sub.status === 'outdated' && (
                      <button
                        className="update-btn"
                        onClick={() => updateSubmodule(sub.name)}
                        disabled={isLoading}
                      >
                        Update
                      </button>
                    )}
                    <button
                      className="sync-btn"
                      onClick={() => updateSubmodule(sub.name)}
                      disabled={isLoading}
                    >
                      Sync
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeSubmodule(sub.name)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="commands-section">
          <h4>Common Commands</h4>
          <div className="commands-list">
            <div className="command-item">
              <code>git submodule init</code>
              <span>Initialize submodules</span>
            </div>
            <div className="command-item">
              <code>git submodule update --remote</code>
              <span>Update to latest remote</span>
            </div>
            <div className="command-item">
              <code>git submodule sync</code>
              <span>Sync URLs from .gitmodules</span>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={e => e.stopPropagation()}>
            <h4>Add Submodule</h4>

            <div className="form-group">
              <label>Repository URL:</label>
              <input
                type="text"
                value={newSubmodule.url}
                onChange={(e) => setNewSubmodule({ ...newSubmodule, url: e.target.value })}
                placeholder="https://github.com/org/repo.git"
              />
            </div>

            <div className="form-group">
              <label>Local Path:</label>
              <input
                type="text"
                value={newSubmodule.path}
                onChange={(e) => setNewSubmodule({ ...newSubmodule, path: e.target.value })}
                placeholder="libs/submodule"
              />
            </div>

            <div className="form-group">
              <label>Branch:</label>
              <input
                type="text"
                value={newSubmodule.branch}
                onChange={(e) => setNewSubmodule({ ...newSubmodule, branch: e.target.value })}
                placeholder="main"
              />
            </div>

            <div className="modal-actions">
              <button
                className="add-btn"
                onClick={addSubmodule}
                disabled={isLoading || !newSubmodule.url || !newSubmodule.path}
              >
                {isLoading ? 'Adding...' : 'Add Submodule'}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .submodule-manager {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .sm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .sm-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .sm-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .add-btn {
          padding: 8px 16px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .update-all-btn {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
        }
        .update-all-btn:disabled { opacity: 0.5; }
        .submodules-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .submodule-item {
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }
        .submodule-item.selected {
          border: 1px solid var(--accent-color);
        }
        .sub-main {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
        }
        .status-indicator { font-size: 16px; }
        .sub-info { flex: 1; }
        .sub-name { font-weight: 500; font-size: 14px; }
        .sub-path { font-size: 12px; color: var(--text-secondary); }
        .sub-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .branch {
          font-size: 11px;
          padding: 2px 6px;
          background: var(--bg-primary);
          border-radius: 3px;
        }
        .commit {
          font-family: monospace;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .sub-details {
          padding: 12px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .detail-row .label { color: var(--text-secondary); }
        .detail-row .value { font-family: monospace; }
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          color: white;
        }
        .sub-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .sub-actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .init-btn, .update-btn { background: var(--accent-color); color: white; }
        .sync-btn { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
        .remove-btn { background: #e74c3c; color: white; }
        .commands-section {
          background: var(--bg-secondary);
          border-radius: 4px;
          padding: 12px;
        }
        .commands-section h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .commands-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .command-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .command-item code {
          font-family: monospace;
          padding: 4px 8px;
          background: var(--bg-primary);
          border-radius: 4px;
        }
        .command-item span { color: var(--text-secondary); }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .add-modal {
          background: var(--bg-primary);
          padding: 24px;
          border-radius: 8px;
          width: 400px;
        }
        .add-modal h4 { margin: 0 0 16px 0; }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .form-group input {
          width: 100%;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .modal-actions .add-btn { flex: 1; }
        .cancel-btn {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
