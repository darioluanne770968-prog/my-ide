import React, { useState, useEffect } from 'react';

interface Bookmark {
  id: string;
  filePath: string;
  fileName: string;
  line: number;
  content: string;
  label?: string;
}

interface BookmarksProps {
  bookmarks: Bookmark[];
  onNavigate: (filePath: string, line: number) => void;
  onRemove: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
}

function Bookmarks({ bookmarks, onNavigate, onRemove, onLabelChange }: BookmarksProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleStartEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setEditLabel(bookmark.label || '');
  };

  const handleSaveLabel = () => {
    if (editingId) {
      onLabelChange(editingId, editLabel);
      setEditingId(null);
      setEditLabel('');
    }
  };

  const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
    const file = bookmark.fileName;
    if (!acc[file]) {
      acc[file] = [];
    }
    acc[file].push(bookmark);
    return acc;
  }, {} as Record<string, Bookmark[]>);

  return (
    <div className="bookmarks-panel">
      <div className="bookmarks-header">
        <span>Bookmarks ({bookmarks.length})</span>
      </div>
      {bookmarks.length === 0 ? (
        <div className="bookmarks-empty">
          <p>No bookmarks yet</p>
          <p className="bookmarks-hint">Use Ctrl/Cmd + Shift + B to toggle a bookmark</p>
        </div>
      ) : (
        <div className="bookmarks-list">
          {Object.entries(groupedBookmarks).map(([fileName, fileBookmarks]) => (
            <div key={fileName} className="bookmarks-file-group">
              <div className="bookmarks-file-name">📄 {fileName}</div>
              {fileBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bookmark-item"
                  onClick={() => onNavigate(bookmark.filePath, bookmark.line)}
                >
                  <div className="bookmark-line-info">
                    <span className="bookmark-line">Line {bookmark.line}</span>
                    {editingId === bookmark.id ? (
                      <input
                        type="text"
                        className="bookmark-label-input"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onBlur={handleSaveLabel}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveLabel();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : bookmark.label ? (
                      <span
                        className="bookmark-label"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(bookmark);
                        }}
                      >
                        {bookmark.label}
                      </span>
                    ) : null}
                  </div>
                  <pre className="bookmark-content">{bookmark.content.trim()}</pre>
                  <div className="bookmark-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(bookmark);
                      }}
                      title="Edit label"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(bookmark.id);
                      }}
                      title="Remove bookmark"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmarks;
