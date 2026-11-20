import React from 'react'

export default function ScoringAgent({ data }) {
  if (!data) return null

  const getScoreColor = (score) => {
    if (score >= 8) return 'var(--success)'
    if (score >= 6) return 'var(--warning)'
    return 'var(--error)'
  }

  const getBarGradient = (score) => {
    if (score >= 8) return 'linear-gradient(90deg, #10b981, #34d399)'
    if (score >= 6) return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
    return 'linear-gradient(90deg, #ef4444, #f87171)'
  }

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 7 · Scoring Agent</div>
        <h1>Strategy Scoring</h1>
        <p>Each strategy scored on Engagement (×0.4), Virality (×0.3), and Conversion (×0.3).</p>
      </div>

      {data.analysis_note && (
        <div style={{ padding: '14px 18px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          💡 <strong style={{ color: 'var(--accent-tertiary)' }}>Analysis: </strong>{data.analysis_note}
        </div>
      )}

      {data.strategy_scores.map((s, i) => (
        <div key={s.strategy_id} className="card mb-4 animate-slide" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: getBarGradient(s.final_score), fontWeight: 900, fontSize: 14, color: '#fff' }}>
              {s.final_score}
            </div>
            <div style={{ flex: 1 }}>
              <h2>{s.goal}</h2>
              <p>{s.strategy_id} · {s.expected_growth} · {s.timeline}</p>
            </div>
            <div className="flex gap-2">
              {s.risk_level && <span className={`badge ${s.risk_level === 'Low' ? 'badge-success' : s.risk_level === 'Medium' ? 'badge-warning' : 'badge-error'}`}>{s.risk_level} Risk</span>}
              <span className={`badge ${s.final_score >= 7.5 ? 'badge-success' : 'badge-warning'}`}>
                {s.recommendation || (s.final_score >= 7.5 ? '⭐ Top Pick' : '📊 Viable')}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="score-bar">
              <span className="score-bar-label">Engagement</span>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${s.engagement * 10}%`, background: getBarGradient(s.engagement) }} />
              </div>
              <span className="score-bar-value" style={{ color: getScoreColor(s.engagement) }}>{s.engagement}</span>
            </div>
            <div className="score-bar">
              <span className="score-bar-label">Virality</span>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${s.virality * 10}%`, background: getBarGradient(s.virality) }} />
              </div>
              <span className="score-bar-value" style={{ color: getScoreColor(s.virality) }}>{s.virality}</span>
            </div>
            <div className="score-bar">
              <span className="score-bar-label">Conversion</span>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${s.conversion * 10}%`, background: getBarGradient(s.conversion) }} />
              </div>
              <span className="score-bar-value" style={{ color: getScoreColor(s.conversion) }}>{s.conversion}</span>
            </div>

            <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Final Score = ({s.engagement}×0.4) + ({s.virality}×0.3) + ({s.conversion}×0.3)</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(s.final_score) }}>{s.final_score}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>🏆</div>
          <div><h2>Strategy Ranking</h2></div>
        </div>
        <div className="card-body">
          {data.top_strategies.map((sid, i) => {
            const s = data.strategy_scores.find(sc => sc.strategy_id === sid)
            return (
              <div key={sid} className="metric-row">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? 'var(--success)' : 'var(--text-muted)', width: 30 }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s?.goal}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sid}</div>
                  </div>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(s?.final_score || 7) }}>{s?.final_score}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
