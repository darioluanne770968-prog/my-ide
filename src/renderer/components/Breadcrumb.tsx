import React from 'react';

interface BreadcrumbProps {
  filePath: string | null;
  symbols?: Array<{
    name: string;
    kind: string;
    range: { start: number; end: number };
  }>;
  currentLine?: number;
  onNavigate?: (path: string) => void;
  onSymbolClick?: (symbol: { name: string; range: { start: number; end: number } }) => void;
}

function Breadcrumb({ filePath, symbols = [], currentLine = 1, onNavigate, onSymbolClick }: BreadcrumbProps) {
  if (!filePath) return null;

  const parts = filePath.split('/');
  const fileName = parts.pop() || '';
  const directories = parts.slice(-3); // Show last 3 directories

  // Find current symbol based on cursor line
  const currentSymbol = symbols.find(
    (s) => currentLine >= s.range.start && currentLine <= s.range.end
  );

  const getSymbolIcon = (kind: string) => {
    switch (kind) {
      case 'function':
        return 'ƒ';
      case 'class':
        return 'C';
      case 'interface':
        return 'I';
      case 'variable':
        return 'V';
      case 'constant':
        return 'K';
      case 'method':
        return 'M';
      case 'property':
        return 'P';
      default:
        return '•';
    }
  };

  return (
    <div className="breadcrumb">
      {directories.map((dir, index) => (
        <React.Fragment key={index}>
          <span
            className="breadcrumb-item directory"
            onClick={() => {
              const pathTillHere = parts.slice(0, parts.length - directories.length + index + 1).join('/');
              onNavigate?.(pathTillHere);
            }}
          >
            {dir}
          </span>
          <span className="breadcrumb-separator">/</span>
        </React.Fragment>
      ))}
      <span className="breadcrumb-item file">{fileName}</span>
      {currentSymbol && (
        <>
          <span className="breadcrumb-separator">›</span>
          <span
            className="breadcrumb-item symbol"
            onClick={() => onSymbolClick?.(currentSymbol)}
          >
            <span className="symbol-icon">{getSymbolIcon(currentSymbol.kind)}</span>
            {currentSymbol.name}
          </span>
        </>
      )}
    </div>
  );
}

export default Breadcrumb;
