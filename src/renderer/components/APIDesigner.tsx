import { useState } from 'react';

interface APIDesignerProps {
  onClose: () => void;
}

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
  tags: string[];
}

interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header';
  type: string;
  required: boolean;
  description: string;
}

interface RequestBody {
  contentType: string;
  schema: string;
  example: string;
}

interface Response {
  status: number;
  description: string;
  schema?: string;
}

export default function APIDesigner({ onClose }: APIDesignerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'test' | 'docs'>('design');
  const [testResponse, setTestResponse] = useState<string>('');

  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    {
      id: '1',
      method: 'GET',
      path: '/api/users',
      description: 'Get all users with pagination',
      parameters: [
        { name: 'page', in: 'query', type: 'integer', required: false, description: 'Page number' },
        { name: 'limit', in: 'query', type: 'integer', required: false, description: 'Items per page' }
      ],
      requestBody: undefined,
      responses: [
        { status: 200, description: 'Success', schema: '{ users: User[], total: number }' },
        { status: 401, description: 'Unauthorized' }
      ],
      tags: ['users']
    },
    {
      id: '2',
      method: 'POST',
      path: '/api/users',
      description: 'Create a new user',
      parameters: [],
      requestBody: {
        contentType: 'application/json',
        schema: '{ name: string, email: string, password: string }',
        example: '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "password": "secret123"\n}'
      },
      responses: [
        { status: 201, description: 'Created', schema: '{ id: string, name: string, email: string }' },
        { status: 400, description: 'Validation error' },
        { status: 409, description: 'Email already exists' }
      ],
      tags: ['users']
    },
    {
      id: '3',
      method: 'GET',
      path: '/api/users/{id}',
      description: 'Get user by ID',
      parameters: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'User ID' }
      ],
      requestBody: undefined,
      responses: [
        { status: 200, description: 'Success', schema: 'User' },
        { status: 404, description: 'User not found' }
      ],
      tags: ['users']
    },
    {
      id: '4',
      method: 'PUT',
      path: '/api/users/{id}',
      description: 'Update user',
      parameters: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'User ID' }
      ],
      requestBody: {
        contentType: 'application/json',
        schema: '{ name?: string, email?: string }',
        example: '{\n  "name": "Jane Doe"\n}'
      },
      responses: [
        { status: 200, description: 'Updated' },
        { status: 404, description: 'User not found' }
      ],
      tags: ['users']
    },
    {
      id: '5',
      method: 'DELETE',
      path: '/api/users/{id}',
      description: 'Delete user',
      parameters: [
        { name: 'id', in: 'path', type: 'string', required: true, description: 'User ID' }
      ],
      requestBody: undefined,
      responses: [
        { status: 204, description: 'Deleted' },
        { status: 404, description: 'User not found' }
      ],
      tags: ['users']
    }
  ]);

  const getMethodColor = (method: Endpoint['method']) => {
    const colors = {
      GET: '#27ae60',
      POST: '#3498db',
      PUT: '#f39c12',
      DELETE: '#e74c3c',
      PATCH: '#9b59b6'
    };
    return colors[method];
  };

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: Date.now().toString(),
      method: 'GET',
      path: '/api/new-endpoint',
      description: 'New endpoint',
      parameters: [],
      responses: [{ status: 200, description: 'Success' }],
      tags: []
    };
    setEndpoints(prev => [...prev, newEndpoint]);
    setSelectedEndpoint(newEndpoint);
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(e => e.id !== id));
    if (selectedEndpoint?.id === id) {
      setSelectedEndpoint(null);
    }
  };

  const testEndpoint = async () => {
    setTestResponse('Loading...');
    await new Promise(resolve => setTimeout(resolve, 500));
    setTestResponse(JSON.stringify({
      status: 200,
      data: {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        total: 2
      }
    }, null, 2));
  };

  const generateDocs = () => {
    return `# API Documentation

## Base URL
\`https://api.example.com\`

## Endpoints

${endpoints.map(e => `### ${e.method} ${e.path}
${e.description}

${e.parameters.length > 0 ? `**Parameters:**
${e.parameters.map(p => `- \`${p.name}\` (${p.in}, ${p.type}${p.required ? ', required' : ''}): ${p.description}`).join('\n')}` : ''}

${e.requestBody ? `**Request Body:**
\`\`\`json
${e.requestBody.example}
\`\`\`` : ''}

