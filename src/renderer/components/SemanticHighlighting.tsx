import { useMemo } from 'react';

interface SemanticHighlightingProps {
  content: string;
  language: string;
}

interface SemanticToken {
  line: number;
  start: number;
  length: number;
  type: 'class' | 'function' | 'variable' | 'parameter' | 'property' | 'constant' | 'type' | 'interface' | 'enum' | 'namespace';
  modifiers: string[];
}

const TOKEN_COLORS: Record<string, string> = {
  class: '#4EC9B0',
  function: '#DCDCAA',
  variable: '#9CDCFE',
  parameter: '#9CDCFE',
  property: '#9CDCFE',
  constant: '#4FC1FF',
  type: '#4EC9B0',
  interface: '#4EC9B0',
  enum: '#4EC9B0',
  namespace: '#4EC9B0'
};

const MODIFIER_STYLES: Record<string, React.CSSProperties> = {
  declaration: { fontWeight: 'bold' },
  definition: { fontWeight: 'bold' },
  readonly: { fontStyle: 'italic' },
  static: { textDecoration: 'underline' },
  deprecated: { textDecoration: 'line-through', opacity: 0.7 },
  async: { fontStyle: 'italic' },
  modification: { },
  documentation: { },
  defaultLibrary: { opacity: 0.8 }
};

export default function SemanticHighlighting({
  content,
  language
}: SemanticHighlightingProps) {
  const tokens = useMemo(() => {
    const result: SemanticToken[] = [];
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      // Class declarations
      const classMatch = line.match(/class\s+(\w+)/g);
      if (classMatch) {
        classMatch.forEach(match => {
          const name = match.replace('class ', '');
          const start = line.indexOf(name);
          result.push({
            line: lineIndex + 1,
            start,
            length: name.length,
            type: 'class',
            modifiers: ['declaration']
          });
        });
      }

      // Interface declarations
      const interfaceMatch = line.match(/interface\s+(\w+)/g);
      if (interfaceMatch) {
        interfaceMatch.forEach(match => {
          const name = match.replace('interface ', '');
          const start = line.indexOf(name);
          result.push({
            line: lineIndex + 1,
            start,
            length: name.length,
            type: 'interface',
            modifiers: ['declaration']
          });
        });
      }

      // Function declarations
      const funcMatch = line.match(/(?:function|async function)\s+(\w+)/g);
      if (funcMatch) {
        funcMatch.forEach(match => {
          const name = match.replace(/(?:async )?function /, '');
          const start = line.indexOf(name);
          const isAsync = match.includes('async');
          result.push({
            line: lineIndex + 1,
            start,
            length: name.length,
            type: 'function',
            modifiers: isAsync ? ['declaration', 'async'] : ['declaration']
          });
        });
      }

      // Const declarations
      const constMatch = line.match(/const\s+(\w+)/g);
      if (constMatch) {
        constMatch.forEach(match => {
          const name = match.replace('const ', '');
          const start = line.indexOf(name);
          result.push({
            line: lineIndex + 1,
            start,
            length: name.length,
            type: 'constant',
            modifiers: ['declaration', 'readonly']
          });
        });
      }

      // Type annotations
      const typeMatch = line.match(/:\s*(\w+)(?:\[\])?(?:\s*[=,)]|$)/g);
      if (typeMatch) {
        typeMatch.forEach(match => {
          const name = match.replace(/[:\s\[\]=,)]/g, '');
          if (name && !['string', 'number', 'boolean', 'null', 'undefined', 'any', 'void'].includes(name)) {
            const start = line.indexOf(match) + match.indexOf(name);
            result.push({
              line: lineIndex + 1,
              start,
              length: name.length,
              type: 'type',
              modifiers: []
            });
          }
        });
      }

      // Parameters
      const paramMatch = line.match(/\(([^)]+)\)/);
      if (paramMatch) {
        const params = paramMatch[1].split(',');
        params.forEach(param => {
          const nameMatch = param.trim().match(/^(\w+)/);
          if (nameMatch) {
            const name = nameMatch[1];
            const start = line.indexOf(param) + param.indexOf(name);
            result.push({
              line: lineIndex + 1,
              start,
              length: name.length,
              type: 'parameter',
              modifiers: []
            });
          }
        });
      }
    });

    return result;
  }, [content]);

  const getTokenStyle = (token: SemanticToken): React.CSSProperties => {
    let style: React.CSSProperties = {
      color: TOKEN_COLORS[token.type] || 'inherit'
    };

    token.modifiers.forEach(mod => {
      if (MODIFIER_STYLES[mod]) {
        style = { ...style, ...MODIFIER_STYLES[mod] };
      }
    });

    return style;
  };

  return (
    <div className="semantic-highlighting">
      <div className="token-overlays">
        {tokens.map((token, idx) => (
          <div
            key={idx}
            className="token-highlight"
            style={{
              top: `${(token.line - 1) * 20}px`,
              left: `${token.start * 8 + 60}px`,
              width: `${token.length * 8}px`,
              ...getTokenStyle(token)
            }}
            title={`${token.type}${token.modifiers.length ? ` (${token.modifiers.join(', ')})` : ''}`}
          />
        ))}
      </div>

      <div className="semantic-legend">
        <div className="legend-title">Semantic Tokens</div>
        <div className="legend-grid">
          {Object.entries(TOKEN_COLORS).slice(0, 6).map(([type, color]) => (
            <div key={type} className="legend-item">
              <span className="legend-color" style={{ background: color }}></span>
              <span className="legend-type">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .semantic-highlighting {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 4;
        }
        .token-overlays {
          position: relative;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
        }
        .token-highlight {
          position: absolute;
          height: 20px;
          opacity: 0;
          background: currentColor;
          transition: opacity 0.2s;
        }
        .semantic-highlighting:hover .token-highlight {
          opacity: 0.1;
        }
        .semantic-legend {
          position: fixed;
          bottom: 60px;
          right: 150px;
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
        .legend-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
        .legend-type {
          color: var(--text-secondary);
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}
