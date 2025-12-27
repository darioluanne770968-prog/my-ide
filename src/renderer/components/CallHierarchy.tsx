import React, { useState, useEffect } from 'react';

interface CallHierarchyItem {
  id: string;
  name: string;
  kind: 'function' | 'method' | 'constructor' | 'class';
  filePath: string;
  line: number;
  column: number;
  children?: CallHierarchyItem[];
  isExpanded?: boolean;
}

interface CallHierarchyProps {
  targetFunction: string;
  filePath: string;
  line: number;
  rootPath: string;
  onNavigate: (filePath: string, line: number) => void;
  onClose: () => void;
}

type Direction = 'incoming' | 'outgoing';

function CallHierarchy({
  targetFunction,
  filePath,
  line,
  rootPath,
  onNavigate,
  onClose
}: CallHierarchyProps) {
  const [direction, setDirection] = useState<Direction>('incoming');
  const [hierarchy, setHierarchy] = useState<CallHierarchyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHierarchy();
  }, [targetFunction, filePath, direction]);

  const loadHierarchy = async () => {
    setIsLoading(true);

    // Simulate loading call hierarchy
    // In real implementation, this would use LSP or TypeScript compiler API
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockIncoming: CallHierarchyItem[] = [
      {
        id: 'caller-1',
        name: 'handleSubmit',
        kind: 'function',
        filePath: `${rootPath}/src/handlers.ts`,
        line: 45,
        column: 5,
        children: [
          {
            id: 'caller-1-1',
            name: 'FormComponent.onSubmit',
            kind: 'method',
            filePath: `${rootPath}/src/components/Form.tsx`,
            line: 78,
            column: 10
          }
        ]
      },
      {
        id: 'caller-2',
        name: 'processData',
        kind: 'function',
        filePath: `${rootPath}/src/utils.ts`,
        line: 120,
        column: 3,
        children: [
          {
            id: 'caller-2-1',
            name: 'DataService.process',
            kind: 'method',
            filePath: `${rootPath}/src/services/DataService.ts`,
            line: 34,
            column: 8
          },
          {
            id: 'caller-2-2',
            name: 'main',
            kind: 'function',
            filePath: `${rootPath}/src/index.ts`,
            line: 10,
            column: 1
          }
        ]
      }
    ];

    const mockOutgoing: CallHierarchyItem[] = [
      {
        id: 'callee-1',
        name: 'validateInput',
        kind: 'function',
        filePath: `${rootPath}/src/validation.ts`,
        line: 15,
        column: 1,
        children: [
          {
            id: 'callee-1-1',
            name: 'isValidEmail',
            kind: 'function',
            filePath: `${rootPath}/src/validation.ts`,
            line: 45,
            column: 1
          }
        ]
      },
      {
        id: 'callee-2',
        name: 'fetchData',
        kind: 'function',
        filePath: `${rootPath}/src/api.ts`,
        line: 28,
        column: 1
      },
      {
        id: 'callee-3',
        name: 'Logger.log',
        kind: 'method',
        filePath: `${rootPath}/src/logger.ts`,
        line: 12,
        column: 5
      }
    ];

    setHierarchy(direction === 'incoming' ? mockIncoming : mockOutgoing);
    setIsLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getKindIcon = (kind: CallHierarchyItem['kind']) => {
    switch (kind) {
      case 'function': return 'ƒ';
      case 'method': return '🔧';
      case 'constructor': return '🏗️';
      case 'class': return '📦';
      default: return '•';
    }
  };

  const renderItem = (item: CallHierarchyItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const fileName = item.filePath.split('/').pop();

    return (
      <div key={item.id} className="hierarchy-item-container">
        <div
          className="hierarchy-item"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              className="expand-btn"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="expand-placeholder" />
          )}

          <span className={`kind-icon kind-${item.kind}`}>
            {getKindIcon(item.kind)}
          </span>

          <span
            className="item-name"
            onClick={() => onNavigate(item.filePath, item.line)}
          >
            {item.name}
          </span>

          <span className="item-location">
            {fileName}:{item.line}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="hierarchy-children">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="call-hierarchy">
      <div className="hierarchy-header">
        <h3>Call Hierarchy</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="hierarchy-target">
        <span className="target-label">Target:</span>
        <span className="target-name">{targetFunction}</span>
        <span className="target-location">{filePath.split('/').pop()}:{line}</span>
      </div>

      <div className="hierarchy-direction">
        <button
          className={direction === 'incoming' ? 'active' : ''}
          onClick={() => setDirection('incoming')}
        >
          ← Incoming Calls
        </button>
        <button
          className={direction === 'outgoing' ? 'active' : ''}
          onClick={() => setDirection('outgoing')}
        >
          Outgoing Calls →
        </button>
      </div>

      <div className="hierarchy-content">
        {isLoading ? (
          <div className="hierarchy-loading">Loading...</div>
        ) : hierarchy.length > 0 ? (
          <div className="hierarchy-tree">
            {hierarchy.map(item => renderItem(item))}
          </div>
        ) : (
          <div className="hierarchy-empty">
            <p>No {direction} calls found</p>
          </div>
        )}
      </div>

      <div className="hierarchy-footer">
        <span className="hint">Click on a function to navigate to its location</span>
      </div>
    </div>
  );
}

export default CallHierarchy;
