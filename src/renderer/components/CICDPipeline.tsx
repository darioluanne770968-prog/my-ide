import { useState } from 'react';

interface CICDPipelineProps {
  rootPath: string;
  onClose: () => void;
}

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled';
  trigger: string;
  startedAt: string;
  duration: string;
  commit: string;
  commitMessage: string;
}

interface Stage {
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'skipped';
  duration: string;
  jobs: Job[];
}

interface Job {
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  duration: string;
}

export default function CICDPipeline({ rootPath, onClose }: CICDPipelineProps) {
  const [pipelines] = useState<Pipeline[]>([
    { id: '1', name: 'Build & Deploy', branch: 'main', status: 'success', trigger: 'push', startedAt: '10 min ago', duration: '5m 32s', commit: 'abc1234', commitMessage: 'feat: Add new feature' },
    { id: '2', name: 'Build & Deploy', branch: 'feature/auth', status: 'running', trigger: 'push', startedAt: '2 min ago', duration: '2m 15s', commit: 'def2345', commitMessage: 'fix: Auth bug' },
    { id: '3', name: 'Build & Deploy', branch: 'main', status: 'failed', trigger: 'push', startedAt: '1 hour ago', duration: '3m 45s', commit: 'ghi3456', commitMessage: 'chore: Update deps' },
    { id: '4', name: 'Nightly Build', branch: 'main', status: 'success', trigger: 'schedule', startedAt: '8 hours ago', duration: '12m 18s', commit: 'jkl4567', commitMessage: 'Scheduled build' }
  ]);

  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);

  const [stages] = useState<Stage[]>([
    {
      name: 'Build',
      status: 'success',
      duration: '1m 20s',
      jobs: [
        { name: 'Install Dependencies', status: 'success', duration: '30s' },
        { name: 'Compile', status: 'success', duration: '45s' },
        { name: 'Lint', status: 'success', duration: '5s' }
      ]
    },
    {
      name: 'Test',
      status: 'success',
      duration: '2m 10s',
      jobs: [
        { name: 'Unit Tests', status: 'success', duration: '1m 30s' },
        { name: 'Integration Tests', status: 'success', duration: '40s' }
      ]
    },
    {
      name: 'Deploy',
      status: 'running',
      duration: '1m 02s',
      jobs: [
        { name: 'Build Docker Image', status: 'success', duration: '45s' },
        { name: 'Push to Registry', status: 'running', duration: '17s' },
        { name: 'Deploy to Kubernetes', status: 'pending', duration: '-' }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      running: '#3498db',
      success: '#27ae60',
      failed: '#e74c3c',
      pending: '#95a5a6',
      cancelled: '#7f8c8d',
      skipped: '#bdc3c7'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      running: '⟳',
      success: '✓',
      failed: '✗',
      pending: '○',
      cancelled: '⊘',
      skipped: '→'
    };
    return icons[status] || '○';
  };

  return (
    <div className="cicd-pipeline">
      <div className="pipeline-header">
        <h3>CI/CD Pipelines</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="pipeline-content">
        <div className="pipelines-list">
          <div className="list-header">
            <span>Recent Pipelines</span>
            <button className="run-btn">▶ Run Pipeline</button>
          </div>

          {pipelines.map(pipeline => (
            <div
              key={pipeline.id}
              className={`pipeline-item ${selectedPipeline === pipeline.id ? 'selected' : ''}`}
              onClick={() => setSelectedPipeline(pipeline.id)}
            >
              <div
                className="status-icon"
                style={{ color: getStatusColor(pipeline.status) }}
              >
                {pipeline.status === 'running' ? (
                  <span className="spinning">{getStatusIcon(pipeline.status)}</span>
                ) : (
                  getStatusIcon(pipeline.status)
                )}
              </div>

              <div className="pipeline-info">
                <div className="pipeline-main">
                  <span className="pipeline-name">{pipeline.name}</span>
                  <span className="branch-badge">{pipeline.branch}</span>
                </div>
                <div className="pipeline-meta">
                  <span className="commit">{pipeline.commit}</span>
                  <span className="message">{pipeline.commitMessage}</span>
                </div>
              </div>

              <div className="pipeline-timing">
                <span className="duration">{pipeline.duration}</span>
                <span className="started">{pipeline.startedAt}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedPipeline && (
          <div className="pipeline-details">
            <div className="details-header">
              <h4>Pipeline Stages</h4>
              <div className="actions">
                <button className="action-btn">Cancel</button>
                <button className="action-btn">Retry</button>
              </div>
            </div>

            <div className="stages-view">
              {stages.map((stage, idx) => (
                <div key={stage.name} className="stage-column">
                  <div className="stage-header">
                    <span
                      className="stage-status"
                      style={{ color: getStatusColor(stage.status) }}
                    >
                      {stage.status === 'running' ? (
                        <span className="spinning">{getStatusIcon(stage.status)}</span>
                      ) : (
                        getStatusIcon(stage.status)
                      )}
                    </span>
                    <span className="stage-name">{stage.name}</span>
                    <span className="stage-duration">{stage.duration}</span>
                  </div>

                  <div className="jobs-list">
                    {stage.jobs.map(job => (
                      <div key={job.name} className="job-item">
                        <span
                          className="job-status"
                          style={{ color: getStatusColor(job.status) }}
                        >
                          {job.status === 'running' ? (
                            <span className="spinning">{getStatusIcon(job.status)}</span>
                          ) : (
                            getStatusIcon(job.status)
                          )}
                        </span>
                        <span className="job-name">{job.name}</span>
                        <span className="job-duration">{job.duration}</span>
                      </div>
                    ))}
                  </div>

                  {idx < stages.length - 1 && (
                    <div className="stage-connector">→</div>
                  )}
                </div>
              ))}
            </div>

            <div className="logs-section">
              <div className="logs-header">
                <span>Job Logs: Push to Registry</span>
                <button className="download-btn">Download</button>
              </div>
              <pre className="logs-content">
{`$ docker push registry.example.com/app:latest
The push refers to repository [registry.example.com/app]
a1b2c3d4: Preparing
e5f6g7h8: Preparing
i9j0k1l2: Preparing
a1b2c3d4: Pushing [=====>                                    ] 12.5MB/125MB
e5f6g7h8: Pushed
i9j0k1l2: Pushed
...`}
              </pre>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cicd-pipeline {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .pipeline-header h3 { margin: 0; font-size: 14px; }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .pipeline-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .pipelines-list {
          width: 400px;
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
        }
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
          font-weight: 500;
        }
        .run-btn {
          padding: 6px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .pipeline-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
        }
        .pipeline-item:hover { background: var(--bg-secondary); }
        .pipeline-item.selected { background: rgba(52, 152, 219, 0.1); }
        .status-icon { font-size: 18px; width: 24px; text-align: center; }
        .spinning { display: inline-block; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pipeline-info { flex: 1; min-width: 0; }
        .pipeline-main { display: flex; align-items: center; gap: 8px; }
        .pipeline-name { font-weight: 500; font-size: 13px; }
        .branch-badge {
          padding: 2px 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .pipeline-meta {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .commit { font-family: monospace; }
        .message {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pipeline-timing {
          text-align: right;
          font-size: 11px;
        }
        .duration { display: block; font-weight: 500; }
        .started { color: var(--text-tertiary); }
        .pipeline-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .details-header h4 { margin: 0; font-size: 13px; }
        .actions { display: flex; gap: 8px; }
        .action-btn {
          padding: 4px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
        }
        .stages-view {
          display: flex;
          padding: 16px;
          gap: 16px;
          overflow-x: auto;
        }
        .stage-column {
          flex-shrink: 0;
          width: 200px;
          position: relative;
        }
        .stage-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 4px 4px 0 0;
          font-size: 13px;
        }
        .stage-status { font-size: 14px; }
        .stage-name { flex: 1; font-weight: 500; }
        .stage-duration { font-size: 11px; color: var(--text-tertiary); }
        .jobs-list {
          border: 1px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
        .job-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
        }
        .job-item:last-child { border-bottom: none; }
        .job-status { font-size: 12px; }
        .job-name { flex: 1; }
        .job-duration { color: var(--text-tertiary); font-size: 11px; }
        .stage-connector {
          position: absolute;
          right: -24px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          font-size: 20px;
        }
        .logs-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--border-color);
          min-height: 150px;
        }
        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-secondary);
          font-size: 12px;
        }
        .download-btn {
          padding: 4px 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
        }
        .logs-content {
          flex: 1;
          margin: 0;
          padding: 12px;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.6;
          overflow: auto;
          background: #1a1a1a;
          color: #d4d4d4;
        }
      `}</style>
    </div>
  );
}
