import React, { useState, useEffect } from 'react';

interface Script {
  name: string;
  command: string;
}

interface TaskRunnerProps {
  rootPath: string | null;
}

function TaskRunner({ rootPath }: TaskRunnerProps) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());
  const [output, setOutput] = useState<Record<string, string>>({});
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  useEffect(() => {
    const loadScripts = async () => {
      if (!rootPath) return;
      try {
        const packageJson = await window.electronAPI.readFile(`${rootPath}/package.json`);
        if (packageJson) {
          const pkg = JSON.parse(packageJson);
          if (pkg.scripts) {
            const scriptList = Object.entries(pkg.scripts).map(([name, command]) => ({
              name,
              command: command as string,
            }));
            setScripts(scriptList);
          }
        }
      } catch (error) {
        console.error('Failed to load scripts:', error);
      }
    };
    loadScripts();
  }, [rootPath]);

  const runScript = async (scriptName: string) => {
    if (!rootPath || runningScripts.has(scriptName)) return;

    setRunningScripts((prev) => new Set([...prev, scriptName]));
    setOutput((prev) => ({ ...prev, [scriptName]: '' }));
    setSelectedScript(scriptName);

    try {
      const taskId = await window.electronAPI.runNpmScript(rootPath, scriptName);

      // Listen for output
      window.electronAPI.onTaskOutput((id: string, data: string) => {
        if (id === taskId) {
          setOutput((prev) => ({
            ...prev,
            [scriptName]: (prev[scriptName] || '') + data,
          }));
        }
      });

      window.electronAPI.onTaskComplete((id: string) => {
        if (id === taskId) {
          setRunningScripts((prev) => {
            const next = new Set(prev);
            next.delete(scriptName);
            return next;
          });
        }
      });
    } catch (error: any) {
      setOutput((prev) => ({
        ...prev,
        [scriptName]: `Error: ${error.message}`,
      }));
      setRunningScripts((prev) => {
        const next = new Set(prev);
        next.delete(scriptName);
        return next;
      });
    }
  };

  const stopScript = async (scriptName: string) => {
    if (!rootPath) return;
    try {
      await window.electronAPI.stopNpmScript(scriptName);
      setRunningScripts((prev) => {
        const next = new Set(prev);
        next.delete(scriptName);
        return next;
      });
    } catch (error) {
      console.error('Failed to stop script:', error);
    }
  };

  if (!rootPath) {
    return (
      <div className="task-runner">
        <div className="task-runner-empty">Open a folder to view npm scripts</div>
      </div>
    );
  }

  return (
    <div className="task-runner">
      <div className="task-runner-header">
        <span>NPM Scripts</span>
      </div>
      <div className="task-list">
        {scripts.length === 0 ? (
          <div className="task-runner-empty">No scripts found in package.json</div>
        ) : (
          scripts.map((script) => (
            <div
              key={script.name}
              className={`task-item ${selectedScript === script.name ? 'selected' : ''} ${
                runningScripts.has(script.name) ? 'running' : ''
              }`}
              onClick={() => setSelectedScript(script.name)}
            >
              <div className="task-info">
                <span className="task-name">{script.name}</span>
                <span className="task-command">{script.command}</span>
              </div>
              <div className="task-actions">
                {runningScripts.has(script.name) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      stopScript(script.name);
                    }}
                    title="Stop"
                  >
                    ⬛
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runScript(script.name);
                    }}
                    title="Run"
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedScript && output[selectedScript] && (
        <div className="task-output">
          <div className="task-output-header">
            <span>Output: {selectedScript}</span>
            <button onClick={() => setOutput((prev) => ({ ...prev, [selectedScript]: '' }))}>
              Clear
            </button>
          </div>
          <pre className="task-output-content">{output[selectedScript]}</pre>
        </div>
      )}
    </div>
  );
}

export default TaskRunner;
