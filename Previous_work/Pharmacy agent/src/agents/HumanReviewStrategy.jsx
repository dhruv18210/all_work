import React, { useState } from 'react'

export default function HumanReviewStrategy({ strategies, scores, onApprove }) {
  const [decisions, setDecisions] = useState({})
  const [modifications, setModifications] = useState({})

  if (!strategies || !scores) return null

  const handleDecision = (sid, decision) => {
    setDecisions(prev => ({ ...prev, [sid]: decision }))
  }

  const handleModification = (sid, text) => {
    setModifications(prev => ({ ...prev, [sid]: text }))
  }

  const handleSubmit = () => {
    const approved = strategies.filter(s => decisions[s.strategy_id] === 'accept' || decisions[s.strategy_id] === 'modify')
      .map(s => {
        if (decisions[s.strategy_id] === 'modify' && modifications[s.strategy_id]) {
          return { ...s, modification_notes: modifications[s.strategy_id] }
        }
        return s
      })
    onApprove(approved)
  }

  const allDecided = strategies.every(s => decisions[s.strategy_id])
  const approvedCount = strategies.filter(s => decisions[s.strategy_id] === 'accept' || decisions[s.strategy_id] === 'modify').length

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 8 · Human Review</div>
        <h1>Strategy Review</h1>
        <p>Review each strategy. Accept, reject, or modify before proceeding to creative generation.</p>
      </div>

      <div className="data-grid mb-4">
        <div className="data-cell">
          <div className="data-label">Strategies to Review</div>
          <div className="data-value">{strategies.length}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">Approved So Far</div>
          <div className="data-value text-success">{approvedCount}</div>
        </div>
      </div>

      {strategies.map((s, i) => {
        const score = scores.find(sc => sc.strategy_id === s.strategy_id)
        const decision = decisions[s.strategy_id]
        return (
          <div
            key={s.strategy_id}
            className={`review-item ${decision === 'accept' ? 'accepted' : decision === 'reject' ? 'rejected' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{s.goal}</h3>
              <div className="flex gap-2 items-center">
                {score && (
                  <span className="badge badge-accent">Score: {score.final_score}</span>
                )}
                {decision && (
                  <span className={`badge ${decision === 'accept' ? 'badge-success' : decision === 'reject' ? 'badge-error' : 'badge-warning'}`}>
                    {decision === 'accept' ? '✓ Accepted' : decision === 'reject' ? '✗ Rejected' : '✎ Modified'}
                  </span>
                )}
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
              {s.strategy_id} · {s.posting_frequency}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12 }}>
              {s.differentiation}
            </p>

            {decision === 'modify' && (
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Modification Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your changes..."
                  value={modifications[s.strategy_id] || ''}
                  onChange={e => handleModification(s.strategy_id, e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <div className="review-status">
              <button
                className={`btn btn-sm ${decision === 'accept' ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => handleDecision(s.strategy_id, 'accept')}
              >
                ✓ Accept
              </button>
              <button
                className={`btn btn-sm ${decision === 'modify' ? 'btn-warning' : 'btn-ghost'}`}
                onClick={() => handleDecision(s.strategy_id, 'modify')}
              >
                ✎ Modify
              </button>
              <button
                className={`btn btn-sm ${decision === 'reject' ? 'btn-danger' : 'btn-ghost'}`}
                onClick={() => handleDecision(s.strategy_id, 'reject')}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        )
      })}

      <div className="actions-bar">
        <button
          className="btn btn-primary btn-lg"
          disabled={!allDecided || approvedCount === 0}
          onClick={handleSubmit}
        >
          ⚡ Proceed with {approvedCount} Approved {approvedCount === 1 ? 'Strategy' : 'Strategies'}
        </button>
        {!allDecided && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
            Review all strategies to proceed
          </span>
        )}
      </div>
    </div>
  )
}
