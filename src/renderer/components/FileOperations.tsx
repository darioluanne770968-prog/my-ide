import React, { useState } from 'react';

interface FileOperationsProps {
  rootPath: string | null;
  selectedPath: string | null;
  onRefresh: () => void;
  onFileCreated: (path: string) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

interface DialogState {
  type: 'newFile' | 'newFolder' | 'rename' | 'delete' | null;
  currentPath?: string;
  currentName?: string;
}

function FileOperations({
  rootPath,
  selectedPath,
  onRefresh,
  onFileCreated,
  onNotify,
}: FileOperationsProps) {
  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const [inputValue, setInputValue] = useState('');

  const openDialog = (type: DialogState['type'], currentPath?: string, currentName?: string) => {
    setDialog({ type, currentPath, currentName });
    setInputValue(currentName || '');
  };

  const closeDialog = () => {
    setDialog({ type: null });
    setInputValue('');
  };

  const handleNewFile = async () => {
    if (!rootPath || !inputValue.trim()) return;
    const parentPath = selectedPath || rootPath;
    const newPath = `${parentPath}/${inputValue.trim()}`;

    try {
      await window.electronAPI.createFile(newPath);
      onRefresh();
      onFileCreated(newPath);
      onNotify(`Created file: ${inputValue}`, 'success');
      closeDialog();
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  const handleNewFolder = async () => {
    if (!rootPath || !inputValue.trim()) return;
    const parentPath = selectedPath || rootPath;
    const newPath = `${parentPath}/${inputValue.trim()}`;

    try {
      await window.electronAPI.createFolder(newPath);
      onRefresh();
      onNotify(`Created folder: ${inputValue}`, 'success');
      closeDialog();
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  const handleRename = async () => {
    if (!dialog.currentPath || !inputValue.trim()) return;
    const parentPath = dialog.currentPath.substring(0, dialog.currentPath.lastIndexOf('/'));
    const newPath = `${parentPath}/${inputValue.trim()}`;

    try {
      await window.electronAPI.renameFile(dialog.currentPath, newPath);
      onRefresh();
      onNotify(`Renamed to: ${inputValue}`, 'success');
      closeDialog();
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!dialog.currentPath) return;

    try {
      await window.electronAPI.deleteFile(dialog.currentPath);
      onRefresh();
      onNotify(`Deleted: ${dialog.currentName}`, 'success');
      closeDialog();
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      switch (dialog.type) {
        case 'newFile':
          handleNewFile();
          break;
        case 'newFolder':
          handleNewFolder();
          break;
        case 'rename':
          handleRename();
          break;
      }
    } else if (e.key === 'Escape') {
      closeDialog();
    }
  };

  return (
    <>
      <div className="file-operations-bar">
        <button
          onClick={() => openDialog('newFile')}
          disabled={!rootPath}
          title="New File"
        >
          📄+
        </button>
        <button
          onClick={() => openDialog('newFolder')}
          disabled={!rootPath}
          title="New Folder"
        >
          📁+
        </button>
        <button
          onClick={() => selectedPath && openDialog('rename', selectedPath, selectedPath.split('/').pop())}
          disabled={!selectedPath}
          title="Rename"
        >
          ✏️
        </button>
        <button
          onClick={() => selectedPath && openDialog('delete', selectedPath, selectedPath.split('/').pop())}
          disabled={!selectedPath}
          title="Delete"
        >
          🗑️
        </button>
        <button
          onClick={onRefresh}
          disabled={!rootPath}
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {dialog.type && dialog.type !== 'delete' && (
        <div className="file-dialog-overlay" onClick={closeDialog}>
          <div className="file-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="file-dialog-header">
              {dialog.type === 'newFile' && 'New File'}
              {dialog.type === 'newFolder' && 'New Folder'}
              {dialog.type === 'rename' && 'Rename'}
            </div>
            <input
              type="text"
              className="file-dialog-input"
              placeholder={dialog.type === 'newFolder' ? 'Folder name' : 'File name'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="file-dialog-actions">
              <button onClick={closeDialog}>Cancel</button>
              <button
                onClick={() => {
                  if (dialog.type === 'newFile') handleNewFile();
                  else if (dialog.type === 'newFolder') handleNewFolder();
                  else if (dialog.type === 'rename') handleRename();
                }}
                className="primary"
              >
                {dialog.type === 'rename' ? 'Rename' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog.type === 'delete' && (
        <div className="file-dialog-overlay" onClick={closeDialog}>
          <div className="file-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="file-dialog-header">Delete</div>
            <p className="file-dialog-message">
              Are you sure you want to delete "{dialog.currentName}"?
            </p>
            <div className="file-dialog-actions">
              <button onClick={closeDialog}>Cancel</button>
              <button onClick={handleDelete} className="danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FileOperations;
