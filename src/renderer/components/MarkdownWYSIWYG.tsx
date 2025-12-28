import { useState } from 'react';

interface MarkdownWYSIWYGProps {
  initialContent?: string;
  onClose: () => void;
  onSave?: (content: string) => void;
}

export default function MarkdownWYSIWYG({ initialContent = '', onClose, onSave }: MarkdownWYSIWYGProps) {
  const [content, setContent] = useState(initialContent || `# Welcome to Markdown Editor

This is a **WYSIWYG** markdown editor with live preview.

## Features

- **Bold text** and *italic text*
- Lists and checkboxes
- [Links](https://example.com)
- Code blocks
- Tables
- And more!

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Task List

- [x] Implement editor
- [x] Add toolbar
- [ ] Add more features
- [ ] Write documentation

### Table Example

| Feature | Status |
|---------|--------|
| Bold | ✓ |
| Italic | ✓ |
| Links | ✓ |
| Images | ✓ |

> This is a blockquote. You can use it to highlight important information.

---

Happy writing! 🎉
`);

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [wordCount, setWordCount] = useState(0);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const toolbarActions = [
    { icon: 'B', title: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: 'I', title: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: 'S', title: 'Strikethrough', action: () => insertMarkdown('~~', '~~') },
    { icon: 'H1', title: 'Heading 1', action: () => insertMarkdown('# ') },
    { icon: 'H2', title: 'Heading 2', action: () => insertMarkdown('## ') },
    { icon: 'H3', title: 'Heading 3', action: () => insertMarkdown('### ') },
    { icon: '—', title: 'Horizontal Rule', action: () => insertMarkdown('\n---\n') },
    { icon: '•', title: 'Bullet List', action: () => insertMarkdown('- ') },
    { icon: '1.', title: 'Numbered List', action: () => insertMarkdown('1. ') },
    { icon: '☐', title: 'Checkbox', action: () => insertMarkdown('- [ ] ') },
    { icon: '🔗', title: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: '🖼️', title: 'Image', action: () => insertMarkdown('![alt](', ')') },
    { icon: '💻', title: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: '```', title: 'Code Block', action: () => insertMarkdown('\n```\n', '\n```\n') },
    { icon: '"', title: 'Quote', action: () => insertMarkdown('> ') },
    { icon: '📋', title: 'Table', action: () => insertMarkdown('\n| Header | Header |\n|--------|--------|\n| Cell | Cell |\n') }
  ];

  const renderMarkdown = (md: string) => {
    let html = md
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Links and images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      // Lists
      .replace(/^- \[x\] (.+)$/gm, '<li class="checkbox checked">☑ $1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="checkbox">☐ $1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="numbered">$1</li>')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr />')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    return html;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(w => w.length > 0).length);
  };

  return (
    <div className="markdown-wysiwyg">
      <div className="editor-header">
        <h3>Markdown Editor</h3>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'edit' ? 'active' : ''}
              onClick={() => setViewMode('edit')}
            >
              Edit
            </button>
            <button
              className={viewMode === 'split' ? 'active' : ''}
              onClick={() => setViewMode('split')}
            >
              Split
            </button>
            <button
              className={viewMode === 'preview' ? 'active' : ''}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </button>
          </div>
          {onSave && (
            <button className="save-btn" onClick={() => onSave(content)}>
              Save
            </button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="toolbar">
        {toolbarActions.map((action, i) => (
          <button
            key={i}
            className="tool-btn"
            onClick={action.action}
            title={action.title}
          >
            {action.icon}
          </button>
        ))}
      </div>

      <div className={`editor-content ${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="edit-pane">
            <textarea
              id="markdown-editor"
              value={content}
              onChange={handleChange}
              placeholder="Write your markdown here..."
              spellCheck={false}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <div
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        )}
      </div>

      <div className="status-bar">
        <span>{wordCount} words</span>
        <span>{content.length} characters</span>
        <span>{content.split('\n').length} lines</span>
      </div>

      <style>{`
        .markdown-wysiwyg {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .editor-header h3 { margin: 0; font-size: 14px; }
        .header-actions { display: flex; gap: 8px; align-items: center; }
        .view-toggle {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .view-toggle button {
          padding: 6px 12px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
        }
        .view-toggle button.active {
          background: var(--accent-color);
          color: white;
        }
        .save-btn {
          padding: 6px 16px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        .tool-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }
        .tool-btn:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }
        .editor-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .editor-content.edit .edit-pane { width: 100%; }
        .editor-content.preview .preview-pane { width: 100%; }
        .editor-content.split .edit-pane,
        .editor-content.split .preview-pane { width: 50%; }
        .edit-pane {
          border-right: 1px solid var(--border-color);
        }
        .edit-pane textarea {
          width: 100%;
          height: 100%;
          padding: 16px;
          background: var(--bg-primary);
          border: none;
          color: var(--text-primary);
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
        }
        .edit-pane textarea:focus {
          outline: none;
        }
        .preview-pane {
          overflow-y: auto;
        }
        .preview-content {
          padding: 16px 24px;
          line-height: 1.8;
        }
        .preview-content h1 {
          font-size: 28px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 8px;
          margin: 24px 0 16px;
        }
        .preview-content h2 {
          font-size: 22px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
          margin: 20px 0 12px;
        }
        .preview-content h3 {
          font-size: 18px;
          margin: 16px 0 10px;
        }
        .preview-content strong { font-weight: 600; }
        .preview-content em { font-style: italic; }
        .preview-content del { text-decoration: line-through; color: var(--text-tertiary); }
        .preview-content code {
          padding: 2px 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 13px;
        }
        .preview-content pre {
          padding: 16px;
          background: #1a1a1a;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .preview-content pre code {
          padding: 0;
          background: none;
          color: #d4d4d4;
        }
        .preview-content a {
          color: var(--accent-color);
          text-decoration: none;
        }
        .preview-content a:hover { text-decoration: underline; }
        .preview-content img {
          max-width: 100%;
          border-radius: 4px;
        }
        .preview-content li {
          margin: 4px 0;
          padding-left: 8px;
        }
        .preview-content li.checkbox {
          list-style: none;
          margin-left: -20px;
        }
        .preview-content li.checkbox.checked {
          color: var(--text-secondary);
          text-decoration: line-through;
        }
        .preview-content blockquote {
          margin: 16px 0;
          padding: 12px 20px;
          border-left: 4px solid var(--accent-color);
          background: var(--bg-secondary);
          font-style: italic;
          color: var(--text-secondary);
        }
        .preview-content hr {
          border: none;
          border-top: 1px solid var(--border-color);
          margin: 24px 0;
        }
        .preview-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .preview-content th, .preview-content td {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          text-align: left;
        }
        .preview-content th {
          background: var(--bg-secondary);
          font-weight: 600;
        }
        .status-bar {
          display: flex;
          gap: 16px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          font-size: 11px;
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
}
