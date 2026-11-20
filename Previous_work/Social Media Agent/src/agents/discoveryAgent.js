// Agent 1: Content Discovery Agent (Dynamic niche)

export function renderDiscoveryDetail(state) {
  const data = state.discoveredContent.length ? state.discoveredContent : [];
  const niche = state.currentNiche;
  const sources = niche ? niche.sources : ['Google News', 'Twitter', 'Reddit'];
  const nicheName = niche ? niche.label : 'your niche';

  if (!data.length) {
    return `
      <div class="agent-form">
        <div class="form-group">
          <label>Niche / Topic</label>
          <input class="form-input" type="text" placeholder="e.g. ${nicheName}" value="${nicheName}" readonly />
        </div>
        <div class="form-group">
          <label>Keywords</label>
          <input class="form-input" type="text" placeholder="Auto-generated from ${nicheName}" value="trending, innovation, industry news" readonly />
        </div>
        <div class="form-group">
          <label>Sources</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
            ${sources.map(s => `<span class="meta-tag" style="cursor:default;">📰 ${s}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Source</th>
            <th>Date</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td style="font-weight:500;min-width:200px;"><a href="${item.link}" style="color:var(--accent-teal);text-decoration:none;">${item.title}</a></td>
              <td><span class="meta-tag">${item.source}</span></td>
              <td style="white-space:nowrap;color:var(--text-secondary);">${item.date}</td>
              <td style="color:var(--text-secondary);font-size:0.78rem;max-width:280px;">${item.summary}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
