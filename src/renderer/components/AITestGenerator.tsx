import React, { useState } from 'react';

interface AITestGeneratorProps {
  apiKey: string;
  model: string;
  code: string;
  language: string;
  filePath: string;
  onInsert: (testCode: string) => void;
  onClose: () => void;
}

type TestFramework = 'jest' | 'mocha' | 'vitest' | 'pytest' | 'unittest' | 'auto';

function AITestGenerator({ apiKey, model, code, language, filePath, onInsert, onClose }: AITestGeneratorProps) {
  const [framework, setFramework] = useState<TestFramework>('auto');
  const [testType, setTestType] = useState<'unit' | 'integration' | 'edge-cases'>('unit');
  const [generatedTests, setGeneratedTests] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFrameworkForLanguage = (): string => {
    if (framework !== 'auto') return framework;

    switch (language) {
      case 'typescript':
      case 'typescriptreact':
      case 'javascript':
      case 'javascriptreact':
        return 'jest';
      case 'python':
        return 'pytest';
      default:
        return 'jest';
    }
  };

  const generateTests = async () => {
    if (!apiKey || !code) return;

    setIsLoading(true);
    setGeneratedTests('');

    try {
      const selectedFramework = getFrameworkForLanguage();
      const testTypeDescriptions = {
        'unit': 'unit tests for individual functions and methods',
        'integration': 'integration tests for component interactions',
        'edge-cases': 'tests focusing on edge cases, error handling, and boundary conditions'
      };

      const response = await window.electronAPI.sendAIMessage(
        apiKey,
        model,
        [{
          role: 'user',
          content: `Generate ${testTypeDescriptions[testType]} for the following ${language} code using ${selectedFramework}.

Source code from ${filePath}:
\`\`\`${language}
${code}
\`\`\`

Requirements:
- Use ${selectedFramework} testing framework
- Include descriptive test names
- Add comments explaining what each test verifies
- Cover main functionality and common scenarios
- Use proper mocking where needed

Only output the test code, no explanations.`
        }]
      );

      const codeMatch = response.match(/```(?:\w+)?\s*([\s\S]*?)```/);
      setGeneratedTests(codeMatch ? codeMatch[1].trim() : response.trim());
    } catch (error: any) {
      setGeneratedTests(`// Error generating tests: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedTests) {
      onInsert(generatedTests);
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTests);
  };

  return (
    <div className="ai-test-generator">
      <div className="test-gen-header">
        <h3>AI Test Generator</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="test-gen-options">
        <div className="option-group">
          <label>Framework:</label>
          <select value={framework} onChange={(e) => setFramework(e.target.value as TestFramework)}>
            <option value="auto">Auto-detect</option>
            <option value="jest">Jest</option>
            <option value="vitest">Vitest</option>
            <option value="mocha">Mocha</option>
            <option value="pytest">pytest</option>
            <option value="unittest">unittest</option>
          </select>
        </div>

        <div className="option-group">
          <label>Test Type:</label>
          <select value={testType} onChange={(e) => setTestType(e.target.value as any)}>
            <option value="unit">Unit Tests</option>
            <option value="integration">Integration Tests</option>
            <option value="edge-cases">Edge Cases</option>
          </select>
        </div>

        <button
          className="generate-btn"
          onClick={generateTests}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Tests'}
        </button>
      </div>

      <div className="test-gen-content">
        <div className="source-preview">
          <h4>Source Code</h4>
          <pre><code>{code.slice(0, 500)}{code.length > 500 ? '...' : ''}</code></pre>
        </div>

        {generatedTests && (
          <div className="generated-tests">
            <div className="tests-header">
              <h4>Generated Tests</h4>
              <div className="tests-actions">
                <button onClick={copyToClipboard} title="Copy to clipboard">📋 Copy</button>
                <button onClick={handleInsert} className="insert-btn">Insert Tests</button>
              </div>
            </div>
            <pre><code>{generatedTests}</code></pre>
          </div>
        )}

        {!isLoading && !generatedTests && (
          <div className="test-gen-empty">
            <p>Select options and click "Generate Tests" to create test cases</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AITestGenerator;
