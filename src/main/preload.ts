import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // File operations
  openFolder: (): Promise<string | null> => ipcRenderer.invoke('open-folder'),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  readFile: (filePath: string): Promise<string | null> => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string): Promise<boolean> => ipcRenderer.invoke('write-file', filePath, content),
  createFile: (filePath: string) => ipcRenderer.invoke('create-file', filePath),
  createFolder: (folderPath: string) => ipcRenderer.invoke('create-folder', folderPath),
  renameFile: (oldPath: string, newPath: string) => ipcRenderer.invoke('rename-file', oldPath, newPath),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  getFileStat: (filePath: string) => ipcRenderer.invoke('get-file-stat', filePath),

  // Search operations
  searchFiles: (rootPath: string, query: string) => ipcRenderer.invoke('search-files', rootPath, query),
  searchInFiles: (rootPath: string, query: string, options: { caseSensitive: boolean; useRegex: boolean }) =>
    ipcRenderer.invoke('search-in-files', rootPath, query, options),

  // Git operations
  gitStatus: (rootPath: string) => ipcRenderer.invoke('git-status', rootPath),
  gitLog: (rootPath: string, maxCount: number) => ipcRenderer.invoke('git-log', rootPath, maxCount),
  gitAdd: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-add', rootPath, filePath),
  gitUnstage: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-unstage', rootPath, filePath),
  gitCommit: (rootPath: string, message: string) => ipcRenderer.invoke('git-commit', rootPath, message),
  gitPush: (rootPath: string) => ipcRenderer.invoke('git-push', rootPath),
  gitPull: (rootPath: string) => ipcRenderer.invoke('git-pull', rootPath),
  gitBranches: (rootPath: string) => ipcRenderer.invoke('git-branches', rootPath),
  gitCheckout: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-checkout', rootPath, branchName),
  gitCreateBranch: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-create-branch', rootPath, branchName),
  gitDeleteBranch: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-delete-branch', rootPath, branchName),
  gitMerge: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-merge', rootPath, branchName),
  gitDiff: (rootPath: string, filePath?: string) => ipcRenderer.invoke('git-diff', rootPath, filePath),
  gitBlame: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-blame', rootPath, filePath),
  gitStashList: (rootPath: string) => ipcRenderer.invoke('git-stash-list', rootPath),
  gitStash: (rootPath: string, message?: string) => ipcRenderer.invoke('git-stash', rootPath, message),
  gitStashPop: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-pop', rootPath, index),
  gitStashApply: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-apply', rootPath, index),
  gitStashDrop: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-drop', rootPath, index),

  // Terminal operations
  createTerminal: (terminalId: string, cwd: string) => ipcRenderer.invoke('create-terminal', terminalId, cwd),
  writeTerminal: (terminalId: string, data: string) => ipcRenderer.invoke('write-terminal', terminalId, data),
  resizeTerminal: (terminalId: string, cols: number, rows: number) => ipcRenderer.invoke('resize-terminal', terminalId, cols, rows),
  killTerminal: (terminalId: string) => ipcRenderer.invoke('kill-terminal', terminalId),
  onTerminalData: (callback: (event: any, terminalId: string, data: string) => void) => {
    ipcRenderer.on('terminal-data', callback);
    return () => ipcRenderer.removeListener('terminal-data', callback);
  },

  // Settings operations
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // AI operations
  sendAIMessage: (apiKey: string, model: string, messages: Array<{ role: string; content: string }>) =>
    ipcRenderer.invoke('send-ai-message', apiKey, model, messages),
  getAICompletion: (apiKey: string, model: string, context: string, currentLine: string, language: string) =>
    ipcRenderer.invoke('get-ai-completion', apiKey, model, context, currentLine, language),

  // NPM Script operations
  runNpmScript: (rootPath: string, scriptName: string) => ipcRenderer.invoke('run-npm-script', rootPath, scriptName),
  stopNpmScript: (scriptName: string) => ipcRenderer.invoke('stop-npm-script', scriptName),
  onTaskOutput: (callback: (taskId: string, data: string) => void) => {
    const handler = (_: any, taskId: string, data: string) => callback(taskId, data);
    ipcRenderer.on('task-output', handler);
    return () => ipcRenderer.removeListener('task-output', handler);
  },
  onTaskComplete: (callback: (taskId: string) => void) => {
    const handler = (_: any, taskId: string) => callback(taskId);
    ipcRenderer.on('task-complete', handler);
    return () => ipcRenderer.removeListener('task-complete', handler);
  },

  // File watch operations
  watchDirectory: (dirPath: string) => ipcRenderer.invoke('watch-directory', dirPath),
  unwatchDirectory: (dirPath: string) => ipcRenderer.invoke('unwatch-directory', dirPath),
  onFileChanged: (callback: (event: { type: string; path: string }) => void) => {
    const handler = (_: any, event: { type: string; path: string }) => callback(event);
    ipcRenderer.on('file-changed', handler);
    return () => ipcRenderer.removeListener('file-changed', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
