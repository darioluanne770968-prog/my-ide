import { useState, useEffect, useCallback } from 'react';

interface TimeTrackerProps {
  onClose: () => void;
}

interface TimeEntry {
  id: string;
  task: string;
  project: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  color: string;
  totalTime: number;
}

export default function TimeTracker({ onClose }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [currentProject, setCurrentProject] = useState('default');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [selectedView, setSelectedView] = useState<'today' | 'week' | 'month'>('today');

  const [projects] = useState<Project[]>([
    { id: 'default', name: 'Default', color: '#3498db', totalTime: 14400 },
    { id: 'frontend', name: 'Frontend', color: '#e74c3c', totalTime: 28800 },
    { id: 'backend', name: 'Backend', color: '#2ecc71', totalTime: 21600 },
    { id: 'devops', name: 'DevOps', color: '#9b59b6', totalTime: 7200 }
  ]);

  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: '1', task: 'Implement login feature', project: 'frontend', startTime: new Date(Date.now() - 7200000), endTime: new Date(Date.now() - 3600000), duration: 3600, tags: ['feature'] },
    { id: '2', task: 'Fix navigation bug', project: 'frontend', startTime: new Date(Date.now() - 10800000), endTime: new Date(Date.now() - 7200000), duration: 3600, tags: ['bug'] },
    { id: '3', task: 'API design review', project: 'backend', startTime: new Date(Date.now() - 14400000), endTime: new Date(Date.now() - 10800000), duration: 3600, tags: ['review'] },
    { id: '4', task: 'Database optimization', project: 'backend', startTime: new Date(Date.now() - 86400000), endTime: new Date(Date.now() - 82800000), duration: 3600, tags: ['optimization'] },
    { id: '5', task: 'CI/CD pipeline setup', project: 'devops', startTime: new Date(Date.now() - 172800000), endTime: new Date(Date.now() - 165600000), duration: 7200, tags: ['infrastructure'] }
  ]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedTime(0);
  }, []);

  const stopTracking = useCallback(() => {
    if (!startTime) return;

    const entry: TimeEntry = {
      id: Date.now().toString(),
      task: currentTask || 'Untitled Task',
      project: currentProject,
      startTime: startTime,
      endTime: new Date(),
      duration: elapsedTime,
      tags: []
    };

    setEntries(prev => [entry, ...prev]);
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentTask('');
  }, [startTime, currentTask, currentProject, elapsedTime]);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    return entries
      .filter(e => e.startTime.toDateString() === today)
      .reduce((sum, e) => sum + e.duration, 0) + (isTracking ? elapsedTime : 0);
  };

  const getProjectColor = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.color || '#95a5a6';
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown';
  };

  const todayEntries = entries.filter(e => e.startTime.toDateString() === new Date().toDateString());

  const weekData = [
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: 8.2 },
    { day: 'Wed', hours: 7.0 },
    { day: 'Thu', hours: 5.5 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 }
  ];

  const maxHours = Math.max(...weekData.map(d => d.hours), 8);

  return (
    <div className="time-tracker">
      <div className="tracker-header">
        <h3>Time Tracker</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="tracker-content">
        <div className="timer-section">
          <div className="timer-input">
            <input
              type="text"
              placeholder="What are you working on?"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              disabled={isTracking}
            />
            <select
              value={currentProject}
              onChange={(e) => setCurrentProject(e.target.value)}
              disabled={isTracking}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="timer-display">
            <span className="elapsed-time">{formatDuration(elapsedTime)}</span>
            {!isTracking ? (
              <button className="start-btn" onClick={startTracking}>
                ▶ Start
              </button>
            ) : (
              <button className="stop-btn" onClick={stopTracking}>
                ⏹ Stop
              </button>
            )}
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-label">Today</span>
            <span className="stat-value">{formatDuration(getTodayTotal())}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">This Week</span>
            <span className="stat-value">{formatDuration(weekData.reduce((s, d) => s + d.hours * 3600, 0))}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Entries Today</span>
            <span className="stat-value">{todayEntries.length}</span>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <span>Weekly Overview</span>
            <div className="view-tabs">
              <button
                className={selectedView === 'today' ? 'active' : ''}
                onClick={() => setSelectedView('today')}
              >
                Today
              </button>
              <button
                className={selectedView === 'week' ? 'active' : ''}
                onClick={() => setSelectedView('week')}
              >
                Week
              </button>
              <button
                className={selectedView === 'month' ? 'active' : ''}
                onClick={() => setSelectedView('month')}
              >
                Month
              </button>
            </div>
          </div>

          <div className="bar-chart">
            {weekData.map(d => (
              <div key={d.day} className="bar-container">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{ height: `${(d.hours / maxHours) * 100}%` }}
                  >
                    {d.hours > 0 && (
                      <span className="bar-value">{d.hours}h</span>
                    )}
                  </div>
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="entries-section">
          <div className="section-header">
            <span>Time Entries</span>
            <button className="add-btn">+ Manual Entry</button>
          </div>

          <div className="entries-list">
            {entries.slice(0, 10).map(entry => (
              <div key={entry.id} className="entry-item">
                <div
                  className="project-indicator"
                  style={{ background: getProjectColor(entry.project) }}
                ></div>
                <div className="entry-info">
                  <span className="entry-task">{entry.task}</span>
                  <span className="entry-project">{getProjectName(entry.project)}</span>
                </div>
                <div className="entry-time">
                  <span className="time-range">
                    {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'now'}
                  </span>
                  <span className="duration">{formatDuration(entry.duration)}</span>
                </div>
                <div className="entry-actions">
                  <button className="action-btn" title="Edit">✏️</button>
                  <button className="action-btn" title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="projects-section">
          <div className="section-header">
            <span>Projects</span>
          </div>
          <div className="projects-list">
            {projects.map(project => (
              <div key={project.id} className="project-item">
                <span
                  className="project-color"
                  style={{ background: project.color }}
                ></span>
                <span className="project-name">{project.name}</span>
                <span className="project-time">{formatDuration(project.totalTime)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .time-tracker {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .tracker-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .tracker-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .timer-section {
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .timer-input {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .timer-input input {
          flex: 1;
          padding: 10px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 13px;
        }
        .timer-input select {
          padding: 10px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .timer-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .elapsed-time {
          font-size: 32px;
          font-weight: 300;
          font-variant-numeric: tabular-nums;
        }
        .start-btn, .stop-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .start-btn { background: #27ae60; color: white; }
        .stop-btn { background: #e74c3c; color: white; }
        .stats-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .stat-card {
          flex: 1;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          text-align: center;
        }
        .stat-label { display: block; font-size: 11px; color: var(--text-tertiary); }
        .stat-value { display: block; font-size: 18px; font-weight: 600; margin-top: 4px; }
        .chart-section {
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 13px;
          font-weight: 500;
        }
        .view-tabs {
          display: flex;
          gap: 4px;
        }
        .view-tabs button {
          padding: 4px 12px;
          background: var(--bg-primary);
          border: none;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
        }
        .view-tabs button.active {
          background: var(--accent-color);
          color: white;
        }
        .bar-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 120px;
        }
        .bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .bar-wrapper {
          height: 100px;
          width: 24px;
          display: flex;
          align-items: flex-end;
        }
        .bar {
          width: 100%;
          background: var(--accent-color);
          border-radius: 4px 4px 0 0;
          position: relative;
          min-height: 2px;
        }
        .bar-value {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: var(--text-secondary);
        }
        .bar-label {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 8px;
        }
        .entries-section, .projects-section {
          margin-bottom: 16px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 500;
        }
        .add-btn {
          padding: 4px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .entries-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .entry-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }
        .project-indicator {
          width: 4px;
          height: 32px;
          border-radius: 2px;
        }
        .entry-info { flex: 1; }
        .entry-task { display: block; font-size: 13px; font-weight: 500; }
        .entry-project { font-size: 11px; color: var(--text-tertiary); }
        .entry-time { text-align: right; }
        .time-range { display: block; font-size: 11px; color: var(--text-secondary); }
        .duration { font-size: 13px; font-weight: 500; }
        .entry-actions { display: flex; gap: 4px; }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          font-size: 12px;
          opacity: 0.6;
        }
        .action-btn:hover { opacity: 1; }
        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .project-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          font-size: 13px;
        }
        .project-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .project-name { flex: 1; }
        .project-time { color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
