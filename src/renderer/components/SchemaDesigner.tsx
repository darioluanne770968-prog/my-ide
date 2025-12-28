import { useState } from 'react';

interface SchemaDesignerProps {
  onClose: () => void;
}

interface Table {
  id: string;
  name: string;
  columns: Column[];
  x: number;
  y: number;
}

interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  foreignKey?: { table: string; column: string };
  defaultValue?: string;
}

interface Relation {
  id: string;
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export default function SchemaDesigner({ onClose }: SchemaDesignerProps) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [activeTab, setActiveTab] = useState<'diagram' | 'sql' | 'migration'>('diagram');

  const [tables, setTables] = useState<Table[]>([
    {
      id: '1',
      name: 'users',
      x: 50,
      y: 50,
      columns: [
        { id: '1', name: 'id', type: 'INT', nullable: false, primaryKey: true, unique: true },
        { id: '2', name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false, unique: false },
        { id: '3', name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false, unique: true },
        { id: '4', name: 'password_hash', type: 'VARCHAR(255)', nullable: false, primaryKey: false, unique: false },
        { id: '5', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false, unique: false, defaultValue: 'CURRENT_TIMESTAMP' },
        { id: '6', name: 'updated_at', type: 'TIMESTAMP', nullable: true, primaryKey: false, unique: false }
      ]
    },
    {
      id: '2',
      name: 'orders',
      x: 350,
      y: 50,
      columns: [
        { id: '1', name: 'id', type: 'INT', nullable: false, primaryKey: true, unique: true },
        { id: '2', name: 'user_id', type: 'INT', nullable: false, primaryKey: false, unique: false, foreignKey: { table: 'users', column: 'id' } },
        { id: '3', name: 'total', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false, unique: false },
        { id: '4', name: 'status', type: 'ENUM', nullable: false, primaryKey: false, unique: false, defaultValue: 'pending' },
        { id: '5', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false, unique: false }
      ]
    },
    {
      id: '3',
      name: 'products',
      x: 50,
      y: 300,
      columns: [
        { id: '1', name: 'id', type: 'INT', nullable: false, primaryKey: true, unique: true },
        { id: '2', name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false, unique: false },
        { id: '3', name: 'description', type: 'TEXT', nullable: true, primaryKey: false, unique: false },
        { id: '4', name: 'price', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false, unique: false },
        { id: '5', name: 'stock', type: 'INT', nullable: false, primaryKey: false, unique: false, defaultValue: '0' },
        { id: '6', name: 'category_id', type: 'INT', nullable: true, primaryKey: false, unique: false, foreignKey: { table: 'categories', column: 'id' } }
      ]
    },
    {
      id: '4',
      name: 'order_items',
      x: 350,
      y: 300,
      columns: [
        { id: '1', name: 'id', type: 'INT', nullable: false, primaryKey: true, unique: true },
        { id: '2', name: 'order_id', type: 'INT', nullable: false, primaryKey: false, unique: false, foreignKey: { table: 'orders', column: 'id' } },
        { id: '3', name: 'product_id', type: 'INT', nullable: false, primaryKey: false, unique: false, foreignKey: { table: 'products', column: 'id' } },
        { id: '4', name: 'quantity', type: 'INT', nullable: false, primaryKey: false, unique: false },
        { id: '5', name: 'price', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false, unique: false }
      ]
    }
  ]);

  const [relations] = useState<Relation[]>([
    { id: '1', from: { table: 'orders', column: 'user_id' }, to: { table: 'users', column: 'id' }, type: 'one-to-many' },
    { id: '2', from: { table: 'order_items', column: 'order_id' }, to: { table: 'orders', column: 'id' }, type: 'one-to-many' },
    { id: '3', from: { table: 'order_items', column: 'product_id' }, to: { table: 'products', column: 'id' }, type: 'one-to-many' }
  ]);

  const dataTypes = ['INT', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'DECIMAL(10,2)', 'TIMESTAMP', 'DATE', 'JSON', 'ENUM', 'UUID'];

