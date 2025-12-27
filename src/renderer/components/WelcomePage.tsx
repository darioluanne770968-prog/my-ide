import React from 'react';

interface RecentProject {
  path: string;
  name: string;
  lastOpened: Date;
}

interface WelcomePageProps {
  recentProjects: RecentProject[];
  onOpenFolder: () => void;
  onOpenRecent: (path: string) => void;
  onNewFile: () => void;
  onShowSettings: () => void;
  onShowTutorial: () => void;
}

function WelcomePage({
  recentProjects,
  onOpenFolder,
  onOpenRecent,
  onNewFile,
  onShowSettings,
  onShowTutorial
}: WelcomePageProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="welcome-page">
      <div className="welcome-header">
        <div className="welcome-logo">
          <span className="logo-icon">⚡</span>
          <h1>My IDE</h1>
        </div>
        <p className="welcome-subtitle">A Modern Development Environment</p>
      </div>

      <div className="welcome-content">
        <div className="welcome-section start-section">
          <h2>Start</h2>
          <div className="start-actions">
            <button className="start-action" onClick={onNewFile}>
              <span className="action-icon">📄</span>
              <div className="action-text">
                <span className="action-title">New File</span>
                <span className="action-desc">Create a new file</span>
              </div>
            </button>

            <button className="start-action" onClick={onOpenFolder}>
              <span className="action-icon">📁</span>
              <div className="action-text">
                <span className="action-title">Open Folder</span>
                <span className="action-desc">Open a project folder</span>
              </div>
            </button>

            <button className="start-action" onClick={onShowSettings}>
              <span className="action-icon">⚙️</span>
              <div className="action-text">
                <span className="action-title">Settings</span>
                <span className="action-desc">Configure your IDE</span>
              </div>
            </button>

            <button className="start-action" onClick={onShowTutorial}>
              <span className="action-icon">📚</span>
              <div className="action-text">
                <span className="action-title">Tutorial</span>
                <span className="action-desc">Learn the basics</span>
              </div>
            </button>
          </div>
        </div>

        <div className="welcome-section recent-section">
          <h2>Recent</h2>
          {recentProjects.length > 0 ? (
            <div className="recent-list">
              {recentProjects.slice(0, 5).map((project) => (
                <button
                  key={project.path}
                  className="recent-item"
                  onClick={() => onOpenRecent(project.path)}
                >
                  <span className="recent-icon">📂</span>
                  <div className="recent-info">
                    <span className="recent-name">{project.name}</span>
                    <span className="recent-path">{project.path}</span>
                  </div>
                  <span className="recent-date">{formatDate(project.lastOpened)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="recent-empty">
              <p>No recent projects</p>
            </div>
          )}
        </div>

        <div className="welcome-section shortcuts-section">
          <h2>Keyboard Shortcuts</h2>
          <div className="shortcuts-grid">
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
              <span>Command Palette</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>P</kbd>
              <span>Quick Open</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>`</kbd>
              <span>Toggle Terminal</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>B</kbd>
              <span>Toggle Sidebar</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>F</kbd>
              <span>Find</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>S</kbd>
              <span>Save</span>
            </div>
          </div>
        </div>

        <div className="welcome-section features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span className="feature-title">AI Assistant</span>
              <span className="feature-desc">Code completion and chat powered by AI</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span className="feature-title">Smart Search</span>
              <span className="feature-desc">Find files and content quickly</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-title">Git Integration</span>
              <span className="feature-desc">Built-in version control</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span className="feature-title">Themes</span>
              <span className="feature-desc">Customizable appearance</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔧</span>
              <span className="feature-title">Debugging</span>
              <span className="feature-desc">Integrated debugger</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📡</span>
              <span className="feature-title">HTTP Client</span>
              <span className="feature-desc">Test APIs directly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="welcome-footer">
        <p>Version 1.0.0 • Made with ❤️</p>
      </div>
    </div>
  );
}

export default WelcomePage;
