import { useState, useCallback } from 'react';

export interface LintRule {
  id: string;
  name: string;
  description: string;
  severity: 'off' | 'warn' | 'error';
  category: string;
  fixable: boolean;
  recommended: boolean;
}

export interface LintResult {
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

export interface LintMessage {
  ruleId: string;
  severity: 1 | 2; // 1 = warning, 2 = error
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fix?: {
    range: [number, number];
    text: string;
  };
}

export interface FormatOptions {
  parser: 'typescript' | 'babel' | 'css' | 'html' | 'json' | 'markdown';
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  bracketSpacing: boolean;
  arrowParens: 'avoid' | 'always';
  printWidth: number;
  endOfLine: 'auto' | 'lf' | 'crlf' | 'cr';
}

interface LinterConfigProps {
  eslintRules: LintRule[];
  prettierOptions: FormatOptions;
  onESLintChange: (rules: LintRule[]) => void;
  onPrettierChange: (options: FormatOptions) => void;
  onClose: () => void;
}

// Default ESLint rules
export const defaultESLintRules: LintRule[] = [
  // Possible Errors
  { id: 'no-console', name: 'no-console', description: 'Disallow console statements', severity: 'warn', category: 'Possible Errors', fixable: false, recommended: true },
  { id: 'no-debugger', name: 'no-debugger', description: 'Disallow debugger statements', severity: 'error', category: 'Possible Errors', fixable: false, recommended: true },
  { id: 'no-dupe-args', name: 'no-dupe-args', description: 'Disallow duplicate arguments in function definitions', severity: 'error', category: 'Possible Errors', fixable: false, recommended: true },
  { id: 'no-dupe-keys', name: 'no-dupe-keys', description: 'Disallow duplicate keys in object literals', severity: 'error', category: 'Possible Errors', fixable: false, recommended: true },
  { id: 'no-unreachable', name: 'no-unreachable', description: 'Disallow unreachable code after return, throw, continue, and break statements', severity: 'error', category: 'Possible Errors', fixable: false, recommended: true },
  { id: 'valid-typeof', name: 'valid-typeof', description: 'Enforce comparing typeof expressions against valid strings', severity: 'error', category: 'Possible Errors', fixable: false, recommended: true },

  // Best Practices
  { id: 'eqeqeq', name: 'eqeqeq', description: 'Require === and !==', severity: 'error', category: 'Best Practices', fixable: true, recommended: true },
  { id: 'no-eval', name: 'no-eval', description: 'Disallow eval()', severity: 'error', category: 'Best Practices', fixable: false, recommended: true },
  { id: 'no-implied-eval', name: 'no-implied-eval', description: 'Disallow implied eval() through setTimeout(), setInterval()', severity: 'error', category: 'Best Practices', fixable: false, recommended: true },
  { id: 'no-multi-spaces', name: 'no-multi-spaces', description: 'Disallow multiple spaces', severity: 'warn', category: 'Best Practices', fixable: true, recommended: false },
  { id: 'no-unused-vars', name: 'no-unused-vars', description: 'Disallow unused variables', severity: 'warn', category: 'Best Practices', fixable: false, recommended: true },
  { id: 'prefer-const', name: 'prefer-const', description: 'Require const declarations for variables that are never reassigned', severity: 'warn', category: 'Best Practices', fixable: true, recommended: true },

  // Stylistic Issues
  { id: 'indent', name: 'indent', description: 'Enforce consistent indentation', severity: 'warn', category: 'Stylistic Issues', fixable: true, recommended: false },
  { id: 'quotes', name: 'quotes', description: 'Enforce the consistent use of single or double quotes', severity: 'warn', category: 'Stylistic Issues', fixable: true, recommended: false },
  { id: 'semi', name: 'semi', description: 'Require or disallow semicolons', severity: 'warn', category: 'Stylistic Issues', fixable: true, recommended: false },
  { id: 'comma-dangle', name: 'comma-dangle', description: 'Require or disallow trailing commas', severity: 'warn', category: 'Stylistic Issues', fixable: true, recommended: false },

  // TypeScript
  { id: '@typescript-eslint/no-explicit-any', name: '@typescript-eslint/no-explicit-any', description: 'Disallow the any type', severity: 'warn', category: 'TypeScript', fixable: false, recommended: true },
  { id: '@typescript-eslint/no-unused-vars', name: '@typescript-eslint/no-unused-vars', description: 'Disallow unused variables (TypeScript-aware)', severity: 'warn', category: 'TypeScript', fixable: false, recommended: true },
  { id: '@typescript-eslint/explicit-function-return-type', name: '@typescript-eslint/explicit-function-return-type', description: 'Require explicit return types on functions', severity: 'off', category: 'TypeScript', fixable: false, recommended: false },

  // React
  { id: 'react/prop-types', name: 'react/prop-types', description: 'Prevent missing props validation in React component', severity: 'off', category: 'React', fixable: false, recommended: false },
  { id: 'react/react-in-jsx-scope', name: 'react/react-in-jsx-scope', description: 'Prevent missing React when using JSX', severity: 'off', category: 'React', fixable: false, recommended: false },
  { id: 'react-hooks/rules-of-hooks', name: 'react-hooks/rules-of-hooks', description: 'Enforce Rules of Hooks', severity: 'error', category: 'React', fixable: false, recommended: true },
  { id: 'react-hooks/exhaustive-deps', name: 'react-hooks/exhaustive-deps', description: 'Verify dependency arrays in hooks', severity: 'warn', category: 'React', fixable: false, recommended: true },
];

// Default Prettier options
export const defaultPrettierOptions: FormatOptions = {
  parser: 'typescript',
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  printWidth: 100,
  endOfLine: 'lf'
};

function LinterConfig({
  eslintRules,
  prettierOptions,
  onESLintChange,
  onPrettierChange,
  onClose
}: LinterConfigProps) {
  const [activeTab, setActiveTab] = useState<'eslint' | 'prettier'>('eslint');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyModified, setShowOnlyModified] = useState(false);

