import React, { useState, useEffect, useCallback, useRef } from 'react';

interface AIInlineCompletionProps {
  apiKey: string;
  model: string;
  editorContent: string;
  cursorPosition: { line: number; column: number };
  language: string;
  onAccept: (completion: string) => void;
  onDismiss: () => void;
}

function AIInlineCompletion({
  apiKey,
  model,
  editorContent,
  cursorPosition,
  language,
  onAccept,
  onDismiss,
}: AIInlineCompletionProps) {
  const [completion, setCompletion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const getCompletion = useCallback(async () => {
    if (!apiKey || !editorContent) return;

    const lines = editorContent.split('\n');
    const currentLine = lines[cursorPosition.line - 1] || '';
    const beforeCursor = currentLine.substring(0, cursorPosition.column - 1);

    // Don't trigger on empty lines or just whitespace
    if (!beforeCursor.trim()) {
      setCompletion(null);
      return;
    }

    // Get context (previous lines)
    const contextLines = lines.slice(Math.max(0, cursorPosition.line - 20), cursorPosition.line);
    const context = contextLines.join('\n');

    setIsLoading(true);
    try {
      const result = await window.electronAPI.getAICompletion(
        apiKey,
        model,
        context,
        beforeCursor,
        language
      );
      setCompletion(result);
    } catch (error) {
      console.error('AI completion error:', error);
      setCompletion(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, model, editorContent, cursorPosition, language]);

  useEffect(() => {
    // Debounce the completion request
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      getCompletion();
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [editorContent, cursorPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!completion) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        onAccept(completion);
        setCompletion(null);
      } else if (e.key === 'Escape') {
        onDismiss();
        setCompletion(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completion, onAccept, onDismiss]);

  if (!completion || isLoading) return null;

  return (
    <div className="ai-inline-completion">
      <span className="ai-completion-text">{completion}</span>
      <span className="ai-completion-hint">Tab to accept</span>
    </div>
  );
}

export default AIInlineCompletion;
