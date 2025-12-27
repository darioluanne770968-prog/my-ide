import React, { useState } from 'react';

interface ReviewIssue {
  id: string;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  line?: number;
  message: string;
  suggestion?: string;
}

interface AICodeReviewProps {
  apiKey: string;
  model: string;
  code: string;
  language: string;
  filePath: string;
  onClose: () => void;
  onNavigate?: (line: number) => void;
}

function AICodeReview({ apiKey, model, code, language, filePath, onClose, onNavigate }: AICodeReviewProps) {
  const [issues, setIssues] = useState<ReviewIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [reviewType, setReviewType] = useState<'full' | 'security' | 'performance' | 'style'>('full');

  const runReview = async () => {
    if (!apiKey || !code) return;

    setIsLoading(true);
    setIssues([]);
    setSummary('');

    try {
      const reviewPrompts = {
        full: 'Perform a comprehensive code review covering bugs, security, performance, and best practices.',
        security: 'Focus on security vulnerabilities, potential exploits, and unsafe patterns.',
        performance: 'Focus on performance issues, inefficient algorithms, and optimization opportunities.',
        style: 'Focus on code style, readability, naming conventions, and best practices.'
      };

      const response = await window.electronAPI.sendAIMessage(
        apiKey,
        model,
        [{
          role: 'user',
          content: `${reviewPrompts[reviewType]}

Review this ${language} code from ${filePath}:

\`\`\`${language}
${code}
\`\`\`

Respond in JSON format:
{
  "summary": "Brief overall assessment",
  "issues": [
    {
      "severity": "error|warning|info|suggestion",
      "line": <line number or null>,
      "message": "Description of the issue",
      "suggestion": "How to fix it"
    }
  ]
}

Only output valid JSON.`
        }]
      );

      try {
        const parsed = JSON.parse(response);
        setSummary(parsed.summary || '');
        setIssues((parsed.issues || []).map((issue: any, idx: number) => ({
          ...issue,
          id: `issue-${idx}`
        })));
      } catch {
        setSummary(response);
      }
    } catch (error: any) {
      setSummary(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      case 'suggestion': return '💡';
      default: return '📝';
    }
  };

  return (
    <div className="ai-code-review">
      <div className="review-header">
        <h3>AI Code Review</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="review-controls">
        <select value={reviewType} onChange={(e) => setReviewType(e.target.value as any)}>
          <option value="full">Full Review</option>
          <option value="security">Security Focus</option>
          <option value="performance">Performance Focus</option>
          <option value="style">Style Focus</option>
        </select>
        <button onClick={runReview} disabled={isLoading} className="review-btn">
          {isLoading ? 'Reviewing...' : 'Start Review'}
        </button>
      </div>

      <div className="review-content">
        {summary && (
          <div className="review-summary">
            <h4>Summary</h4>
            <p>{summary}</p>
          </div>
        )}

        {issues.length > 0 && (
          <div className="review-issues">
            <h4>Issues Found ({issues.length})</h4>
            <div className="issues-list">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`issue-item ${issue.severity}`}
                  onClick={() => issue.line && onNavigate?.(issue.line)}
                >
                  <div className="issue-header">
                    <span className="issue-icon">{getSeverityIcon(issue.severity)}</span>
                    <span className="issue-severity">{issue.severity.toUpperCase()}</span>
                    {issue.line && <span className="issue-line">Line {issue.line}</span>}
                  </div>
                  <div className="issue-message">{issue.message}</div>
                  {issue.suggestion && (
                    <div className="issue-suggestion">
                      <strong>Suggestion:</strong> {issue.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && issues.length === 0 && !summary && (
          <div className="review-empty">
            <p>Click "Start Review" to analyze your code</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AICodeReview;
