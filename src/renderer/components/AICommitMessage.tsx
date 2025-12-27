import React, { useState } from 'react';

interface AICommitMessageProps {
  apiKey: string;
  model: string;
  stagedChanges: string;
  onGenerated: (message: string) => void;
  onClose: () => void;
}

function AICommitMessage({ apiKey, model, stagedChanges, onGenerated, onClose }: AICommitMessageProps) {
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<'conventional' | 'detailed' | 'simple'>('conventional');

  const generateMessage = async () => {
    if (!apiKey || !stagedChanges) return;

    setIsLoading(true);
    try {
      const stylePrompts = {
        conventional: 'Use conventional commit format (type(scope): description). Types: feat, fix, docs, style, refactor, test, chore.',
        detailed: 'Provide a detailed commit message with a summary line and bullet points explaining the changes.',
        simple: 'Provide a simple one-line commit message.'
      };

      const response = await window.electronAPI.sendAIMessage(
        apiKey,
        model,
        [{
          role: 'user',
          content: `Generate a git commit message for the following changes. ${stylePrompts[style]}

Changes:
${stagedChanges}

Only output the commit message, nothing else.`
        }]
      );

      setGeneratedMessage(response.trim());
    } catch (error: any) {
      setGeneratedMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUse = () => {
    onGenerated(generatedMessage);
    onClose();
  };

  return (
    <div className="ai-commit-message">
      <div className="ai-commit-header">
        <h3>AI Commit Message Generator</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="ai-commit-content">
        <div className="style-selector">
          <label>Style:</label>
          <select value={style} onChange={(e) => setStyle(e.target.value as any)}>
            <option value="conventional">Conventional Commits</option>
            <option value="detailed">Detailed</option>
            <option value="simple">Simple</option>
          </select>
        </div>

        <div className="changes-preview">
          <label>Staged Changes:</label>
          <pre className="changes-content">{stagedChanges || 'No staged changes'}</pre>
        </div>

        <button
          className="generate-btn"
          onClick={generateMessage}
          disabled={isLoading || !stagedChanges}
        >
          {isLoading ? 'Generating...' : 'Generate Message'}
        </button>

        {generatedMessage && (
          <div className="generated-message">
            <label>Generated Message:</label>
            <textarea
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              rows={4}
            />
            <div className="message-actions">
              <button onClick={handleUse} className="use-btn">Use This Message</button>
              <button onClick={generateMessage} className="regenerate-btn">Regenerate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AICommitMessage;
