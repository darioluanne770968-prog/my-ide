import React, { useState, useMemo } from 'react';

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  leftLine?: number;
  rightLine?: number;
  leftContent?: string;
  rightContent?: string;
}

interface DiffToolProps {
  onClose: () => void;
}

function DiffTool({ onClose }: DiffToolProps) {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const computeDiff = useMemo(() => {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    const diff: DiffLine[] = [];

    const normalize = (text: string): string => {
      let result = text;
      if (ignoreWhitespace) result = result.replace(/\s+/g, ' ').trim();
      if (ignoreCase) result = result.toLowerCase();
      return result;
    };

    // Simple LCS-based diff algorithm
    const lcs = (a: string[], b: string[]): number[][] => {
      const m = a.length;
      const n = b.length;
      const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (normalize(a[i - 1]) === normalize(b[j - 1])) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      return dp;
    };

    const dp = lcs(leftLines, rightLines);
    let i = leftLines.length;
    let j = rightLines.length;
    const tempDiff: DiffLine[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && normalize(leftLines[i - 1]) === normalize(rightLines[j - 1])) {
        tempDiff.unshift({
          type: 'unchanged',
          leftLine: i,
          rightLine: j,
          leftContent: leftLines[i - 1],
          rightContent: rightLines[j - 1]
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        tempDiff.unshift({
          type: 'added',
          rightLine: j,
          rightContent: rightLines[j - 1]
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        tempDiff.unshift({
          type: 'removed',
          leftLine: i,
          leftContent: leftLines[i - 1]
        });
        i--;
      }
    }

    return tempDiff;
  }, [leftText, rightText, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    const added = computeDiff.filter(d => d.type === 'added').length;
    const removed = computeDiff.filter(d => d.type === 'removed').length;
    const unchanged = computeDiff.filter(d => d.type === 'unchanged').length;
    return { added, removed, unchanged };
  }, [computeDiff]);

  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const clearAll = () => {
    setLeftText('');
    setRightText('');
  };

  return (
    <div className="diff-tool">
      <div className="diff-header">
        <h3>Diff Tool</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="diff-toolbar">
        <div className="view-mode">
          <button
            className={viewMode === 'split' ? 'active' : ''}
            onClick={() => setViewMode('split')}
          >
            Split View
          </button>
          <button
            className={viewMode === 'unified' ? 'active' : ''}
            onClick={() => setViewMode('unified')}
          >
            Unified View
          </button>
        </div>

        <div className="diff-options">
          <label>
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            />
            Ignore whitespace
          </label>
          <label>
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
            Ignore case
          </label>
        </div>

        <div className="diff-actions">
          <button onClick={swapTexts}>⇄ Swap</button>
          <button onClick={clearAll}>🗑️ Clear</button>
        </div>
      </div>

      <div className="diff-stats">
        <span className="stat added">+{stats.added} added</span>
        <span className="stat removed">-{stats.removed} removed</span>
        <span className="stat unchanged">{stats.unchanged} unchanged</span>
      </div>

      <div className={`diff-content ${viewMode}`}>
        {viewMode === 'split' ? (
          <>
            <div className="diff-pane left">
              <div className="pane-header">Original</div>
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                placeholder="Paste original text here..."
                spellCheck={false}
              />
            </div>
            <div className="diff-pane right">
              <div className="pane-header">Modified</div>
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                placeholder="Paste modified text here..."
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <>
            <div className="diff-inputs unified">
              <div className="input-group">
                <label>Original</label>
                <textarea
                  value={leftText}
                  onChange={(e) => setLeftText(e.target.value)}
                  placeholder="Original text..."
                  rows={5}
                />
              </div>
              <div className="input-group">
                <label>Modified</label>
                <textarea
                  value={rightText}
                  onChange={(e) => setRightText(e.target.value)}
                  placeholder="Modified text..."
                  rows={5}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {(leftText || rightText) && (
        <div className="diff-result">
          <div className="result-header">Diff Result</div>
          <div className={`diff-lines ${viewMode}`}>
            {viewMode === 'split' ? (
              <div className="split-diff">
                <div className="diff-column left">
                  {computeDiff.map((line, i) => (
                    <div key={`left-${i}`} className={`diff-line ${line.type}`}>
                      <span className="line-number">{line.leftLine || ''}</span>
                      <span className="line-content">{line.leftContent || ''}</span>
                    </div>
                  ))}
                </div>
                <div className="diff-column right">
                  {computeDiff.map((line, i) => (
                    <div key={`right-${i}`} className={`diff-line ${line.type}`}>
                      <span className="line-number">{line.rightLine || ''}</span>
                      <span className="line-content">{line.rightContent || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="unified-diff">
                {computeDiff.map((line, i) => (
                  <div key={i} className={`diff-line ${line.type}`}>
                    <span className="line-indicator">
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="line-content">
                      {line.leftContent || line.rightContent || ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DiffTool;
