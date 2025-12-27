import React from 'react';

interface OpenFile {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface TabBarProps {
  files: OpenFile[];
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onCloseFile: (path: string) => void;
}

function TabBar({ files, activeFile, onSelectFile, onCloseFile }: TabBarProps) {
  if (files.length === 0) {
    return <div className="tab-bar empty" />;
  }

  return (
    <div className="tab-bar">
      {files.map((file) => (
        <div
          key={file.path}
          className={`tab ${file.path === activeFile ? 'active' : ''}`}
          onClick={() => onSelectFile(file.path)}
        >
          <span className="tab-name">
            {file.isDirty && <span className="dirty-indicator">●</span>}
            {file.name}
          </span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onCloseFile(file.path);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default TabBar;
