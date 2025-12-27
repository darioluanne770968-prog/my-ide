import React from 'react';

export type PanelType = 'files' | 'search' | 'git' | 'ai';

interface ActivityBarProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const items: { id: PanelType; icon: string; label: string }[] = [
    { id: 'files', icon: '📁', label: 'Explorer' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'git', icon: '🌿', label: 'Source Control' },
    { id: 'ai', icon: '🤖', label: 'AI Assistant' },
  ];

  return (
    <div className="activity-bar">
      {items.map((item) => (
        <button
          key={item.id}
          className={`activity-bar-item ${activePanel === item.id ? 'active' : ''}`}
          onClick={() => onPanelChange(item.id)}
          title={item.label}
        >
          <span className="activity-bar-icon">{item.icon}</span>
        </button>
      ))}
    </div>
  );
}

export default ActivityBar;
