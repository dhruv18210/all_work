import React from 'react'

export default function TrendAnalyst({ data }) {
  if (!data) return null
  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 4 · Trend Analyst Agent</div>
        <h1>Trend Analysis</h1>
        <p>Identified {data.trending_formats.length} trending formats, {data.viral_hooks.length} viral hooks, and {data.hashtag_trends.length} hashtag opportunities.</p>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>🎬</div>
          <div><h2>Trending Formats</h2><p>Content formats with highest growth right now</p></div>
        </div>
        <div className="card-body">
          {data.trending_formats.map((f, i) => (
            <div key={i} className="metric-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.format || f}</div>
                {f.tip && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>💡 {f.tip}</div>}
              </div>
              {f.growth && <span className="badge badge-success">{f.growth}</span>}
              {f.relevance && <span className={`badge ${f.relevance === 'Critical' ? 'badge-error' : f.relevance === 'High' ? 'badge-warning' : 'badge-info'}`} style={{ marginLeft: 6 }}>{f.relevance}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-4)' }}>🪝</div>
          <div><h2>Viral Hooks</h2><p>Opening lines proven to drive engagement</p></div>
        </div>
        <div className="card-body">
          {data.viral_hooks.map((h, i) => (
            <div key={i} style={{
              padding: '14px 18px',
              background: i % 2 === 0 ? 'var(--bg-glass)' : 'transparent',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-accent)', lineHeight: 1.5 }}>
                  "{h.hook || h}"
                </p>
                {h.type && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Type: {h.type}</div>}
              </div>
              {h.effectiveness && (
                <div style={{ textAlign: 'center', minWidth: 50 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: parseFloat(h.effectiveness) >= 9 ? 'var(--success)' : 'var(--warning)' }}>{h.effectiveness}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-2)' }}>#</div>
          <div><h2>Hashtag Trends</h2><p>Use these to maximize discoverability</p></div>
        </div>
        <div className="card-body">
          {data.hashtag_trends.map((item, i) => (
            <div key={i} className="metric-row">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--info)' }}>{item.tag || item}</span>
              {item.volume && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.volume}</span>}
              {item.trend && <span className={`badge ${item.trend.includes('Fast') ? 'badge-success' : item.trend === 'Rising' ? 'badge-info' : 'badge-accent'}`}>{item.trend}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
