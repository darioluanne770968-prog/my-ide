import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

interface TerminalProps {
  rootPath: string | null;
}

interface TerminalInstance {
  id: string;
  name: string;
}

function Terminal({ rootPath }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !rootPath) return;

    const xterm = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 10000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Create terminal in main process
    const terminalId = `terminal-${Date.now()}`;
    window.electronAPI.createTerminal(terminalId, rootPath);

    setTerminals([{ id: terminalId, name: 'Terminal 1' }]);
    setActiveTerminal(terminalId);

    // Handle input
    xterm.onData((data) => {
      window.electronAPI.writeTerminal(terminalId, data);
    });

    // Handle output from main process
    const handleOutput = (_event: any, id: string, data: string) => {
      if (id === terminalId) {
        xterm.write(data);
      }
    };

    window.electronAPI.onTerminalData(handleOutput);

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
        const { cols, rows } = xterm;
        window.electronAPI.resizeTerminal(terminalId, cols, rows);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      window.electronAPI.killTerminal(terminalId);
      xterm.dispose();
    };
  }, [rootPath]);

  const createNewTerminal = () => {
    if (!rootPath) return;
    const terminalId = `terminal-${Date.now()}`;
    const terminalNum = terminals.length + 1;
    window.electronAPI.createTerminal(terminalId, rootPath);
    setTerminals((prev) => [...prev, { id: terminalId, name: `Terminal ${terminalNum}` }]);
    setActiveTerminal(terminalId);
  };

  const closeTerminal = (id: string) => {
    window.electronAPI.killTerminal(id);
    setTerminals((prev) => prev.filter((t) => t.id !== id));
    if (activeTerminal === id) {
      const remaining = terminals.filter((t) => t.id !== id);
      setActiveTerminal(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  if (!rootPath) {
    return (
      <div className="terminal-container">
        <div className="terminal-empty">Open a folder to use the terminal</div>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      <div className="terminal-tabs">
        {terminals.map((term) => (
          <div
            key={term.id}
            className={`terminal-tab ${activeTerminal === term.id ? 'active' : ''}`}
            onClick={() => setActiveTerminal(term.id)}
          >
            <span>{term.name}</span>
            <button
              className="terminal-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTerminal(term.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button className="terminal-new-btn" onClick={createNewTerminal}>
          +
        </button>
      </div>
      <div ref={terminalRef} className="terminal-content" />
    </div>
  );
}

export default Terminal;
