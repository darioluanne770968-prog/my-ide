import React, { useState } from 'react';

interface PRComment {
  id: string;
  filePath: string;
  line: number;
  author: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

interface PRFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  diff: string;
}

interface PullRequest {
  number: number;
  title: string;
  description: string;
  author: string;
  branch: string;
  baseBranch: string;
  status: 'open' | 'merged' | 'closed';
  reviewStatus: 'pending' | 'approved' | 'changes_requested';
  files: PRFile[];
  comments: PRComment[];
  createdAt: Date;
  updatedAt: Date;
}

interface PRReviewProps {
  rootPath: string;
  onClose: () => void;
  onNavigate: (filePath: string, line: number) => void;
}

function PRReview({ rootPath, onClose, onNavigate }: PRReviewProps) {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<PRFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLine, setCommentLine] = useState<number | null>(null);

  const fetchPullRequests = async () => {
    setIsLoading(true);

    // Simulate fetching PRs - in real implementation would use GitHub API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockPRs: PullRequest[] = [
      {
        number: 42,
        title: 'Add user authentication feature',
        description: 'Implements JWT-based authentication with login and signup flows.',
        author: 'johndoe',
        branch: 'feature/auth',
        baseBranch: 'main',
        status: 'open',
        reviewStatus: 'pending',
        files: [
          {
            path: 'src/auth/login.ts',
            status: 'added',
            additions: 120,
            deletions: 0,
            diff: `+import { useState } from 'react';
+
+export function Login() {
+  const [email, setEmail] = useState('');
+  const [password, setPassword] = useState('');
+
+  const handleSubmit = async () => {
+    // TODO: Implement login logic
+  };
+
+  return <form onSubmit={handleSubmit}>...</form>;
+}`
          },
          {
            path: 'src/auth/signup.ts',
            status: 'added',
            additions: 85,
            deletions: 0,
            diff: '+// Signup component...'
          },
          {
            path: 'src/utils/api.ts',
            status: 'modified',
            additions: 15,
            deletions: 3,
            diff: `@@ -10,3 +10,15 @@
 export function fetchData() {
-  return fetch('/api');
+  return fetch('/api', {
+    headers: getAuthHeaders()
+  });
 }`
          }
        ],
        comments: [
          {
            id: 'c1',
            filePath: 'src/auth/login.ts',
            line: 8,
            author: 'reviewer1',
            content: 'Consider adding error handling here',
            timestamp: new Date(),
            resolved: false
          }
        ],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
      }
    ];

    setPullRequests(mockPRs);
    setIsLoading(false);
  };

  const addComment = (filePath: string, line: number) => {
    if (!selectedPR || !newComment.trim()) return;

    const comment: PRComment = {
      id: `c-${Date.now()}`,
      filePath,
      line,
      author: 'You',
      content: newComment,
      timestamp: new Date(),
      resolved: false
    };

    setSelectedPR({
      ...selectedPR,
      comments: [...selectedPR.comments, comment]
    });

    setNewComment('');
    setCommentLine(null);
  };

  const resolveComment = (commentId: string) => {
    if (!selectedPR) return;

    setSelectedPR({
      ...selectedPR,
      comments: selectedPR.comments.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    });
  };

  const submitReview = (status: 'approve' | 'request_changes' | 'comment') => {
    if (!selectedPR) return;

    setSelectedPR({
      ...selectedPR,
      reviewStatus: status === 'approve' ? 'approved' : status === 'request_changes' ? 'changes_requested' : 'pending'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added': return '🟢';
      case 'modified': return '🟡';
      case 'deleted': return '🔴';
      case 'renamed': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="pr-review">
      <div className="pr-header">
        <h3>Pull Request Review</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {!selectedPR ? (
        <div className="pr-list-view">
          <div className="pr-toolbar">
            <button onClick={fetchPullRequests} disabled={isLoading}>
              {isLoading ? 'Loading...' : '🔄 Fetch Pull Requests'}
            </button>
          </div>

          <div className="pr-list">
            {pullRequests.map(pr => (
              <div
                key={pr.number}
                className="pr-item"
                onClick={() => setSelectedPR(pr)}
              >
                <div className="pr-item-header">
                  <span className="pr-number">#{pr.number}</span>
                  <span className="pr-title">{pr.title}</span>
                </div>
                <div className="pr-item-meta">
                  <span className="pr-author">{pr.author}</span>
                  <span className="pr-branch">{pr.branch} → {pr.baseBranch}</span>
                  <span className={`pr-status ${pr.reviewStatus}`}>{pr.reviewStatus}</span>
                </div>
              </div>
            ))}
            {pullRequests.length === 0 && !isLoading && (
              <div className="pr-empty">
                <p>No pull requests found</p>
                <p>Click "Fetch Pull Requests" to load PRs</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="pr-detail-view">
          <div className="pr-detail-header">
            <button onClick={() => { setSelectedPR(null); setSelectedFile(null); }}>
              ← Back
            </button>
            <h4>#{selectedPR.number} {selectedPR.title}</h4>
          </div>

          <div className="pr-info">
            <p className="pr-description">{selectedPR.description}</p>
            <div className="pr-meta">
              <span>{selectedPR.author}</span>
              <span>{selectedPR.branch} → {selectedPR.baseBranch}</span>
              <span>{selectedPR.files.length} files changed</span>
            </div>
          </div>

          <div className="pr-content">
            <div className="pr-files">
              <h5>Changed Files</h5>
              {selectedPR.files.map(file => (
                <div
                  key={file.path}
                  className={`pr-file ${selectedFile === file ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <span className="file-status">{getStatusIcon(file.status)}</span>
                  <span className="file-path">{file.path}</span>
                  <span className="file-changes">
                    <span className="additions">+{file.additions}</span>
                    <span className="deletions">-{file.deletions}</span>
                  </span>
                </div>
              ))}
            </div>

            {selectedFile && (
              <div className="pr-diff">
                <div className="diff-header">
                  <span>{selectedFile.path}</span>
                  <button onClick={() => onNavigate(`${rootPath}/${selectedFile.path}`, 1)}>
                    Open File
                  </button>
                </div>
                <pre className="diff-content">
                  {selectedFile.diff.split('\n').map((line, idx) => (
                    <div
                      key={idx}
                      className={`diff-line ${line.startsWith('+') ? 'addition' : line.startsWith('-') ? 'deletion' : ''}`}
                      onClick={() => setCommentLine(idx + 1)}
                    >
                      <span className="line-number">{idx + 1}</span>
                      <span className="line-content">{line}</span>
                      {commentLine === idx + 1 && (
                        <div className="inline-comment-form" onClick={e => e.stopPropagation()}>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                          />
                          <div className="comment-actions">
                            <button onClick={() => setCommentLine(null)}>Cancel</button>
                            <button onClick={() => addComment(selectedFile.path, idx + 1)}>
                              Add Comment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </pre>

                {selectedPR.comments
                  .filter(c => c.filePath === selectedFile.path)
                  .map(comment => (
                    <div key={comment.id} className={`pr-comment ${comment.resolved ? 'resolved' : ''}`}>
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-line">Line {comment.line}</span>
                        {!comment.resolved && (
                          <button onClick={() => resolveComment(comment.id)}>Resolve</button>
                        )}
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="pr-review-actions">
            <button onClick={() => submitReview('comment')} className="comment-btn">
              Comment
            </button>
            <button onClick={() => submitReview('approve')} className="approve-btn">
              ✅ Approve
            </button>
            <button onClick={() => submitReview('request_changes')} className="request-changes-btn">
              ⚠️ Request Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PRReview;
