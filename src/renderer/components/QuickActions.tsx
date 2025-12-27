import React, { useState, useEffect, useRef } from 'react';

interface QuickAction {
  id: string;
  title: string;
  kind: 'quickfix' | 'refactor' | 'source' | 'organize';
  description?: string;
  isPreferred?: boolean;
}

interface QuickActionsProps {
  line: number;
  column: number;
  code: string;
  language: string;
  diagnostics: Array<{ line: number; message: string; code?: string }>;
  onApply: (action: QuickAction, edit: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

function QuickActions({
  line,
  column,
  code,
  language,
  diagnostics,
  onApply,
  onClose,
  position
}: QuickActionsProps) {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const computedActions = computeActions();
    setActions(computedActions);
    setSelectedIndex(0);
  }, [line, column, code, language, diagnostics]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => (i + 1) % actions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => (i - 1 + actions.length) % actions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (actions[selectedIndex]) {
            handleApplyAction(actions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions, selectedIndex, onClose]);

  const computeActions = (): QuickAction[] => {
    const computedActions: QuickAction[] = [];
    const lines = code.split('\n');
    const currentLine = lines[line - 1] || '';

    // Check diagnostics for this line
    const lineDiagnostics = diagnostics.filter(d => d.line === line);

    // Add quick fixes for diagnostics
    lineDiagnostics.forEach(diag => {
      if (diag.message.includes('unused')) {
        computedActions.push({
          id: 'remove-unused',
          title: 'Remove unused variable',
          kind: 'quickfix',
          description: 'Delete the unused variable declaration',
          isPreferred: true
        });
        computedActions.push({
          id: 'prefix-underscore',
          title: 'Prefix with underscore',
          kind: 'quickfix',
          description: 'Add _ prefix to indicate intentionally unused'
        });
      }

      if (diag.message.includes('missing')) {
        computedActions.push({
          id: 'add-missing-import',
          title: 'Add missing import',
          kind: 'quickfix',
          isPreferred: true
        });
      }

      if (diag.message.includes('type')) {
        computedActions.push({
          id: 'add-type-annotation',
          title: 'Add type annotation',
          kind: 'quickfix'
        });
        computedActions.push({
          id: 'infer-type',
          title: 'Infer type from usage',
          kind: 'quickfix'
        });
      }
    });

    // Context-aware refactoring actions
    if (currentLine.includes('function') || currentLine.includes('=>')) {
      computedActions.push({
        id: 'extract-to-const',
        title: 'Extract to constant',
        kind: 'refactor'
      });
      computedActions.push({
        id: 'convert-arrow',
        title: currentLine.includes('=>') ? 'Convert to function' : 'Convert to arrow function',
        kind: 'refactor'
      });
    }

    if (currentLine.includes('if') || currentLine.includes('?')) {
      computedActions.push({
        id: 'invert-condition',
        title: 'Invert condition',
        kind: 'refactor'
      });
      if (currentLine.includes('if')) {
        computedActions.push({
          id: 'convert-ternary',
          title: 'Convert to ternary',
          kind: 'refactor'
        });
      }
    }

    if (currentLine.includes('console.log')) {
      computedActions.push({
        id: 'remove-console',
        title: 'Remove console.log',
        kind: 'source',
        isPreferred: true
      });
    }

    // Source actions always available
    computedActions.push({
      id: 'organize-imports',
      title: 'Organize imports',
      kind: 'organize'
    });

    computedActions.push({
      id: 'add-jsdoc',
      title: 'Add JSDoc comment',
      kind: 'source'
    });

    return computedActions;
  };

  const handleApplyAction = (action: QuickAction) => {
    const lines = code.split('\n');
    const currentLine = lines[line - 1] || '';
    let edit = currentLine;

    switch (action.id) {
      case 'remove-unused':
        edit = '';
        break;
      case 'prefix-underscore':
        edit = currentLine.replace(/\b(const|let|var)\s+(\w+)/, '$1 _$2');
        break;
      case 'remove-console':
        edit = '';
        break;
      case 'convert-arrow':
        if (currentLine.includes('=>')) {
          edit = currentLine.replace(/(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{?/, 'function $1($2) {');
        } else {
          edit = currentLine.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/, 'const $1 = ($2) => {');
        }
        break;
      case 'invert-condition':
        edit = currentLine.replace(/if\s*\(\s*!?(.+?)\s*\)/, (match, cond) => {
          return match.includes('!') ? `if (${cond.replace('!', '')})` : `if (!${cond})`;
        });
        break;
      default:
        // For actions not implemented, just return the original
        break;
    }

    onApply(action, edit);
    onClose();
  };

  const getActionIcon = (kind: QuickAction['kind']) => {
    switch (kind) {
      case 'quickfix': return '💡';
      case 'refactor': return '🔧';
      case 'source': return '📝';
      case 'organize': return '📦';
      default: return '•';
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="quick-actions"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div className="quick-actions-header">
        <span className="lightbulb">💡</span>
        <span>Quick Actions</span>
      </div>
      <div className="quick-actions-list">
        {actions.map((action, index) => (
          <div
            key={action.id}
            className={`quick-action-item ${index === selectedIndex ? 'selected' : ''} ${action.isPreferred ? 'preferred' : ''}`}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => handleApplyAction(action)}
          >
            <span className="action-icon">{getActionIcon(action.kind)}</span>
            <span className="action-title">{action.title}</span>
            {action.isPreferred && <span className="preferred-badge">Preferred</span>}
          </div>
        ))}
      </div>
      <div className="quick-actions-footer">
        <span>↑↓ Navigate</span>
        <span>Enter Apply</span>
        <span>Esc Close</span>
      </div>
    </div>
  );
}

export default QuickActions;
