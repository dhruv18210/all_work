import React from 'react'

export default function CompetitorIntel({ data }) {
  if (!data) return null
  const summary = data.competitive_summary
  const swot = data.swot_for_entry

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 3 · Competitor Intelligence Agent</div>
        <h1>Competitor Intelligence</h1>
        <p>Analyzed top competitors, identified their strengths/weaknesses, and found the market gap.</p>
        {data.industry_context && <p style={{ fontSize: 13, color: 'var(--accent-secondary)', marginTop: 4 }}>Context: {data.industry_context}</p>}
      </div>

      {summary && (
        <div className="data-grid mb-4">
          <div className="data-cell">
            <div className="data-label">Avg Engagement</div>
            <div className="data-value" style={{ color: 'var(--success)' }}>{summary.avg_engagement}</div>
          </div>
          <div className="data-cell">
            <div className="data-label">Avg Followers</div>
            <div className="data-value">{summary.avg_followers}</div>
          </div>
          <div className="data-cell">
            <div className="data-label">Engagement Leader</div>
            <div className="data-value" style={{ fontSize: 13 }}>{summary.engagement_leader}</div>
          </div>
        </div>
      )}

      {/* Market Gap */}
      <div className="card mb-4" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>🎯</div>
          <div><h2>The Market Gap</h2><p>Your unique positioning opportunity</p></div>
        </div>
        <div className="card-body">
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>{data.market_gap.opportunity}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 12 }}>{data.market_gap.detail}</p>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', borderRadius: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strategy</span>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.5 }}>{data.market_gap.strategy}</p>
          </div>
          <div style={{ fontSize: 12, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            📈 <strong>Impact:</strong> {data.market_gap.estimated_impact}
          </div>
        </div>
      </div>

      {/* SWOT for Entry */}
      {swot && (
        <div className="card mb-4" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>🔥</div>
            <div><h2>SWOT Analysis for Entry</h2><p>Strategic landscape for your brand</p></div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>S - Strengths to Leverage</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {swot.strengths.map((s, i) => <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{s}</li>)}
                </ul>
              </div>
              <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                <div style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>W - Weaknesses to Mitigate</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {swot.weaknesses.map((w, i) => <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{w}</li>)}
                </ul>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                <div style={{ color: 'var(--info)', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>O - Opportunities to Capture</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {swot.opportunities.map((o, i) => <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{o}</li>)}
                </ul>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: 12, borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <div style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>T - Threats to Monitor</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {swot.threats.map((t, i) => <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t}</li>)}
                </ul>
              </div>
            </div>
            {summary && summary.content_gap && (
              <div style={{ fontSize: 12, color: 'var(--accent-tertiary)', marginTop: 12, fontStyle: 'italic', textAlign: 'center' }}>
                💡 Key Finding: {summary.content_gap}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Competitors List */}
      <h3 style={{ fontSize: 15, marginBottom: 12, color: 'var(--text-secondary)' }}>Top Competitors Analysis</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        {data.competitors.map((comp, i) => (
          <div key={i} className="card">
            <div className="card-header" style={{ paddingBottom: 12 }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {comp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, color: '#fff' }}>{comp.name}</h3>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {comp.top_platform} · {comp.content_frequency}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{comp.followers}</div>
                  <div style={{ fontSize: 11, color: 'var(--success)' }}>{comp.engagement_rate} ER</div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>STRENGTHS</div>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {comp.strengths.map((s, idx) => <li key={idx} style={{ marginBottom: 4 }}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--error)', marginBottom: 6 }}>WEAKNESSES</div>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {comp.weaknesses.map((w, idx) => <li key={idx} style={{ marginBottom: 4 }}>{w}</li>)}
                  </ul>
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Content Quality: <strong>{comp.content_quality || 'Standard'}</strong></span>
                <span className={`badge ${comp.threat_level?.includes('High') ? 'badge-error' : 'badge-warning'}`}>
                  Threat: {comp.threat_level}
                </span>
              </div>
              {comp.top_performing_content && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  🔥 Best piece: {comp.top_performing_content}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