  const categories = [...new Set(eslintRules.map(r => r.category))];

  const filteredRules = eslintRules.filter(rule => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!rule.name.toLowerCase().includes(query) &&
          !rule.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && rule.category !== selectedCategory) {
      return false;
    }
    if (showOnlyModified) {
      const defaultRule = defaultESLintRules.find(r => r.id === rule.id);
      if (defaultRule && defaultRule.severity === rule.severity) {
        return false;
      }
    }
    return true;
  });

  const handleRuleSeverityChange = useCallback((ruleId: string, severity: 'off' | 'warn' | 'error') => {
    const updated = eslintRules.map(rule =>
      rule.id === ruleId ? { ...rule, severity } : rule
    );
    onESLintChange(updated);
  }, [eslintRules, onESLintChange]);

  const handlePrettierOptionChange = useCallback((key: keyof FormatOptions, value: FormatOptions[keyof FormatOptions]) => {
    onPrettierChange({ ...prettierOptions, [key]: value });
  }, [prettierOptions, onPrettierChange]);

  const getSeverityColor = (severity: 'off' | 'warn' | 'error') => {
    switch (severity) {
      case 'off': return '#6e6e6e';
      case 'warn': return '#ffc107';
      case 'error': return '#f44336';
    }
  };

  const exportConfig = () => {
    const config = {
      eslint: {
        rules: eslintRules.reduce((acc, rule) => {
          acc[rule.id] = rule.severity;
          return acc;
        }, {} as Record<string, string>)
      },
      prettier: prettierOptions
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linter-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="linter-config">
      <div className="linter-config-header">
        <h3>Linter Configuration</h3>
        <div className="linter-config-actions">
          <button onClick={exportConfig} className="export-btn">Export</button>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="linter-tabs">
        <button
          className={activeTab === 'eslint' ? 'active' : ''}
          onClick={() => setActiveTab('eslint')}
        >
          ESLint
        </button>
        <button
          className={activeTab === 'prettier' ? 'active' : ''}
          onClick={() => setActiveTab('prettier')}
        >
          Prettier
        </button>
      </div>

      {activeTab === 'eslint' && (
        <div className="eslint-config">
          <div className="eslint-toolbar">
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="eslint-search"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="eslint-category-filter"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label className="eslint-modified-filter">
              <input
                type="checkbox"
                checked={showOnlyModified}
                onChange={(e) => setShowOnlyModified(e.target.checked)}
              />
              Show modified only
            </label>
          </div>

          <div className="eslint-rules-list">
            {filteredRules.map(rule => (
              <div key={rule.id} className="eslint-rule">
                <div className="eslint-rule-info">
                  <div className="eslint-rule-name">
                    {rule.name}
                    {rule.fixable && <span className="eslint-fixable" title="Auto-fixable">🔧</span>}
                    {rule.recommended && <span className="eslint-recommended" title="Recommended">⭐</span>}
                  </div>
                  <div className="eslint-rule-description">{rule.description}</div>
                  <div className="eslint-rule-category">{rule.category}</div>
                </div>
                <div className="eslint-rule-severity">
                  <select
                    value={rule.severity}
                    onChange={(e) => handleRuleSeverityChange(rule.id, e.target.value as 'off' | 'warn' | 'error')}
                    style={{ borderColor: getSeverityColor(rule.severity) }}
                  >
                    <option value="off">Off</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prettier' && (
        <div className="prettier-config">
          <div className="prettier-options">
            <div className="prettier-option">
              <label>Print Width</label>
              <input
                type="number"
                value={prettierOptions.printWidth}
                onChange={(e) => handlePrettierOptionChange('printWidth', parseInt(e.target.value))}
                min={40}
                max={200}
              />
              <span className="option-description">Line length that the printer will wrap on</span>
            </div>

            <div className="prettier-option">
              <label>Tab Width</label>
              <input
                type="number"
                value={prettierOptions.tabWidth}
                onChange={(e) => handlePrettierOptionChange('tabWidth', parseInt(e.target.value))}
                min={1}
                max={8}
              />
              <span className="option-description">Number of spaces per indentation level</span>
            </div>

            <div className="prettier-option">
              <label>Tabs</label>
              <select
                value={prettierOptions.useTabs.toString()}
                onChange={(e) => handlePrettierOptionChange('useTabs', e.target.value === 'true')}
              >
                <option value="false">Spaces</option>
                <option value="true">Tabs</option>
              </select>
              <span className="option-description">Indent lines with tabs instead of spaces</span>
            </div>

            <div className="prettier-option">
              <label>Semicolons</label>
              <select
                value={prettierOptions.semi.toString()}
                onChange={(e) => handlePrettierOptionChange('semi', e.target.value === 'true')}
              >
                <option value="true">Add</option>
                <option value="false">Omit</option>
              </select>
              <span className="option-description">Print semicolons at the ends of statements</span>
            </div>

            <div className="prettier-option">
              <label>Quotes</label>
              <select
                value={prettierOptions.singleQuote.toString()}
                onChange={(e) => handlePrettierOptionChange('singleQuote', e.target.value === 'true')}
              >
                <option value="false">Double quotes</option>
                <option value="true">Single quotes</option>
              </select>
              <span className="option-description">Use single quotes instead of double quotes</span>
            </div>

            <div className="prettier-option">
              <label>Trailing Commas</label>
              <select
                value={prettierOptions.trailingComma}
                onChange={(e) => handlePrettierOptionChange('trailingComma', e.target.value as FormatOptions['trailingComma'])}
              >
                <option value="none">None</option>
                <option value="es5">ES5</option>
                <option value="all">All</option>
              </select>
              <span className="option-description">Print trailing commas wherever possible</span>
            </div>

            <div className="prettier-option">
              <label>Bracket Spacing</label>
              <select
                value={prettierOptions.bracketSpacing.toString()}
                onChange={(e) => handlePrettierOptionChange('bracketSpacing', e.target.value === 'true')}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <span className="option-description">Print spaces between brackets in object literals</span>
            </div>

            <div className="prettier-option">
              <label>Arrow Function Parens</label>
              <select
                value={prettierOptions.arrowParens}
                onChange={(e) => handlePrettierOptionChange('arrowParens', e.target.value as FormatOptions['arrowParens'])}
              >
                <option value="avoid">Avoid</option>
                <option value="always">Always</option>
              </select>
              <span className="option-description">Include parens around a sole arrow function parameter</span>
            </div>

            <div className="prettier-option">
              <label>End of Line</label>
              <select
                value={prettierOptions.endOfLine}
                onChange={(e) => handlePrettierOptionChange('endOfLine', e.target.value as FormatOptions['endOfLine'])}
              >
                <option value="auto">Auto</option>
                <option value="lf">LF</option>
                <option value="crlf">CRLF</option>
                <option value="cr">CR</option>
              </select>
              <span className="option-description">Line ending style</span>
            </div>
          </div>

          <div className="prettier-preview">
            <h4>Preview</h4>
            <pre className="prettier-preview-code">
{`const example = (${prettierOptions.arrowParens === 'always' ? '(x)' : 'x'}) => {
${prettierOptions.useTabs ? '\t' : ' '.repeat(prettierOptions.tabWidth)}return${prettierOptions.bracketSpacing ? ' { ' : '{ '}x: ${prettierOptions.singleQuote ? "'" : '"'}hello${prettierOptions.singleQuote ? "'" : '"'}${prettierOptions.trailingComma !== 'none' ? ',' : ''}${prettierOptions.bracketSpacing ? ' }' : '}'}${prettierOptions.semi ? ';' : ''}
}${prettierOptions.semi ? ';' : ''}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Lint a file using ESLint rules (simulated)
export function lintCode(code: string, rules: LintRule[]): LintMessage[] {
  const messages: LintMessage[] = [];
  const lines = code.split('\n');

  lines.forEach((line, lineIndex) => {
    // Check various rules
    rules.forEach(rule => {
      if (rule.severity === 'off') return;

      const severity = rule.severity === 'error' ? 2 : 1;

      switch (rule.id) {
        case 'no-console':
          if (line.includes('console.')) {
            const col = line.indexOf('console.');
            messages.push({
              ruleId: rule.id,
              severity,
              message: 'Unexpected console statement.',
              line: lineIndex + 1,
              column: col + 1
            });
          }
          break;

        case 'no-debugger':
          if (line.includes('debugger')) {
            const col = line.indexOf('debugger');
            messages.push({
              ruleId: rule.id,
              severity,
              message: 'Unexpected debugger statement.',
              line: lineIndex + 1,
              column: col + 1
            });
          }
          break;

        case 'eqeqeq':
          const eqMatch = line.match(/[^=!<>]==[^=]/);
          if (eqMatch) {
            messages.push({
              ruleId: rule.id,
              severity,
              message: 'Expected === instead of ==.',
              line: lineIndex + 1,
              column: (eqMatch.index || 0) + 1,
              fix: {
                range: [0, 0], // Simplified
                text: '==='
              }
            });
          }
          const neqMatch = line.match(/!=[^=]/);
          if (neqMatch && !line.includes('!==')) {
            messages.push({
              ruleId: rule.id,
              severity,
              message: 'Expected !== instead of !=.',
              line: lineIndex + 1,
              column: (neqMatch.index || 0) + 1,
              fix: {
                range: [0, 0],
                text: '!=='
              }
            });
          }
          break;

        case 'no-eval':
          if (line.includes('eval(')) {
            const col = line.indexOf('eval(');
            messages.push({
              ruleId: rule.id,
              severity,
              message: 'eval can be harmful.',
              line: lineIndex + 1,
              column: col + 1
            });
          }
          break;

        case 'semi':
          // Very simplified semi check
          if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.trim().endsWith(',') && !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('import') && !line.trim().startsWith('export')) {
            // This is very basic - real implementation would be more sophisticated
          }
          break;
      }
    });
  });

  return messages;
}

// Format code using Prettier options (simulated)
export function formatCode(code: string, options: FormatOptions): string {
  // This is a very simplified formatter
  // In real implementation, would use actual Prettier
  let formatted = code;

  // Simple quote replacement
  if (options.singleQuote) {
    formatted = formatted.replace(/"([^"\\]|\\.)*"/g, match => {
      const inner = match.slice(1, -1);
      if (!inner.includes("'")) {
        return `'${inner}'`;
      }
      return match;
    });
  }

  return formatted;
}

export default LinterConfig;
