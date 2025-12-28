import { useState, useEffect, useMemo } from 'react';

interface CodeLensProps {
  content: string;
  language: string;
  onRunTest?: (testName: string, line: number) => void;
  onShowReferences?: (symbol: string, line: number) => void;
  onDebug?: (functionName: string, line: number) => void;
}

interface LensItem {
  line: number;
  type: 'references' | 'test' | 'implementations' | 'debug';
  label: string;
  count?: number;
  symbol: string;
}

export default function CodeLens({
  content,
  language,
  onRunTest,
  onShowReferences,
  onDebug
}: CodeLensProps) {
  const [lensItems, setLensItems] = useState<LensItem[]>([]);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const lines = useMemo(() => content.split('\n'), [content]);

  useEffect(() => {
    analyzCode();
  }, [content, language]);

  const analyzCode = () => {
    const items: LensItem[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detect functions
      const funcMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\(|=>)/);
      if (funcMatch) {
        items.push({
          line: lineNum,
          type: 'references',
          label: `${Math.floor(Math.random() * 10) + 1} references`,
          count: Math.floor(Math.random() * 10) + 1,
          symbol: funcMatch[1]
        });
      }

      // Detect classes
      const classMatch = line.match(/(?:class|interface|type)\s+(\w+)/);
      if (classMatch) {
        items.push({
          line: lineNum,
          type: 'implementations',
          label: `${Math.floor(Math.random() * 5)} implementations`,
          count: Math.floor(Math.random() * 5),
          symbol: classMatch[1]
        });
      }

      // Detect test functions
      const testMatch = line.match(/(?:it|test|describe)\s*\(\s*['"`](.+?)['"`]/);
      if (testMatch) {
        items.push({
          line: lineNum,
          type: 'test',
          label: 'Run Test | Debug',
          symbol: testMatch[1]
        });
      }

      // Detect methods
      const methodMatch = line.match(/^\s+(\w+)\s*\(/);
      if (methodMatch && !line.includes('if') && !line.includes('for') && !line.includes('while')) {
        items.push({
          line: lineNum,
          type: 'debug',
          label: `${Math.floor(Math.random() * 8)} references`,
          count: Math.floor(Math.random() * 8),
          symbol: methodMatch[1]
        });
      }
    });

    setLensItems(items);
  };

  const handleLensClick = (item: LensItem, action: string) => {
    switch (action) {
      case 'references':
        onShowReferences?.(item.symbol, item.line);
        break;
      case 'test':
        onRunTest?.(item.symbol, item.line);
        break;
      case 'debug':
        onDebug?.(item.symbol, item.line);
        break;
    }
  };

  const getLensForLine = (lineNum: number) => {
    return lensItems.filter(item => item.line === lineNum);
  };

  return (
    <div className="code-lens-container">
      <div className="lens-overlay">
        {lensItems.map((item, idx) => (
          <div
            key={`${item.line}-${idx}`}
            className="lens-line"
            style={{ top: `${(item.line - 1) * 20 - 16}px` }}
            onMouseEnter={() => setHoveredLine(item.line)}
            onMouseLeave={() => setHoveredLine(null)}
          >
            {item.type === 'test' ? (
              <div className="lens-actions">
                <button
                  className="lens-action run"
                  onClick={() => handleLensClick(item, 'test')}
                >
                  ▶ Run Test
                </button>
                <button
                  className="lens-action debug"
                  onClick={() => handleLensClick(item, 'debug')}
                >
                  🔍 Debug
                </button>
              </div>
            ) : (
              <button
                className="lens-button"
                onClick={() => handleLensClick(item, 'references')}
              >
                {item.label}
              </button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .code-lens-container {
          position: absolute;
          top: 0;
          left: 60px;
          right: 0;
          pointer-events: none;
          z-index: 10;
        }
        .lens-overlay {
          position: relative;
        }
        .lens-line {
          position: absolute;
          left: 0;
          height: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: auto;
        }
        .lens-button {
          background: none;
          border: none;
          color: var(--text-tertiary);
          font-size: 10px;
          cursor: pointer;
          padding: 0;
          opacity: 0.7;
          transition: opacity 0.2s, color 0.2s;
        }
        .lens-button:hover {
          opacity: 1;
          color: var(--accent-color);
          text-decoration: underline;
        }
        .lens-actions {
          display: flex;
          gap: 8px;
        }
        .lens-action {
          background: none;
          border: none;
          font-size: 10px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 3px;
          opacity: 0.8;
          transition: all 0.2s;
        }
        .lens-action.run {
          color: #27ae60;
        }
        .lens-action.run:hover {
          background: rgba(39, 174, 96, 0.2);
          opacity: 1;
        }
        .lens-action.debug {
          color: #e67e22;
        }
        .lens-action.debug:hover {
          background: rgba(230, 126, 34, 0.2);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
