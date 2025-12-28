import { useState, useRef, useEffect } from 'react';

interface DependencyGraphProps {
  rootPath: string;
  onClose: () => void;
}

interface DependencyNode {
  id: string;
  name: string;
  version: string;
  type: 'direct' | 'transitive' | 'dev' | 'peer';
  dependencies: string[];
  size: number;
  x?: number;
  y?: number;
}

export default function DependencyGraph({ rootPath, onClose }: DependencyGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'force' | 'circular'>('tree');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'dev'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [nodes] = useState<DependencyNode[]>([
    { id: '1', name: 'react', version: '18.2.0', type: 'direct', dependencies: ['2', '3'], size: 128 },
    { id: '2', name: 'react-dom', version: '18.2.0', type: 'direct', dependencies: ['1', '4'], size: 1024 },
    { id: '3', name: 'scheduler', version: '0.23.0', type: 'transitive', dependencies: [], size: 32 },
    { id: '4', name: 'loose-envify', version: '1.4.0', type: 'transitive', dependencies: ['5'], size: 8 },
    { id: '5', name: 'js-tokens', version: '4.0.0', type: 'transitive', dependencies: [], size: 12 },
    { id: '6', name: 'typescript', version: '5.3.3', type: 'dev', dependencies: [], size: 8192 },
    { id: '7', name: 'vite', version: '5.0.10', type: 'dev', dependencies: ['8', '9'], size: 2048 },
    { id: '8', name: 'esbuild', version: '0.19.11', type: 'transitive', dependencies: [], size: 4096 },
    { id: '9', name: 'rollup', version: '4.9.2', type: 'transitive', dependencies: [], size: 2048 },
    { id: '10', name: 'electron', version: '28.1.0', type: 'direct', dependencies: [], size: 65536 },
    { id: '11', name: 'lodash', version: '4.17.21', type: 'direct', dependencies: [], size: 512 },
    { id: '12', name: 'axios', version: '1.6.2', type: 'direct', dependencies: ['13'], size: 64 },
    { id: '13', name: 'follow-redirects', version: '1.15.4', type: 'transitive', dependencies: [], size: 24 }
  ]);

  const filteredNodes = nodes.filter(node => {
    if (filterType === 'direct' && node.type !== 'direct') return false;
    if (filterType === 'dev' && node.type !== 'dev') return false;
    if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getTypeColor = (type: DependencyNode['type']) => {
    const colors = {
      direct: '#3498db',
      transitive: '#95a5a6',
      dev: '#9b59b6',
      peer: '#e67e22'
    };
    return colors[type];
  };

  const formatSize = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  const totalSize = nodes.reduce((sum, n) => sum + n.size, 0);
  const directCount = nodes.filter(n => n.type === 'direct').length;
  const devCount = nodes.filter(n => n.type === 'dev').length;
  const transitiveCount = nodes.filter(n => n.type === 'transitive').length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Simple visualization
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const centerX = width / 2;
    const centerY = height / 2;

    filteredNodes.forEach((node, i) => {
      const angle = (i / filteredNodes.length) * Math.PI * 2;
      const radius = 120 + (node.type === 'direct' ? 0 : 60);
      nodePositions[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    // Draw edges
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    filteredNodes.forEach(node => {
      const from = nodePositions[node.id];
      if (!from) return;
      node.dependencies.forEach(depId => {
        const to = nodePositions[depId];
        if (!to) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;

      const size = Math.max(8, Math.min(30, Math.sqrt(node.size) / 2));

      ctx.fillStyle = getTypeColor(node.type);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();

      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, pos.x, pos.y + size + 12);
    });
  }, [filteredNodes, selectedNode, viewMode]);

  return (
    <div className="dependency-graph">
      <div className="graph-header">
        <h3>Dependency Graph</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="graph-content">
        <div className="sidebar">
          <div className="stats-section">
            <div className="stat">
              <span className="stat-value">{nodes.length}</span>
              <span className="stat-label">Total Packages</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatSize(totalSize)}</span>
              <span className="stat-label">Total Size</span>
            </div>
          </div>

          <div className="breakdown">
            <div className="breakdown-item">
              <span className="dot direct"></span>
              <span className="name">Direct</span>
              <span className="count">{directCount}</span>
            </div>
            <div className="breakdown-item">
              <span className="dot dev"></span>
              <span className="name">Dev</span>
              <span className="count">{devCount}</span>
            </div>
            <div className="breakdown-item">
              <span className="dot transitive"></span>
              <span className="name">Transitive</span>
              <span className="count">{transitiveCount}</span>
            </div>
          </div>

          <div className="controls">
            <div className="control-group">
              <label>View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'tree' | 'force' | 'circular')}
              >
                <option value="tree">Tree</option>
                <option value="force">Force</option>
                <option value="circular">Circular</option>
              </select>
            </div>

            <div className="control-group">
              <label>Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'direct' | 'dev')}
              >
                <option value="all">All</option>
                <option value="direct">Direct Only</option>
                <option value="dev">Dev Only</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="package-list">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                className={`package-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
                onClick={() => setSelectedNode(node)}
              >
                <span className="dot" style={{ background: getTypeColor(node.type) }}></span>
                <div className="package-info">
                  <span className="package-name">{node.name}</span>
                  <span className="package-version">{node.version}</span>
                </div>
                <span className="package-size">{formatSize(node.size)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="main-panel">
          <div className="toolbar">
            <button className="tool-btn">Zoom In</button>
            <button className="tool-btn">Zoom Out</button>
            <button className="tool-btn">Reset</button>
            <button className="tool-btn">Export SVG</button>
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="graph-canvas"
          />

          {selectedNode && (
            <div className="node-details">
              <h4>{selectedNode.name}@{selectedNode.version}</h4>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value" style={{ color: getTypeColor(selectedNode.type) }}>
                  {selectedNode.type}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Size:</span>
                <span className="value">{formatSize(selectedNode.size)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Dependencies:</span>
                <span className="value">{selectedNode.dependencies.length}</span>
              </div>
              <div className="actions">
                <button className="update-btn">Update</button>
                <button className="remove-btn">Remove</button>
                <button className="info-btn">npm info</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dependency-graph {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .graph-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .graph-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 250px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .stats-section {
          display: flex;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .stat {
          flex: 1;
          text-align: center;
        }
        .stat-value { display: block; font-size: 20px; font-weight: 600; }
        .stat-label { font-size: 10px; color: var(--text-tertiary); }
        .breakdown {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          font-size: 12px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot.direct { background: #3498db; }
        .dot.dev { background: #9b59b6; }
        .dot.transitive { background: #95a5a6; }
        .breakdown-item .name { flex: 1; }
        .breakdown-item .count { color: var(--text-secondary); }
        .controls {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .control-group {
          margin-bottom: 8px;
        }
        .control-group label {
          display: block;
          font-size: 11px;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }
        .control-group select {
          width: 100%;
          padding: 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .search-input {
          margin: 12px;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .package-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 12px;
        }
        .package-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .package-item:hover { background: var(--bg-secondary); }
        .package-item.selected { background: rgba(52, 152, 219, 0.2); }
        .package-info { flex: 1; }
        .package-name { display: block; font-weight: 500; }
        .package-version { font-size: 10px; color: var(--text-tertiary); }
        .package-size { font-size: 10px; color: var(--text-secondary); }
        .main-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .toolbar {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .tool-btn {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
        .graph-canvas {
          flex: 1;
          width: 100%;
          height: 100%;
        }
        .node-details {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        .node-details h4 { margin: 0 0 12px 0; font-size: 14px; }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .detail-row .label { color: var(--text-secondary); }
        .actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .update-btn { background: #3498db; color: white; }
        .remove-btn { background: #e74c3c; color: white; }
        .info-btn { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); }
      `}</style>
    </div>
  );
}
