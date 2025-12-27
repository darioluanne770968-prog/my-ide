import React, { useState, useCallback, useRef, useEffect } from 'react';

interface SearchResult {
  filePath: string;
  fileName: string;
  matches: {
    line: number;
    column: number;
    text: string;
    matchStart: number;
    matchEnd: number;
  }[];
}

interface SearchProps {
  rootPath: string | null;
  onFileSelect: (filePath: string, fileName: string, line?: number) => void;
}

function Search({ rootPath, onFileSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'files' | 'content'>('content');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !rootPath) return;

    setIsSearching(true);
    setResults([]);

    try {
      if (searchType === 'files') {
        const files = await window.electronAPI.searchFiles(rootPath, query);
        setResults(files.map((f: string) => ({
          filePath: f,
          fileName: f.split('/').pop() || f,
          matches: [],
        })));
      } else {
        const searchResults = await window.electronAPI.searchInFiles(
          rootPath,
          query,
          { caseSensitive, useRegex }
        );
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [query, rootPath, searchType, caseSensitive, useRegex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const highlightMatch = (text: string, start: number, end: number) => {
    return (
      <>
        {text.substring(0, start)}
        <span className="search-highlight">{text.substring(start, end)}</span>
        {text.substring(end)}
      </>
    );
  };

  return (
    <div className="search-panel">
      <div className="search-header">
        <div className="search-input-container">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={searchType === 'files' ? 'Search files...' : 'Search in files...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-btn" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? '...' : '🔍'}
          </button>
        </div>
        <div className="search-options">
          <button
            className={`search-type-btn ${searchType === 'files' ? 'active' : ''}`}
            onClick={() => setSearchType('files')}
            title="Search file names"
          >
            📄
          </button>
          <button
            className={`search-type-btn ${searchType === 'content' ? 'active' : ''}`}
            onClick={() => setSearchType('content')}
            title="Search in file contents"
          >
            📝
          </button>
          <label className="search-option">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            Aa
          </label>
          <label className="search-option">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
            />
            .*
          </label>
        </div>
      </div>
      <div className="search-results">
        {results.length === 0 && query && !isSearching && (
          <div className="search-no-results">No results found</div>
        )}
        {results.map((result, idx) => (
          <div key={idx} className="search-result-item">
            <div
              className="search-result-file"
              onClick={() => onFileSelect(result.filePath, result.fileName)}
            >
              📄 {result.fileName}
              <span className="search-result-path">{result.filePath}</span>
            </div>
            {result.matches.map((match, matchIdx) => (
              <div
                key={matchIdx}
                className="search-result-match"
                onClick={() => onFileSelect(result.filePath, result.fileName, match.line)}
              >
                <span className="search-result-line">:{match.line}</span>
                <span className="search-result-text">
                  {highlightMatch(match.text, match.matchStart, match.matchEnd)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
