import React from 'react'

export default function MemoryStorage({ data, fullPipeline }) {
  if (!data) return null
  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 15 · Memory Storage Agent</div>
        <h1>Memory Storage</h1>
        <p>All strategies, content, performance data, and learnings have been persisted for future optimization.</p>
      </div>

      <div className="card mb-4">
        <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--success)' }}>
            {data.status === 'stored successfully' ? 'Pipeline Complete — Memory Stored' : data.status}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            All pipeline data has been saved to local memory and will be automatically retrieved on your next run for continuous improvement.
          </p>
        </div>
      </div>

      <div className="data-grid mb-4">
        <div className="data-cell" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="data-label">💾 Status</div>
          <div className="data-value text-success">Stored Successfully</div>
        </div>
        <div className="data-cell" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <div className="data-label">📦 Steps Completed</div>
          <div className="data-value">15 / 15</div>
        </div>
        <div className="data-cell" style={{ borderLeft: '3px solid var(--info)' }}>
          <div className="data-label">🤖 Agents Used</div>
          <div className="data-value">14 agents</div>
        </div>
        <div className="data-cell" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="data-label">📅 Saved At</div>
          <div className="data-value" style={{ fontSize: 12 }}>{new Date().toLocaleString()}</div>
        </div>
      </div>

      {fullPipeline && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--gradient-1)' }}>📥</div>
            <div>
              <h2>Export Pipeline Output</h2>
              <p>Download or copy the complete structured output from all 15 steps</p>
            </div>
          </div>
          <div className="card-body">
            <div className="flex gap-3">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(fullPipeline, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'growth_intelligence_output.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                📥 Download Full JSON
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(fullPipeline, null, 2))
                  alert('Full pipeline JSON copied to clipboard!')
                }}
              >
                📋 Copy to Clipboard
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              The JSON file contains all {Object.keys(fullPipeline).length} steps with complete outputs.
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: 'var(--gradient-3)' }}>🔄</div>
          <div><h2>What Happens Next</h2></div>
        </div>
        <div className="card-body">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 12 }}>Your growth intelligence data is now stored in local memory. On your next pipeline run:</p>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--success)', marginRight: 8 }}>✦</span>
              <strong>Memory Retrieval Agent</strong> (Step 5) will automatically load your past strategies, top-performing content types, and optimal posting times.
            </div>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--success)', marginRight: 8 }}>✦</span>
              <strong>Strategy Generator</strong> (Step 6) will use past performance data to generate smarter, more targeted strategies.
            </div>
            <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--success)', marginRight: 8 }}>✦</span>
              <strong>Feedback Learning Agent</strong> (Step 14) will compare predictions vs actuals over time to continuously improve accuracy.
            </div>
            <div style={{ padding: '10px 0' }}>
              <span style={{ color: 'var(--success)', marginRight: 8 }}>✦</span>
              <strong>Each run gets smarter</strong> — the system learns from what worked and what didn't.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
