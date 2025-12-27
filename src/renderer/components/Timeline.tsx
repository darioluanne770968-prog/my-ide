import { useState, useEffect } from 'react';

export interface TimelineEntry {
  id: string;
  type: 'git' | 'save' | 'external';
  timestamp: number;
  label: string;
  description?: string;
  hash?: string;
  author?: string;
}

interface TimelineProps {
  filePath: string;
  entries: TimelineEntry[];
  onSelectEntry: (entry: TimelineEntry) => void;
  onCompare: (entry1: TimelineEntry, entry2: TimelineEntry) => void;
  onRestore: (entry: TimelineEntry) => void;
}

function Timeline({ filePath, entries, onSelectEntry, onCompare, onRestore }: TimelineProps) {
  const [filter, setFilter] = useState<'all' | 'git' | 'save'>('all');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const filteredEntries = entries.filter(e => {
    if (filter === 'git') return e.type === 'git';
    if (filter === 'save') return e.type === 'save';
    return true;
  });

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimelineEntry[]>);

  // Auto-expand today's entries
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setExpandedDates(new Set([today]));
  }, []);

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleEntryClick = (entry: TimelineEntry, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select for comparison
      if (selectedEntries.includes(entry.id)) {
        setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
      } else if (selectedEntries.length < 2) {
        setSelectedEntries([...selectedEntries, entry.id]);
      } else {
        setSelectedEntries([selectedEntries[1], entry.id]);
      }
    } else {
      setSelectedEntries([entry.id]);
      onSelectEntry(entry);
    }
  };

  const handleCompare = () => {
    if (selectedEntries.length === 2) {
      const entry1 = entries.find(e => e.id === selectedEntries[0]);
      const entry2 = entries.find(e => e.id === selectedEntries[1]);
      if (entry1 && entry2) {
        onCompare(entry1, entry2);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getEntryIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'git': return '⚡';
      case 'save': return '💾';
      case 'external': return '📝';
    }
  };

  return (
    <div className="timeline-panel">
      <div className="timeline-header">
        <h4>Timeline</h4>
        <div className="timeline-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="timeline-filter"
          >
            <option value="all">All</option>
            <option value="git">Git Commits</option>
            <option value="save">Local Saves</option>
          </select>
          <button
            onClick={handleCompare}
            disabled={selectedEntries.length !== 2}
            className="timeline-compare-btn"
            title="Compare selected versions"
          >
            Compare
          </button>
        </div>
      </div>

      <div className="timeline-file">
        <span className="timeline-file-icon">📄</span>
        <span className="timeline-file-name">{filePath.split('/').pop()}</span>
      </div>

      <div className="timeline-content">
        {Object.entries(groupedEntries).length === 0 ? (
          <div className="timeline-empty">No history for this file</div>
        ) : (
          Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date} className="timeline-date-group">
              <div
                className="timeline-date-header"
                onClick={() => toggleDate(date)}
              >
                <span className="timeline-expand">
                  {expandedDates.has(date) ? '▼' : '▶'}
                </span>
                <span className="timeline-date">{date}</span>
                <span className="timeline-date-count">{dateEntries.length}</span>
              </div>

              {expandedDates.has(date) && (
                <div className="timeline-entries">
                  {dateEntries.map(entry => (
                    <div
                      key={entry.id}
                      className={`timeline-entry ${selectedEntries.includes(entry.id) ? 'selected' : ''}`}
                      onClick={(e) => handleEntryClick(entry, e)}
                    >
                      <div className="timeline-entry-icon">{getEntryIcon(entry.type)}</div>
                      <div className="timeline-entry-content">
                        <div className="timeline-entry-label">{entry.label}</div>
                        {entry.description && (
                          <div className="timeline-entry-description">{entry.description}</div>
                        )}
                        <div className="timeline-entry-meta">
                          <span className="timeline-entry-time">{formatTime(entry.timestamp)}</span>
                          {entry.author && (
                            <span className="timeline-entry-author">{entry.author}</span>
                          )}
                          {entry.hash && (
                            <span className="timeline-entry-hash">{entry.hash.substring(0, 7)}</span>
                          )}
                        </div>
                      </div>
                      <div className="timeline-entry-actions">
                        <button
                          onClick={(e) => { e.stopPropagation(); onRestore(entry); }}
                          className="timeline-restore-btn"
                          title="Restore this version"
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedEntries.length > 0 && (
        <div className="timeline-selection-info">
          {selectedEntries.length === 1 && (
            <span>1 version selected</span>
          )}
          {selectedEntries.length === 2 && (
            <span>2 versions selected - Click Compare to diff</span>
          )}
        </div>
      )}
    </div>
  );
}

export default Timeline;
