import React, { useState } from 'react';

type FormatType = 'json' | 'yaml' | 'xml' | 'csv' | 'toml';

interface DataFormatterProps {
  onClose: () => void;
  onInsert?: (formatted: string) => void;
}

function DataFormatter({ onClose, onInsert }: DataFormatterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [inputFormat, setInputFormat] = useState<FormatType>('json');
  const [outputFormat, setOutputFormat] = useState<FormatType>('json');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const formatJSON = (data: any, indent: number): string => {
    return JSON.stringify(data, null, indent);
  };

  const parseJSON = (text: string): any => {
    return JSON.parse(text);
  };

  const formatYAML = (data: any, indent: number): string => {
    // Simple YAML formatter
    const toYAML = (obj: any, level: number = 0): string => {
      const spaces = ' '.repeat(level * indent);
      let result = '';

      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (typeof item === 'object' && item !== null) {
            result += `${spaces}-\n${toYAML(item, level + 1)}`;
          } else {
            result += `${spaces}- ${item}\n`;
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            result += `${spaces}${key}:\n${toYAML(value, level + 1)}`;
          } else {
            result += `${spaces}${key}: ${value}\n`;
          }
        }
      } else {
        result += `${obj}\n`;
      }

      return result;
    };

    return toYAML(data).trim();
  };

  const parseYAML = (text: string): any => {
    // Simple YAML parser (basic key-value support)
    const lines = text.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    const result: any = {};
    const stack: any[] = [{ obj: result, indent: -1 }];

    for (const line of lines) {
      const match = line.match(/^(\s*)(.+?):\s*(.*)$/);
      if (match) {
        const indent = match[1].length;
        const key = match[2].trim();
        let value: any = match[3].trim();

        // Parse value
        if (value === '') {
          value = {};
        } else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (value === 'null') {
          value = null;
        } else if (!isNaN(Number(value))) {
          value = Number(value);
        }

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const parent = stack[stack.length - 1].obj;
        parent[key] = value;

        if (typeof value === 'object') {
          stack.push({ obj: value, indent });
        }
      }
    }

    return result;
  };

  const formatXML = (data: any, indent: number): string => {
    const toXML = (obj: any, tagName: string = 'root', level: number = 0): string => {
      const spaces = ' '.repeat(level * indent);

      if (typeof obj !== 'object' || obj === null) {
        return `${spaces}<${tagName}>${obj}</${tagName}>`;
      }

      if (Array.isArray(obj)) {
        return obj.map((item, i) => toXML(item, 'item', level)).join('\n');
      }

      let children = '';
      for (const [key, value] of Object.entries(obj)) {
        children += '\n' + toXML(value, key, level + 1);
      }

      return `${spaces}<${tagName}>${children}\n${spaces}</${tagName}>`;
    };

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXML(data);
  };

  const formatCSV = (data: any): string => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('CSV requires an array of objects');
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  };

  const convert = () => {
    setError(null);

    try {
      // Parse input
      let data: any;
      switch (inputFormat) {
        case 'json':
          data = parseJSON(input);
          break;
        case 'yaml':
          data = parseYAML(input);
          break;
        default:
          throw new Error(`Parsing ${inputFormat} is not fully implemented`);
      }

      // Format output
      let formatted: string;
      switch (outputFormat) {
        case 'json':
          formatted = formatJSON(data, indentSize);
          break;
        case 'yaml':
          formatted = formatYAML(data, indentSize);
          break;
        case 'xml':
          formatted = formatXML(data, indentSize);
          break;
        case 'csv':
          formatted = formatCSV(data);
          break;
        default:
          throw new Error(`Output format ${outputFormat} is not implemented`);
      }

      setOutput(formatted);
    } catch (err: any) {
      setError(err.message);
      setOutput('');
    }
  };

  const prettify = () => {
    setError(null);
    try {
      if (inputFormat === 'json') {
        const data = parseJSON(input);
        setOutput(formatJSON(data, indentSize));
      } else if (inputFormat === 'yaml') {
        const data = parseYAML(input);
        setOutput(formatYAML(data, indentSize));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const minify = () => {
    setError(null);
    try {
      if (inputFormat === 'json') {
        const data = parseJSON(input);
        setOutput(JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="data-formatter">
      <div className="formatter-header">
        <h3>Data Formatter</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="formatter-toolbar">
        <div className="format-selectors">
          <div className="format-group">
            <label>Input:</label>
            <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value as FormatType)}>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
            </select>
          </div>
          <span className="arrow">→</span>
          <div className="format-group">
            <label>Output:</label>
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as FormatType)}>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="format-group">
            <label>Indent:</label>
            <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))}>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>Tab</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={convert} className="convert-btn">Convert</button>
          <button onClick={prettify}>Prettify</button>
          <button onClick={minify}>Minify</button>
        </div>
      </div>

      {error && <div className="formatter-error">{error}</div>}

      <div className="formatter-content">
        <div className="formatter-pane">
          <div className="pane-header">Input</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${inputFormat.toUpperCase()} here...`}
            spellCheck={false}
          />
        </div>

        <div className="formatter-pane">
          <div className="pane-header">
            <span>Output</span>
            {output && (
              <div className="pane-actions">
                <button onClick={copyOutput}>📋 Copy</button>
                {onInsert && <button onClick={() => onInsert(output)}>Insert</button>}
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

export default DataFormatter;
