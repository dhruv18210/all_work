import React from 'react'

const STEPS = [
  { num: 1, label: 'Data Collection', agent: 'Data Collector Agent', icon: '📊' },
  { num: 2, label: 'Industry Analysis', agent: 'Industry Analyst Agent', icon: '🏭' },
  { num: 3, label: 'Competitor Intel', agent: 'Competitor Intelligence Agent', icon: '🎯' },
  { num: 4, label: 'Trend Analysis', agent: 'Trend Analyst Agent', icon: '📈' },
  { num: 5, label: 'Memory Retrieval', agent: 'Memory Retrieval Agent', icon: '🧠' },
  { num: 6, label: 'Strategy Generation', agent: 'Strategy Generator Agent', icon: '♟️' },
  { num: 7, label: 'Strategy Scoring', agent: 'Scoring Agent', icon: '⚡' },
  { num: 8, label: 'Strategy Review', agent: 'Human Review', icon: '👤' },
  { num: 9, label: 'Creative Content', agent: 'Creative Agent', icon: '🎨' },
  { num: 10, label: 'Platform Adapt', agent: 'Platform Adaptation Agent', icon: '📱' },
  { num: 11, label: 'Content Review', agent: 'Human Review', icon: '👁️' },
  { num: 12, label: 'Scheduling', agent: 'Scheduler Agent', icon: '📅' },
  { num: 13, label: 'Performance', agent: 'Performance Tracker Agent', icon: '📉' },
  { num: 14, label: 'Feedback', agent: 'Feedback Learning Agent', icon: '🔄' },
  { num: 15, label: 'Memory Storage', agent: 'Memory Storage Agent', icon: '💾' },
]

export default function StepStepper({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.num)
        const isActive = step.num === currentStep
        const className = `step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`

        return (
          <div
            key={step.num}
            className={className}
            onClick={() => onStepClick(step.num)}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="step-number">
              {isCompleted ? '✓' : step.num}
            </div>
            {i < STEPS.length - 1 && <div className="step-line" />}
            <div className="step-info">
              <div className="step-label">
                {step.icon} {step.label}
              </div>
              <div className="step-agent">{step.agent}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
