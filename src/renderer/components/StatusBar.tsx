import React from 'react';

interface StatusBarProps {
  currentFile: string | null;
  line: number;
  column: number;
  language: string;
  encoding: string;
  gitBranch: string | null;
  isDirty: boolean;
}

function StatusBar({
  currentFile,
  line,
  column,
  language,
  encoding,
  gitBranch,
  isDirty,
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {gitBranch && (
          <div className="status-item git">
            <span className="status-icon">🌿</span>
            <span>{gitBranch}</span>
          </div>
        )}
        {isDirty && (
          <div className="status-item dirty">
            <span className="status-icon">●</span>
            <span>Unsaved</span>
          </div>
        )}
      </div>
      <div className="status-bar-right">
        {currentFile && (
          <>
            <div className="status-item">
              <span>Ln {line}, Col {column}</span>
            </div>
            <div className="status-item">
              <span>{encoding}</span>
            </div>
            <div className="status-item">
              <span>{language}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StatusBar;
