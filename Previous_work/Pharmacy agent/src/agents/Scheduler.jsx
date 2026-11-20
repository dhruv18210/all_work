import React from 'react'

export default function Scheduler({ data }) {
  if (!data) return null
  const { schedule } = data
  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 12 · Scheduler Agent</div>
        <h1>Posting Schedule</h1>
        <p>Optimized posting calendar based on platform analytics and audience behavior patterns.</p>
      </div>

      <div className="data-grid">
        <div className="data-cell" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <div className="data-label">⏰ Best Times</div>
          <div className="data-value" style={{ fontSize: 13 }}>{schedule.best_times.join(', ')}</div>
        </div>
        <div className="data-cell" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="data-label">📅 Best Days</div>
          <div className="data-value" style={{ fontSize: 13 }}>{schedule.best_days.join(', ')}</div>
        </div>
        {schedule.worst_times && (
          <div className="data-cell" style={{ borderLeft: '3px solid var(--error)' }}>
            <div className="data-label">🚫 Avoid These Times</div>
            <div className="data-value" style={{ fontSize: 13 }}>{schedule.worst_times.join(', ')}</div>
          </div>
        )}
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>📋</div>
          <div>
            <h2>Posting Plan Overview</h2>
            <p>Your optimized weekly strategy</p>
          </div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>{schedule.posting_plan}</p>
        </div>
      </div>

      {schedule.weekly_schedule && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-3)' }}>📆</div>
            <div><h2>Weekly Content Calendar</h2><p>Day-by-day breakdown</p></div>
          </div>
          <div className="card-body">
            {schedule.weekly_schedule.map((day, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                background: i % 2 === 0 ? 'var(--bg-glass)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16
              }}>
                <div style={{ minWidth: 90 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{day.day}</div>
                  <div style={{ fontSize: 11, color: 'var(--accent-tertiary)' }}>{day.time}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{day.content}</div>
                </div>
                <span className="badge badge-accent" style={{ fontSize: 10 }}>{day.format}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
