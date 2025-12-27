import { useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
  custom?: boolean;
}

export interface ThemeColors {
  // Editor
  editorBackground: string;
  editorForeground: string;
  editorLineHighlight: string;
  editorSelection: string;
  editorCursor: string;
  editorLineNumbers: string;

  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarBorder: string;

  // Activity Bar
  activityBarBackground: string;
  activityBarForeground: string;
  activityBarActiveBackground: string;

  // Title Bar
  titleBarBackground: string;
  titleBarForeground: string;

  // Status Bar
  statusBarBackground: string;
  statusBarForeground: string;

  // Tab Bar
  tabBackground: string;
  tabActiveBackground: string;
  tabForeground: string;
  tabActiveForeground: string;
  tabBorder: string;

  // Panel
  panelBackground: string;
  panelForeground: string;
  panelBorder: string;

  // Input
  inputBackground: string;
  inputForeground: string;
  inputBorder: string;
  inputFocusBorder: string;

  // Button
  buttonBackground: string;
  buttonForeground: string;
  buttonHoverBackground: string;

  // Accent
  accentColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  successColor: string;

  // Syntax
  syntaxKeyword: string;
  syntaxString: string;
  syntaxNumber: string;
  syntaxComment: string;
  syntaxFunction: string;
  syntaxVariable: string;
  syntaxType: string;
  syntaxOperator: string;
}

const defaultDarkTheme: ThemeColors = {
  editorBackground: '#1e1e1e',
  editorForeground: '#d4d4d4',
  editorLineHighlight: '#2a2a2a',
  editorSelection: '#264f78',
  editorCursor: '#aeafad',
  editorLineNumbers: '#858585',
  sidebarBackground: '#252526',
  sidebarForeground: '#cccccc',
  sidebarBorder: '#1e1e1e',
  activityBarBackground: '#333333',
  activityBarForeground: '#ffffff',
  activityBarActiveBackground: '#505050',
  titleBarBackground: '#323233',
  titleBarForeground: '#cccccc',
  statusBarBackground: '#007acc',
  statusBarForeground: '#ffffff',
  tabBackground: '#2d2d2d',
  tabActiveBackground: '#1e1e1e',
  tabForeground: '#969696',
  tabActiveForeground: '#ffffff',
  tabBorder: '#252526',
  panelBackground: '#1e1e1e',
  panelForeground: '#cccccc',
  panelBorder: '#3c3c3c',
  inputBackground: '#3c3c3c',
  inputForeground: '#cccccc',
  inputBorder: '#3c3c3c',
  inputFocusBorder: '#007acc',
  buttonBackground: '#0e639c',
  buttonForeground: '#ffffff',
  buttonHoverBackground: '#1177bb',
  accentColor: '#007acc',
  errorColor: '#f14c4c',
  warningColor: '#cca700',
  infoColor: '#3794ff',
  successColor: '#89d185',
  syntaxKeyword: '#569cd6',
  syntaxString: '#ce9178',
  syntaxNumber: '#b5cea8',
  syntaxComment: '#6a9955',
  syntaxFunction: '#dcdcaa',
  syntaxVariable: '#9cdcfe',
  syntaxType: '#4ec9b0',
  syntaxOperator: '#d4d4d4'
};

const defaultLightTheme: ThemeColors = {
  editorBackground: '#ffffff',
  editorForeground: '#000000',
  editorLineHighlight: '#f5f5f5',
  editorSelection: '#add6ff',
  editorCursor: '#000000',
  editorLineNumbers: '#237893',
  sidebarBackground: '#f3f3f3',
  sidebarForeground: '#616161',
  sidebarBorder: '#e7e7e7',
  activityBarBackground: '#2c2c2c',
  activityBarForeground: '#ffffff',
  activityBarActiveBackground: '#505050',
  titleBarBackground: '#dddddd',
  titleBarForeground: '#333333',
  statusBarBackground: '#007acc',
  statusBarForeground: '#ffffff',
  tabBackground: '#ececec',
  tabActiveBackground: '#ffffff',
  tabForeground: '#333333',
  tabActiveForeground: '#000000',
  tabBorder: '#f3f3f3',
  panelBackground: '#ffffff',
  panelForeground: '#333333',
  panelBorder: '#e7e7e7',
  inputBackground: '#ffffff',
  inputForeground: '#616161',
  inputBorder: '#cecece',
  inputFocusBorder: '#007acc',
  buttonBackground: '#007acc',
  buttonForeground: '#ffffff',
  buttonHoverBackground: '#0062a3',
  accentColor: '#007acc',
  errorColor: '#e51400',
  warningColor: '#bf8803',
  infoColor: '#1a85ff',
  successColor: '#388a34',
  syntaxKeyword: '#0000ff',
  syntaxString: '#a31515',
  syntaxNumber: '#098658',
  syntaxComment: '#008000',
  syntaxFunction: '#795e26',
  syntaxVariable: '#001080',
  syntaxType: '#267f99',
  syntaxOperator: '#000000'
};

interface ThemeEditorProps {
  currentTheme: Theme;
  themes: Theme[];
  onThemeChange: (theme: Theme) => void;
  onThemeSave: (theme: Theme) => void;
  onThemeDelete: (id: string) => void;
  onClose: () => void;
}

