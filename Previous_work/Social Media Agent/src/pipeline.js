// Pipeline flow visualization — renders all 7 agent stages with dynamic niche data

import { getState, subscribe, setAgentStatus, setState } from './store.js';
import { renderDiscoveryDetail } from './agents/discoveryAgent.js';
import { renderFilteringDetail } from './agents/filteringAgent.js';
import { renderGenerationDetail } from './agents/generationAgent.js';
import { renderDesignDetail } from './agents/designAgent.js';
import { renderApprovalDetail } from './agents/approvalAgent.js';
import { renderSchedulingDetail } from './agents/schedulingAgent.js';
import { renderPublishingDetail } from './agents/publishingAgent.js';
import { generateNicheData } from './data/nicheGenerator.js';

const agentConfig = [
  {
    num: 1,
    title: 'Content Discovery Agent',
    subtitle: 'Discovers trending content from multiple sources',
    output: 'Title | Source | Link | Date | Summary',
    renderDetail: renderDiscoveryDetail
  },
  {
    num: 2,
    title: 'Content Filtering Agent',
    subtitle: 'Deduplicates and scores content by relevance',
    output: 'Top 10–20 filtered posts',
    renderDetail: renderFilteringDetail
  },
  {
    num: 3,
    title: 'Content Generation Agent (LLM)',
    subtitle: 'Rewrites content for each social platform',
    output: 'Post text + platform + hashtags',
    renderDetail: renderGenerationDetail
  },
  {
    num: 4,
    title: 'Design Generation Agent',
    subtitle: 'Creates visual assets for posts',
    output: 'Image URLs',
    renderDetail: renderDesignDetail
  },
  {
    num: 5,
    title: 'Approval Sheet',
    subtitle: 'Human-in-the-loop review and scheduling',
    output: 'Approved posts with schedule',
    renderDetail: renderApprovalDetail,
    isHuman: true
  },
  {
    num: 6,
    title: 'Scheduling Agent',
    subtitle: 'Queues approved posts for publishing',
    output: 'Queued posts + scheduled time',
    renderDetail: renderSchedulingDetail
  },
  {
    num: 7,
    title: 'Publishing Agent',
    subtitle: 'Posts content and confirms results',
    output: 'Status → Posted',
    renderDetail: renderPublishingDetail
  }
];

// Get dynamic tags based on niche data
function getAgentTags(agentNum, state) {
  const niche = state.currentNiche;
  const sources = niche ? niche.sources : ['Google News', 'Twitter', 'Reddit'];

  switch(agentNum) {
    case 1: return sources;
    case 2: return ['Dedup', 'Scoring', 'Ranking'];
    case 3: return ['LinkedIn', 'Instagram', 'Twitter Thread'];
    case 4: return ['DALL·E', 'Stable Diffusion', 'Canva API'];
    case 5: return ['Excel / Google Sheet', 'Human Review'];
    case 6: return ['Buffer API', 'Hootsuite API', 'Meta Graph API', 'LinkedIn API'];
    case 7: return ['LinkedIn', 'Instagram', 'X', 'Facebook'];
    default: return [];
  }
}

let expandedAgent = null;

export function renderPipeline(container) {
  const state = getState();

  const html = agentConfig.map((agent, index) => {
    const status = state.agentStatuses[agent.num];
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    const isExpanded = expandedAgent === agent.num;
    const tags = getAgentTags(agent.num, state);

    const card = `
      <div class="agent-card ${isExpanded ? 'expanded' : ''} ${status === 'running' || status === 'complete' ? 'active' : ''}"
           data-agent="${agent.num}"
           data-status="${status}"
           id="agent-card-${agent.num}">
        <div class="agent-header" data-agent-toggle="${agent.num}">
          <div class="agent-header-left">
            <div class="agent-number">${agent.num}</div>
            <div>
              <div class="agent-title">${agent.title} ${agent.isHuman ? '<span class="human-badge"><span class="check">✅</span> Human-in-the-loop</span>' : ''}</div>
              <div class="agent-subtitle">${agent.subtitle}</div>
            </div>
          </div>
          <div class="agent-header-right">
            <div class="agent-status">
              <span class="status-dot"></span>
              <span>${statusLabel}</span>
            </div>
            <span class="agent-toggle">▼</span>
          </div>
        </div>
        <div class="agent-meta">
          ${tags.map(t => `<span class="meta-tag">${t}</span>`).join('')}
          <div class="meta-output">
            <span>Output <span class="arrow">→</span></span>
            <span>${agent.output}</span>
          </div>
        </div>
        <div class="agent-detail">
          <div class="agent-detail-inner" id="agent-detail-${agent.num}">
            ${agent.renderDetail(state)}
          </div>
        </div>
      </div>
    `;

    const connector = index < agentConfig.length - 1 ? `
      <div class="pipeline-connector ${status === 'complete' ? 'active' : ''}" id="connector-${agent.num}">
        <div class="data-dot"></div>
      </div>
    ` : '';

    return card + connector;
  }).join('');

  container.innerHTML = `<div class="pipeline-container">${html}</div>`;

  // Attach toggle listeners
  container.querySelectorAll('[data-agent-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const num = parseInt(el.dataset.agentToggle);
      expandedAgent = expandedAgent === num ? null : num;
      renderPipeline(container);
    });
  });
}

