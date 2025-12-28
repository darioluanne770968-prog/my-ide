import { useState } from 'react';

interface BundleAnalyzerProps {
  rootPath: string;
  onClose: () => void;
}

interface BundleChunk {
  id: string;
  name: string;
  size: number;
  gzipSize: number;
  modules: BundleModule[];
  isEntry: boolean;
}

interface BundleModule {
  name: string;
  size: number;
  percentage: number;
}

export default function BundleAnalyzer({ rootPath, onClose }: BundleAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const [selectedChunk, setSelectedChunk] = useState<BundleChunk | null>(null);
  const [viewMode, setViewMode] = useState<'treemap' | 'list' | 'sunburst'>('treemap');

  const [chunks] = useState<BundleChunk[]>([
    {
      id: '1',
      name: 'main.js',
      size: 524288,
      gzipSize: 156000,
      isEntry: true,
      modules: [
        { name: 'react-dom', size: 131072, percentage: 25 },
        { name: 'react', size: 42000, percentage: 8 },
        { name: 'lodash', size: 71680, percentage: 13.7 },
        { name: 'axios', size: 15360, percentage: 2.9 },
        { name: 'src/components', size: 102400, percentage: 19.5 },
        { name: 'src/utils', size: 25600, percentage: 4.9 },
        { name: 'other', size: 136156, percentage: 26 }
      ]
    },
    {
      id: '2',
      name: 'vendor.js',
      size: 1048576,
      gzipSize: 312000,
      isEntry: false,
      modules: [
        { name: 'monaco-editor', size: 524288, percentage: 50 },
        { name: 'xterm', size: 262144, percentage: 25 },
        { name: 'electron', size: 157286, percentage: 15 },
        { name: 'other', size: 104858, percentage: 10 }
      ]
    },
    {
      id: '3',
      name: 'styles.css',
      size: 51200,
      gzipSize: 12800,
      isEntry: false,
      modules: [
        { name: 'reset.css', size: 5120, percentage: 10 },
        { name: 'components.css', size: 25600, percentage: 50 },
        { name: 'utilities.css', size: 10240, percentage: 20 },
        { name: 'themes.css', size: 10240, percentage: 20 }
      ]
    },
    {
      id: '4',
      name: 'lazy-chunk-1.js',
      size: 102400,
      gzipSize: 30720,
      isEntry: false,
      modules: [
        { name: 'src/features/settings', size: 51200, percentage: 50 },
        { name: 'src/features/preferences', size: 30720, percentage: 30 },
        { name: 'other', size: 20480, percentage: 20 }
      ]
    }
  ]);

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const totalSize = chunks.reduce((sum, c) => sum + c.size, 0);
  const totalGzip = chunks.reduce((sum, c) => sum + c.gzipSize, 0);

  const getChunkColor = (index: number) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    return colors[index % colors.length];
  };

  const getModuleColor = (index: number) => {
    const colors = ['#2980b9', '#c0392b', '#27ae60', '#d35400', '#8e44ad', '#16a085', '#2c3e50'];
    return colors[index % colors.length];
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setAnalyzed(true);
  };

  return (
    <div className="bundle-analyzer">
      <div className="analyzer-header">
        <h3>Bundle Analyzer</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="analyzer-content">
        {!analyzed && !isAnalyzing && (
          <div className="start-section">
            <div className="icon">📦</div>
            <h4>Bundle Size Analyzer</h4>
            <p>Analyze your bundle to identify large dependencies and optimization opportunities.</p>
            <button className="analyze-btn" onClick={runAnalysis}>
              Analyze Bundle
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="analyzing-section">
            <div className="spinner"></div>
            <h4>Analyzing bundle...</h4>
            <p>Building production bundle and analyzing size...</p>
          </div>
        )}

        {analyzed && (
          <>
            <div className="stats-bar">
              <div className="stat">
                <span className="label">Total Size</span>
                <span className="value">{formatSize(totalSize)}</span>
              </div>
              <div className="stat">
                <span className="label">Gzipped</span>
                <span className="value">{formatSize(totalGzip)}</span>
              </div>
              <div className="stat">
                <span className="label">Chunks</span>
                <span className="value">{chunks.length}</span>
              </div>
              <div className="stat">
                <span className="label">Compression</span>
                <span className="value">{((1 - totalGzip / totalSize) * 100).toFixed(1)}%</span>
              </div>

              <div className="view-modes">
                <button
                  className={`mode-btn ${viewMode === 'treemap' ? 'active' : ''}`}
                  onClick={() => setViewMode('treemap')}
                >
                  Treemap
                </button>
                <button
                  className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
                <button
                  className={`mode-btn ${viewMode === 'sunburst' ? 'active' : ''}`}
                  onClick={() => setViewMode('sunburst')}
                >
                  Sunburst
                </button>
              </div>
            </div>

            <div className="main-area">
              <div className="treemap-view">
                <div className="treemap-grid">
                  {chunks.map((chunk, i) => (
                    <div
                      key={chunk.id}
                      className={`chunk-box ${selectedChunk?.id === chunk.id ? 'selected' : ''}`}
                      style={{
                        flex: chunk.size / totalSize,
                        background: getChunkColor(i),
                        minWidth: '100px'
                      }}
                      onClick={() => setSelectedChunk(chunk)}
                    >
                      <div className="chunk-name">{chunk.name}</div>
                      <div className="chunk-size">{formatSize(chunk.size)}</div>
                      {chunk.isEntry && <span className="entry-badge">Entry</span>}
                    </div>
                  ))}
                </div>

                {selectedChunk && (
                  <div className="module-breakdown">
                    <h4>{selectedChunk.name} - Module Breakdown</h4>
                    <div className="modules-list">
                      {selectedChunk.modules.map((mod, i) => (
                        <div key={mod.name} className="module-item">
                          <div
                            className="module-bar"
                            style={{
                              width: `${mod.percentage}%`,
                              background: getModuleColor(i)
                            }}
                          ></div>
                          <div className="module-info">
                            <span className="module-name">{mod.name}</span>
                            <span className="module-size">
                              {formatSize(mod.size)} ({mod.percentage}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar">
                <div className="section">
                  <h4>Chunks</h4>
                  {chunks.map((chunk, i) => (
                    <div
                      key={chunk.id}
                      className={`chunk-item ${selectedChunk?.id === chunk.id ? 'selected' : ''}`}
                      onClick={() => setSelectedChunk(chunk)}
                    >
                      <span
                        className="color-dot"
                        style={{ background: getChunkColor(i) }}
                      ></span>
                      <div className="chunk-info">
                        <span className="name">{chunk.name}</span>
                        <span className="size">{formatSize(chunk.size)}</span>
                      </div>
                      <span className="gzip">{formatSize(chunk.gzipSize)}</span>
                    </div>
                  ))}
                </div>

                <div className="section">
                  <h4>Recommendations</h4>
                  <div className="recommendation">
                    <span className="icon">⚠️</span>
                    <span className="text">Consider code-splitting monaco-editor</span>
                  </div>
                  <div className="recommendation">
                    <span className="icon">💡</span>
                    <span className="text">lodash can be tree-shaken (-50KB)</span>
                  </div>
                  <div className="recommendation">
                    <span className="icon">📦</span>
                    <span className="text">Enable Brotli compression</span>
                  </div>
                </div>

                <div className="actions">
                  <button className="action-btn" onClick={runAnalysis}>Re-analyze</button>
                  <button className="action-btn">Export Report</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .bundle-analyzer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .analyzer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .analyzer-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .analyzer-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .start-section, .analyzing-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
        }
        .icon { font-size: 64px; margin-bottom: 16px; }
        .start-section h4 { margin: 0 0 8px 0; }
        .start-section p { color: var(--text-secondary); margin-bottom: 24px; }
        .analyze-btn {
          padding: 12px 32px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-color);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .stat .label { font-size: 11px; color: var(--text-tertiary); display: block; }
        .stat .value { font-size: 16px; font-weight: 600; }
        .view-modes {
          margin-left: auto;
          display: flex;
          gap: 4px;
        }
        .mode-btn {
          padding: 6px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
        }
        .mode-btn.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }
        .main-area {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .treemap-view {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }
        .treemap-grid {
          display: flex;
          gap: 4px;
          min-height: 120px;
        }
        .chunk-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .chunk-box:hover { opacity: 0.9; transform: scale(1.02); }
        .chunk-box.selected { outline: 2px solid white; }
        .chunk-name { font-size: 12px; font-weight: 500; color: white; }
        .chunk-size { font-size: 11px; color: rgba(255,255,255,0.8); }
        .entry-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          padding: 2px 6px;
          background: rgba(0,0,0,0.3);
          border-radius: 3px;
          font-size: 9px;
          color: white;
        }
        .module-breakdown {
          margin-top: 24px;
        }
        .module-breakdown h4 { margin: 0 0 16px 0; font-size: 13px; }
        .modules-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .module-item {
          position: relative;
          height: 32px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .module-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          opacity: 0.8;
        }
        .module-info {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          padding: 0 12px;
          font-size: 12px;
        }
        .module-name { font-weight: 500; }
        .module-size { color: var(--text-secondary); }
        .sidebar {
          width: 280px;
          border-left: 1px solid var(--border-color);
          overflow-y: auto;
          padding: 16px;
        }
        .section { margin-bottom: 24px; }
        .section h4 { margin: 0 0 12px 0; font-size: 12px; color: var(--text-secondary); }
        .chunk-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .chunk-item:hover { background: var(--bg-secondary); }
        .chunk-item.selected { background: rgba(52, 152, 219, 0.2); }
        .color-dot { width: 10px; height: 10px; border-radius: 50%; }
        .chunk-info { flex: 1; }
        .chunk-info .name { display: block; font-weight: 500; }
        .chunk-info .size { font-size: 10px; color: var(--text-tertiary); }
        .gzip { font-size: 10px; color: var(--text-secondary); }
        .recommendation {
          display: flex;
          gap: 8px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          margin-bottom: 8px;
          font-size: 11px;
        }
        .recommendation .icon { flex-shrink: 0; }
        .actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          flex: 1;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