function ThemeEditor({
  currentTheme,
  themes,
  onThemeChange,
  onThemeSave,
  onThemeDelete,
  onClose
}: ThemeEditorProps) {
  const [editingTheme, setEditingTheme] = useState<Theme>(currentTheme);
  const [activeSection, setActiveSection] = useState<string>('editor');

  const colorSections = [
    { id: 'editor', label: 'Editor', keys: ['editorBackground', 'editorForeground', 'editorLineHighlight', 'editorSelection', 'editorCursor', 'editorLineNumbers'] },
    { id: 'sidebar', label: 'Sidebar', keys: ['sidebarBackground', 'sidebarForeground', 'sidebarBorder'] },
    { id: 'activityBar', label: 'Activity Bar', keys: ['activityBarBackground', 'activityBarForeground', 'activityBarActiveBackground'] },
    { id: 'titleBar', label: 'Title Bar', keys: ['titleBarBackground', 'titleBarForeground'] },
    { id: 'statusBar', label: 'Status Bar', keys: ['statusBarBackground', 'statusBarForeground'] },
    { id: 'tabs', label: 'Tabs', keys: ['tabBackground', 'tabActiveBackground', 'tabForeground', 'tabActiveForeground', 'tabBorder'] },
    { id: 'panel', label: 'Panel', keys: ['panelBackground', 'panelForeground', 'panelBorder'] },
    { id: 'input', label: 'Input', keys: ['inputBackground', 'inputForeground', 'inputBorder', 'inputFocusBorder'] },
    { id: 'button', label: 'Button', keys: ['buttonBackground', 'buttonForeground', 'buttonHoverBackground'] },
    { id: 'accent', label: 'Accent', keys: ['accentColor', 'errorColor', 'warningColor', 'infoColor', 'successColor'] },
    { id: 'syntax', label: 'Syntax', keys: ['syntaxKeyword', 'syntaxString', 'syntaxNumber', 'syntaxComment', 'syntaxFunction', 'syntaxVariable', 'syntaxType', 'syntaxOperator'] }
  ];

  const formatColorKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setEditingTheme({
      ...editingTheme,
      colors: { ...editingTheme.colors, [key]: value }
    });
  };

  const handleSave = () => {
    const themeToSave: Theme = {
      ...editingTheme,
      id: editingTheme.custom ? editingTheme.id : `custom-${Date.now()}`,
      custom: true
    };
    onThemeSave(themeToSave);
    onThemeChange(themeToSave);
  };

  const handleApply = () => {
    onThemeChange(editingTheme);
  };

  const handleReset = () => {
    setEditingTheme(currentTheme);
  };

  const handleLoadBase = (type: 'light' | 'dark') => {
    setEditingTheme({
      ...editingTheme,
      type,
      colors: type === 'dark' ? { ...defaultDarkTheme } : { ...defaultLightTheme }
    });
  };

  const handleExport = () => {
    const json = JSON.stringify(editingTheme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingTheme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeColors = colorSections.find(s => s.id === activeSection)?.keys || [];

  return (
    <div className="theme-editor">
      <div className="theme-editor-header">
        <h3>Theme Editor</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="theme-editor-toolbar">
        <div className="theme-name-edit">
          <label>Theme Name:</label>
          <input
            type="text"
            value={editingTheme.name}
            onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
          />
        </div>
        <div className="theme-type-toggle">
          <button
            className={editingTheme.type === 'dark' ? 'active' : ''}
            onClick={() => handleLoadBase('dark')}
          >
            Dark
          </button>
          <button
            className={editingTheme.type === 'light' ? 'active' : ''}
            onClick={() => handleLoadBase('light')}
          >
            Light
          </button>
        </div>
      </div>

      <div className="theme-editor-content">
        <div className="theme-sections">
          {colorSections.map(section => (
            <button
              key={section.id}
              className={`theme-section-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="theme-colors">
          {activeColors.map(key => (
            <div key={key} className="color-item">
              <label>{formatColorKey(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={editingTheme.colors[key as keyof ThemeColors]}
                  onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                />
                <input
                  type="text"
                  value={editingTheme.colors[key as keyof ThemeColors]}
                  onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="theme-preview">
          <h4>Preview</h4>
          <div
            className="preview-box"
            style={{
              backgroundColor: editingTheme.colors.editorBackground,
              color: editingTheme.colors.editorForeground
            }}
          >
            <div style={{ color: editingTheme.colors.syntaxKeyword }}>const</div>
            <div style={{ color: editingTheme.colors.syntaxVariable }}>message</div>
            <div style={{ color: editingTheme.colors.syntaxOperator }}>=</div>
            <div style={{ color: editingTheme.colors.syntaxString }}>"Hello World"</div>
            <div style={{ color: editingTheme.colors.syntaxComment }}>// Comment</div>
          </div>
        </div>
      </div>

      <div className="theme-editor-actions">
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleExport}>Export</button>
        <button onClick={handleApply}>Apply</button>
        <button onClick={handleSave} className="primary">Save Theme</button>
      </div>
    </div>
  );
}

export const builtInThemes: Theme[] = [
  { id: 'dark', name: 'Dark+', type: 'dark', colors: defaultDarkTheme },
  { id: 'light', name: 'Light+', type: 'light', colors: defaultLightTheme },
  {
    id: 'monokai',
    name: 'Monokai',
    type: 'dark',
    colors: {
      ...defaultDarkTheme,
      editorBackground: '#272822',
      syntaxKeyword: '#f92672',
      syntaxString: '#e6db74',
      syntaxNumber: '#ae81ff',
      syntaxComment: '#75715e',
      syntaxFunction: '#a6e22e',
      syntaxVariable: '#fd971f',
      syntaxType: '#66d9ef'
    }
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    type: 'dark',
    colors: {
      ...defaultDarkTheme,
      editorBackground: '#002b36',
      editorForeground: '#839496',
      syntaxKeyword: '#859900',
      syntaxString: '#2aa198',
      syntaxNumber: '#d33682',
      syntaxComment: '#586e75',
      syntaxFunction: '#268bd2',
      syntaxVariable: '#b58900'
    }
  }
];

export default ThemeEditor;
