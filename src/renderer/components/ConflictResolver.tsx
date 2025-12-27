import React, { useState } from 'react';

interface ConflictSection {
  id: string;
  startLine: number;
  endLine: number;
  ours: string;
  theirs: string;
  base?: string;
  resolved?: 'ours' | 'theirs' | 'both' | 'custom';
  customResolution?: string;
}

interface ConflictResolverProps {
  filePath: string;
  content: string;
  onResolve: (resolvedContent: string) => void;
  onClose: () => void;
}

function ConflictResolver({ filePath, content, onResolve, onClose }: ConflictResolverProps) {
  const [conflicts, setConflicts] = useState<ConflictSection[]>(() => parseConflicts(content));
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  function parseConflicts(text: string): ConflictSection[] {
    const lines = text.split('\n');
    const conflicts: ConflictSection[] = [];
    let currentConflict: Partial<ConflictSection> | null = null;
    let section: 'ours' | 'theirs' | null = null;
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('<<<<<<<')) {
        currentConflict = {
          id: `conflict-${conflicts.length}`,
          startLine: i + 1,
          ours: '',
          theirs: ''
        };
        section = 'ours';
      } else if (line.startsWith('=======') && currentConflict) {
        section = 'theirs';
      } else if (line.startsWith('>>>>>>>') && currentConflict) {
        currentConflict.endLine = i + 1;
        conflicts.push(currentConflict as ConflictSection);
        currentConflict = null;
        section = null;
      } else if (currentConflict && section) {
        if (section === 'ours') {
          currentConflict.ours = (currentConflict.ours || '') + (currentConflict.ours ? '\n' : '') + line;
        } else {
          currentConflict.theirs = (currentConflict.theirs || '') + (currentConflict.theirs ? '\n' : '') + line;
        }
      }
    }

    return conflicts;
  }

  const resolveConflict = (conflictId: string, resolution: 'ours' | 'theirs' | 'both' | 'custom', customContent?: string) => {
    setConflicts(prev => prev.map(c =>
      c.id === conflictId
        ? { ...c, resolved: resolution, customResolution: customContent }
        : c
    ));
  };

  const applyResolutions = () => {
    const lines = content.split('\n');
    let result: string[] = [];
    let skipUntil = -1;

    for (let i = 0; i < lines.length; i++) {
      if (i <= skipUntil) continue;

      const conflict = conflicts.find(c => c.startLine === i + 1);
      if (conflict) {
        let resolvedText = '';
        switch (conflict.resolved) {
          case 'ours':
            resolvedText = conflict.ours;
            break;
          case 'theirs':
            resolvedText = conflict.theirs;
            break;
          case 'both':
            resolvedText = conflict.ours + '\n' + conflict.theirs;
            break;
          case 'custom':
            resolvedText = conflict.customResolution || '';
            break;
          default:
            // Keep conflict markers if not resolved
            result.push(lines[i]);
            continue;
        }
        result.push(...resolvedText.split('\n'));
        skipUntil = conflict.endLine - 1;
      } else {
        result.push(lines[i]);
      }
    }

    onResolve(result.join('\n'));
    onClose();
  };

  const unresolvedCount = conflicts.filter(c => !c.resolved).length;
  const fileName = filePath.split('/').pop();

  return (
    <div className="conflict-resolver">
      <div className="resolver-header">
        <h3>Resolve Conflicts: {fileName}</h3>
        <div className="resolver-actions">
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)}>
            <option value="split">Split View</option>
            <option value="unified">Unified View</option>
          </select>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="resolver-toolbar">
        <span className="conflict-count">
          {unresolvedCount} of {conflicts.length} conflicts remaining
        </span>
        <div className="bulk-actions">
          <button onClick={() => conflicts.forEach(c => resolveConflict(c.id, 'ours'))}>
            Accept All Ours
          </button>
          <button onClick={() => conflicts.forEach(c => resolveConflict(c.id, 'theirs'))}>
            Accept All Theirs
          </button>
        </div>
      </div>

      <div className="conflicts-list">
        {conflicts.map((conflict, index) => (
          <div key={conflict.id} className={`conflict-item ${conflict.resolved ? 'resolved' : ''}`}>
            <div className="conflict-header">
              <span className="conflict-number">Conflict {index + 1}</span>
              <span className="conflict-lines">Lines {conflict.startLine}-{conflict.endLine}</span>
              {conflict.resolved && (
                <span className="resolution-badge">
                  Resolved: {conflict.resolved}
                </span>
              )}
            </div>

            {viewMode === 'split' ? (
              <div className="conflict-split-view">
                <div className="conflict-side ours">
                  <div className="side-header">
                    <span>Ours (Current)</span>
                    <button
                      onClick={() => resolveConflict(conflict.id, 'ours')}
                      className={conflict.resolved === 'ours' ? 'active' : ''}
                    >
                      Accept
                    </button>
                  </div>
                  <pre className="conflict-code">{conflict.ours}</pre>
                </div>

                <div className="conflict-side theirs">
                  <div className="side-header">
                    <span>Theirs (Incoming)</span>
                    <button
                      onClick={() => resolveConflict(conflict.id, 'theirs')}
                      className={conflict.resolved === 'theirs' ? 'active' : ''}
                    >
                      Accept
                    </button>
                  </div>
                  <pre className="conflict-code">{conflict.theirs}</pre>
                </div>
              </div>
            ) : (
              <div className="conflict-unified-view">
                <div className="unified-section ours">
                  <span className="section-marker">- Ours</span>
                  <pre>{conflict.ours}</pre>
                </div>
                <div className="unified-section theirs">
                  <span className="section-marker">+ Theirs</span>
                  <pre>{conflict.theirs}</pre>
                </div>
              </div>
            )}

            <div className="conflict-actions">
              <button
                onClick={() => resolveConflict(conflict.id, 'ours')}
                className={conflict.resolved === 'ours' ? 'active' : ''}
              >
                Accept Ours
              </button>
              <button
                onClick={() => resolveConflict(conflict.id, 'theirs')}
                className={conflict.resolved === 'theirs' ? 'active' : ''}
              >
                Accept Theirs
              </button>
              <button
                onClick={() => resolveConflict(conflict.id, 'both')}
                className={conflict.resolved === 'both' ? 'active' : ''}
              >
                Accept Both
              </button>
              <button
                onClick={() => {
                  const custom = prompt('Enter custom resolution:', conflict.ours);
                  if (custom !== null) {
                    resolveConflict(conflict.id, 'custom', custom);
                  }
                }}
                className={conflict.resolved === 'custom' ? 'active' : ''}
              >
                Custom
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="resolver-footer">
        <button onClick={onClose} className="cancel-btn">Cancel</button>
        <button
          onClick={applyResolutions}
          disabled={unresolvedCount > 0}
          className="apply-btn"
        >
          {unresolvedCount > 0
            ? `Resolve ${unresolvedCount} remaining conflicts`
            : 'Apply Resolutions'
          }
        </button>
      </div>
    </div>
  );
}

export default ConflictResolver;
