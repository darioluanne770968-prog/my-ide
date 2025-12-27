import React, { useEffect, useState } from 'react';

interface BlameLine {
  hash: string;
  author: string;
  date: string;
  line: number;
  content: string;
}

interface GitBlameProps {
  rootPath: string | null;
  filePath: string;
  onClose: () => void;
}

function GitBlame({ rootPath, filePath, onClose }: GitBlameProps) {
  const [blameData, setBlameData] = useState<BlameLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  useEffect(() => {
    const loadBlame = async () => {
      if (!rootPath || !filePath) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await window.electronAPI.gitBlame(rootPath, filePath);
        setBlameData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadBlame();
  }, [rootPath, filePath]);

  const getColorForHash = (hash: string) => {
    const colors = [
      '#4a9eff',
      '#ff6b6b',
      '#4ecdc4',
      '#ffe66d',
      '#95e1d3',
      '#f38181',
      '#aa96da',
      '#fcbad3',
    ];
    let sum = 0;
    for (let i = 0; i < hash.length; i++) {
      sum += hash.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <div className="git-blame">
        <div className="git-blame-loading">Loading blame data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="git-blame">
        <div className="git-blame-header">
          <span>Git Blame: {filePath.split('/').pop()}</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="git-blame-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="git-blame">
      <div className="git-blame-header">
        <span>Git Blame: {filePath.split('/').pop()}</span>
        <button onClick={onClose}>×</button>
      </div>
      <div className="git-blame-content">
        {blameData.map((line, index) => (
          <div
            key={index}
            className={`git-blame-line ${selectedCommit === line.hash ? 'selected' : ''}`}
            onClick={() => setSelectedCommit(line.hash === selectedCommit ? null : line.hash)}
          >
            <div
              className="blame-info"
              style={{ borderLeftColor: getColorForHash(line.hash) }}
            >
              <span className="blame-hash">{line.hash.substring(0, 7)}</span>
              <span className="blame-author">{line.author}</span>
              <span className="blame-date">{formatDate(line.date)}</span>
            </div>
            <span className="blame-line-number">{line.line}</span>
            <pre className="blame-content">{line.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GitBlame;
