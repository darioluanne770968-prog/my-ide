import React, { useState } from 'react';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'redis';
  host: string;
  port: number;
  database: string;
  username?: string;
  isConnected: boolean;
}

interface Table {
  name: string;
  schema: string;
  rowCount: number;
  columns: Column[];
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isForeign: boolean;
}

interface DatabaseExplorerProps {
  onClose: () => void;
}

function DatabaseExplorer({ onClose }: DatabaseExplorerProps) {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [queryText, setQueryText] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<DatabaseConnection>>({
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: ''
  });

  const addConnection = () => {
    if (!newConnection.name || !newConnection.database) return;

    const connection: DatabaseConnection = {
      id: `conn-${Date.now()}`,
      name: newConnection.name!,
      type: newConnection.type as any,
      host: newConnection.host || 'localhost',
      port: newConnection.port || 5432,
      database: newConnection.database!,
      username: newConnection.username,
      isConnected: false
    };

    setConnections([...connections, connection]);
    setShowNewConnection(false);
    setNewConnection({ type: 'postgresql', host: 'localhost', port: 5432, database: '' });
  };

  const connect = async (connection: DatabaseConnection) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setConnections(connections.map(c =>
      c.id === connection.id ? { ...c, isConnected: true } : c
    ));
    setActiveConnection({ ...connection, isConnected: true });

    // Mock tables
    setTables([
      {
        name: 'users',
        schema: 'public',
        rowCount: 1500,
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimary: true, isForeign: false },
          { name: 'email', type: 'varchar(255)', nullable: false, isPrimary: false, isForeign: false },
          { name: 'name', type: 'varchar(100)', nullable: true, isPrimary: false, isForeign: false },
          { name: 'created_at', type: 'timestamp', nullable: false, isPrimary: false, isForeign: false }
        ]
      },
      {
        name: 'posts',
        schema: 'public',
        rowCount: 5000,
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimary: true, isForeign: false },
          { name: 'title', type: 'varchar(255)', nullable: false, isPrimary: false, isForeign: false },
          { name: 'content', type: 'text', nullable: true, isPrimary: false, isForeign: false },
          { name: 'user_id', type: 'integer', nullable: false, isPrimary: false, isForeign: true }
        ]
      },
      {
        name: 'comments',
        schema: 'public',
        rowCount: 12000,
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimary: true, isForeign: false },
          { name: 'post_id', type: 'integer', nullable: false, isPrimary: false, isForeign: true },
          { name: 'user_id', type: 'integer', nullable: false, isPrimary: false, isForeign: true },
          { name: 'body', type: 'text', nullable: false, isPrimary: false, isForeign: false }
        ]
      }
    ]);

    setIsLoading(false);
  };

  const disconnect = (connectionId: string) => {
    setConnections(connections.map(c =>
      c.id === connectionId ? { ...c, isConnected: false } : c
    ));
    if (activeConnection?.id === connectionId) {
      setActiveConnection(null);
      setTables([]);
      setSelectedTable(null);
    }
  };

  const executeQuery = async () => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock query results
    if (queryText.toLowerCase().includes('select')) {
      setQueryResults([
        { id: 1, email: 'john@example.com', name: 'John Doe', created_at: '2024-01-15' },
        { id: 2, email: 'jane@example.com', name: 'Jane Smith', created_at: '2024-01-16' },
        { id: 3, email: 'bob@example.com', name: 'Bob Wilson', created_at: '2024-01-17' }
      ]);
    } else {
      setQueryResults([{ affected_rows: 1 }]);
    }

    setIsLoading(false);
  };

  const selectTable = (table: Table) => {
    setSelectedTable(table);
    setQueryText(`SELECT * FROM ${table.schema}.${table.name} LIMIT 100;`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'postgresql': return '🐘';
      case 'mysql': return '🐬';
      case 'sqlite': return '📁';
      case 'mongodb': return '🍃';
      case 'redis': return '🔴';
      default: return '💾';
    }
  };

  return (
    <div className="database-explorer">
      <div className="db-header">
        <h3>💾 Database Explorer</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="db-content">
        <div className="db-sidebar">
          <div className="connections-header">
            <span>Connections</span>
            <button onClick={() => setShowNewConnection(true)}>+</button>
          </div>

          {showNewConnection && (
            <div className="new-connection-form">
              <input
                type="text"
                placeholder="Connection name"
                value={newConnection.name || ''}
                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
              />
              <select
                value={newConnection.type}
                onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value as any })}
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
                <option value="mongodb">MongoDB</option>
                <option value="redis">Redis</option>
              </select>
              <input
                type="text"
                placeholder="Host"
                value={newConnection.host || ''}
                onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
              />
              <input
                type="number"
                placeholder="Port"
                value={newConnection.port || ''}
                onChange={(e) => setNewConnection({ ...newConnection, port: Number(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Database"
                value={newConnection.database || ''}
                onChange={(e) => setNewConnection({ ...newConnection, database: e.target.value })}
              />
              <input
                type="text"
                placeholder="Username"
                value={newConnection.username || ''}
                onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
              />
              <div className="form-buttons">
                <button onClick={() => setShowNewConnection(false)}>Cancel</button>
                <button onClick={addConnection}>Add</button>
              </div>
            </div>
          )}

          <div className="connections-list">
            {connections.map(conn => (
              <div key={conn.id} className={`connection-item ${conn.isConnected ? 'connected' : ''}`}>
                <span className="conn-icon">{getTypeIcon(conn.type)}</span>
                <span className="conn-name">{conn.name}</span>
                {conn.isConnected ? (
                  <button onClick={() => disconnect(conn.id)}>Disconnect</button>
                ) : (
                  <button onClick={() => connect(conn)}>Connect</button>
                )}
              </div>
            ))}
          </div>

          {activeConnection && (
            <div className="tables-section">
              <div className="tables-header">Tables</div>
              <div className="tables-list">
                {tables.map(table => (
                  <div
                    key={table.name}
                    className={`table-item ${selectedTable?.name === table.name ? 'selected' : ''}`}
                    onClick={() => selectTable(table)}
                  >
                    <span className="table-icon">📋</span>
                    <span className="table-name">{table.name}</span>
                    <span className="row-count">{table.rowCount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="db-main">
          {selectedTable && (
            <div className="table-structure">
              <h4>{selectedTable.name} Structure</h4>
              <table>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Nullable</th>
                    <th>Key</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.columns.map(col => (
                    <tr key={col.name}>
                      <td>{col.name}</td>
                      <td>{col.type}</td>
                      <td>{col.nullable ? 'YES' : 'NO'}</td>
                      <td>
                        {col.isPrimary && '🔑'}
                        {col.isForeign && '🔗'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="query-editor">
            <div className="query-header">
              <span>Query</span>
              <button onClick={executeQuery} disabled={isLoading || !activeConnection}>
                {isLoading ? 'Running...' : '▶ Run Query'}
              </button>
            </div>
            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Enter SQL query..."
              disabled={!activeConnection}
            />
          </div>

          {queryResults.length > 0 && (
            <div className="query-results">
              <div className="results-header">
                Results ({queryResults.length} rows)
              </div>
              <table>
                <thead>
                  <tr>
                    {Object.keys(queryResults[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResults.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => (
                        <td key={j}>{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatabaseExplorer;
