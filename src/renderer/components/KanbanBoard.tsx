import { useState } from 'react';

interface KanbanBoardProps {
  onClose: () => void;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string[];
  assignee?: string;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export default function KanbanBoard({ onClose }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      color: '#95a5a6',
      tasks: [
        { id: '1', title: 'Research new authentication methods', priority: 'low', labels: ['research'], description: 'Explore OAuth 2.0 and JWT alternatives' },
        { id: '2', title: 'Update documentation', priority: 'low', labels: ['docs'] },
        { id: '3', title: 'Performance optimization plan', priority: 'medium', labels: ['planning'] }
      ]
    },
    {
      id: 'todo',
      title: 'To Do',
      color: '#3498db',
      tasks: [
        { id: '4', title: 'Implement user settings page', priority: 'high', labels: ['feature', 'frontend'], assignee: 'John', dueDate: '2024-01-25' },
        { id: '5', title: 'Fix navigation menu bug', priority: 'urgent', labels: ['bug'], assignee: 'Sarah' },
        { id: '6', title: 'Add unit tests for API', priority: 'medium', labels: ['testing'] }
      ]
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      color: '#f39c12',
      tasks: [
        { id: '7', title: 'Database migration script', priority: 'high', labels: ['backend', 'database'], assignee: 'Mike', dueDate: '2024-01-22' },
        { id: '8', title: 'UI component refactoring', priority: 'medium', labels: ['refactor', 'frontend'], assignee: 'John' }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      color: '#9b59b6',
      tasks: [
        { id: '9', title: 'Payment integration', priority: 'urgent', labels: ['feature', 'backend'], assignee: 'Sarah', dueDate: '2024-01-20' }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      color: '#27ae60',
      tasks: [
        { id: '10', title: 'Setup CI/CD pipeline', priority: 'high', labels: ['devops'] },
        { id: '11', title: 'Create project structure', priority: 'medium', labels: ['setup'] },
        { id: '12', title: 'Design system implementation', priority: 'high', labels: ['design', 'frontend'] }
      ]
    }
  ]);

  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumn: string } | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, fromColumn: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toColumnId: string) => {
    if (!draggedTask) return;

    setColumns(prev => prev.map(col => {
      if (col.id === draggedTask.fromColumn) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.task.id) };
      }
      if (col.id === toColumnId) {
        return { ...col, tasks: [...col.tasks, draggedTask.task] };
      }
      return col;
    }));

    setDraggedTask(null);
  };

  const addTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: 'medium',
      labels: []
    };

    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    }));

    setNewTaskTitle('');
    setShowAddTask(null);
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
      }
      return col;
    }));
    setSelectedTask(null);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e67e22',
      urgent: '#e74c3c'
    };
    return colors[priority];
  };

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      feature: '#3498db',
      bug: '#e74c3c',
      frontend: '#9b59b6',
      backend: '#2ecc71',
      testing: '#f39c12',
      docs: '#95a5a6',
      refactor: '#1abc9c',
      database: '#e67e22',
      devops: '#34495e',
      design: '#ff69b4',
      research: '#00bcd4',
      planning: '#607d8b',
      setup: '#8bc34a'
    };
    return colors[label] || '#95a5a6';
  };

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  return (
    <div className="kanban-board">
      <div className="board-header">
        <div className="header-left">
          <h3>Kanban Board</h3>
          <span className="task-count">{totalTasks} tasks</span>
        </div>
        <div className="header-actions">
          <button className="filter-btn">🔍 Filter</button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="board-content">
        <div className="columns-container">
          {columns.map(column => (
            <div
              key={column.id}
              className="column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <span className="color-dot" style={{ background: column.color }}></span>
                  <span className="title">{column.title}</span>
                  <span className="count">{column.tasks.length}</span>
                </div>
                <button
                  className="add-task-btn"
                  onClick={() => setShowAddTask(column.id)}
                >
                  +
                </button>
              </div>

              <div className="tasks-list">
                {showAddTask === column.id && (
                  <div className="add-task-form">
                    <input
                      type="text"
                      placeholder="Task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTask(column.id);
                        if (e.key === 'Escape') setShowAddTask(null);
                      }}
                    />
                    <div className="form-actions">
                      <button onClick={() => addTask(column.id)}>Add</button>
                      <button onClick={() => setShowAddTask(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`task-card ${selectedTask?.id === task.id ? 'selected' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="task-priority">
                      <span
                        className="priority-dot"
                        style={{ background: getPriorityColor(task.priority) }}
                        title={task.priority}
                      ></span>
                    </div>

                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-description">{task.description}</div>
                      )}

                      {task.labels.length > 0 && (
                        <div className="task-labels">
                          {task.labels.map(label => (
                            <span
                              key={label}
                              className="label"
                              style={{ background: getLabelColor(label) }}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="task-meta">
                        {task.assignee && (
                          <span className="assignee">{task.assignee}</span>
                        )}
                        {task.dueDate && (
                          <span className="due-date">📅 {task.dueDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedTask && (
          <div className="task-detail-panel">
            <div className="panel-header">
              <h4>{selectedTask.title}</h4>
              <button className="close-panel" onClick={() => setSelectedTask(null)}>×</button>
            </div>

            <div className="panel-content">
              <div className="detail-section">
                <label>Description</label>
                <textarea
                  defaultValue={selectedTask.description}
                  placeholder="Add a description..."
                />
              </div>

              <div className="detail-section">
                <label>Priority</label>
                <select defaultValue={selectedTask.priority}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="detail-section">
                <label>Assignee</label>
                <input type="text" defaultValue={selectedTask.assignee} placeholder="Assign to..." />
              </div>

              <div className="detail-section">
                <label>Due Date</label>
                <input type="date" defaultValue={selectedTask.dueDate} />
              </div>

              <div className="detail-section">
                <label>Labels</label>
                <div className="labels-list">
                  {selectedTask.labels.map(label => (
                    <span
                      key={label}
                      className="label"
                      style={{ background: getLabelColor(label) }}
                    >
                      {label} ×
                    </span>
                  ))}
                  <button className="add-label">+ Add</button>
                </div>
              </div>

              <div className="panel-actions">
                <button className="save-btn">Save Changes</button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    const col = columns.find(c => c.tasks.some(t => t.id === selectedTask.id));
                    if (col) deleteTask(selectedTask.id, col.id);
                  }}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .kanban-board {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .board-header h3 { margin: 0; font-size: 14px; }
        .task-count { font-size: 12px; color: var(--text-secondary); }
        .header-actions { display: flex; gap: 8px; }
        .filter-btn {
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
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
        .board-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .columns-container {
          flex: 1;
          display: flex;
          gap: 12px;
          padding: 16px;
          overflow-x: auto;
        }
        .column {
          flex-shrink: 0;
          width: 280px;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-radius: 8px;
          max-height: 100%;
        }
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
        }
        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
        }
        .color-dot { width: 8px; height: 8px; border-radius: 50%; }
        .count {
          padding: 2px 6px;
          background: var(--bg-primary);
          border-radius: 10px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .add-task-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
        }
        .tasks-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 8px 8px;
        }
        .add-task-form {
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .add-task-form input {
          width: 100%;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .form-actions { display: flex; gap: 8px; }
        .form-actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .form-actions button:first-child { background: var(--accent-color); color: white; }
        .form-actions button:last-child { background: var(--bg-secondary); color: var(--text-primary); }
        .task-card {
          display: flex;
          gap: 8px;
          padding: 10px;
          background: var(--bg-primary);
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: grab;
          border: 1px solid transparent;
        }
        .task-card:hover { border-color: var(--border-color); }
        .task-card.selected { border-color: var(--accent-color); }
        .task-card:active { cursor: grabbing; }
        .priority-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 6px; }
        .task-content { flex: 1; min-width: 0; }
        .task-title { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .task-description {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .task-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }
        .label {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          color: white;
        }
        .task-meta {
          display: flex;
          gap: 8px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .task-detail-panel {
          width: 320px;
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .panel-header h4 { margin: 0; font-size: 14px; }
        .close-panel {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 18px;
        }
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .detail-section {
          margin-bottom: 16px;
        }
        .detail-section label {
          display: block;
          font-size: 11px;
          color: var(--text-tertiary);
          margin-bottom: 6px;
        }
        .detail-section textarea,
        .detail-section input,
        .detail-section select {
          width: 100%;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          font-size: 13px;
        }
        .detail-section textarea {
          min-height: 80px;
          resize: vertical;
        }
        .labels-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .add-label {
          padding: 2px 8px;
          background: var(--bg-secondary);
          border: 1px dashed var(--border-color);
          border-radius: 3px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 10px;
        }
        .panel-actions {
          display: flex;
          gap: 8px;
          margin-top: 24px;
        }
        .save-btn {
          flex: 1;
          padding: 10px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-btn {
          padding: 10px;
          background: none;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
