import { useState, useCallback } from 'react';

interface MultiCursorProps {
  content: string;
  onEdit: (edits: Array<{ line: number; column: number; text: string }>) => void;
  onClose: () => void;
}

interface Cursor {
  id: string;
  line: number;
  column: number;
  color: string;
}

interface Selection {
  cursorId: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

const CURSOR_COLORS = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c'
];

export default function MultiCursor({
  content,
  onEdit,
  onClose
}: MultiCursorProps) {
  const [cursors, setCursors] = useState<Cursor[]>([
    { id: '1', line: 1, column: 1, color: CURSOR_COLORS[0] }
  ]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'add' | 'column' | 'find'>('add');
  const [findText, setFindText] = useState('');
  const [columnStart, setColumnStart] = useState(1);
  const [columnEnd, setColumnEnd] = useState(10);

  const lines = content.split('\n');

  const addCursor = useCallback((line: number, column: number) => {
    const newCursor: Cursor = {
      id: Date.now().toString(),
      line,
      column,
      color: CURSOR_COLORS[cursors.length % CURSOR_COLORS.length]
    };
    setCursors(prev => [...prev, newCursor]);
  }, [cursors.length]);

  const removeCursor = useCallback((id: string) => {
    if (cursors.length > 1) {
      setCursors(prev => prev.filter(c => c.id !== id));
    }
  }, [cursors.length]);

  const addColumnCursors = useCallback(() => {
    const newCursors: Cursor[] = [];
    for (let line = columnStart; line <= Math.min(columnEnd, lines.length); line++) {
      newCursors.push({
        id: `col-${line}`,
        line,
        column: 1,
        color: CURSOR_COLORS[newCursors.length % CURSOR_COLORS.length]
      });
    }
    setCursors(newCursors);
  }, [columnStart, columnEnd, lines.length]);

  const findAndAddCursors = useCallback(() => {
    if (!findText) return;

    const newCursors: Cursor[] = [];
    lines.forEach((line, lineIndex) => {
      let startIndex = 0;
      let foundIndex;
      while ((foundIndex = line.indexOf(findText, startIndex)) !== -1) {
        newCursors.push({
          id: `find-${lineIndex}-${foundIndex}`,
          line: lineIndex + 1,
          column: foundIndex + 1,
          color: CURSOR_COLORS[newCursors.length % CURSOR_COLORS.length]
        });
        startIndex = foundIndex + 1;
      }
    });

    if (newCursors.length > 0) {
      setCursors(newCursors);
    }
  }, [findText, lines]);

  const applyEdit = () => {
    if (!inputText) return;

    const edits = cursors.map(cursor => ({
      line: cursor.line,
      column: cursor.column,
      text: inputText
    }));

    onEdit(edits);
    setInputText('');
  };

  const moveCursors = (direction: 'up' | 'down' | 'left' | 'right') => {
    setCursors(prev => prev.map(cursor => {
      let { line, column } = cursor;

      switch (direction) {
        case 'up':
          line = Math.max(1, line - 1);
          break;
        case 'down':
          line = Math.min(lines.length, line + 1);
          break;
        case 'left':
          column = Math.max(1, column - 1);
          break;
        case 'right':
          column = column + 1;
          break;
      }

      return { ...cursor, line, column };
    }));
  };

  return (
    <div className="multi-cursor">
      <div className="mc-header">
        <h3>Multi-Cursor Editor</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="mc-content">
        <div className="mc-toolbar">
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'add' ? 'active' : ''}`}
              onClick={() => setMode('add')}
            >
              Click to Add
            </button>
            <button
              className={`mode-btn ${mode === 'column' ? 'active' : ''}`}
              onClick={() => setMode('column')}
            >
              Column Select
            </button>
            <button
              className={`mode-btn ${mode === 'find' ? 'active' : ''}`}
              onClick={() => setMode('find')}
            >
              Find & Add
            </button>
          </div>

          <div className="cursor-count">
            {cursors.length} cursor{cursors.length > 1 ? 's' : ''}
          </div>
        </div>

        {mode === 'column' && (
          <div className="column-options">
            <label>
              Start Line:
              <input
                type="number"
                value={columnStart}
                onChange={(e) => setColumnStart(parseInt(e.target.value) || 1)}
                min={1}
                max={lines.length}
              />
            </label>
            <label>
              End Line:
              <input
                type="number"
                value={columnEnd}
                onChange={(e) => setColumnEnd(parseInt(e.target.value) || 1)}
                min={1}
                max={lines.length}
              />
            </label>
            <button onClick={addColumnCursors}>Add Column Cursors</button>
          </div>
        )}

        {mode === 'find' && (
          <div className="find-options">
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find text..."
            />
            <button onClick={findAndAddCursors}>Find All</button>
          </div>
        )}

        <div className="editor-preview">
          <div className="line-numbers">
            {lines.map((_, idx) => (
              <div key={idx} className="line-number">{idx + 1}</div>
            ))}
          </div>
          <div className="code-area">
            {lines.map((line, lineIdx) => (
              <div
                key={lineIdx}
                className="code-line"
                onClick={(e) => {
                  if (mode === 'add') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const column = Math.floor((e.clientX - rect.left) / 8) + 1;
                    addCursor(lineIdx + 1, column);
                  }
                }}
              >
                {line || ' '}
                {cursors
                  .filter(c => c.line === lineIdx + 1)
                  .map(cursor => (
                    <div
                      key={cursor.id}
                      className="cursor-indicator"
                      style={{
                        left: `${(cursor.column - 1) * 8}px`,
                        background: cursor.color
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCursor(cursor.id);
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mc-controls">
          <div className="movement-controls">
            <button onClick={() => moveCursors('up')}>↑</button>
            <div className="horizontal-btns">
              <button onClick={() => moveCursors('left')}>←</button>
              <button onClick={() => moveCursors('right')}>→</button>
            </div>
            <button onClick={() => moveCursors('down')}>↓</button>
          </div>

          <div className="edit-controls">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type to insert at all cursors..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyEdit();
                }
              }}
            />
            <button className="apply-btn" onClick={applyEdit}>
              Insert at All Cursors
            </button>
          </div>
        </div>

        <div className="cursor-list">
          <div className="list-header">Active Cursors</div>
          {cursors.map(cursor => (
            <div key={cursor.id} className="cursor-item">
              <span
                className="cursor-color"
                style={{ background: cursor.color }}
              />
              <span>Line {cursor.line}, Col {cursor.column}</span>
              <button onClick={() => removeCursor(cursor.id)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .multi-cursor {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .mc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .mc-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .mc-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .mc-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .mode-selector { display: flex; gap: 8px; }
        .mode-btn {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
        }
        .mode-btn.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }
        .cursor-count {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .column-options, .find-options {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .column-options label, .find-options label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .column-options input, .find-options input {
          width: 100px;
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .column-options button, .find-options button {
          padding: 4px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .editor-preview {
          flex: 1;
          display: flex;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: auto;
          min-height: 200px;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
        }
        .line-numbers {
          padding: 8px;
          background: var(--bg-primary);
          color: var(--text-tertiary);
          text-align: right;
          user-select: none;
        }
        .line-number { height: 20px; padding-right: 8px; }
        .code-area {
          flex: 1;
          padding: 8px;
          position: relative;
        }
        .code-line {
          height: 20px;
          position: relative;
          white-space: pre;
          cursor: crosshair;
        }
        .cursor-indicator {
          position: absolute;
          top: 0;
          width: 2px;
          height: 20px;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .mc-controls {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .movement-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .horizontal-btns { display: flex; gap: 4px; }
        .movement-controls button {
          width: 30px;
          height: 30px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
        }
        .edit-controls {
          flex: 1;
          display: flex;
          gap: 8px;
        }
        .edit-controls input {
          flex: 1;
          padding: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .apply-btn {
          padding: 8px 16px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .cursor-list {
          margin-top: 12px;
          max-height: 100px;
          overflow-y: auto;
        }
        .list-header {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .cursor-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          font-size: 12px;
        }
        .cursor-color {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .cursor-item button {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
