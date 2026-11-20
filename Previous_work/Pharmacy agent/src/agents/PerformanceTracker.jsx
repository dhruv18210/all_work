import React, { useState } from 'react'

export default function PerformanceTracker({ onSubmit, data }) {
  const [metrics, setMetrics] = useState({ likes: '', comments: '', shares: '', impressions: '' })

  const handleChange = (e) => {
    setMetrics(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      likes: parseInt(metrics.likes) || 0,
      comments: parseInt(metrics.comments) || 0,
      shares: parseInt(metrics.shares) || 0,
      impressions: parseInt(metrics.impressions) || 1
    })
  }

  if (!data) {
    return (
      <div className="animate-in">
        <div className="step-header">
          <div className="step-tag">Step 13 · Performance Tracker Agent</div>
          <h1>Performance Tracking</h1>
          <p>Input your post metrics to calculate engagement rates and benchmark against industry standards.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>📊</div>
            <div><h2>Enter Post Metrics</h2><p>Input real or estimated numbers from your latest post</p></div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="data-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label htmlFor="perf-likes">❤️ Likes</label>
                  <input id="perf-likes" name="likes" type="number" className="form-input" placeholder="e.g., 245" value={metrics.likes} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="perf-comments">💬 Comments</label>
                  <input id="perf-comments" name="comments" type="number" className="form-input" placeholder="e.g., 38" value={metrics.comments} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="perf-shares">🔄 Shares</label>
                  <input id="perf-shares" name="shares" type="number" className="form-input" placeholder="e.g., 12" value={metrics.shares} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="perf-impressions">👁️ Impressions</label>
                  <input id="perf-impressions" name="impressions" type="number" className="form-input" placeholder="e.g., 5000" value={metrics.impressions} onChange={handleChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full">📈 Calculate Engagement Rate</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const perf = data.performance

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 13 · Performance Tracker Agent</div>
        <h1>Performance Results</h1>
        <p>Post {perf.post_id} — Engagement analysis complete.</p>
      </div>

      {/* Big Engagement Rate */}
      <div className="card mb-4">
        <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Engagement Rate</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: perf.color }}>{perf.engagement_rate}%</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className={`badge ${perf.engagement_rate > 3 ? 'badge-success' : perf.engagement_rate > 1 ? 'badge-warning' : 'badge-error'}`}>
              Tier {perf.tier}
            </span>
            <span className="badge badge-accent">{perf.benchmark}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="data-grid mb-4">
        <div className="data-cell"><div className="data-label">❤️ Likes</div><div className="data-value">{perf.likes.toLocaleString()}</div></div>
        <div className="data-cell"><div className="data-label">💬 Comments</div><div className="data-value">{perf.comments.toLocaleString()}</div></div>
        <div className="data-cell"><div className="data-label">🔄 Shares</div><div className="data-value">{perf.shares.toLocaleString()}</div></div>
        <div className="data-cell"><div className="data-label">👁️ Impressions</div><div className="data-value">{perf.impressions.toLocaleString()}</div></div>
        <div className="data-cell"><div className="data-label">📊 Total Engagements</div><div className="data-value">{perf.total_engagements?.toLocaleString()}</div></div>
        <div className="data-cell"><div className="data-label">🔄 Share Rate</div><div className="data-value">{perf.share_rate}%</div></div>
      </div>

      {/* Insights */}
      {perf.insights && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-2)' }}>🔍</div>
            <div><h2>Performance Insights</h2><p>What the numbers tell us</p></div>
          </div>
          <div className="card-body">
            {perf.insights.map((ins, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < perf.insights.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {ins}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
