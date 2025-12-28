import { useState } from 'react';

interface AICodeExplainerProps {
  code: string;
  language: string;
  apiKey: string;
  model: string;
  onClose: () => void;
}

interface ExplanationSection {
  title: string;
  content: string;
  codeSnippet?: string;
}

export default function AICodeExplainer({
  code,
  language,
  apiKey,
  model,
  onClose
}: AICodeExplainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationSection[]>([]);
  const [selectedText, setSelectedText] = useState(code);
  const [detailLevel, setDetailLevel] = useState<'brief' | 'detailed' | 'expert'>('detailed');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2]));

  const explainCode = async () => {
    if (!apiKey) {
      setExplanation([{
        title: 'Error',
        content: 'Please configure your AI API key in settings.'
      }]);
      return;
    }

    setIsLoading(true);

    // Simulate AI explanation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockExplanations: ExplanationSection[] = [
      {
        title: 'Overview',
        content: `This ${language} code defines a component/function that handles specific functionality. The code follows ${language} best practices and conventions.`
      },
      {
        title: 'Key Components',
        content: 'The code consists of several key parts:\n\n• **Imports/Dependencies**: External modules and utilities required\n• **Main Logic**: Core functionality implementation\n• **Helper Functions**: Supporting utility functions\n• **Exports**: Public API exposed to other modules'
      },
      {
        title: 'Data Flow',
        content: 'Data flows through the code in the following manner:\n\n1. Input is received through function parameters or props\n2. Data is processed and transformed\n3. State may be updated based on the processing\n4. Output is returned or rendered',
        codeSnippet: selectedText.split('\n').slice(0, 5).join('\n')
      },
      {
        title: 'Patterns Used',
        content: 'The code implements several design patterns:\n\n• **Functional Programming**: Pure functions and immutability\n• **Composition**: Building complex behavior from simple pieces\n• **Separation of Concerns**: Clear boundaries between different responsibilities'
      },
      {
        title: 'Potential Improvements',
        content: 'Consider the following improvements:\n\n• Add error handling for edge cases\n• Implement memoization for expensive operations\n• Add TypeScript types for better type safety\n• Extract reusable logic into custom hooks or utilities'
      },
      {
        title: 'Complexity Analysis',
        content: `**Time Complexity**: O(n) - Linear time based on input size\n**Space Complexity**: O(1) - Constant additional space\n\nThe code is efficient for most use cases.`
      }
    ];

    if (detailLevel === 'brief') {
      setExplanation(mockExplanations.slice(0, 2));
    } else if (detailLevel === 'expert') {
      setExplanation([...mockExplanations, {
        title: 'Advanced Concepts',
        content: 'This code leverages advanced concepts including:\n\n• Closure scope for state encapsulation\n• Higher-order functions for abstraction\n• Event-driven architecture patterns\n• Reactive programming paradigms'
      }]);
    } else {
      setExplanation(mockExplanations);
    }

    setIsLoading(false);
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const copyExplanation = () => {
    const text = explanation.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="ai-code-explainer">
      <div className="explainer-header">
        <h3>AI Code Explainer</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="explainer-content">
        <div className="code-section">
          <div className="section-header">
            <span>Code to Explain</span>
            <span className="language-badge">{language}</span>
          </div>
          <textarea
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            placeholder="Paste or select code to explain..."
            rows={10}
          />
        </div>

        <div className="options-section">
          <div className="option-group">
            <label>Detail Level:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={detailLevel === 'brief'}
                  onChange={() => setDetailLevel('brief')}
                />
                Brief
              </label>
              <label>
                <input
                  type="radio"
                  checked={detailLevel === 'detailed'}
                  onChange={() => setDetailLevel('detailed')}
                />
                Detailed
              </label>
              <label>
                <input
                  type="radio"
                  checked={detailLevel === 'expert'}
                  onChange={() => setDetailLevel('expert')}
                />
                Expert
              </label>
            </div>
          </div>

          <button
            className="explain-btn"
            onClick={explainCode}
            disabled={isLoading || !selectedText.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Explain Code'}
          </button>
        </div>

        {explanation.length > 0 && (
          <div className="explanation-section">
            <div className="explanation-header">
              <h4>Explanation</h4>
              <button className="copy-btn" onClick={copyExplanation}>
                Copy All
              </button>
            </div>

            <div className="explanation-list">
              {explanation.map((section, index) => (
                <div key={index} className="explanation-item">
                  <div
                    className="item-header"
                    onClick={() => toggleSection(index)}
                  >
                    <span className={`arrow ${expandedSections.has(index) ? 'expanded' : ''}`}>
                      ▶
                    </span>
                    <span className="item-title">{section.title}</span>
                  </div>

                  {expandedSections.has(index) && (
                    <div className="item-content">
                      <div className="content-text">
                        {section.content.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                      {section.codeSnippet && (
                        <pre className="code-snippet">
                          <code>{section.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-code-explainer {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .explainer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .explainer-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .explainer-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .code-section { margin-bottom: 16px; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .language-badge {
          background: var(--accent-color);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        .code-section textarea {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          padding: 12px;
          resize: vertical;
        }
        .options-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 4px;
        }
        .option-group { display: flex; align-items: center; gap: 12px; }
        .option-group label { font-size: 12px; color: var(--text-secondary); }
        .radio-group { display: flex; gap: 16px; }
        .radio-group label {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .explain-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 8px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        }
        .explain-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .explanation-section { margin-top: 16px; }
        .explanation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .explanation-header h4 { margin: 0; font-size: 13px; }
        .copy-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }
        .explanation-list { display: flex; flex-direction: column; gap: 8px; }
        .explanation-item {
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          cursor: pointer;
        }
        .item-header:hover { background: var(--bg-hover); }
        .arrow {
          font-size: 10px;
          transition: transform 0.2s;
        }
        .arrow.expanded { transform: rotate(90deg); }
        .item-title { font-weight: 500; font-size: 13px; }
        .item-content {
          padding: 0 12px 12px 28px;
          font-size: 12px;
          line-height: 1.6;
        }
        .content-text p { margin: 4px 0; }
        .code-snippet {
          background: var(--bg-primary);
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
          font-size: 11px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
