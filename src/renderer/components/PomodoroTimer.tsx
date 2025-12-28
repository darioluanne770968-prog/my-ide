import { useState, useEffect, useCallback } from 'react';

interface PomodoroTimerProps {
  onClose: () => void;
}

interface PomodoroSession {
  id: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: Date;
  task?: string;
}

export default function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true
  });

  const [sessions, setSessions] = useState<PomodoroSession[]>([
    { id: '1', type: 'work', duration: 25, completedAt: new Date(Date.now() - 3600000), task: 'Fix authentication bug' },
    { id: '2', type: 'work', duration: 25, completedAt: new Date(Date.now() - 5400000), task: 'Code review' },
    { id: '3', type: 'work', duration: 25, completedAt: new Date(Date.now() - 7200000), task: 'Write unit tests' }
  ]);

  const durations = {
    work: settings.workDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = useCallback((newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  }, [durations]);

  const completeSession = useCallback(() => {
    const session: PomodoroSession = {
      id: Date.now().toString(),
      type: mode,
      duration: settings.workDuration,
      completedAt: new Date(),
      task: currentTask || undefined
    };
    setSessions(prev => [session, ...prev]);

    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      if (newCount % settings.longBreakInterval === 0) {
        switchMode('longBreak');
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        switchMode('shortBreak');
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      switchMode('work');
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  }, [mode, completedPomodoros, currentTask, settings, switchMode]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, completeSession]);

  const progress = 1 - timeLeft / durations[mode];
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const getModeColor = (m: string) => {
    if (m === 'work') return '#e74c3c';
    if (m === 'shortBreak') return '#27ae60';
    return '#3498db';
  };

  const todaysSessions = sessions.filter(s => {
    const today = new Date();
    return s.completedAt.toDateString() === today.toDateString() && s.type === 'work';
  });

  return (
    <div className="pomodoro-timer">
      <div className="timer-header">
        <h3>Pomodoro Timer</h3>
        <div className="header-actions">
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="timer-content">
        {showSettings ? (
          <div className="settings-panel">
            <h4>Settings</h4>

            <div className="setting-group">
              <label>Work Duration (minutes)</label>
              <input
                type="number"
                value={settings.workDuration}
                onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
              />
            </div>

            <div className="setting-group">
              <label>Short Break (minutes)</label>
              <input
                type="number"
                value={settings.shortBreakDuration}
                onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 5 })}
              />
            </div>

            <div className="setting-group">
              <label>Long Break (minutes)</label>
              <input
                type="number"
                value={settings.longBreakDuration}
                onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
              />
            </div>

            <div className="setting-group">
              <label>Long Break Interval</label>
              <input
                type="number"
                value={settings.longBreakInterval}
                onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}
              />
            </div>

            <div className="setting-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                />
                Auto-start Breaks
              </label>
            </div>

            <div className="setting-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoStartPomodoros}
                  onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                />
                Auto-start Pomodoros
              </label>
            </div>

            <div className="setting-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                />
                Sound Notifications
              </label>
            </div>

            <button className="save-btn" onClick={() => {
              setShowSettings(false);
              resetTimer();
            }}>
              Save & Apply
            </button>
          </div>
        ) : (
          <>
            <div className="mode-tabs">
              <button
                className={`mode-tab ${mode === 'work' ? 'active' : ''}`}
                onClick={() => switchMode('work')}
              >
                Pomodoro
              </button>
              <button
                className={`mode-tab ${mode === 'shortBreak' ? 'active' : ''}`}
                onClick={() => switchMode('shortBreak')}
              >
                Short Break
              </button>
              <button
                className={`mode-tab ${mode === 'longBreak' ? 'active' : ''}`}
                onClick={() => switchMode('longBreak')}
              >
                Long Break
              </button>
            </div>

            <div className="timer-display">
              <svg className="progress-ring" viewBox="0 0 260 260">
                <circle
                  className="progress-bg"
                  cx="130"
                  cy="130"
                  r="120"
                  fill="none"
                  strokeWidth="8"
                />
                <circle
                  className="progress-bar"
                  cx="130"
                  cy="130"
                  r="120"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ stroke: getModeColor(mode) }}
                />
              </svg>
              <div className="time-text">
                <span className="time">{formatTime(timeLeft)}</span>
                <span className="mode-label">
                  {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </span>
              </div>
            </div>

            <div className="task-input">
              <input
                type="text"
                placeholder="What are you working on?"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
              />
            </div>

            <div className="controls">
              {!isRunning ? (
                <button className="start-btn" onClick={startTimer}>
                  ▶ Start
                </button>
              ) : (
                <button className="pause-btn" onClick={pauseTimer}>
                  ⏸ Pause
                </button>
              )}
              <button className="reset-btn" onClick={resetTimer}>
                ↺ Reset
              </button>
            </div>

            <div className="stats">
              <div className="stat">
                <span className="stat-value">{completedPomodoros}</span>
                <span className="stat-label">Today's Pomodoros</span>
              </div>
              <div className="pomodoro-dots">
                {[...Array(settings.longBreakInterval)].map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i < completedPomodoros % settings.longBreakInterval ? 'completed' : ''}`}
                  ></span>
                ))}
              </div>
            </div>

            <div className="history">
              <h4>Recent Sessions</h4>
              {todaysSessions.slice(0, 5).map(session => (
                <div key={session.id} className="session-item">
                  <span className="session-icon">🍅</span>
                  <div className="session-info">
                    <span className="session-task">{session.task || 'Untitled'}</span>
                    <span className="session-time">
                      {session.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="session-duration">{session.duration}min</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .pomodoro-timer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          width: 380px;
        }
        .timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .timer-header h3 { margin: 0; font-size: 14px; }
        .header-actions { display: flex; gap: 8px; }
        .settings-btn, .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
        }
        .close-btn { font-size: 20px; }
        .timer-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .mode-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }
        .mode-tab {
          flex: 1;
          padding: 10px;
          background: var(--bg-secondary);
          border: none;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        .mode-tab:hover { background: var(--border-color); }
        .mode-tab.active {
          background: var(--accent-color);
          color: white;
        }
        .timer-display {
          position: relative;
          width: 260px;
          height: 260px;
          margin: 0 auto 24px;
        }
        .progress-ring {
          transform: rotate(-90deg);
        }
        .progress-bg {
          stroke: var(--border-color);
        }
        .progress-bar {
          transition: stroke-dashoffset 0.5s ease;
          stroke-linecap: round;
        }
        .time-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .time {
          display: block;
          font-size: 48px;
          font-weight: 300;
          font-variant-numeric: tabular-nums;
        }
        .mode-label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .task-input input {
          width: 100%;
          padding: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 13px;
          text-align: center;
          margin-bottom: 16px;
        }
        .controls {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .start-btn, .pause-btn, .reset-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .start-btn {
          background: #27ae60;
          color: white;
        }
        .pause-btn {
          background: #f39c12;
          color: white;
        }
        .reset-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .stat { text-align: center; }
        .stat-value { display: block; font-size: 24px; font-weight: 600; }
        .stat-label { font-size: 11px; color: var(--text-secondary); }
        .pomodoro-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--border-color);
        }
        .dot.completed {
          background: #e74c3c;
        }
        .history h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .session-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 4px;
        }
        .session-item:hover { background: var(--bg-secondary); }
        .session-icon { font-size: 16px; }
        .session-info { flex: 1; }
        .session-task { display: block; font-size: 12px; }
        .session-time { font-size: 10px; color: var(--text-tertiary); }
        .session-duration { font-size: 11px; color: var(--text-secondary); }
        .settings-panel {
          padding: 16px;
        }
        .settings-panel h4 {
          margin: 0 0 20px 0;
        }
        .setting-group {
          margin-bottom: 16px;
        }
        .setting-group label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .setting-group input[type="number"] {
          width: 100%;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .setting-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .save-btn {
          width: 100%;
          padding: 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
}
