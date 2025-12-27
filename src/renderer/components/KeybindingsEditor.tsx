import { useState, useEffect, useCallback } from 'react';

export interface Keybinding {
  id: string;
  command: string;
  key: string;
  when?: string;
  description?: string;
  source: 'default' | 'user';
}

interface KeybindingsEditorProps {
  keybindings: Keybinding[];
  onKeybindingChange: (keybindings: Keybinding[]) => void;
  onClose: () => void;
}

function KeybindingsEditor({
  keybindings,
  onKeybindingChange,
  onClose
}: KeybindingsEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState(false);
  const [recordedKey, setRecordedKey] = useState('');
  const [filter, setFilter] = useState<'all' | 'modified' | 'default'>('all');

  const formatKey = useCallback((e: KeyboardEvent): string => {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    const key = e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      if (key === ' ') {
        parts.push('Space');
      } else if (key.length === 1) {
        parts.push(key.toUpperCase());
      } else {
        parts.push(key);
      }
    }

    return parts.join('+');
  }, []);

  useEffect(() => {
    if (!recordingKeys) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const formatted = formatKey(e);
      if (formatted && !['Ctrl', 'Alt', 'Shift'].includes(formatted)) {
        setRecordedKey(formatted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordingKeys, formatKey]);

  const filteredKeybindings = keybindings.filter(kb => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!kb.command.toLowerCase().includes(query) &&
          !kb.key.toLowerCase().includes(query) &&
          !kb.description?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filter === 'modified' && kb.source !== 'user') return false;
    if (filter === 'default' && kb.source !== 'default') return false;
    return true;
  });

  const handleStartEdit = (kb: Keybinding) => {
    setEditingId(kb.id);
    setRecordedKey(kb.key);
    setRecordingKeys(false);
  };

  const handleStartRecording = () => {
    setRecordingKeys(true);
    setRecordedKey('');
  };

  const handleSaveKeybinding = () => {
    if (!editingId || !recordedKey) return;

    // Check for conflicts
    const conflict = keybindings.find(kb => kb.id !== editingId && kb.key === recordedKey);
    if (conflict) {
      if (!confirm(`This key is already bound to "${conflict.command}". Override?`)) {
        return;
      }
    }

    const updated = keybindings.map(kb =>
      kb.id === editingId
        ? { ...kb, key: recordedKey, source: 'user' as const }
        : kb
    );
    onKeybindingChange(updated);
    setEditingId(null);
    setRecordingKeys(false);
  };

  const handleResetKeybinding = (kb: Keybinding) => {
    // Would reset to default - for now just mark as default
    const updated = keybindings.map(k =>
      k.id === kb.id ? { ...k, source: 'default' as const } : k
    );
    onKeybindingChange(updated);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRecordingKeys(false);
    setRecordedKey('');
  };

  const handleRemoveKeybinding = (kb: Keybinding) => {
    const updated = keybindings.map(k =>
      k.id === kb.id ? { ...k, key: '', source: 'user' as const } : k
    );
    onKeybindingChange(updated);
  };

  const renderKeyDisplay = (key: string) => {
    if (!key) return <span className="key-unbound">Unbound</span>;

    return (
      <div className="key-display">
        {key.split('+').map((part, i) => (
          <span key={i}>
            <kbd>{part}</kbd>
            {i < key.split('+').length - 1 && <span className="key-plus">+</span>}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="keybindings-editor">
      <div className="keybindings-header">
        <h3>Keyboard Shortcuts</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="keybindings-toolbar">
        <input
          type="text"
          placeholder="Search keybindings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="keybindings-search"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="keybindings-filter"
        >
          <option value="all">All</option>
          <option value="modified">Modified</option>
          <option value="default">Default</option>
        </select>
      </div>

      <div className="keybindings-table">
        <div className="keybindings-table-header">
          <span className="col-command">Command</span>
          <span className="col-keybinding">Keybinding</span>
          <span className="col-when">When</span>
          <span className="col-source">Source</span>
          <span className="col-actions">Actions</span>
        </div>

        <div className="keybindings-table-body">
          {filteredKeybindings.map(kb => (
            <div
              key={kb.id}
              className={`keybinding-row ${editingId === kb.id ? 'editing' : ''} ${kb.source === 'user' ? 'modified' : ''}`}
            >
              <div className="col-command">
                <span className="command-name">{kb.command}</span>
                {kb.description && (
                  <span className="command-description">{kb.description}</span>
                )}
              </div>

              <div className="col-keybinding">
                {editingId === kb.id ? (
                  <div className="keybinding-edit">
                    <div
                      className={`key-recorder ${recordingKeys ? 'recording' : ''}`}
                      onClick={handleStartRecording}
                    >
                      {recordingKeys ? (
                        <span className="recording-text">
                          {recordedKey || 'Press keys...'}
                        </span>
                      ) : (
                        renderKeyDisplay(recordedKey)
                      )}
                    </div>
                    <div className="edit-actions">
                      <button onClick={handleSaveKeybinding} className="save-btn">✓</button>
                      <button onClick={handleCancelEdit} className="cancel-btn">×</button>
                    </div>
                  </div>
                ) : (
                  <div className="keybinding-display" onDoubleClick={() => handleStartEdit(kb)}>
                    {renderKeyDisplay(kb.key)}
                  </div>
                )}
              </div>

              <div className="col-when">
                {kb.when && <code>{kb.when}</code>}
              </div>

              <div className="col-source">
                <span className={`source-badge ${kb.source}`}>
                  {kb.source === 'user' ? 'User' : 'Default'}
                </span>
              </div>

              <div className="col-actions">
                <button
                  onClick={() => handleStartEdit(kb)}
                  className="action-btn"
                  title="Edit"
                >
                  ✏️
                </button>
                {kb.source === 'user' && (
                  <button
                    onClick={() => handleResetKeybinding(kb)}
                    className="action-btn"
                    title="Reset to default"
                  >
                    ↺
                  </button>
                )}
                <button
                  onClick={() => handleRemoveKeybinding(kb)}
                  className="action-btn"
                  title="Remove keybinding"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="keybindings-footer">
        <span className="keybindings-hint">
          Double-click on a keybinding to edit. Press the keys you want to assign.
        </span>
      </div>
    </div>
  );
}

export const defaultKeybindings: Keybinding[] = [
  { id: 'cmd-palette', command: 'workbench.action.showCommands', key: 'Ctrl+Shift+P', description: 'Show Command Palette', source: 'default' },
  { id: 'quick-open', command: 'workbench.action.quickOpen', key: 'Ctrl+P', description: 'Quick Open File', source: 'default' },
  { id: 'find', command: 'actions.find', key: 'Ctrl+F', description: 'Find', source: 'default' },
  { id: 'replace', command: 'editor.action.startFindReplaceAction', key: 'Ctrl+H', description: 'Replace', source: 'default' },
  { id: 'save', command: 'workbench.action.files.save', key: 'Ctrl+S', description: 'Save File', source: 'default' },
  { id: 'save-all', command: 'workbench.action.files.saveAll', key: 'Ctrl+Shift+S', description: 'Save All', source: 'default' },
  { id: 'undo', command: 'undo', key: 'Ctrl+Z', description: 'Undo', source: 'default' },
  { id: 'redo', command: 'redo', key: 'Ctrl+Shift+Z', description: 'Redo', source: 'default' },
  { id: 'cut', command: 'editor.action.clipboardCutAction', key: 'Ctrl+X', description: 'Cut', source: 'default' },
  { id: 'copy', command: 'editor.action.clipboardCopyAction', key: 'Ctrl+C', description: 'Copy', source: 'default' },
  { id: 'paste', command: 'editor.action.clipboardPasteAction', key: 'Ctrl+V', description: 'Paste', source: 'default' },
  { id: 'select-all', command: 'editor.action.selectAll', key: 'Ctrl+A', description: 'Select All', source: 'default' },
  { id: 'toggle-terminal', command: 'workbench.action.terminal.toggleTerminal', key: 'Ctrl+`', description: 'Toggle Terminal', source: 'default' },
  { id: 'toggle-sidebar', command: 'workbench.action.toggleSidebarVisibility', key: 'Ctrl+B', description: 'Toggle Sidebar', source: 'default' },
  { id: 'go-to-line', command: 'workbench.action.gotoLine', key: 'Ctrl+G', description: 'Go to Line', source: 'default' },
  { id: 'go-to-definition', command: 'editor.action.goToDefinition', key: 'F12', description: 'Go to Definition', source: 'default' },
  { id: 'peek-definition', command: 'editor.action.peekDefinition', key: 'Alt+F12', description: 'Peek Definition', source: 'default' },
  { id: 'find-references', command: 'editor.action.findReferences', key: 'Shift+F12', description: 'Find All References', source: 'default' },
  { id: 'rename-symbol', command: 'editor.action.rename', key: 'F2', description: 'Rename Symbol', source: 'default' },
  { id: 'format-document', command: 'editor.action.formatDocument', key: 'Shift+Alt+F', description: 'Format Document', source: 'default' },
  { id: 'toggle-comment', command: 'editor.action.commentLine', key: 'Ctrl+/', description: 'Toggle Line Comment', source: 'default' },
  { id: 'indent-line', command: 'editor.action.indentLines', key: 'Ctrl+]', description: 'Indent Line', source: 'default' },
  { id: 'outdent-line', command: 'editor.action.outdentLines', key: 'Ctrl+[', description: 'Outdent Line', source: 'default' },
  { id: 'move-line-up', command: 'editor.action.moveLinesUpAction', key: 'Alt+Up', description: 'Move Line Up', source: 'default' },
  { id: 'move-line-down', command: 'editor.action.moveLinesDownAction', key: 'Alt+Down', description: 'Move Line Down', source: 'default' },
  { id: 'duplicate-line', command: 'editor.action.copyLinesDownAction', key: 'Shift+Alt+Down', description: 'Duplicate Line', source: 'default' },
  { id: 'delete-line', command: 'editor.action.deleteLines', key: 'Ctrl+Shift+K', description: 'Delete Line', source: 'default' },
  { id: 'add-cursor-above', command: 'editor.action.insertCursorAbove', key: 'Ctrl+Alt+Up', description: 'Add Cursor Above', source: 'default' },
  { id: 'add-cursor-below', command: 'editor.action.insertCursorBelow', key: 'Ctrl+Alt+Down', description: 'Add Cursor Below', source: 'default' },
  { id: 'select-next-match', command: 'editor.action.addSelectionToNextFindMatch', key: 'Ctrl+D', description: 'Select Next Match', source: 'default' },
  { id: 'zen-mode', command: 'workbench.action.toggleZenMode', key: 'Ctrl+K Z', description: 'Toggle Zen Mode', source: 'default' }
];

export default KeybindingsEditor;
