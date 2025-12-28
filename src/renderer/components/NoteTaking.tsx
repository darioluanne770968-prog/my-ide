import { useState } from 'react';

interface NoteTakingProps {
  onClose: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export default function NoteTaking({ onClose }: NoteTakingProps) {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [folders] = useState<Folder[]>([
    { id: 'all', name: 'All Notes', icon: '📝', count: 12 },
    { id: 'code', name: 'Code Snippets', icon: '💻', count: 5 },
    { id: 'ideas', name: 'Ideas', icon: '💡', count: 3 },
    { id: 'todos', name: 'To-Do', icon: '✅', count: 2 },
    { id: 'archive', name: 'Archive', icon: '📦', count: 2 }
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'API Design Notes',
      content: '# API Design\n\n## Endpoints\n- GET /users\n- POST /users\n- PUT /users/:id\n\n## Authentication\nUse JWT tokens for auth.\n\n```javascript\nconst token = jwt.sign({ userId }, secret);\n```',
      folder: 'code',
      tags: ['api', 'design'],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000),
      pinned: true
    },
    {
      id: '2',
      title: 'React Hooks Cheatsheet',
      content: '# React Hooks\n\n## useState\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n```jsx\nuseEffect(() => {\n  // side effect\n  return () => cleanup();\n}, [deps]);\n```\n\n## useCallback\nMemoize functions.',
      folder: 'code',
      tags: ['react', 'hooks'],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 86400000),
      pinned: true
    },
    {
      id: '3',
      title: 'Feature Ideas',
      content: '# Feature Ideas\n\n1. Dark mode toggle\n2. Keyboard shortcuts\n3. Plugin system\n4. AI code suggestions\n5. Real-time collaboration',
      folder: 'ideas',
      tags: ['features', 'roadmap'],
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 172800000),
      pinned: false
    },
    {
      id: '4',
      title: 'Meeting Notes - Sprint Planning',
      content: '# Sprint Planning\n\nDate: 2024-01-15\n\n## Goals\n- Complete user authentication\n- Fix critical bugs\n- Improve performance\n\n## Action Items\n- [ ] Review PRs\n- [ ] Update docs\n- [ ] Deploy to staging',
      folder: 'todos',
      tags: ['meeting', 'sprint'],
      createdAt: new Date(Date.now() - 345600000),
      updatedAt: new Date(Date.now() - 259200000),
      pinned: false
    }
  ]);

  const filteredNotes = notes.filter(note => {
    if (selectedFolder !== 'all' && note.folder !== selectedFolder) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return note.title.toLowerCase().includes(term) ||
             note.content.toLowerCase().includes(term) ||
             note.tags.some(t => t.includes(term));
    }
    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      folder: selectedFolder === 'all' ? 'ideas' : selectedFolder,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  const updateNote = (updates: Partial<Note>) => {
    if (!selectedNote) return;
    setNotes(prev => prev.map(n =>
      n.id === selectedNote.id ? { ...n, ...updates, updatedAt: new Date() } : n
    ));
    setSelectedNote(prev => prev ? { ...prev, ...updates } : null);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const togglePin = (noteId: string) => {
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, pinned: !n.pinned } : n
    ));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="note-taking">
      <div className="notes-header">
        <h3>Notes</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="notes-content">
        <div className="sidebar">
          <button className="new-note-btn" onClick={createNote}>
            + New Note
          </button>

          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="folders-list">
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`folder-item ${selectedFolder === folder.id ? 'selected' : ''}`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <span className="folder-icon">{folder.icon}</span>
                <span className="folder-name">{folder.name}</span>
                <span className="folder-count">{folder.count}</span>
              </div>
            ))}
          </div>

          <div className="tags-section">
            <div className="section-title">Tags</div>
            <div className="tags-list">
              {['api', 'react', 'hooks', 'features', 'design'].map(tag => (
                <span key={tag} className="tag" onClick={() => setSearchTerm(tag)}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="notes-list">
          <div className="list-header">
            <span>{filteredNotes.length} notes</span>
            <select className="sort-select">
              <option value="updated">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="notes-items">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => { setSelectedNote(note); setIsEditing(false); }}
              >
                {note.pinned && <span className="pin-icon">📌</span>}
                <div className="note-preview">
                  <div className="note-title">{note.title}</div>
                  <div className="note-excerpt">
                    {note.content.replace(/[#*`]/g, '').substring(0, 100)}...
                  </div>
                  <div className="note-meta">
                    <span className="note-date">{formatDate(note.updatedAt)}</span>
                    {note.tags.length > 0 && (
                      <span className="note-tags">
                        {note.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="note-editor">
          {selectedNote ? (
            <>
              <div className="editor-header">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNote({ title: e.target.value })}
                  className="title-input"
                />
                <div className="editor-actions">
                  <button
                    className={`action-btn ${selectedNote.pinned ? 'active' : ''}`}
                    onClick={() => togglePin(selectedNote.id)}
                    title="Pin note"
                  >
                    📌
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? '👁️' : '✏️'}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteNote(selectedNote.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="editor-meta">
                <span>Created: {selectedNote.createdAt.toLocaleDateString()}</span>
                <span>Modified: {selectedNote.updatedAt.toLocaleDateString()}</span>
              </div>

              <div className="editor-tags">
                {selectedNote.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  className="tag-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      updateNote({ tags: [...selectedNote.tags, e.currentTarget.value] });
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              {isEditing ? (
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateNote({ content: e.target.value })}
                  className="content-editor"
                  placeholder="Write your note in Markdown..."
                />
              ) : (
                <div className="content-preview">
                  <pre>{selectedNote.content}</pre>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .note-taking {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .notes-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .notes-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 200px;
          border-right: 1px solid var(--border-color);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .new-note-btn {
          width: 100%;
          padding: 10px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .search-input {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 12px;
        }
        .folders-list {
          flex: 1;
          overflow-y: auto;
        }
        .folder-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .folder-item:hover { background: var(--bg-secondary); }
        .folder-item.selected { background: var(--bg-secondary); color: var(--accent-color); }
        .folder-name { flex: 1; }
        .folder-count { font-size: 11px; color: var(--text-tertiary); }
        .section-title {
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          padding: 2px 8px;
          background: var(--bg-secondary);
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          color: var(--accent-color);
        }
        .notes-list {
          width: 280px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          color: var(--text-secondary);
        }
        .sort-select {
          padding: 4px 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 11px;
        }
        .notes-items {
          flex: 1;
          overflow-y: auto;
        }
        .note-item {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          position: relative;
        }
        .note-item:hover { background: var(--bg-secondary); }
        .note-item.selected { background: rgba(52, 152, 219, 0.1); border-left: 2px solid var(--accent-color); }
        .pin-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 12px;
        }
        .note-title { font-weight: 500; font-size: 13px; margin-bottom: 4px; }
        .note-excerpt {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .note-meta {
          display: flex;
          gap: 8px;
          font-size: 10px;
          color: var(--text-tertiary);
        }
        .note-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .title-input {
          flex: 1;
          padding: 8px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 600;
        }
        .title-input:focus { outline: none; }
        .editor-actions { display: flex; gap: 4px; }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          font-size: 14px;
          opacity: 0.6;
          border-radius: 4px;
        }
        .action-btn:hover { opacity: 1; background: var(--bg-secondary); }
        .action-btn.active { opacity: 1; }
        .action-btn.delete:hover { color: #e74c3c; }
        .editor-meta {
          display: flex;
          gap: 16px;
          padding: 8px 12px;
          font-size: 11px;
          color: var(--text-tertiary);
          border-bottom: 1px solid var(--border-color);
        }
        .editor-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .tag-input {
          padding: 2px 8px;
          background: transparent;
          border: 1px dashed var(--border-color);
          border-radius: 3px;
          color: var(--text-primary);
          font-size: 11px;
          width: 80px;
        }
        .content-editor {
          flex: 1;
          padding: 16px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: monospace;
          font-size: 13px;
          line-height: 1.6;
          resize: none;
        }
        .content-editor:focus { outline: none; }
        .content-preview {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }
        .content-preview pre {
          margin: 0;
          font-family: inherit;
          white-space: pre-wrap;
          line-height: 1.6;
          font-size: 13px;
        }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
      `}</style>
    </div>
  );
}
