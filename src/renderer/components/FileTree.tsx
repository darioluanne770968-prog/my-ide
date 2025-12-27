import React, { useState, useEffect } from 'react';

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface FileTreeProps {
  rootPath: string;
  onFileSelect: (filePath: string, fileName: string) => void;
  onContextMenu?: (e: React.MouseEvent, path: string) => void;
}

interface TreeNodeProps {
  entry: FileEntry;
  onFileSelect: (filePath: string, fileName: string) => void;
  onContextMenu?: (e: React.MouseEvent, path: string) => void;
  level: number;
}

function TreeNode({ entry, onFileSelect, onContextMenu, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);

  const handleClick = async () => {
    if (entry.isDirectory) {
      if (!isExpanded) {
        const entries = await window.electronAPI.readDirectory(entry.path);
        const sorted = entries.sort((a, b) => {
          if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
          }
          return a.isDirectory ? -1 : 1;
        });
        setChildren(sorted);
      }
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(entry.path, entry.name);
    }
  };

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) return isExpanded ? '📂' : '📁';
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return '🔷';
      case 'js':
      case 'jsx':
        return '🟨';
      case 'json':
        return '📋';
      case 'css':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onContextMenu) {
      onContextMenu(e, entry.path);
    }
  };

  return (
    <div className="tree-node">
      <div
        className="tree-node-label"
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="file-icon">{getFileIcon(entry.name, entry.isDirectory)}</span>
        <span className="file-name">{entry.name}</span>
      </div>
      {isExpanded && entry.isDirectory && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              onFileSelect={onFileSelect}
              onContextMenu={onContextMenu}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileTree({ rootPath, onFileSelect, onContextMenu }: FileTreeProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);

  useEffect(() => {
    const loadRoot = async () => {
      const items = await window.electronAPI.readDirectory(rootPath);
      const sorted = items.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
          return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
      });
      setEntries(sorted);
    };
    loadRoot();
  }, [rootPath]);

  return (
    <div className="file-tree">
      {entries.map((entry) => (
        <TreeNode
          key={entry.path}
          entry={entry}
          onFileSelect={onFileSelect}
          onContextMenu={onContextMenu}
          level={0}
        />
      ))}
    </div>
  );
}

export default FileTree;