  const addTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      name: 'new_table',
      x: 200,
      y: 200,
      columns: [
        { id: '1', name: 'id', type: 'INT', nullable: false, primaryKey: true, unique: true }
      ]
    };
    setTables(prev => [...prev, newTable]);
    setSelectedTable(newTable);
  };

  const addColumn = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          columns: [...t.columns, {
            id: Date.now().toString(),
            name: 'new_column',
            type: 'VARCHAR(255)',
            nullable: true,
            primaryKey: false,
            unique: false
          }]
        };
      }
      return t;
    }));
  };

  const generateSQL = () => {
    return tables.map(table => {
      const cols = table.columns.map(col => {
        let def = `  ${col.name} ${col.type}`;
        if (!col.nullable) def += ' NOT NULL';
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (col.unique && !col.primaryKey) def += ' UNIQUE';
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
        return def;
      }).join(',\n');

      const fks = table.columns
        .filter(c => c.foreignKey)
        .map(c => `  FOREIGN KEY (${c.name}) REFERENCES ${c.foreignKey!.table}(${c.foreignKey!.column})`)
        .join(',\n');

      return `CREATE TABLE ${table.name} (\n${cols}${fks ? ',\n' + fks : ''}\n);`;
    }).join('\n\n');
  };

  const generateMigration = () => {
    return `-- Migration: Create initial schema
-- Generated: ${new Date().toISOString()}

${generateSQL()}

-- Indexes
${tables.flatMap(t =>
  t.columns.filter(c => c.foreignKey).map(c =>
    `CREATE INDEX idx_${t.name}_${c.name} ON ${t.name}(${c.name});`
  )
).join('\n')}
`;
  };

  return (
    <div className="schema-designer">
      <div className="designer-header">
        <h3>Database Schema Designer</h3>
        <div className="header-actions">
          <button className="add-table-btn" onClick={addTable}>+ Add Table</button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="designer-content">
        <div className="sidebar">
          <div className="section">
            <div className="section-title">Tables</div>
            <div className="tables-list">
              {tables.map(table => (
                <div
                  key={table.id}
                  className={`table-item ${selectedTable?.id === table.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedTable(table); setSelectedColumn(null); }}
                >
                  <span className="table-icon">📋</span>
                  <span className="table-name">{table.name}</span>
                  <span className="column-count">{table.columns.length}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedTable && (
            <div className="section">
              <div className="section-header">
                <span>Columns</span>
                <button className="add-col-btn" onClick={() => addColumn(selectedTable.id)}>+</button>
              </div>
              <div className="columns-list">
                {selectedTable.columns.map(col => (
                  <div
                    key={col.id}
                    className={`column-item ${selectedColumn?.id === col.id ? 'selected' : ''}`}
                    onClick={() => setSelectedColumn(col)}
                  >
                    <span className="col-icons">
                      {col.primaryKey && <span title="Primary Key">🔑</span>}
                      {col.foreignKey && <span title="Foreign Key">🔗</span>}
                    </span>
                    <span className="col-name">{col.name}</span>
                    <span className="col-type">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="main-panel">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'diagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('diagram')}
            >
              Diagram
            </button>
            <button
              className={`tab ${activeTab === 'sql' ? 'active' : ''}`}
              onClick={() => setActiveTab('sql')}
            >
              SQL
            </button>
            <button
              className={`tab ${activeTab === 'migration' ? 'active' : ''}`}
              onClick={() => setActiveTab('migration')}
            >
              Migration
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'diagram' && (
              <div className="diagram-view">
                <svg className="diagram-canvas" viewBox="0 0 700 500">
                  {/* Draw relations */}
                  {relations.map(rel => {
                    const fromTable = tables.find(t => t.name === rel.from.table);
                    const toTable = tables.find(t => t.name === rel.to.table);
                    if (!fromTable || !toTable) return null;

                    const x1 = fromTable.x + 130;
                    const y1 = fromTable.y + 60;
                    const x2 = toTable.x + 130;
                    const y2 = toTable.y + 60;

                    return (
                      <g key={rel.id}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="var(--accent-color)"
                          strokeWidth="2"
                          strokeDasharray={rel.type === 'many-to-many' ? '5,5' : 'none'}
                        />
                        <circle cx={x2} cy={y2} r="5" fill="var(--accent-color)" />
                      </g>
                    );
                  })}

                  {/* Draw tables */}
                  {tables.map(table => (
                    <g key={table.id} transform={`translate(${table.x}, ${table.y})`}>
                      <rect
                        width="260"
                        height={40 + table.columns.length * 24}
                        rx="4"
                        fill="var(--bg-secondary)"
                        stroke={selectedTable?.id === table.id ? 'var(--accent-color)' : 'var(--border-color)'}
                        strokeWidth={selectedTable?.id === table.id ? 2 : 1}
                      />
                      <rect
                        width="260"
                        height="32"
                        rx="4"
                        fill="var(--accent-color)"
                      />
                      <text x="130" y="22" textAnchor="middle" fill="white" fontSize="13" fontWeight="500">
                        {table.name}
                      </text>
                      {table.columns.map((col, i) => (
                        <g key={col.id} transform={`translate(0, ${40 + i * 24})`}>
                          <text x="10" y="16" fontSize="11" fill="var(--text-primary)">
                            {col.primaryKey && '🔑 '}
                            {col.foreignKey && '🔗 '}
                            {col.name}
                          </text>
                          <text x="250" y="16" textAnchor="end" fontSize="10" fill="var(--text-secondary)">
                            {col.type}
                          </text>
                        </g>
                      ))}
                    </g>
                  ))}
                </svg>
              </div>
            )}

            {activeTab === 'sql' && (
              <div className="sql-view">
                <div className="sql-toolbar">
                  <button>Copy</button>
                  <button>Download</button>
                </div>
                <pre className="sql-content">{generateSQL()}</pre>
              </div>
            )}

            {activeTab === 'migration' && (
              <div className="migration-view">
                <div className="migration-toolbar">
                  <button>Copy</button>
                  <button>Generate Rollback</button>
                </div>
                <pre className="migration-content">{generateMigration()}</pre>
              </div>
            )}
          </div>
        </div>

        {selectedColumn && (
          <div className="column-editor">
            <div className="editor-header">
              <h4>Edit Column</h4>
              <button className="close-panel" onClick={() => setSelectedColumn(null)}>×</button>
            </div>

            <div className="editor-content">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={selectedColumn.name} />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select value={selectedColumn.type}>
                  {dataTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" checked={selectedColumn.primaryKey} />
                  Primary Key
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" checked={!selectedColumn.nullable} />
                  Not Null
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" checked={selectedColumn.unique} />
                  Unique
                </label>
              </div>

              <div className="form-group">
                <label>Default Value</label>
                <input type="text" value={selectedColumn.defaultValue || ''} placeholder="None" />
              </div>

              <div className="form-group">
                <label>Foreign Key</label>
                <select value={selectedColumn.foreignKey ? `${selectedColumn.foreignKey.table}.${selectedColumn.foreignKey.column}` : ''}>
                  <option value="">None</option>
                  {tables.flatMap(t =>
                    t.columns.filter(c => c.primaryKey).map(c => (
                      <option key={`${t.name}.${c.name}`} value={`${t.name}.${c.name}`}>
                        {t.name}.{c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="editor-actions">
                <button className="save-btn">Save</button>
                <button className="delete-btn">Delete Column</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .schema-designer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .designer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .designer-header h3 { margin: 0; font-size: 14px; }
        .header-actions { display: flex; gap: 8px; }
        .add-table-btn {
          padding: 6px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .designer-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 220px;
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
        }
        .section { padding: 12px; }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .add-col-btn {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 4px;
          background: var(--accent-color);
          color: white;
          cursor: pointer;
        }
        .tables-list, .columns-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .table-item, .column-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .table-item:hover, .column-item:hover { background: var(--bg-secondary); }
        .table-item.selected, .column-item.selected { background: rgba(52, 152, 219, 0.2); }
        .table-name, .col-name { flex: 1; }
        .column-count, .col-type { font-size: 10px; color: var(--text-tertiary); }
        .col-icons { font-size: 10px; }
        .main-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        .tab {
          padding: 10px 20px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
        }
        .tab.active {
          color: var(--accent-color);
          border-bottom: 2px solid var(--accent-color);
        }
        .tab-content {
          flex: 1;
          overflow: auto;
        }
        .diagram-view {
          height: 100%;
          background: var(--bg-secondary);
        }
        .diagram-canvas {
          width: 100%;
          height: 100%;
        }
        .sql-view, .migration-view {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .sql-toolbar, .migration-toolbar {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .sql-toolbar button, .migration-toolbar button {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
        .sql-content, .migration-content {
          flex: 1;
          margin: 0;
          padding: 16px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.6;
          overflow: auto;
          background: #1a1a1a;
          color: #d4d4d4;
        }
        .column-editor {
          width: 280px;
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .editor-header h4 { margin: 0; font-size: 13px; }
        .close-panel {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 18px;
        }
        .editor-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 11px;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }
        .form-group input[type="text"],
        .form-group select {
          width: 100%;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .editor-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 24px;
        }
        .save-btn {
          padding: 10px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-btn {
          padding: 10px;
          background: none;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
