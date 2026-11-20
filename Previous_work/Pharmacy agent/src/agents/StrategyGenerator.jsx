import React from 'react'

export default function StrategyGenerator({ data }) {
  if (!data) return null
  const icons = ['🎯', '🤝', '🚀']
  const gradients = ['var(--gradient-1)', 'var(--gradient-3)', 'var(--gradient-4)']

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 6 · Strategy Generator Agent</div>
        <h1>Strategy Generation</h1>
        <p>Generated {data.strategies.length} comprehensive 30-day growth strategies with weekly action plans.</p>
      </div>

      {data.strategies.map((s, i) => (
        <div key={s.strategy_id} className="card mb-4 animate-slide" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: gradients[i], fontSize: 16 }}>{icons[i]}</div>
            <div style={{ flex: 1 }}>
              <h2>{s.goal}</h2>
              <p>{s.strategy_id} · {s.posting_frequency}</p>
            </div>
            {s.risk_level && <span className={`badge ${s.risk_level === 'Low' ? 'badge-success' : s.risk_level === 'Medium' ? 'badge-warning' : 'badge-error'}`}>Risk: {s.risk_level}</span>}
          </div>
          <div className="card-body">
            {/* KPIs */}
            <div className="data-grid mb-4">
              {s.expected_growth && <div className="data-cell"><div className="data-label">📈 Expected Growth</div><div className="data-value" style={{ color: 'var(--success)' }}>{s.expected_growth}</div></div>}
              {s.expected_engagement && <div className="data-cell"><div className="data-label">💬 Target Engagement</div><div className="data-value" style={{ color: 'var(--info)' }}>{s.expected_engagement}</div></div>}
              {s.timeline && <div className="data-cell"><div className="data-label">⏱️ Timeline</div><div className="data-value">{s.timeline}</div></div>}
              {s.resource_requirement && <div className="data-cell"><div className="data-label">⏳ Time Needed</div><div className="data-value">{s.resource_requirement}</div></div>}
            </div>

            {/* Weekly Content Plan */}
            <div className="mb-4">
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-accent)', marginBottom: 12 }}>📅 Weekly Content Plan</h4>
              {s.content_plan.map((plan, j) => {
                if (typeof plan === 'string') {
                  return <div key={j} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{plan}</div>
                }
                return (
                  <div key={j} style={{ padding: '14px', background: j % 2 === 0 ? 'var(--bg-glass)' : 'transparent', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-accent">{plan.week}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.focus}</span>
                    </div>
                    {plan.actions?.map((a, k) => (
                      <div key={k} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0 3px 20px', lineHeight: 1.6 }}>→ {a}</div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Growth Tactics */}
            <div className="mb-4">
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 10 }}>📈 Growth Tactics</h4>
              {s.growth_tactics.map((t, j) => (
                <div key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0', borderBottom: j < s.growth_tactics.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--success)', marginRight: 8 }}>✦</span>{t}
                </div>
              ))}
            </div>

            {/* Differentiation */}
            <div style={{ padding: '14px 18px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-tertiary)', marginBottom: 6 }}>⚡ Differentiation</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.differentiation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
