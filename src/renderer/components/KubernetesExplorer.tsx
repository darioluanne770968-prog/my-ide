import { useState } from 'react';

interface KubernetesExplorerProps {
  onClose: () => void;
}

interface K8sResource {
  kind: string;
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded' | 'Unknown';
  age: string;
  replicas?: string;
  ready?: string;
}

interface Cluster {
  name: string;
  context: string;
  status: 'connected' | 'disconnected';
}

export default function KubernetesExplorer({ onClose }: KubernetesExplorerProps) {
  const [clusters] = useState<Cluster[]>([
    { name: 'production', context: 'prod-cluster', status: 'connected' },
    { name: 'staging', context: 'staging-cluster', status: 'connected' },
    { name: 'development', context: 'dev-cluster', status: 'disconnected' }
  ]);

  const [selectedCluster, setSelectedCluster] = useState('production');
  const [selectedNamespace, setSelectedNamespace] = useState('default');
  const [selectedResourceType, setSelectedResourceType] = useState('pods');

  const [resources] = useState<K8sResource[]>([
    { kind: 'Pod', name: 'api-server-7d8f9c6b5-abc12', namespace: 'default', status: 'Running', age: '2d', ready: '1/1' },
    { kind: 'Pod', name: 'api-server-7d8f9c6b5-def34', namespace: 'default', status: 'Running', age: '2d', ready: '1/1' },
    { kind: 'Pod', name: 'worker-5c4d3b2a1-ghi56', namespace: 'default', status: 'Running', age: '1d', ready: '1/1' },
    { kind: 'Pod', name: 'database-0', namespace: 'default', status: 'Running', age: '5d', ready: '1/1' },
    { kind: 'Pod', name: 'cache-redis-0', namespace: 'default', status: 'Pending', age: '5m', ready: '0/1' }
  ]);

  const [deployments] = useState<K8sResource[]>([
    { kind: 'Deployment', name: 'api-server', namespace: 'default', status: 'Running', age: '30d', replicas: '2/2' },
    { kind: 'Deployment', name: 'worker', namespace: 'default', status: 'Running', age: '30d', replicas: '3/3' },
    { kind: 'Deployment', name: 'frontend', namespace: 'default', status: 'Running', age: '15d', replicas: '2/2' }
  ]);

  const namespaces = ['default', 'kube-system', 'monitoring', 'logging'];
  const resourceTypes = ['pods', 'deployments', 'services', 'configmaps', 'secrets', 'ingress'];

  const getStatusColor = (status: K8sResource['status']) => {
    const colors = {
      Running: '#27ae60',
      Pending: '#f39c12',
      Failed: '#e74c3c',
      Succeeded: '#3498db',
      Unknown: '#95a5a6'
    };
    return colors[status];
  };

  const getCurrentResources = () => {
    return selectedResourceType === 'pods' ? resources : deployments;
  };

  return (
    <div className="k8s-explorer">
      <div className="k8s-header">
        <h3>Kubernetes Explorer</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="k8s-content">
        <div className="sidebar">
          <div className="section">
            <div className="section-title">Clusters</div>
            {clusters.map(cluster => (
              <div
                key={cluster.name}
                className={`cluster-item ${selectedCluster === cluster.name ? 'selected' : ''}`}
                onClick={() => setSelectedCluster(cluster.name)}
              >
                <span className={`status-dot ${cluster.status}`}></span>
                <span className="cluster-name">{cluster.name}</span>
              </div>
            ))}
          </div>

          <div className="section">
            <div className="section-title">Namespace</div>
            <select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
            >
              {namespaces.map(ns => (
                <option key={ns} value={ns}>{ns}</option>
              ))}
            </select>
          </div>

          <div className="section">
            <div className="section-title">Resources</div>
            {resourceTypes.map(type => (
              <div
                key={type}
                className={`resource-type ${selectedResourceType === type ? 'selected' : ''}`}
                onClick={() => setSelectedResourceType(type)}
              >
                {type}
              </div>
            ))}
          </div>
        </div>

        <div className="main-panel">
          <div className="toolbar">
            <button className="refresh-btn">↻ Refresh</button>
            <button className="create-btn">+ Create</button>
            <input type="text" placeholder="Filter resources..." className="filter-input" />
          </div>

          <div className="resources-table">
            <div className="table-header">
              <span className="col-status">Status</span>
              <span className="col-name">Name</span>
              <span className="col-ready">{selectedResourceType === 'pods' ? 'Ready' : 'Replicas'}</span>
              <span className="col-age">Age</span>
              <span className="col-actions">Actions</span>
            </div>

            <div className="table-body">
              {getCurrentResources().map(resource => (
                <div key={resource.name} className="table-row">
                  <span className="col-status">
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(resource.status) }}
                    >
                      {resource.status}
                    </span>
                  </span>
                  <span className="col-name">{resource.name}</span>
                  <span className="col-ready">{resource.ready || resource.replicas}</span>
                  <span className="col-age">{resource.age}</span>
                  <span className="col-actions">
                    <button className="action-btn" title="View Logs">📋</button>
                    <button className="action-btn" title="Describe">📄</button>
                    <button className="action-btn" title="Edit">✏️</button>
                    <button className="action-btn delete" title="Delete">🗑️</button>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="details-panel">
            <div className="panel-tabs">
              <button className="tab active">Logs</button>
              <button className="tab">Events</button>
              <button className="tab">YAML</button>
            </div>
            <div className="panel-content">
              <pre className="logs">
{`[2024-01-20 10:30:15] INFO: Server started on port 8080
[2024-01-20 10:30:16] INFO: Connected to database
[2024-01-20 10:30:17] INFO: Health check passed
[2024-01-20 10:31:00] INFO: Received request GET /api/users
[2024-01-20 10:31:01] INFO: Request completed in 45ms`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .k8s-explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .k8s-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .k8s-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .k8s-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 200px;
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
        .cluster-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .cluster-item:hover, .cluster-item.selected {
          background: var(--bg-secondary);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.connected { background: #27ae60; }
        .status-dot.disconnected { background: #e74c3c; }
        .sidebar select {
          width: 100%;
          padding: 6px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .resource-type {
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          text-transform: capitalize;
        }
        .resource-type:hover, .resource-type.selected {
          background: var(--bg-secondary);
        }
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
        .refresh-btn, .create-btn {
          padding: 6px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
        .create-btn { background: var(--accent-color); color: white; border: none; }
        .filter-input {
          flex: 1;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .resources-table {
          flex: 1;
          overflow: auto;
        }
        .table-header, .table-row {
          display: flex;
          padding: 8px 12px;
          font-size: 12px;
        }
        .table-header {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 500;
          position: sticky;
          top: 0;
        }
        .table-row { border-bottom: 1px solid var(--border-color); }
        .table-row:hover { background: var(--bg-secondary); }
        .col-status { width: 80px; }
        .col-name { flex: 1; font-family: monospace; }
        .col-ready { width: 80px; text-align: center; }
        .col-age { width: 60px; }
        .col-actions { width: 120px; text-align: right; }
        .status-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          color: white;
        }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          font-size: 12px;
        }
        .action-btn.delete:hover { color: #e74c3c; }
        .details-panel {
          height: 200px;
          border-top: 1px solid var(--border-color);
        }
        .panel-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        .tab {
          padding: 8px 16px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
        }
        .tab.active {
          color: var(--accent-color);
          border-bottom: 2px solid var(--accent-color);
        }
        .panel-content {
          height: calc(100% - 35px);
          overflow: auto;
          padding: 12px;
        }
        .logs {
          margin: 0;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.6;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
