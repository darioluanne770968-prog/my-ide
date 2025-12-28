import { useState, useRef, useEffect } from 'react';

interface AIPairProgrammerProps {
  code: string;
  language: string;
  fileName: string;
  apiKey: string;
  model: string;
  onCodeChange: (newCode: string) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeChanges?: {
    original: string;
    modified: string;
    description: string;
  };
  timestamp: Date;
}

interface Suggestion {
  id: string;
  type: 'refactor' | 'optimize' | 'fix' | 'feature' | 'test';
  title: string;
  description: string;
}

export default function AIPairProgrammer({
  code,
  language,
  fileName,
  apiKey,
  model,
  onCodeChange,
  onClose
}: AIPairProgrammerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm your AI pair programming assistant. I'm here to help you with ${fileName}. What would you like to work on together?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeMode, setActiveMode] = useState<'chat' | 'suggestions' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Generate initial suggestions based on code
    generateSuggestions();
  }, []);

  const generateSuggestions = () => {
    const mockSuggestions: Suggestion[] = [
      {
        id: '1',
        type: 'refactor',
        title: 'Extract reusable function',
        description: 'I noticed repeated logic that could be extracted into a reusable helper function.'
      },
      {
        id: '2',
        type: 'optimize',
        title: 'Optimize loop performance',
        description: 'The nested loops could be optimized using a more efficient data structure.'
      },
      {
        id: '3',
        type: 'fix',
        title: 'Add error handling',
        description: 'Some async operations lack proper error handling which could cause issues.'
      },
      {
        id: '4',
        type: 'test',
        title: 'Add unit tests',
        description: 'This function would benefit from comprehensive unit tests.'
      },
      {
        id: '5',
        type: 'feature',
        title: 'Add input validation',
        description: 'Consider adding input validation to improve robustness.'
      }
    ];
    setSuggestions(mockSuggestions);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses = [
      {
        content: "I've analyzed your request. Here's what I suggest we do:\n\n1. First, let's refactor the existing function to be more modular\n2. Then we can add proper error handling\n3. Finally, we'll optimize the performance\n\nShall I start with the first step?",
        codeChanges: undefined
      },
      {
        content: "Great idea! I've made the changes you requested. Here's what I modified:",
        codeChanges: {
          original: 'function oldCode() {\n  // old implementation\n}',
          modified: 'function newCode() {\n  // improved implementation\n  // with better error handling\n}',
          description: 'Refactored function with improved error handling and cleaner code structure.'
        }
      },
      {
        content: "I see what you're trying to achieve. Let me help you implement this properly. The key is to:\n\n- Use async/await for cleaner code\n- Add proper TypeScript types\n- Implement caching for better performance\n\nWould you like me to implement these improvements?"
      }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      codeChanges: response.codeChanges,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsThinking(false);
  };

  const applySuggestion = (suggestion: Suggestion) => {
    setInput(`Let's work on: ${suggestion.title}. ${suggestion.description}`);
  };

  const applyCodeChange = (changes: NonNullable<Message['codeChanges']>) => {
    onCodeChange(changes.modified);
  };

  const getSuggestionIcon = (type: Suggestion['type']) => {
    const icons = {
      refactor: '🔄',
      optimize: '⚡',
      fix: '🔧',
      feature: '✨',
      test: '🧪'
    };
    return icons[type];
  };

  return (
    <div className="ai-pair-programmer">
      <div className="pair-header">
        <div className="header-left">
          <h3>AI Pair Programmer</h3>
          <span className="file-badge">{fileName}</span>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="mode-tabs">
        <button
          className={`mode-tab ${activeMode === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveMode('chat')}
        >
          Chat
        </button>
        <button
          className={`mode-tab ${activeMode === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveMode('suggestions')}
        >
          Suggestions ({suggestions.length})
        </button>
        <button
          className={`mode-tab ${activeMode === 'history' ? 'active' : ''}`}
          onClick={() => setActiveMode('history')}
        >
          History
        </button>
      </div>

      <div className="pair-content">
        {activeMode === 'chat' && (
          <>
            <div className="messages-container">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>

                    {message.codeChanges && (
                      <div className="code-changes">
                        <div className="changes-header">
                          <span>Proposed Changes</span>
                          <button
                            className="apply-btn"
                            onClick={() => applyCodeChange(message.codeChanges!)}
                          >
                            Apply Changes
                          </button>
                        </div>
                        <div className="changes-description">
                          {message.codeChanges.description}
                        </div>
                        <div className="diff-preview">
                          <div className="diff-side removed">
                            <div className="diff-label">Before</div>
                            <pre>{message.codeChanges.original}</pre>
                          </div>
                          <div className="diff-side added">
                            <div className="diff-label">After</div>
                            <pre>{message.codeChanges.modified}</pre>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="thinking-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Describe what you want to build or ask for help..."
                rows={3}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={isThinking || !input.trim()}
              >
                Send
              </button>
            </div>
          </>
        )}

        {activeMode === 'suggestions' && (
          <div className="suggestions-container">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-card">
                <div className="suggestion-icon">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-description">{suggestion.description}</div>
                </div>
                <button
                  className="work-on-btn"
                  onClick={() => {
                    applySuggestion(suggestion);
                    setActiveMode('chat');
                  }}
                >
                  Work on this
                </button>
              </div>
            ))}
          </div>
        )}

        {activeMode === 'history' && (
          <div className="history-container">
            <div className="history-item">
              <div className="history-time">Today, 10:30 AM</div>
              <div className="history-action">Refactored handleSubmit function</div>
            </div>
            <div className="history-item">
              <div className="history-time">Today, 10:15 AM</div>
              <div className="history-action">Added error handling to API calls</div>
            </div>
            <div className="history-item">
              <div className="history-time">Yesterday, 4:45 PM</div>
              <div className="history-action">Optimized rendering performance</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-pair-programmer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .pair-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .pair-header h3 { margin: 0; font-size: 14px; }
        .file-badge {
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .mode-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        .mode-tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          border-bottom: 2px solid transparent;
        }
        .mode-tab.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }
        .pair-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .message-avatar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: 50%;
          font-size: 16px;
        }
        .message-content { flex: 1; }
        .message-text {
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .message-time {
          font-size: 10px;
          color: var(--text-tertiary);
          margin-top: 4px;
        }
        .code-changes {
          margin-top: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .changes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .apply-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .changes-description {
          padding: 8px 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .diff-preview {
          display: flex;
          border-top: 1px solid var(--border-color);
        }
        .diff-side {
          flex: 1;
          padding: 8px;
        }
        .diff-side.removed { background: rgba(231, 76, 60, 0.1); }
        .diff-side.added { background: rgba(39, 174, 96, 0.1); }
        .diff-label {
          font-size: 10px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .diff-side pre {
          font-size: 11px;
          margin: 0;
          overflow-x: auto;
        }
        .thinking-indicator {
          display: flex;
          gap: 4px;
        }
        .thinking-indicator span {
          width: 8px;
          height: 8px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .thinking-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .thinking-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .input-container {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
        }
        .input-container textarea {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          padding: 12px;
          font-size: 13px;
          resize: none;
        }
        .send-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          align-self: flex-end;
        }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .suggestions-container {
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .suggestion-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .suggestion-icon { font-size: 24px; }
        .suggestion-content { flex: 1; }
        .suggestion-title { font-weight: 500; font-size: 14px; }
        .suggestion-description {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .work-on-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .history-container {
          padding: 16px;
          overflow-y: auto;
        }
        .history-item {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .history-time {
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .history-action {
          font-size: 13px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
