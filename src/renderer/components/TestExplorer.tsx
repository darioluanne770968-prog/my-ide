import React, { useState, useEffect } from 'react';

interface TestCase {
  id: string;
  name: string;
  filePath: string;
  line: number;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

interface TestSuite {
  id: string;
  name: string;
  filePath: string;
  tests: TestCase[];
  status: 'pending' | 'running' | 'passed' | 'failed';
}

interface TestExplorerProps {
  rootPath: string;
  onNavigate: (filePath: string, line: number) => void;
  onClose: () => void;
}

function TestExplorer({ rootPath, onNavigate, onClose }: TestExplorerProps) {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [totalStats, setTotalStats] = useState({ passed: 0, failed: 0, skipped: 0, total: 0 });

  useEffect(() => {
    discoverTests();
  }, [rootPath]);

  const discoverTests = async () => {
    // In a real implementation, this would scan for test files and parse them
    // For now, we'll simulate test discovery
    const mockSuites: TestSuite[] = [
      {
        id: 'suite-1',
        name: 'utils.test.ts',
        filePath: `${rootPath}/src/utils.test.ts`,
        status: 'pending',
        tests: [
          { id: 't1', name: 'should format date correctly', filePath: `${rootPath}/src/utils.test.ts`, line: 5, status: 'pending' },
          { id: 't2', name: 'should parse JSON safely', filePath: `${rootPath}/src/utils.test.ts`, line: 15, status: 'pending' },
          { id: 't3', name: 'should validate email format', filePath: `${rootPath}/src/utils.test.ts`, line: 25, status: 'pending' },
        ]
      },
      {
        id: 'suite-2',
        name: 'components.test.tsx',
        filePath: `${rootPath}/src/components.test.tsx`,
        status: 'pending',
        tests: [
          { id: 't4', name: 'should render correctly', filePath: `${rootPath}/src/components.test.tsx`, line: 10, status: 'pending' },
          { id: 't5', name: 'should handle click events', filePath: `${rootPath}/src/components.test.tsx`, line: 20, status: 'pending' },
        ]
      }
    ];
    setSuites(mockSuites);
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Simulate running tests
    for (const suite of suites) {
      setSuites(prev => prev.map(s =>
        s.id === suite.id ? { ...s, status: 'running' } : s
      ));

      for (const test of suite.tests) {
        setSuites(prev => prev.map(s =>
          s.id === suite.id
            ? {
                ...s,
                tests: s.tests.map(t =>
                  t.id === test.id ? { ...t, status: 'running' } : t
                )
              }
            : s
        ));

        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

        const passed = Math.random() > 0.2;
        setSuites(prev => prev.map(s =>
          s.id === suite.id
            ? {
                ...s,
                tests: s.tests.map(t =>
                  t.id === test.id
                    ? {
                        ...t,
                        status: passed ? 'passed' : 'failed',
                        duration: Math.floor(Math.random() * 100) + 10,
                        error: passed ? undefined : 'Expected true but got false'
                      }
                    : t
                )
              }
            : s
        ));
      }

      setSuites(prev => {
        const updated = prev.map(s => {
          if (s.id === suite.id) {
            const allPassed = s.tests.every(t => t.status === 'passed');
            return { ...s, status: allPassed ? 'passed' : 'failed' };
          }
          return s;
        });
        return updated;
      });
    }

    setIsRunning(false);
    updateStats();
  };

  const runTest = async (suiteId: string, testId: string) => {
    setIsRunning(true);

    setSuites(prev => prev.map(s =>
      s.id === suiteId
        ? {
            ...s,
            tests: s.tests.map(t =>
              t.id === testId ? { ...t, status: 'running' } : t
            )
          }
        : s
    ));

    await new Promise(resolve => setTimeout(resolve, 500));

    const passed = Math.random() > 0.3;
    setSuites(prev => prev.map(s =>
      s.id === suiteId
        ? {
            ...s,
            tests: s.tests.map(t =>
              t.id === testId
                ? {
                    ...t,
                    status: passed ? 'passed' : 'failed',
                    duration: Math.floor(Math.random() * 100) + 10,
                    error: passed ? undefined : 'Assertion failed'
                  }
                : t
            )
          }
        : s
    ));

    setIsRunning(false);
    updateStats();
  };

  const updateStats = () => {
    let passed = 0, failed = 0, skipped = 0, total = 0;
    suites.forEach(s => {
      s.tests.forEach(t => {
        total++;
        if (t.status === 'passed') passed++;
        else if (t.status === 'failed') failed++;
        else if (t.status === 'skipped') skipped++;
      });
    });
    setTotalStats({ passed, failed, skipped, total });
  };

  const toggleSuite = (suiteId: string) => {
    setExpandedSuites(prev => {
      const next = new Set(prev);
      if (next.has(suiteId)) {
        next.delete(suiteId);
      } else {
        next.add(suiteId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '⏳';
      case 'skipped': return '⏭️';
      default: return '○';
    }
  };

  const filteredSuites = suites.map(suite => ({
    ...suite,
    tests: suite.tests.filter(test => {
      if (filter !== 'all' && test.status !== filter) return false;
      if (searchQuery && !test.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
  })).filter(suite => suite.tests.length > 0 || filter === 'all');

  return (
    <div className="test-explorer">
      <div className="test-header">
        <h3>Test Explorer</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="test-toolbar">
        <button onClick={runAllTests} disabled={isRunning} className="run-all-btn">
          {isRunning ? '⏳ Running...' : '▶ Run All'}
        </button>
        <button onClick={discoverTests} disabled={isRunning} className="refresh-btn">
          🔄 Refresh
        </button>
        <input
          type="text"
          placeholder="Filter tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="test-search"
        />
      </div>

      <div className="test-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({totalStats.total})
        </button>
        <button className={filter === 'passed' ? 'active' : ''} onClick={() => setFilter('passed')}>
          ✅ Passed ({totalStats.passed})
        </button>
        <button className={filter === 'failed' ? 'active' : ''} onClick={() => setFilter('failed')}>
          ❌ Failed ({totalStats.failed})
        </button>
      </div>

      <div className="test-list">
        {filteredSuites.map(suite => (
          <div key={suite.id} className="test-suite">
            <div
              className="suite-header"
              onClick={() => toggleSuite(suite.id)}
            >
              <span className="expand-icon">{expandedSuites.has(suite.id) ? '▼' : '▶'}</span>
              <span className="suite-icon">{getStatusIcon(suite.status)}</span>
              <span className="suite-name">{suite.name}</span>
              <span className="suite-count">{suite.tests.length} tests</span>
            </div>

            {expandedSuites.has(suite.id) && (
              <div className="suite-tests">
                {suite.tests.map(test => (
                  <div
                    key={test.id}
                    className={`test-item ${test.status}`}
                  >
                    <span className="test-icon">{getStatusIcon(test.status)}</span>
                    <span
                      className="test-name"
                      onClick={() => onNavigate(test.filePath, test.line)}
                    >
                      {test.name}
                    </span>
                    {test.duration && (
                      <span className="test-duration">{test.duration}ms</span>
                    )}
                    <button
                      className="run-test-btn"
                      onClick={() => runTest(suite.id, test.id)}
                      disabled={isRunning}
                    >
                      ▶
                    </button>
                    {test.error && (
                      <div className="test-error">{test.error}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredSuites.length === 0 && (
          <div className="test-empty">
            <p>No tests found</p>
            <button onClick={discoverTests}>Discover Tests</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestExplorer;
