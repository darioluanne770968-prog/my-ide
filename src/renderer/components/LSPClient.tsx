import { useState, useEffect, useCallback, useRef } from 'react';

export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  insertTextFormat?: 'PlainText' | 'Snippet';
  sortText?: string;
  filterText?: string;
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25
}

export interface HoverInfo {
  contents: string | { language: string; value: string }[];
  range?: { start: Position; end: Position };
}

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Location {
  uri: string;
  range: Range;
}

export interface Diagnostic {
  range: Range;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  source?: string;
  code?: string | number;
}

export interface SignatureHelp {
  signatures: SignatureInformation[];
  activeSignature?: number;
  activeParameter?: number;
}

export interface SignatureInformation {
  label: string;
  documentation?: string;
  parameters?: ParameterInformation[];
}

export interface ParameterInformation {
  label: string | [number, number];
  documentation?: string;
}

interface LSPClientProps {
  serverCommand?: string;
  rootPath: string;
  language: string;
  onDiagnostics?: (uri: string, diagnostics: Diagnostic[]) => void;
  onStatusChange?: (status: 'starting' | 'ready' | 'error' | 'stopped') => void;
}

interface LSPClientAPI {
  getCompletions: (uri: string, position: Position) => Promise<CompletionItem[]>;
  getHover: (uri: string, position: Position) => Promise<HoverInfo | null>;
  getDefinition: (uri: string, position: Position) => Promise<Location[]>;
  getReferences: (uri: string, position: Position) => Promise<Location[]>;
  getSignatureHelp: (uri: string, position: Position) => Promise<SignatureHelp | null>;
  formatDocument: (uri: string) => Promise<{ range: Range; newText: string }[]>;
  rename: (uri: string, position: Position, newName: string) => Promise<{ [uri: string]: { range: Range; newText: string }[] }>;
  didOpen: (uri: string, languageId: string, version: number, text: string) => void;
  didChange: (uri: string, version: number, changes: { range?: Range; text: string }[]) => void;
  didSave: (uri: string) => void;
  didClose: (uri: string) => void;
}

// Simulated LSP responses for demo
const mockCompletions: Record<string, CompletionItem[]> = {
  'typescript': [
    { label: 'console', kind: CompletionItemKind.Module, detail: 'Console object', documentation: 'Provides access to the browser debugging console' },
    { label: 'log', kind: CompletionItemKind.Method, detail: '(...data: any[]): void', documentation: 'Outputs a message to the console' },
    { label: 'useState', kind: CompletionItemKind.Function, detail: '<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]', documentation: 'React useState hook' },
    { label: 'useEffect', kind: CompletionItemKind.Function, detail: '(effect: EffectCallback, deps?: DependencyList): void', documentation: 'React useEffect hook' },
    { label: 'useCallback', kind: CompletionItemKind.Function, detail: '<T extends Function>(callback: T, deps: DependencyList): T', documentation: 'React useCallback hook' },
    { label: 'useRef', kind: CompletionItemKind.Function, detail: '<T>(initialValue: T): MutableRefObject<T>', documentation: 'React useRef hook' },
    { label: 'interface', kind: CompletionItemKind.Keyword, detail: 'TypeScript keyword' },
    { label: 'type', kind: CompletionItemKind.Keyword, detail: 'TypeScript keyword' },
    { label: 'export', kind: CompletionItemKind.Keyword, detail: 'ES module keyword' },
    { label: 'import', kind: CompletionItemKind.Keyword, detail: 'ES module keyword' },
    { label: 'async', kind: CompletionItemKind.Keyword, detail: 'Async function keyword' },
    { label: 'await', kind: CompletionItemKind.Keyword, detail: 'Await expression keyword' },
    { label: 'function', kind: CompletionItemKind.Keyword, detail: 'Function declaration' },
    { label: 'const', kind: CompletionItemKind.Keyword, detail: 'Constant declaration' },
    { label: 'let', kind: CompletionItemKind.Keyword, detail: 'Variable declaration' },
  ],
  'javascript': [
    { label: 'console', kind: CompletionItemKind.Module, detail: 'Console object' },
    { label: 'document', kind: CompletionItemKind.Variable, detail: 'Document object' },
    { label: 'window', kind: CompletionItemKind.Variable, detail: 'Window object' },
    { label: 'function', kind: CompletionItemKind.Keyword, detail: 'Function declaration' },
    { label: 'const', kind: CompletionItemKind.Keyword, detail: 'Constant declaration' },
    { label: 'let', kind: CompletionItemKind.Keyword, detail: 'Variable declaration' },
    { label: 'var', kind: CompletionItemKind.Keyword, detail: 'Variable declaration' },
    { label: 'if', kind: CompletionItemKind.Keyword, detail: 'Conditional statement' },
    { label: 'for', kind: CompletionItemKind.Keyword, detail: 'Loop statement' },
    { label: 'while', kind: CompletionItemKind.Keyword, detail: 'Loop statement' },
  ]
};

