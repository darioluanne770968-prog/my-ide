import React, { useState, useEffect, useRef } from 'react';

interface ScopeInfo {
  name: string;
  type: 'function' | 'class' | 'method' | 'block' | 'namespace';
  startLine: number;
  endLine: number;
}

interface StickyScrollProps {
  content: string;
  language: string;
  currentLine: number;
  onNavigate: (line: number) => void;
  maxLines?: number;
}

function StickyScroll({ content, language, currentLine, onNavigate, maxLines = 3 }: StickyScrollProps) {
  const [scopes, setScopes] = useState<ScopeInfo[]>([]);
  const [visibleScopes, setVisibleScopes] = useState<ScopeInfo[]>([]);

  useEffect(() => {
    // Parse the content to find scope definitions
    const lines = content.split('\n');
    const foundScopes: ScopeInfo[] = [];
    const scopeStack: ScopeInfo[] = [];
    let braceCount = 0;

    const patterns: Record<string, RegExp[]> = {
      typescript: [
        /^(\s*)(export\s+)?(async\s+)?function\s+(\w+)/,
        /^(\s*)(export\s+)?(abstract\s+)?class\s+(\w+)/,
        /^(\s*)(public|private|protected)?\s*(static)?\s*(async)?\s*(\w+)\s*\(/,
        /^(\s*)namespace\s+(\w+)/,
        /^(\s*)interface\s+(\w+)/,
      ],
      javascript: [
        /^(\s*)(export\s+)?(async\s+)?function\s+(\w+)/,
        /^(\s*)class\s+(\w+)/,
        /^(\s*)(\w+)\s*[=:]\s*(async\s+)?\(?.*\)?\s*=>/,
      ],
      python: [
        /^(\s*)def\s+(\w+)/,
        /^(\s*)class\s+(\w+)/,
        /^(\s*)async\s+def\s+(\w+)/,
      ],
    };

    const langPatterns = patterns[language] || patterns.typescript;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Count braces for scope tracking
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;

      // Close scopes
      for (let j = 0; j < closeBraces; j++) {
        const lastScope = scopeStack.pop();
        if (lastScope) {
          lastScope.endLine = lineNum;
          foundScopes.push(lastScope);
        }
      }

      // Check for new scopes
      for (const pattern of langPatterns) {
        const match = line.match(pattern);
        if (match) {
          const indent = match[1]?.length || 0;
          const name = match[match.length - 1] || match[match.length - 2] || 'anonymous';

          let type: ScopeInfo['type'] = 'function';
          if (line.includes('class')) type = 'class';
          else if (line.includes('namespace')) type = 'namespace';
          else if (scopeStack.length > 0 && scopeStack[scopeStack.length - 1].type === 'class') {
            type = 'method';
          }

          const scope: ScopeInfo = {
            name,
            type,
            startLine: lineNum,
            endLine: lines.length
          };

          // For Python, use indentation-based scope tracking
          if (language === 'python') {
            scope.endLine = lineNum;
            foundScopes.push(scope);
          } else if (openBraces > closeBraces) {
            scopeStack.push(scope);
          }
          break;
        }
      }

      braceCount += openBraces - closeBraces;
    }

    // Close any remaining scopes
    while (scopeStack.length > 0) {
      const scope = scopeStack.pop()!;
      scope.endLine = lines.length;
      foundScopes.push(scope);
    }

    setScopes(foundScopes);
  }, [content, language]);

  useEffect(() => {
    // Find scopes that contain the current line
    const containingScopes = scopes
      .filter(scope => scope.startLine <= currentLine && scope.endLine >= currentLine)
      .sort((a, b) => a.startLine - b.startLine);

    setVisibleScopes(containingScopes.slice(0, maxLines));
  }, [scopes, currentLine, maxLines]);

  if (visibleScopes.length === 0) {
    return null;
  }

  const getTypeIcon = (type: ScopeInfo['type']) => {
    switch (type) {
      case 'class': return '📦';
      case 'function': return 'ƒ';
      case 'method': return '🔧';
      case 'namespace': return '📁';
      case 'block': return '{ }';
      default: return '•';
    }
  };

  const getTypeColor = (type: ScopeInfo['type']) => {
    switch (type) {
      case 'class': return '#e5c07b';
      case 'function': return '#61afef';
      case 'method': return '#98c379';
      case 'namespace': return '#c678dd';
      default: return '#abb2bf';
    }
  };

  return (
    <div className="sticky-scroll">
      {visibleScopes.map((scope, index) => (
        <div
          key={`${scope.name}-${scope.startLine}`}
          className="sticky-scope"
          style={{
            paddingLeft: `${index * 16 + 8}px`,
            borderLeftColor: getTypeColor(scope.type)
          }}
          onClick={() => onNavigate(scope.startLine)}
          title={`${scope.type} ${scope.name} (lines ${scope.startLine}-${scope.endLine})`}
        >
          <span className="scope-icon" style={{ color: getTypeColor(scope.type) }}>
            {getTypeIcon(scope.type)}
          </span>
          <span className="scope-name">{scope.name}</span>
          <span className="scope-line">:{scope.startLine}</span>
        </div>
      ))}
    </div>
  );
}

export default StickyScroll;
