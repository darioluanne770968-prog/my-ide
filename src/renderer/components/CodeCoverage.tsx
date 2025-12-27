import React, { useState } from 'react';

interface FileCoverage {
  filePath: string;
  fileName: string;
  lines: { covered: number; total: number; percentage: number };
  functions: { covered: number; total: number; percentage: number };
  branches: { covered: number; total: number; percentage: number };
  uncoveredLines: number[];
}

interface CodeCoverageProps {
  rootPath: string;
  onNavigate: (filePath: string, line: number) => void;
  onClose: () => void;
}

function CodeCoverage({ rootPath, onNavigate, onClose }: CodeCoverageProps) {
  const [coverage, setCoverage] = useState<FileCoverage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'lines' | 'functions' | 'branches'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [threshold, setThreshold] = useState(80);
  const [selectedFile, setSelectedFile] = useState<FileCoverage | null>(null);

  const runCoverage = async () => {
    setIsLoading(true);

    // Simulate running coverage analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockCoverage: FileCoverage[] = [
      {
        filePath: `${rootPath}/src/utils.ts`,
        fileName: 'utils.ts',
        lines: { covered: 45, total: 50, percentage: 90 },
        functions: { covered: 8, total: 10, percentage: 80 },
        branches: { covered: 12, total: 15, percentage: 80 },
        uncoveredLines: [23, 45, 67, 89, 112]
      },
      {
        filePath: `${rootPath}/src/components/Editor.tsx`,
        fileName: 'Editor.tsx',
        lines: { covered: 120, total: 180, percentage: 66.7 },
        functions: { covered: 15, total: 20, percentage: 75 },
        branches: { covered: 20, total: 30, percentage: 66.7 },
        uncoveredLines: [34, 56, 78, 90, 102, 145, 167, 189]
      },
      {
        filePath: `${rootPath}/src/services/api.ts`,
        fileName: 'api.ts',
        lines: { covered: 95, total: 100, percentage: 95 },
        functions: { covered: 12, total: 12, percentage: 100 },
        branches: { covered: 18, total: 20, percentage: 90 },
        uncoveredLines: [88, 92, 94, 98, 99]
      },
      {
        filePath: `${rootPath}/src/hooks/useAuth.ts`,
        fileName: 'useAuth.ts',
        lines: { covered: 28, total: 60, percentage: 46.7 },
        functions: { covered: 3, total: 8, percentage: 37.5 },
        branches: { covered: 5, total: 12, percentage: 41.7 },
        uncoveredLines: [12, 24, 36, 48, 50, 52, 54, 56, 58]
      }
    ];

    setCoverage(mockCoverage);
    setIsLoading(false);
  };

  const getTotalCoverage = () => {
    if (coverage.length === 0) return { lines: 0, functions: 0, branches: 0 };

    const totals = coverage.reduce(
      (acc, file) => ({
        linesCovered: acc.linesCovered + file.lines.covered,
        linesTotal: acc.linesTotal + file.lines.total,
        funcsCovered: acc.funcsCovered + file.functions.covered,
        funcsTotal: acc.funcsTotal + file.functions.total,
        branchesCovered: acc.branchesCovered + file.branches.covered,
        branchesTotal: acc.branchesTotal + file.branches.total
      }),
      { linesCovered: 0, linesTotal: 0, funcsCovered: 0, funcsTotal: 0, branchesCovered: 0, branchesTotal: 0 }
    );

    return {
      lines: totals.linesTotal > 0 ? (totals.linesCovered / totals.linesTotal) * 100 : 0,
      functions: totals.funcsTotal > 0 ? (totals.funcsCovered / totals.funcsTotal) * 100 : 0,
      branches: totals.branchesTotal > 0 ? (totals.branchesCovered / totals.branchesTotal) * 100 : 0
    };
  };

  const sortedCoverage = [...coverage].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.fileName.localeCompare(b.fileName);
        break;
      case 'lines':
        comparison = a.lines.percentage - b.lines.percentage;
        break;
      case 'functions':
        comparison = a.functions.percentage - b.functions.percentage;
        break;
      case 'branches':
        comparison = a.branches.percentage - b.branches.percentage;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getPercentageColor = (percentage: number) => {
    if (percentage >= threshold) return 'coverage-good';
    if (percentage >= threshold * 0.7) return 'coverage-warning';
    return 'coverage-bad';
  };

  const totals = getTotalCoverage();

  return (
    <div className="code-coverage">
      <div className="coverage-header">
        <h3>Code Coverage</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="coverage-toolbar">
        <button onClick={runCoverage} disabled={isLoading} className="run-coverage-btn">
          {isLoading ? '⏳ Analyzing...' : '▶ Run Coverage'}
        </button>
        <div className="threshold-setting">
          <label>Threshold:</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={0}
            max={100}
          />
          <span>%</span>
        </div>
      </div>

      {coverage.length > 0 && (
        <>
          <div className="coverage-summary">
            <div className={`summary-item ${getPercentageColor(totals.lines)}`}>
              <span className="summary-label">Lines</span>
              <span className="summary-value">{totals.lines.toFixed(1)}%</span>
              <div className="summary-bar">
                <div className="bar-fill" style={{ width: `${totals.lines}%` }} />
              </div>
            </div>
            <div className={`summary-item ${getPercentageColor(totals.functions)}`}>
              <span className="summary-label">Functions</span>
              <span className="summary-value">{totals.functions.toFixed(1)}%</span>
              <div className="summary-bar">
                <div className="bar-fill" style={{ width: `${totals.functions}%` }} />
              </div>
            </div>
            <div className={`summary-item ${getPercentageColor(totals.branches)}`}>
              <span className="summary-label">Branches</span>
              <span className="summary-value">{totals.branches.toFixed(1)}%</span>
              <div className="summary-bar">
                <div className="bar-fill" style={{ width: `${totals.branches}%` }} />
              </div>
            </div>
          </div>

          <div className="coverage-table">
            <div className="table-header">
              <span className="col-file" onClick={() => { setSortBy('name'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                File {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
              <span className="col-lines" onClick={() => { setSortBy('lines'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                Lines {sortBy === 'lines' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
              <span className="col-functions" onClick={() => { setSortBy('functions'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                Functions {sortBy === 'functions' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
              <span className="col-branches" onClick={() => { setSortBy('branches'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                Branches {sortBy === 'branches' && (sortOrder === 'asc' ? '↑' : '↓')}
              </span>
            </div>

            <div className="table-body">
              {sortedCoverage.map(file => (
                <div
                  key={file.filePath}
                  className={`table-row ${selectedFile === file ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <span className="col-file">{file.fileName}</span>
                  <span className={`col-lines ${getPercentageColor(file.lines.percentage)}`}>
                    {file.lines.percentage.toFixed(1)}%
                    <small>({file.lines.covered}/{file.lines.total})</small>
                  </span>
                  <span className={`col-functions ${getPercentageColor(file.functions.percentage)}`}>
                    {file.functions.percentage.toFixed(1)}%
                    <small>({file.functions.covered}/{file.functions.total})</small>
                  </span>
                  <span className={`col-branches ${getPercentageColor(file.branches.percentage)}`}>
                    {file.branches.percentage.toFixed(1)}%
                    <small>({file.branches.covered}/{file.branches.total})</small>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedFile && (
            <div className="uncovered-lines">
              <h4>Uncovered Lines in {selectedFile.fileName}</h4>
              <div className="lines-list">
                {selectedFile.uncoveredLines.map(line => (
                  <span
                    key={line}
                    className="uncovered-line"
                    onClick={() => onNavigate(selectedFile.filePath, line)}
                  >
                    Line {line}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {coverage.length === 0 && !isLoading && (
        <div className="coverage-empty">
          <p>No coverage data available</p>
          <p>Click "Run Coverage" to analyze your code</p>
        </div>
      )}
    </div>
  );
}

export default CodeCoverage;
