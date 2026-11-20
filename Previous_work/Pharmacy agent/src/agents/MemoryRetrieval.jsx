import React from 'react'

export default function MemoryRetrieval({ data }) {
  if (!data) return null

  const sections = [
    { key: 'top_strategies', label: 'Top Strategies', icon: '♟️', badge: 'badge-accent', color: 'var(--accent-tertiary)' },
    { key: 'top_content_types', label: 'Top Content Types', icon: '📝', badge: 'badge-info', color: 'var(--info)' },
    { key: 'best_posting_times', label: 'Best Posting Times', icon: '⏰', badge: 'badge-success', color: 'var(--success)' },
    { key: 'failures_to_avoid', label: 'Failures to Avoid', icon: '🚫', badge: 'badge-error', color: 'var(--error)' },
  ]

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 5 · Memory Retrieval Agent</div>
        <h1>Memory Retrieval</h1>
        <p>{data.has_history ? `Found data from ${data.sessions_count} previous session(s). Last run: ${data.last_session}` : 'No previous history found — building strategy from industry benchmarks.'}</p>
      </div>

      <div className="data-grid">
        <div className="data-cell">
          <div className="data-label">💾 History Status</div>
          <div className="data-value" style={{ color: data.has_history ? 'var(--success)' : 'var(--warning)' }}>
            {data.has_history ? 'Previous data found' : 'First run — fresh start'}
          </div>
        </div>
        <div className="data-cell">
          <div className="data-label">📊 Sessions</div>
          <div className="data-value">{data.sessions_count || 0}</div>
        </div>
      </div>

      {sections.map(s => (
        <div key={s.key} className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-1)', fontSize: 16 }}>{s.icon}</div>
            <div><h2>{s.label}</h2></div>
          </div>
          <div className="card-body">
            {data[s.key]?.map((item, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < data[s.key].length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span style={{ display: 'inline-block', width: 24, height: 24, lineHeight: '24px', borderRadius: '50%', textAlign: 'center', fontSize: 11, fontWeight: 700, background: 'var(--bg-glass)', border: '1px solid var(--border)', marginRight: 10, color: s.color }}>{i + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
