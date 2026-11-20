// Social Media Agent — Main Entry Point

import './style.css';
import { renderPipeline, runPipeline, resetExpandedAgent } from './pipeline.js';
import { getState, setState, resetPipeline, subscribe } from './store.js';
import { presetNiches, generateNicheData } from './data/nicheGenerator.js';

function init() {
  const landingView = document.getElementById('landing-view');
  const appView = document.getElementById('app-view');
  const nicheInput = document.getElementById('niche-input');
  const buildBtn = document.getElementById('build-btn');
  const presetContainer = document.getElementById('preset-buttons');
  const backBtn = document.getElementById('back-btn');
  const nicheLabel = document.getElementById('niche-label');
  const pipelineView = document.getElementById('pipeline-view');
  const dashboardView = document.getElementById('dashboard-view');
  const runBtn = document.getElementById('run-pipeline-btn');

  // Render preset buttons
  presetContainer.innerHTML = presetNiches.map(n =>
    `<button class="preset-btn" data-niche="${n.key}"><span class="p-emoji">${n.emoji}</span> ${n.label}</button>`
  ).join('');

  // Handle preset click
  presetContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.preset-btn');
    if (btn) {
      const niche = btn.dataset.niche;
      launchWorkflow(niche);
    }
  });

  // Handle build button
  buildBtn.addEventListener('click', () => {
    const value = nicheInput.value.trim();
    if (value) launchWorkflow(value);
  });

  // Handle enter key
  nicheInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = nicheInput.value.trim();
      if (value) launchWorkflow(value);
    }
  });

  // Back button
  backBtn.addEventListener('click', () => {
    resetPipeline();
    resetExpandedAgent();
    appView.classList.remove('active');
    landingView.classList.add('active');
    // Reset nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn[data-view="pipeline"]').classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    pipelineView.classList.add('active');
    runBtn.innerHTML = '<span class="btn-icon">▶</span> Run Pipeline';
    runBtn.classList.remove('running');
    window.scrollTo(0, 0);
  });

  // Nav switching
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(`${view}-view`).classList.add('active');
    });
  });

  // Run pipeline button
  runBtn.addEventListener('click', () => {
    const state = getState();
    if (state.pipelineRunning) return;
    runBtn.classList.add('running');
    runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
    runPipeline(pipelineView);
  });

  // Launch workflow with a niche
  function launchWorkflow(nicheName) {
    const nicheData = generateNicheData(nicheName);

    setState({
      nicheName: nicheName,
      currentNiche: nicheData.niche
    });
    resetPipeline();
    resetExpandedAgent();

    // Update UI
    nicheLabel.textContent = `${nicheData.niche.emoji} ${nicheData.niche.label}`;

    // Switch views
    landingView.classList.remove('active');
    appView.classList.add('active');

    // Render pipeline and dashboard
    renderPipeline(pipelineView);
    renderDashboard(dashboardView);

    // Set niche name after reset
    setState({ nicheName: nicheName, currentNiche: nicheData.niche });

    window.scrollTo(0, 0);
  }
}

function renderDashboard(container) {
  const state = getState();
  const nicheName = state.currentNiche ? state.currentNiche.label : 'Your Industry';

  container.innerHTML = `
    <h2 class="section-title" style="margin-bottom:24px;">📊 ${nicheName} Pipeline Dashboard</h2>
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-label">Content Discovered</div>
        <div class="stat-value" id="stat-discovered">0</div>
        <div class="stat-change">from ${state.currentNiche ? state.currentNiche.sources.length : 3} sources</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Posts Filtered</div>
        <div class="stat-value" id="stat-filtered">0</div>
        <div class="stat-change">top content ranked</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Posts Generated</div>
        <div class="stat-value" id="stat-generated">0</div>
        <div class="stat-change">across platforms</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Posts Published</div>
        <div class="stat-value" id="stat-published">0</div>
        <div class="stat-change">success rate tracked</div>
      </div>
    </div>

    <h2 class="section-title">🔄 Pipeline Status</h2>
    <div style="display:flex;flex-direction:column;gap:10px;" id="dashboard-stages">
      ${renderDashboardStages()}
    </div>

    <div style="margin-top:32px;padding:20px;background:var(--bg-card);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.06);">
      <h3 style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);margin-bottom:12px;">ℹ️ How It Works — ${nicheName}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;font-size:0.8rem;color:var(--text-secondary);">
        <div>
          <div style="font-weight:600;color:var(--accent-teal);margin-bottom:4px;">1-2. Discover & Filter</div>
          Content is sourced from ${state.currentNiche ? state.currentNiche.sources.join(', ') : 'industry sources'}, then scored and ranked.
        </div>
        <div>
          <div style="font-weight:600;color:var(--accent-teal);margin-bottom:4px;">3-4. Generate & Design</div>
          LLM rewrites ${nicheName.toLowerCase()} content for each platform. AI creates matching visuals.
        </div>
        <div>
          <div style="font-weight:600;color:var(--accent-teal);margin-bottom:4px;">5. Human Review</div>
          You approve or reject each ${nicheName.toLowerCase()} post and set schedule times.
        </div>
        <div>
          <div style="font-weight:600;color:var(--accent-teal);margin-bottom:4px;">6-7. Schedule & Publish</div>
          Approved posts are queued and auto-published via platform APIs.
        </div>
      </div>
    </div>
  `;

  subscribe((state) => {
    const discovered = document.getElementById('stat-discovered');
    const filtered = document.getElementById('stat-filtered');
    const generated = document.getElementById('stat-generated');
    const published = document.getElementById('stat-published');
    const stages = document.getElementById('dashboard-stages');

    if (discovered) discovered.textContent = state.discoveredContent.length;
    if (filtered) filtered.textContent = state.filteredContent.length;
    if (generated) generated.textContent = state.generatedPosts.length;
    if (published) published.textContent = state.publishResults.filter(r => r.success).length;
    if (stages) stages.innerHTML = renderDashboardStages();
  });
}

function renderDashboardStages() {
  const state = getState();
  const agents = [
    { num: 1, name: 'Content Discovery' },
    { num: 2, name: 'Content Filtering' },
    { num: 3, name: 'Content Generation' },
    { num: 4, name: 'Design Generation' },
    { num: 5, name: 'Human Approval' },
    { num: 6, name: 'Scheduling' },
    { num: 7, name: 'Publishing' }
  ];

  return agents.map(a => {
    const status = state.agentStatuses[a.num];
    const colors = { pending: 'var(--text-muted)', running: 'var(--status-running)', complete: 'var(--status-complete)', error: 'var(--status-error)' };
    const icons = { pending: '○', running: '◉', complete: '✓', error: '✗' };

    return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(0,0,0,0.15);border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
        <span style="color:${colors[status]};font-weight:700;font-size:1rem;">${icons[status]}</span>
        <span style="font-size:0.82rem;font-weight:500;flex:1;">${a.num}. ${a.name}</span>
        <span style="font-size:0.72rem;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,0.05);color:${colors[status]};">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', init);
