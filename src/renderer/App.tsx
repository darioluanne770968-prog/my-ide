import { useState, useCallback, useEffect, useRef } from 'react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import TabBar from './components/TabBar';
import ActivityBar, { PanelType } from './components/ActivityBar';
import Search from './components/Search';
import GitPanel from './components/GitPanel';
import Terminal from './components/Terminal';
import CommandPalette from './components/CommandPalette';
import Settings, { AppSettings, defaultSettings } from './components/Settings';
import AIChat from './components/AIChat';
import StatusBar from './components/StatusBar';
import FindReplace, { FindOptions } from './components/FindReplace';
import SplitEditor from './components/SplitEditor';
import Breadcrumb from './components/Breadcrumb';
import DiffViewer from './components/DiffViewer';
import ContextMenu, { MenuItem } from './components/ContextMenu';
import Notification, { NotificationItem } from './components/Notification';
import MarkdownPreview from './components/MarkdownPreview';
import ImagePreview from './components/ImagePreview';
import GitBranchManager from './components/GitBranchManager';
import GitBlame from './components/GitBlame';
import GitStash from './components/GitStash';
import FileOperations from './components/FileOperations';
import AIInlineCompletion from './components/AIInlineCompletion';
import TaskRunner from './components/TaskRunner';
import Bookmarks from './components/Bookmarks';
import GoToLine from './components/GoToLine';
// New feature imports
import ProblemsPanel, { Diagnostic } from './components/ProblemsPanel';
import Outline, { DocumentSymbol } from './components/Outline';
import GitGraph from './components/GitGraph';
import Debugger, { DebugSession, Breakpoint } from './components/Debugger';
import SnippetsManager, { Snippet, defaultSnippets } from './components/Snippets';
import RecentProjects, { RecentProject } from './components/RecentProjects';
import ThemeEditor, { CustomTheme, builtInThemes } from './components/ThemeEditor';
import ZenMode from './components/ZenMode';
import Minimap from './components/Minimap';
import ExtensionManager, { Extension } from './components/ExtensionManager';
import KeybindingsEditor, { Keybinding, defaultKeybindings } from './components/KeybindingsEditor';
import Timeline, { TimelineEntry } from './components/Timeline';
import { useLSPClient, LSPStatus } from './components/LSPClient';
import LinterConfig, { LintRule, FormatOptions, defaultESLintRules, defaultPrettierOptions } from './components/Linter';

// New feature imports - AI Enhanced
import AICommitMessage from './components/AICommitMessage';
import AICodeReview from './components/AICodeReview';
import AIRefactor from './components/AIRefactor';
import AITestGenerator from './components/AITestGenerator';
import AIDocGenerator from './components/AIDocGenerator';

// New feature imports - Protocol Support
import HTTPClient from './components/HTTPClient';
import WebSocketDebugger from './components/WebSocketDebugger';
import GraphQLPlayground from './components/GraphQLPlayground';

// New feature imports - UX
import SessionRestore from './components/SessionRestore';
import WelcomePage from './components/WelcomePage';

// New feature imports - Testing
import TestExplorer from './components/TestExplorer';
import CodeCoverage from './components/CodeCoverage';

// New feature imports - Git Enhanced
import ConflictResolver from './components/ConflictResolver';
import PRReview from './components/PRReview';
import GitWorktree from './components/GitWorktree';
import CommitSigning from './components/CommitSigning';

// New feature imports - Utilities
import DataFormatter from './components/DataFormatter';
import EncoderDecoder from './components/EncoderDecoder';
import ColorPicker from './components/ColorPicker';
import RegexTester from './components/RegexTester';
import DiffTool from './components/DiffTool';

// New feature imports - Editor Enhanced
import StickyScroll from './components/StickyScroll';
import InlayHints from './components/InlayHints';
import QuickActions from './components/QuickActions';
import CallHierarchy from './components/CallHierarchy';
import TypeHierarchy from './components/TypeHierarchy';

// New feature imports - Project Management
import WorkspaceManager from './components/WorkspaceManager';
import ProjectTemplates from './components/ProjectTemplates';
import DockerIntegration from './components/DockerIntegration';
import DatabaseExplorer from './components/DatabaseExplorer';
import PerformanceProfiler from './components/PerformanceProfiler';

// New feature imports - Collaboration
import RemoteSSH from './components/RemoteSSH';
import LiveShare from './components/LiveShare';

// New feature imports - Other
import InteractiveTutorial from './components/InteractiveTutorial';
import AutoUpdate from './components/AutoUpdate';

