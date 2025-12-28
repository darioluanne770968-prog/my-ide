import { useMemo } from 'react';

interface RainbowBracketsProps {
  content: string;
  cursorLine: number;
  cursorColumn: number;
}

interface BracketPair {
  open: { line: number; column: number; char: string };
  close: { line: number; column: number; char: string };
  depth: number;
}

const BRACKET_COLORS = [
  '#e6b422', // Gold
  '#da70d6', // Orchid
  '#3498db', // Blue
  '#2ecc71', // Green
  '#e74c3c', // Red
  '#9b59b6', // Purple
  '#1abc9c', // Teal
  '#f39c12', // Orange
];

const BRACKET_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>'
};

export default function RainbowBrackets({
  content,
  cursorLine,
  cursorColumn
}: RainbowBracketsProps) {
  const bracketPairs = useMemo(() => {
    const pairs: BracketPair[] = [];
    const stack: Array<{ line: number; column: number; char: string; depth: number }> = [];
    const lines = content.split('\n');
    let depth = 0;

    lines.forEach((line, lineIndex) => {
      let inString = false;
      let stringChar = '';

      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        const prevChar = col > 0 ? line[col - 1] : '';

        // Handle string literals
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }

        if (inString) continue;

        // Handle comments (simplified)
        if (char === '/' && line[col + 1] === '/') break;

        if (BRACKET_PAIRS[char]) {
          stack.push({
            line: lineIndex + 1,
            column: col + 1,
            char,
            depth
          });
          depth++;
        } else if (Object.values(BRACKET_PAIRS).includes(char)) {
          const matching = stack.pop();
          if (matching) {
            pairs.push({
              open: { line: matching.line, column: matching.column, char: matching.char },
              close: { line: lineIndex + 1, column: col + 1, char },
              depth: matching.depth
            });
            depth = matching.depth;
          }
        }
      }
    });

    return pairs;
  }, [content]);

  const currentPair = useMemo(() => {
    return bracketPairs.find(pair =>
      (pair.open.line === cursorLine && pair.open.column === cursorColumn) ||
      (pair.close.line === cursorLine && pair.close.column === cursorColumn)
    );
  }, [bracketPairs, cursorLine, cursorColumn]);

  const getBracketColor = (depth: number) => {
    return BRACKET_COLORS[depth % BRACKET_COLORS.length];
  };

  return (
    <div className="rainbow-brackets">
      <div className="bracket-decorations">
        {bracketPairs.map((pair, idx) => {
          const color = getBracketColor(pair.depth);
          const isActive = currentPair === pair;

          return (
            <div key={idx} className="bracket-pair">
              <div
                className={`bracket open ${isActive ? 'active' : ''}`}
                style={{
                  top: `${(pair.open.line - 1) * 20}px`,
                  left: `${pair.open.column * 8 + 50}px`,
                  color,
                  textShadow: isActive ? `0 0 4px ${color}` : 'none'
                }}
              >
                {pair.open.char}
              </div>
              <div
                className={`bracket close ${isActive ? 'active' : ''}`}
                style={{
                  top: `${(pair.close.line - 1) * 20}px`,
                  left: `${pair.close.column * 8 + 50}px`,
                  color,
                  textShadow: isActive ? `0 0 4px ${color}` : 'none'
                }}
              >
                {pair.close.char}
              </div>

              {isActive && (
                <div
                  className="bracket-connector"
                  style={{
                    top: `${(pair.open.line - 1) * 20 + 10}px`,
                    left: `${Math.min(pair.open.column, pair.close.column) * 8 + 52}px`,
                    height: `${(pair.close.line - pair.open.line) * 20}px`,
                    borderColor: color
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="bracket-legend">
        <div className="legend-title">Bracket Depth</div>
        <div className="legend-items">
          {BRACKET_COLORS.slice(0, 4).map((color, idx) => (
            <div key={idx} className="legend-item">
              <span className="legend-color" style={{ background: color }}></span>
              <span className="legend-label">Level {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .rainbow-brackets {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
        }
        .bracket-decorations {
          position: relative;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
        }
        .bracket {
          position: absolute;
          font-weight: bold;
          transition: all 0.15s;
        }
        .bracket.active {
          transform: scale(1.2);
          font-weight: 900;
        }
        .bracket-connector {
          position: absolute;
          width: 1px;
          border-left: 2px dashed;
          opacity: 0.4;
        }
        .bracket-legend {
          position: fixed;
          bottom: 60px;
          right: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 11px;
          pointer-events: auto;
          opacity: 0.9;
        }
        .legend-title {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }
        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        .legend-label {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
