import React from 'react'

export default function IndustryAnalyst({ data }) {
  if (!data) return null
  const icp = data.ICP || {}
  const ml = data.market_landscape
  const cl = data.content_landscape
  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 2 · Industry Analyst Agent</div>
        <h1>Industry Analysis</h1>
        <p>Analyzed market size, growth trajectory, competitive landscape, and identified the ideal customer profile for {data.industry}.</p>
      </div>

      <div className="data-grid">
        <div className="data-cell">
          <div className="data-label">🏭 Industry</div>
          <div className="data-value" style={{ fontSize: 14 }}>{data.industry}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">💰 Market Size</div>
          <div className="data-value" style={{ fontSize: 14 }}>{data.industry_size}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">📈 Growth Rate</div>
          <div className="data-value" style={{ fontSize: 14, color: 'var(--success)' }}>{data.growth_rate}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">🎯 Sub-niche</div>
          <div className="data-value" style={{ fontSize: 13 }}>{data.sub_niche}</div>
        </div>
      </div>

      {/* Sub-niche Detail */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>🔬</div>
          <div><h2>Sub-Niche Analysis</h2></div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>{data.sub_niche_detail}</p>
        </div>
      </div>

      {/* Market Landscape - NEW */}
      {ml && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>🌍</div>
            <div><h2>Market Landscape</h2><p>Total addressable market and growth drivers</p></div>
          </div>
          <div className="card-body">
            <div className="data-grid" style={{ marginBottom: 16 }}>
              <div className="data-cell">
                <div className="data-label">Total Addressable Market</div>
                <div className="data-value" style={{ fontSize: 14 }}>{ml.total_addressable}</div>
              </div>
              <div className="data-cell">
                <div className="data-label">Serviceable Market</div>
                <div className="data-value" style={{ fontSize: 14 }}>{ml.serviceable_addressable}</div>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid var(--success)', borderRadius: 6, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📈 Growth Driver</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ml.growth_driver}</div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(99, 102, 241, 0.08)', borderLeft: '3px solid var(--accent-primary)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>🔑 Key Market Shift</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ml.key_shift}</div>
            </div>
          </div>
        </div>
      )}

      {/* Content Landscape - NEW */}
      {cl && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f43f5e)' }}>📰</div>
            <div><h2>Content Landscape</h2><p>Content saturation and opportunity analysis</p></div>
          </div>
          <div className="card-body">
            <div className="metric-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Saturation Level</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cl.saturation_level}</div>
              </div>
            </div>
            <div className="metric-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>🎯 Opportunity</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{cl.opportunity}</div>
              </div>
            </div>
            <div className="metric-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Winning Format</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cl.winning_format}</div>
              </div>
            </div>
            <div className="metric-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Audience Expectation</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cl.audience_expectation}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Trends */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>📊</div>
          <div><h2>Market Trends</h2><p>Industry-specific and cross-industry trends</p></div>
        </div>
        <div className="card-body">
          {data.market_trends?.map((t, i) => (
            <div key={i} className="metric-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.trend}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>💡 {t.impact}</div>
              </div>
              <span className={`badge ${t.direction === 'UP' ? 'badge-success' : 'badge-error'}`}>
                {t.direction === 'UP' ? '↑ Rising' : '↓ Declining'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ideal Customer Profile */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-3)' }}>👤</div>
          <div><h2>{icp.title || 'Ideal Customer Profile'}</h2></div>
        </div>
        <div className="card-body">
          <div className="data-grid" style={{ marginBottom: 16 }}>
            <div className="data-cell"><div className="data-label">Role</div><div className="data-value" style={{ fontSize: 12 }}>{icp.role}</div></div>
            <div className="data-cell"><div className="data-label">Company Size</div><div className="data-value" style={{ fontSize: 12 }}>{icp.company_size}</div></div>
            <div className="data-cell"><div className="data-label">Age Range</div><div className="data-value" style={{ fontSize: 12 }}>{icp.age_range}</div></div>
            <div className="data-cell"><div className="data-label">Budget Range</div><div className="data-value" style={{ fontSize: 12 }}>{icp.annual_budget}</div></div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}><strong>Decision Process:</strong> {icp.decision_process}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--success)' }}>🎯 Goals</div>
              {icp.goals?.map((g, i) => <div key={i} className="tag" style={{ borderColor: 'var(--success-glow)' }}>{g}</div>)}
            </div>
            <div>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--error)' }}>😤 Frustrations</div>
              {icp.frustrations?.map((f, i) => <div key={i} className="tag" style={{ borderColor: 'var(--error-glow)' }}>{f}</div>)}
            </div>
            <div>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--info)' }}>📍 Where They Are</div>
              {icp.where_they_hang_out?.map((w, i) => <div key={i} className="tag" style={{ borderColor: 'var(--info-glow)' }}>{w}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
