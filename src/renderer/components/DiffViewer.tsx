import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface DiffViewerProps {
  originalContent: string;
  modifiedContent: string;
  originalFileName: string;
  modifiedFileName: string;
  language: string;
  onClose: () => void;
}

function DiffViewer({
  originalContent,
  modifiedContent,
  originalFileName,
  modifiedFileName,
  language,
  onClose,
}: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const originalModel = monaco.editor.createModel(originalContent, language);
    const modifiedModel = monaco.editor.createModel(modifiedContent, language);

    const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
      theme: 'vs-dark',
      automaticLayout: true,
      readOnly: true,
      renderSideBySide: true,
      enableSplitViewResizing: true,
      ignoreTrimWhitespace: false,
      renderIndicators: true,
      originalEditable: false,
    });

    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    editorRef.current = diffEditor;

    return () => {
      originalModel.dispose();
      modifiedModel.dispose();
      diffEditor.dispose();
    };
  }, [originalContent, modifiedContent, language]);

  return (
    <div className="diff-viewer">
      <div className="diff-header">
        <div className="diff-file-names">
          <span className="diff-original">{originalFileName} (Original)</span>
          <span className="diff-separator">↔</span>
          <span className="diff-modified">{modifiedFileName} (Modified)</span>
        </div>
        <button className="diff-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div ref={containerRef} className="diff-editor-container" />
    </div>
  );
}

export default DiffViewer;
