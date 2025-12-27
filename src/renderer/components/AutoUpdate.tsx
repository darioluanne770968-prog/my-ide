import React, { useState, useEffect } from 'react';

interface UpdateInfo {
  version: string;
  releaseDate: Date;
  releaseNotes: string[];
  downloadSize: string;
  isRequired: boolean;
}

interface AutoUpdateProps {
  currentVersion: string;
  onClose: () => void;
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error' | 'up-to-date';

function AutoUpdate({ currentVersion, onClose }: AutoUpdateProps) {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [autoCheck, setAutoCheck] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
    loadSettings();
    if (autoCheck) {
      checkForUpdates();
    }
  }, []);

  const loadSettings = () => {
    const settings = localStorage.getItem('my-ide-update-settings');
    if (settings) {
      const { autoCheck: ac, autoDownload: ad } = JSON.parse(settings);
      setAutoCheck(ac);
      setAutoDownload(ad);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('my-ide-update-settings', JSON.stringify({
      autoCheck,
      autoDownload
    }));
  };

  const checkForUpdates = async () => {
    setStatus('checking');
    setError(null);

    // Simulate checking for updates
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate finding an update (for demo purposes)
    const hasUpdate = Math.random() > 0.5;

    if (hasUpdate) {
      const mockUpdate: UpdateInfo = {
        version: '1.1.0',
        releaseDate: new Date(),
        releaseNotes: [
          'New: AI-powered code refactoring',
          'New: HTTP client for API testing',
          'Improved: Git integration performance',
          'Fixed: Terminal crash on Windows',
          'Fixed: Memory leak in file watcher'
        ],
        downloadSize: '78.5 MB',
        isRequired: false
      };
      setUpdateInfo(mockUpdate);
      setStatus('available');

      if (autoDownload) {
        downloadUpdate();
      }
    } else {
      setStatus('up-to-date');
    }
  };

  const downloadUpdate = async () => {
    if (!updateInfo) return;

    setStatus('downloading');
    setDownloadProgress(0);

    // Simulate download progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDownloadProgress(i);
    }

    setStatus('ready');
  };

  const installUpdate = () => {
    // In real implementation, this would trigger the installer
    alert('In a real implementation, this would restart the app and install the update.');
  };

  const skipVersion = () => {
    if (updateInfo) {
      const skipped = JSON.parse(localStorage.getItem('my-ide-skipped-versions') || '[]');
      skipped.push(updateInfo.version);
      localStorage.setItem('my-ide-skipped-versions', JSON.stringify(skipped));
      setStatus('idle');
      setUpdateInfo(null);
      onClose();
    }
  };

  return (
    <div className="auto-update">
      <div className="update-header">
        <h3>🔄 Updates</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="update-content">
        <div className="current-version">
          <span>Current Version:</span>
          <strong>{currentVersion}</strong>
        </div>

        {status === 'idle' && (
          <div className="update-idle">
            <button onClick={checkForUpdates} className="check-btn">
              Check for Updates
            </button>
          </div>
        )}

        {status === 'checking' && (
          <div className="update-checking">
            <div className="spinner" />
            <p>Checking for updates...</p>
          </div>
        )}

        {status === 'up-to-date' && (
          <div className="update-current">
            <div className="check-icon">✓</div>
            <p>You're up to date!</p>
            <span className="version-info">My IDE {currentVersion} is the latest version.</span>
            <button onClick={checkForUpdates} className="check-again-btn">
              Check Again
            </button>
          </div>
        )}

        {status === 'available' && updateInfo && (
          <div className="update-available">
            <div className="update-badge">New Update Available</div>
            <div className="update-info">
              <div className="version-row">
                <span>New Version:</span>
                <strong>{updateInfo.version}</strong>
              </div>
              <div className="version-row">
                <span>Release Date:</span>
                <span>{updateInfo.releaseDate.toLocaleDateString()}</span>
              </div>
              <div className="version-row">
                <span>Download Size:</span>
                <span>{updateInfo.downloadSize}</span>
              </div>
            </div>

            <div className="release-notes">
              <h4>What's New:</h4>
              <ul>
                {updateInfo.releaseNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="update-actions">
              <button onClick={skipVersion} className="skip-btn">
                Skip This Version
              </button>
              <button onClick={downloadUpdate} className="download-btn">
                Download & Install
              </button>
            </div>
          </div>
        )}

        {status === 'downloading' && (
          <div className="update-downloading">
            <p>Downloading update...</p>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <span className="progress-text">{downloadProgress}%</span>
            </div>
            <span className="download-info">
              {updateInfo?.downloadSize} • {Math.round(downloadProgress * 0.785)} MB downloaded
            </span>
          </div>
        )}

        {status === 'ready' && (
          <div className="update-ready">
            <div className="ready-icon">🎉</div>
            <p>Update downloaded and ready to install!</p>
            <span>The application will restart to complete the update.</span>
            <button onClick={installUpdate} className="install-btn">
              Restart & Install
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="update-error">
            <div className="error-icon">⚠️</div>
            <p>Update check failed</p>
            <span>{error}</span>
            <button onClick={checkForUpdates} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        <div className="update-settings">
          <h4>Update Settings</h4>
          <label>
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={(e) => {
                setAutoCheck(e.target.checked);
                saveSettings();
              }}
            />
            Automatically check for updates
          </label>
          <label>
            <input
              type="checkbox"
              checked={autoDownload}
              onChange={(e) => {
                setAutoDownload(e.target.checked);
                saveSettings();
              }}
            />
            Automatically download updates
          </label>
        </div>
      </div>
    </div>
  );
}

export default AutoUpdate;
