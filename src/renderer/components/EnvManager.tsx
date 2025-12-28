import { useState } from 'react';

interface EnvManagerProps {
  rootPath: string;
  onClose: () => void;
}

interface EnvVariable {
  key: string;
  value: string;
  isSecret: boolean;
  source: 'local' | 'development' | 'staging' | 'production';
}

interface EnvFile {
  name: string;
  path: string;
  variables: number;
  lastModified: string;
}

export default function EnvManager({ rootPath, onClose }: EnvManagerProps) {
  const [selectedEnv, setSelectedEnv] = useState('development');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [editingVar, setEditingVar] = useState<string | null>(null);

  const [envFiles] = useState<EnvFile[]>([
    { name: '.env', path: '.env', variables: 8, lastModified: '2 hours ago' },
    { name: '.env.local', path: '.env.local', variables: 3, lastModified: '1 day ago' },
    { name: '.env.development', path: '.env.development', variables: 12, lastModified: '3 days ago' },
    { name: '.env.production', path: '.env.production', variables: 15, lastModified: '1 week ago' }
  ]);

  const [variables, setVariables] = useState<EnvVariable[]>([
    { key: 'DATABASE_URL', value: 'postgresql://localhost:5432/mydb', isSecret: true, source: 'development' },
    { key: 'API_KEY', value: 'sk_live_xxxxxxxxxxxxx', isSecret: true, source: 'development' },
    { key: 'API_URL', value: 'https://api.example.com', isSecret: false, source: 'development' },
    { key: 'DEBUG', value: 'true', isSecret: false, source: 'development' },
    { key: 'LOG_LEVEL', value: 'debug', isSecret: false, source: 'development' },
    { key: 'PORT', value: '3000', isSecret: false, source: 'development' },
    { key: 'JWT_SECRET', value: 'super_secret_key_here', isSecret: true, source: 'development' },
    { key: 'REDIS_URL', value: 'redis://localhost:6379', isSecret: false, source: 'development' }
  ]);

  const [newVar, setNewVar] = useState({ key: '', value: '', isSecret: false });

  const environments = ['local', 'development', 'staging', 'production'];

  const filteredVariables = variables.filter(v =>
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addVariable = () => {
    if (!newVar.key.trim()) return;

    setVariables(prev => [...prev, {
      key: newVar.key.toUpperCase().replace(/\s+/g, '_'),
      value: newVar.value,
      isSecret: newVar.isSecret,
      source: selectedEnv as EnvVariable['source']
    }]);
    setNewVar({ key: '', value: '', isSecret: false });
  };

  const deleteVariable = (key: string) => {
    setVariables(prev => prev.filter(v => v.key !== key));
  };

  const updateVariable = (key: string, newValue: string) => {
    setVariables(prev => prev.map(v =>
      v.key === key ? { ...v, value: newValue } : v
    ));
    setEditingVar(null);
  };

  const maskValue = (value: string) => {
    if (value.length <= 4) return '••••••••';
    return value.slice(0, 2) + '••••••••' + value.slice(-2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="env-manager">
      <div className="env-header">
        <h3>Environment Variables</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="env-content">
        <div className="sidebar">
          <div className="section">
            <div className="section-title">Environments</div>
            {environments.map(env => (
              <div
                key={env}
                className={`env-item ${selectedEnv === env ? 'selected' : ''}`}
                onClick={() => setSelectedEnv(env)}
              >
                <span className="env-dot" data-env={env}></span>
                <span className="env-name">{env}</span>
              </div>
            ))}
          </div>

          <div className="section">
            <div className="section-title">Files</div>
            {envFiles.map(file => (
              <div key={file.name} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-meta">{file.variables} vars</span>
              </div>
            ))}
          </div>
        </div>

        <div className="main-panel">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <label className="show-secrets">
              <input
                type="checkbox"
                checked={showSecrets}
                onChange={(e) => setShowSecrets(e.target.checked)}
              />
              Show Secrets
            </label>
            <button className="import-btn">Import</button>
            <button className="export-btn">Export</button>
          </div>

          <div className="add-variable">
            <input
              type="text"
              placeholder="VARIABLE_NAME"
              value={newVar.key}
              onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
              className="key-input"
            />
            <input
              type="text"
              placeholder="value"
              value={newVar.value}
              onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
              className="value-input"
            />
            <label className="secret-checkbox">
              <input
                type="checkbox"
                checked={newVar.isSecret}
                onChange={(e) => setNewVar({ ...newVar, isSecret: e.target.checked })}
              />
              Secret
            </label>
            <button className="add-btn" onClick={addVariable}>+ Add</button>
          </div>

          <div className="variables-list">
            <div className="list-header">
              <span className="col-key">Key</span>
              <span className="col-value">Value</span>
              <span className="col-actions">Actions</span>
            </div>

            {filteredVariables.map(variable => (
              <div key={variable.key} className="variable-row">
                <span className="col-key">
                  {variable.isSecret && <span className="secret-badge">🔐</span>}
                  {variable.key}
                </span>
                <span className="col-value">
                  {editingVar === variable.key ? (
                    <input
                      type="text"
                      defaultValue={variable.value}
                      autoFocus
                      onBlur={(e) => updateVariable(variable.key, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateVariable(variable.key, (e.target as HTMLInputElement).value);
                        }
                        if (e.key === 'Escape') {
                          setEditingVar(null);
                        }
                      }}
                      className="edit-input"
                    />
                  ) : (
                    <span
                      className="value-text"
                      onClick={() => setEditingVar(variable.key)}
                    >
                      {variable.isSecret && !showSecrets
                        ? maskValue(variable.value)
                        : variable.value}
                    </span>
                  )}
                </span>
                <span className="col-actions">
                  <button
                    className="action-btn"
                    onClick={() => copyToClipboard(variable.value)}
                    title="Copy value"
                  >
                    📋
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setEditingVar(variable.key)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteVariable(variable.key)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="status-bar">
            <span>{filteredVariables.length} variables</span>
            <span>{variables.filter(v => v.isSecret).length} secrets</span>
            <span>Environment: {selectedEnv}</span>
          </div>
        </div>
      </div>

      <style>{`
        .env-manager {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .env-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .env-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .env-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 180px;
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
        }
        .section { padding: 12px; }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .env-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          text-transform: capitalize;
        }
        .env-item:hover { background: var(--bg-secondary); }
        .env-item.selected { background: var(--bg-secondary); color: var(--accent-color); }
        .env-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .env-dot[data-env="local"] { background: #95a5a6; }
        .env-dot[data-env="development"] { background: #3498db; }
        .env-dot[data-env="staging"] { background: #f39c12; }
        .env-dot[data-env="production"] { background: #27ae60; }
        .file-item {
          display: flex;
          justify-content: space-between;
          padding: 6px 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .file-meta { font-size: 10px; color: var(--text-tertiary); }
        .main-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .toolbar {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          align-items: center;
        }
        .search-input {
          flex: 1;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .show-secrets {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .import-btn, .export-btn {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
        .add-variable {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .key-input, .value-input {
          padding: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .key-input { width: 200px; font-family: monospace; }
        .value-input { flex: 1; }
        .secret-checkbox {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }
        .add-btn {
          padding: 8px 16px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .variables-list {
          flex: 1;
          overflow-y: auto;
        }
        .list-header, .variable-row {
          display: flex;
          padding: 10px 12px;
          font-size: 12px;
        }
        .list-header {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 500;
          position: sticky;
          top: 0;
        }
        .variable-row { border-bottom: 1px solid var(--border-color); }
        .variable-row:hover { background: var(--bg-secondary); }
        .col-key {
          width: 250px;
          font-family: monospace;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .col-value { flex: 1; }
        .col-actions { width: 100px; text-align: right; }
        .secret-badge { font-size: 12px; }
        .value-text {
          font-family: monospace;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 2px;
        }
        .value-text:hover { background: var(--bg-primary); }
        .edit-input {
          width: 100%;
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--accent-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-family: monospace;
        }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          font-size: 12px;
          opacity: 0.6;
        }
        .action-btn:hover { opacity: 1; }
        .action-btn.delete:hover { color: #e74c3c; }
        .status-bar {
          display: flex;
          gap: 16px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          font-size: 11px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
