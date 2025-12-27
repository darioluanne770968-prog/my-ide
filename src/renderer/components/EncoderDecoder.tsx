import React, { useState } from 'react';

type EncodingType = 'base64' | 'url' | 'html' | 'unicode' | 'hex' | 'binary';

interface EncoderDecoderProps {
  onClose: () => void;
}

function EncoderDecoder({ onClose }: EncoderDecoderProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [encodingType, setEncodingType] = useState<EncodingType>('base64');
  const [error, setError] = useState<string | null>(null);

  const encode = () => {
    setError(null);
    try {
      let result = '';
      switch (encodingType) {
        case 'base64':
          result = btoa(unescape(encodeURIComponent(input)));
          break;
        case 'url':
          result = encodeURIComponent(input);
          break;
        case 'html':
          result = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          break;
        case 'unicode':
          result = input.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
          break;
        case 'hex':
          result = input.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
          break;
        case 'binary':
          result = input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
          break;
      }
      setOutput(result);
    } catch (err: any) {
      setError(`Encoding error: ${err.message}`);
    }
  };

  const decode = () => {
    setError(null);
    try {
      let result = '';
      switch (encodingType) {
        case 'base64':
          result = decodeURIComponent(escape(atob(input)));
          break;
        case 'url':
          result = decodeURIComponent(input);
          break;
        case 'html':
          const textarea = document.createElement('textarea');
          textarea.innerHTML = input;
          result = textarea.value;
          break;
        case 'unicode':
          result = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
            String.fromCharCode(parseInt(code, 16))
          );
          break;
        case 'hex':
          result = input.split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16))).join('');
          break;
        case 'binary':
          result = input.split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
          break;
      }
      setOutput(result);
    } catch (err: any) {
      setError(`Decoding error: ${err.message}`);
    }
  };

  const swap = () => {
    setInput(output);
    setOutput('');
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const getPlaceholder = () => {
    switch (encodingType) {
      case 'base64': return 'Enter text to encode/decode as Base64...';
      case 'url': return 'Enter URL to encode/decode...';
      case 'html': return 'Enter HTML entities to encode/decode...';
      case 'unicode': return 'Enter text or \\uXXXX sequences...';
      case 'hex': return 'Enter text or hex values (00 FF ...)...';
      case 'binary': return 'Enter text or binary (01100001 ...)...';
      default: return 'Enter text...';
    }
  };

  return (
    <div className="encoder-decoder">
      <div className="encoder-header">
        <h3>Encoder / Decoder</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="encoder-toolbar">
        <div className="encoding-selector">
          <label>Encoding:</label>
          <select value={encodingType} onChange={(e) => setEncodingType(e.target.value as EncodingType)}>
            <option value="base64">Base64</option>
            <option value="url">URL Encoding</option>
            <option value="html">HTML Entities</option>
            <option value="unicode">Unicode</option>
            <option value="hex">Hexadecimal</option>
            <option value="binary">Binary</option>
          </select>
        </div>

        <div className="action-buttons">
          <button onClick={encode} className="encode-btn">Encode →</button>
          <button onClick={decode} className="decode-btn">← Decode</button>
          <button onClick={swap} title="Swap input/output">⇄</button>
          <button onClick={clear} title="Clear">🗑️</button>
        </div>
      </div>

      {error && <div className="encoder-error">{error}</div>}

      <div className="encoder-content">
        <div className="encoder-pane">
          <div className="pane-header">Input</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            spellCheck={false}
          />
        </div>

        <div className="encoder-pane">
          <div className="pane-header">
            <span>Output</span>
            {output && (
              <button onClick={copyOutput} className="copy-btn">📋 Copy</button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="encoder-info">
        <h4>Quick Reference</h4>
        <div className="info-grid">
          <div className="info-item">
            <strong>Base64</strong>
            <span>Binary to ASCII encoding, commonly used for data transfer</span>
          </div>
          <div className="info-item">
            <strong>URL</strong>
            <span>Encodes special characters for URLs (%20 for space)</span>
          </div>
          <div className="info-item">
            <strong>HTML</strong>
            <span>Converts special characters to HTML entities (&lt; &gt; &amp;)</span>
          </div>
          <div className="info-item">
            <strong>Unicode</strong>
            <span>Represents characters as \uXXXX escape sequences</span>
          </div>
          <div className="info-item">
            <strong>Hex</strong>
            <span>Represents each character as hexadecimal value</span>
          </div>
          <div className="info-item">
            <strong>Binary</strong>
            <span>Represents each character as 8-bit binary</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EncoderDecoder;
