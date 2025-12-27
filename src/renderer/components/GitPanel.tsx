import React, { useState, useEffect, useCallback } from 'react';

interface GitStatus {
  current: string | null;
  tracking: string | null;
  staged: string[];
  modified: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

interface GitPanelProps {
  rootPath: string | null;
  onShowDiff?: (filePath: string) => void;
}

function GitPanel({ rootPath, onShowDiff }: GitPanelProps) {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ hash: string; message: string; date: string; author: string }>>([]);

  const refreshStatus = useCallback(async () => {
    if (!rootPath) return;
    setIsLoading(true);
    setError(null);
    try {
      const gitStatus = await window.electronAPI.gitStatus(rootPath);
      setStatus(gitStatus);
      const gitLogs = await window.electronAPI.gitLog(rootPath, 10);
      setLogs(gitLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to get git status');
    } finally {
      setIsLoading(false);
    }
  }, [rootPath]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleStageFile = async (filePath: string) => {
    if (!rootPath) return;
    try {
      await window.electronAPI.gitAdd(rootPath, filePath);
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnstageFile = async (filePath: string) => {
    if (!rootPath) return;
    try {
      await window.electronAPI.gitUnstage(rootPath, filePath);
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStageAll = async () => {
    if (!rootPath) return;
    try {
      await window.electronAPI.gitAdd(rootPath, '.');
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCommit = async () => {
    if (!rootPath || !commitMessage.trim()) return;
    try {
      await window.electronAPI.gitCommit(rootPath, commitMessage);
      setCommitMessage('');
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePush = async () => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitPush(rootPath);
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    if (!rootPath) return;
    setIsLoading(true);
    try {
      await window.electronAPI.gitPull(rootPath);
      refreshStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!rootPath) {
    return (
      <div className="git-panel">
        <div className="git-empty">Open a folder to use Git</div>
      </div>
    );
  }

  return (
    <div className="git-panel">
      <div className="git-header">
        <span className="git-branch">
          🌿 {status?.current || 'No branch'}
        </span>
        <div className="git-actions">
          <button onClick={refreshStatus} disabled={isLoading} title="Refresh">
            🔄
          </button>
          <button onClick={handlePull} disabled={isLoading} title="Pull">
            ⬇️
          </button>
          <button onClick={handlePush} disabled={isLoading} title="Push">
            ⬆️
          </button>
        </div>
      </div>

      {error && <div className="git-error">{error}</div>}

      {status && (
        <>
          <div className="git-section">
            <div className="git-section-header">
              <span>Staged Changes ({status.staged.length})</span>
            </div>
            {status.staged.map((file) => (
              <div key={file} className="git-file staged">
                <span className="git-file-status">✓</span>
                <span className="git-file-name">{file}</span>
                <button
                  className="git-file-action"
                  onClick={() => handleUnstageFile(file)}
                  title="Unstage"
                >
                  −
                </button>
              </div>
            ))}
          </div>

          <div className="git-section">
            <div className="git-section-header">
              <span>Changes ({status.modified.length + status.untracked.length})</span>
              <button onClick={handleStageAll} title="Stage All">+</button>
            </div>
            {status.modified.map((file) => (
              <div key={file} className="git-file modified">
                <span className="git-file-status">M</span>
                <span
                  className="git-file-name"
                  onClick={() => onShowDiff && onShowDiff(file)}
                  style={{ cursor: onShowDiff ? 'pointer' : 'default' }}
                >
                  {file}
                </span>
                <button
                  className="git-file-action"
                  onClick={() => handleStageFile(file)}
                  title="Stage"
                >
                  +
                </button>
              </div>
            ))}
            {status.untracked.map((file) => (
              <div key={file} className="git-file untracked">
                <span className="git-file-status">U</span>
                <span className="git-file-name">{file}</span>
                <button
                  className="git-file-action"
                  onClick={() => handleStageFile(file)}
                  title="Stage"
                >
                  +
                </button>
              </div>
            ))}
          </div>

          <div className="git-commit-section">
            <textarea
              className="git-commit-input"
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={3}
            />
            <button
              className="git-commit-btn"
              onClick={handleCommit}
              disabled={!commitMessage.trim() || status.staged.length === 0}
            >
              Commit
            </button>
          </div>

          <div className="git-section">
            <div className="git-section-header">
              <span>Recent Commits</span>
            </div>
            <div className="git-logs">
              {logs.map((log) => (
                <div key={log.hash} className="git-log-item">
                  <span className="git-log-hash">{log.hash.substring(0, 7)}</span>
                  <span className="git-log-message">{log.message}</span>
                  <span className="git-log-date">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GitPanel;
