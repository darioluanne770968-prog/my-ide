import { useState } from 'react';

interface AICodeTranslatorProps {
  code: string;
  sourceLanguage: string;
  apiKey: string;
  model: string;
  onApply: (translatedCode: string) => void;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
  { id: 'php', name: 'PHP', extension: 'php' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' }
];

export default function AICodeTranslator({
  code,
  sourceLanguage,
  apiKey,
  model,
  onApply,
  onClose
}: AICodeTranslatorProps) {
  const [sourceCode, setSourceCode] = useState(code);
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [translatedCode, setTranslatedCode] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [preserveComments, setPreserveComments] = useState(true);
  const [addTypeAnnotations, setAddTypeAnnotations] = useState(true);

  const translateCode = async () => {
    if (!apiKey) {
      setTranslatedCode('// Error: Please configure your AI API key in settings.');
      return;
    }

    setIsTranslating(true);

    // Simulate AI translation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock translations based on target language
    const mockTranslations: Record<string, string> = {
      python: `# Translated from ${sourceLanguage} to Python
from typing import List, Optional

def process_data(items: List[dict]) -> dict:
    """Process the input data and return results."""
    result = {}

    for item in items:
        key = item.get('id')
        if key:
            result[key] = {
                'value': item.get('value', 0),
                'processed': True
            }

    return result

def main():
    data = [
        {'id': 'a', 'value': 1},
        {'id': 'b', 'value': 2}
    ]
    output = process_data(data)
    print(output)

if __name__ == '__main__':
    main()`,
      java: `// Translated from ${sourceLanguage} to Java
import java.util.*;

public class DataProcessor {
    public Map<String, Object> processData(List<Map<String, Object>> items) {
        Map<String, Object> result = new HashMap<>();

        for (Map<String, Object> item : items) {
            String key = (String) item.get("id");
            if (key != null) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("value", item.getOrDefault("value", 0));
                entry.put("processed", true);
                result.put(key, entry);
            }
        }

        return result;
    }

    public static void main(String[] args) {
        DataProcessor processor = new DataProcessor();
        List<Map<String, Object>> data = new ArrayList<>();
        // Add data and process
    }
}`,
      go: `// Translated from ${sourceLanguage} to Go
package main

import "fmt"

type Item struct {
    ID    string
    Value int
}

type ProcessedItem struct {
    Value     int
    Processed bool
}

func processData(items []Item) map[string]ProcessedItem {
    result := make(map[string]ProcessedItem)

    for _, item := range items {
        if item.ID != "" {
            result[item.ID] = ProcessedItem{
                Value:     item.Value,
                Processed: true,
            }
        }
    }

    return result
}

func main() {
    data := []Item{
        {ID: "a", Value: 1},
        {ID: "b", Value: 2},
    }
    output := processData(data)
    fmt.Println(output)
}`,
      rust: `// Translated from ${sourceLanguage} to Rust
use std::collections::HashMap;

#[derive(Debug)]
struct ProcessedItem {
    value: i32,
    processed: bool,
}

fn process_data(items: &[(String, i32)]) -> HashMap<String, ProcessedItem> {
    let mut result = HashMap::new();

    for (id, value) in items {
        if !id.is_empty() {
            result.insert(
                id.clone(),
                ProcessedItem {
                    value: *value,
                    processed: true,
                },
            );
        }
    }

    result
}

fn main() {
    let data = vec![
        (String::from("a"), 1),
        (String::from("b"), 2),
    ];
    let output = process_data(&data);
    println!("{:?}", output);
}`
    };

    setTranslatedCode(mockTranslations[targetLanguage] || `// Translation to ${targetLanguage} completed`);
    setIsTranslating(false);
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedCode);
  };

  const getTargetFileName = () => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === targetLanguage);
    return `translated.${lang?.extension || 'txt'}`;
  };

  return (
    <div className="ai-code-translator">
      <div className="translator-header">
        <h3>AI Code Translator</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="translator-content">
        <div className="language-selector">
          <div className="selector-group">
            <label>Source Language</label>
            <div className="language-display">{sourceLanguage}</div>
          </div>

          <div className="arrow">→</div>

          <div className="selector-group">
            <label>Target Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="options-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preserveComments}
              onChange={(e) => setPreserveComments(e.target.checked)}
            />
            Preserve Comments
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={addTypeAnnotations}
              onChange={(e) => setAddTypeAnnotations(e.target.checked)}
            />
            Add Type Annotations
          </label>
        </div>

        <div className="code-panels">
          <div className="code-panel source">
            <div className="panel-header">
              <span>Source Code</span>
              <span className="line-count">{sourceCode.split('\n').length} lines</span>
            </div>
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Enter source code..."
            />
          </div>

          <div className="translate-button-container">
            <button
              className="translate-btn"
              onClick={translateCode}
              disabled={isTranslating || !sourceCode.trim()}
            >
              {isTranslating ? (
                <span className="spinner"></span>
              ) : (
                '→'
              )}
            </button>
          </div>

          <div className="code-panel target">
            <div className="panel-header">
              <span>Translated Code</span>
              {translatedCode && (
                <div className="panel-actions">
                  <button onClick={copyTranslation} title="Copy">
                    Copy
                  </button>
                  <button onClick={() => onApply(translatedCode)} title="Apply">
                    Apply
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={translatedCode}
              onChange={(e) => setTranslatedCode(e.target.value)}
              placeholder="Translated code will appear here..."
              readOnly={isTranslating}
            />
          </div>
        </div>

        {translatedCode && (
          <div className="output-info">
            <span>Output file: {getTargetFileName()}</span>
          </div>
        )}
      </div>

      <style>{`
        .ai-code-translator {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .translator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .translator-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .translator-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .language-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-bottom: 16px;
        }
        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .selector-group label {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .language-display {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 14px;
          text-transform: capitalize;
        }
        .selector-group select {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 14px;
        }
        .arrow {
          font-size: 24px;
          color: var(--accent-color);
          margin-top: 16px;
        }
        .options-row {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          cursor: pointer;
        }
        .code-panels {
          flex: 1;
          display: flex;
          gap: 8px;
          overflow: hidden;
        }
        .code-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 4px 4px 0 0;
          font-size: 12px;
        }
        .line-count { color: var(--text-secondary); }
        .panel-actions { display: flex; gap: 8px; }
        .panel-actions button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
        }
        .code-panel textarea {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 4px 4px;
          color: var(--text-primary);
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          padding: 12px;
          resize: none;
        }
        .translate-button-container {
          display: flex;
          align-items: center;
        }
        .translate-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-color);
          color: white;
          border: none;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .translate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .output-info {
          margin-top: 12px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          font-size: 12px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
