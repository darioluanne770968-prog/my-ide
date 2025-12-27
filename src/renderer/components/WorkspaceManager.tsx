import React, { useState, useEffect } from 'react';

interface WorkspaceFolder {
  path: string;
  name: string;
  color?: string;
}

interface Workspace {
  id: string;
  name: string;
  folders: WorkspaceFolder[];
  settings?: Record<string, any>;
  createdAt: Date;
  lastOpened: Date;
}

interface WorkspaceManagerProps {
  currentWorkspace?: Workspace;
  onOpenWorkspace: (workspace: Workspace) => void;
  onClose: () => void;
}

function WorkspaceManager({ currentWorkspace, onOpenWorkspace, onClose }: WorkspaceManagerProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newFolders, setNewFolders] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    // Simulate loading workspaces from storage
    const saved = localStorage.getItem('my-ide-workspaces');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWorkspaces(parsed.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          lastOpened: new Date(w.lastOpened)
        })));
      } catch {
        setWorkspaces([]);
      }
    }
  };

  const saveWorkspaces = (ws: Workspace[]) => {
    localStorage.setItem('my-ide-workspaces', JSON.stringify(ws));
    setWorkspaces(ws);
  };

  const createWorkspace = () => {
    if (!newWorkspaceName || newFolders.length === 0) return;

    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: newWorkspaceName,
      folders: newFolders.map(path => ({
        path,
        name: path.split('/').pop() || path
      })),
      createdAt: new Date(),
      lastOpened: new Date()
    };

    saveWorkspaces([...workspaces, newWorkspace]);
    setShowNewForm(false);
    setNewWorkspaceName('');
    setNewFolders([]);
  };

  const deleteWorkspace = (id: string) => {
    if (!confirm('Delete this workspace?')) return;
    saveWorkspaces(workspaces.filter(w => w.id !== id));
    if (selectedWorkspace?.id === id) {
      setSelectedWorkspace(null);
    }
  };

  const addFolder = async () => {
    // In real implementation, this would open a folder dialog
    const mockPath = prompt('Enter folder path:');
    if (mockPath && !newFolders.includes(mockPath)) {
      setNewFolders([...newFolders, mockPath]);
    }
  };

  const removeFolder = (path: string) => {
    setNewFolders(newFolders.filter(f => f !== path));
  };

  const openWorkspace = (workspace: Workspace) => {
    const updated = workspaces.map(w =>
      w.id === workspace.id ? { ...w, lastOpened: new Date() } : w
    );
    saveWorkspaces(updated);
    onOpenWorkspace(workspace);
    onClose();
  };

  const updateWorkspaceFolder = (workspaceId: string, folderIndex: number, updates: Partial<WorkspaceFolder>) => {
    const updated = workspaces.map(w => {
      if (w.id === workspaceId) {
        const folders = [...w.folders];
        folders[folderIndex] = { ...folders[folderIndex], ...updates };
        return { ...w, folders };
      }
      return w;
    });
    saveWorkspaces(updated);
  };

  const folderColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

  return (
    <div className="workspace-manager">
      <div className="workspace-header">
        <h3>Workspace Manager</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="workspace-toolbar">
        <button onClick={() => setShowNewForm(true)}>+ New Workspace</button>
      </div>

      {showNewForm && (
        <div className="new-workspace-form">
          <h4>Create New Workspace</h4>
          <div className="form-group">
            <label>Workspace Name</label>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="My Workspace"
            />
          </div>

          <div className="form-group">
            <label>Folders</label>
            <div className="folders-list">
              {newFolders.map(folder => (
                <div key={folder} className="folder-item">
                  <span>{folder}</span>
                  <button onClick={() => removeFolder(folder)}>×</button>
                </div>
              ))}
            </div>
            <button onClick={addFolder} className="add-folder-btn">
              + Add Folder
            </button>
          </div>

          <div className="form-actions">
            <button onClick={() => setShowNewForm(false)}>Cancel</button>
            <button
              onClick={createWorkspace}
              disabled={!newWorkspaceName || newFolders.length === 0}
              className="create-btn"
            >
              Create Workspace
            </button>
          </div>
        </div>
      )}

      <div className="workspace-content">
        {currentWorkspace && (
          <div className="current-workspace">
            <h4>Current Workspace</h4>
            <div className="workspace-item current">
              <span className="workspace-name">{currentWorkspace.name}</span>
              <span className="folder-count">{currentWorkspace.folders.length} folders</span>
            </div>
          </div>
        )}

        <div className="workspace-list">
          <h4>Saved Workspaces</h4>
          {workspaces.length > 0 ? (
            workspaces.map(workspace => (
              <div
                key={workspace.id}
                className={`workspace-item ${selectedWorkspace?.id === workspace.id ? 'selected' : ''}`}
                onClick={() => setSelectedWorkspace(workspace)}
              >
                <div className="workspace-info">
                  <span className="workspace-name">{workspace.name}</span>
                  <span className="workspace-meta">
                    {workspace.folders.length} folders • Last opened {workspace.lastOpened.toLocaleDateString()}
                  </span>
                  <div className="workspace-folders">
                    {workspace.folders.slice(0, 3).map((folder, idx) => (
                      <span
                        key={folder.path}
                        className="folder-badge"
                        style={{ backgroundColor: folder.color || folderColors[idx % folderColors.length] }}
                      >
                        {folder.name}
                      </span>
                    ))}
                    {workspace.folders.length > 3 && (
                      <span className="more-folders">+{workspace.folders.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="workspace-actions">
                  <button onClick={() => openWorkspace(workspace)}>Open</button>
                  <button onClick={() => deleteWorkspace(workspace.id)}>🗑️</button>
                </div>
              </div>
            ))
          ) : (
            <div className="workspace-empty">
              <p>No workspaces saved</p>
              <p>Create a workspace to manage multiple project folders</p>
            </div>
          )}
        </div>

        {selectedWorkspace && (
          <div className="workspace-details">
            <h4>Workspace Details</h4>
            <div className="details-content">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedWorkspace.name}</span>
              </div>
              <div className="detail-row">
                <label>Created:</label>
                <span>{selectedWorkspace.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <label>Folders:</label>
                <div className="folders-detail">
                  {selectedWorkspace.folders.map((folder, idx) => (
                    <div key={folder.path} className="folder-detail-item">
                      <input
                        type="color"
                        value={folder.color || folderColors[idx % folderColors.length]}
                        onChange={(e) => updateWorkspaceFolder(selectedWorkspace.id, idx, { color: e.target.value })}
                      />
                      <span className="folder-name">{folder.name}</span>
                      <span className="folder-path">{folder.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceManager;
