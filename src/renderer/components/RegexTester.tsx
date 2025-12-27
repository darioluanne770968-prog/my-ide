import React, { useState, useEffect } from 'react';

interface Match {
  index: number;
  text: string;
  groups: Record<string, string>;
}

interface RegexTesterProps {
  onClose: () => void;
  onInsert?: (pattern: string) => void;
}

function RegexTester({ onClose, onInsert }: RegexTesterProps) {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [replacement, setReplacement] = useState('');
  const [replacedText, setReplacedText] = useState('');
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const savedPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+' },
    { name: 'Phone', pattern: '\\+?[0-9]{1,3}[-.\\s]?\\(?[0-9]{1,4}\\)?[-.\\s]?[0-9]{1,4}[-.\\s]?[0-9]{1,9}' },
    { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { name: 'Hex Color', pattern: '#[0-9a-fA-F]{6}\\b' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  ];

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testString]);

  useEffect(() => {
    if (replacement && pattern && testString) {
      try {
        const regex = new RegExp(pattern, flags);
        setReplacedText(testString.replace(regex, replacement));
      } catch {
        setReplacedText('');
      }
    } else {
      setReplacedText('');
    }
  }, [pattern, flags, testString, replacement]);

  const testRegex = () => {
    setError(null);
    setMatches([]);

    if (!pattern || !testString) return;

    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches: Match[] = [];

      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            index: match.index,
            text: match[0],
            groups: match.groups || {}
          });
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            index: match.index,
            text: match[0],
            groups: match.groups || {}
          });
        }
      }

      setMatches(foundMatches);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const highlightMatches = () => {
    if (!pattern || !testString || matches.length === 0) {
      return <span>{testString}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${i}`}>{testString.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <mark key={`match-${i}`} className="regex-match" title={`Match ${i + 1}`}>
          {match.text}
        </mark>
      );
      lastIndex = match.index + match.text.length;
    });

    if (lastIndex < testString.length) {
      parts.push(<span key="text-last">{testString.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  const loadPattern = (p: string) => {
    setPattern(p);
  };

  return (
    <div className="regex-tester">
      <div className="regex-header">
        <h3>Regex Tester</h3>
        <div className="header-actions">
          <button onClick={() => setShowCheatsheet(!showCheatsheet)}>
            📖 Cheatsheet
          </button>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="regex-content">
        <div className="regex-input-section">
          <div className="pattern-input">
            <label>Pattern</label>
            <div className="pattern-field">
              <span className="pattern-delim">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                spellCheck={false}
              />
              <span className="pattern-delim">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="flags-input"
                placeholder="flags"
              />
            </div>
          </div>

          <div className="flags-toggles">
            <label>
              <input type="checkbox" checked={flags.includes('g')} onChange={() => toggleFlag('g')} />
              Global (g)
            </label>
            <label>
              <input type="checkbox" checked={flags.includes('i')} onChange={() => toggleFlag('i')} />
              Case Insensitive (i)
            </label>
            <label>
              <input type="checkbox" checked={flags.includes('m')} onChange={() => toggleFlag('m')} />
              Multiline (m)
            </label>
            <label>
              <input type="checkbox" checked={flags.includes('s')} onChange={() => toggleFlag('s')} />
              Dotall (s)
            </label>
          </div>

          {error && <div className="regex-error">{error}</div>}

          <div className="saved-patterns">
            <label>Common Patterns:</label>
            <div className="patterns-list">
              {savedPatterns.map(p => (
                <button key={p.name} onClick={() => loadPattern(p.pattern)}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="test-section">
          <label>Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            rows={5}
          />
        </div>

        <div className="results-section">
          <div className="matches-info">
            <span className="match-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
          </div>

          <div className="highlighted-text">
            {highlightMatches()}
          </div>

          {matches.length > 0 && (
            <div className="matches-list">
              <h4>Matches</h4>
              {matches.map((match, i) => (
                <div key={i} className="match-item">
                  <span className="match-index">#{i + 1}</span>
                  <span className="match-text">"{match.text}"</span>
                  <span className="match-position">at index {match.index}</span>
                  {Object.keys(match.groups).length > 0 && (
                    <div className="match-groups">
                      Groups: {JSON.stringify(match.groups)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="replace-section">
          <label>Replace With</label>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Replacement text ($1, $2 for groups)..."
          />
          {replacedText && (
            <div className="replaced-result">
              <label>Result:</label>
              <pre>{replacedText}</pre>
            </div>
          )}
        </div>

        {showCheatsheet && (
          <div className="cheatsheet">
            <h4>Regex Cheatsheet</h4>
            <div className="cheatsheet-grid">
              <div><code>.</code> Any character</div>
              <div><code>\d</code> Digit [0-9]</div>
              <div><code>\w</code> Word char [a-zA-Z0-9_]</div>
              <div><code>\s</code> Whitespace</div>
              <div><code>^</code> Start of string</div>
              <div><code>$</code> End of string</div>
              <div><code>*</code> 0 or more</div>
              <div><code>+</code> 1 or more</div>
              <div><code>?</code> 0 or 1</div>
              <div><code>{'{n}'}</code> Exactly n</div>
              <div><code>{'{n,m}'}</code> Between n and m</div>
              <div><code>[abc]</code> Character class</div>
              <div><code>[^abc]</code> Negated class</div>
              <div><code>(abc)</code> Capture group</div>
              <div><code>(?:abc)</code> Non-capture group</div>
              <div><code>a|b</code> Alternation</div>
            </div>
          </div>
        )}
      </div>

      <div className="regex-actions">
        {onInsert && (
          <button onClick={() => onInsert(pattern)} disabled={!pattern || !!error}>
            Insert Pattern
          </button>
        )}
        <button onClick={() => navigator.clipboard.writeText(`/${pattern}/${flags}`)}>
          📋 Copy
        </button>
      </div>
    </div>
  );
}

export default RegexTester;
