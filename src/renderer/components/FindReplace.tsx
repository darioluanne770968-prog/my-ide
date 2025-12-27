import React, { useState, useEffect, useRef, useCallback } from 'react';

interface FindReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (query: string, options: FindOptions) => void;
  onReplace: (query: string, replacement: string, options: FindOptions) => void;
  onReplaceAll: (query: string, replacement: string, options: FindOptions) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  matchCount: number;
  currentMatch: number;
}

export interface FindOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

function FindReplace({
  isOpen,
  onClose,
  onFind,
  onReplace,
  onReplaceAll,
  onFindNext,
  onFindPrev,
  matchCount,
  currentMatch,
}: FindReplaceProps) {
  const [showReplace, setShowReplace] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [options, setOptions] = useState<FindOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      findInputRef.current?.focus();
      findInputRef.current?.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (findQuery) {
      onFind(findQuery, options);
    }
  }, [findQuery, options]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onFindPrev();
      } else {
        onFindNext();
      }
    }
  };

  const toggleOption = (key: keyof FindOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="find-replace-panel">
      <div className="find-replace-row">
        <button
          className="find-replace-toggle"
          onClick={() => setShowReplace(!showReplace)}
        >
          {showReplace ? '▼' : '▶'}
        </button>
        <div className="find-input-wrapper">
          <input
            ref={findInputRef}
            type="text"
            className="find-input"
            placeholder="Find"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="find-count">
            {findQuery ? `${currentMatch}/${matchCount}` : 'No results'}
          </span>
        </div>
        <div className="find-options">
          <button
            className={`find-option-btn ${options.caseSensitive ? 'active' : ''}`}
            onClick={() => toggleOption('caseSensitive')}
            title="Match Case"
          >
            Aa
          </button>
          <button
            className={`find-option-btn ${options.wholeWord ? 'active' : ''}`}
            onClick={() => toggleOption('wholeWord')}
            title="Match Whole Word"
          >
            ab
          </button>
          <button
            className={`find-option-btn ${options.useRegex ? 'active' : ''}`}
            onClick={() => toggleOption('useRegex')}
            title="Use Regular Expression"
          >
            .*
          </button>
        </div>
        <div className="find-actions">
          <button onClick={onFindPrev} title="Previous Match (Shift+Enter)">
            ↑
          </button>
          <button onClick={onFindNext} title="Next Match (Enter)">
            ↓
          </button>
        </div>
        <button className="find-close" onClick={onClose}>
          ×
        </button>
      </div>
      {showReplace && (
        <div className="find-replace-row">
          <div className="find-replace-spacer" />
          <input
            type="text"
            className="find-input replace-input"
            placeholder="Replace"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="replace-actions">
            <button
              onClick={() => onReplace(findQuery, replaceQuery, options)}
              title="Replace"
            >
              Replace
            </button>
            <button
              onClick={() => onReplaceAll(findQuery, replaceQuery, options)}
              title="Replace All"
            >
              All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindReplace;
