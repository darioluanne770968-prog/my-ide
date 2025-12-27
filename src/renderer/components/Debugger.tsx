import { useState, useEffect, useCallback } from 'react';

export interface Breakpoint {
  id: string;
  filePath: string;
  line: number;
  enabled: boolean;
  condition?: string;
  hitCount?: number;
}

export interface StackFrame {
  id: number;
  name: string;
  filePath: string;
  line: number;
  column: number;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  children?: Variable[];
  expandable: boolean;
}

export type DebugState = 'stopped' | 'running' | 'paused' | 'disconnected';

interface DebuggerProps {
  rootPath: string;
  breakpoints: Breakpoint[];
  onBreakpointChange: (breakpoints: Breakpoint[]) => void;
  onNavigate: (filePath: string, line: number) => void;
}

function Debugger({ rootPath, breakpoints, onBreakpointChange, onNavigate }: DebuggerProps) {
  const [debugState, setDebugState] = useState<DebugState>('disconnected');
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const [variables, setVariables] = useState<{ local: Variable[]; global: Variable[] }>({
    local: [],
    global: []
  });
  const [watchExpressions, setWatchExpressions] = useState<string[]>([]);
  const [watchValues, setWatchValues] = useState<Record<string, string>>({});
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: 'log' | 'error' | 'info'; message: string }>>([]);
  const [consoleInput, setConsoleInput] = useState('');
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());

  // Debug controls
  const handleStart = useCallback(async () => {
    setDebugState('running');
    setConsoleOutput(prev => [...prev, { type: 'info', message: 'Debugger started' }]);
    // Would connect to debug adapter here
  }, []);

  const handleStop = useCallback(() => {
    setDebugState('disconnected');
    setStackFrames([]);
    setSelectedFrame(null);
    setVariables({ local: [], global: [] });
    setConsoleOutput(prev => [...prev, { type: 'info', message: 'Debugger stopped' }]);
  }, []);

  const handlePause = useCallback(() => {
    setDebugState('paused');
  }, []);

  const handleContinue = useCallback(() => {
    setDebugState('running');
  }, []);

  const handleStepOver = useCallback(() => {
    // Step over implementation
    setConsoleOutput(prev => [...prev, { type: 'info', message: 'Step over' }]);
  }, []);

  const handleStepInto = useCallback(() => {
    // Step into implementation
    setConsoleOutput(prev => [...prev, { type: 'info', message: 'Step into' }]);
  }, []);

  const handleStepOut = useCallback(() => {
    // Step out implementation
    setConsoleOutput(prev => [...prev, { type: 'info', message: 'Step out' }]);
  }, []);

  const handleRestart = useCallback(() => {
    handleStop();
    setTimeout(handleStart, 100);
  }, [handleStop, handleStart]);

  // Breakpoint management
  const toggleBreakpoint = useCallback((bp: Breakpoint) => {
    const updated = breakpoints.map(b =>
      b.id === bp.id ? { ...b, enabled: !b.enabled } : b
    );
    onBreakpointChange(updated);
  }, [breakpoints, onBreakpointChange]);

  const removeBreakpoint = useCallback((id: string) => {
    onBreakpointChange(breakpoints.filter(b => b.id !== id));
  }, [breakpoints, onBreakpointChange]);

  const removeAllBreakpoints = useCallback(() => {
    onBreakpointChange([]);
  }, [onBreakpointChange]);

  // Watch expressions
  const addWatch = useCallback(() => {
    const expr = prompt('Enter expression to watch:');
    if (expr) {
      setWatchExpressions(prev => [...prev, expr]);
      setWatchValues(prev => ({ ...prev, [expr]: '<not evaluated>' }));
    }
  }, []);

  const removeWatch = useCallback((expr: string) => {
    setWatchExpressions(prev => prev.filter(e => e !== expr));
    setWatchValues(prev => {
      const { [expr]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Console
  const handleConsoleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    setConsoleOutput(prev => [...prev, { type: 'log', message: `> ${consoleInput}` }]);
    // Would evaluate expression here
    setConsoleOutput(prev => [...prev, { type: 'log', message: 'undefined' }]);
    setConsoleInput('');
  }, [consoleInput]);

  const clearConsole = useCallback(() => {
    setConsoleOutput([]);
  }, []);

  // Variable expansion
  const toggleVarExpand = useCallback((path: string) => {
    setExpandedVars(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const renderVariable = (variable: Variable, path: string, level: number = 0) => {
    const fullPath = path ? `${path}.${variable.name}` : variable.name;
    const isExpanded = expandedVars.has(fullPath);

    return (
      <div key={fullPath} className="variable-item">
        <div
          className="variable-row"
          style={{ paddingLeft: `${level * 12 + 4}px` }}
          onClick={() => variable.expandable && toggleVarExpand(fullPath)}
        >
          {variable.expandable ? (
            <span className="variable-expand">{isExpanded ? '▼' : '▶'}</span>
          ) : (
            <span className="variable-expand-placeholder" />
          )}
          <span className="variable-name">{variable.name}</span>
          <span className="variable-separator">:</span>
          <span className="variable-value">{variable.value}</span>
          <span className="variable-type">{variable.type}</span>
        </div>
        {variable.expandable && isExpanded && variable.children && (
          <div className="variable-children">
            {variable.children.map(child => renderVariable(child, fullPath, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="debugger-panel">
      {/* Debug Toolbar */}
      <div className="debug-toolbar">
        {debugState === 'disconnected' ? (
          <button onClick={handleStart} className="debug-btn start" title="Start Debugging (F5)">
            ▶
          </button>
        ) : (
          <>
            <button onClick={handleContinue} disabled={debugState !== 'paused'} title="Continue (F5)">
              ▶
            </button>
            <button onClick={handlePause} disabled={debugState !== 'running'} title="Pause (F6)">
              ⏸
            </button>
            <button onClick={handleStepOver} disabled={debugState !== 'paused'} title="Step Over (F10)">
              ⤵
            </button>
            <button onClick={handleStepInto} disabled={debugState !== 'paused'} title="Step Into (F11)">
              ↓
            </button>
            <button onClick={handleStepOut} disabled={debugState !== 'paused'} title="Step Out (Shift+F11)">
              ↑
            </button>
            <button onClick={handleRestart} title="Restart (Ctrl+Shift+F5)">
              ⟳
            </button>
            <button onClick={handleStop} title="Stop (Shift+F5)">
              ⏹
            </button>
          </>
        )}
        <span className={`debug-status ${debugState}`}>{debugState}</span>
      </div>

      <div className="debug-content">
        {/* Variables */}
        <div className="debug-section">
          <div className="debug-section-header">
            <span>Variables</span>
          </div>
          <div className="debug-section-content variables-section">
            {variables.local.length === 0 && variables.global.length === 0 ? (
              <div className="debug-empty">No variables</div>
            ) : (
              <>
                {variables.local.length > 0 && (
                  <div className="variable-group">
                    <div className="variable-group-header">Local</div>
                    {variables.local.map(v => renderVariable(v, 'local'))}
                  </div>
                )}
                {variables.global.length > 0 && (
                  <div className="variable-group">
                    <div className="variable-group-header">Global</div>
                    {variables.global.map(v => renderVariable(v, 'global'))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Watch */}
        <div className="debug-section">
          <div className="debug-section-header">
            <span>Watch</span>
            <button onClick={addWatch} className="debug-section-action" title="Add Expression">+</button>
          </div>
          <div className="debug-section-content">
            {watchExpressions.length === 0 ? (
              <div className="debug-empty">No watch expressions</div>
            ) : (
              watchExpressions.map(expr => (
                <div key={expr} className="watch-item">
                  <span className="watch-expr">{expr}</span>
                  <span className="watch-value">{watchValues[expr]}</span>
                  <button onClick={() => removeWatch(expr)} className="watch-remove">×</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Call Stack */}
        <div className="debug-section">
          <div className="debug-section-header">
            <span>Call Stack</span>
          </div>
          <div className="debug-section-content">
            {stackFrames.length === 0 ? (
              <div className="debug-empty">No call stack</div>
            ) : (
              stackFrames.map(frame => (
                <div
                  key={frame.id}
                  className={`stack-frame ${selectedFrame === frame.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedFrame(frame.id);
                    onNavigate(frame.filePath, frame.line);
                  }}
                >
                  <span className="frame-name">{frame.name}</span>
                  <span className="frame-location">
                    {frame.filePath.split('/').pop()}:{frame.line}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Breakpoints */}
        <div className="debug-section">
          <div className="debug-section-header">
            <span>Breakpoints</span>
            <button onClick={removeAllBreakpoints} className="debug-section-action" title="Remove All">
              ×
            </button>
          </div>
          <div className="debug-section-content">
            {breakpoints.length === 0 ? (
              <div className="debug-empty">No breakpoints</div>
            ) : (
              breakpoints.map(bp => (
                <div
                  key={bp.id}
                  className={`breakpoint-item ${bp.enabled ? 'enabled' : 'disabled'}`}
                >
                  <input
                    type="checkbox"
                    checked={bp.enabled}
                    onChange={() => toggleBreakpoint(bp)}
                  />
                  <span
                    className="breakpoint-location"
                    onClick={() => onNavigate(bp.filePath, bp.line)}
                  >
                    {bp.filePath.split('/').pop()}:{bp.line}
                  </span>
                  {bp.condition && (
                    <span className="breakpoint-condition">{bp.condition}</span>
                  )}
                  <button onClick={() => removeBreakpoint(bp.id)} className="breakpoint-remove">
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Debug Console */}
        <div className="debug-section debug-console-section">
          <div className="debug-section-header">
            <span>Debug Console</span>
            <button onClick={clearConsole} className="debug-section-action" title="Clear">
              🗑
            </button>
          </div>
          <div className="debug-console">
            <div className="console-output">
              {consoleOutput.map((entry, i) => (
                <div key={i} className={`console-entry ${entry.type}`}>
                  {entry.message}
                </div>
              ))}
            </div>
            <form onSubmit={handleConsoleSubmit} className="console-input-form">
              <input
                type="text"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="Evaluate expression..."
                className="console-input"
                disabled={debugState !== 'paused'}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Debugger;