export function useLSPClient({
  rootPath,
  language,
  onDiagnostics,
  onStatusChange
}: LSPClientProps): LSPClientAPI {
  const [status, setStatus] = useState<'starting' | 'ready' | 'error' | 'stopped'>('stopped');
  const openDocuments = useRef<Map<string, { version: number; text: string }>>(new Map());

  useEffect(() => {
    // Simulate LSP server starting
    setStatus('starting');
    onStatusChange?.('starting');

    const timer = setTimeout(() => {
      setStatus('ready');
      onStatusChange?.('ready');
    }, 500);

    return () => {
      clearTimeout(timer);
      setStatus('stopped');
      onStatusChange?.('stopped');
    };
  }, [rootPath, language, onStatusChange]);

  const getCompletions = useCallback(async (uri: string, position: Position): Promise<CompletionItem[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));

    const langCompletions = mockCompletions[language] || mockCompletions['javascript'] || [];

    // Add document-specific completions based on content
    const doc = openDocuments.current.get(uri);
    if (doc) {
      const lines = doc.text.split('\n');
      const words = new Set<string>();

      lines.forEach(line => {
        const matches = line.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
        if (matches) {
          matches.forEach(word => {
            if (word.length > 2) words.add(word);
          });
        }
      });

      const docCompletions: CompletionItem[] = Array.from(words).map(word => ({
        label: word,
        kind: CompletionItemKind.Text,
        detail: 'Document word'
      }));

      return [...langCompletions, ...docCompletions];
    }

    return langCompletions;
  }, [language]);

  const getHover = useCallback(async (uri: string, position: Position): Promise<HoverInfo | null> => {
    await new Promise(resolve => setTimeout(resolve, 30));

    const doc = openDocuments.current.get(uri);
    if (!doc) return null;

    const lines = doc.text.split('\n');
    if (position.line >= lines.length) return null;

    const line = lines[position.line];

    // Simple word extraction
    let start = position.character;
    let end = position.character;

    while (start > 0 && /\w/.test(line[start - 1])) start--;
    while (end < line.length && /\w/.test(line[end])) end++;

    const word = line.substring(start, end);
    if (!word) return null;

    // Mock hover info based on common patterns
    const hoverInfo: Record<string, string> = {
      'useState': '```typescript\nfunction useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]\n```\nReturns a stateful value, and a function to update it.',
      'useEffect': '```typescript\nfunction useEffect(effect: EffectCallback, deps?: DependencyList): void\n```\nAccepts a function that contains imperative, possibly effectful code.',
      'console': '```typescript\nvar console: Console\n```\nProvides access to the browser\'s debugging console.',
      'document': '```typescript\nvar document: Document\n```\nRepresents the DOM document loaded in the browser.',
      'window': '```typescript\nvar window: Window & typeof globalThis\n```\nRepresents the browser window.',
      'function': 'Declares a function.\n\n```typescript\nfunction name(params): returnType { body }\n```',
      'const': 'Declares a constant value.\n\n```typescript\nconst name: type = value;\n```',
      'interface': 'Defines a TypeScript interface.\n\n```typescript\ninterface Name { properties }\n```'
    };

    if (hoverInfo[word]) {
      return {
        contents: hoverInfo[word],
        range: {
          start: { line: position.line, character: start },
          end: { line: position.line, character: end }
        }
      };
    }

    return {
      contents: `\`${word}\``,
      range: {
        start: { line: position.line, character: start },
        end: { line: position.line, character: end }
      }
    };
  }, []);

  const getDefinition = useCallback(async (uri: string, position: Position): Promise<Location[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    // In a real implementation, this would query the LSP server
    // For demo, return empty or mock data
    return [];
  }, []);

  const getReferences = useCallback(async (uri: string, position: Position): Promise<Location[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));

    const doc = openDocuments.current.get(uri);
    if (!doc) return [];

    const lines = doc.text.split('\n');
    if (position.line >= lines.length) return [];

    const line = lines[position.line];

    // Extract word at position
    let start = position.character;
    let end = position.character;
    while (start > 0 && /\w/.test(line[start - 1])) start--;
    while (end < line.length && /\w/.test(line[end])) end++;
    const word = line.substring(start, end);

    if (!word) return [];

    // Find all occurrences in the document
    const locations: Location[] = [];
    const regex = new RegExp(`\\b${word}\\b`, 'g');

    lines.forEach((l, lineNum) => {
      let match;
      while ((match = regex.exec(l)) !== null) {
        locations.push({
          uri,
          range: {
            start: { line: lineNum, character: match.index },
            end: { line: lineNum, character: match.index + word.length }
          }
        });
      }
    });

    return locations;
  }, []);

  const getSignatureHelp = useCallback(async (uri: string, position: Position): Promise<SignatureHelp | null> => {
    await new Promise(resolve => setTimeout(resolve, 30));

    // Mock signature help
    return null;
  }, []);

  const formatDocument = useCallback(async (uri: string): Promise<{ range: Range; newText: string }[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    // In real implementation, would use prettier or LSP formatter
    return [];
  }, []);

  const rename = useCallback(async (
    uri: string,
    position: Position,
    newName: string
  ): Promise<{ [uri: string]: { range: Range; newText: string }[] }> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const doc = openDocuments.current.get(uri);
    if (!doc) return {};

    const lines = doc.text.split('\n');
    if (position.line >= lines.length) return {};

    const line = lines[position.line];

    // Extract word at position
    let start = position.character;
    let end = position.character;
    while (start > 0 && /\w/.test(line[start - 1])) start--;
    while (end < line.length && /\w/.test(line[end])) end++;
    const oldName = line.substring(start, end);

    if (!oldName) return {};

    // Find all occurrences and create edits
    const edits: { range: Range; newText: string }[] = [];
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');

    lines.forEach((l, lineNum) => {
      let match;
      while ((match = regex.exec(l)) !== null) {
        edits.push({
          range: {
            start: { line: lineNum, character: match.index },
            end: { line: lineNum, character: match.index + oldName.length }
          },
          newText: newName
        });
      }
    });

    return { [uri]: edits };
  }, []);

  const didOpen = useCallback((uri: string, languageId: string, version: number, text: string) => {
    openDocuments.current.set(uri, { version, text });

    // Simulate diagnostics
    if (onDiagnostics) {
      setTimeout(() => {
        const diagnostics: Diagnostic[] = [];
        const lines = text.split('\n');

        lines.forEach((line, lineNum) => {
          // Simple pattern matching for demo diagnostics
          if (line.includes('TODO')) {
            diagnostics.push({
              range: {
                start: { line: lineNum, character: line.indexOf('TODO') },
                end: { line: lineNum, character: line.indexOf('TODO') + 4 }
              },
              message: 'TODO comment found',
              severity: 'info',
              source: 'todo-checker'
            });
          }

          if (line.includes('console.log')) {
            diagnostics.push({
              range: {
                start: { line: lineNum, character: line.indexOf('console.log') },
                end: { line: lineNum, character: line.indexOf('console.log') + 11 }
              },
              message: 'Unexpected console statement',
              severity: 'warning',
              source: 'no-console'
            });
          }

          // Check for potential errors
          if (line.match(/[^=!<>]==[^=]/)) {
            diagnostics.push({
              range: {
                start: { line: lineNum, character: 0 },
                end: { line: lineNum, character: line.length }
              },
              message: 'Use === instead of ==',
              severity: 'warning',
              source: 'eqeqeq'
            });
          }
        });

        onDiagnostics(uri, diagnostics);
      }, 200);
    }
  }, [onDiagnostics]);

  const didChange = useCallback((uri: string, version: number, changes: { range?: Range; text: string }[]) => {
    const doc = openDocuments.current.get(uri);
    if (!doc) return;

    // Apply changes (simplified - in real impl would handle incremental changes)
    if (changes.length === 1 && !changes[0].range) {
      openDocuments.current.set(uri, { version, text: changes[0].text });
    }

    // Re-run diagnostics
    const newDoc = openDocuments.current.get(uri);
    if (newDoc && onDiagnostics) {
      // Debounce diagnostics
      setTimeout(() => {
        const diagnostics: Diagnostic[] = [];
        const lines = newDoc.text.split('\n');

        lines.forEach((line, lineNum) => {
          if (line.includes('TODO')) {
            diagnostics.push({
              range: {
                start: { line: lineNum, character: line.indexOf('TODO') },
                end: { line: lineNum, character: line.indexOf('TODO') + 4 }
              },
              message: 'TODO comment found',
              severity: 'info',
              source: 'todo-checker'
            });
          }

          if (line.includes('console.log')) {
            diagnostics.push({
              range: {
                start: { line: lineNum, character: line.indexOf('console.log') },
                end: { line: lineNum, character: line.indexOf('console.log') + 11 }
              },
              message: 'Unexpected console statement',
              severity: 'warning',
              source: 'no-console'
            });
          }
        });

        onDiagnostics(uri, diagnostics);
      }, 300);
    }
  }, [onDiagnostics]);

  const didSave = useCallback((uri: string) => {
    // Trigger save-related actions
  }, []);

  const didClose = useCallback((uri: string) => {
    openDocuments.current.delete(uri);
  }, []);

  return {
    getCompletions,
    getHover,
    getDefinition,
    getReferences,
    getSignatureHelp,
    formatDocument,
    rename,
    didOpen,
    didChange,
    didSave,
    didClose
  };
}

