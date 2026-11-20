// Agent 2: Content Filtering Agent

function getScoreClass(score) {
  if (score >= 85) return 'score-high';
  if (score >= 70) return 'score-mid';
  return 'score-low';
}

export function renderFilteringDetail(state) {
  const data = state.filteredContent.length ? state.filteredContent : [];

  if (!data.length) {
    return `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:0.85rem;">Waiting for content from Discovery Agent...</p>
        <p style="font-size:0.75rem;margin-top:8px;">Scoring formula: <code style="background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:4px;">Score = Relevance + Virality + Usefulness</code></p>
        <p style="font-size:0.75rem;margin-top:4px;">Ranked by: engagement potential · relevance · recency</p>
      </div>
    `;
  }

  return `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Relevance</th>
            <th>Virality</th>
            <th>Usefulness</th>
            <th>Score</th>
            <th>Engagement</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((item, i) => `
            <tr>
              <td style="font-weight:600;color:var(--text-muted);">${i + 1}</td>
              <td style="font-weight:500;min-width:180px;">${item.title}</td>
              <td>
                <div class="${getScoreClass(item.relevance)}">
                  <div style="font-size:0.72rem;margin-bottom:3px;color:var(--text-secondary);">${item.relevance}%</div>
                  <div class="score-bar"><div class="score-bar-fill" style="width:${item.relevance}%"></div></div>
                </div>
              </td>
              <td>
                <div class="${getScoreClass(item.virality)}">
                  <div style="font-size:0.72rem;margin-bottom:3px;color:var(--text-secondary);">${item.virality}%</div>
                  <div class="score-bar"><div class="score-bar-fill" style="width:${item.virality}%"></div></div>
                </div>
              </td>
              <td>
                <div class="${getScoreClass(item.usefulness)}">
                  <div style="font-size:0.72rem;margin-bottom:3px;color:var(--text-secondary);">${item.usefulness}%</div>
                  <div class="score-bar"><div class="score-bar-fill" style="width:${item.usefulness}%"></div></div>
                </div>
              </td>
              <td style="font-weight:700;font-size:0.9rem;color:var(--text-bright);">${item.totalScore.toFixed(1)}</td>
              <td><span class="meta-tag" style="color:${item.engagementPotential === 'Very High' ? 'var(--status-complete)' : 'var(--status-running)'};">${item.engagementPotential}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <p style="font-size:0.72rem;color:var(--text-muted);margin-top:10px;text-align:right;">Top ${data.length} filtered from ${state.discoveredContent.length || 8} discovered articles</p>
  `;
}
