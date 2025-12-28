import { useState, useCallback } from 'react';

interface InteractiveRebaseProps {
  rootPath: string;
  currentBranch: string;
  onComplete: () => void;
  onClose: () => void;
}

interface RebaseCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
  action: 'pick' | 'reword' | 'edit' | 'squash' | 'fixup' | 'drop';
}

export default function InteractiveRebase({
  rootPath,
  currentBranch,
  onComplete,
  onClose
}: InteractiveRebaseProps) {
  const [commits, setCommits] = useState<RebaseCommit[]>([
    { hash: 'abc1234567890', shortHash: 'abc1234', message: 'feat: Add user authentication', author: 'John Doe', date: '2 hours ago', action: 'pick' },
    { hash: 'def2345678901', shortHash: 'def2345', message: 'fix: Fix login validation bug', author: 'John Doe', date: '3 hours ago', action: 'pick' },
    { hash: 'ghi3456789012', shortHash: 'ghi3456', message: 'chore: Update dependencies', author: 'Jane Smith', date: '4 hours ago', action: 'pick' },
    { hash: 'jkl4567890123', shortHash: 'jkl4567', message: 'feat: Add password reset flow', author: 'John Doe', date: '5 hours ago', action: 'pick' },
    { hash: 'mno5678901234', shortHash: 'mno5678', message: 'docs: Update README', author: 'Jane Smith', date: '6 hours ago', action: 'pick' }
  ]);
  const [isRebasing, setIsRebasing] = useState(false);
  const [rebaseTarget, setRebaseTarget] = useState('main');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const actionOptions = [
    { value: 'pick', label: 'pick', shortcut: 'p', description: 'Use commit' },
    { value: 'reword', label: 'reword', shortcut: 'r', description: 'Edit message' },
    { value: 'edit', label: 'edit', shortcut: 'e', description: 'Stop for amending' },
    { value: 'squash', label: 'squash', shortcut: 's', description: 'Meld into previous' },
    { value: 'fixup', label: 'fixup', shortcut: 'f', description: 'Like squash, discard message' },
    { value: 'drop', label: 'drop', shortcut: 'd', description: 'Remove commit' }
  ];

  const updateAction = useCallback((hash: string, action: RebaseCommit['action']) => {
    setCommits(prev => prev.map(c =>
      c.hash === hash ? { ...c, action } : c
    ));
  }, []);

  const moveCommit = useCallback((fromIndex: number, toIndex: number) => {
    setCommits(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveCommit(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const startRebase = async () => {
    setIsRebasing(true);
    // Simulate rebase
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRebasing(false);
    onComplete();
  };

  const getActionColor = (action: RebaseCommit['action']) => {
    const colors: Record<string, string> = {
      pick: '#27ae60',
      reword: '#3498db',
      edit: '#f39c12',
      squash: '#9b59b6',
      fixup: '#e67e22',
      drop: '#e74c3c'
    };
    return colors[action];
  };

  const startEditMessage = (hash: string, message: string) => {
    setEditingMessage(hash);
    setNewMessage(message);
  };

  const saveMessage = (hash: string) => {
    setCommits(prev => prev.map(c =>
      c.hash === hash ? { ...c, message: newMessage } : c
    ));
    setEditingMessage(null);
    setNewMessage('');
  };

  return (
    <div className="interactive-rebase">
      <div className="rebase-header">
        <h3>Interactive Rebase</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="rebase-content">
        <div className="rebase-info">
          <div className="info-item">
            <span className="label">Current Branch:</span>
            <span className="value">{currentBranch}</span>
          </div>
          <div className="info-item">
            <span className="label">Rebase onto:</span>
            <select
              value={rebaseTarget}
              onChange={(e) => setRebaseTarget(e.target.value)}
            >
              <option value="main">main</option>
              <option value="develop">develop</option>
              <option value="HEAD~5">HEAD~5</option>
              <option value="origin/main">origin/main</option>
            </select>
          </div>
        </div>

        <div className="action-legend">
          {actionOptions.map(opt => (
            <div key={opt.value} className="legend-item">
              <span
                className="action-badge"
                style={{ background: getActionColor(opt.value as RebaseCommit['action']) }}
              >
                {opt.shortcut}
              </span>
              <span className="action-name">{opt.label}</span>
              <span className="action-desc">{opt.description}</span>
            </div>
          ))}
        </div>

        <div className="commits-list">
          <div className="list-header">
            <span>Commits to rebase (drag to reorder)</span>
            <span className="commit-count">{commits.length} commits</span>
          </div>

          {commits.map((commit, index) => (
            <div
              key={commit.hash}
              className={`commit-item ${commit.action === 'drop' ? 'dropped' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="drag-handle">⋮⋮</div>

              <select
                className="action-select"
                value={commit.action}
                onChange={(e) => updateAction(commit.hash, e.target.value as RebaseCommit['action'])}
                style={{ borderColor: getActionColor(commit.action) }}
              >
                {actionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span className="commit-hash">{commit.shortHash}</span>

              {editingMessage === commit.hash ? (
                <div className="message-edit">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveMessage(commit.hash);
                      if (e.key === 'Escape') setEditingMessage(null);
                    }}
                    autoFocus
                  />
                  <button onClick={() => saveMessage(commit.hash)}>✓</button>
                  <button onClick={() => setEditingMessage(null)}>✕</button>
                </div>
              ) : (
                <span
                  className="commit-message"
                  onDoubleClick={() => startEditMessage(commit.hash, commit.message)}
                >
                  {commit.message}
                </span>
              )}

              <span className="commit-meta">
                <span className="author">{commit.author}</span>
                <span className="date">{commit.date}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="rebase-preview">
          <div className="preview-header">Preview</div>
          <pre className="preview-content">
{commits
  .filter(c => c.action !== 'drop')
  .map(c => `${c.action} ${c.shortHash} ${c.message}`)
  .join('\n')}
          </pre>
        </div>

        <div className="rebase-actions">
          <button
            className="start-btn"
            onClick={startRebase}
            disabled={isRebasing}
          >
            {isRebasing ? 'Rebasing...' : 'Start Rebase'}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        .interactive-rebase {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .rebase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .rebase-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .rebase-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .rebase-info {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .info-item .label { color: var(--text-secondary); font-size: 13px; }
        .info-item .value { font-weight: 500; }
        .info-item select {
          padding: 4px 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .action-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .action-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          font-family: monospace;
        }
        .action-name { font-size: 12px; font-weight: 500; }
        .action-desc { font-size: 11px; color: var(--text-tertiary); }
        .commits-list { margin-bottom: 16px; }
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .commit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 4px;
          cursor: grab;
        }
        .commit-item.dropped { opacity: 0.5; text-decoration: line-through; }
        .commit-item:active { cursor: grabbing; }
        .drag-handle {
          color: var(--text-tertiary);
          cursor: grab;
          user-select: none;
        }
        .action-select {
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 2px solid;
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 11px;
          width: 80px;
        }
        .commit-hash {
          font-family: monospace;
          font-size: 12px;
          color: var(--accent-color);
        }
        .commit-message {
          flex: 1;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .message-edit {
          flex: 1;
          display: flex;
          gap: 4px;
        }
        .message-edit input {
          flex: 1;
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--accent-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .message-edit button {
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
        }
        .commit-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .rebase-preview {
          background: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .preview-header {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          color: var(--text-secondary);
        }
        .preview-content {
          padding: 12px;
          font-family: monospace;
          font-size: 12px;
          margin: 0;
          white-space: pre-wrap;
        }
        .rebase-actions {
          display: flex;
          gap: 12px;
        }
        .start-btn {
          flex: 1;
          padding: 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cancel-btn {
          padding: 12px 24px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
