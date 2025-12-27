export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface FileStat {
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  created: number;
  modified: number;
}

export interface GitStatus {
  current: string | null;
  tracking: string | null;
  staged: string[];
  modified: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface GitLogEntry {
  hash: string;
  message: string;
  date: string;
  author: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
}

export interface GitStashEntry {
  index: number;
  message: string;
  date: string;
}

export interface GitBlameEntry {
  line: number;
  hash: string;
  author: string;
  date: string;
  content: string;
}

export interface SearchResult {
  filePath: string;
  fileName: string;
  matches: Array<{
    line: number;
    column: number;
    text: string;
    matchStart: number;
    matchEnd: number;
  }>;
}

interface ElectronAPI {
  // File operations
  openFolder: () => Promise<string | null>;
  readDirectory: (dirPath: string) => Promise<FileEntry[]>;
  readFile: (filePath: string) => Promise<string | null>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
  createFile: (filePath: string) => Promise<boolean>;
  createFolder: (folderPath: string) => Promise<boolean>;
  renameFile: (oldPath: string, newPath: string) => Promise<boolean>;
  deleteFile: (filePath: string) => Promise<boolean>;
  getFileStat: (filePath: string) => Promise<FileStat | null>;

  // Search operations
  searchFiles: (rootPath: string, query: string) => Promise<string[]>;
  searchInFiles: (
    rootPath: string,
    query: string,
    options: { caseSensitive: boolean; useRegex: boolean }
  ) => Promise<SearchResult[]>;

  // Git operations
  gitStatus: (rootPath: string) => Promise<GitStatus>;
  gitLog: (rootPath: string, maxCount: number) => Promise<GitLogEntry[]>;
  gitAdd: (rootPath: string, filePath: string) => Promise<boolean>;
  gitUnstage: (rootPath: string, filePath: string) => Promise<boolean>;
  gitCommit: (rootPath: string, message: string) => Promise<boolean>;
  gitPush: (rootPath: string) => Promise<boolean>;
  gitPull: (rootPath: string) => Promise<boolean>;
  gitBranches: (rootPath: string) => Promise<GitBranch[]>;
  gitCheckout: (rootPath: string, branchName: string) => Promise<boolean>;
  gitCreateBranch: (rootPath: string, branchName: string) => Promise<boolean>;
  gitDeleteBranch: (rootPath: string, branchName: string) => Promise<boolean>;
  gitMerge: (rootPath: string, branchName: string) => Promise<boolean>;
  gitDiff: (rootPath: string, filePath?: string) => Promise<string>;
  gitBlame: (rootPath: string, filePath: string) => Promise<GitBlameEntry[]>;
  gitStashList: (rootPath: string) => Promise<GitStashEntry[]>;
  gitStash: (rootPath: string, message?: string) => Promise<boolean>;
  gitStashPop: (rootPath: string, index: number) => Promise<boolean>;
  gitStashApply: (rootPath: string, index: number) => Promise<boolean>;
  gitStashDrop: (rootPath: string, index: number) => Promise<boolean>;

  // Terminal operations
  createTerminal: (terminalId: string, cwd: string) => Promise<boolean>;
  writeTerminal: (terminalId: string, data: string) => Promise<boolean>;
  resizeTerminal: (terminalId: string, cols: number, rows: number) => Promise<boolean>;
  killTerminal: (terminalId: string) => Promise<boolean>;
  onTerminalData: (callback: (event: any, terminalId: string, data: string) => void) => () => void;

  // Settings operations
  loadSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;

  // AI operations
  sendAIMessage: (
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>
  ) => Promise<string>;
  getAICompletion: (
    apiKey: string,
    model: string,
    context: string,
    currentLine: string,
    language: string
  ) => Promise<string>;

  // NPM Script operations
  runNpmScript: (rootPath: string, scriptName: string) => Promise<string>;
  stopNpmScript: (scriptName: string) => Promise<boolean>;
  onTaskOutput: (callback: (taskId: string, data: string) => void) => () => void;
  onTaskComplete: (callback: (taskId: string) => void) => () => void;

  // File watch operations
  watchDirectory: (dirPath: string) => Promise<boolean>;
  unwatchDirectory: (dirPath: string) => Promise<boolean>;
  onFileChanged: (callback: (event: { type: string; path: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
