import { useState } from 'react';

interface CloudExplorerProps {
  onClose: () => void;
}

interface CloudResource {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'pending' | 'error';
  region: string;
  provider: 'aws' | 'gcp' | 'azure';
  details: Record<string, string>;
}

export default function CloudExplorer({ onClose }: CloudExplorerProps) {
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'gcp' | 'azure'>('aws');
  const [selectedCategory, setSelectedCategory] = useState('compute');

  const [resources] = useState<CloudResource[]>([
    { id: '1', name: 'web-server-1', type: 'EC2 Instance', status: 'running', region: 'us-east-1', provider: 'aws', details: { 'Instance Type': 't3.medium', 'IP': '54.123.45.67', 'vCPU': '2', 'Memory': '4 GB' }},
    { id: '2', name: 'web-server-2', type: 'EC2 Instance', status: 'running', region: 'us-east-1', provider: 'aws', details: { 'Instance Type': 't3.medium', 'IP': '54.123.45.68', 'vCPU': '2', 'Memory': '4 GB' }},
    { id: '3', name: 'api-server', type: 'EC2 Instance', status: 'stopped', region: 'us-west-2', provider: 'aws', details: { 'Instance Type': 't3.large', 'IP': '-', 'vCPU': '4', 'Memory': '8 GB' }},
    { id: '4', name: 'prod-db', type: 'RDS Instance', status: 'running', region: 'us-east-1', provider: 'aws', details: { 'Engine': 'PostgreSQL 14', 'Instance Class': 'db.r5.large', 'Storage': '100 GB' }},
    { id: '5', name: 'app-bucket', type: 'S3 Bucket', status: 'running', region: 'us-east-1', provider: 'aws', details: { 'Objects': '15,234', 'Size': '45.6 GB', 'Versioning': 'Enabled' }}
  ]);

  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);

  const providers = [
    { id: 'aws', name: 'AWS', icon: '☁️' },
    { id: 'gcp', name: 'Google Cloud', icon: '🌐' },
    { id: 'azure', name: 'Azure', icon: '💠' }
  ];

  const categories = [
    { id: 'compute', name: 'Compute', icon: '💻' },
    { id: 'storage', name: 'Storage', icon: '💾' },
    { id: 'database', name: 'Database', icon: '🗄️' },
    { id: 'network', name: 'Network', icon: '🌐' },
    { id: 'containers', name: 'Containers', icon: '📦' },
    { id: 'serverless', name: 'Serverless', icon: '⚡' }
  ];

  const getStatusColor = (status: CloudResource['status']) => {
    const colors = {
      running: '#27ae60',
      stopped: '#95a5a6',
      pending: '#f39c12',
      error: '#e74c3c'
    };
    return colors[status];
  };

  return (
    <div className="cloud-explorer">
      <div className="cloud-header">
        <h3>Cloud Explorer</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="cloud-content">
        <div className="sidebar">
          <div className="provider-tabs">
            {providers.map(p => (
              <button
                key={p.id}
                className={`provider-tab ${selectedProvider === p.id ? 'active' : ''}`}
                onClick={() => setSelectedProvider(p.id as 'aws' | 'gcp' | 'azure')}
              >
                <span className="icon">{p.icon}</span>
                <span className="name">{p.name}</span>
              </button>
            ))}
          </div>

          <div className="categories-list">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`category-item ${selectedCategory === cat.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="icon">{cat.icon}</span>
                <span className="name">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="quick-stats">
            <div className="stat">
              <span className="stat-value">12</span>
              <span className="stat-label">Resources</span>
            </div>
            <div className="stat">
              <span className="stat-value">3</span>
              <span className="stat-label">Regions</span>
            </div>
            <div className="stat">
              <span className="stat-value">$245</span>
              <span className="stat-label">Est. Cost/mo</span>
            </div>
          </div>
        </div>

        <div className="main-panel">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search resources..."
              className="search-input"
            />
            <select className="region-select">
              <option value="all">All Regions</option>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
            </select>
            <button className="refresh-btn">↻ Refresh</button>
          </div>

          <div className="resources-grid">
            {resources.map(resource => (
              <div
                key={resource.id}
                className={`resource-card ${selectedResource?.id === resource.id ? 'selected' : ''}`}
                onClick={() => setSelectedResource(resource)}
              >
                <div className="card-header">
                  <span
                    className="status-dot"
                    style={{ background: getStatusColor(resource.status) }}
                  />
                  <span className="resource-type">{resource.type}</span>
                </div>
                <div className="resource-name">{resource.name}</div>
                <div className="resource-region">{resource.region}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedResource && (
          <div className="details-panel">
            <div className="details-header">
              <h4>{selectedResource.name}</h4>
              <div className="detail-actions">
                <button className="start-btn">Start</button>
                <button className="stop-btn">Stop</button>
                <button className="more-btn">⋮</button>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <div className="section-title">Overview</div>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{selectedResource.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span
                    className="status-badge"
                    style={{ background: getStatusColor(selectedResource.status) }}
                  >
                    {selectedResource.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Region:</span>
                  <span className="value">{selectedResource.region}</span>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-title">Details</div>
                {Object.entries(selectedResource.details).map(([key, value]) => (
                  <div key={key} className="detail-row">
                    <span className="label">{key}:</span>
                    <span className="value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <div className="section-title">Metrics</div>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="metric-label">CPU</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '45%' }}></div>
                    </div>
                    <span className="metric-value">45%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Memory</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '72%' }}></div>
                    </div>
                    <span className="metric-value">72%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Disk</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: '28%' }}></div>
                    </div>
                    <span className="metric-value">28%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cloud-explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .cloud-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .cloud-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .cloud-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 200px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .provider-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        .provider-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 10px;
        }
        .provider-tab .icon { font-size: 20px; margin-bottom: 4px; }
        .provider-tab.active {
          background: var(--bg-secondary);
          color: var(--accent-color);
        }
        .categories-list {
          flex: 1;
          padding: 8px;
          overflow-y: auto;
        }
        .category-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .category-item:hover { background: var(--bg-secondary); }
        .category-item.selected { background: var(--bg-secondary); color: var(--accent-color); }
        .quick-stats {
          display: flex;
          border-top: 1px solid var(--border-color);
          padding: 12px;
        }
        .stat {
          flex: 1;
          text-align: center;
        }
        .stat-value { display: block; font-size: 16px; font-weight: 600; }
        .stat-label { font-size: 10px; color: var(--text-tertiary); }
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
        }
        .search-input {
          flex: 1;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .region-select {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .refresh-btn {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
        }
        .resources-grid {
          flex: 1;
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          overflow-y: auto;
          align-content: start;
        }
        .resource-card {
          padding: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .resource-card:hover { border-color: var(--accent-color); }
        .resource-card.selected { border-color: var(--accent-color); background: rgba(52, 152, 219, 0.1); }
        .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .resource-type { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; }
        .resource-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
        .resource-region { font-size: 11px; color: var(--text-secondary); }
        .details-panel {
          width: 280px;
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .details-header h4 { margin: 0; font-size: 13px; }
        .detail-actions { display: flex; gap: 4px; }
        .detail-actions button {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .start-btn { background: #27ae60; color: white; }
        .stop-btn { background: #e74c3c; color: white; }
        .more-btn { background: var(--bg-secondary); color: var(--text-primary); }
        .details-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        .detail-section { margin-bottom: 16px; }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          padding: 4px 0;
        }
        .detail-row .label { color: var(--text-secondary); }
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          color: white;
          text-transform: capitalize;
        }
        .metrics-grid { display: flex; flex-direction: column; gap: 12px; }
        .metric { display: flex; align-items: center; gap: 8px; }
        .metric-label { width: 50px; font-size: 11px; color: var(--text-secondary); }
        .metric-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
        }
        .metric-fill {
          height: 100%;
          background: var(--accent-color);
          border-radius: 3px;
        }
        .metric-value { width: 35px; font-size: 11px; text-align: right; }
      `}</style>
    </div>
  );
}
