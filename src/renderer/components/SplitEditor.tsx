import React, { useState, useRef, useCallback } from 'react';
import Editor from './Editor';
import { AppSettings } from './Settings';

interface OpenFile {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface SplitEditorProps {
  files: OpenFile[];
  settings: AppSettings;
  onContentChange: (path: string, content: string) => void;
  onSave: (path: string) => void;
  onCursorChange: (line: number, column: number) => void;
}

type SplitDirection = 'horizontal' | 'vertical' | null;

interface EditorPane {
  id: string;
  filePath: string | null;
}

function SplitEditor({
  files,
  settings,
  onContentChange,
  onSave,
  onCursorChange,
}: SplitEditorProps) {
  const [panes, setPanes] = useState<EditorPane[]>([
    { id: 'pane-1', filePath: files[0]?.path || null },
  ]);
  const [splitDirection, setSplitDirection] = useState<SplitDirection>(null);
  const [activePane, setActivePane] = useState('pane-1');
  const [splitRatio, setSplitRatio] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleSplit = (direction: SplitDirection) => {
    if (panes.length >= 2) return;

    const newPane: EditorPane = {
      id: `pane-${Date.now()}`,
      filePath: panes[0]?.filePath || null,
    };
    setPanes([...panes, newPane]);
    setSplitDirection(direction);
    setSplitRatio(50);
  };

  const handleClosePane = (paneId: string) => {
    if (panes.length <= 1) return;
    setPanes(panes.filter((p) => p.id !== paneId));
    setSplitDirection(null);
    if (activePane === paneId) {
      setActivePane(panes.find((p) => p.id !== paneId)?.id || '');
    }
  };

  const handlePaneFileChange = (paneId: string, filePath: string) => {
    setPanes(panes.map((p) => (p.id === paneId ? { ...p, filePath } : p)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let ratio: number;

      if (splitDirection === 'horizontal') {
        ratio = ((e.clientY - rect.top) / rect.height) * 100;
      } else {
        ratio = ((e.clientX - rect.left) / rect.width) * 100;
      }

      setSplitRatio(Math.min(Math.max(ratio, 20), 80));
    },
    [splitDirection]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const renderPane = (pane: EditorPane) => {
    const file = files.find((f) => f.path === pane.filePath);

    return (
      <div
        key={pane.id}
        className={`editor-pane ${activePane === pane.id ? 'active' : ''}`}
        onClick={() => setActivePane(pane.id)}
      >
        <div className="pane-header">
          <select
            value={pane.filePath || ''}
            onChange={(e) => handlePaneFileChange(pane.id, e.target.value)}
            className="pane-file-select"
          >
            <option value="">Select a file</option>
            {files.map((f) => (
              <option key={f.path} value={f.path}>
                {f.name}
              </option>
            ))}
          </select>
          {panes.length > 1 && (
            <button
              className="pane-close"
              onClick={() => handleClosePane(pane.id)}
            >
              ×
            </button>
          )}
        </div>
        <div className="pane-content">
          {file ? (
            <Editor
              key={file.path}
              filePath={file.path}
              content={file.content}
              settings={settings}
              onChange={(content) => onContentChange(file.path, content)}
              onSave={() => onSave(file.path)}
              onCursorChange={onCursorChange}
            />
          ) : (
            <div className="pane-empty">Select a file to edit</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="split-editor-container">
      <div className="split-actions">
        <button
          onClick={() => handleSplit('vertical')}
          disabled={panes.length >= 2}
          title="Split Right"
        >
          ⊞
        </button>
        <button
          onClick={() => handleSplit('horizontal')}
          disabled={panes.length >= 2}
          title="Split Down"
        >
          ⊟
        </button>
      </div>
      <div
        ref={containerRef}
        className={`split-editor ${splitDirection || ''}`}
        style={
          splitDirection
            ? {
                gridTemplateColumns:
                  splitDirection === 'vertical'
                    ? `${splitRatio}% 4px ${100 - splitRatio}%`
                    : '1fr',
                gridTemplateRows:
                  splitDirection === 'horizontal'
                    ? `${splitRatio}% 4px ${100 - splitRatio}%`
                    : '1fr',
              }
            : undefined
        }
      >
        {renderPane(panes[0])}
        {panes.length > 1 && splitDirection && (
          <>
            <div className="split-divider" onMouseDown={handleMouseDown} />
            {renderPane(panes[1])}
          </>
        )}
      </div>
    </div>
  );
}

export default SplitEditor;
