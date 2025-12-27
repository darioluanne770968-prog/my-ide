import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  apiKey: string;
  model: string;
  currentFile?: {
    path: string;
    content: string;
  };
}

function AIChat({ apiKey, model, currentFile }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let contextMessage = '';
      if (includeContext && currentFile) {
        contextMessage = `\n\nCurrent file (${currentFile.path}):\n\`\`\`\n${currentFile.content}\n\`\`\``;
      }

      const response = await window.electronAPI.sendAIMessage(
        apiKey,
        model,
        [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: input + contextMessage },
        ]
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{content.substring(lastIndex, match.index)}</span>
        );
      }
      const language = match[1] || 'plaintext';
      const code = match[2];
      parts.push(
        <div key={match.index} className="ai-code-block">
          <div className="ai-code-header">
            <span>{language}</span>
            <button onClick={() => copyToClipboard(code)}>Copy</button>
          </div>
          <pre><code>{code}</code></pre>
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  if (!apiKey) {
    return (
      <div className="ai-chat">
        <div className="ai-empty">
          <p>Please configure your API key in Settings to use AI Chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chat">
      <div className="ai-header">
        <span>AI Assistant</span>
        <div className="ai-header-actions">
          <label className="ai-context-toggle">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
            />
            Include current file
          </label>
          <button onClick={clearChat} title="Clear chat">
            🗑️
          </button>
        </div>
      </div>

      <div className="ai-messages">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <p>Hello! I'm your AI assistant. How can I help you with your code?</p>
            <div className="ai-suggestions">
              <button onClick={() => setInput('Explain this code')}>
                Explain this code
              </button>
              <button onClick={() => setInput('Find bugs in this code')}>
                Find bugs
              </button>
              <button onClick={() => setInput('Refactor this code')}>
                Refactor
              </button>
              <button onClick={() => setInput('Add comments to this code')}>
                Add comments
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`ai-message ${msg.role}`}>
              <div className="ai-message-header">
                <span className="ai-message-role">
                  {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </span>
                <span className="ai-message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="ai-message-content">{renderContent(msg.content)}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="ai-message assistant">
            <div className="ai-loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-container">
        <textarea
          ref={textareaRef}
          className="ai-input"
          placeholder="Ask me anything about your code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={isLoading}
        />
        <button
          className="ai-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}

export default AIChat;
