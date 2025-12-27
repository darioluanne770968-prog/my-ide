import React, { useState, useEffect } from 'react';

interface SSHConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: 'password' | 'key';
  keyPath?: string;
  isConnected: boolean;
  lastConnected?: Date;
}

interface RemoteFile {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

interface RemoteSSHProps {
  onOpenRemoteFolder: (connection: SSHConnection, path: string) => void;
  onClose: () => void;
}

function RemoteSSH({ onOpenRemoteFolder, onClose }: RemoteSSHProps) {
  const [connections, setConnections] = useState<SSHConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<SSHConnection | null>(null);
  const [remoteFiles, setRemoteFiles] = useState<RemoteFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/home');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [newConn, setNewConn] = useState<Partial<SSHConnection>>({
    port: 22,
    authType: 'key'
  });
  const [password, setPassword] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');

  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = () => {
    const saved = localStorage.getItem('my-ide-ssh-connections');
    if (saved) {
      try {
        setConnections(JSON.parse(saved));
      } catch {
        setConnections([]);
      }
    }
  };

  const saveConnections = (conns: SSHConnection[]) => {
    localStorage.setItem('my-ide-ssh-connections', JSON.stringify(conns));
    setConnections(conns);
  };

  const addConnection = () => {
    if (!newConn.name || !newConn.host || !newConn.username) return;

    const connection: SSHConnection = {
      id: `ssh-${Date.now()}`,
      name: newConn.name,
      host: newConn.host,
      port: newConn.port || 22,
      username: newConn.username,
      authType: newConn.authType || 'key',
      keyPath: newConn.keyPath,
      isConnected: false
    };

    saveConnections([...connections, connection]);
    setShowNewConnection(false);
    setNewConn({ port: 22, authType: 'key' });
  };

  const connect = async (connection: SSHConnection) => {
    setIsConnecting(true);
    setTerminalOutput(['Connecting to ' + connection.host + '...']);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setTerminalOutput(prev => [...prev, `Connected to ${connection.host} as ${connection.username}`]);

    const updatedConn = { ...connection, isConnected: true, lastConnected: new Date() };
    setActiveConnection(updatedConn);
    saveConnections(connections.map(c => c.id === connection.id ? updatedConn : c));

    // Load mock remote files
    loadRemoteFiles('/home/' + connection.username);
    setIsConnecting(false);
  };

  const disconnect = () => {
    if (activeConnection) {
      setTerminalOutput(prev => [...prev, 'Disconnected']);
      saveConnections(connections.map(c =>
        c.id === activeConnection.id ? { ...c, isConnected: false } : c
      ));
      setActiveConnection(null);
      setRemoteFiles([]);
    }
  };

  const loadRemoteFiles = async (path: string) => {
    setCurrentPath(path);

    // Mock remote files
    const mockFiles: RemoteFile[] = [
      { name: '..', path: path.split('/').slice(0, -1).join('/') || '/', isDirectory: true, size: 0, modified: new Date() },
      { name: 'projects', path: `${path}/projects`, isDirectory: true, size: 0, modified: new Date() },
      { name: 'documents', path: `${path}/documents`, isDirectory: true, size: 0, modified: new Date() },
      { name: '.bashrc', path: `${path}/.bashrc`, isDirectory: false, size: 3456, modified: new Date() },
      { name: '.gitconfig', path: `${path}/.gitconfig`, isDirectory: false, size: 234, modified: new Date() },
      { name: 'README.md', path: `${path}/README.md`, isDirectory: false, size: 1234, modified: new Date() }
    ];

    setRemoteFiles(mockFiles);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setTerminalOutput(prev => [...prev, `$ ${command}`]);

    // Mock command execution
    await new Promise(resolve => setTimeout(resolve, 300));

    if (command === 'ls') {
      setTerminalOutput(prev => [...prev, remoteFiles.map(f => f.name).join('  ')]);
    } else if (command === 'pwd') {
      setTerminalOutput(prev => [...prev, currentPath]);
    } else if (command.startsWith('cd ')) {
      const newPath = command.slice(3);
      loadRemoteFiles(newPath.startsWith('/') ? newPath : `${currentPath}/${newPath}`);
      setTerminalOutput(prev => [...prev, '']);
    } else {
      setTerminalOutput(prev => [...prev, `Command executed: ${command}`]);
    }

    setCommand('');
  };

  const deleteConnection = (id: string) => {
    if (!confirm('Delete this connection?')) return;
    saveConnections(connections.filter(c => c.id !== id));
  };

  const openFolder = (path: string) => {
    if (activeConnection) {
      onOpenRemoteFolder(activeConnection, path);
      onClose();
    }
  };

  return (
    <div className="remote-ssh">
      <div className="ssh-header">
        <h3>🔐 Remote SSH</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="ssh-content">
        <div className="ssh-sidebar">
          <div className="connections-header">
            <span>SSH Connections</span>
            <button onClick={() => setShowNewConnection(true)}>+</button>
          </div>

          {showNewConnection && (
            <div className="new-connection-form">
              <input
                type="text"
                placeholder="Connection name"
                value={newConn.name || ''}
                onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Host (e.g., 192.168.1.100)"
                value={newConn.host || ''}
                onChange={(e) => setNewConn({ ...newConn, host: e.target.value })}
              />
              <input
                type="number"
                placeholder="Port (default: 22)"
                value={newConn.port || 22}
                onChange={(e) => setNewConn({ ...newConn, port: Number(e.target.value) })}
              />
              <input
                type="text"
                placeholder="Username"
                value={newConn.username || ''}
                onChange={(e) => setNewConn({ ...newConn, username: e.target.value })}
              />
              <select
                value={newConn.authType}
                onChange={(e) => setNewConn({ ...newConn, authType: e.target.value as any })}
              >
                <option value="key">SSH Key</option>
                <option value="password">Password</option>
              </select>
              {newConn.authType === 'key' && (
                <input
                  type="text"
                  placeholder="Key path (e.g., ~/.ssh/id_rsa)"
                  value={newConn.keyPath || ''}
                  onChange={(e) => setNewConn({ ...newConn, keyPath: e.target.value })}
                />
              )}
              <div className="form-actions">
                <button onClick={() => setShowNewConnection(false)}>Cancel</button>
                <button onClick={addConnection}>Add</button>
              </div>
            </div>
          )}

          <div className="connections-list">
            {connections.map(conn => (
              <div
                key={conn.id}
                className={`connection-item ${conn.isConnected ? 'connected' : ''}`}
              >
                <div className="conn-info">
                  <span className="conn-status">{conn.isConnected ? '🟢' : '⚪'}</span>
                  <span className="conn-name">{conn.name}</span>
                  <span className="conn-host">{conn.username}@{conn.host}</span>
                </div>
                <div className="conn-actions">
                  {!conn.isConnected ? (
                    <button onClick={() => connect(conn)} disabled={isConnecting}>
                      Connect
                    </button>
                  ) : (
                    <button onClick={disconnect}>Disconnect</button>
                  )}
                  <button onClick={() => deleteConnection(conn.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ssh-main">
          {activeConnection ? (
            <>
              <div className="remote-explorer">
                <div className="explorer-header">
                  <span className="current-path">{currentPath}</span>
                  <button onClick={() => openFolder(currentPath)}>📂 Open in IDE</button>
                </div>
                <div className="file-list">
                  {remoteFiles.map(file => (
                    <div
                      key={file.path}
                      className={`file-item ${file.isDirectory ? 'directory' : 'file'}`}
                      onClick={() => file.isDirectory && loadRemoteFiles(file.path)}
                      onDoubleClick={() => file.isDirectory && openFolder(file.path)}
                    >
                      <span className="file-icon">{file.isDirectory ? '📁' : '📄'}</span>
                      <span className="file-name">{file.name}</span>
                      {!file.isDirectory && (
                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="ssh-terminal">
                <div className="terminal-output">
                  {terminalOutput.map((line, i) => (
                    <div key={i} className="terminal-line">{line}</div>
                  ))}
                </div>
                <div className="terminal-input">
                  <span className="prompt">$</span>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
                    placeholder="Enter command..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="ssh-empty">
              <h4>🔐 Remote Development</h4>
              <p>Connect to a remote server to edit files directly</p>
              <ul>
                <li>Edit files on remote servers</li>
                <li>Run commands via SSH</li>
                <li>Use remote terminal</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemoteSSH;
