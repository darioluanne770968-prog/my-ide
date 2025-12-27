import { useState, useEffect, useRef, useMemo } from 'react';

interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  date: string;
  parents: string[];
  branches: string[];
  tags: string[];
}

interface GitGraphProps {
  rootPath: string;
  onClose: () => void;
  onCheckout: (hash: string) => void;
}

interface GraphNode {
  commit: GitCommit;
  column: number;
  color: string;
}

const COLORS = [
  '#f14c4c', '#3794ff', '#89d185', '#cca700', '#b180d7',
  '#4fc1ff', '#ce9178', '#6796e6', '#c586c0', '#4ec9b0'
];

function GitGraph({ rootPath, onClose, onCheckout }: GitGraphProps) {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxCount, setMaxCount] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCommits();
  }, [rootPath, maxCount]);

  const loadCommits = async () => {
    setIsLoading(true);
    try {
      const logs = await window.electronAPI.gitLog(rootPath, maxCount);
      const branches = await window.electronAPI.gitBranches(rootPath);

      // Enhance commits with branch/tag info
      const enhancedCommits: GitCommit[] = logs.map(log => ({
        hash: log.hash,
        shortHash: log.hash.substring(0, 7),
        message: log.message,
        author: log.author.split(' <')[0],
        email: log.author.match(/<(.+)>/)?.[1] || '',
        date: log.date,
        parents: [], // Would need to parse from git log
        branches: branches.filter(b => b.commit?.startsWith(log.hash)).map(b => b.name),
        tags: []
      }));

      setCommits(enhancedCommits);
    } catch (error) {
      console.error('Failed to load git graph:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommits = useMemo(() => {
    if (!searchQuery) return commits;
    const query = searchQuery.toLowerCase();
    return commits.filter(c =>
      c.message.toLowerCase().includes(query) ||
      c.author.toLowerCase().includes(query) ||
      c.hash.toLowerCase().includes(query) ||
      c.branches.some(b => b.toLowerCase().includes(query))
    );
  }, [commits, searchQuery]);

  // Simple graph layout - single column for now
  const graphNodes: GraphNode[] = useMemo(() => {
    return filteredCommits.map((commit, index) => ({
      commit,
      column: 0,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredCommits]);

  // Draw graph lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || graphNodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rowHeight = 32;
    const colWidth = 20;
    const dotRadius = 4;

    canvas.width = colWidth * 5;
    canvas.height = rowHeight * graphNodes.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    graphNodes.forEach((node, index) => {
      const x = colWidth + node.column * colWidth;
      const y = rowHeight * index + rowHeight / 2;

      // Draw line to next commit
      if (index < graphNodes.length - 1) {
        const nextNode = graphNodes[index + 1];
        const nextX = colWidth + nextNode.column * colWidth;
        const nextY = rowHeight * (index + 1) + rowHeight / 2;

        ctx.beginPath();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      }

      // Draw commit dot
      ctx.beginPath();
      ctx.fillStyle = node.color;
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border for selected commit
      if (selectedCommit?.hash === node.commit.hash) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.arc(x, y, dotRadius + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [graphNodes, selectedCommit]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="git-graph">
      <div className="git-graph-header">
        <h3>Git Graph</h3>
        <div className="git-graph-controls">
          <input
            type="text"
            placeholder="Search commits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="git-graph-search"
          />
          <select
            value={maxCount}
            onChange={(e) => setMaxCount(Number(e.target.value))}
            className="git-graph-limit"
          >
            <option value={50}>50 commits</option>
            <option value={100}>100 commits</option>
            <option value={200}>200 commits</option>
            <option value={500}>500 commits</option>
          </select>
          <button onClick={loadCommits} disabled={isLoading}>Refresh</button>
          <button onClick={onClose}>×</button>
        </div>
      </div>

      <div className="git-graph-content">
        <div className="git-graph-list" ref={containerRef}>
          <canvas ref={canvasRef} className="git-graph-canvas" />
          <div className="git-graph-commits">
            {isLoading ? (
              <div className="git-graph-loading">Loading...</div>
            ) : (
              graphNodes.map(({ commit, color }) => (
                <div
                  key={commit.hash}
                  className={`git-graph-commit ${selectedCommit?.hash === commit.hash ? 'selected' : ''}`}
                  onClick={() => setSelectedCommit(commit)}
                  onDoubleClick={() => onCheckout(commit.hash)}
                >
                  <div className="commit-info">
                    <div className="commit-message">
                      {commit.branches.map(branch => (
                        <span key={branch} className="commit-branch" style={{ backgroundColor: color }}>
                          {branch}
                        </span>
                      ))}
                      {commit.tags.map(tag => (
                        <span key={tag} className="commit-tag">
                          {tag}
                        </span>
                      ))}
                      <span className="commit-text">{commit.message}</span>
                    </div>
                    <div className="commit-meta">
                      <span className="commit-hash">{commit.shortHash}</span>
                      <span className="commit-author">{commit.author}</span>
                      <span className="commit-date">{formatDate(commit.date)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedCommit && (
          <div className="git-graph-details">
            <h4>Commit Details</h4>
            <div className="detail-row">
              <label>Hash:</label>
              <span className="selectable">{selectedCommit.hash}</span>
            </div>
            <div className="detail-row">
              <label>Author:</label>
              <span>{selectedCommit.author} &lt;{selectedCommit.email}&gt;</span>
            </div>
            <div className="detail-row">
              <label>Date:</label>
              <span>{new Date(selectedCommit.date).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <label>Message:</label>
              <p className="commit-full-message">{selectedCommit.message}</p>
            </div>
            <div className="detail-actions">
              <button onClick={() => onCheckout(selectedCommit.hash)}>Checkout</button>
              <button onClick={() => navigator.clipboard.writeText(selectedCommit.hash)}>
                Copy Hash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GitGraph;
