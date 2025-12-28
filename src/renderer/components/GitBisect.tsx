import { useState } from 'react';

interface GitBisectProps {
  rootPath: string;
  onComplete: (badCommit: string) => void;
  onClose: () => void;
}

interface BisectState {
  status: 'idle' | 'running' | 'found';
  goodCommit: string;
  badCommit: string;
  currentCommit: string;
  stepsRemaining: number;
  totalSteps: number;
  history: Array<{ commit: string; result: 'good' | 'bad' | 'skip'; message: string }>;
}

export default function GitBisect({
  rootPath,
  onComplete,
  onClose
}: GitBisectProps) {
  const [state, setState] = useState<BisectState>({
    status: 'idle',
    goodCommit: '',
    badCommit: '',
    currentCommit: '',
    stepsRemaining: 0,
    totalSteps: 0,
    history: []
  });

  const [commitHistory] = useState([
    { hash: 'abc1234', message: 'feat: Add new feature', date: '2024-01-20' },
    { hash: 'def2345', message: 'fix: Bug fix', date: '2024-01-19' },
    { hash: 'ghi3456', message: 'refactor: Clean up code', date: '2024-01-18' },
    { hash: 'jkl4567', message: 'feat: Another feature', date: '2024-01-17' },
    { hash: 'mno5678', message: 'fix: Critical fix', date: '2024-01-16' },
    { hash: 'pqr6789', message: 'Initial commit', date: '2024-01-15' }
  ]);

  const startBisect = () => {
    if (!state.goodCommit || !state.badCommit) return;

    const midIndex = Math.floor(commitHistory.length / 2);
    setState({
      ...state,
      status: 'running',
      currentCommit: commitHistory[midIndex].hash,
      stepsRemaining: Math.ceil(Math.log2(commitHistory.length)),
      totalSteps: Math.ceil(Math.log2(commitHistory.length)),
      history: []
    });
  };

  const markAs = (result: 'good' | 'bad' | 'skip') => {
    const currentCommitData = commitHistory.find(c => c.hash === state.currentCommit);

    const newHistory = [
      ...state.history,
      {
        commit: state.currentCommit,
        result,
        message: currentCommitData?.message || ''
      }
    ];

    // Simulate bisect progress
    const remaining = state.stepsRemaining - 1;

    if (remaining <= 0) {
      // Found the bad commit
      setState({
        ...state,
        status: 'found',
        history: newHistory
      });
      onComplete(state.currentCommit);
    } else {
      // Continue bisecting
      const nextIndex = Math.floor(Math.random() * commitHistory.length);
      setState({
        ...state,
        currentCommit: commitHistory[nextIndex].hash,
        stepsRemaining: remaining,
        history: newHistory
      });
    }
  };

  const resetBisect = () => {
    setState({
      status: 'idle',
      goodCommit: '',
      badCommit: '',
      currentCommit: '',
      stepsRemaining: 0,
      totalSteps: 0,
      history: []
    });
  };

  const getCurrentCommitData = () => {
    return commitHistory.find(c => c.hash === state.currentCommit);
  };

  return (
    <div className="git-bisect">
      <div className="bisect-header">
        <h3>Git Bisect</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="bisect-content">
        <div className="info-section">
          <p>Git bisect helps you find the commit that introduced a bug using binary search.</p>
        </div>

        {state.status === 'idle' && (
          <div className="setup-section">
            <div className="commit-select">
              <label>Known Good Commit (before bug):</label>
              <select
                value={state.goodCommit}
                onChange={(e) => setState({ ...state, goodCommit: e.target.value })}
              >
                <option value="">Select a commit...</option>
                {commitHistory.map(c => (
                  <option key={c.hash} value={c.hash}>
                    {c.hash} - {c.message}
                  </option>
                ))}
              </select>
            </div>

            <div className="commit-select">
              <label>Known Bad Commit (with bug):</label>
              <select
                value={state.badCommit}
                onChange={(e) => setState({ ...state, badCommit: e.target.value })}
              >
                <option value="">Select a commit...</option>
                {commitHistory.map(c => (
                  <option key={c.hash} value={c.hash}>
                    {c.hash} - {c.message}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="start-btn"
              onClick={startBisect}
              disabled={!state.goodCommit || !state.badCommit}
            >
              Start Bisect
            </button>
          </div>
        )}

        {state.status === 'running' && (
          <div className="running-section">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((state.totalSteps - state.stepsRemaining) / state.totalSteps) * 100}%`
                }}
              />
            </div>
            <div className="progress-text">
              Step {state.totalSteps - state.stepsRemaining + 1} of ~{state.totalSteps}
              ({state.stepsRemaining} remaining)
            </div>

            <div className="current-commit-card">
              <div className="card-header">
                <span className="label">Testing Commit:</span>
                <span className="hash">{state.currentCommit}</span>
              </div>
              <div className="card-body">
                <div className="message">{getCurrentCommitData()?.message}</div>
                <div className="date">{getCurrentCommitData()?.date}</div>
              </div>
              <div className="card-footer">
                <p>Does this commit contain the bug?</p>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="good-btn"
                onClick={() => markAs('good')}
              >
                <span className="icon">✓</span>
                Good (No Bug)
              </button>
              <button
                className="bad-btn"
                onClick={() => markAs('bad')}
              >
                <span className="icon">✗</span>
                Bad (Has Bug)
              </button>
              <button
                className="skip-btn"
                onClick={() => markAs('skip')}
              >
                <span className="icon">→</span>
                Skip
              </button>
            </div>

            <button className="reset-btn" onClick={resetBisect}>
              Reset Bisect
            </button>
          </div>
        )}

        {state.status === 'found' && (
          <div className="found-section">
            <div className="found-icon">🎯</div>
            <h4>Bad Commit Found!</h4>
            <div className="found-commit">
              <span className="hash">{state.currentCommit}</span>
              <span className="message">{getCurrentCommitData()?.message}</span>
            </div>
            <div className="actions">
              <button className="view-btn" onClick={onClose}>
                View Commit
              </button>
              <button className="reset-btn" onClick={resetBisect}>
                Start New Bisect
              </button>
            </div>
          </div>
        )}

        {state.history.length > 0 && (
          <div className="history-section">
            <h4>Bisect History</h4>
            <div className="history-list">
              {state.history.map((item, idx) => (
                <div key={idx} className={`history-item ${item.result}`}>
                  <span className={`result-badge ${item.result}`}>
                    {item.result.toUpperCase()}
                  </span>
                  <span className="commit">{item.commit}</span>
                  <span className="message">{item.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .git-bisect {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .bisect-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .bisect-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .bisect-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .info-section {
          padding: 12px;
          background: rgba(52, 152, 219, 0.1);
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .info-section p { margin: 0; font-size: 13px; }
        .setup-section { display: flex; flex-direction: column; gap: 16px; }
        .commit-select { display: flex; flex-direction: column; gap: 8px; }
        .commit-select label { font-size: 13px; color: var(--text-secondary); }
        .commit-select select {
          padding: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .start-btn {
          padding: 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .running-section { display: flex; flex-direction: column; gap: 16px; }
        .progress-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent-color);
          transition: width 0.3s;
        }
        .progress-text {
          text-align: center;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .current-commit-card {
          background: var(--bg-secondary);
          border-radius: 8px;
          overflow: hidden;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg-primary);
        }
        .card-header .label { color: var(--text-secondary); font-size: 12px; }
        .card-header .hash {
          font-family: monospace;
          color: var(--accent-color);
        }
        .card-body { padding: 16px; }
        .card-body .message { font-size: 16px; font-weight: 500; }
        .card-body .date {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }
        .card-footer {
          padding: 12px;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        .card-footer p { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .action-buttons { display: flex; gap: 12px; }
        .action-buttons button {
          flex: 1;
          padding: 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .good-btn { background: #27ae60; color: white; }
        .bad-btn { background: #e74c3c; color: white; }
        .skip-btn { background: var(--bg-secondary); color: var(--text-primary); }
        .action-buttons .icon { font-size: 24px; }
        .reset-btn {
          padding: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .found-section {
          text-align: center;
          padding: 32px;
        }
        .found-icon { font-size: 48px; margin-bottom: 16px; }
        .found-section h4 { margin: 0 0 16px 0; color: #27ae60; }
        .found-commit {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .found-commit .hash {
          font-family: monospace;
          color: var(--accent-color);
        }
        .found-section .actions { display: flex; gap: 12px; justify-content: center; }
        .view-btn {
          padding: 10px 20px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .history-section { margin-top: 24px; }
        .history-section h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 12px;
        }
        .result-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .result-badge.good { background: #27ae60; color: white; }
        .result-badge.bad { background: #e74c3c; color: white; }
        .result-badge.skip { background: var(--bg-primary); color: var(--text-secondary); }
        .history-item .commit {
          font-family: monospace;
          color: var(--accent-color);
        }
        .history-item .message {
          flex: 1;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
