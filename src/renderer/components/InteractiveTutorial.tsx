import React, { useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  action?: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  completed?: boolean;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: TutorialStep[];
}

interface InteractiveTutorialProps {
  onAction: (action: string) => void;
  onClose: () => void;
}

function InteractiveTutorial({ onAction, onClose }: InteractiveTutorialProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const tutorials: Tutorial[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of My IDE',
      difficulty: 'beginner',
      duration: '5 min',
      steps: [
        {
          id: 'step-1',
          title: 'Welcome to My IDE',
          content: 'Welcome! This tutorial will guide you through the basic features of My IDE. Let\'s start by opening a folder.',
          action: 'openFolder'
        },
        {
          id: 'step-2',
          title: 'File Explorer',
          content: 'The file explorer on the left shows your project files. Click on any file to open it in the editor.',
          target: '.file-tree'
        },
        {
          id: 'step-3',
          title: 'Command Palette',
          content: 'Press Ctrl+Shift+P to open the Command Palette. This gives you quick access to all commands.',
          action: 'openCommandPalette'
        },
        {
          id: 'step-4',
          title: 'Terminal',
          content: 'Press Ctrl+` to toggle the integrated terminal. You can run commands directly in your project.',
          action: 'toggleTerminal'
        },
        {
          id: 'step-5',
          title: 'Congratulations!',
          content: 'You\'ve completed the basics! Explore more tutorials to learn about advanced features.',
        }
      ]
    },
    {
      id: 'git-workflow',
      title: 'Git Workflow',
      description: 'Master Git integration in the IDE',
      difficulty: 'intermediate',
      duration: '10 min',
      steps: [
        {
          id: 'git-1',
          title: 'Source Control Panel',
          content: 'Click on the Source Control icon in the activity bar or press Ctrl+Shift+G to open Git panel.',
          action: 'openGitPanel'
        },
        {
          id: 'git-2',
          title: 'View Changes',
          content: 'Modified files appear in the Changes section. Click on a file to see the diff.',
        },
        {
          id: 'git-3',
          title: 'Stage Changes',
          content: 'Click the + icon next to a file to stage it, or use the "Stage All" button.',
        },
        {
          id: 'git-4',
          title: 'Commit',
          content: 'Enter a commit message and click the checkmark to commit your changes.',
        },
        {
          id: 'git-5',
          title: 'Push & Pull',
          content: 'Use the push/pull buttons to sync with the remote repository.',
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'AI-Powered Features',
      description: 'Leverage AI to boost productivity',
      difficulty: 'intermediate',
      duration: '8 min',
      steps: [
        {
          id: 'ai-1',
          title: 'AI Chat',
          content: 'Open the AI panel from the activity bar to chat with the AI assistant about your code.',
          action: 'openAIPanel'
        },
        {
          id: 'ai-2',
          title: 'Code Completion',
          content: 'As you type, AI suggestions will appear. Press Tab to accept a suggestion.',
        },
        {
          id: 'ai-3',
          title: 'Code Review',
          content: 'Right-click in the editor and select "AI Code Review" to get instant feedback.',
        },
        {
          id: 'ai-4',
          title: 'Generate Tests',
          content: 'Select code and use "AI Generate Tests" to automatically create test cases.',
        }
      ]
    },
    {
      id: 'debugging',
      title: 'Debugging',
      description: 'Learn to debug effectively',
      difficulty: 'advanced',
      duration: '15 min',
      steps: [
        {
          id: 'debug-1',
          title: 'Set Breakpoints',
          content: 'Click in the gutter (left of line numbers) to set a breakpoint.',
        },
        {
          id: 'debug-2',
          title: 'Start Debugging',
          content: 'Press F5 or click the debug icon to start a debug session.',
        },
        {
          id: 'debug-3',
          title: 'Step Through Code',
          content: 'Use Step Over (F10), Step Into (F11), and Step Out (Shift+F11) to navigate.',
        },
        {
          id: 'debug-4',
          title: 'Watch Variables',
          content: 'Add variables to the Watch panel to monitor their values during execution.',
        },
        {
          id: 'debug-5',
          title: 'Debug Console',
          content: 'Use the Debug Console to evaluate expressions at breakpoints.',
        }
      ]
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('my-ide-completed-tutorials');
    if (saved) {
      setCompletedTutorials(new Set(JSON.parse(saved)));
    }
  }, []);

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setShowHint(false);
  };

  const nextStep = () => {
    if (!selectedTutorial) return;

    if (currentStep < selectedTutorial.steps.length - 1) {
      const step = selectedTutorial.steps[currentStep];
      if (step.action) {
        onAction(step.action);
      }
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    if (selectedTutorial) {
      const newCompleted = new Set(completedTutorials);
      newCompleted.add(selectedTutorial.id);
      setCompletedTutorials(newCompleted);
      localStorage.setItem('my-ide-completed-tutorials', JSON.stringify([...newCompleted]));
      setSelectedTutorial(null);
    }
  };

  const exitTutorial = () => {
    setSelectedTutorial(null);
    setCurrentStep(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#2ecc71';
      case 'intermediate': return '#f1c40f';
      case 'advanced': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const progress = selectedTutorial
    ? ((currentStep + 1) / selectedTutorial.steps.length) * 100
    : 0;

  return (
    <div className="interactive-tutorial">
      <div className="tutorial-header">
        <h3>📚 Interactive Tutorials</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {!selectedTutorial ? (
        <div className="tutorial-list">
          <p className="tutorial-intro">
            Learn My IDE features through interactive, hands-on tutorials.
          </p>

          <div className="tutorials-grid">
            {tutorials.map(tutorial => (
              <div
                key={tutorial.id}
                className={`tutorial-card ${completedTutorials.has(tutorial.id) ? 'completed' : ''}`}
                onClick={() => startTutorial(tutorial)}
              >
                <div className="card-header">
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}
                  >
                    {tutorial.difficulty}
                  </span>
                  {completedTutorials.has(tutorial.id) && (
                    <span className="completed-badge">✓</span>
                  )}
                </div>
                <h4>{tutorial.title}</h4>
                <p>{tutorial.description}</p>
                <div className="card-footer">
                  <span className="duration">⏱️ {tutorial.duration}</span>
                  <span className="steps">{tutorial.steps.length} steps</span>
                </div>
              </div>
            ))}
          </div>

          <div className="tutorial-progress">
            <h4>Your Progress</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedTutorials.size / tutorials.length) * 100}%` }}
              />
            </div>
            <span>{completedTutorials.size} of {tutorials.length} completed</span>
          </div>
        </div>
      ) : (
        <div className="tutorial-active">
          <div className="tutorial-nav">
            <button onClick={exitTutorial}>← Back to Tutorials</button>
            <span className="tutorial-title">{selectedTutorial.title}</span>
          </div>

          <div className="step-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>Step {currentStep + 1} of {selectedTutorial.steps.length}</span>
          </div>

          <div className="step-content">
            <h4>{selectedTutorial.steps[currentStep].title}</h4>
            <p>{selectedTutorial.steps[currentStep].content}</p>

            {selectedTutorial.steps[currentStep].action && (
              <div className="step-action">
                <button
                  className="action-btn"
                  onClick={() => onAction(selectedTutorial.steps[currentStep].action!)}
                >
                  Try It Now
                </button>
              </div>
            )}

            {showHint && (
              <div className="step-hint">
                💡 Hint: Follow the highlighted area in the IDE
              </div>
            )}
          </div>

          <div className="step-controls">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="prev-btn"
            >
              ← Previous
            </button>

            <button
              onClick={() => setShowHint(!showHint)}
              className="hint-btn"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>

            <button onClick={nextStep} className="next-btn">
              {currentStep === selectedTutorial.steps.length - 1 ? 'Complete' : 'Next →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveTutorial;
