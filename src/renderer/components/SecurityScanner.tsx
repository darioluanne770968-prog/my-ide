import { useState } from 'react';

interface SecurityScannerProps {
  rootPath: string;
  onClose: () => void;
}

interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  package: string;
  version: string;
  fixedIn: string;
  description: string;
  cve?: string;
  filePath: string;
}

export default function SecurityScanner({ rootPath, onClose }: SecurityScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  const [vulnerabilities] = useState<Vulnerability[]>([
    { id: '1', severity: 'critical', title: 'Prototype Pollution', package: 'lodash', version: '4.17.15', fixedIn: '4.17.21', description: 'A prototype pollution vulnerability exists in lodash versions prior to 4.17.21.', cve: 'CVE-2021-23337', filePath: 'package.json' },
    { id: '2', severity: 'high', title: 'Regular Expression DoS', package: 'minimatch', version: '3.0.4', fixedIn: '3.0.5', description: 'Regular expression denial of service vulnerability.', cve: 'CVE-2022-3517', filePath: 'package-lock.json' },
    { id: '3', severity: 'medium', title: 'Cross-site Scripting', package: 'marked', version: '4.0.10', fixedIn: '4.0.12', description: 'XSS vulnerability in markdown parsing.', cve: 'CVE-2022-21681', filePath: 'package.json' },
    { id: '4', severity: 'low', title: 'Information Exposure', package: 'debug', version: '2.6.8', fixedIn: '2.6.9', description: 'Debug module may expose sensitive information.', filePath: 'package-lock.json' }
  ]);

  const [secretFindings] = useState([
    { type: 'API Key', file: 'src/config.ts', line: 15, preview: 'const API_KEY = "sk_live_xxx..."' },
    { type: 'Password', file: '.env.example', line: 3, preview: 'DB_PASSWORD=admin123' },
    { type: 'Private Key', file: 'keys/private.pem', line: 1, preview: '-----BEGIN RSA PRIVATE KEY-----' }
  ]);

  const startScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    setScanComplete(true);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: '#e74c3c',
      high: '#e67e22',
      medium: '#f1c40f',
      low: '#3498db'
    };
    return colors[severity] || '#95a5a6';
  };

  const getStats = () => ({
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    high: vulnerabilities.filter(v => v.severity === 'high').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium').length,
    low: vulnerabilities.filter(v => v.severity === 'low').length
  });

  const stats = getStats();

  return (
    <div className="security-scanner">
      <div className="scanner-header">
        <h3>Security Scanner</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="scanner-content">
        {!scanComplete && !isScanning && (
          <div className="start-section">
            <div className="scan-icon">🛡️</div>
            <h4>Security Vulnerability Scanner</h4>
            <p>Scan your project for known security vulnerabilities, exposed secrets, and security misconfigurations.</p>

            <div className="scan-options">
              <label className="option">
                <input type="checkbox" defaultChecked />
                Dependency vulnerabilities
              </label>
              <label className="option">
                <input type="checkbox" defaultChecked />
                Exposed secrets & credentials
              </label>
              <label className="option">
                <input type="checkbox" defaultChecked />
                Security misconfigurations
              </label>
              <label className="option">
                <input type="checkbox" />
                License compliance
              </label>
            </div>

            <button className="scan-btn" onClick={startScan}>
              Start Security Scan
            </button>
          </div>
        )}

        {isScanning && (
          <div className="scanning-section">
            <div className="spinner-large"></div>
            <h4>Scanning for vulnerabilities...</h4>
            <div className="progress-bar">
              <div className="progress-fill animated"></div>
            </div>
            <p className="scan-status">Analyzing dependencies and code...</p>
          </div>
        )}

        {scanComplete && (
          <>
            <div className="stats-section">
              <div className="stat-card critical">
                <span className="count">{stats.critical}</span>
                <span className="label">Critical</span>
              </div>
              <div className="stat-card high">
                <span className="count">{stats.high}</span>
                <span className="label">High</span>
              </div>
              <div className="stat-card medium">
                <span className="count">{stats.medium}</span>
                <span className="label">Medium</span>
              </div>
              <div className="stat-card low">
                <span className="count">{stats.low}</span>
                <span className="label">Low</span>
              </div>
            </div>

            <div className="results-section">
              <div className="results-tabs">
                <button className="tab active">Dependencies ({vulnerabilities.length})</button>
                <button className="tab">Secrets ({secretFindings.length})</button>
                <button className="tab">Code (0)</button>
              </div>

              <div className="vulnerabilities-list">
                {vulnerabilities.map(vuln => (
                  <div
                    key={vuln.id}
                    className={`vuln-item ${selectedVuln?.id === vuln.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVuln(vuln)}
                  >
                    <span
                      className="severity-badge"
                      style={{ background: getSeverityColor(vuln.severity) }}
                    >
                      {vuln.severity.toUpperCase()}
                    </span>
                    <div className="vuln-info">
                      <div className="vuln-title">{vuln.title}</div>
                      <div className="vuln-package">
                        {vuln.package}@{vuln.version}
                        {vuln.cve && <span className="cve">{vuln.cve}</span>}
                      </div>
                    </div>
                    <button className="fix-btn">Fix</button>
                  </div>
                ))}
              </div>
            </div>

            {selectedVuln && (
              <div className="vuln-details">
                <div className="details-header">
                  <h4>{selectedVuln.title}</h4>
                  <span
                    className="severity-badge"
                    style={{ background: getSeverityColor(selectedVuln.severity) }}
                  >
                    {selectedVuln.severity.toUpperCase()}
                  </span>
                </div>

                <div className="details-body">
                  <div className="detail-row">
                    <span className="label">Package:</span>
                    <span className="value">{selectedVuln.package}@{selectedVuln.version}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Fixed in:</span>
                    <span className="value fixed">{selectedVuln.fixedIn}</span>
                  </div>
                  {selectedVuln.cve && (
                    <div className="detail-row">
                      <span className="label">CVE:</span>
                      <span className="value">{selectedVuln.cve}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">File:</span>
                    <span className="value">{selectedVuln.filePath}</span>
                  </div>

                  <div className="description">
                    <h5>Description</h5>
                    <p>{selectedVuln.description}</p>
                  </div>

                  <div className="remediation">
                    <h5>Remediation</h5>
                    <code>npm update {selectedVuln.package}@{selectedVuln.fixedIn}</code>
                  </div>
                </div>
              </div>
            )}

            <div className="actions-bar">
              <button className="rescan-btn" onClick={startScan}>Rescan</button>
              <button className="export-btn">Export Report</button>
              <button className="fix-all-btn">Fix All</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .security-scanner {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .scanner-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .scanner-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .start-section {
          text-align: center;
          padding: 40px 20px;
        }
        .scan-icon { font-size: 64px; margin-bottom: 16px; }
        .start-section h4 { margin: 0 0 8px 0; }
        .start-section p { color: var(--text-secondary); margin-bottom: 24px; }
        .scan-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          max-width: 300px;
          margin: 0 auto 24px;
        }
        .option {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .scan-btn {
          padding: 12px 32px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .scanning-section {
          text-align: center;
          padding: 60px 20px;
        }
        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-color);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          margin: 0 auto 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .progress-bar {
          width: 300px;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          margin: 16px auto;
          overflow: hidden;
        }
        .progress-fill {
          width: 30%;
          height: 100%;
          background: var(--accent-color);
          border-radius: 4px;
        }
        .progress-fill.animated {
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .scan-status { color: var(--text-secondary); font-size: 13px; }
        .stats-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .stat-card {
          flex: 1;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card.critical { background: rgba(231, 76, 60, 0.2); }
        .stat-card.high { background: rgba(230, 126, 34, 0.2); }
        .stat-card.medium { background: rgba(241, 196, 15, 0.2); }
        .stat-card.low { background: rgba(52, 152, 219, 0.2); }
        .stat-card .count { display: block; font-size: 28px; font-weight: bold; }
        .stat-card .label { font-size: 12px; color: var(--text-secondary); }
        .results-section { margin-bottom: 16px; }
        .results-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 12px;
        }
        .tab {
          padding: 8px 16px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
        }
        .tab.active {
          color: var(--accent-color);
          border-bottom: 2px solid var(--accent-color);
        }
        .vulnerabilities-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .vuln-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          cursor: pointer;
        }
        .vuln-item:hover { border: 1px solid var(--border-color); }
        .vuln-item.selected { border: 1px solid var(--accent-color); }
        .severity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }
        .vuln-info { flex: 1; }
        .vuln-title { font-weight: 500; font-size: 13px; }
        .vuln-package { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
        .cve {
          margin-left: 8px;
          padding: 2px 6px;
          background: var(--bg-primary);
          border-radius: 3px;
          font-family: monospace;
        }
        .fix-btn {
          padding: 6px 12px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .vuln-details {
          margin-top: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .details-header h4 { margin: 0; }
        .details-body { font-size: 13px; }
        .detail-row {
          display: flex;
          padding: 4px 0;
        }
        .detail-row .label { width: 80px; color: var(--text-secondary); }
        .detail-row .value.fixed { color: #27ae60; font-weight: 500; }
        .description, .remediation { margin-top: 16px; }
        .description h5, .remediation h5 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .description p { margin: 0; line-height: 1.5; }
        .remediation code {
          display: block;
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }
        .actions-bar {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .rescan-btn, .export-btn {
          padding: 10px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
        }
        .fix-all-btn {
          padding: 10px 20px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}
