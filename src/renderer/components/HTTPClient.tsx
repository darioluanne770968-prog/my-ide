import React, { useState } from 'react';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  status?: number;
  time?: number;
  timestamp: Date;
}

interface HTTPClientProps {
  onClose: () => void;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

function HTTPClient({ onClose }: HTTPClientProps) {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState<'json' | 'form' | 'raw'>('json');
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('headers');
  const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'cookies'>('body');

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    if (!url) {
      setError('URL is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key).forEach(h => {
        requestHeaders[h.key] = h.value;
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody: string;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        responseBody = JSON.stringify(json, null, 2);
      } else {
        responseBody = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: endTime - startTime
      });

      setHistory(prev => [{
        id: Date.now().toString(),
        method,
        url,
        status: res.status,
        time: endTime - startTime,
        timestamp: new Date()
      }, ...prev.slice(0, 49)]);

    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: RequestHistory) => {
    setMethod(item.method as HttpMethod);
    setUrl(item.url);
  };

  const getStatusColor = (status?: number) => {
    if (!status) return '';
    if (status < 300) return 'status-success';
    if (status < 400) return 'status-redirect';
    if (status < 500) return 'status-client-error';
    return 'status-server-error';
  };

  return (
    <div className="http-client">
      <div className="http-header">
        <h3>HTTP Client</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="http-content">
        <div className="http-main">
          <div className="request-bar">
            <select value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
            <input
              type="text"
              placeholder="Enter URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
            />
            <button onClick={sendRequest} disabled={isLoading} className="send-btn">
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="request-options">
            <div className="tabs">
              <button className={activeTab === 'headers' ? 'active' : ''} onClick={() => setActiveTab('headers')}>
                Headers ({headers.filter(h => h.enabled).length})
              </button>
              <button className={activeTab === 'body' ? 'active' : ''} onClick={() => setActiveTab('body')}>
                Body
              </button>
              <button className={activeTab === 'auth' ? 'active' : ''} onClick={() => setActiveTab('auth')}>
                Auth
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'headers' && (
                <div className="headers-editor">
                  {headers.map((header, idx) => (
                    <div key={idx} className="header-row">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(idx, 'enabled', e.target.checked)}
                      />
                      <input
                        type="text"
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                      />
                      <button onClick={() => removeHeader(idx)}>×</button>
                    </div>
                  ))}
                  <button onClick={addHeader} className="add-header-btn">+ Add Header</button>
                </div>
              )}

              {activeTab === 'body' && (
                <div className="body-editor">
                  <div className="body-type-selector">
                    <label><input type="radio" checked={bodyType === 'json'} onChange={() => setBodyType('json')} /> JSON</label>
                    <label><input type="radio" checked={bodyType === 'form'} onChange={() => setBodyType('form')} /> Form</label>
                    <label><input type="radio" checked={bodyType === 'raw'} onChange={() => setBodyType('raw')} /> Raw</label>
                  </div>
                  <textarea
                    placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                  />
                </div>
              )}

              {activeTab === 'auth' && (
                <div className="auth-editor">
                  <p>Add authentication headers in the Headers tab</p>
                  <div className="auth-presets">
                    <button onClick={() => setHeaders([...headers, { key: 'Authorization', value: 'Bearer ', enabled: true }])}>
                      + Bearer Token
                    </button>
                    <button onClick={() => setHeaders([...headers, { key: 'Authorization', value: 'Basic ', enabled: true }])}>
                      + Basic Auth
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="response-section">
            <div className="response-header">
              <span>Response</span>
              {response && (
                <span className={`status-badge ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText} • {response.time}ms
                </span>
              )}
            </div>

            {error && <div className="response-error">{error}</div>}

            {response && (
              <>
                <div className="tabs">
                  <button className={responseTab === 'body' ? 'active' : ''} onClick={() => setResponseTab('body')}>Body</button>
                  <button className={responseTab === 'headers' ? 'active' : ''} onClick={() => setResponseTab('headers')}>Headers</button>
                </div>

                <div className="response-content">
                  {responseTab === 'body' && (
                    <pre className="response-body"><code>{response.body}</code></pre>
                  )}
                  {responseTab === 'headers' && (
                    <div className="response-headers">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="response-header-item">
                          <span className="header-key">{key}:</span>
                          <span className="header-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="http-sidebar">
          <h4>History</h4>
          <div className="history-list">
            {history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => loadFromHistory(item)}
              >
                <span className={`method method-${item.method.toLowerCase()}`}>{item.method}</span>
                <span className="history-url" title={item.url}>{item.url}</span>
                {item.status && (
                  <span className={`status-badge small ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                )}
              </div>
            ))}
            {history.length === 0 && <div className="history-empty">No requests yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HTTPClient;
