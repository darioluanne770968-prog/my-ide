import { useState, useEffect, useRef } from 'react';

interface MemoryProfilerProps {
  onClose: () => void;
}

interface MemorySnapshot {
  id: string;
  timestamp: Date;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

interface AllocationSite {
  name: string;
  count: number;
  size: number;
  retained: number;
  type: 'Object' | 'Array' | 'String' | 'Function' | 'Closure';
}

export default function MemoryProfiler({ onClose }: MemoryProfilerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [snapshots, setSnapshots] = useState<MemorySnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<MemorySnapshot | null>(null);
  const [currentMemory, setCurrentMemory] = useState({ heapUsed: 45.2, heapTotal: 128, external: 12.5 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [allocations] = useState<AllocationSite[]>([
    { name: 'EditorModel', count: 245, size: 12582912, retained: 15728640, type: 'Object' },
    { name: 'SyntaxNode', count: 15234, size: 6094080, retained: 8388608, type: 'Object' },
    { name: 'TokenBuffer', count: 89, size: 4194304, retained: 4194304, type: 'Array' },
    { name: 'DocumentContent', count: 12, size: 2097152, retained: 3145728, type: 'String' },
    { name: 'EventListener', count: 1024, size: 1048576, retained: 2097152, type: 'Function' },
    { name: 'StateManager', count: 3, size: 524288, retained: 1048576, type: 'Object' },
    { name: 'CacheEntry', count: 512, size: 524288, retained: 786432, type: 'Object' },
    { name: 'Callback', count: 2048, size: 262144, retained: 524288, type: 'Closure' }
  ]);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const takeSnapshot = () => {
    const snapshot: MemorySnapshot = {
      id: Date.now().toString(),
      timestamp: new Date(),
      heapUsed: currentMemory.heapUsed * 1048576 + Math.random() * 5242880,
      heapTotal: currentMemory.heapTotal * 1048576,
      external: currentMemory.external * 1048576,
      arrayBuffers: Math.random() * 2097152
    };
    setSnapshots(prev => [...prev, snapshot]);
    setSelectedSnapshot(snapshot);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    takeSnapshot();
  };

  const forceGC = () => {
    setCurrentMemory(prev => ({
      ...prev,
      heapUsed: prev.heapUsed * 0.7
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw memory usage line
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const points = 50;
    for (let i = 0; i < points; i++) {
      const x = (width / points) * i;
      const usage = 0.3 + Math.sin(i * 0.2) * 0.1 + Math.random() * 0.05;
      const y = height - usage * height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
    ctx.fill();
  }, [currentMemory]);

  // Simulate memory changes
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setCurrentMemory(prev => ({
        heapUsed: prev.heapUsed + (Math.random() - 0.3) * 2,
        heapTotal: prev.heapTotal,
        external: prev.external + (Math.random() - 0.5) * 0.5
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const getTypeColor = (type: AllocationSite['type']) => {
    const colors = {
      Object: '#3498db',
      Array: '#2ecc71',
      String: '#e74c3c',
      Function: '#9b59b6',
      Closure: '#f39c12'
    };
    return colors[type];
  };

  return (
    <div className="memory-profiler">
      <div className="profiler-header">
        <h3>Memory Profiler</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="profiler-content">
        <div className="toolbar">
          <div className="memory-stats">
            <div className="stat">
              <span className="label">Heap Used</span>
              <span className="value">{currentMemory.heapUsed.toFixed(1)} MB</span>
            </div>
            <div className="stat">
              <span className="label">Heap Total</span>
              <span className="value">{currentMemory.heapTotal} MB</span>
            </div>
            <div className="stat">
              <span className="label">External</span>
              <span className="value">{currentMemory.external.toFixed(1)} MB</span>
            </div>
          </div>

          <div className="actions">
            {!isRecording ? (
              <button className="record-btn" onClick={startRecording}>
                ⏺ Start Recording
              </button>
            ) : (
              <button className="stop-btn" onClick={stopRecording}>
                ⏹ Stop Recording
              </button>
            )}
            <button className="snapshot-btn" onClick={takeSnapshot}>
              📷 Take Snapshot
            </button>
            <button className="gc-btn" onClick={forceGC}>
              🗑️ Force GC
            </button>
          </div>
        </div>

        <div className="main-area">
          <div className="chart-section">
            <div className="chart-header">
              <span>Memory Timeline</span>
              {isRecording && <span className="recording-badge">● Recording</span>}
            </div>
            <canvas ref={canvasRef} width={600} height={150} className="memory-chart" />
          </div>

          <div className="bottom-panels">
            <div className="snapshots-panel">
              <div className="panel-header">
                <span>Snapshots ({snapshots.length})</span>
              </div>
              <div className="snapshots-list">
                {snapshots.length === 0 ? (
                  <div className="empty">No snapshots taken yet</div>
                ) : (
                  snapshots.map((snapshot, i) => (
                    <div
                      key={snapshot.id}
                      className={`snapshot-item ${selectedSnapshot?.id === snapshot.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSnapshot(snapshot)}
                    >
                      <span className="snapshot-icon">📷</span>
                      <div className="snapshot-info">
                        <span className="snapshot-name">Snapshot {i + 1}</span>
                        <span className="snapshot-time">
                          {snapshot.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="snapshot-size">{formatBytes(snapshot.heapUsed)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="allocations-panel">
              <div className="panel-header">
                <span>Allocations by Constructor</span>
                <select className="sort-select">
                  <option value="size">Sort by Size</option>
                  <option value="count">Sort by Count</option>
                  <option value="retained">Sort by Retained</option>
                </select>
              </div>
              <div className="allocations-list">
                <div className="list-header">
                  <span className="col-name">Constructor</span>
                  <span className="col-count">Count</span>
                  <span className="col-size">Shallow Size</span>
                  <span className="col-retained">Retained Size</span>
                </div>
                {allocations.map(alloc => (
                  <div key={alloc.name} className="allocation-item">
                    <span className="col-name">
                      <span
                        className="type-dot"
                        style={{ background: getTypeColor(alloc.type) }}
                      ></span>
                      {alloc.name}
                    </span>
                    <span className="col-count">{alloc.count.toLocaleString()}</span>
                    <span className="col-size">{formatBytes(alloc.size)}</span>
                    <span className="col-retained">{formatBytes(alloc.retained)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .memory-profiler {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .profiler-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .profiler-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .profiler-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .memory-stats {
          display: flex;
          gap: 24px;
        }
        .stat .label {
          display: block;
          font-size: 10px;
          color: var(--text-tertiary);
        }
        .stat .value {
          font-size: 16px;
          font-weight: 600;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .actions button {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .record-btn {
          background: #e74c3c;
          color: white;
        }
        .stop-btn {
          background: #95a5a6;
          color: white;
        }
        .snapshot-btn {
          background: var(--accent-color);
          color: white;
        }
        .gc-btn {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color) !important;
        }
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chart-section {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 500;
        }
        .recording-badge {
          color: #e74c3c;
          font-size: 12px;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .memory-chart {
          width: 100%;
          border-radius: 4px;
        }
        .bottom-panels {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .snapshots-panel {
          width: 250px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-secondary);
          font-size: 12px;
          font-weight: 500;
        }
        .snapshots-list {
          flex: 1;
          overflow-y: auto;
        }
        .empty {
          padding: 24px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 12px;
        }
        .snapshot-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
        }
        .snapshot-item:hover { background: var(--bg-secondary); }
        .snapshot-item.selected { background: rgba(52, 152, 219, 0.2); }
        .snapshot-icon { font-size: 16px; }
        .snapshot-info { flex: 1; }
        .snapshot-name { display: block; font-size: 12px; font-weight: 500; }
        .snapshot-time { font-size: 10px; color: var(--text-tertiary); }
        .snapshot-size { font-size: 11px; color: var(--text-secondary); }
        .allocations-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .sort-select {
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 11px;
        }
        .allocations-list {
          flex: 1;
          overflow-y: auto;
        }
        .list-header, .allocation-item {
          display: flex;
          padding: 8px 12px;
          font-size: 12px;
        }
        .list-header {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 500;
          position: sticky;
          top: 0;
        }
        .allocation-item {
          border-bottom: 1px solid var(--border-color);
        }
        .allocation-item:hover { background: var(--bg-secondary); }
        .col-name { flex: 2; display: flex; align-items: center; gap: 6px; }
        .col-count { width: 80px; text-align: right; }
        .col-size { width: 100px; text-align: right; }
        .col-retained { width: 100px; text-align: right; }
        .type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
