import { useState, useEffect } from 'react';

export interface Extension {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  icon?: string;
  enabled: boolean;
  installed: boolean;
  category: string;
  downloads?: number;
  rating?: number;
  repository?: string;
}

interface ExtensionManagerProps {
  installedExtensions: Extension[];
  onInstall: (extensionId: string) => Promise<void>;
  onUninstall: (extensionId: string) => Promise<void>;
  onToggle: (extensionId: string, enabled: boolean) => void;
  onClose: () => void;
}

function ExtensionManager({
  installedExtensions,
  onInstall,
  onUninstall,
  onToggle,
  onClose
}: ExtensionManagerProps) {
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const [marketplaceExtensions, setMarketplaceExtensions] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Mock marketplace data
  useEffect(() => {
    if (activeTab === 'marketplace') {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setMarketplaceExtensions([
          {
            id: 'prettier',
            name: 'prettier',
            displayName: 'Prettier - Code formatter',
            description: 'Code formatter using prettier',
            version: '10.1.0',
            author: 'Prettier',
            enabled: false,
            installed: installedExtensions.some(e => e.id === 'prettier'),
            category: 'Formatters',
            downloads: 35000000,
            rating: 4.8
          },
          {
            id: 'eslint',
            name: 'eslint',
            displayName: 'ESLint',
            description: 'Integrates ESLint into VS Code',
            version: '2.4.4',
            author: 'Microsoft',
            enabled: false,
            installed: installedExtensions.some(e => e.id === 'eslint'),
            category: 'Linters',
            downloads: 28000000,
            rating: 4.7
          },
          {
            id: 'gitlens',
            name: 'gitlens',
            displayName: 'GitLens',
            description: 'Git supercharged',
            version: '14.5.0',
            author: 'GitKraken',
            enabled: false,
            installed: installedExtensions.some(e => e.id === 'gitlens'),
            category: 'Git',
            downloads: 20000000,
            rating: 4.9
          },
          {
            id: 'auto-rename-tag',
            name: 'auto-rename-tag',
            displayName: 'Auto Rename Tag',
            description: 'Auto rename paired HTML/XML tag',
            version: '0.1.10',
            author: 'Jun Han',
            enabled: false,
            installed: installedExtensions.some(e => e.id === 'auto-rename-tag'),
            category: 'Other',
            downloads: 15000000,
            rating: 4.5
          },
          {
            id: 'bracket-pair-colorizer',
            name: 'bracket-pair-colorizer',
            displayName: 'Bracket Pair Colorizer',
            description: 'Colorize matching brackets',
            version: '2.0.2',
            author: 'CoenraadS',
            enabled: false,
            installed: installedExtensions.some(e => e.id === 'bracket-pair-colorizer'),
            category: 'Other',
            downloads: 12000000,
            rating: 4.6
          }
        ]);
        setIsLoading(false);
      }, 500);
    }
  }, [activeTab, installedExtensions]);

  const displayExtensions = activeTab === 'installed' ? installedExtensions : marketplaceExtensions;

  const filteredExtensions = displayExtensions.filter(ext => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!ext.displayName.toLowerCase().includes(query) &&
          !ext.description.toLowerCase().includes(query) &&
          !ext.author.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (activeTab === 'installed') {
      if (filter === 'enabled' && !ext.enabled) return false;
      if (filter === 'disabled' && ext.enabled) return false;
    }
    return true;
  });

  const formatDownloads = (num?: number) => {
    if (!num) return '';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleInstall = async (ext: Extension) => {
    setIsLoading(true);
    try {
      await onInstall(ext.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstall = async (ext: Extension) => {
    if (!confirm(`Uninstall ${ext.displayName}?`)) return;
    setIsLoading(true);
    try {
      await onUninstall(ext.id);
      if (selectedExtension?.id === ext.id) {
        setSelectedExtension(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="extension-manager">
      <div className="extension-manager-header">
        <h3>Extensions</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="extension-tabs">
        <button
          className={activeTab === 'installed' ? 'active' : ''}
          onClick={() => setActiveTab('installed')}
        >
          Installed ({installedExtensions.length})
        </button>
        <button
          className={activeTab === 'marketplace' ? 'active' : ''}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
      </div>

      <div className="extension-toolbar">
        <input
          type="text"
          placeholder="Search extensions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="extension-search"
        />
        {activeTab === 'installed' && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="extension-filter"
          >
            <option value="all">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        )}
      </div>

      <div className="extension-content">
        <div className="extension-list">
          {isLoading ? (
            <div className="extension-loading">Loading...</div>
          ) : filteredExtensions.length === 0 ? (
            <div className="extension-empty">
              {searchQuery ? 'No matching extensions' : 'No extensions'}
            </div>
          ) : (
            filteredExtensions.map(ext => (
              <div
                key={ext.id}
                className={`extension-item ${selectedExtension?.id === ext.id ? 'selected' : ''}`}
                onClick={() => setSelectedExtension(ext)}
              >
                <div className="extension-icon">
                  {ext.icon ? <img src={ext.icon} alt="" /> : '📦'}
                </div>
                <div className="extension-info">
                  <div className="extension-title">
                    <span className="extension-name">{ext.displayName}</span>
                    <span className="extension-version">v{ext.version}</span>
                  </div>
                  <div className="extension-description">{ext.description}</div>
                  <div className="extension-meta">
                    <span className="extension-author">{ext.author}</span>
                    {ext.downloads && (
                      <span className="extension-downloads">⬇ {formatDownloads(ext.downloads)}</span>
                    )}
                    {ext.rating && (
                      <span className="extension-rating">★ {ext.rating}</span>
                    )}
                  </div>
                </div>
                <div className="extension-actions">
                  {ext.installed ? (
                    <>
                      <label className="extension-toggle">
                        <input
                          type="checkbox"
                          checked={ext.enabled}
                          onChange={(e) => onToggle(ext.id, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleInstall(ext); }}
                      className="install-btn"
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedExtension && (
          <div className="extension-details">
            <div className="extension-details-header">
              <div className="extension-details-icon">
                {selectedExtension.icon ? <img src={selectedExtension.icon} alt="" /> : '📦'}
              </div>
              <div className="extension-details-title">
                <h4>{selectedExtension.displayName}</h4>
                <span className="extension-details-author">by {selectedExtension.author}</span>
              </div>
            </div>

            <div className="extension-details-meta">
              <span>Version: {selectedExtension.version}</span>
              <span>Category: {selectedExtension.category}</span>
              {selectedExtension.repository && (
                <a href={selectedExtension.repository} target="_blank" rel="noopener noreferrer">
                  Repository
                </a>
              )}
            </div>

            <div className="extension-details-description">
              <h5>Description</h5>
              <p>{selectedExtension.description}</p>
            </div>

            <div className="extension-details-actions">
              {selectedExtension.installed ? (
                <>
                  <button
                    onClick={() => onToggle(selectedExtension.id, !selectedExtension.enabled)}
                    className={selectedExtension.enabled ? 'disable-btn' : 'enable-btn'}
                  >
                    {selectedExtension.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleUninstall(selectedExtension)}
                    className="uninstall-btn"
                  >
                    Uninstall
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleInstall(selectedExtension)}
                  className="install-btn"
                >
                  Install
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExtensionManager;
