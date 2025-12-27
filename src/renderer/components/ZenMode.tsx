import { useState, useEffect, useCallback, ReactNode } from 'react';

interface ZenModeProps {
  children: ReactNode;
  isActive: boolean;
  onExit: () => void;
}

function ZenMode({ children, isActive, onExit }: ZenModeProps) {
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 2000);

    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  useEffect(() => {
    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [isActive, handleMouseMove, controlsTimeout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onExit]);

  if (!isActive) return <>{children}</>;

  return (
    <div className="zen-mode">
      <div className="zen-mode-content">
        {children}
      </div>

      <div className={`zen-mode-controls ${showControls ? 'visible' : ''}`}>
        <button onClick={onExit} className="zen-exit-btn" title="Exit Zen Mode (Esc)">
          Exit Zen Mode
        </button>
      </div>

      <div className={`zen-mode-hint ${showControls ? 'visible' : ''}`}>
        Press <kbd>Esc</kbd> to exit Zen Mode
      </div>
    </div>
  );
}

export default ZenMode;