**Responses:**
${e.responses.map(r => `- \`${r.status}\`: ${r.description}${r.schema ? ` - ${r.schema}` : ''}`).join('\n')}
`).join('\n---\n\n')}`;
  };

  return (
    <div className="api-designer">
      <div className="designer-header">
        <h3>API Designer</h3>
        <div className="header-actions">
          <button className="export-btn">Export OpenAPI</button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="designer-content">
        <div className="sidebar">
          <div className="sidebar-header">
            <span>Endpoints</span>
            <button className="add-btn" onClick={addEndpoint}>+</button>
          </div>

          <div className="endpoints-list">
            {endpoints.map(endpoint => (
              <div
                key={endpoint.id}
                className={`endpoint-item ${selectedEndpoint?.id === endpoint.id ? 'selected' : ''}`}
                onClick={() => setSelectedEndpoint(endpoint)}
              >
                <span
                  className="method-badge"
                  style={{ background: getMethodColor(endpoint.method) }}
                >
                  {endpoint.method}
                </span>
                <span className="endpoint-path">{endpoint.path}</span>
              </div>
            ))}
          </div>

          <div className="tags-section">
            <div className="section-title">Tags</div>
            <div className="tags-list">
              {['users', 'auth', 'orders', 'products'].map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="main-panel">
          {selectedEndpoint ? (
            <>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'design' ? 'active' : ''}`}
                  onClick={() => setActiveTab('design')}
                >
                  Design
                </button>
                <button
                  className={`tab ${activeTab === 'test' ? 'active' : ''}`}
                  onClick={() => setActiveTab('test')}
                >
                  Test
                </button>
                <button
                  className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('docs')}
                >
                  Documentation
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'design' && (
                  <div className="design-view">
                    <div className="endpoint-header">
                      <select
                        value={selectedEndpoint.method}
                        className="method-select"
                        style={{ background: getMethodColor(selectedEndpoint.method) }}
                      >
                        {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={selectedEndpoint.path}
                        className="path-input"
                      />
                      <button
                        className="delete-btn"
                        onClick={() => deleteEndpoint(selectedEndpoint.id)}
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <input type="text" value={selectedEndpoint.description} />
                    </div>

                    <div className="section">
                      <div className="section-header">
                        <span>Parameters</span>
                        <button className="add-small-btn">+ Add</button>
                      </div>
                      {selectedEndpoint.parameters.length > 0 ? (
                        <table className="params-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>In</th>
                              <th>Type</th>
                              <th>Required</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEndpoint.parameters.map(param => (
                              <tr key={param.name}>
                                <td><code>{param.name}</code></td>
                                <td>{param.in}</td>
                                <td>{param.type}</td>
                                <td>{param.required ? '✓' : ''}</td>
                                <td>{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-message">No parameters</div>
                      )}
                    </div>

                    {selectedEndpoint.requestBody && (
                      <div className="section">
                        <div className="section-header">
                          <span>Request Body</span>
                        </div>
                        <div className="code-block">
                          <pre>{selectedEndpoint.requestBody.example}</pre>
                        </div>
                      </div>
                    )}

                    <div className="section">
                      <div className="section-header">
                        <span>Responses</span>
                        <button className="add-small-btn">+ Add</button>
                      </div>
                      <div className="responses-list">
                        {selectedEndpoint.responses.map(resp => (
                          <div key={resp.status} className="response-item">
                            <span className={`status-code ${resp.status < 400 ? 'success' : 'error'}`}>
                              {resp.status}
                            </span>
                            <span className="response-desc">{resp.description}</span>
                            {resp.schema && (
                              <code className="response-schema">{resp.schema}</code>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'test' && (
                  <div className="test-view">
                    <div className="test-header">
                      <span
                        className="method-badge"
                        style={{ background: getMethodColor(selectedEndpoint.method) }}
                      >
                        {selectedEndpoint.method}
                      </span>
                      <input
                        type="text"
                        value={`https://api.example.com${selectedEndpoint.path}`}
                        className="url-input"
                        readOnly
                      />
                      <button className="send-btn" onClick={testEndpoint}>Send</button>
                    </div>

                    {selectedEndpoint.parameters.length > 0 && (
                      <div className="test-params">
                        <h4>Parameters</h4>
                        {selectedEndpoint.parameters.map(param => (
                          <div key={param.name} className="param-input">
                            <label>{param.name}</label>
                            <input type="text" placeholder={param.description} />
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedEndpoint.requestBody && (
                      <div className="test-body">
                        <h4>Request Body</h4>
                        <textarea defaultValue={selectedEndpoint.requestBody.example} />
                      </div>
                    )}

                    <div className="test-response">
                      <h4>Response</h4>
                      <pre>{testResponse || 'Send a request to see the response'}</pre>
                    </div>
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div className="docs-view">
                    <div className="docs-toolbar">
                      <button>Copy Markdown</button>
                      <button>Export HTML</button>
                    </div>
                    <pre className="docs-content">{generateDocs()}</pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🔌</span>
              <p>Select an endpoint or create a new one</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .api-designer {
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
        .export-btn {
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
          width: 280px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          font-weight: 500;
          font-size: 13px;
        }
        .add-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: var(--accent-color);
          color: white;
          cursor: pointer;
          font-size: 16px;
        }
        .endpoints-list {
          flex: 1;
          overflow-y: auto;
        }
        .endpoint-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
        }
        .endpoint-item:hover { background: var(--bg-secondary); }
        .endpoint-item.selected { background: rgba(52, 152, 219, 0.1); }
        .method-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }
        .endpoint-path {
          font-family: monospace;
          font-size: 12px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tags-section { padding: 12px; border-top: 1px solid var(--border-color); }
        .section-title { font-size: 11px; color: var(--text-tertiary); margin-bottom: 8px; }
        .tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag {
          padding: 2px 8px;
          background: var(--bg-secondary);
          border-radius: 3px;
          font-size: 11px;
        }
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
          overflow-y: auto;
          padding: 16px;
        }
        .endpoint-header {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .method-select {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .path-input {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-family: monospace;
        }
        .delete-btn {
          padding: 8px;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .form-group input {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .section { margin-bottom: 20px; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
        }
        .add-small-btn {
          padding: 4px 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 11px;
        }
        .params-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .params-table th, .params-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        .params-table th { background: var(--bg-secondary); font-weight: 500; }
        .params-table code {
          padding: 2px 6px;
          background: var(--bg-primary);
          border-radius: 3px;
        }
        .empty-message {
          padding: 16px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 12px;
        }
        .code-block {
          background: var(--bg-secondary);
          border-radius: 4px;
          padding: 12px;
        }
        .code-block pre {
          margin: 0;
          font-family: monospace;
          font-size: 12px;
        }
        .responses-list { display: flex; flex-direction: column; gap: 8px; }
        .response-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .status-code {
          padding: 2px 8px;
          border-radius: 3px;
          font-weight: 600;
          font-size: 12px;
        }
        .status-code.success { background: rgba(39, 174, 96, 0.2); color: #27ae60; }
        .status-code.error { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
        .response-desc { flex: 1; font-size: 12px; }
        .response-schema { font-size: 11px; color: var(--text-secondary); }
        .test-view { display: flex; flex-direction: column; gap: 16px; }
        .test-header { display: flex; gap: 8px; }
        .url-input {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-family: monospace;
          font-size: 12px;
        }
        .send-btn {
          padding: 8px 20px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        .test-params h4, .test-body h4, .test-response h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
        }
        .param-input {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .param-input label { width: 100px; font-size: 12px; }
        .param-input input {
          flex: 1;
          padding: 6px 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
        }
        .test-body textarea {
          width: 100%;
          height: 120px;
          padding: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-family: monospace;
          font-size: 12px;
          resize: vertical;
        }
        .test-response pre {
          margin: 0;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          min-height: 100px;
          overflow: auto;
        }
        .docs-view { display: flex; flex-direction: column; gap: 12px; }
        .docs-toolbar { display: flex; gap: 8px; }
        .docs-toolbar button {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
        .docs-content {
          margin: 0;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre-wrap;
          overflow: auto;
        }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
      `}</style>
    </div>
  );
}
