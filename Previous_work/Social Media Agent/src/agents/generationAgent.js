// Agent 3: Content Generation Agent (LLM)

function getPlatformClass(platform) {
  return platform.toLowerCase();
}

function getPlatformIcon(platform) {
  const icons = { LinkedIn: '💼', Twitter: '🐦', Instagram: '📸', Facebook: '👥' };
  return icons[platform] || '📱';
}

export function renderGenerationDetail(state) {
  const data = state.generatedPosts.length ? state.generatedPosts : [];

  if (!data.length) {
    return `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:0.85rem;">Waiting for filtered content...</p>
        <p style="font-size:0.75rem;margin-top:8px;">Will rewrite into: LinkedIn post · Instagram caption · Twitter thread</p>
        <p style="font-size:0.75rem;margin-top:4px;">Adds: hooks · hashtags · CTA · tone optimization</p>
      </div>
    `;
  }

  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${data.map(post => `
        <div class="post-preview">
          <div class="post-preview-header">
            <span class="platform-badge ${getPlatformClass(post.platform)}">${getPlatformIcon(post.platform)} ${post.platform}</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <span class="meta-tag">🪝 ${post.hooks}</span>
              <span class="meta-tag">📢 ${post.cta}</span>
            </div>
          </div>
          <div class="post-preview-content">${post.content}</div>
          <div class="post-preview-hashtags">${post.hashtags}</div>
        </div>
      `).join('')}
    </div>
  `;
}
