import React, { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  technologies: string[];
  popularity: number;
}

interface ProjectTemplatesProps {
  onCreateProject: (template: Template, projectName: string, location: string) => void;
  onClose: () => void;
}

function ProjectTemplates({ onCreateProject, onClose }: ProjectTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  const templates: Template[] = [
    {
      id: 'react-ts',
      name: 'React + TypeScript',
      description: 'A React application with TypeScript, Vite, and ESLint pre-configured',
      category: 'Frontend',
      icon: '⚛️',
      technologies: ['React', 'TypeScript', 'Vite', 'ESLint'],
      popularity: 95
    },
    {
      id: 'vue-ts',
      name: 'Vue 3 + TypeScript',
      description: 'A Vue 3 application with TypeScript and Composition API',
      category: 'Frontend',
      icon: '💚',
      technologies: ['Vue 3', 'TypeScript', 'Vite', 'Pinia'],
      popularity: 85
    },
    {
      id: 'next-ts',
      name: 'Next.js',
      description: 'Full-stack React framework with SSR and API routes',
      category: 'Fullstack',
      icon: '▲',
      technologies: ['Next.js', 'React', 'TypeScript'],
      popularity: 90
    },
    {
      id: 'node-express',
      name: 'Node.js + Express',
      description: 'REST API server with Express and TypeScript',
      category: 'Backend',
      icon: '🟢',
      technologies: ['Node.js', 'Express', 'TypeScript'],
      popularity: 80
    },
    {
      id: 'electron-react',
      name: 'Electron + React',
      description: 'Desktop application with Electron and React',
      category: 'Desktop',
      icon: '🖥️',
      technologies: ['Electron', 'React', 'TypeScript'],
      popularity: 70
    },
    {
      id: 'python-flask',
      name: 'Python Flask',
      description: 'Python web application with Flask framework',
      category: 'Backend',
      icon: '🐍',
      technologies: ['Python', 'Flask', 'SQLAlchemy'],
      popularity: 75
    },
    {
      id: 'fastapi',
      name: 'FastAPI',
      description: 'Modern Python API with FastAPI and async support',
      category: 'Backend',
      icon: '⚡',
      technologies: ['Python', 'FastAPI', 'Pydantic'],
      popularity: 78
    },
    {
      id: 'go-fiber',
      name: 'Go Fiber',
      description: 'High-performance Go web framework',
      category: 'Backend',
      icon: '🔵',
      technologies: ['Go', 'Fiber', 'GORM'],
      popularity: 65
    },
    {
      id: 'rust-actix',
      name: 'Rust Actix',
      description: 'Blazing fast Rust web server with Actix-web',
      category: 'Backend',
      icon: '🦀',
      technologies: ['Rust', 'Actix-web', 'Diesel'],
      popularity: 60
    },
    {
      id: 'monorepo',
      name: 'Monorepo (Turborepo)',
      description: 'Multi-package monorepo with Turborepo',
      category: 'Fullstack',
      icon: '📦',
      technologies: ['Turborepo', 'TypeScript', 'pnpm'],
      popularity: 72
    },
    {
      id: 'cli-node',
      name: 'Node.js CLI Tool',
      description: 'Command-line application with Node.js',
      category: 'CLI',
      icon: '💻',
      technologies: ['Node.js', 'Commander', 'TypeScript'],
      popularity: 55
    },
    {
      id: 'chrome-extension',
      name: 'Chrome Extension',
      description: 'Browser extension for Chrome/Edge',
      category: 'Extension',
      icon: '🔌',
      technologies: ['TypeScript', 'React', 'Manifest V3'],
      popularity: 50
    }
  ];

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
    .filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.popularity - a.popularity);

  const handleCreate = async () => {
    if (!selectedTemplate || !projectName || !projectLocation) return;

    setIsCreating(true);
    // Simulate project creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    onCreateProject(selectedTemplate, projectName, projectLocation);
    setIsCreating(false);
    onClose();
  };

  const selectLocation = () => {
    // In real implementation, would open folder dialog
    const path = prompt('Enter project location:', '/home/user/projects');
    if (path) setProjectLocation(path);
  };

  return (
    <div className="project-templates">
      <div className="templates-header">
        <h3>Create New Project</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="templates-content">
        <div className="templates-sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="categories">
            {categories.map(category => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Templates' : category}
              </button>
            ))}
          </div>
        </div>

        <div className="templates-main">
          <div className="templates-grid">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="template-icon">{template.icon}</div>
                <div className="template-info">
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className="template-tags">
                    {template.technologies.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="project-form">
              <h4>Project Details</h4>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <div className="location-input">
                  <input
                    type="text"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="/path/to/projects"
                  />
                  <button onClick={selectLocation}>Browse</button>
                </div>
              </div>

              {projectLocation && projectName && (
                <div className="project-path">
                  Project will be created at: {projectLocation}/{projectName}
                </div>
              )}

              <button
                className="create-btn"
                onClick={handleCreate}
                disabled={!projectName || !projectLocation || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectTemplates;
