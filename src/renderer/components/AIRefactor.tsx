import React, { useState } from 'react';

interface AIRefactorProps {
  apiKey: string;
  model: string;
  code: string;
  language: string;
  onApply: (newCode: string) => void;
  onClose: () => void;
}

type RefactorType = 'extract-function' | 'rename' | 'simplify' | 'optimize' | 'modernize' | 'custom';

function AIRefactor({ apiKey, model, code, language, onApply, onClose }: AIRefactorProps) {
  const [refactorType, setRefactorType] = useState<RefactorType>('simplify');
  const [customPrompt, setCustomPrompt] = useState('');
  const [refactoredCode, setRefactoredCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const refactorPrompts: Record<RefactorType, string> = {
    'extract-function': 'Extract repeated logic into reusable functions',
    'rename': 'Improve variable and function names for better readability',
    'simplify': 'Simplify complex logic and reduce code complexity',
    'optimize': 'Optimize for better performance',
    'modernize': `Modernize to use latest ${language} features and best practices`,
    'custom': customPrompt
  };

  const runRefactor = async () => {
    if (!apiKey || !code) return;

    setIsLoading(true);
    setRefactoredCode('');
    setExplanation('');

    try {
      const response = await window.electronAPI.sendAIMessage(
        apiKey,
        model,
        [{
          role: 'user',
          content: `Refactor this ${language} code. Goal: ${refactorPrompts[refactorType]}

Original code:
\`\`\`${language}
${code}
\`\`\`

Respond in this exact format:
EXPLANATION:
<Brief explanation of changes made>

REFACTORED CODE:
\`\`\`${language}
<refactored code here>
\`\`\``
        }]
      );

      const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=REFACTORED CODE:)/i);
      const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);

      if (explanationMatch) {
        setExplanation(explanationMatch[1].trim());
      }
      if (codeMatch) {
        setRefactoredCode(codeMatch[1].trim());
      } else {
        setRefactoredCode(response);
      }
    } catch (error: any) {
      setExplanation(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (refactoredCode) {
      onApply(refactoredCode);
      onClose();
    }
  };

  return (
    <div className="ai-refactor">
      <div className="refactor-header">
        <h3>AI Refactor</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="refactor-options">
        <label>Refactor Type:</label>
        <div className="refactor-types">
          <button
            className={refactorType === 'simplify' ? 'active' : ''}
            onClick={() => setRefactorType('simplify')}
          >
            Simplify
          </button>
          <button
            className={refactorType === 'extract-function' ? 'active' : ''}
            onClick={() => setRefactorType('extract-function')}
          >
            Extract Functions
          </button>
          <button
            className={refactorType === 'rename' ? 'active' : ''}
            onClick={() => setRefactorType('rename')}
          >
            Improve Names
          </button>
          <button
            className={refactorType === 'optimize' ? 'active' : ''}
            onClick={() => setRefactorType('optimize')}
          >
            Optimize
          </button>
          <button
            className={refactorType === 'modernize' ? 'active' : ''}
            onClick={() => setRefactorType('modernize')}
          >
            Modernize
          </button>
          <button
            className={refactorType === 'custom' ? 'active' : ''}
            onClick={() => setRefactorType('custom')}
          >
            Custom
          </button>
        </div>

        {refactorType === 'custom' && (
          <textarea
            className="custom-prompt"
            placeholder="Describe how you want to refactor the code..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
          />
        )}

        <button
          className="refactor-btn"
          onClick={runRefactor}
          disabled={isLoading || (refactorType === 'custom' && !customPrompt)}
        >
          {isLoading ? 'Refactoring...' : 'Refactor Code'}
        </button>
      </div>

      <div className="refactor-content">
        <div className="code-panel original">
          <h4>Original Code</h4>
          <pre><code>{code}</code></pre>
        </div>

        {refactoredCode && (
          <div className="code-panel refactored">
            <h4>Refactored Code</h4>
            {explanation && (
              <div className="refactor-explanation">
                <strong>Changes:</strong> {explanation}
              </div>
            )}
            <pre><code>{refactoredCode}</code></pre>
            <div className="refactor-actions">
              <button onClick={handleApply} className="apply-btn">Apply Changes</button>
              <button onClick={runRefactor} className="retry-btn">Try Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIRefactor;
