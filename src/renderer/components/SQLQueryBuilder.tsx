import { useState } from 'react';

interface SQLQueryBuilderProps {
  onClose: () => void;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTime: number;
  rowCount: number;
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: Date;
}

interface TableSchema {
  name: string;
  columns: { name: string; type: string; nullable: boolean; primary: boolean }[];
}

export default function SQLQueryBuilder({ onClose }: SQLQueryBuilderProps) {
  const [query, setQuery] = useState('SELECT * FROM users WHERE active = true LIMIT 10;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'schema' | 'history'>('results');
  const [selectedTable, setSelectedTable] = useState('users');

  const [tables] = useState<TableSchema[]>([
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primary: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, primary: false },
        { name: 'email', type: 'VARCHAR(255)', nullable: false, primary: false },
        { name: 'active', type: 'BOOLEAN', nullable: false, primary: false },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, primary: false }
      ]
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primary: true },
        { name: 'user_id', type: 'INT', nullable: false, primary: false },
        { name: 'total', type: 'DECIMAL(10,2)', nullable: false, primary: false },
        { name: 'status', type: 'VARCHAR(50)', nullable: false, primary: false },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, primary: false }
      ]
    },
    {
      name: 'products',
      columns: [
        { name: 'id', type: 'INT', nullable: false, primary: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, primary: false },
        { name: 'price', type: 'DECIMAL(10,2)', nullable: false, primary: false },
        { name: 'stock', type: 'INT', nullable: false, primary: false },
        { name: 'category_id', type: 'INT', nullable: true, primary: false }
      ]
    }
  ]);

  const [result, setResult] = useState<QueryResult>({
    columns: ['id', 'name', 'email', 'active', 'created_at'],
    rows: [
      { id: 1, name: 'John Doe', email: 'john@example.com', active: true, created_at: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: true, created_at: '2024-01-14' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com', active: true, created_at: '2024-01-13' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', active: true, created_at: '2024-01-12' },
      { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', active: true, created_at: '2024-01-11' }
    ],
    executionTime: 0.023,
    rowCount: 5
  });

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([
    { id: '1', name: 'Active Users', query: 'SELECT * FROM users WHERE active = true;', createdAt: new Date() },
    { id: '2', name: 'Recent Orders', query: 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;', createdAt: new Date() },
    { id: '3', name: 'Low Stock', query: 'SELECT * FROM products WHERE stock < 10;', createdAt: new Date() }
  ]);

  const [history, setHistory] = useState<{ query: string; timestamp: Date; success: boolean }[]>([
    { query: 'SELECT * FROM users WHERE active = true LIMIT 10;', timestamp: new Date(), success: true },
    { query: 'SELECT COUNT(*) FROM orders;', timestamp: new Date(Date.now() - 60000), success: true },
    { query: 'SELECT * FROM invalid_table;', timestamp: new Date(Date.now() - 120000), success: false }
  ]);

  const executeQuery = async () => {
    setIsExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setHistory(prev => [{ query, timestamp: new Date(), success: true }, ...prev]);
    setIsExecuting(false);
    setActiveTab('results');
  };

  const saveQuery = () => {
    const name = prompt('Enter query name:');
    if (!name) return;
    setSavedQueries(prev => [...prev, {
      id: Date.now().toString(),
      name,
      query,
      createdAt: new Date()
    }]);
  };

  const insertSnippet = (snippet: string) => {
    setQuery(prev => prev + '\n' + snippet);
  };

  return (
    <div className="sql-builder">
      <div className="builder-header">
        <h3>SQL Query Builder</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="builder-content">
        <div className="sidebar">
          <div className="section">
            <div className="section-title">Database</div>
            <select className="db-select">
              <option value="main">main_database</option>
              <option value="test">test_database</option>
            </select>
          </div>

          <div className="section">
            <div className="section-title">Tables</div>
            <div className="tables-list">
              {tables.map(table => (
                <div
                  key={table.name}
                  className={`table-item ${selectedTable === table.name ? 'selected' : ''}`}
                  onClick={() => setSelectedTable(table.name)}
                >
                  <span className="table-icon">📋</span>
                  <span className="table-name">{table.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">Saved Queries</div>
            <div className="saved-list">
              {savedQueries.map(sq => (
                <div
                  key={sq.id}
                  className="saved-item"
                  onClick={() => setQuery(sq.query)}
                >
                  <span className="saved-icon">💾</span>
                  <span className="saved-name">{sq.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">Snippets</div>
            <div className="snippets-list">
              <button onClick={() => insertSnippet('SELECT * FROM ')}>SELECT</button>
              <button onClick={() => insertSnippet('INSERT INTO  () VALUES ()')}>INSERT</button>
              <button onClick={() => insertSnippet('UPDATE  SET  WHERE ')}>UPDATE</button>
              <button onClick={() => insertSnippet('DELETE FROM  WHERE ')}>DELETE</button>
              <button onClick={() => insertSnippet('JOIN  ON ')}>JOIN</button>
              <button onClick={() => insertSnippet('GROUP BY ')}>GROUP BY</button>
            </div>
          </div>
        </div>

        <div className="main-panel">
          <div className="query-editor">
            <div className="editor-toolbar">
              <button className="run-btn" onClick={executeQuery} disabled={isExecuting}>
                {isExecuting ? '⏳ Running...' : '▶ Run Query'}
              </button>
              <button className="save-btn" onClick={saveQuery}>💾 Save</button>
              <button className="format-btn">📝 Format</button>
              <button className="clear-btn" onClick={() => setQuery('')}>🗑️ Clear</button>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="query-input"
              placeholder="Enter your SQL query..."
              spellCheck={false}
            />
          </div>

          <div className="results-panel">
            <div className="results-tabs">
              <button
                className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                Results
              </button>
              <button
                className={`tab ${activeTab === 'schema' ? 'active' : ''}`}
                onClick={() => setActiveTab('schema')}
              >
                Schema
              </button>
              <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            <div className="results-content">
              {activeTab === 'results' && (
                <>
                  <div className="results-meta">
                    <span>{result.rowCount} rows</span>
                    <span>Execution time: {result.executionTime}s</span>
                  </div>
                  <div className="results-table">
                    <table>
                      <thead>
                        <tr>
                          {result.columns.map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, i) => (
                          <tr key={i}>
                            {result.columns.map(col => (
                              <td key={col}>
                                {typeof row[col] === 'boolean'
                                  ? (row[col] ? '✓' : '✗')
                                  : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === 'schema' && (
                <div className="schema-view">
                  <h4>{selectedTable}</h4>
                  <table className="schema-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Nullable</th>
                        <th>Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables.find(t => t.name === selectedTable)?.columns.map(col => (
                        <tr key={col.name}>
                          <td>{col.name}</td>
                          <td><code>{col.type}</code></td>
                          <td>{col.nullable ? 'YES' : 'NO'}</td>
                          <td>{col.primary ? 'PRI' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="history-list">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className={`history-item ${h.success ? 'success' : 'error'}`}
                      onClick={() => setQuery(h.query)}
                    >
                      <span className="history-status">{h.success ? '✓' : '✗'}</span>
                      <div className="history-query">{h.query}</div>
                      <span className="history-time">
                        {h.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sql-builder {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .builder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .builder-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .builder-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .sidebar {
          width: 220px;
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
          padding: 12px;
        }
        .section { margin-bottom: 16px; }
        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .db-select {
          width: 100%;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .tables-list, .saved-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .table-item, .saved-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .table-item:hover, .saved-item:hover { background: var(--bg-secondary); }
        .table-item.selected { background: var(--bg-secondary); color: var(--accent-color); }
        .snippets-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .snippets-list button {
          padding: 4px 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 3px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 10px;
        }
        .main-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .query-editor {
          border-bottom: 1px solid var(--border-color);
        }
        .editor-toolbar {
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .editor-toolbar button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .run-btn { background: #27ae60; color: white; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .save-btn, .format-btn, .clear-btn {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color) !important;
        }
        .query-input {
          width: 100%;
          height: 120px;
          padding: 12px;
          background: var(--bg-primary);
          border: none;
          color: var(--text-primary);
          font-family: monospace;
          font-size: 13px;
          resize: none;
        }
        .query-input:focus { outline: none; }
        .results-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .results-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        .tab {
          padding: 8px 16px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
        }
        .tab.active {
          color: var(--accent-color);
          border-bottom: 2px solid var(--accent-color);
        }
        .results-content {
          flex: 1;
          overflow: auto;
        }
        .results-meta {
          display: flex;
          gap: 16px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          font-size: 11px;
          color: var(--text-secondary);
        }
        .results-table {
          overflow: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        th {
          background: var(--bg-secondary);
          font-weight: 500;
          position: sticky;
          top: 0;
        }
        tr:hover td { background: var(--bg-secondary); }
        .schema-view { padding: 16px; }
        .schema-view h4 { margin: 0 0 12px 0; }
        .schema-table code {
          padding: 2px 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          font-size: 11px;
        }
        .history-list { padding: 8px; }
        .history-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 4px;
        }
        .history-item:hover { background: var(--bg-secondary); }
        .history-item.success .history-status { color: #27ae60; }
        .history-item.error .history-status { color: #e74c3c; }
        .history-query {
          flex: 1;
          font-family: monospace;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .history-time { font-size: 10px; color: var(--text-tertiary); }
      `}</style>
    </div>
  );
}
