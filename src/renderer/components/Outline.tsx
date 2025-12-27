import { useState, useEffect, useMemo } from 'react';

export interface DocumentSymbol {
  name: string;
  kind: SymbolKind;
  range: { startLine: number; endLine: number };
  selectionRange: { startLine: number; startColumn: number };
  children?: DocumentSymbol[];
}

export type SymbolKind =
  | 'file' | 'module' | 'namespace' | 'package'
  | 'class' | 'method' | 'property' | 'field'
  | 'constructor' | 'enum' | 'interface' | 'function'
  | 'variable' | 'constant' | 'string' | 'number'
  | 'boolean' | 'array' | 'object' | 'key'
  | 'null' | 'enumMember' | 'struct' | 'event'
  | 'operator' | 'typeParameter';

interface OutlineProps {
  symbols: DocumentSymbol[];
  currentLine: number;
  onNavigate: (line: number, column: number) => void;
}

function Outline({ symbols, currentLine, onNavigate }: OutlineProps) {
  const [filter, setFilter] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'position' | 'name' | 'kind'>('position');

  // Auto-expand to show current symbol
  useEffect(() => {
    const findCurrentPath = (syms: DocumentSymbol[], path: string[] = []): string[] | null => {
      for (const sym of syms) {
        const symPath = [...path, sym.name];
        if (currentLine >= sym.range.startLine && currentLine <= sym.range.endLine) {
          if (sym.children && sym.children.length > 0) {
            const childPath = findCurrentPath(sym.children, symPath);
            if (childPath) return childPath;
          }
          return symPath;
        }
      }
      return null;
    };

    const path = findCurrentPath(symbols);
    if (path) {
      const newExpanded = new Set(expandedNodes);
      path.forEach((_, i) => {
        newExpanded.add(path.slice(0, i + 1).join('/'));
      });
      setExpandedNodes(newExpanded);
    }
  }, [currentLine, symbols]);

  const getSymbolIcon = (kind: SymbolKind): string => {
    const icons: Record<SymbolKind, string> = {
      file: '📄', module: '📦', namespace: 'N', package: '📦',
      class: 'C', method: 'M', property: 'P', field: 'F',
      constructor: '⚡', enum: 'E', interface: 'I', function: 'ƒ',
      variable: 'V', constant: 'K', string: 'S', number: '#',
      boolean: 'B', array: '[]', object: '{}', key: '🔑',
      null: '∅', enumMember: 'e', struct: 'S', event: '⚡',
      operator: 'O', typeParameter: 'T'
    };
    return icons[kind] || '•';
  };

  const filterSymbols = (syms: DocumentSymbol[]): DocumentSymbol[] => {
    if (!filter) return syms;
    const lowerFilter = filter.toLowerCase();

    const filterRecursive = (sym: DocumentSymbol): DocumentSymbol | null => {
      const matchesFilter = sym.name.toLowerCase().includes(lowerFilter);
      const filteredChildren = sym.children?.map(filterRecursive).filter(Boolean) as DocumentSymbol[] | undefined;

      if (matchesFilter || (filteredChildren && filteredChildren.length > 0)) {
        return { ...sym, children: filteredChildren };
      }
      return null;
    };

    return syms.map(filterRecursive).filter(Boolean) as DocumentSymbol[];
  };

  const sortSymbols = (syms: DocumentSymbol[]): DocumentSymbol[] => {
    const sorted = [...syms];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'kind':
        sorted.sort((a, b) => a.kind.localeCompare(b.kind));
        break;
      case 'position':
      default:
        sorted.sort((a, b) => a.range.startLine - b.range.startLine);
    }
    return sorted.map(s => ({
      ...s,
      children: s.children ? sortSymbols(s.children) : undefined
    }));
  };

  const processedSymbols = useMemo(() => {
    return sortSymbols(filterSymbols(symbols));
  }, [symbols, filter, sortBy]);

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderSymbol = (symbol: DocumentSymbol, path: string, level: number = 0) => {
    const fullPath = path ? `${path}/${symbol.name}` : symbol.name;
    const hasChildren = symbol.children && symbol.children.length > 0;
    const isExpanded = expandedNodes.has(fullPath);
    const isCurrent = currentLine >= symbol.range.startLine && currentLine <= symbol.range.endLine;

    return (
      <div key={fullPath} className="outline-item-container">
        <div
          className={`outline-item ${isCurrent ? 'current' : ''}`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onNavigate(symbol.selectionRange.startLine, symbol.selectionRange.startColumn)}
        >
          {hasChildren ? (
            <span
              className="outline-expand"
              onClick={(e) => { e.stopPropagation(); toggleNode(fullPath); }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="outline-expand-placeholder" />
          )}
          <span className={`outline-icon kind-${symbol.kind}`}>
            {getSymbolIcon(symbol.kind)}
          </span>
          <span className="outline-name">{symbol.name}</span>
          <span className="outline-line">:{symbol.range.startLine}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="outline-children">
            {symbol.children!.map(child => renderSymbol(child, fullPath, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="outline-panel">
      <div className="outline-header">
        <input
          type="text"
          className="outline-filter"
          placeholder="Filter symbols..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="outline-sort"
        >
          <option value="position">By Position</option>
          <option value="name">By Name</option>
          <option value="kind">By Kind</option>
        </select>
      </div>
      <div className="outline-content">
        {processedSymbols.length === 0 ? (
          <div className="outline-empty">No symbols found</div>
        ) : (
          processedSymbols.map(sym => renderSymbol(sym, '', 0))
        )}
      </div>
    </div>
  );
}

export default Outline;
