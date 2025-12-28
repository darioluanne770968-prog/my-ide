import { useState } from 'react';

interface CherryPickUIProps {
  rootPath: string;
  currentBranch: string;
  onComplete: () => void;
  onClose: () => void;
}

interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  selected: boolean;
}

export default function CherryPickUI({
  rootPath,
  currentBranch,
  onComplete,
  onClose
}: CherryPickUIProps) {
  const [sourceBranch, setSourceBranch] = useState('feature/user-auth');
  const [commits, setCommits] = useState<Commit[]>([
    { hash: 'abc123456', shortHash: 'abc1234', message: 'feat: Add login form', author: 'John Doe', date: '2024-01-15', branch: 'feature/user-auth', selected: false },
    { hash: 'def234567', shortHash: 'def2345', message: 'feat: Add password validation', author: 'John Doe', date: '2024-01-15', branch: 'feature/user-auth', selected: false },
    { hash: 'ghi345678', shortHash: 'ghi3456', message: 'fix: Fix input styling', author: 'Jane Smith', date: '2024-01-14', branch: 'feature/user-auth', selected: false },
    { hash: 'jkl456789', shortHash: 'jkl4567', message: 'feat: Add remember me checkbox', author: 'John Doe', date: '2024-01-14', branch: 'feature/user-auth', selected: false },
    { hash: 'mno567890', shortHash: 'mno5678', message: 'test: Add login tests', author: 'Jane Smith', date: '2024-01-13', branch: 'feature/user-auth', selected: false }
  ]);
  const [isPicking, setIsPicking] = useState(false);
  const [pickResult, setPickResult] = useState<'success' | 'conflict' | null>(null);
  const [noCommit, setNoCommit] = useState(false);

  const branches = ['feature/user-auth', 'feature/dashboard', 'bugfix/login', 'develop'];

  const toggleCommit = (hash: string) => {
    setCommits(prev => prev.map(c =>
      c.hash === hash ? { ...c, selected: !c.selected } : c
    ));
  };

  const selectAll = () => {
    setCommits(prev => prev.map(c => ({ ...c, selected: true })));
  };

  const deselectAll = () => {
    setCommits(prev => prev.map(c => ({ ...c, selected: false })));
  };

  const selectedCommits = commits.filter(c => c.selected);

  const cherryPick = async () => {
    setIsPicking(true);
    setPickResult(null);

    // Simulate cherry-pick
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Randomly simulate success or conflict
    const success = Math.random() > 0.3;
    setPickResult(success ? 'success' : 'conflict');
    setIsPicking(false);

    if (success) {
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div className="cherry-pick-ui">
      <div className="cp-header">
        <h3>Cherry Pick Commits</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="cp-content">
        <div className="branch-info">
          <div className="branch-section">
            <label>From Branch:</label>
            <select
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
            >
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="arrow">→</div>

          <div className="branch-section">
            <label>To Branch:</label>
            <div className="current-branch">{currentBranch}</div>
          </div>
        </div>

        <div className="commits-section">
          <div className="section-header">
            <span>Select Commits</span>
            <div className="selection-actions">
              <button onClick={selectAll}>Select All</button>
              <button onClick={deselectAll}>Deselect All</button>
            </div>
          </div>

          <div className="commits-list">
            {commits.map(commit => (
              <div
                key={commit.hash}
                className={`commit-item ${commit.selected ? 'selected' : ''}`}
                onClick={() => toggleCommit(commit.hash)}
              >
                <input
                  type="checkbox"
                  checked={commit.selected}
                  onChange={() => toggleCommit(commit.hash)}
                />
                <div className="commit-info">
                  <div className="commit-header">
                    <span className="commit-hash">{commit.shortHash}</span>
                    <span className="commit-message">{commit.message}</span>
                  </div>
                  <div className="commit-meta">
                    <span className="author">{commit.author}</span>
                    <span className="date">{commit.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="options-section">
          <label className="option">
            <input
              type="checkbox"
              checked={noCommit}
              onChange={(e) => setNoCommit(e.target.checked)}
            />
            <span>No commit (apply changes without committing)</span>
          </label>
        </div>

        {pickResult && (
          <div className={`result-message ${pickResult}`}>
            {pickResult === 'success' ? (
              <>
                <span className="icon">✓</span>
                <span>Successfully cherry-picked {selectedCommits.length} commit(s)</span>
              </>
            ) : (
              <>
                <span className="icon">⚠</span>
                <span>Conflict detected! Please resolve conflicts and commit.</span>
                <button className="resolve-btn" onClick={onClose}>
                  Resolve Conflicts
                </button>
              </>
            )}
          </div>
        )}

        <div className="preview-section">
          <div className="preview-header">
            <span>Preview</span>
            <span className="count">{selectedCommits.length} commit(s) selected</span>
          </div>
          <div className="preview-content">
            {selectedCommits.length === 0 ? (
              <div className="empty">No commits selected</div>
            ) : (
              <pre>
                {selectedCommits.map(c =>
                  `git cherry-pick ${noCommit ? '-n ' : ''}${c.shortHash}`
                ).join('\n')}
              </pre>
            )}
          </div>
        </div>

        <div className="actions">
          <button
            className="pick-btn"
            onClick={cherryPick}
            disabled={isPicking || selectedCommits.length === 0}
          >
            {isPicking ? (
              <>
                <span className="spinner"></span>
                Cherry Picking...
              </>
            ) : (
              `Cherry Pick ${selectedCommits.length} Commit(s)`
            )}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        .cherry-pick-ui {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .cp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .cp-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .cp-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .branch-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .branch-section { display: flex; flex-direction: column; gap: 4px; }
        .branch-section label { font-size: 11px; color: var(--text-secondary); }
        .branch-section select {
          padding: 8px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .current-branch {
          padding: 8px 12px;
          background: var(--accent-color);
          color: white;
          border-radius: 4px;
          font-weight: 500;
        }
        .arrow { font-size: 24px; color: var(--text-tertiary); }
        .commits-section { margin-bottom: 16px; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .section-header span { font-size: 13px; font-weight: 500; }
        .selection-actions { display: flex; gap: 8px; }
        .selection-actions button {
          padding: 4px 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
        }
        .commits-list {
          max-height: 250px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }
        .commit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }
        .commit-item:last-child { border-bottom: none; }
        .commit-item:hover { background: var(--bg-secondary); }
        .commit-item.selected { background: rgba(52, 152, 219, 0.1); }
        .commit-info { flex: 1; }
        .commit-header { display: flex; gap: 8px; align-items: center; }
        .commit-hash {
          font-family: monospace;
          font-size: 12px;
          color: var(--accent-color);
        }
        .commit-message { font-size: 13px; }
        .commit-meta {
          display: flex;
          gap: 12px;
          margin-top: 4px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .options-section {
          margin-bottom: 16px;
        }
        .option {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .result-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 13px;
        }
        .result-message.success {
          background: rgba(39, 174, 96, 0.2);
          color: #27ae60;
        }
        .result-message.conflict {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }
        .result-message .icon { font-size: 18px; }
        .resolve-btn {
          margin-left: auto;
          padding: 4px 12px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .preview-section {
          background: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
        }
        .preview-header .count { color: var(--text-secondary); }
        .preview-content {
          padding: 12px;
        }
        .preview-content pre {
          margin: 0;
          font-family: monospace;
          font-size: 12px;
        }
        .preview-content .empty {
          color: var(--text-tertiary);
          font-style: italic;
        }
        .actions { display: flex; gap: 12px; }
        .pick-btn {
          flex: 1;
          padding: 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .pick-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cancel-btn {
          padding: 12px 24px;
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
