// Agent 6: Scheduling Agent

export function renderSchedulingDetail(state) {
  const data = state.scheduledPosts.length ? state.scheduledPosts : [];

  if (!data.length) {
    return `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:0.85rem;">Waiting for approved posts...</p>
        <p style="font-size:0.75rem;margin-top:8px;">Runs every hour/day · filter: Approval = Yes AND Status = Approved</p>
        <p style="font-size:0.75rem;margin-top:4px;">Tools: Buffer API · Hootsuite API · Meta Graph API · LinkedIn API</p>
      </div>
    `;
  }

  return `
    <div style="margin-bottom:12px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:0.75rem;color:var(--text-secondary);">⏰ Runs every hour/day</span>
      <span style="font-size:0.75rem;color:var(--text-secondary);">📋 Filter: Approval = Yes AND Status = Approved</span>
      <span style="font-size:0.75rem;color:var(--agent6-accent);margin-left:auto;">Queues → Post + Scheduled Time</span>
    </div>
    <div class="queue-list">
      ${data.map(item => `
        <div class="queue-item">
          <div class="queue-time">📅 ${item.time}</div>
          <div class="queue-content">
            <span style="font-weight:500;">${item.topic}</span>
            <span style="color:var(--text-muted);margin-left:8px;">→ ${item.platform}</span>
          </div>
          <span class="platform-badge ${item.platform.toLowerCase()}">${item.platform}</span>
          <span class="queue-api">${item.api}</span>
          <span class="meta-tag" style="color:var(--agent6-accent);">${item.status}</span>
        </div>
      `).join('')}
    </div>
  `;
}
