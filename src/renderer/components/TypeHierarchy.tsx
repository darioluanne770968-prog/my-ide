import React, { useState, useEffect } from 'react';

interface TypeHierarchyItem {
  id: string;
  name: string;
  kind: 'class' | 'interface' | 'type' | 'enum';
  filePath: string;
  line: number;
  members?: { name: string; type: string; isStatic?: boolean }[];
  children?: TypeHierarchyItem[];
}

interface TypeHierarchyProps {
  targetType: string;
  filePath: string;
  line: number;
  rootPath: string;
  onNavigate: (filePath: string, line: number) => void;
  onClose: () => void;
}

type Direction = 'supertypes' | 'subtypes';

function TypeHierarchy({
  targetType,
  filePath,
  line,
  rootPath,
  onNavigate,
  onClose
}: TypeHierarchyProps) {
  const [direction, setDirection] = useState<Direction>('supertypes');
  const [hierarchy, setHierarchy] = useState<TypeHierarchyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showMembers, setShowMembers] = useState(true);

  useEffect(() => {
    loadHierarchy();
  }, [targetType, filePath, direction]);

  const loadHierarchy = async () => {
    setIsLoading(true);

    // Simulate loading type hierarchy
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockSupertypes: TypeHierarchyItem[] = [
      {
        id: 'parent-1',
        name: 'BaseComponent',
        kind: 'class',
        filePath: `${rootPath}/src/base/BaseComponent.ts`,
        line: 10,
        members: [
          { name: 'render', type: '() => void' },
          { name: 'props', type: 'Props' },
          { name: 'state', type: 'State' }
        ],
        children: [
          {
            id: 'grandparent-1',
            name: 'EventEmitter',
            kind: 'class',
            filePath: `${rootPath}/node_modules/events/index.d.ts`,
            line: 1,
            members: [
              { name: 'on', type: '(event: string, listener: Function) => this' },
              { name: 'emit', type: '(event: string, ...args: any[]) => boolean' }
            ]
          }
        ]
      },
      {
        id: 'interface-1',
        name: 'Disposable',
        kind: 'interface',
        filePath: `${rootPath}/src/types/interfaces.ts`,
        line: 25,
        members: [
          { name: 'dispose', type: '() => void' }
        ]
      }
    ];

    const mockSubtypes: TypeHierarchyItem[] = [
      {
        id: 'child-1',
        name: 'ButtonComponent',
        kind: 'class',
        filePath: `${rootPath}/src/components/Button.tsx`,
        line: 15,
        members: [
          { name: 'onClick', type: '() => void' },
          { name: 'label', type: 'string' }
        ]
      },
      {
        id: 'child-2',
        name: 'InputComponent',
        kind: 'class',
        filePath: `${rootPath}/src/components/Input.tsx`,
        line: 20,
        members: [
          { name: 'value', type: 'string' },
          { name: 'onChange', type: '(value: string) => void' }
        ],
        children: [
          {
            id: 'grandchild-1',
            name: 'TextInput',
            kind: 'class',
            filePath: `${rootPath}/src/components/TextInput.tsx`,
            line: 8
          },
          {
            id: 'grandchild-2',
            name: 'NumberInput',
            kind: 'class',
            filePath: `${rootPath}/src/components/NumberInput.tsx`,
            line: 12
          }
        ]
      },
      {
        id: 'child-3',
        name: 'FormComponent',
        kind: 'class',
        filePath: `${rootPath}/src/components/Form.tsx`,
        line: 30,
        members: [
          { name: 'submit', type: '() => Promise<void>' },
          { name: 'validate', type: '() => boolean' }
        ]
      }
    ];

    setHierarchy(direction === 'supertypes' ? mockSupertypes : mockSubtypes);
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

  const getKindIcon = (kind: TypeHierarchyItem['kind']) => {
    switch (kind) {
      case 'class': return '📦';
      case 'interface': return '🔷';
      case 'type': return 'T';
      case 'enum': return 'E';
      default: return '•';
    }
  };

  const getKindColor = (kind: TypeHierarchyItem['kind']) => {
    switch (kind) {
      case 'class': return '#e5c07b';
      case 'interface': return '#61afef';
      case 'type': return '#98c379';
      case 'enum': return '#c678dd';
      default: return '#abb2bf';
    }
  };

  const renderItem = (item: TypeHierarchyItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const fileName = item.filePath.split('/').pop();

    return (
      <div key={item.id} className="type-hierarchy-item-container">
        <div
          className="type-hierarchy-item"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          <div className="item-header">
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

            <span
              className="kind-icon"
              style={{ color: getKindColor(item.kind) }}
            >
              {getKindIcon(item.kind)}
            </span>

            <span
              className="item-name"
              onClick={() => onNavigate(item.filePath, item.line)}
            >
              {item.name}
            </span>

            <span className="item-kind">{item.kind}</span>

            <span className="item-location">
              {fileName}:{item.line}
            </span>
          </div>

          {showMembers && item.members && item.members.length > 0 && (
            <div className="item-members">
              {item.members.map((member, i) => (
                <div key={i} className="member-item">
                  <span className="member-name">{member.name}</span>
                  <span className="member-type">{member.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="type-hierarchy-children">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="type-hierarchy">
      <div className="hierarchy-header">
        <h3>Type Hierarchy</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="hierarchy-target">
        <span className="target-icon">{getKindIcon('class')}</span>
        <span className="target-name">{targetType}</span>
        <span className="target-location">{filePath.split('/').pop()}:{line}</span>
      </div>

      <div className="hierarchy-controls">
        <div className="direction-buttons">
          <button
            className={direction === 'supertypes' ? 'active' : ''}
            onClick={() => setDirection('supertypes')}
          >
            ↑ Supertypes
          </button>
          <button
            className={direction === 'subtypes' ? 'active' : ''}
            onClick={() => setDirection('subtypes')}
          >
            ↓ Subtypes
          </button>
        </div>

        <label className="show-members-toggle">
          <input
            type="checkbox"
            checked={showMembers}
            onChange={(e) => setShowMembers(e.target.checked)}
          />
          Show members
        </label>
      </div>

      <div className="hierarchy-content">
        {isLoading ? (
          <div className="hierarchy-loading">Loading type hierarchy...</div>
        ) : hierarchy.length > 0 ? (
          <div className="hierarchy-tree">
            {hierarchy.map(item => renderItem(item))}
          </div>
        ) : (
          <div className="hierarchy-empty">
            <p>No {direction} found for {targetType}</p>
          </div>
        )}
      </div>

      <div className="hierarchy-legend">
        <span><span style={{ color: getKindColor('class') }}>📦</span> Class</span>
        <span><span style={{ color: getKindColor('interface') }}>🔷</span> Interface</span>
        <span><span style={{ color: getKindColor('type') }}>T</span> Type</span>
        <span><span style={{ color: getKindColor('enum') }}>E</span> Enum</span>
      </div>
    </div>
  );
}

export default TypeHierarchy;