// LSP Status indicator component
interface LSPStatusProps {
  language: string;
  status: 'starting' | 'ready' | 'error' | 'stopped';
}

export function LSPStatus({ language, status }: LSPStatusProps) {
  const statusColors = {
    starting: '#ffc107',
    ready: '#4caf50',
    error: '#f44336',
    stopped: '#9e9e9e'
  };

  const statusText = {
    starting: 'Starting...',
    ready: 'Ready',
    error: 'Error',
    stopped: 'Stopped'
  };

  return (
    <div className="lsp-status">
      <span
        className="lsp-status-indicator"
        style={{ backgroundColor: statusColors[status] }}
      />
      <span className="lsp-status-language">{language}</span>
      <span className="lsp-status-text">{statusText[status]}</span>
    </div>
  );
}

export function getCompletionItemIcon(kind: CompletionItemKind): string {
  const icons: Record<CompletionItemKind, string> = {
    [CompletionItemKind.Text]: '📝',
    [CompletionItemKind.Method]: '🔧',
    [CompletionItemKind.Function]: 'ƒ',
    [CompletionItemKind.Constructor]: '🏗',
    [CompletionItemKind.Field]: '📦',
    [CompletionItemKind.Variable]: '𝑥',
    [CompletionItemKind.Class]: '📘',
    [CompletionItemKind.Interface]: '📗',
    [CompletionItemKind.Module]: '📁',
    [CompletionItemKind.Property]: '🔑',
    [CompletionItemKind.Unit]: '📏',
    [CompletionItemKind.Value]: '💎',
    [CompletionItemKind.Enum]: '📋',
    [CompletionItemKind.Keyword]: '🔤',
    [CompletionItemKind.Snippet]: '✂️',
    [CompletionItemKind.Color]: '🎨',
    [CompletionItemKind.File]: '📄',
    [CompletionItemKind.Reference]: '🔗',
    [CompletionItemKind.Folder]: '📂',
    [CompletionItemKind.EnumMember]: '📊',
    [CompletionItemKind.Constant]: '🔒',
    [CompletionItemKind.Struct]: '🧱',
    [CompletionItemKind.Event]: '⚡',
    [CompletionItemKind.Operator]: '➕',
    [CompletionItemKind.TypeParameter]: '🏷'
  };
  return icons[kind] || '📝';
}

export default LSPStatus;
