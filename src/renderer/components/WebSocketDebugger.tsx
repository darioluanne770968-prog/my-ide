import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'sent' | 'received' | 'system';
  data: string;
  timestamp: Date;
}

interface WebSocketDebuggerProps {
  onClose: () => void;
}

function WebSocketDebugger({ onClose }: WebSocketDebuggerProps) {
  const [url, setUrl] = useState('wss://');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageToSend, setMessageToSend] = useState('');
  const [messageFormat, setMessageFormat] = useState<'text' | 'json'>('text');
  const [autoReconnect, setAutoReconnect] = useState(false);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const addMessage = (type: Message['type'], data: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date()
    }]);
  };

  const connect = () => {
    if (!url) return;

    setIsConnecting(true);
    addMessage('system', `Connecting to ${url}...`);

    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        addMessage('system', 'Connected successfully');
      };

      socket.onmessage = (event) => {
        let data = event.data;
        if (messageFormat === 'json') {
          try {
            data = JSON.stringify(JSON.parse(event.data), null, 2);
          } catch {
            // Keep as-is if not valid JSON
          }
        }
        addMessage('received', data);
      };

      socket.onerror = (error) => {
        addMessage('system', `Error: Connection error`);
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        addMessage('system', `Disconnected: ${event.code} ${event.reason || ''}`);

        if (autoReconnect && event.code !== 1000) {
          setTimeout(() => connect(), 3000);
        }
      };

      socketRef.current = socket;
    } catch (error: any) {
      setIsConnecting(false);
      addMessage('system', `Error: ${error.message}`);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnected');
      socketRef.current = null;
    }
  };

  const sendMessage = () => {
    if (!socketRef.current || !messageToSend || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    let dataToSend = messageToSend;
    if (messageFormat === 'json') {
      try {
        // Validate and format JSON
        dataToSend = JSON.stringify(JSON.parse(messageToSend));
      } catch {
        addMessage('system', 'Error: Invalid JSON format');
        return;
      }
    }

    socketRef.current.send(dataToSend);
    addMessage('sent', messageToSend);
    setMessageToSend('');
  };

  const saveMessage = () => {
    if (messageToSend && !savedMessages.includes(messageToSend)) {
      setSavedMessages([...savedMessages, messageToSend]);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="websocket-debugger">
      <div className="ws-header">
        <h3>WebSocket Debugger</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="ws-content">
        <div className="ws-connection">
          <input
            type="text"
            placeholder="wss://example.com/socket"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isConnected || isConnecting}
          />
          {!isConnected ? (
            <button onClick={connect} disabled={isConnecting} className="connect-btn">
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button onClick={disconnect} className="disconnect-btn">Disconnect</button>
          )}
          <label className="auto-reconnect">
            <input
              type="checkbox"
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
            />
            Auto-reconnect
          </label>
        </div>

        <div className="ws-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          <div className="format-selector">
            <label>
              <input
                type="radio"
                checked={messageFormat === 'text'}
                onChange={() => setMessageFormat('text')}
              /> Text
            </label>
            <label>
              <input
                type="radio"
                checked={messageFormat === 'json'}
                onChange={() => setMessageFormat('json')}
              /> JSON
            </label>
          </div>
          <button onClick={clearMessages} className="clear-btn">Clear</button>
        </div>

        <div className="ws-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ws-message ${msg.type}`}>
              <span className="msg-time">{formatTimestamp(msg.timestamp)}</span>
              <span className="msg-type">
                {msg.type === 'sent' ? '→' : msg.type === 'received' ? '←' : '●'}
              </span>
              <pre className="msg-data">{msg.data}</pre>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="ws-send">
          <textarea
            placeholder={messageFormat === 'json' ? '{\n  "type": "message",\n  "data": "hello"\n}' : 'Message to send...'}
            value={messageToSend}
            onChange={(e) => setMessageToSend(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={4}
            disabled={!isConnected}
          />
          <div className="send-actions">
            <button onClick={saveMessage} disabled={!messageToSend} title="Save message">💾</button>
            <button onClick={sendMessage} disabled={!isConnected || !messageToSend} className="send-btn">
              Send (Ctrl+Enter)
            </button>
          </div>
        </div>

        {savedMessages.length > 0 && (
          <div className="ws-saved">
            <h4>Saved Messages</h4>
            <div className="saved-list">
              {savedMessages.map((msg, idx) => (
                <div key={idx} className="saved-item" onClick={() => setMessageToSend(msg)}>
                  <span className="saved-msg">{msg.substring(0, 50)}{msg.length > 50 ? '...' : ''}</span>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setSavedMessages(savedMessages.filter((_, i) => i !== idx));
                  }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebSocketDebugger;
