import React from 'react'

export default function DataCollector({ data }) {
  if (!data) return null
  const audience = data.target_audience
  const audit = data.digital_presence_audit
  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 1 · Data Collector Agent</div>
        <h1>Data Collection</h1>
        <p>Extracted company bio, audited digital presence, analyzed content patterns, and identified engagement insights.</p>
      </div>

      {/* Industry Detection + Platform Audit */}
      <div className="data-grid" style={{ marginBottom: 20 }}>
        <div className="data-cell">
          <div className="data-label">🏢 Detected Industry</div>
          <div className="data-value" style={{ fontSize: 14 }}>{data.detected_industry || 'N/A'}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">🎯 Platform Focus</div>
          <div className="data-value" style={{ fontSize: 14 }}>{data.platform_focus || 'N/A'}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">📊 Content Patterns</div>
          <div className="data-value">{data.content_patterns?.length || 0} patterns</div>
        </div>
        <div className="data-cell">
          <div className="data-label">💡 Engagement Insights</div>
          <div className="data-value">{data.engagement_insights?.length || 0} insights</div>
        </div>
      </div>

      {/* Digital Presence Audit */}
      {audit && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>🔍</div>
            <div>
              <h2>Digital Presence Audit</h2>
              <p>{audit.channels_detected} channel(s) detected · Primary: {audit.primary_platform}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="data-grid" style={{ marginBottom: 12 }}>
              <div className="data-cell">
                <div className="data-label">Audience Profile</div>
                <div className="data-value" style={{ fontSize: 12 }}>{audit.platform_audience}</div>
              </div>
              <div className="data-cell">
                <div className="data-label">Avg Engagement Benchmark</div>
                <div className="data-value" style={{ fontSize: 12 }}>{audit.avg_engagement_benchmark}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
              <strong style={{ color: 'var(--accent-secondary)' }}>Audience Behavior:</strong> {audit.audience_behavior}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
              💡 {audit.algorithm_notes}
            </p>
          </div>
        </div>
      )}

      {/* Platforms Found */}
      {data.platforms_found && data.platforms_found.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>🌐</div>
            <div><h2>Platforms Detected</h2><p>Active channels identified from social links</p></div>
          </div>
          <div className="card-body">
            {data.platforms_found.map((p, i) => (
              <div key={i} className="metric-row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.platform}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.analysis}</div>
                </div>
                <span className="badge badge-success">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand Summary */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-2)' }}>📋</div>
          <div><h2>Brand Summary</h2></div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>{data.brand_summary}</p>
        </div>
      </div>

      {/* Target Audience */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-3)' }}>🎯</div>
          <div><h2>Target Audience</h2><p>Who your content should reach</p></div>
        </div>
        <div className="card-body">
          <div className="data-grid" style={{ marginBottom: 16 }}>
            <div className="data-cell">
              <div className="data-label">Primary Segment</div>
              <div className="data-value" style={{ fontSize: 13 }}>{audience.primary}</div>
            </div>
            <div className="data-cell">
              <div className="data-label">Demographics</div>
              <div className="data-value" style={{ fontSize: 13 }}>{audience.demographics}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}><strong style={{ color: 'var(--text-secondary)' }}>Psychographics:</strong> {audience.psychographics}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
            <div>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--error)' }}>😣 Pain Points</div>
              {audience.pain_points?.map((p, i) => <div key={i} className="tag" style={{ borderColor: 'var(--error-glow)' }}>{p}</div>)}
            </div>
            <div>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--info)' }}>📝 Content Wants</div>
              {audience.content_preferences?.map((p, i) => <div key={i} className="tag" style={{ borderColor: 'var(--info-glow)' }}>{p}</div>)}
            </div>
            <div>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--success)' }}>🛒 Buying Triggers</div>
              {audience.buying_triggers?.map((p, i) => <div key={i} className="tag" style={{ borderColor: 'var(--success-glow)' }}>{p}</div>)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Patterns with WHY */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>📊</div>
          <div><h2>Content Patterns</h2><p>Performance analysis of content types</p></div>
        </div>
        <div className="card-body">
          {data.content_patterns.map((p, i) => (
            <div key={i} className="metric-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.type || p}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.performance && <span className={`badge ${p.performance === 'VERY HIGH' || p.performance === 'CRITICAL' || p.performance === 'HIGH' ? 'badge-success' : 'badge-warning'}`}>{p.performance}</span>}
                  {p.frequency && <span className="badge badge-accent">{p.frequency}</span>}
                </div>
              </div>
              {p.metric && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>📈 {p.metric}</div>}
              {p.why && <div style={{ fontSize: 11, color: 'var(--accent-tertiary)', marginTop: 3, fontStyle: 'italic' }}>💡 {p.why}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-4)' }}>💡</div>
          <div><h2>Engagement Insights</h2><p>Data-driven findings with actionable recommendations</p></div>
        </div>
        <div className="card-body">
          {data.engagement_insights.map((ins, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < data.engagement_insights.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins.insight || ins}</div>
              {ins.actionable && (
                <div style={{ fontSize: 12, color: 'var(--accent-tertiary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`badge ${ins.impact === 'Critical' ? 'badge-error' : 'badge-warning'}`}>{ins.impact}</span>
                  → {ins.actionable}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
