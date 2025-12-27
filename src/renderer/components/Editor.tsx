import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { AppSettings } from './Settings';

interface EditorProps {
  filePath: string;
  content: string;
  settings: AppSettings;
  onChange: (content: string) => void;
  onSave: () => void;
  onCursorChange?: (line: number, column: number) => void;
}

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    sh: 'shell',
    bash: 'shell',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sql: 'sql',
  };
  return languageMap[ext || ''] || 'plaintext';
}

function Editor({ filePath, content, settings, onChange, onSave, onCursorChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: content,
      language: getLanguageFromPath(filePath),
      theme: settings.theme === 'dark' ? 'vs-dark' : 'vs',
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      minimap: { enabled: settings.minimap },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      suggest: {
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
      },
    });

    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });

    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    // Ctrl/Cmd + S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    return () => {
      editor.dispose();
    };
  }, [filePath]);

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: settings.theme === 'dark' ? 'vs-dark' : 'vs',
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        minimap: { enabled: settings.minimap },
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== content) {
        editorRef.current.setValue(content);
      }
    }
  }, [content]);

  return <div ref={containerRef} className="monaco-editor-container" />;
}

export default Editor;
