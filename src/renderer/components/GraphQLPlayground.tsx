import React, { useState } from 'react';

interface QueryHistory {
  id: string;
  query: string;
  variables: string;
  timestamp: Date;
}

interface GraphQLPlaygroundProps {
  onClose: () => void;
}

function GraphQLPlayground({ onClose }: GraphQLPlaygroundProps) {
  const [endpoint, setEndpoint] = useState('');
  const [query, setQuery] = useState(`query {

}`);
  const [variables, setVariables] = useState('{}');
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json'
  });
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'query' | 'variables' | 'headers'>('query');
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [schema, setSchema] = useState<any>(null);
  const [showDocs, setShowDocs] = useState(false);

  const executeQuery = async () => {
    if (!endpoint || !query) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch {
        throw new Error('Invalid JSON in variables');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables: parsedVariables
        })
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      setHistory(prev => [{
        id: Date.now().toString(),
        query,
        variables,
        timestamp: new Date()
      }, ...prev.slice(0, 19)]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchema = async () => {
    if (!endpoint) return;

    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            description
            fields {
              name
              description
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: introspectionQuery })
      });

      const data = await res.json();
      setSchema(data.data?.__schema);
      setShowDocs(true);
    } catch (err: any) {
      setError(`Failed to fetch schema: ${err.message}`);
    }
  };

  const prettifyQuery = () => {
    // Simple prettify - in real implementation would use proper parser
    let formatted = query
      .replace(/\s+/g, ' ')
      .replace(/\{\s*/g, ' {\n  ')
      .replace(/\}\s*/g, '\n}\n')
      .replace(/,\s*/g, '\n  ');
    setQuery(formatted.trim());
  };

  const loadFromHistory = (item: QueryHistory) => {
    setQuery(item.query);
    setVariables(item.variables);
  };

  const addHeader = (key: string, value: string) => {
    setHeaders({ ...headers, [key]: value });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
  };

  return (
    <div className="graphql-playground">
      <div className="gql-header">
        <h3>GraphQL Playground</h3>
        <div className="gql-actions">
          <button onClick={fetchSchema} title="Fetch Schema">📋 Schema</button>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="gql-content">
        <div className="gql-main">
          <div className="gql-endpoint">
            <input
              type="text"
              placeholder="https://api.example.com/graphql"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
            <button onClick={executeQuery} disabled={isLoading} className="execute-btn">
              {isLoading ? 'Running...' : '▶ Execute'}
            </button>
          </div>

          <div className="gql-editor-section">
            <div className="tabs">
              <button
                className={activeTab === 'query' ? 'active' : ''}
                onClick={() => setActiveTab('query')}
              >
                Query
              </button>
              <button
                className={activeTab === 'variables' ? 'active' : ''}
                onClick={() => setActiveTab('variables')}
              >
                Variables
              </button>
              <button
                className={activeTab === 'headers' ? 'active' : ''}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
              <button onClick={prettifyQuery} className="prettify-btn">Prettify</button>
            </div>

            <div className="editor-container">
              {activeTab === 'query' && (
                <textarea
                  className="gql-query-editor"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="query { ... }"
                  spellCheck={false}
                />
              )}

              {activeTab === 'variables' && (
                <textarea
                  className="gql-variables-editor"
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  placeholder='{ "key": "value" }'
                  spellCheck={false}
                />
              )}

              {activeTab === 'headers' && (
                <div className="gql-headers-editor">
                  {Object.entries(headers).map(([key, value]) => (
                    <div key={key} className="header-row">
                      <input type="text" value={key} readOnly />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => addHeader(key, e.target.value)}
                      />
                      <button onClick={() => removeHeader(key)}>×</button>
                    </div>
                  ))}
                  <button
                    className="add-header-btn"
                    onClick={() => addHeader('', '')}
                  >
                    + Add Header
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="gql-response">
            <div className="response-header">
              <span>Response</span>
            </div>
            {error && <div className="gql-error">{error}</div>}
            <pre className="response-body"><code>{response || 'Execute a query to see results'}</code></pre>
          </div>
        </div>

        <div className="gql-sidebar">
          {showDocs && schema ? (
            <div className="gql-docs">
              <div className="docs-header">
                <h4>Schema</h4>
                <button onClick={() => setShowDocs(false)}>×</button>
              </div>
              <div className="docs-content">
                {schema.types
                  .filter((t: any) => !t.name.startsWith('__'))
                  .slice(0, 20)
                  .map((type: any) => (
                    <div key={type.name} className="type-item">
                      <span className="type-name">{type.name}</span>
                      <span className="type-kind">{type.kind}</span>
                      {type.fields && (
                        <div className="type-fields">
                          {type.fields.slice(0, 5).map((field: any) => (
                            <div key={field.name} className="field-item">
                              {field.name}: {field.type?.name || 'unknown'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="gql-history">
              <h4>History</h4>
              <div className="history-list">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => loadFromHistory(item)}
                  >
                    <span className="history-query">
                      {item.query.substring(0, 50)}...
                    </span>
                    <span className="history-time">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="history-empty">No queries yet</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GraphQLPlayground;
