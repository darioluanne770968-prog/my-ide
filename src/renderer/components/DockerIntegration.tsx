import React, { useState, useEffect } from 'react';

interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting';
  ports: string[];
  created: Date;
}

interface Image {
  id: string;
  name: string;
  tag: string;
  size: string;
  created: Date;
}

interface DockerIntegrationProps {
  rootPath: string;
  onClose: () => void;
}

type TabType = 'containers' | 'images' | 'compose' | 'logs';

function DockerIntegration({ rootPath, onClose }: DockerIntegrationProps) {
  const [activeTab, setActiveTab] = useState<TabType>('containers');
  const [containers, setContainers] = useState<Container[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [hasDockerfile, setHasDockerfile] = useState(false);
  const [hasCompose, setHasCompose] = useState(false);

  useEffect(() => {
    checkDockerFiles();
    loadContainers();
    loadImages();
  }, [rootPath]);

  const checkDockerFiles = async () => {
    // Check if Dockerfile and docker-compose.yml exist
    setHasDockerfile(true); // Mock
    setHasCompose(true); // Mock
  };

  const loadContainers = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockContainers: Container[] = [
      {
        id: 'abc123',
        name: 'my-app-web',
        image: 'node:18-alpine',
        status: 'running',
        ports: ['3000:3000'],
        created: new Date(Date.now() - 86400000)
      },
      {
        id: 'def456',
        name: 'my-app-db',
        image: 'postgres:15',
        status: 'running',
        ports: ['5432:5432'],
        created: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: 'ghi789',
        name: 'redis-cache',
        image: 'redis:7-alpine',
        status: 'stopped',
        ports: ['6379:6379'],
        created: new Date(Date.now() - 86400000 * 5)
      }
    ];

    setContainers(mockContainers);
    setIsLoading(false);
  };

  const loadImages = async () => {
    const mockImages: Image[] = [
      { id: 'img1', name: 'node', tag: '18-alpine', size: '175 MB', created: new Date() },
      { id: 'img2', name: 'postgres', tag: '15', size: '380 MB', created: new Date() },
      { id: 'img3', name: 'redis', tag: '7-alpine', size: '32 MB', created: new Date() },
      { id: 'img4', name: 'nginx', tag: 'alpine', size: '42 MB', created: new Date() }
    ];
    setImages(mockImages);
  };

  const startContainer = async (id: string) => {
    setContainers(containers.map(c =>
      c.id === id ? { ...c, status: 'running' } : c
    ));
  };

  const stopContainer = async (id: string) => {
    setContainers(containers.map(c =>
      c.id === id ? { ...c, status: 'stopped' } : c
    ));
  };

  const restartContainer = async (id: string) => {
    setContainers(containers.map(c =>
      c.id === id ? { ...c, status: 'restarting' } : c
    ));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setContainers(containers.map(c =>
      c.id === id ? { ...c, status: 'running' } : c
    ));
  };

  const removeContainer = async (id: string) => {
    if (!confirm('Remove this container?')) return;
    setContainers(containers.filter(c => c.id !== id));
  };

  const viewLogs = async (container: Container) => {
    setSelectedContainer(container);
    setActiveTab('logs');
    setLogs(`[${new Date().toISOString()}] Starting container ${container.name}...
[${new Date().toISOString()}] Container started successfully
[${new Date().toISOString()}] Listening on port ${container.ports[0]?.split(':')[0] || '3000'}
[${new Date().toISOString()}] Ready to accept connections`);
  };

  const runDockerBuild = async () => {
    setLogs('Building Docker image...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLogs(prev => prev + 'Step 1/5: FROM node:18-alpine\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Step 2/5: WORKDIR /app\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Step 3/5: COPY package*.json ./\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLogs(prev => prev + 'Step 4/5: RUN npm install\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Step 5/5: COPY . .\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + '\nSuccessfully built image: my-app:latest\n');
    loadImages();
  };

  const runComposeUp = async () => {
    setActiveTab('logs');
    setLogs('docker-compose up -d\n\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLogs(prev => prev + 'Creating network "my-app_default"\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Creating my-app-db ... done\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Creating my-app-web ... done\n');
    loadContainers();
  };

  const runComposeDown = async () => {
    setActiveTab('logs');
    setLogs('docker-compose down\n\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLogs(prev => prev + 'Stopping my-app-web ... done\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Stopping my-app-db ... done\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    setLogs(prev => prev + 'Removing containers ... done\n');
    setContainers([]);
  };

  const getStatusColor = (status: Container['status']) => {
    switch (status) {
      case 'running': return '#2ecc71';
      case 'stopped': return '#95a5a6';
      case 'paused': return '#f1c40f';
      case 'restarting': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="docker-integration">
      <div className="docker-header">
        <h3>🐳 Docker</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="docker-tabs">
        <button className={activeTab === 'containers' ? 'active' : ''} onClick={() => setActiveTab('containers')}>
          Containers ({containers.length})
        </button>
        <button className={activeTab === 'images' ? 'active' : ''} onClick={() => setActiveTab('images')}>
          Images ({images.length})
        </button>
        <button className={activeTab === 'compose' ? 'active' : ''} onClick={() => setActiveTab('compose')}>
          Compose
        </button>
        <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
          Logs
        </button>
      </div>

      <div className="docker-content">
        {activeTab === 'containers' && (
          <div className="containers-list">
            <div className="list-header">
              <button onClick={loadContainers}>🔄 Refresh</button>
            </div>
            {containers.map(container => (
              <div key={container.id} className="container-item">
                <div className="container-status" style={{ backgroundColor: getStatusColor(container.status) }} />
                <div className="container-info">
                  <span className="container-name">{container.name}</span>
                  <span className="container-image">{container.image}</span>
                  <span className="container-ports">{container.ports.join(', ')}</span>
                </div>
                <div className="container-actions">
                  {container.status === 'running' ? (
                    <button onClick={() => stopContainer(container.id)}>⏹️</button>
                  ) : (
                    <button onClick={() => startContainer(container.id)}>▶️</button>
                  )}
                  <button onClick={() => restartContainer(container.id)}>🔄</button>
                  <button onClick={() => viewLogs(container)}>📋</button>
                  <button onClick={() => removeContainer(container.id)}>🗑️</button>
                </div>
              </div>
            ))}
            {containers.length === 0 && (
              <div className="empty-message">No containers running</div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="images-list">
            <div className="list-header">
              {hasDockerfile && (
                <button onClick={runDockerBuild}>🔨 Build Image</button>
              )}
            </div>
            {images.map(image => (
              <div key={image.id} className="image-item">
                <span className="image-name">{image.name}:{image.tag}</span>
                <span className="image-size">{image.size}</span>
                <span className="image-date">{image.created.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="compose-panel">
            {hasCompose ? (
              <>
                <div className="compose-status">
                  <span className="status-icon">✅</span>
                  <span>docker-compose.yml found</span>
                </div>
                <div className="compose-actions">
                  <button onClick={runComposeUp} className="up-btn">
                    ▶️ docker-compose up
                  </button>
                  <button onClick={runComposeDown} className="down-btn">
                    ⏹️ docker-compose down
                  </button>
                </div>
              </>
            ) : (
              <div className="compose-missing">
                <p>No docker-compose.yml found in project</p>
                <button>Create docker-compose.yml</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-panel">
            <div className="logs-header">
              {selectedContainer && <span>Logs: {selectedContainer.name}</span>}
              <button onClick={() => setLogs('')}>Clear</button>
            </div>
            <pre className="logs-content">{logs || 'No logs to display'}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DockerIntegration;
