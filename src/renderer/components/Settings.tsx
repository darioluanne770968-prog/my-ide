import React, { useState, useEffect } from 'react';

export interface AppSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  aiApiKey: string;
  aiModel: string;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  autoSave: false,
  autoSaveDelay: 1000,
  aiApiKey: '',
  aiModel: 'claude-3-5-sonnet-20241022',
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

function Settings({ isOpen, onClose, settings, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    window.electronAPI.saveSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Editor</h3>

            <div className="settings-item">
              <label>Theme</label>
              <select
                value={localSettings.theme}
                onChange={(e) => handleChange('theme', e.target.value as 'dark' | 'light')}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div className="settings-item">
              <label>Font Size</label>
              <input
                type="number"
                min={10}
                max={24}
                value={localSettings.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              />
            </div>

            <div className="settings-item">
              <label>Font Family</label>
              <input
                type="text"
                value={localSettings.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
              />
            </div>

            <div className="settings-item">
              <label>Tab Size</label>
              <select
                value={localSettings.tabSize}
                onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </div>

            <div className="settings-item">
              <label>Word Wrap</label>
              <input
                type="checkbox"
                checked={localSettings.wordWrap}
                onChange={(e) => handleChange('wordWrap', e.target.checked)}
              />
            </div>

            <div className="settings-item">
              <label>Minimap</label>
              <input
                type="checkbox"
                checked={localSettings.minimap}
                onChange={(e) => handleChange('minimap', e.target.checked)}
              />
            </div>

            <div className="settings-item">
              <label>Line Numbers</label>
              <input
                type="checkbox"
                checked={localSettings.lineNumbers}
                onChange={(e) => handleChange('lineNumbers', e.target.checked)}
              />
            </div>
          </section>

          <section className="settings-section">
            <h3>Auto Save</h3>

            <div className="settings-item">
              <label>Enable Auto Save</label>
              <input
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
            </div>

            <div className="settings-item">
              <label>Auto Save Delay (ms)</label>
              <input
                type="number"
                min={500}
                max={5000}
                step={500}
                value={localSettings.autoSaveDelay}
                onChange={(e) => handleChange('autoSaveDelay', parseInt(e.target.value))}
                disabled={!localSettings.autoSave}
              />
            </div>
          </section>

          <section className="settings-section">
            <h3>AI Assistant</h3>

            <div className="settings-item">
              <label>API Key (Claude)</label>
              <input
                type="password"
                value={localSettings.aiApiKey}
                onChange={(e) => handleChange('aiApiKey', e.target.value)}
                placeholder="sk-ant-..."
              />
            </div>

            <div className="settings-item">
              <label>Model</label>
              <select
                value={localSettings.aiModel}
                onChange={(e) => handleChange('aiModel', e.target.value)}
              >
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </select>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="settings-btn secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="settings-btn primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export { defaultSettings };
export default Settings;
