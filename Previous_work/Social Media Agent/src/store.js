// Simple reactive store for pipeline state

const listeners = new Set();

const state = {
  currentNiche: null,  // { label, emoji, sources, ... }
  nicheName: '',
  pipelineRunning: false,
  currentAgent: 0,
  agentStatuses: {
    1: 'pending',
    2: 'pending',
    3: 'pending',
    4: 'pending',
    5: 'pending',
    6: 'pending',
    7: 'pending'
  },
  discoveredContent: [],
  filteredContent: [],
  generatedPosts: [],
  designs: [],
  approvalSheet: [],
  scheduledPosts: [],
  publishResults: [],
  approvals: {}
};

export function getState() {
  return state;
}

export function setState(updates) {
  Object.assign(state, updates);
  notify();
}

export function setAgentStatus(agentNum, status) {
  state.agentStatuses[agentNum] = status;
  if (status === 'running') {
    state.currentAgent = agentNum;
  }
  notify();
}

export function resetPipeline() {
  Object.assign(state, {
    pipelineRunning: false,
    currentAgent: 0,
    agentStatuses: { 1:'pending', 2:'pending', 3:'pending', 4:'pending', 5:'pending', 6:'pending', 7:'pending' },
    discoveredContent: [],
    filteredContent: [],
    generatedPosts: [],
    designs: [],
    approvalSheet: [],
    scheduledPosts: [],
    publishResults: [],
    approvals: {}
  });
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach(fn => fn(state));
}
