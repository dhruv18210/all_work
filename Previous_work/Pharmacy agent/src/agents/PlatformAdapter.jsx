import React, { useState } from 'react'

export default function PlatformAdapter({ data }) {
  const [activeTab, setActiveTab] = useState('linkedin')

  if (!data) return null

  const tabs = [
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077b5' },
    { key: 'instagram', label: 'Instagram', icon: '📸', color: '#e1306c' },
    { key: 'twitter', label: 'Twitter (X)', icon: '🐦', color: '#1da1f2' },
  ]

  const renderLinkedIn = (items) => items.map((item, i) => (
    <div key={i} className="content-preview" style={{ marginBottom: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="platform-badge platform-linkedin">💼 LinkedIn · {item.strategy_id}</div>
        {item.best_time && <span className="tag">⏰ {item.best_time}</span>}
      </div>
      <div className="data-grid mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="data-cell"><div className="data-label">Format</div><div className="data-value" style={{ fontSize: 12 }}>{item.format}</div></div>
        <div className="data-cell"><div className="data-label">Optimal Length</div><div className="data-value" style={{ fontSize: 12 }}>{item.optimal_length}</div></div>
      </div>
      <div className="mb-3">
        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>🎯 Tone</div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.tone}</p>
      </div>
      <div className="mb-3">
        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>✍️ Caption Preview</div>
        <div style={{ padding: 14, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', maxHeight: 200, overflow: 'auto' }}>{item.caption}</div>
      </div>
      {item.pro_tips && (
        <div>
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--success)' }}>💡 Pro Tips</div>
          {item.pro_tips.map((tip, j) => <div key={j} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 0' }}>→ {tip}</div>)}
        </div>
      )}
      <div className="mt-2">
        {(item.hashtags || []).map((tag, j) => <span key={j} className="tag" style={{ fontSize: 11, color: 'var(--info)' }}>{typeof tag === 'string' ? tag : ''}</span>)}
      </div>
    </div>
  ))

  const renderInstagram = (items) => items.map((item, i) => (
    <div key={i} className="content-preview" style={{ marginBottom: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="platform-badge platform-instagram">📸 Instagram · {item.strategy_id}</div>
        {item.best_time && <span className="tag">⏰ {item.best_time}</span>}
      </div>
      <div className="data-grid mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="data-cell"><div className="data-label">Format</div><div className="data-value" style={{ fontSize: 12 }}>{item.format}</div></div>
        <div className="data-cell"><div className="data-label">Optimal Length</div><div className="data-value" style={{ fontSize: 12 }}>{item.optimal_length}</div></div>
      </div>
      <div className="mb-3">
        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>🎯 Tone</div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.tone}</p>
      </div>
      <div className="mb-3">
        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>✍️ Caption Preview</div>
        <div style={{ padding: 14, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', maxHeight: 200, overflow: 'auto' }}>{item.caption}</div>
      </div>
      {item.pro_tips && (
        <div>
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--success)' }}>💡 Pro Tips</div>
          {item.pro_tips.map((tip, j) => <div key={j} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 0' }}>→ {tip}</div>)}
        </div>
      )}
      <div className="mt-2">
        {(item.hashtags || []).map((tag, j) => <span key={j} className="tag" style={{ fontSize: 11, color: '#e1306c' }}>{typeof tag === 'string' ? tag : ''}</span>)}
      </div>
    </div>
  ))

  const renderTwitter = (items) => items.map((item, i) => (
    <div key={i} className="content-preview" style={{ marginBottom: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="platform-badge platform-twitter">🐦 Twitter · {item.strategy_id}</div>
        {item.best_time && <span className="tag">⏰ {item.best_time}</span>}
      </div>
      <div className="data-grid mb-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="data-cell"><div className="data-label">Format</div><div className="data-value" style={{ fontSize: 12 }}>{item.format}</div></div>
        <div className="data-cell"><div className="data-label">Optimal Length</div><div className="data-value" style={{ fontSize: 12 }}>{item.optimal_length}</div></div>
      </div>
      <div className="mb-3">
        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>🧵 Thread Preview</div>
        {item.thread.map((tweet, j) => (
          <div key={j} style={{
            padding: '12px 16px',
            background: j === 0 ? 'rgba(29,161,242,0.08)' : j % 2 === 0 ? 'var(--bg-glass)' : 'transparent',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: j === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: j === 0 ? 600 : 400,
            marginBottom: 4,
            borderLeft: j === 0 ? '3px solid #1da1f2' : '3px solid var(--border)',
            lineHeight: 1.6
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginRight: 8, fontWeight: 700 }}>{j + 1}/{item.thread.length}</span>
            {tweet}
          </div>
        ))}
      </div>
      {item.pro_tips && (
        <div>
          <div className="text-sm font-bold mb-2" style={{ color: 'var(--success)' }}>💡 Pro Tips</div>
          {item.pro_tips.map((tip, j) => <div key={j} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 0' }}>→ {tip}</div>)}
        </div>
      )}
    </div>
  ))

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 10 · Platform Adaptation Agent</div>
        <h1>Platform Adaptation</h1>
        <p>Content adapted for each platform's format, tone, and audience behavior.</p>
      </div>

      <div className="platform-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`platform-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? { background: tab.color } : {}}
          >
            {tab.icon} {tab.label} ({data[tab.key]?.length || 0})
          </button>
        ))}
      </div>

      {activeTab === 'linkedin' && renderLinkedIn(data.linkedin || [])}
      {activeTab === 'instagram' && renderInstagram(data.instagram || [])}
      {activeTab === 'twitter' && renderTwitter(data.twitter || [])}
    </div>
  )
}
