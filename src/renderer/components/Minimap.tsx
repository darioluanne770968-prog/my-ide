import { useRef, useEffect, useState, useCallback } from 'react';

interface MinimapProps {
  content: string;
  visibleRange: { start: number; end: number };
  totalLines: number;
  highlights?: Array<{ line: number; type: 'error' | 'warning' | 'search' | 'change' }>;
  onScrollTo: (line: number) => void;
}

function Minimap({ content, visibleRange, totalLines, highlights = [], onScrollTo }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const LINE_HEIGHT = 2;
  const CHAR_WIDTH = 1;
  const MAX_CHARS = 80;

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = content.split('\n');
    const height = Math.max(lines.length * LINE_HEIGHT, 100);

    canvas.width = 100;
    canvas.height = height;

    // Clear
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw code lines
    ctx.fillStyle = '#6e6e6e';
    lines.forEach((line, i) => {
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;
      const chars = Math.min(trimmed.length, MAX_CHARS);

      for (let j = 0; j < chars; j++) {
        const charCode = trimmed.charCodeAt(j);
        // Different intensity based on character type
        if (charCode > 32) {
          const x = (indent + j) * CHAR_WIDTH;
          const y = i * LINE_HEIGHT;
          ctx.fillRect(x, y, CHAR_WIDTH, LINE_HEIGHT - 1);
        }
      }
    });

    // Draw highlights
    highlights.forEach(h => {
      const colors = {
        error: 'rgba(255, 0, 0, 0.5)',
        warning: 'rgba(255, 200, 0, 0.5)',
        search: 'rgba(255, 255, 0, 0.3)',
        change: 'rgba(0, 200, 0, 0.3)'
      };
      ctx.fillStyle = colors[h.type];
      ctx.fillRect(0, h.line * LINE_HEIGHT, canvas.width, LINE_HEIGHT);
    });

    // Draw visible range slider
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    const sliderTop = (visibleRange.start / totalLines) * height;
    const sliderHeight = ((visibleRange.end - visibleRange.start) / totalLines) * height;
    ctx.fillRect(0, sliderTop, canvas.width, Math.max(sliderHeight, 20));

    // Draw slider border
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.strokeRect(0, sliderTop, canvas.width - 1, Math.max(sliderHeight, 20));
  }, [content, visibleRange, totalLines, highlights]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const line = Math.floor((y / canvas.height) * totalLines);
    onScrollTo(Math.max(1, Math.min(line, totalLines)));
  }, [totalLines, onScrollTo]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    handleClick(e);
  }, [isDragging, handleClick]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="minimap-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="minimap-canvas" />
    </div>
  );
}

export default Minimap;
