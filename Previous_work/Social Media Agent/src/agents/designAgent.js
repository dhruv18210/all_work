// Agent 4: Design Generation Agent

export function renderDesignDetail(state) {
  const data = state.designs.length ? state.designs : [];

  if (!data.length) {
    return `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:0.85rem;">Waiting for generated posts...</p>
        <p style="font-size:0.75rem;margin-top:8px;">Tools: DALL·E · Stable Diffusion · Canva API</p>
        <p style="font-size:0.75rem;margin-top:4px;">Generates: IG post · carousel · quote image</p>
      </div>
    `;
  }

  return `
    <div class="design-grid">
      ${data.map(d => `
        <div class="design-thumb">
          <div class="design-icon">🎨</div>
          <div style="font-weight:500;">${d.type}</div>
          <div style="font-size:0.68rem;color:var(--text-muted);">${d.topic}</div>
          <div style="position:absolute;bottom:8px;right:8px;">
            <span class="meta-tag" style="font-size:0.65rem;">${d.tool}</span>
          </div>
          <div style="position:absolute;top:8px;left:8px;">
            <span style="font-size:0.65rem;color:var(--text-muted);">🔗 ${d.url}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <p style="font-size:0.72rem;color:var(--text-muted);margin-top:12px;">Output → image URLs passed to Approval Sheet</p>
  `;
}
