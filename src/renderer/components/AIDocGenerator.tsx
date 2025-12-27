import React, { useState } from 'react';

interface AIDocGeneratorProps {
  apiKey: string;
  model: string;
  code: string;
  language: string;
  onApply: (documentedCode: string) => void;
  onClose: () => void;
}

type DocStyle = 'jsdoc' | 'tsdoc' | 'docstring' | 'javadoc' | 'inline' | 'markdown';

function AIDocGenerator({ apiKey, model, code, language, onApply, onClose }: AIDocGeneratorProps) {
  const [docStyle, setDocStyle] = useState<DocStyle>('auto' as any);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeTypes, setIncludeTypes] = useState(true);
  const [documentedCode, setDocumentedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultStyle = (): DocStyle => {
    switch (language) {
      case 'typescript':
      case 'typescriptreact':
        return 'tsdoc';
      case 'javascript':
      case 'javascriptreact':
        return 'jsdoc';
      case 'python':
        return 'docstring';
      case 'java':
        return 'javadoc';
      default:
        return 'inline';
    }
  };

  const generateDocs = async () => {
    if (!apiKey || !code) return;

    setIsLoading(true);
    setDocumentedCode('');

    try {
      const style = docStyle === 'auto' as any ? getDefaultStyle() : docStyle;
      const styleDescriptions: Record<DocStyle, string> = {
        jsdoc: 'JSDoc format with @param, @returns, @throws tags',
        tsdoc: 'TSDoc format with @param, @returns, @throws, @example tags',
        docstring: 'Python docstrings with Args, Returns, Raises sections',
        javadoc: 'Javadoc format with @param, @return, @throws tags',
        inline: 'Inline comments explaining the code',
        markdown: 'Markdown documentation block above each function'
      };

      const response = await window.electronAPI.sendAIMessage(
        apiKey,
        model,
        [{
          role: 'user',
          content: `Add documentation to the following ${language} code using ${styleDescriptions[style]}.

Requirements:
- Document all functions, classes, and methods
- Include parameter descriptions
- Include return value descriptions
${includeExamples ? '- Add usage examples' : ''}
${includeTypes ? '- Include type information' : ''}
- Keep existing code unchanged, only add documentation

Code:
\`\`\`${language}
${code}
\`\`\`

Output the fully documented code only, no explanations.`
        }]
      );

      const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);
      setDocumentedCode(codeMatch ? codeMatch[1].trim() : response.trim());
    } catch (error: any) {
      setDocumentedCode(`// Error generating documentation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (documentedCode) {
      onApply(documentedCode);
      onClose();
    }
  };

  return (
    <div className="ai-doc-generator">
      <div className="doc-gen-header">
        <h3>AI Documentation Generator</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="doc-gen-options">
        <div className="option-row">
          <div className="option-group">
            <label>Documentation Style:</label>
            <select value={docStyle} onChange={(e) => setDocStyle(e.target.value as DocStyle)}>
              <option value="auto">Auto-detect</option>
              <option value="jsdoc">JSDoc</option>
              <option value="tsdoc">TSDoc</option>
              <option value="docstring">Python Docstring</option>
              <option value="javadoc">Javadoc</option>
              <option value="inline">Inline Comments</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>

          <div className="option-group checkboxes">
            <label>
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
              />
              Include Examples
            </label>
            <label>
              <input
                type="checkbox"
                checked={includeTypes}
                onChange={(e) => setIncludeTypes(e.target.checked)}
              />
              Include Types
            </label>
          </div>
        </div>

        <button
          className="generate-btn"
          onClick={generateDocs}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Documentation'}
        </button>
      </div>

      <div className="doc-gen-content">
        <div className="code-comparison">
          <div className="code-panel original">
            <h4>Original Code</h4>
            <pre><code>{code}</code></pre>
          </div>

          {documentedCode && (
            <div className="code-panel documented">
              <h4>Documented Code</h4>
              <pre><code>{documentedCode}</code></pre>
              <div className="doc-actions">
                <button onClick={handleApply} className="apply-btn">Apply Documentation</button>
                <button onClick={generateDocs} className="retry-btn">Regenerate</button>
              </div>
            </div>
          )}
        </div>

        {!isLoading && !documentedCode && (
          <div className="doc-gen-empty">
            <p>Click "Generate Documentation" to add docs to your code</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIDocGenerator;
