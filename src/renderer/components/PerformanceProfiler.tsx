import React, { useState, useEffect } from 'react';

interface ProfileData {
  id: string;
  name: string;
  duration: number;
  selfTime: number;
  callCount: number;
  children: ProfileData[];
}

interface MemorySnapshot {
  timestamp: Date;
  usedHeap: number;
  totalHeap: number;
  external: number;
}

interface PerformanceProfilerProps {
  onClose: () => void;
}

type ProfileTab = 'cpu' | 'memory' | 'network' | 'timeline';

function PerformanceProfiler({ onClose }: PerformanceProfilerProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('cpu');
  const [isRecording, setIsRecording] = useState(false);
  const [cpuProfile, setCpuProfile] = useState<ProfileData[]>([]);
  const [memorySnapshots, setMemorySnapshots] = useState<MemorySnapshot[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'selfTime' | 'totalTime' | 'callCount'>('selfTime');

  useEffect(() => {
    if (isRecording && activeTab === 'memory') {
      const interval = setInterval(() => {
        setMemorySnapshots(prev => [...prev, {
          timestamp: new Date(),
          usedHeap: Math.random() * 100 + 50,
          totalHeap: 150,
          external: Math.random() * 20
        }].slice(-30));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, activeTab]);

  const startRecording = () => {
    setIsRecording(true);
    setCpuProfile([]);
    setMemorySnapshots([]);
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Generate mock CPU profile data
    const mockProfile: ProfileData[] = [
      {
        id: 'root',
        name: '(root)',
        duration: 1000,
        selfTime: 50,
        callCount: 1,
        children: [
          {
            id: 'render',
            name: 'render',
            duration: 450,
            selfTime: 100,
            callCount: 15,
            children: [
              {
                id: 'reconcile',
                name: 'reconcileChildren',
                duration: 200,
                selfTime: 150,
                callCount: 30,
                children: []
              },
              {
                id: 'commit',
                name: 'commitWork',
                duration: 150,
                selfTime: 80,
                callCount: 15,
                children: []
              }
            ]
          },
          {
            id: 'event',
            name: 'handleEvent',
            duration: 300,
            selfTime: 50,
            callCount: 45,
            children: [
              {
                id: 'dispatch',
                name: 'dispatchAction',
                duration: 250,
                selfTime: 120,
                callCount: 45,
                children: []
              }
            ]
          },
          {
            id: 'fetch',
            name: 'fetchData',
            duration: 200,
            selfTime: 20,
            callCount: 5,
            children: [
              {
                id: 'parse',
                name: 'parseResponse',
                duration: 180,
                selfTime: 180,
                callCount: 5,
                children: []
              }
            ]
          }
        ]
      }
    ];

    setCpuProfile(mockProfile);
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortProfile = (nodes: ProfileData[]): ProfileData[] => {
    return [...nodes].sort((a, b) => {
      switch (sortBy) {
        case 'selfTime': return b.selfTime - a.selfTime;
        case 'totalTime': return b.duration - a.duration;
        case 'callCount': return b.callCount - a.callCount;
        default: return 0;
      }
    }).map(node => ({
      ...node,
      children: sortProfile(node.children)
    }));
  };

  const renderProfileNode = (node: ProfileData, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const percentage = node.duration / cpuProfile[0]?.duration * 100 || 0;

    return (
      <div key={node.id} className="profile-node-container">
        <div
          className="profile-node"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          )}
          <div className="node-bar" style={{ width: `${percentage}%` }} />
          <span className="node-name">{node.name}</span>
          <span className="node-stats">
            <span className="stat">{node.selfTime.toFixed(1)}ms self</span>
            <span className="stat">{node.duration.toFixed(1)}ms total</span>
            <span className="stat">{node.callCount} calls</span>
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="node-children">
            {sortProfile(node.children).map(child => renderProfileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderMemoryGraph = () => {
    const maxHeap = Math.max(...memorySnapshots.map(s => s.totalHeap), 100);

    return (
      <div className="memory-graph">
        <div className="graph-container">
          {memorySnapshots.map((snapshot, i) => (
            <div key={i} className="memory-bar-container">
              <div
                className="memory-bar used"
                style={{ height: `${(snapshot.usedHeap / maxHeap) * 100}%` }}
                title={`Used: ${snapshot.usedHeap.toFixed(1)} MB`}
              />
              <div
                className="memory-bar external"
                style={{
                  height: `${(snapshot.external / maxHeap) * 100}%`,
                  bottom: `${(snapshot.usedHeap / maxHeap) * 100}%`
                }}
                title={`External: ${snapshot.external.toFixed(1)} MB`}
              />
            </div>
          ))}
        </div>
        <div className="graph-labels">
          <span>{maxHeap.toFixed(0)} MB</span>
          <span>{(maxHeap / 2).toFixed(0)} MB</span>
          <span>0 MB</span>
        </div>
      </div>
    );
  };

  return (
    <div className="performance-profiler">
      <div className="profiler-header">
        <h3>⚡ Performance Profiler</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="profiler-toolbar">
        <div className="record-controls">
          {!isRecording ? (
            <button onClick={startRecording} className="record-btn">
              🔴 Start Recording
            </button>
          ) : (
            <button onClick={stopRecording} className="stop-btn">
              ⏹️ Stop Recording
            </button>
          )}
        </div>

        <div className="profiler-tabs">
          <button className={activeTab === 'cpu' ? 'active' : ''} onClick={() => setActiveTab('cpu')}>
            CPU
          </button>
          <button className={activeTab === 'memory' ? 'active' : ''} onClick={() => setActiveTab('memory')}>
            Memory
          </button>
          <button className={activeTab === 'timeline' ? 'active' : ''} onClick={() => setActiveTab('timeline')}>
            Timeline
          </button>
        </div>

        {activeTab === 'cpu' && cpuProfile.length > 0 && (
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="selfTime">Self Time</option>
              <option value="totalTime">Total Time</option>
              <option value="callCount">Call Count</option>
            </select>
          </div>
        )}
      </div>

      <div className="profiler-content">
        {activeTab === 'cpu' && (
          <div className="cpu-profile">
            {cpuProfile.length > 0 ? (
              <div className="profile-tree">
                {sortProfile(cpuProfile).map(node => renderProfileNode(node))}
              </div>
            ) : (
              <div className="empty-profile">
                <p>{isRecording ? 'Recording...' : 'Click "Start Recording" to profile CPU usage'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="memory-profile">
            <div className="memory-stats">
              {memorySnapshots.length > 0 && (
                <>
                  <div className="stat-card">
                    <span className="stat-label">Used Heap</span>
                    <span className="stat-value">
                      {memorySnapshots[memorySnapshots.length - 1]?.usedHeap.toFixed(1)} MB
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Total Heap</span>
                    <span className="stat-value">
                      {memorySnapshots[memorySnapshots.length - 1]?.totalHeap.toFixed(1)} MB
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">External</span>
                    <span className="stat-value">
                      {memorySnapshots[memorySnapshots.length - 1]?.external.toFixed(1)} MB
                    </span>
                  </div>
                </>
              )}
            </div>
            {memorySnapshots.length > 0 ? (
              renderMemoryGraph()
            ) : (
              <div className="empty-profile">
                <p>{isRecording ? 'Recording memory usage...' : 'Start recording to monitor memory'}</p>
              </div>
            )}
            <button className="gc-btn">🗑️ Force Garbage Collection</button>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="timeline-profile">
            <div className="timeline-legend">
              <span className="legend-item scripting">Scripting</span>
              <span className="legend-item rendering">Rendering</span>
              <span className="legend-item painting">Painting</span>
              <span className="legend-item loading">Loading</span>
            </div>
            <div className="timeline-empty">
              <p>Timeline view shows frame-by-frame breakdown</p>
              <p>Record a profile to see detailed timeline</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceProfiler;