// Run the pipeline simulation with niche data
export async function runPipeline(container) {
  const state = getState();
  if (state.pipelineRunning) return;

  const nicheName = state.nicheName;
  if (!nicheName) return;

  // Generate niche-specific data
  const nicheData = generateNicheData(nicheName);

  // Reset state
  setState({
    pipelineRunning: true,
    currentNiche: nicheData.niche,
    discoveredContent: [],
    filteredContent: [],
    generatedPosts: [],
    designs: [],
    approvalSheet: [],
    scheduledPosts: [],
    publishResults: [],
    approvals: {},
    agentStatuses: { 1:'pending', 2:'pending', 3:'pending', 4:'pending', 5:'pending', 6:'pending', 7:'pending' }
  });
  renderPipeline(container);

  const delay = ms => new Promise(r => setTimeout(r, ms));
  const animateConnector = (num) => {
    const conn = document.getElementById(`connector-${num}`);
    if (conn) {
      conn.classList.add('animating');
      setTimeout(() => conn.classList.remove('animating'), 700);
    }
  };

  // Agent 1: Content Discovery
  setAgentStatus(1, 'running');
  expandedAgent = 1;
  renderPipeline(container);
  await delay(1500);
  setState({ discoveredContent: nicheData.discovered });
  setAgentStatus(1, 'complete');
  expandedAgent = 1;
  renderPipeline(container);
  animateConnector(1);
  await delay(600);

  // Agent 2: Content Filtering
  setAgentStatus(2, 'running');
  expandedAgent = 2;
  renderPipeline(container);
  await delay(1200);
  setState({ filteredContent: nicheData.filtered });
  setAgentStatus(2, 'complete');
  expandedAgent = 2;
  renderPipeline(container);
  animateConnector(2);
  await delay(600);

  // Agent 3: Content Generation
  setAgentStatus(3, 'running');
  expandedAgent = 3;
  renderPipeline(container);
  await delay(1800);
  setState({ generatedPosts: nicheData.posts });
  setAgentStatus(3, 'complete');
  expandedAgent = 3;
  renderPipeline(container);
  animateConnector(3);
  await delay(600);

  // Agent 4: Design Generation
  setAgentStatus(4, 'running');
  expandedAgent = 4;
  renderPipeline(container);
  await delay(1400);
  setState({ designs: nicheData.designs });
  setAgentStatus(4, 'complete');
  expandedAgent = 4;
  renderPipeline(container);
  animateConnector(4);
  await delay(600);

  // Agent 5: Approval (Human-in-the-loop)
  setAgentStatus(5, 'running');
  expandedAgent = 5;
  setState({ approvalSheet: nicheData.approvalSheet });
  renderPipeline(container);
  await delay(1000);
  const approvals = {};
  nicheData.approvalSheet.forEach(item => { approvals[item.id] = true; });
  setState({ approvals });
  setAgentStatus(5, 'complete');
  expandedAgent = 5;
  renderPipeline(container);
  animateConnector(5);
  await delay(600);

  // Agent 6: Scheduling
  setAgentStatus(6, 'running');
  expandedAgent = 6;
  renderPipeline(container);
  await delay(1200);
  setState({ scheduledPosts: nicheData.schedule });
  setAgentStatus(6, 'complete');
  expandedAgent = 6;
  renderPipeline(container);
  animateConnector(6);
  await delay(600);

  // Agent 7: Publishing
  setAgentStatus(7, 'running');
  expandedAgent = 7;
  renderPipeline(container);
  await delay(1500);
  setState({ publishResults: nicheData.publishResults });
  setAgentStatus(7, 'complete');
  expandedAgent = 7;
  renderPipeline(container);

  setState({ pipelineRunning: false });

  // Update run button
  const btn = document.getElementById('run-pipeline-btn');
  if (btn) {
    btn.classList.remove('running');
    btn.innerHTML = '<span class="btn-icon">✓</span> Pipeline Complete';
    setTimeout(() => {
      btn.innerHTML = '<span class="btn-icon">▶</span> Run Pipeline';
    }, 3000);
  }
}

export function resetExpandedAgent() {
  expandedAgent = null;
}
