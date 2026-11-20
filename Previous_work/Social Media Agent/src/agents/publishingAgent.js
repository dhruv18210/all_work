// Agent 7: Publishing Agent

export function renderPublishingDetail(state) {
  const data = state.publishResults.length ? state.publishResults : [];

  if (!data.length) {
    return `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:0.85rem;">Waiting for scheduled posts to publish...</p>
        <p style="font-size:0.75rem;margin-top:8px;">Posts content + image · confirms success/failure</p>
        <p style="font-size:0.75rem;margin-top:4px;">Platforms: LinkedIn · Instagram · X · Facebook</p>
        <p style="font-size:0.75rem;margin-top:4px;">Updates sheet: Status → Posted</p>
      </div>
    `;
  }

  return `
    <div style="margin-bottom:12px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:0.75rem;color:var(--text-secondary);">📤 Posts content + image</span>
      <span style="font-size:0.75rem;color:var(--text-secondary);">✅ Confirms success/failure</span>
      <span style="font-size:0.75rem;color:var(--text-secondary);">📝 Updates sheet: Status → Posted</span>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <span class="platform-badge linkedin">💼 LinkedIn</span>
      <span class="platform-badge instagram">📸 Instagram</span>
      <span class="platform-badge twitter">🐦 X (Twitter)</span>
      <span class="platform-badge facebook">👥 Facebook</span>
    </div>
    <div class="publish-log">
      ${data.map(entry => `
        <div class="publish-entry">
          <span class="status-icon ${entry.success ? 'success' : 'fail'}">${entry.success ? '✅' : '❌'}</span>
          <span style="font-weight:500;">${entry.topic}</span>
          <span class="platform-badge ${entry.platform.toLowerCase()}" style="margin-left:8px;">${entry.platform}</span>
          <span style="font-size:0.75rem;color:${entry.success ? 'var(--status-complete)' : 'var(--status-error)'};">${entry.status}</span>
          <span class="publish-time">${entry.time}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:16px;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:6px;">Summary</div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        <span style="font-size:0.85rem;color:var(--status-complete);font-weight:600;">✅ ${data.filter(d => d.success).length} Posted</span>
        <span style="font-size:0.85rem;color:var(--status-error);font-weight:600;">❌ ${data.filter(d => !d.success).length} Failed</span>
        <span style="font-size:0.85rem;color:var(--text-muted);">📊 ${Math.round(data.filter(d => d.success).length / data.length * 100)}% Success Rate</span>
      </div>
    </div>
  `;
}
