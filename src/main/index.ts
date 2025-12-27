import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { simpleGit, SimpleGit } from 'simple-git';

// Dynamic import for node-pty since it's a native module
let pty: typeof import('node-pty') | null = null;
try {
  pty = require('node-pty');
} catch (e) {
  console.warn('node-pty not available:', e);
}

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV !== 'production';

// Store terminal instances
const terminals: Map<string, any> = new Map();

// Settings path
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'My IDE',
    backgroundColor: '#1e1e1e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Clean up terminals
  terminals.forEach((term) => term.kill());
  terminals.clear();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ==================== File Operations ====================

ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('read-directory', async (_, dirPath: string) => {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.name.startsWith('.'))
      .map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory(),
      }));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
});

ipcMain.handle('create-file', async (_, filePath: string) => {
  try {
    await fs.promises.writeFile(filePath, '', 'utf-8');
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('create-folder', async (_, folderPath: string) => {
  try {
    await fs.promises.mkdir(folderPath, { recursive: true });
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('rename-file', async (_, oldPath: string, newPath: string) => {
  try {
    await fs.promises.rename(oldPath, newPath);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('delete-file', async (_, filePath: string) => {
  try {
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      await fs.promises.rm(filePath, { recursive: true });
    } else {
      await fs.promises.unlink(filePath);
    }
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('get-file-stat', async (_, filePath: string) => {
  try {
    const stat = await fs.promises.stat(filePath);
    return {
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      size: stat.size,
      mtime: stat.mtime.toISOString(),
      ctime: stat.ctime.toISOString(),
    };
  } catch (error) {
    return null;
  }
});

// ==================== Search Operations ====================

ipcMain.handle('search-files', async (_, rootPath: string, query: string) => {
  const results: string[] = [];
  const searchQuery = query.toLowerCase();

  async function searchDir(dirPath: string) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else if (entry.name.toLowerCase().includes(searchQuery)) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  await searchDir(rootPath);
  return results.slice(0, 100);
});

ipcMain.handle('search-in-files', async (_, rootPath: string, query: string, options: { caseSensitive: boolean; useRegex: boolean }) => {
  const results: Array<{
    filePath: string;
    fileName: string;
    matches: Array<{ line: number; column: number; text: string; matchStart: number; matchEnd: number }>;
  }> = [];

  const searchRegex = options.useRegex
    ? new RegExp(query, options.caseSensitive ? 'g' : 'gi')
    : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options.caseSensitive ? 'g' : 'gi');

  async function searchDir(dirPath: string) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else {
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            const fileMatches: Array<{ line: number; column: number; text: string; matchStart: number; matchEnd: number }> = [];

            lines.forEach((line, idx) => {
              let match;
              searchRegex.lastIndex = 0;
              while ((match = searchRegex.exec(line)) !== null) {
                fileMatches.push({
                  line: idx + 1,
                  column: match.index + 1,
                  text: line.trim().substring(0, 100),
                  matchStart: match.index,
                  matchEnd: match.index + match[0].length,
                });
              }
            });

            if (fileMatches.length > 0) {
              results.push({
                filePath: fullPath,
                fileName: entry.name,
                matches: fileMatches.slice(0, 10),
              });
            }
          } catch (error) {
            // Skip binary files
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  await searchDir(rootPath);
  return results.slice(0, 50);
});

// ==================== Git Operations ====================

function getGit(rootPath: string): SimpleGit {
  return simpleGit(rootPath);
}

ipcMain.handle('git-status', async (_, rootPath: string) => {
  try {
    const git = getGit(rootPath);
    const status = await git.status();
    return {
      current: status.current,
      tracking: status.tracking,
      staged: status.staged,
      modified: status.modified,
      untracked: status.not_added,
      ahead: status.ahead,
      behind: status.behind,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-log', async (_, rootPath: string, maxCount: number) => {
  try {
    const git = getGit(rootPath);
    const log = await git.log({ maxCount });
    return log.all.map((entry) => ({
      hash: entry.hash,
      message: entry.message,
      date: entry.date,
      author: entry.author_name,
    }));
  } catch (error: any) {
    return [];
  }
});

ipcMain.handle('git-add', async (_, rootPath: string, filePath: string) => {
  try {
    const git = getGit(rootPath);
    await git.add(filePath);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-unstage', async (_, rootPath: string, filePath: string) => {
  try {
    const git = getGit(rootPath);
    await git.reset(['HEAD', filePath]);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-commit', async (_, rootPath: string, message: string) => {
  try {
    const git = getGit(rootPath);
    await git.commit(message);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-push', async (_, rootPath: string) => {
  try {
    const git = getGit(rootPath);
    await git.push();
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-pull', async (_, rootPath: string) => {
  try {
    const git = getGit(rootPath);
    await git.pull();
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-branches', async (_, rootPath: string) => {
  try {
    const git = getGit(rootPath);
    const branches = await git.branch();
    return Object.entries(branches.branches).map(([name, data]) => ({
      name,
      current: data.current,
      tracking: (data as any).tracking || null,
    }));
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-checkout', async (_, rootPath: string, branchName: string) => {
  try {
    const git = getGit(rootPath);
    await git.checkout(branchName);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-create-branch', async (_, rootPath: string, branchName: string) => {
  try {
    const git = getGit(rootPath);
    await git.checkoutLocalBranch(branchName);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-delete-branch', async (_, rootPath: string, branchName: string) => {
  try {
    const git = getGit(rootPath);
    await git.deleteLocalBranch(branchName);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-merge', async (_, rootPath: string, branchName: string) => {
  try {
    const git = getGit(rootPath);
    await git.merge([branchName]);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-diff', async (_, rootPath: string, filePath?: string) => {
  try {
    const git = getGit(rootPath);
    const diff = filePath ? await git.diff([filePath]) : await git.diff();
    return diff;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-blame', async (_, rootPath: string, filePath: string) => {
  try {
    const git = getGit(rootPath);
    const relativePath = path.relative(rootPath, filePath);
    const result = await git.raw(['blame', '--line-porcelain', relativePath]);

    const lines: Array<{
      hash: string;
      author: string;
      date: string;
      line: number;
      content: string;
    }> = [];

    const blocks = result.split(/(?=^[a-f0-9]{40})/m);
    let lineNumber = 1;

    for (const block of blocks) {
      if (!block.trim()) continue;

      const hashMatch = block.match(/^([a-f0-9]{40})/);
      const authorMatch = block.match(/^author (.+)$/m);
      const dateMatch = block.match(/^author-time (\d+)$/m);
      const contentMatch = block.match(/^\t(.*)$/m);

      if (hashMatch && contentMatch) {
        lines.push({
          hash: hashMatch[1],
          author: authorMatch ? authorMatch[1] : 'Unknown',
          date: dateMatch ? new Date(parseInt(dateMatch[1]) * 1000).toISOString() : '',
          line: lineNumber++,
          content: contentMatch[1],
        });
      }
    }

    return lines;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-stash-list', async (_, rootPath: string) => {
  try {
    const git = getGit(rootPath);
    const result = await git.stashList();
    return result.all.map((entry, index) => ({
      index,
      message: entry.message,
      date: entry.date,
    }));
  } catch (error: any) {
    return [];
  }
});

ipcMain.handle('git-stash', async (_, rootPath: string, message?: string) => {
  try {
    const git = getGit(rootPath);
    if (message) {
      await git.stash(['push', '-m', message]);
    } else {
      await git.stash();
    }
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-stash-pop', async (_, rootPath: string, index: number) => {
  try {
    const git = getGit(rootPath);
    await git.stash(['pop', `stash@{${index}}`]);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-stash-apply', async (_, rootPath: string, index: number) => {
  try {
    const git = getGit(rootPath);
    await git.stash(['apply', `stash@{${index}}`]);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('git-stash-drop', async (_, rootPath: string, index: number) => {
  try {
    const git = getGit(rootPath);
    await git.stash(['drop', `stash@{${index}}`]);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

// ==================== Terminal Operations ====================

ipcMain.handle('create-terminal', (_, terminalId: string, cwd: string) => {
  if (!pty) {
    console.error('node-pty not available');
    return false;
  }

  const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh';

  const terminal = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd,
    env: process.env as { [key: string]: string },
  });

  terminal.onData((data: string) => {
    if (mainWindow) {
      mainWindow.webContents.send('terminal-data', terminalId, data);
    }
  });

  terminals.set(terminalId, terminal);
  return true;
});

ipcMain.handle('write-terminal', (_, terminalId: string, data: string) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.write(data);
    return true;
  }
  return false;
});

ipcMain.handle('resize-terminal', (_, terminalId: string, cols: number, rows: number) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.resize(cols, rows);
    return true;
  }
  return false;
});

ipcMain.handle('kill-terminal', (_, terminalId: string) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.kill();
    terminals.delete(terminalId);
    return true;
  }
  return false;
});

// ==================== Settings Operations ====================

ipcMain.handle('load-settings', async () => {
  try {
    const data = await fs.promises.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
});

ipcMain.handle('save-settings', async (_, settings: any) => {
  try {
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
});

// ==================== AI Operations ====================

ipcMain.handle('send-ai-message', async (_, apiKey: string, model: string, messages: Array<{ role: string; content: string }>) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json() as { content: Array<{ text: string }> };
    return data.content[0].text;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

ipcMain.handle('get-ai-completion', async (_, apiKey: string, model: string, context: string, currentLine: string, language: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `You are a code completion assistant. Given the following ${language} code context, provide a SHORT completion for the current line. Only output the completion text, nothing else. No explanations.

Context:
${context}

Current line to complete: ${currentLine}

Completion:`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as { content: Array<{ text: string }> };
    const completion = data.content[0].text.trim();
    // Return only short completions
    return completion.length <= 100 ? completion : null;
  } catch (error) {
    return null;
  }
});

// ==================== NPM Script Operations ====================

const runningTasks: Map<string, any> = new Map();

ipcMain.handle('run-npm-script', async (_, rootPath: string, scriptName: string) => {
  const { spawn } = require('child_process');
  const taskId = `task-${Date.now()}`;

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(npmCmd, ['run', scriptName], {
    cwd: rootPath,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  runningTasks.set(scriptName, child);

  child.stdout.on('data', (data: Buffer) => {
    if (mainWindow) {
      mainWindow.webContents.send('task-output', taskId, data.toString());
    }
  });

  child.stderr.on('data', (data: Buffer) => {
    if (mainWindow) {
      mainWindow.webContents.send('task-output', taskId, data.toString());
    }
  });

  child.on('close', () => {
    runningTasks.delete(scriptName);
    if (mainWindow) {
      mainWindow.webContents.send('task-complete', taskId);
    }
  });

  return taskId;
});

ipcMain.handle('stop-npm-script', async (_, scriptName: string) => {
  const child = runningTasks.get(scriptName);
  if (child) {
    child.kill();
    runningTasks.delete(scriptName);
    return true;
  }
  return false;
});

// ==================== Watch File Changes ====================

const watchers: Map<string, fs.FSWatcher> = new Map();

ipcMain.handle('watch-directory', async (_, dirPath: string) => {
  if (watchers.has(dirPath)) return true;

  try {
    const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (mainWindow && filename) {
        mainWindow.webContents.send('file-changed', {
          type: eventType,
          path: path.join(dirPath, filename),
        });
      }
    });

    watchers.set(dirPath, watcher);
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('unwatch-directory', async (_, dirPath: string) => {
  const watcher = watchers.get(dirPath);
  if (watcher) {
    watcher.close();
    watchers.delete(dirPath);
    return true;
  }
  return false;
});
