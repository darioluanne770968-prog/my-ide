import { useState, useEffect } from 'react';

export interface RecentProject {
  path: string;
  name: string;
  lastOpened: number;
  pinned?: boolean;
}

interface RecentProjectsProps {
  projects: RecentProject[];
  onOpenProject: (path: string) => void;
  onRemoveProject: (path: string) => void;
  onPinProject: (path: string) => void;
  onClearRecent: () => void;
  onClose: () => void;
}

function RecentProjects({
  projects,
  onOpenProject,
  onRemoveProject,
  onPinProject,
  onClearRecent,
  onClose
}: RecentProjectsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || p.path.toLowerCase().includes(query);
  });

  const pinnedProjects = filteredProjects.filter(p => p.pinned);
  const recentProjects = filteredProjects.filter(p => !p.pinned);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  };

  const handleKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter') {
      onOpenProject(path);
    }
  };

  const renderProject = (project: RecentProject) => (
    <div
      key={project.path}
      className="recent-project-item"
      onClick={() => onOpenProject(project.path)}
      onKeyDown={(e) => handleKeyDown(e, project.path)}
      tabIndex={0}
    >
      <div className="project-icon">
        {project.pinned ? '📌' : '📁'}
      </div>
      <div className="project-info">
        <div className="project-name">{project.name}</div>
        <div className="project-path">{project.path}</div>
      </div>
      <div className="project-meta">
        <span className="project-date">{formatDate(project.lastOpened)}</span>
      </div>
      <div className="project-actions">
        <button
          onClick={(e) => { e.stopPropagation(); onPinProject(project.path); }}
          className={`project-action-btn ${project.pinned ? 'pinned' : ''}`}
          title={project.pinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemoveProject(project.path); }}
          className="project-action-btn"
          title="Remove from recent"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="recent-projects">
      <div className="recent-projects-header">
        <h2>Recent Projects</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="recent-projects-search">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="recent-projects-content">
        {pinnedProjects.length > 0 && (
          <div className="projects-section">
            <div className="section-header">
              <span>Pinned</span>
            </div>
            <div className="projects-list">
              {pinnedProjects.map(renderProject)}
            </div>
          </div>
        )}

        {recentProjects.length > 0 && (
          <div className="projects-section">
            <div className="section-header">
              <span>Recent</span>
              <button onClick={onClearRecent} className="clear-btn">Clear All</button>
            </div>
            <div className="projects-list">
              {recentProjects.map(renderProject)}
            </div>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="no-projects">
            {searchQuery ? 'No matching projects' : 'No recent projects'}
          </div>
        )}
      </div>

      <div className="recent-projects-footer">
        <button onClick={() => onOpenProject('')} className="open-folder-btn">
          Open Folder...
        </button>
      </div>
    </div>
  );
}

export default RecentProjects;
