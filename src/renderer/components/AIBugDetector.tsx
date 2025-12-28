import { useState } from 'react';

interface AIBugDetectorProps {
  code: string;
  fileName: string;
  language: string;
  apiKey: string;
  model: string;
  onApplyFix: (fixedCode: string) => void;
  onClose: () => void;
}

interface Bug {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  line: number;
  column: number;
  message: string;
  explanation: string;
  suggestedFix: string;
  fixedCode?: string;
}

export default function AIBugDetector({
  code,
  fileName,
  language,
  apiKey,
  model,
  onApplyFix,
  onClose
}: AIBugDetectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [scanComplete, setScanComplete] = useState(false);

  const severityColors = {
    critical: '#e74c3c',
    high: '#e67e22',
    medium: '#f1c40f',
    low: '#3498db'
  };

  const scanForBugs = async () => {
    if (!apiKey) {
      setBugs([{
        id: 'error',
        severity: 'high',
        type: 'Configuration',
        line: 0,
        column: 0,
        message: 'API key not configured',
        explanation: 'Please configure your AI API key in settings.',
        suggestedFix: 'Go to Settings > AI Configuration'
      }]);
      return;
    }

    setIsScanning(true);
    setScanComplete(false);

    // Simulate AI bug detection
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockBugs: Bug[] = [
      {
        id: '1',
        severity: 'critical',
        type: 'Security',
        line: 15,
        column: 8,
        message: 'Potential SQL injection vulnerability',
        explanation: 'User input is being directly concatenated into a SQL query string. This allows attackers to inject malicious SQL code.',
        suggestedFix: 'Use parameterized queries or prepared statements instead of string concatenation.',
        fixedCode: '// Use parameterized query\nconst result = await db.query("SELECT * FROM users WHERE id = ?", [userId]);'
      },
      {
        id: '2',
        severity: 'high',
        type: 'Memory Leak',
        line: 42,
        column: 4,
        message: 'Event listener not cleaned up',
        explanation: 'An event listener is added but never removed, causing memory leaks over time.',
        suggestedFix: 'Add cleanup logic to remove the event listener when the component unmounts.',
        fixedCode: 'useEffect(() => {\n  window.addEventListener("resize", handleResize);\n  return () => window.removeEventListener("resize", handleResize);\n}, []);'
      },
      {
        id: '3',
        severity: 'medium',
        type: 'Race Condition',
        line: 67,
        column: 12,
        message: 'Potential race condition in async operation',
        explanation: 'Multiple async operations may complete in unexpected order, causing inconsistent state.',
        suggestedFix: 'Use proper async/await patterns or implement request cancellation.',
        fixedCode: 'const controller = new AbortController();\nconst response = await fetch(url, { signal: controller.signal });'
      },
      {
        id: '4',
        severity: 'medium',
        type: 'Null Reference',
        line: 89,
        column: 20,
        message: 'Possible null/undefined reference',
        explanation: 'This variable could be null or undefined at runtime, causing a TypeError.',
        suggestedFix: 'Add null check or use optional chaining.',
        fixedCode: 'const value = data?.property ?? defaultValue;'
      },
      {
        id: '5',
        severity: 'low',
        type: 'Performance',
        line: 112,
        column: 6,
        message: 'Inefficient loop operation',
        explanation: 'Array.find() is called inside a loop, resulting in O(n²) complexity.',
        suggestedFix: 'Convert array to a Map or Set for O(1) lookups.',
        fixedCode: 'const itemMap = new Map(items.map(item => [item.id, item]));\nresults.forEach(r => {\n  const item = itemMap.get(r.id);\n});'
      }
    ];

    setBugs(mockBugs);
    setIsScanning(false);
    setScanComplete(true);
  };

  const applyFix = (bug: Bug) => {
    if (bug.fixedCode) {
      const lines = code.split('\n');
      // In real implementation, this would properly replace the buggy code
      onApplyFix(code);
    }
  };

  const getBugStats = () => {
    return {
      critical: bugs.filter(b => b.severity === 'critical').length,
      high: bugs.filter(b => b.severity === 'high').length,
      medium: bugs.filter(b => b.severity === 'medium').length,
      low: bugs.filter(b => b.severity === 'low').length
    };
  };

  const stats = getBugStats();

  return (
    <div className="ai-bug-detector">
      <div className="detector-header">
        <h3>AI Bug Detector</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="detector-content">
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          <span className="language-badge">{language}</span>
        </div>

        <div className="scan-section">
          <button
            className="scan-btn"
            onClick={scanForBugs}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <span className="spinner"></span>
                Scanning for bugs...
              </>
            ) : (
              'Scan for Bugs'
            )}
          </button>
        </div>

        {scanComplete && (
          <div className="stats-section">
            <div className="stat-item critical">
              <span className="stat-count">{stats.critical}</span>
              <span className="stat-label">Critical</span>
            </div>
            <div className="stat-item high">
              <span className="stat-count">{stats.high}</span>
              <span className="stat-label">High</span>
            </div>
            <div className="stat-item medium">
              <span className="stat-count">{stats.medium}</span>
              <span className="stat-label">Medium</span>
            </div>
            <div className="stat-item low">
              <span className="stat-count">{stats.low}</span>
              <span className="stat-label">Low</span>
            </div>
          </div>
        )}

        <div className="bugs-container">
          <div className="bugs-list">
            {bugs.map(bug => (
              <div
                key={bug.id}
                className={`bug-item ${selectedBug?.id === bug.id ? 'selected' : ''}`}
                onClick={() => setSelectedBug(bug)}
              >
                <div
                  className="severity-indicator"
                  style={{ background: severityColors[bug.severity] }}
                />
                <div className="bug-info">
                  <div className="bug-type">{bug.type}</div>
                  <div className="bug-message">{bug.message}</div>
                  <div className="bug-location">Line {bug.line}, Column {bug.column}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedBug && (
            <div className="bug-detail">
              <div className="detail-header">
                <span
                  className="severity-badge"
                  style={{ background: severityColors[selectedBug.severity] }}
                >
                  {selectedBug.severity.toUpperCase()}
                </span>
                <span className="bug-type-detail">{selectedBug.type}</span>
              </div>

              <div className="detail-section">
                <h4>Issue</h4>
                <p>{selectedBug.message}</p>
              </div>

              <div className="detail-section">
                <h4>Explanation</h4>
                <p>{selectedBug.explanation}</p>
              </div>

              <div className="detail-section">
                <h4>Suggested Fix</h4>
                <p>{selectedBug.suggestedFix}</p>
              </div>

              {selectedBug.fixedCode && (
                <div className="detail-section">
                  <h4>Fixed Code</h4>
                  <pre className="fixed-code">
                    <code>{selectedBug.fixedCode}</code>
                  </pre>
                  <button
                    className="apply-fix-btn"
                    onClick={() => applyFix(selectedBug)}
                  >
                    Apply Fix
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ai-bug-detector {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .detector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .detector-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .detector-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .file-name { font-weight: 500; }
        .language-badge {
          background: var(--accent-color);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        .scan-section { margin-bottom: 16px; }
        .scan-btn {
          width: 100%;
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .scan-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stats-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .stat-item {
          flex: 1;
          padding: 12px;
          border-radius: 4px;
          text-align: center;
        }
        .stat-item.critical { background: rgba(231, 76, 60, 0.2); }
        .stat-item.high { background: rgba(230, 126, 34, 0.2); }
        .stat-item.medium { background: rgba(241, 196, 15, 0.2); }
        .stat-item.low { background: rgba(52, 152, 219, 0.2); }
        .stat-count { display: block; font-size: 24px; font-weight: bold; }
        .stat-label { font-size: 11px; color: var(--text-secondary); }
        .bugs-container {
          flex: 1;
          display: flex;
          gap: 16px;
          overflow: hidden;
        }
        .bugs-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bug-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .bug-item:hover { border-color: var(--border-color); }
        .bug-item.selected { border-color: var(--accent-color); }
        .severity-indicator {
          width: 4px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .bug-info { flex: 1; min-width: 0; }
        .bug-type { font-weight: 500; font-size: 13px; }
        .bug-message {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bug-location { font-size: 11px; color: var(--text-tertiary); }
        .bug-detail {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .severity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: white;
        }
        .bug-type-detail { font-weight: 500; }
        .detail-section { margin-bottom: 16px; }
        .detail-section h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .detail-section p { margin: 0; font-size: 13px; line-height: 1.5; }
        .fixed-code {
          background: var(--bg-primary);
          padding: 12px;
          border-radius: 4px;
          font-size: 12px;
          overflow-x: auto;
          margin-bottom: 12px;
        }
        .apply-fix-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
