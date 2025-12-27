import React, { useState, useEffect } from 'react';

interface SessionData {
  rootPath: string | null;
  openFiles: Array<{ path: string; name: string }>;
  activeFile: string | null;
  cursorPositions: Record<string, { line: number; column: number }>;
  terminalOpen: boolean;
  activePanel: string;
  timestamp: number;
}

interface SessionRestoreProps {
  onRestore: (session: SessionData) => void;
  onDismiss: () => void;
  currentSession: SessionData;
}

const SESSION_KEY = 'my-ide-session';
const MAX_SESSIONS = 5;

export function saveSession(session: SessionData): void {
  try {
    const sessions = getSavedSessions();
    sessions.unshift({ ...session, timestamp: Date.now() });
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function getSavedSessions(): SessionData[] {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearSavedSessions(): void {
  localStorage.removeItem(SESSION_KEY);
}

function SessionRestore({ onRestore, onDismiss, currentSession }: SessionRestoreProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);

  useEffect(() => {
    setSessions(getSavedSessions());
  }, []);

  // Auto-save current session periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSession.rootPath) {
        saveSession(currentSession);
      }
    }, 60000); // Save every minute

    return () => clearInterval(interval);
  }, [currentSession]);

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession.rootPath) {
        saveSession(currentSession);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSession]);

  const handleRestore = () => {
    if (selectedSession) {
      onRestore(selectedSession);
    }
  };

  const handleDelete = (index: number) => {
    const newSessions = sessions.filter((_, i) => i !== index);
    setSessions(newSessions);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSessions));
    if (selectedSession === sessions[index]) {
      setSelectedSession(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="session-restore-overlay">
      <div className="session-restore">
        <div className="session-header">
          <h3>Restore Previous Session</h3>
          <button onClick={onDismiss} className="close-btn">×</button>
        </div>

        <div className="session-content">
          <p>Would you like to restore a previous session?</p>

          <div className="session-list">
            {sessions.map((session, index) => (
              <div
                key={index}
                className={`session-item ${selectedSession === session ? 'selected' : ''}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="session-info">
                  <div className="session-path">
                    {session.rootPath?.split('/').pop() || 'Unknown Project'}
                  </div>
                  <div className="session-details">
                    <span className="session-files">{session.openFiles.length} files</span>
                    <span className="session-time">{formatDate(session.timestamp)}</span>
                  </div>
                  <div className="session-file-list">
                    {session.openFiles.slice(0, 3).map((f, i) => (
                      <span key={i} className="session-file">{f.name}</span>
                    ))}
                    {session.openFiles.length > 3 && (
                      <span className="session-more">+{session.openFiles.length - 3} more</span>
                    )}
                  </div>
                </div>
                <button
                  className="delete-session-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="session-actions">
          <button onClick={onDismiss} className="dismiss-btn">Start Fresh</button>
          <button
            onClick={handleRestore}
            disabled={!selectedSession}
            className="restore-btn"
          >
            Restore Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionRestore;
