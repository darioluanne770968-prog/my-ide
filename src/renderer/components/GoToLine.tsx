import React, { useState, useRef, useEffect } from 'react';

interface GoToLineProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLine: (line: number, column?: number) => void;
  maxLine: number;
}

function GoToLine({ isOpen, onClose, onGoToLine, maxLine }: GoToLineProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setInput('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const parts = input.split(':');
    const line = parseInt(parts[0], 10);
    const column = parts[1] ? parseInt(parts[1], 10) : undefined;

    if (!isNaN(line) && line >= 1 && line <= maxLine) {
      onGoToLine(line, column);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="goto-line-overlay" onClick={onClose}>
      <div className="goto-line-dialog" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          className="goto-line-input"
          placeholder={`Go to line (1-${maxLine}), optionally :column`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="goto-line-hint">
          Type a line number and press Enter. Use "line:column" format to also specify column.
        </div>
      </div>
    </div>
  );
}

export default GoToLine;
