import React, { useState } from 'react'

export default function HumanReviewContent({ platformData, onApprove }) {
  const [decisions, setDecisions] = useState({})

  if (!platformData) return null

  const allContent = [
    ...(platformData.linkedin || []).map(c => ({ ...c, platform: 'LinkedIn' })),
    ...(platformData.instagram || []).map(c => ({ ...c, platform: 'Instagram' })),
    ...(platformData.twitter || []).map(c => ({ ...c, platform: 'Twitter' })),
  ]

  const handleDecision = (index, decision) => {
    setDecisions(prev => ({ ...prev, [index]: decision }))
  }

  const handleSubmit = () => {
    const approved = allContent.filter((_, i) => decisions[i] === 'accept')
    onApprove(approved)
  }

  const allDecided = allContent.every((_, i) => decisions[i])
  const acceptedCount = Object.values(decisions).filter(d => d === 'accept').length

  return (
    <div className="animate-in">
      <div className="step-header">
        <div className="step-tag">Step 11 · Human Review</div>
        <h1>Content Review</h1>
        <p>Review the adapted content for each platform. Accept or reject each piece.</p>
      </div>

      <div className="data-grid mb-4">
        <div className="data-cell">
          <div className="data-label">Content Pieces</div>
          <div className="data-value">{allContent.length}</div>
        </div>
        <div className="data-cell">
          <div className="data-label">Accepted</div>
          <div className="data-value text-success">{acceptedCount}</div>
        </div>
      </div>

      {allContent.map((content, i) => {
        const decision = decisions[i]
        const platformClass = content.platform.toLowerCase()
        return (
          <div
            key={i}
            className={`review-item ${decision === 'accept' ? 'accepted' : decision === 'reject' ? 'rejected' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`platform-badge platform-${platformClass}`}>
                {content.platform} · {content.strategy_id}
              </div>
              {decision && (
                <span className={`badge ${decision === 'accept' ? 'badge-success' : 'badge-error'}`}>
                  {decision === 'accept' ? '✓ Approved' : '✗ Rejected'}
                </span>
              )}
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Format: {content.format || content.thread ? 'Thread' : 'Post'}
            </p>

            <div className="review-status">
              <button
                className={`btn btn-sm ${decision === 'accept' ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => handleDecision(i, 'accept')}
              >
                ✓ Accept
              </button>
              <button
                className={`btn btn-sm ${decision === 'reject' ? 'btn-danger' : 'btn-ghost'}`}
                onClick={() => handleDecision(i, 'reject')}
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
          disabled={!allDecided || acceptedCount === 0}
          onClick={handleSubmit}
        >
          ✓ Finalize {acceptedCount} Content {acceptedCount === 1 ? 'Piece' : 'Pieces'}
        </button>
      </div>
    </div>
  )
}
