import { useState, useEffect, useMemo } from 'react';

export interface Snippet {
  id: string;
  name: string;
  prefix: string;
  body: string[];
  description?: string;
  language?: string;
  scope?: string;
}

interface SnippetsManagerProps {
  snippets: Snippet[];
  onSnippetsChange: (snippets: Snippet[]) => void;
  onInsertSnippet: (snippet: Snippet) => void;
  currentLanguage: string;
  onClose: () => void;
}

function SnippetsManager({
  snippets,
  onSnippetsChange,
  onInsertSnippet,
  currentLanguage,
  onClose
}: SnippetsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Snippet>>({});
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const languages = useMemo(() => {
    const langs = new Set<string>();
    snippets.forEach(s => {
      if (s.language) langs.add(s.language);
    });
    return Array.from(langs).sort();
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    return snippets.filter(s => {
      if (filterLanguage !== 'all' && s.language !== filterLanguage) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(query) ||
               s.prefix.toLowerCase().includes(query) ||
               s.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [snippets, searchQuery, filterLanguage]);

  const handleCreate = () => {
    setEditForm({
      name: '',
      prefix: '',
      body: [''],
      description: '',
      language: currentLanguage
    });
    setSelectedSnippet(null);
    setIsEditing(true);
  };

  const handleEdit = (snippet: Snippet) => {
    setEditForm({ ...snippet });
    setSelectedSnippet(snippet);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this snippet?')) {
      onSnippetsChange(snippets.filter(s => s.id !== id));
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(null);
      }
    }
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.prefix || !editForm.body?.length) {
      alert('Please fill in all required fields');
      return;
    }

    const newSnippet: Snippet = {
      id: selectedSnippet?.id || `snippet-${Date.now()}`,
      name: editForm.name!,
      prefix: editForm.prefix!,
      body: editForm.body!,
      description: editForm.description,
      language: editForm.language
    };

    if (selectedSnippet) {
      onSnippetsChange(snippets.map(s => s.id === selectedSnippet.id ? newSnippet : s));
    } else {
      onSnippetsChange([...snippets, newSnippet]);
    }

    setIsEditing(false);
    setSelectedSnippet(newSnippet);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const formatSnippetBody = (body: string[]): string => {
    return body.join('\n');
  };

  const parseSnippetBody = (text: string): string[] => {
    return text.split('\n');
  };

  // Snippet preview with placeholders highlighted
  const renderSnippetPreview = (body: string[]) => {
    const text = body.join('\n');
    // Highlight placeholders like ${1:name} or $1
    const highlighted = text.replace(
      /\$\{(\d+):?([^}]*)\}|\$(\d+)/g,
      '<span class="snippet-placeholder">$&</span>'
    );
    return <pre dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="snippets-manager">
      <div className="snippets-header">
        <h3>Snippets</h3>
        <button onClick={onClose} className="snippets-close">×</button>
      </div>

      <div className="snippets-toolbar">
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="snippets-search"
        />
        <select
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
          className="snippets-language-filter"
        >
          <option value="all">All Languages</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <button onClick={handleCreate} className="snippets-create">+ New</button>
      </div>

      <div className="snippets-content">
        <div className="snippets-list">
          {filteredSnippets.length === 0 ? (
            <div className="snippets-empty">
              {searchQuery ? 'No matching snippets' : 'No snippets yet'}
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                className={`snippet-item ${selectedSnippet?.id === snippet.id ? 'selected' : ''}`}
                onClick={() => setSelectedSnippet(snippet)}
                onDoubleClick={() => onInsertSnippet(snippet)}
              >
                <div className="snippet-item-header">
                  <span className="snippet-name">{snippet.name}</span>
                  <span className="snippet-prefix">{snippet.prefix}</span>
                </div>
                {snippet.description && (
                  <div className="snippet-description">{snippet.description}</div>
                )}
                {snippet.language && (
                  <span className="snippet-language">{snippet.language}</span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="snippets-detail">
          {isEditing ? (
            <div className="snippet-editor">
              <div className="snippet-editor-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Snippet name"
                />
              </div>
              <div className="snippet-editor-field">
                <label>Prefix *</label>
                <input
                  type="text"
                  value={editForm.prefix || ''}
                  onChange={(e) => setEditForm({ ...editForm, prefix: e.target.value })}
                  placeholder="Trigger prefix"
                />
              </div>
              <div className="snippet-editor-field">
                <label>Language</label>
                <input
                  type="text"
                  value={editForm.language || ''}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                  placeholder="e.g., javascript, typescript"
                />
              </div>
              <div className="snippet-editor-field">
                <label>Description</label>
                <input
                  type="text"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description"
                />
              </div>
              <div className="snippet-editor-field">
                <label>Body *</label>
                <textarea
                  value={formatSnippetBody(editForm.body || [])}
                  onChange={(e) => setEditForm({ ...editForm, body: parseSnippetBody(e.target.value) })}
                  placeholder="Snippet body (use $1, $2, ${1:placeholder} for tab stops)"
                  rows={10}
                />
              </div>
              <div className="snippet-editor-hint">
                <strong>Placeholders:</strong> $1, $2 for tab stops, {'${1:default}'} for default values, $0 for final cursor position
              </div>
              <div className="snippet-editor-actions">
                <button onClick={handleCancel}>Cancel</button>
                <button onClick={handleSave} className="primary">Save</button>
              </div>
            </div>
          ) : selectedSnippet ? (
            <div className="snippet-preview">
              <div className="snippet-preview-header">
                <h4>{selectedSnippet.name}</h4>
                <div className="snippet-preview-actions">
                  <button onClick={() => onInsertSnippet(selectedSnippet)}>Insert</button>
                  <button onClick={() => handleEdit(selectedSnippet)}>Edit</button>
                  <button onClick={() => handleDelete(selectedSnippet.id)} className="danger">Delete</button>
                </div>
              </div>
              <div className="snippet-preview-meta">
                <span><strong>Prefix:</strong> {selectedSnippet.prefix}</span>
                {selectedSnippet.language && (
                  <span><strong>Language:</strong> {selectedSnippet.language}</span>
                )}
              </div>
              {selectedSnippet.description && (
                <p className="snippet-preview-description">{selectedSnippet.description}</p>
              )}
              <div className="snippet-preview-body">
                <label>Body:</label>
                {renderSnippetPreview(selectedSnippet.body)}
              </div>
            </div>
          ) : (
            <div className="snippets-empty-detail">
              Select a snippet to view details, or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Snippet insertion helper - expands placeholders
// Default snippets
export const defaultSnippets: Snippet[] = [
  {
    id: 'log',
    name: 'Console Log',
    prefix: 'log',
    body: ['console.log($1);'],
    description: 'Log output to console',
    language: 'javascript'
  },
  {
    id: 'func',
    name: 'Function',
    prefix: 'func',
    body: ['function ${1:name}(${2:params}) {', '\t$0', '}'],
    description: 'Create a function',
    language: 'javascript'
  },
  {
    id: 'afunc',
    name: 'Arrow Function',
    prefix: 'afunc',
    body: ['const ${1:name} = (${2:params}) => {', '\t$0', '};'],
    description: 'Create an arrow function',
    language: 'javascript'
  },
  {
    id: 'rfc',
    name: 'React Functional Component',
    prefix: 'rfc',
    body: [
      "import React from 'react';",
      '',
      'interface ${1:Component}Props {',
      '\t$2',
      '}',
      '',
      'function ${1:Component}({ $3 }: ${1:Component}Props) {',
      '\treturn (',
      '\t\t<div>',
      '\t\t\t$0',
      '\t\t</div>',
      '\t);',
      '}',
      '',
      'export default ${1:Component};'
    ],
    description: 'Create a React functional component',
    language: 'typescriptreact'
  },
  {
    id: 'useState',
    name: 'useState Hook',
    prefix: 'us',
    body: ['const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState<${2:type}>($3);'],
    description: 'React useState hook',
    language: 'typescriptreact'
  },
  {
    id: 'useEffect',
    name: 'useEffect Hook',
    prefix: 'ue',
    body: ['useEffect(() => {', '\t$0', '}, [$1]);'],
    description: 'React useEffect hook',
    language: 'typescriptreact'
  },
  {
    id: 'interface',
    name: 'Interface',
    prefix: 'int',
    body: ['interface ${1:Name} {', '\t$0', '}'],
    description: 'Create a TypeScript interface',
    language: 'typescript'
  },
  {
    id: 'trycatch',
    name: 'Try Catch',
    prefix: 'try',
    body: ['try {', '\t$1', '} catch (error) {', '\t$0', '}'],
    description: 'Try catch block',
    language: 'javascript'
  },
  {
    id: 'forloop',
    name: 'For Loop',
    prefix: 'for',
    body: ['for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {', '\t$0', '}'],
    description: 'For loop',
    language: 'javascript'
  },
  {
    id: 'foreach',
    name: 'For Each',
    prefix: 'fore',
    body: ['${1:array}.forEach((${2:item}) => {', '\t$0', '});'],
    description: 'Array forEach',
    language: 'javascript'
  },
  {
    id: 'map',
    name: 'Array Map',
    prefix: 'map',
    body: ['${1:array}.map((${2:item}) => {', '\treturn $0;', '});'],
    description: 'Array map',
    language: 'javascript'
  },
  {
    id: 'import',
    name: 'Import',
    prefix: 'imp',
    body: ["import { $2 } from '$1';"],
    description: 'Import statement',
    language: 'javascript'
  },
  {
    id: 'impd',
    name: 'Import Default',
    prefix: 'impd',
    body: ["import $2 from '$1';"],
    description: 'Import default statement',
    language: 'javascript'
  }
];

// Snippet insertion helper - expands placeholders
export function expandSnippet(snippet: Snippet, indent: string = ''): { text: string; placeholders: Array<{ start: number; end: number; index: number }> } {
  let text = snippet.body.join('\n');

  // Add indentation to all lines except first
  const lines = text.split('\n');
  text = lines.map((line, i) => i === 0 ? line : indent + line).join('\n');

  const placeholders: Array<{ start: number; end: number; index: number }> = [];

  // Find all placeholders
  const regex = /\$\{(\d+):?([^}]*)\}|\$(\d+)/g;
  let match;
  let offset = 0;

  while ((match = regex.exec(text)) !== null) {
    const index = parseInt(match[1] || match[3]);
    const defaultValue = match[2] || '';
    const start = match.index - offset;
    const end = start + (defaultValue || `$${index}`).length;

    placeholders.push({ start, end, index });

    // Replace placeholder with default value or empty string
    const replacement = defaultValue || '';
    text = text.slice(0, match.index - offset) + replacement + text.slice(match.index + match[0].length - offset);
    offset += match[0].length - replacement.length;
  }

  // Sort by index
  placeholders.sort((a, b) => a.index - b.index);

  return { text, placeholders };
}

export default SnippetsManager;
