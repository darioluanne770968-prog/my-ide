import { useState, useEffect } from 'react';

export interface Diagnostic {
  id: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  source?: string;
  code?: string | number;
}

interface ProblemsPanelProps {
  diagnostics: Diagnostic[];
  onNavigate: (filePath: string, line: number, column: number) => void;
  onClose: () => void;
}

function ProblemsPanel({ diagnostics, onNavigate, onClose }: ProblemsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByFile, setGroupByFile] = useState(true);

  const filteredDiagnostics = diagnostics.filter(d => {
    if (filter === 'error' && d.severity !== 'error') return false;
    if (filter === 'warning' && d.severity !== 'warning') return false;
    if (searchQuery && !d.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !d.fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const errorCount = diagnostics.filter(d => d.severity === 'error').length;
  const warningCount = diagnostics.filter(d => d.severity === 'warning').length;
  const infoCount = diagnostics.filter(d => d.severity === 'info' || d.severity === 'hint').length;

  const groupedDiagnostics = groupByFile
    ? filteredDiagnostics.reduce((acc, d) => {
        if (!acc[d.filePath]) acc[d.filePath] = [];
        acc[d.filePath].push(d);
        return acc;
      }, {} as Record<string, Diagnostic[]>)
    : null;

  const getSeverityIcon = (severity: Diagnostic['severity']) => {
    switch (severity) {
      case 'error': return '×';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      case 'hint': return '💡';
    }
  };

  const getSeverityClass = (severity: Diagnostic['severity']) => {
    return `problem-${severity}`;
  };

  return (
    <div className="problems-panel">
      <div className="problems-header">
        <div className="problems-title">
          <span>Problems</span>
          <div className="problems-counts">
            <span className="count-error" title="Errors">{errorCount}</span>
            <span className="count-warning" title="Warnings">{warningCount}</span>
            <span className="count-info" title="Info">{infoCount}</span>
          </div>
        </div>
        <div className="problems-actions">
          <input
            type="text"
            className="problems-search"
            placeholder="Filter problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="problems-filter"
          >
            <option value="all">All</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
          </select>
          <button
            className={`problems-group-btn ${groupByFile ? 'active' : ''}`}
            onClick={() => setGroupByFile(!groupByFile)}
            title="Group by file"
          >
            G
          </button>
          <button className="problems-close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="problems-list">
        {filteredDiagnostics.length === 0 ? (
          <div className="problems-empty">No problems detected</div>
        ) : groupByFile && groupedDiagnostics ? (
          Object.entries(groupedDiagnostics).map(([filePath, problems]) => (
            <div key={filePath} className="problems-file-group">
              <div className="problems-file-header">
                <span className="problems-file-name">{problems[0].fileName}</span>
                <span className="problems-file-count">{problems.length}</span>
              </div>
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={`problem-item ${getSeverityClass(problem.severity)}`}
                  onClick={() => onNavigate(problem.filePath, problem.line, problem.column)}
                >
                  <span className="problem-icon">{getSeverityIcon(problem.severity)}</span>
                  <span className="problem-message">{problem.message}</span>
                  <span className="problem-location">[{problem.line}, {problem.column}]</span>
                  {problem.source && <span className="problem-source">{problem.source}</span>}
                  {problem.code && <span className="problem-code">{problem.code}</span>}
                </div>
              ))}
            </div>
          ))
        ) : (
          filteredDiagnostics.map((problem) => (
            <div
              key={problem.id}
              className={`problem-item ${getSeverityClass(problem.severity)}`}
              onClick={() => onNavigate(problem.filePath, problem.line, problem.column)}
            >
              <span className="problem-icon">{getSeverityIcon(problem.severity)}</span>
              <span className="problem-file">{problem.fileName}</span>
              <span className="problem-message">{problem.message}</span>
              <span className="problem-location">[{problem.line}, {problem.column}]</span>
              {problem.source && <span className="problem-source">{problem.source}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProblemsPanel;
