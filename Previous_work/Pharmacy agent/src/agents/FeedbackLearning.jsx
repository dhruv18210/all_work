import React from 'react'

export default function FeedbackLearning({ data }) {
  if (!data) return null
  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 14 · Feedback Learning Agent</div>
        <h1>Feedback &amp; Learning</h1>
        <p>Predicted vs actual performance analysis complete. Here are the learnings for continuous optimization.</p>
      </div>

      {/* Prediction vs Actual */}
      {data.prediction_vs_actual && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>📊</div>
            <div><h2>Prediction vs Actual</h2></div>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-cell" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
                <div className="data-label">🎯 Predicted Score</div>
                <div className="data-value">{data.prediction_vs_actual.predicted_score}/10</div>
              </div>
              <div className="data-cell" style={{ borderLeft: '3px solid var(--success)' }}>
                <div className="data-label">📈 Actual Engagement</div>
                <div className="data-value">{data.prediction_vs_actual.actual_engagement}</div>
              </div>
              <div className="data-cell" style={{ borderLeft: '3px solid var(--warning)' }}>
                <div className="data-label">🏆 Performance Tier</div>
                <div className="data-value">Tier {data.prediction_vs_actual.performance_tier}</div>
              </div>
              <div className="data-cell" style={{ borderLeft: data.prediction_vs_actual.delta?.includes('+') ? '3px solid var(--success)' : '3px solid var(--error)' }}>
                <div className="data-label">📉 Delta</div>
                <div className="data-value" style={{ color: data.prediction_vs_actual.delta?.includes('+') ? 'var(--success)' : 'var(--error)' }}>
                  {data.prediction_vs_actual.delta} · {data.prediction_vs_actual.accuracy}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-2)' }}>🔍</div>
          <div><h2>Key Insights</h2><p>What the data tells us</p></div>
        </div>
        <div className="card-body">
          {data.insights.map((ins, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < data.insights.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              {ins.type ? (
                <>
                  <span className={`badge ${ins.impact === 'Positive' ? 'badge-success' : ins.impact === 'Critical' ? 'badge-error' : 'badge-warning'}`} style={{ minWidth: 70, justifyContent: 'center', marginTop: 2 }}>{ins.impact}</span>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins.insight}</div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Do More / Avoid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-3)' }}>✅</div>
            <div><h2>Do More Of</h2><p>Double down on these</p></div>
          </div>
          <div className="card-body">
            {data.do_more_of.map((item, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < data.do_more_of.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--success)', lineHeight: 1.6, flex: 1 }}>✦ {item.action || item}</span>
                {item.priority && <span className={`badge ${item.priority === 'Critical' ? 'badge-error' : item.priority === 'High' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: 10 }}>{item.priority}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-4)' }}>🚫</div>
            <div><h2>Avoid</h2><p>Stop doing these</p></div>
          </div>
          <div className="card-body">
            {data.avoid.map((item, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < data.avoid.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--error)', lineHeight: 1.6, flex: 1 }}>✗ {item.action || item}</span>
                {item.risk && <span className={`badge ${item.risk === 'Critical' ? 'badge-error' : item.risk === 'High' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: 10 }}>{item.risk}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {data.next_steps && (
        <div className="card mb-4 mt-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>🚀</div>
            <div><h2>Recommended Next Steps</h2></div>
          </div>
          <div className="card-body">
            {data.next_steps.map((step, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < data.next_steps.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span style={{ display: 'inline-block', width: 24, height: 24, lineHeight: '24px', borderRadius: '50%', textAlign: 'center', fontSize: 11, fontWeight: 700, background: 'var(--accent-glow)', color: 'var(--accent-tertiary)', marginRight: 10 }}>{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