interface OpenFile {
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface Bookmark {
  id: string;
  filePath: string;
  fileName: string;
  line: number;
  content: string;
  label?: string;
}

function App() {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>('files');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [gitBranch, setGitBranch] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  // New feature states
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSplitEditor, setShowSplitEditor] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [diffContent, setDiffContent] = useState<{ original: string; modified: string; fileName: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ position: { x: number; y: number }; items: MenuItem[] } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showBranchManager, setShowBranchManager] = useState(false);
  const [showGitBlame, setShowGitBlame] = useState(false);
  const [showGitStash, setShowGitStash] = useState(false);
  const [showTaskRunner, setShowTaskRunner] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [findMatchCount, setFindMatchCount] = useState(0);
  const [findCurrentMatch, setFindCurrentMatch] = useState(0);

  // New feature states
  const [showProblemsPanel, setShowProblemsPanel] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [showOutline, setShowOutline] = useState(false);
  const [documentSymbols, setDocumentSymbols] = useState<DocumentSymbol[]>([]);
  const [showGitGraph, setShowGitGraph] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [showSnippets, setShowSnippets] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>(defaultSnippets);
  const [showRecentProjects, setShowRecentProjects] = useState(false);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(builtInThemes);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showExtensionManager, setShowExtensionManager] = useState(false);
  const [installedExtensions, setInstalledExtensions] = useState<Extension[]>([]);
  const [showKeybindingsEditor, setShowKeybindingsEditor] = useState(false);
  const [keybindings, setKeybindings] = useState<Keybinding[]>(defaultKeybindings);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [showLinterConfig, setShowLinterConfig] = useState(false);
  const [eslintRules, setEslintRules] = useState<LintRule[]>(defaultESLintRules);
  const [prettierOptions, setPrettierOptions] = useState<FormatOptions>(defaultPrettierOptions);
  const [lspStatus, setLspStatus] = useState<'starting' | 'ready' | 'error' | 'stopped'>('stopped');

  // New feature states - AI Enhanced
  const [showAICommitMessage, setShowAICommitMessage] = useState(false);
  const [showAICodeReview, setShowAICodeReview] = useState(false);
  const [showAIRefactor, setShowAIRefactor] = useState(false);
  const [showAITestGenerator, setShowAITestGenerator] = useState(false);
  const [showAIDocGenerator, setShowAIDocGenerator] = useState(false);

  // New feature states - Protocol Support
  const [showHTTPClient, setShowHTTPClient] = useState(false);
  const [showWebSocketDebugger, setShowWebSocketDebugger] = useState(false);
  const [showGraphQLPlayground, setShowGraphQLPlayground] = useState(false);

  // New feature states - UX
  const [showSessionRestore, setShowSessionRestore] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState(true);

  // New feature states - Testing
  const [showTestExplorer, setShowTestExplorer] = useState(false);
  const [showCodeCoverage, setShowCodeCoverage] = useState(false);

  // New feature states - Git Enhanced
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [showPRReview, setShowPRReview] = useState(false);
  const [showGitWorktree, setShowGitWorktree] = useState(false);
  const [showCommitSigning, setShowCommitSigning] = useState(false);

  // New feature states - Utilities
  const [showDataFormatter, setShowDataFormatter] = useState(false);
  const [showEncoderDecoder, setShowEncoderDecoder] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRegexTester, setShowRegexTester] = useState(false);
  const [showDiffTool, setShowDiffTool] = useState(false);

  // New feature states - Editor Enhanced
  const [showStickyScroll, setShowStickyScroll] = useState(true);
  const [showInlayHints, setShowInlayHints] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showCallHierarchy, setShowCallHierarchy] = useState(false);
  const [showTypeHierarchy, setShowTypeHierarchy] = useState(false);

  // New feature states - Project Management
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showProjectTemplates, setShowProjectTemplates] = useState(false);
  const [showDockerIntegration, setShowDockerIntegration] = useState(false);
  const [showDatabaseExplorer, setShowDatabaseExplorer] = useState(false);
  const [showPerformanceProfiler, setShowPerformanceProfiler] = useState(false);

  // New feature states - Collaboration
  const [showRemoteSSH, setShowRemoteSSH] = useState(false);
  const [showLiveShare, setShowLiveShare] = useState(false);

  // New feature states - Other
  const [showInteractiveTutorial, setShowInteractiveTutorial] = useState(false);
  const [showAutoUpdate, setShowAutoUpdate] = useState(false);

  const fileTreeRefreshKey = useRef(0);

  // LSP Client hook
  const lspClient = useLSPClient({
    rootPath: rootPath || '',
    language: activeFileData ? getLanguageFromPath(activeFileData.path) : 'typescript',
    onDiagnostics: (uri, lspDiagnostics) => {
      const newDiagnostics: Diagnostic[] = lspDiagnostics.map((d, i) => ({
        id: `${uri}-${i}`,
        filePath: uri,
        fileName: uri.split('/').pop() || uri,
        line: d.range.start.line + 1,
        column: d.range.start.character + 1,
        message: d.message,
        severity: d.severity,
        source: d.source,
        code: d.code?.toString()
      }));
      setDiagnostics(prev => {
        const filtered = prev.filter(d => d.filePath !== uri);
        return [...filtered, ...newDiagnostics];
      });
    },
    onStatusChange: setLspStatus
  });

  // Notify LSP when file opens/changes
  useEffect(() => {
    if (activeFileData && lspStatus === 'ready') {
      lspClient.didOpen(
        activeFileData.path,
        getLanguageFromPath(activeFileData.path),
        1,
        activeFileData.content
      );
    }
  }, [activeFileData?.path, lspStatus]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await window.electronAPI.loadSettings();
      if (saved) {
        setSettings({ ...defaultSettings, ...saved });
      }
    };
    loadSettings();
  }, []);

  // Load git branch when root path changes
  useEffect(() => {
    const loadGitBranch = async () => {
      if (rootPath) {
        try {
          const status = await window.electronAPI.gitStatus(rootPath);
          setGitBranch(status.current);
        } catch {
          setGitBranch(null);
        }
      } else {
        setGitBranch(null);
      }
    };
    loadGitBranch();
  }, [rootPath]);

  // File watcher setup
  useEffect(() => {
    if (rootPath) {
      window.electronAPI.watchDirectory(rootPath);
      const cleanup = window.electronAPI.onFileChanged((event) => {
        if (event.type === 'change') {
          const openFile = openFiles.find(f => f.path === event.path);
          if (openFile && !openFile.isDirty) {
            window.electronAPI.readFile(event.path).then(content => {
              if (content !== null) {
                setOpenFiles(prev => prev.map(f =>
                  f.path === event.path ? { ...f, content } : f
                ));
              }
            });
          }
        }
      });
      return () => {
        cleanup();
        window.electronAPI.unwatchDirectory(rootPath);
      };
    }
  }, [rootPath, openFiles]);

  // Add notification helper
  const addNotification = useCallback((type: NotificationItem['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setActivePanel('search');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setActivePanel('search');
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        setActivePanel('git');
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'g') {
        e.preventDefault();
        setShowGoToLine(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'b') {
        e.preventDefault();
        toggleBookmark();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setShowSplitEditor(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowFindReplace(false);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenFolder = useCallback(async () => {
    const folderPath = await window.electronAPI.openFolder();
    if (folderPath) {
      setRootPath(folderPath);
      setOpenFiles([]);
      setActiveFile(null);
    }
  }, []);

  const handleFileSelect = useCallback(async (filePath: string, fileName: string, line?: number) => {
    const existing = openFiles.find((f) => f.path === filePath);
    if (existing) {
      setActiveFile(filePath);
      if (line) {
        setCursorPosition({ line, column: 1 });
      }
      return;
    }

    const content = await window.electronAPI.readFile(filePath);
    if (content !== null) {
      setOpenFiles((prev) => [
        ...prev,
        { path: filePath, name: fileName, content, isDirty: false },
      ]);
      setActiveFile(filePath);
      if (line) {
        setCursorPosition({ line, column: 1 });
      }
    }
  }, [openFiles]);

  const handleCloseFile = useCallback((filePath: string) => {
    setOpenFiles((prev) => prev.filter((f) => f.path !== filePath));
    if (activeFile === filePath) {
      const remaining = openFiles.filter((f) => f.path !== filePath);
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
    }
  }, [activeFile, openFiles]);

  const handleContentChange = useCallback((filePath: string, newContent: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.path === filePath ? { ...f, content: newContent, isDirty: true } : f
      )
    );
  }, []);

  const handleSaveFile = useCallback(async (filePath: string) => {
    const file = openFiles.find((f) => f.path === filePath);
    if (file) {
      const success = await window.electronAPI.writeFile(filePath, file.content);
      if (success) {
        setOpenFiles((prev) =>
          prev.map((f) => (f.path === filePath ? { ...f, isDirty: false } : f))
        );
        addNotification('success', `Saved ${file.name}`);
      } else {
        addNotification('error', `Failed to save ${file.name}`);
      }
    }
  }, [openFiles, addNotification]);

  const handleCursorChange = useCallback((line: number, column: number) => {
    setCursorPosition({ line, column });
  }, []);

  // Bookmark functions
  const toggleBookmark = useCallback(() => {
    if (!activeFile) return;
    const activeFileData = openFiles.find(f => f.path === activeFile);
    if (!activeFileData) return;

    const existingIndex = bookmarks.findIndex(
      b => b.filePath === activeFile && b.line === cursorPosition.line
    );

    if (existingIndex >= 0) {
      setBookmarks(prev => prev.filter((_, i) => i !== existingIndex));
      addNotification('info', 'Bookmark removed');
    } else {
      const lines = activeFileData.content.split('\n');
      const lineContent = lines[cursorPosition.line - 1] || '';
      const newBookmark: Bookmark = {
        id: `${activeFile}:${cursorPosition.line}:${Date.now()}`,
        filePath: activeFile,
        fileName: activeFileData.name,
        line: cursorPosition.line,
        content: lineContent
      };
      setBookmarks(prev => [...prev, newBookmark]);
      addNotification('success', 'Bookmark added');
    }
  }, [activeFile, cursorPosition, openFiles, bookmarks, addNotification]);

  const handleGoToLine = useCallback((line: number, column?: number) => {
    setCursorPosition({ line, column: column || 1 });
  }, []);

  // Find/Replace functions
  const handleFind = useCallback((_query: string, _options: FindOptions) => {
    // Placeholder: Monaco editor's built-in find would be triggered here
    setFindMatchCount(0);
    setFindCurrentMatch(0);
  }, []);

  const handleReplace = useCallback((_query: string, _replacement: string, _options: FindOptions) => {
    // Placeholder
  }, []);

  const handleReplaceAll = useCallback((findQuery: string, replaceText: string, options: FindOptions) => {
    if (!activeFile) return;
    const activeFileData = openFiles.find(f => f.path === activeFile);
    if (!activeFileData) return;

    let newContent = activeFileData.content;
    const flags = options.caseSensitive ? 'g' : 'gi';

    if (options.useRegex) {
      try {
        const regex = new RegExp(findQuery, flags);
        newContent = newContent.replace(regex, replaceText);
      } catch {
        addNotification('error', 'Invalid regex pattern');
        return;
      }
    } else {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped;
      const regex = new RegExp(pattern, flags);
      newContent = newContent.replace(regex, replaceText);
    }

    handleContentChange(activeFile, newContent);
    addNotification('success', 'Replaced all occurrences');
  }, [activeFile, openFiles, handleContentChange, addNotification]);

  // File tree refresh
  const refreshFileTree = useCallback(() => {
    fileTreeRefreshKey.current += 1;
  }, []);

  // Context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setSelectedFilePath(path);
    const items: MenuItem[] = [
      { id: 'new-file', label: 'New File', action: () => {} },
      { id: 'new-folder', label: 'New Folder', action: () => {} },
      { id: 'divider-1', label: '', divider: true },
      { id: 'rename', label: 'Rename', action: () => {} },
      { id: 'delete', label: 'Delete', action: () => {} },
    ];
    setContextMenu({ position: { x: e.clientX, y: e.clientY }, items });
  }, []);

  // Show diff
  const handleShowDiff = useCallback(async (filePath: string) => {
    if (!rootPath) return;
    try {
      const diff = await window.electronAPI.gitDiff(rootPath, filePath);
      const content = await window.electronAPI.readFile(`${rootPath}/${filePath}`);
      if (content !== null) {
        setDiffContent({
          original: content.replace(diff, ''),
          modified: content,
          fileName: filePath
        });
        setShowDiffViewer(true);
      }
    } catch (err) {
      addNotification('error', 'Failed to load diff');
    }
  }, [rootPath, addNotification]);

  const activeFileData = openFiles.find((f) => f.path === activeFile);

  const getLanguageFromPath = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescriptreact',
      js: 'javascript',
      jsx: 'javascriptreact',
      json: 'json',
      html: 'html',
      css: 'css',
      scss: 'scss',
      md: 'markdown',
      py: 'python',
      rs: 'rust',
      go: 'go',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const getLanguageDisplayName = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const displayNames: Record<string, string> = {
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      js: 'JavaScript',
      jsx: 'JavaScript React',
      json: 'JSON',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      md: 'Markdown',
      py: 'Python',
      rs: 'Rust',
      go: 'Go',
    };
    return displayNames[ext || ''] || 'Plain Text';
  };

  const isImageFile = (filePath: string): boolean => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'].includes(ext || '');
  };

  const isMarkdownFile = (filePath: string): boolean => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ext === 'md' || ext === 'markdown';
  };

  const commands = [
    { id: 'file.open', label: 'Open Folder', category: 'File', shortcut: 'Ctrl+O', action: handleOpenFolder },
    { id: 'file.save', label: 'Save File', category: 'File', shortcut: 'Ctrl+S', action: () => activeFile && handleSaveFile(activeFile) },
    { id: 'edit.find', label: 'Find', category: 'Edit', shortcut: 'Ctrl+F', action: () => setShowFindReplace(true) },
    { id: 'edit.replace', label: 'Find and Replace', category: 'Edit', shortcut: 'Ctrl+H', action: () => setShowFindReplace(true) },
    { id: 'edit.goToLine', label: 'Go to Line', category: 'Edit', shortcut: 'Ctrl+G', action: () => setShowGoToLine(true) },
    { id: 'view.terminal', label: 'Toggle Terminal', category: 'View', shortcut: 'Ctrl+`', action: () => setShowTerminal((p) => !p) },
    { id: 'view.settings', label: 'Open Settings', category: 'View', shortcut: 'Ctrl+,', action: () => setShowSettings(true) },
    { id: 'view.explorer', label: 'Show Explorer', category: 'View', shortcut: 'Ctrl+Shift+E', action: () => setActivePanel('files') },
    { id: 'view.search', label: 'Show Search', category: 'View', shortcut: 'Ctrl+Shift+F', action: () => setActivePanel('search') },
    { id: 'view.git', label: 'Show Source Control', category: 'View', shortcut: 'Ctrl+Shift+G', action: () => setActivePanel('git') },
    { id: 'view.ai', label: 'Show AI Assistant', category: 'View', action: () => setActivePanel('ai') },
    { id: 'view.splitEditor', label: 'Toggle Split Editor', category: 'View', action: () => setShowSplitEditor(p => !p) },
    { id: 'view.bookmarks', label: 'Show Bookmarks', category: 'View', action: () => setShowBookmarks(true) },
    { id: 'view.taskRunner', label: 'Show Task Runner', category: 'View', action: () => setShowTaskRunner(!showTaskRunner) },
    { id: 'git.branches', label: 'Manage Branches', category: 'Git', action: () => setShowBranchManager(true) },
    { id: 'git.stash', label: 'Manage Stashes', category: 'Git', action: () => setShowGitStash(true) },
    { id: 'git.blame', label: 'Show Git Blame', category: 'Git', action: () => activeFile && setShowGitBlame(true) },
    { id: 'git.graph', label: 'Show Git Graph', category: 'Git', action: () => setShowGitGraph(true) },
    { id: 'bookmark.toggle', label: 'Toggle Bookmark', category: 'Bookmark', shortcut: 'Ctrl+Shift+B', action: toggleBookmark },
    // New feature commands
    { id: 'view.problems', label: 'Show Problems Panel', category: 'View', action: () => setShowProblemsPanel(p => !p) },
    { id: 'view.outline', label: 'Show Outline', category: 'View', action: () => setShowOutline(p => !p) },
    { id: 'view.minimap', label: 'Toggle Minimap', category: 'View', action: () => setShowMinimap(p => !p) },
    { id: 'view.zenMode', label: 'Toggle Zen Mode', category: 'View', shortcut: 'Ctrl+K Z', action: () => setIsZenMode(p => !p) },
    { id: 'view.timeline', label: 'Show Timeline', category: 'View', action: () => setShowTimeline(p => !p) },
    { id: 'debug.start', label: 'Start Debugging', category: 'Debug', shortcut: 'F5', action: () => setShowDebugger(true) },
    { id: 'debug.stop', label: 'Stop Debugging', category: 'Debug', shortcut: 'Shift+F5', action: () => setDebugSession(null) },
    { id: 'edit.snippets', label: 'Configure Snippets', category: 'Edit', action: () => setShowSnippets(true) },
    { id: 'file.recentProjects', label: 'Open Recent Projects', category: 'File', action: () => setShowRecentProjects(true) },
    { id: 'preferences.themes', label: 'Color Theme', category: 'Preferences', action: () => setShowThemeEditor(true) },
    { id: 'preferences.keybindings', label: 'Keyboard Shortcuts', category: 'Preferences', shortcut: 'Ctrl+K Ctrl+S', action: () => setShowKeybindingsEditor(true) },
    { id: 'preferences.extensions', label: 'Extensions', category: 'Preferences', action: () => setShowExtensionManager(true) },
    { id: 'preferences.linter', label: 'Configure Linter', category: 'Preferences', action: () => setShowLinterConfig(true) },
    // New feature commands - AI Enhanced
    { id: 'ai.commitMessage', label: 'AI: Generate Commit Message', category: 'AI', action: () => setShowAICommitMessage(true) },
    { id: 'ai.codeReview', label: 'AI: Code Review', category: 'AI', action: () => setShowAICodeReview(true) },
    { id: 'ai.refactor', label: 'AI: Refactor Code', category: 'AI', action: () => setShowAIRefactor(true) },
    { id: 'ai.generateTests', label: 'AI: Generate Tests', category: 'AI', action: () => setShowAITestGenerator(true) },
    { id: 'ai.generateDocs', label: 'AI: Generate Documentation', category: 'AI', action: () => setShowAIDocGenerator(true) },
    // New feature commands - Protocol Support
    { id: 'tools.httpClient', label: 'HTTP Client', category: 'Tools', action: () => setShowHTTPClient(true) },
    { id: 'tools.websocketDebugger', label: 'WebSocket Debugger', category: 'Tools', action: () => setShowWebSocketDebugger(true) },
    { id: 'tools.graphqlPlayground', label: 'GraphQL Playground', category: 'Tools', action: () => setShowGraphQLPlayground(true) },
    // New feature commands - Testing
    { id: 'test.explorer', label: 'Test Explorer', category: 'Test', action: () => setShowTestExplorer(true) },
    { id: 'test.coverage', label: 'Code Coverage', category: 'Test', action: () => setShowCodeCoverage(true) },
    // New feature commands - Git Enhanced
    { id: 'git.conflictResolver', label: 'Resolve Conflicts', category: 'Git', action: () => setShowConflictResolver(true) },
    { id: 'git.prReview', label: 'PR Review', category: 'Git', action: () => setShowPRReview(true) },
    { id: 'git.worktree', label: 'Git Worktrees', category: 'Git', action: () => setShowGitWorktree(true) },
    { id: 'git.commitSigning', label: 'Commit Signing', category: 'Git', action: () => setShowCommitSigning(true) },
    // New feature commands - Utilities
    { id: 'tools.dataFormatter', label: 'Data Formatter (JSON/YAML)', category: 'Tools', action: () => setShowDataFormatter(true) },
    { id: 'tools.encoderDecoder', label: 'Encoder/Decoder (Base64/URL)', category: 'Tools', action: () => setShowEncoderDecoder(true) },
    { id: 'tools.colorPicker', label: 'Color Picker', category: 'Tools', action: () => setShowColorPicker(true) },
    { id: 'tools.regexTester', label: 'Regex Tester', category: 'Tools', action: () => setShowRegexTester(true) },
    { id: 'tools.diffTool', label: 'Diff Tool', category: 'Tools', action: () => setShowDiffTool(true) },
    // New feature commands - Editor Enhanced
    { id: 'view.stickyScroll', label: 'Toggle Sticky Scroll', category: 'View', action: () => setShowStickyScroll(p => !p) },
    { id: 'view.inlayHints', label: 'Toggle Inlay Hints', category: 'View', action: () => setShowInlayHints(p => !p) },
    { id: 'view.quickActions', label: 'Quick Actions', category: 'View', action: () => setShowQuickActions(true) },
    { id: 'view.callHierarchy', label: 'Show Call Hierarchy', category: 'View', action: () => setShowCallHierarchy(true) },
    { id: 'view.typeHierarchy', label: 'Show Type Hierarchy', category: 'View', action: () => setShowTypeHierarchy(true) },
    // New feature commands - Project Management
    { id: 'file.workspaceManager', label: 'Workspace Manager', category: 'File', action: () => setShowWorkspaceManager(true) },
    { id: 'file.projectTemplates', label: 'Project Templates', category: 'File', action: () => setShowProjectTemplates(true) },
    { id: 'tools.docker', label: 'Docker Integration', category: 'Tools', action: () => setShowDockerIntegration(true) },
    { id: 'tools.database', label: 'Database Explorer', category: 'Tools', action: () => setShowDatabaseExplorer(true) },
    { id: 'tools.profiler', label: 'Performance Profiler', category: 'Tools', action: () => setShowPerformanceProfiler(true) },
    // New feature commands - Collaboration
    { id: 'remote.ssh', label: 'Remote SSH', category: 'Remote', action: () => setShowRemoteSSH(true) },
    { id: 'remote.liveShare', label: 'Live Share', category: 'Remote', action: () => setShowLiveShare(true) },
    // New feature commands - Other
    { id: 'help.tutorial', label: 'Interactive Tutorial', category: 'Help', action: () => setShowInteractiveTutorial(true) },
    { id: 'help.updates', label: 'Check for Updates', category: 'Help', action: () => setShowAutoUpdate(true) },
    { id: 'file.sessionRestore', label: 'Restore Session', category: 'File', action: () => setShowSessionRestore(true) },
  ];

  const renderSidebarContent = () => {
    switch (activePanel) {
      case 'files':
        return (
          <div className="sidebar-content">
            <div className="sidebar-header">
              <span className="sidebar-title">EXPLORER</span>
              <button onClick={handleOpenFolder} className="sidebar-action" title="Open Folder">
                +
              </button>
            </div>
            {rootPath ? (
              <>
                <FileOperations
                  rootPath={rootPath}
                  selectedPath={selectedFilePath}
                  onRefresh={refreshFileTree}
                  onFileCreated={(path) => {
                    const name = path.split('/').pop() || path;
                    handleFileSelect(path, name);
                  }}
                  onNotify={(msg, type) => addNotification(type, msg)}
                />
                <FileTree
                  key={fileTreeRefreshKey.current}
                  rootPath={rootPath}
                  onFileSelect={handleFileSelect}
                  onContextMenu={handleContextMenu}
                />
              </>
            ) : (
              <div className="sidebar-empty">
                <button onClick={handleOpenFolder} className="open-folder-btn">
                  Open Folder
                </button>
              </div>
            )}
          </div>
        );
      case 'search':
        return (
          <div className="sidebar-content">
            <div className="sidebar-header">
              <span className="sidebar-title">SEARCH</span>
            </div>
            <Search rootPath={rootPath} onFileSelect={handleFileSelect} />
          </div>
        );
      case 'git':
        return (
          <div className="sidebar-content">
            <div className="sidebar-header">
              <span className="sidebar-title">SOURCE CONTROL</span>
              <div className="sidebar-actions">
                <button onClick={() => setShowBranchManager(true)} title="Branches">B</button>
                <button onClick={() => setShowGitStash(true)} title="Stashes">S</button>
              </div>
            </div>
            <GitPanel rootPath={rootPath} onShowDiff={handleShowDiff} />
          </div>
        );
      case 'ai':
        return (
          <div className="sidebar-content">
            <div className="sidebar-header">
              <span className="sidebar-title">AI ASSISTANT</span>
            </div>
            <AIChat
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              currentFile={activeFileData ? { path: activeFileData.path, content: activeFileData.content } : undefined}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditorContent = () => {
    if (!activeFileData) {
      return (
        <div className="welcome">
          <h1>My IDE</h1>
          <p>Open a folder to get started</p>
          <div className="welcome-shortcuts">
            <div className="shortcut-item">
              <span className="shortcut-key">Ctrl+Shift+P</span>
              <span>Command Palette</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">Ctrl+P</span>
              <span>Quick Open</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">Ctrl+`</span>
              <span>Toggle Terminal</span>
            </div>
          </div>
        </div>
      );
    }

    // Check for special file types
    if (isImageFile(activeFileData.path)) {
      return (
        <ImagePreview
          src={`file://${activeFileData.path}`}
          fileName={activeFileData.name}
        />
      );
    }

    if (isMarkdownFile(activeFileData.path)) {
      return (
        <div className="editor-with-preview">
          <div className="editor-pane">
            <Editor
              key={activeFileData.path}
              filePath={activeFileData.path}
              content={activeFileData.content}
              settings={settings}
              onChange={(content) => handleContentChange(activeFileData.path, content)}
              onSave={() => handleSaveFile(activeFileData.path)}
              onCursorChange={handleCursorChange}
            />
          </div>
          <div className="preview-pane">
            <MarkdownPreview
              content={activeFileData.content}
              onClose={() => {}}
            />
          </div>
        </div>
      );
    }

    // Split editor view
    if (showSplitEditor && openFiles.length > 0) {
      return (
        <SplitEditor
          files={openFiles}
          settings={settings}
          onContentChange={handleContentChange}
          onSave={handleSaveFile}
          onCursorChange={handleCursorChange}
        />
      );
    }

    // Regular editor with AI completion and minimap
    const lines = activeFileData.content.split('\n');
    const totalLines = lines.length;
    const visibleLines = 30; // Approximate visible lines

    return (
      <div className="editor-with-minimap">
        <div className="editor-main">
          <Editor
            key={activeFileData.path}
            filePath={activeFileData.path}
            content={activeFileData.content}
            settings={settings}
            onChange={(content) => handleContentChange(activeFileData.path, content)}
            onSave={() => handleSaveFile(activeFileData.path)}
            onCursorChange={handleCursorChange}
          />
          {settings.aiApiKey && (
            <AIInlineCompletion
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              editorContent={activeFileData.content}
              cursorPosition={cursorPosition}
              language={getLanguageFromPath(activeFileData.path)}
              onAccept={(completion) => {
                const lines = activeFileData.content.split('\n');
                const currentLine = lines[cursorPosition.line - 1] || '';
                lines[cursorPosition.line - 1] = currentLine.slice(0, cursorPosition.column - 1) +
                  completion + currentLine.slice(cursorPosition.column - 1);
                handleContentChange(activeFileData.path, lines.join('\n'));
              }}
              onDismiss={() => {}}
            />
          )}
        </div>
        {showMinimap && (
          <Minimap
            content={activeFileData.content}
            visibleRange={{ start: Math.max(0, cursorPosition.line - visibleLines / 2), end: Math.min(totalLines, cursorPosition.line + visibleLines / 2) }}
            totalLines={totalLines}
            highlights={diagnostics.filter(d => d.filePath === activeFileData.path).map(d => ({
              line: d.line - 1,
              type: d.severity === 'error' ? 'error' : d.severity === 'warning' ? 'warning' : 'search'
            }))}
            onScrollTo={(line) => setCursorPosition({ line, column: 1 })}
          />
        )}
      </div>
    );
  };

  return (
    <ZenMode isActive={isZenMode} onExit={() => setIsZenMode(false)}>
    <div className={`app ${settings.theme}`}>
      <div className="titlebar">
        <div className="titlebar-drag-region" />
        <span className="titlebar-title">My IDE {rootPath ? `- ${rootPath.split('/').pop()}` : ''}</span>
      </div>

      <div className="main-layout">
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

        <div className="sidebar">{renderSidebarContent()}</div>

        <div className="editor-area">
          <TabBar
            files={openFiles}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onCloseFile={handleCloseFile}
          />

          {activeFileData && (
            <Breadcrumb
              filePath={activeFileData.path}
              currentLine={cursorPosition.line}
            />
          )}

          <div className="editor-container">
            {renderEditorContent()}
          </div>

          {showFindReplace && (
            <FindReplace
              isOpen={showFindReplace}
              onClose={() => setShowFindReplace(false)}
              onFind={handleFind}
              onReplace={handleReplace}
              onReplaceAll={handleReplaceAll}
              onFindNext={() => setFindCurrentMatch(c => Math.min(c + 1, findMatchCount))}
              onFindPrev={() => setFindCurrentMatch(c => Math.max(c - 1, 1))}
              matchCount={findMatchCount}
              currentMatch={findCurrentMatch}
            />
          )}

          {showTerminal && (
            <div className="terminal-panel">
              <div className="terminal-header">
                <span>TERMINAL</span>
                <button onClick={() => setShowTerminal(false)}>x</button>
              </div>
              <Terminal rootPath={rootPath} />
            </div>
          )}

          {showTaskRunner && rootPath && (
            <div className="task-runner-panel">
              <div className="task-runner-header">
                <span>TASKS</span>
                <button onClick={() => setShowTaskRunner(false)}>x</button>
              </div>
              <TaskRunner rootPath={rootPath} />
            </div>
          )}
        </div>

        {showBookmarks && (
          <div className="bookmarks-sidebar">
            <Bookmarks
              bookmarks={bookmarks}
              onNavigate={(filePath, line) => {
                const fileName = filePath.split('/').pop() || filePath;
                handleFileSelect(filePath, fileName, line);
              }}
              onRemove={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))}
              onLabelChange={(id, label) => setBookmarks(prev => prev.map(b => b.id === id ? { ...b, label } : b))}
            />
            <button className="close-bookmarks" onClick={() => setShowBookmarks(false)}>x</button>
          </div>
        )}
      </div>

      <StatusBar
        currentFile={activeFileData?.path || null}
        line={cursorPosition.line}
        column={cursorPosition.column}
        language={activeFileData ? getLanguageDisplayName(activeFileData.path) : ''}
        encoding="UTF-8"
        gitBranch={gitBranch}
        isDirty={activeFileData?.isDirty || false}
      />

      {/* Modals and overlays */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <GoToLine
        isOpen={showGoToLine}
        onClose={() => setShowGoToLine(false)}
        onGoToLine={handleGoToLine}
        maxLine={activeFileData ? activeFileData.content.split('\n').length : 1}
      />

      {showBranchManager && rootPath && (
        <div className="modal-overlay" onClick={() => setShowBranchManager(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <GitBranchManager
              rootPath={rootPath}
              onBranchChange={() => {
                window.electronAPI.gitStatus(rootPath).then(status => setGitBranch(status.current));
              }}
            />
            <button className="modal-close" onClick={() => setShowBranchManager(false)}>x</button>
          </div>
        </div>
      )}

      {showGitStash && rootPath && (
        <div className="modal-overlay" onClick={() => setShowGitStash(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <GitStash
              rootPath={rootPath}
              onStashChange={() => {}}
            />
            <button className="modal-close" onClick={() => setShowGitStash(false)}>x</button>
          </div>
        </div>
      )}

      {showGitBlame && rootPath && activeFile && (
        <div className="modal-overlay" onClick={() => setShowGitBlame(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <GitBlame
              rootPath={rootPath}
              filePath={activeFile}
              onClose={() => setShowGitBlame(false)}
            />
          </div>
        </div>
      )}

      {showDiffViewer && diffContent && (
        <DiffViewer
          originalContent={diffContent.original}
          modifiedContent={diffContent.modified}
          originalFileName={`${diffContent.fileName} (original)`}
          modifiedFileName={diffContent.fileName}
          language={getLanguageFromPath(diffContent.fileName)}
          onClose={() => setShowDiffViewer(false)}
        />
      )}

      {/* Git Graph Modal */}
      {showGitGraph && rootPath && (
        <div className="modal-overlay" onClick={() => setShowGitGraph(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <GitGraph
              rootPath={rootPath}
              onClose={() => setShowGitGraph(false)}
              onCheckout={(hash) => addNotification('info', `Checked out ${hash.substring(0, 7)}`)}
            />
          </div>
        </div>
      )}

      {/* Problems Panel */}
      {showProblemsPanel && (
        <div className="bottom-panel problems-panel-container">
          <ProblemsPanel
            diagnostics={diagnostics}
            onDiagnosticClick={(diagnostic) => {
              handleFileSelect(diagnostic.filePath, diagnostic.fileName, diagnostic.line);
            }}
            onClose={() => setShowProblemsPanel(false)}
          />
        </div>
      )}

      {/* Outline Panel */}
      {showOutline && activeFileData && (
        <div className="outline-sidebar">
          <Outline
            symbols={documentSymbols}
            filePath={activeFileData.path}
            currentLine={cursorPosition.line}
            onSymbolClick={(symbol) => {
              setCursorPosition({ line: symbol.range.startLine, column: symbol.range.startColumn });
            }}
          />
          <button className="close-outline" onClick={() => setShowOutline(false)}>x</button>
        </div>
      )}

      {/* Debugger Panel */}
      {showDebugger && (
        <div className="debugger-panel">
          <Debugger
            session={debugSession}
            breakpoints={breakpoints}
            onStart={() => setDebugSession({ id: Date.now().toString(), status: 'running', name: 'Debug Session' })}
            onPause={() => setDebugSession(s => s ? { ...s, status: 'paused' } : null)}
            onContinue={() => setDebugSession(s => s ? { ...s, status: 'running' } : null)}
            onStop={() => { setDebugSession(null); setShowDebugger(false); }}
            onStepOver={() => {}}
            onStepInto={() => {}}
            onStepOut={() => {}}
            onBreakpointToggle={(bp) => {
              setBreakpoints(prev =>
                prev.some(b => b.id === bp.id)
                  ? prev.filter(b => b.id !== bp.id)
                  : [...prev, bp]
              );
            }}
            onWatchAdd={() => {}}
            onEvaluate={() => {}}
          />
        </div>
      )}

      {/* Snippets Modal */}
      {showSnippets && (
        <div className="modal-overlay" onClick={() => setShowSnippets(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SnippetsManager
              snippets={snippets}
              currentLanguage={activeFileData ? getLanguageFromPath(activeFileData.path) : 'typescript'}
              onInsertSnippet={(snippet) => {
                if (activeFileData) {
                  const lines = activeFileData.content.split('\n');
                  const currentLine = lines[cursorPosition.line - 1] || '';
                  const indent = currentLine.match(/^\s*/)?.[0] || '';
                  const expanded = snippet.body.join('\n').replace(/\$\{?\d+:?[^}]*\}?/g, '').replace(/\n/g, '\n' + indent);
                  lines.splice(cursorPosition.line - 1, 0, indent + expanded);
                  handleContentChange(activeFileData.path, lines.join('\n'));
                  setShowSnippets(false);
                }
              }}
              onSnippetsChange={setSnippets}
              onClose={() => setShowSnippets(false)}
            />
          </div>
        </div>
      )}

      {/* Recent Projects Modal */}
      {showRecentProjects && (
        <div className="modal-overlay" onClick={() => setShowRecentProjects(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <RecentProjects
              projects={recentProjects}
              onOpen={(path) => {
                setRootPath(path);
                setShowRecentProjects(false);
              }}
              onRemove={(path) => setRecentProjects(prev => prev.filter(p => p.path !== path))}
              onPin={(path) => setRecentProjects(prev => prev.map(p => p.path === path ? { ...p, pinned: !p.pinned } : p))}
              onClose={() => setShowRecentProjects(false)}
            />
          </div>
        </div>
      )}

      {/* Theme Editor Modal */}
      {showThemeEditor && (
        <div className="modal-overlay" onClick={() => setShowThemeEditor(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <ThemeEditor
              themes={customThemes}
              currentTheme={settings.theme}
              onThemeSelect={(themeName) => setSettings(s => ({ ...s, theme: themeName }))}
              onThemeSave={(theme) => setCustomThemes(prev => [...prev.filter(t => t.id !== theme.id), theme])}
              onClose={() => setShowThemeEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Extension Manager Modal */}
      {showExtensionManager && (
        <div className="modal-overlay" onClick={() => setShowExtensionManager(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <ExtensionManager
              installedExtensions={installedExtensions}
              onInstall={async (id) => {
                setInstalledExtensions(prev => [...prev, {
                  id, name: id, displayName: id, description: '', version: '1.0.0',
                  author: 'Unknown', enabled: true, installed: true, category: 'Other'
                }]);
              }}
              onUninstall={async (id) => setInstalledExtensions(prev => prev.filter(e => e.id !== id))}
              onToggle={(id, enabled) => setInstalledExtensions(prev => prev.map(e => e.id === id ? { ...e, enabled } : e))}
              onClose={() => setShowExtensionManager(false)}
            />
          </div>
        </div>
      )}

      {/* Keybindings Editor Modal */}
      {showKeybindingsEditor && (
        <div className="modal-overlay" onClick={() => setShowKeybindingsEditor(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <KeybindingsEditor
              keybindings={keybindings}
              onKeybindingChange={setKeybindings}
              onClose={() => setShowKeybindingsEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Linter Config Modal */}
      {showLinterConfig && (
        <div className="modal-overlay" onClick={() => setShowLinterConfig(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <LinterConfig
              eslintRules={eslintRules}
              prettierOptions={prettierOptions}
              onESLintChange={setEslintRules}
              onPrettierChange={setPrettierOptions}
              onClose={() => setShowLinterConfig(false)}
            />
          </div>
        </div>
      )}

      {/* Timeline Panel */}
      {showTimeline && activeFileData && (
        <div className="timeline-sidebar">
          <Timeline
            filePath={activeFileData.path}
            entries={timelineEntries}
            onSelectEntry={(entry) => addNotification('info', `Selected version: ${entry.label}`)}
            onCompare={(e1, e2) => addNotification('info', `Comparing ${e1.label} with ${e2.label}`)}
            onRestore={(entry) => addNotification('success', `Restored to ${entry.label}`)}
          />
          <button className="close-timeline" onClick={() => setShowTimeline(false)}>x</button>
        </div>
      )}

      {/* LSP Status in StatusBar area */}
      <div className="lsp-status-container">
        <LSPStatus
          language={activeFileData ? getLanguageFromPath(activeFileData.path) : 'typescript'}
          status={lspStatus}
        />
      </div>

      {/* AI Commit Message Modal */}
      {showAICommitMessage && rootPath && (
        <div className="modal-overlay" onClick={() => setShowAICommitMessage(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AICommitMessage
              rootPath={rootPath}
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              onCommit={(message) => {
                addNotification('success', 'Commit created: ' + message.substring(0, 50) + '...');
                setShowAICommitMessage(false);
              }}
              onClose={() => setShowAICommitMessage(false)}
            />
          </div>
        </div>
      )}

      {/* AI Code Review Modal */}
      {showAICodeReview && activeFileData && (
        <div className="modal-overlay" onClick={() => setShowAICodeReview(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <AICodeReview
              code={activeFileData.content}
              fileName={activeFileData.name}
              language={getLanguageFromPath(activeFileData.path)}
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              onClose={() => setShowAICodeReview(false)}
            />
          </div>
        </div>
      )}

      {/* AI Refactor Modal */}
      {showAIRefactor && activeFileData && (
        <div className="modal-overlay" onClick={() => setShowAIRefactor(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <AIRefactor
              code={activeFileData.content}
              language={getLanguageFromPath(activeFileData.path)}
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              onApply={(newCode) => {
                handleContentChange(activeFileData.path, newCode);
                setShowAIRefactor(false);
                addNotification('success', 'Code refactored successfully');
              }}
              onClose={() => setShowAIRefactor(false)}
            />
          </div>
        </div>
      )}

      {/* AI Test Generator Modal */}
      {showAITestGenerator && activeFileData && (
        <div className="modal-overlay" onClick={() => setShowAITestGenerator(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <AITestGenerator
              code={activeFileData.content}
              fileName={activeFileData.name}
              language={getLanguageFromPath(activeFileData.path)}
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              onSaveTests={(tests) => {
                addNotification('success', 'Tests generated and saved');
                setShowAITestGenerator(false);
              }}
              onClose={() => setShowAITestGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* AI Doc Generator Modal */}
      {showAIDocGenerator && activeFileData && (
        <div className="modal-overlay" onClick={() => setShowAIDocGenerator(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <AIDocGenerator
              code={activeFileData.content}
              language={getLanguageFromPath(activeFileData.path)}
              apiKey={settings.aiApiKey}
              model={settings.aiModel}
              onApply={(newCode) => {
                handleContentChange(activeFileData.path, newCode);
                setShowAIDocGenerator(false);
                addNotification('success', 'Documentation added');
              }}
              onClose={() => setShowAIDocGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* HTTP Client Modal */}
      {showHTTPClient && (
        <div className="modal-overlay" onClick={() => setShowHTTPClient(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <HTTPClient onClose={() => setShowHTTPClient(false)} />
          </div>
        </div>
      )}

      {/* WebSocket Debugger Modal */}
      {showWebSocketDebugger && (
        <div className="modal-overlay" onClick={() => setShowWebSocketDebugger(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <WebSocketDebugger onClose={() => setShowWebSocketDebugger(false)} />
          </div>
        </div>
      )}

      {/* GraphQL Playground Modal */}
      {showGraphQLPlayground && (
        <div className="modal-overlay" onClick={() => setShowGraphQLPlayground(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <GraphQLPlayground onClose={() => setShowGraphQLPlayground(false)} />
          </div>
        </div>
      )}

      {/* Session Restore Modal */}
      {showSessionRestore && (
        <div className="modal-overlay" onClick={() => setShowSessionRestore(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SessionRestore
              currentSession={{
                id: 'current',
                name: 'Current Session',
                openFiles: openFiles.map(f => f.path),
                activeFile: activeFile || undefined,
                rootPath: rootPath || undefined,
                timestamp: new Date()
              }}
              onRestore={(session) => {
                if (session.rootPath) setRootPath(session.rootPath);
                setShowSessionRestore(false);
                addNotification('success', 'Session restored');
              }}
              onClose={() => setShowSessionRestore(false)}
            />
          </div>
        </div>
      )}

      {/* Welcome Page */}
      {showWelcomePage && !rootPath && (
        <WelcomePage
          recentProjects={recentProjects}
          onOpenFolder={handleOpenFolder}
          onOpenProject={(path) => {
            setRootPath(path);
            setShowWelcomePage(false);
          }}
          onNewProject={() => {
            setShowProjectTemplates(true);
            setShowWelcomePage(false);
          }}
          onClose={() => setShowWelcomePage(false)}
        />
      )}

      {/* Test Explorer Modal */}
      {showTestExplorer && rootPath && (
        <div className="modal-overlay" onClick={() => setShowTestExplorer(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <TestExplorer
              rootPath={rootPath}
              onTestClick={(test) => {
                if (test.filePath) {
                  handleFileSelect(test.filePath, test.filePath.split('/').pop() || '', test.line);
                }
              }}
              onClose={() => setShowTestExplorer(false)}
            />
          </div>
        </div>
      )}

      {/* Code Coverage Modal */}
      {showCodeCoverage && rootPath && (
        <div className="modal-overlay" onClick={() => setShowCodeCoverage(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <CodeCoverage
              rootPath={rootPath}
              onFileClick={(filePath) => handleFileSelect(filePath, filePath.split('/').pop() || '')}
              onClose={() => setShowCodeCoverage(false)}
            />
          </div>
        </div>
      )}

      {/* Conflict Resolver Modal */}
      {showConflictResolver && rootPath && (
        <div className="modal-overlay" onClick={() => setShowConflictResolver(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <ConflictResolver
              rootPath={rootPath}
              onResolved={() => {
                addNotification('success', 'Conflicts resolved');
                setShowConflictResolver(false);
              }}
              onClose={() => setShowConflictResolver(false)}
            />
          </div>
        </div>
      )}

      {/* PR Review Modal */}
      {showPRReview && rootPath && (
        <div className="modal-overlay" onClick={() => setShowPRReview(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <PRReview
              rootPath={rootPath}
              onClose={() => setShowPRReview(false)}
            />
          </div>
        </div>
      )}

      {/* Git Worktree Modal */}
      {showGitWorktree && rootPath && (
        <div className="modal-overlay" onClick={() => setShowGitWorktree(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <GitWorktree
              rootPath={rootPath}
              onWorktreeSelect={(path) => {
                setRootPath(path);
                setShowGitWorktree(false);
              }}
              onClose={() => setShowGitWorktree(false)}
            />
          </div>
        </div>
      )}

      {/* Commit Signing Modal */}
      {showCommitSigning && (
        <div className="modal-overlay" onClick={() => setShowCommitSigning(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CommitSigning onClose={() => setShowCommitSigning(false)} />
          </div>
        </div>
      )}

      {/* Data Formatter Modal */}
      {showDataFormatter && (
        <div className="modal-overlay" onClick={() => setShowDataFormatter(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <DataFormatter onClose={() => setShowDataFormatter(false)} />
          </div>
        </div>
      )}

      {/* Encoder Decoder Modal */}
      {showEncoderDecoder && (
        <div className="modal-overlay" onClick={() => setShowEncoderDecoder(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <EncoderDecoder onClose={() => setShowEncoderDecoder(false)} />
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="modal-overlay" onClick={() => setShowColorPicker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ColorPicker
              initialColor="#3498db"
              onColorChange={() => {}}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        </div>
      )}

      {/* Regex Tester Modal */}
      {showRegexTester && (
        <div className="modal-overlay" onClick={() => setShowRegexTester(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <RegexTester onClose={() => setShowRegexTester(false)} />
          </div>
        </div>
      )}

      {/* Diff Tool Modal */}
      {showDiffTool && (
        <div className="modal-overlay" onClick={() => setShowDiffTool(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <DiffTool onClose={() => setShowDiffTool(false)} />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && activeFileData && (
        <QuickActions
          filePath={activeFileData.path}
          line={cursorPosition.line}
          column={cursorPosition.column}
          onAction={(action) => {
            addNotification('info', `Applied: ${action.title}`);
            setShowQuickActions(false);
          }}
          onClose={() => setShowQuickActions(false)}
        />
      )}

      {/* Call Hierarchy Modal */}
      {showCallHierarchy && activeFileData && (
        <div className="modal-overlay" onClick={() => setShowCallHierarchy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CallHierarchy
              filePath={activeFileData.path}
              functionName="currentFunction"
              onNavigate={(item) => {
                handleFileSelect(item.filePath, item.filePath.split('/').pop() || '', item.line);
                setShowCallHierarchy(false);
              }}
              onClose={() => setShowCallHierarchy(false)}
            />
          </div>
        </div>
      )}

      {/* Type Hierarchy Modal */}
      {showTypeHierarchy && activeFileData && (
        <div className="modal-overlay" onClick={() => setShowTypeHierarchy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <TypeHierarchy
              filePath={activeFileData.path}
              typeName="CurrentType"
              onNavigate={(item) => {
                handleFileSelect(item.filePath, item.filePath.split('/').pop() || '', item.line);
                setShowTypeHierarchy(false);
              }}
              onClose={() => setShowTypeHierarchy(false)}
            />
          </div>
        </div>
      )}

      {/* Workspace Manager Modal */}
      {showWorkspaceManager && (
        <div className="modal-overlay" onClick={() => setShowWorkspaceManager(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <WorkspaceManager
              onOpenWorkspace={(workspace) => {
                if (workspace.folders.length > 0) {
                  setRootPath(workspace.folders[0].path);
                }
                setShowWorkspaceManager(false);
              }}
              onClose={() => setShowWorkspaceManager(false)}
            />
          </div>
        </div>
      )}

      {/* Project Templates Modal */}
      {showProjectTemplates && (
        <div className="modal-overlay" onClick={() => setShowProjectTemplates(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <ProjectTemplates
              onCreateProject={(path) => {
                setRootPath(path);
                setShowProjectTemplates(false);
                addNotification('success', 'Project created');
              }}
              onClose={() => setShowProjectTemplates(false)}
            />
          </div>
        </div>
      )}

      {/* Docker Integration Modal */}
      {showDockerIntegration && (
        <div className="modal-overlay" onClick={() => setShowDockerIntegration(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <DockerIntegration onClose={() => setShowDockerIntegration(false)} />
          </div>
        </div>
      )}

      {/* Database Explorer Modal */}
      {showDatabaseExplorer && (
        <div className="modal-overlay" onClick={() => setShowDatabaseExplorer(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <DatabaseExplorer onClose={() => setShowDatabaseExplorer(false)} />
          </div>
        </div>
      )}

      {/* Performance Profiler Modal */}
      {showPerformanceProfiler && rootPath && (
        <div className="modal-overlay" onClick={() => setShowPerformanceProfiler(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <PerformanceProfiler
              rootPath={rootPath}
              onClose={() => setShowPerformanceProfiler(false)}
            />
          </div>
        </div>
      )}

      {/* Remote SSH Modal */}
      {showRemoteSSH && (
        <div className="modal-overlay" onClick={() => setShowRemoteSSH(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <RemoteSSH
              onOpenRemoteFolder={(conn, path) => {
                addNotification('info', `Connected to ${conn.host}:${path}`);
                setShowRemoteSSH(false);
              }}
              onClose={() => setShowRemoteSSH(false)}
            />
          </div>
        </div>
      )}

      {/* Live Share Modal */}
      {showLiveShare && (
        <div className="modal-overlay" onClick={() => setShowLiveShare(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LiveShare
              currentFile={activeFileData?.path}
              userName="User"
              onClose={() => setShowLiveShare(false)}
            />
          </div>
        </div>
      )}

      {/* Interactive Tutorial Modal */}
      {showInteractiveTutorial && (
        <div className="modal-overlay" onClick={() => setShowInteractiveTutorial(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <InteractiveTutorial
              onAction={(action) => {
                if (action === 'openFolder') handleOpenFolder();
                else if (action === 'toggleTerminal') setShowTerminal(true);
                else if (action === 'openCommandPalette') setShowCommandPalette(true);
                else if (action === 'openGitPanel') setActivePanel('git');
                else if (action === 'openAIPanel') setActivePanel('ai');
              }}
              onClose={() => setShowInteractiveTutorial(false)}
            />
          </div>
        </div>
      )}

      {/* Auto Update Modal */}
      {showAutoUpdate && (
        <div className="modal-overlay" onClick={() => setShowAutoUpdate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AutoUpdate
              currentVersion="1.0.0"
              onClose={() => setShowAutoUpdate(false)}
            />
          </div>
        </div>
      )}

      {/* Sticky Scroll (rendered in editor area) */}
      {showStickyScroll && activeFileData && (
        <StickyScroll
          content={activeFileData.content}
          currentLine={cursorPosition.line}
          language={getLanguageFromPath(activeFileData.path)}
          onScopeClick={(line) => setCursorPosition({ line, column: 1 })}
        />
      )}

      {/* Inlay Hints (rendered in editor area) */}
      {showInlayHints && activeFileData && (
        <InlayHints
          content={activeFileData.content}
          language={getLanguageFromPath(activeFileData.path)}
          visibleRange={{ startLine: Math.max(1, cursorPosition.line - 20), endLine: cursorPosition.line + 20 }}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Notifications */}
      <Notification
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </div>
    </ZenMode>
  );
}

export default App;
