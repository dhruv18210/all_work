// Excel exporter — generates and downloads .xlsx from pipeline data

import * as XLSX from 'xlsx';
import { getState } from './store.js';

export function exportToExcel() {
  const state = getState();
  const niche = state.currentNiche;
  const nicheName = niche ? niche.label : 'Social Media';

  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Workflow Overview ───
  const overviewData = [
    [`${nicheName} — Social Media Agent Workflow`],
    [''],
    ['Stage', 'Agent Name', 'Description', 'Status'],
    ...Object.entries(state.agentStatuses).map(([num, status]) => {
      const names = {
        1: 'Content Discovery Agent',
        2: 'Content Filtering Agent',
        3: 'Content Generation Agent (LLM)',
        4: 'Design Generation Agent',
        5: 'Approval Sheet (Human-in-the-Loop)',
        6: 'Scheduling Agent',
        7: 'Publishing Agent'
      };
      const descs = {
        1: 'Discovers trending content from multiple sources',
        2: 'Deduplicates and scores content by relevance',
        3: 'Rewrites content for each social platform',
        4: 'Creates visual assets for posts',
        5: 'User reviews and approves posts',
        6: 'Queues approved posts for publishing',
        7: 'Posts content and confirms results'
      };
      return [parseInt(num), names[num], descs[num], status.charAt(0).toUpperCase() + status.slice(1)];
    })
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  wsOverview['!cols'] = [{ wch: 8 }, { wch: 40 }, { wch: 50 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Workflow Overview');

  // ─── Sheet 2: Content Discovery ───
  if (state.discoveredContent.length) {
    const discData = [
      ['Agent 1 — Content Discovery'],
      [''],
      ['ID', 'Title', 'Source', 'Date', 'Summary'],
      ...state.discoveredContent.map(item => [item.id, item.title, item.source, item.date, item.summary])
    ];
    const wsDisc = XLSX.utils.aoa_to_sheet(discData);
    wsDisc['!cols'] = [{ wch: 5 }, { wch: 55 }, { wch: 20 }, { wch: 14 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsDisc, 'Content Discovery');
  }

  // ─── Sheet 3: Content Filtering ───
  if (state.filteredContent.length) {
    const filtData = [
      ['Agent 2 — Content Filtering'],
      [''],
      ['Rank', 'Title', 'Relevance (%)', 'Virality (%)', 'Usefulness (%)', 'Total Score', 'Engagement'],
      ...state.filteredContent.map((item, i) => [
        i + 1, item.title, item.relevance, item.virality, item.usefulness, item.totalScore, item.engagementPotential
      ])
    ];
    const wsFilt = XLSX.utils.aoa_to_sheet(filtData);
    wsFilt['!cols'] = [{ wch: 6 }, { wch: 50 }, { wch: 14 }, { wch: 13 }, { wch: 15 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsFilt, 'Content Filtering');
  }

  // ─── Sheet 4: Content Generation ───
  if (state.generatedPosts.length) {
    const genData = [
      ['Agent 3 — Content Generation (LLM)'],
      [''],
      ['ID', 'Topic', 'Platform', 'Post Content', 'Hashtags', 'Hook Type', 'CTA'],
      ...state.generatedPosts.map(post => [
        post.id, post.topic, post.platform, post.content, post.hashtags, post.hooks, post.cta
      ])
    ];
    const wsGen = XLSX.utils.aoa_to_sheet(genData);
    wsGen['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 80 }, { wch: 50 }, { wch: 22 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsGen, 'Content Generation');
  }

  // ─── Sheet 5: Design Generation ───
  if (state.designs.length) {
    const desData = [
      ['Agent 4 — Design Generation'],
      [''],
      ['ID', 'Design Type', 'Topic', 'Image URL', 'Tool Used'],
      ...state.designs.map(d => [d.id, d.type, d.topic, d.url, d.tool])
    ];
    const wsDes = XLSX.utils.aoa_to_sheet(desData);
    wsDes['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 35 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsDes, 'Design Generation');
  }

  // ─── Sheet 6: Approval Sheet ───
  if (state.approvalSheet.length) {
    const apprData = [
      [`Agent 5 — Approval Sheet ✅ Human-in-the-Loop`],
      [''],
      ['ID', 'Topic', 'Post Content', 'Image Link', 'Platform', 'Approval', 'Schedule'],
      ...state.approvalSheet.map(row => [
        row.id,
        row.topic,
        row.postContent,
        row.imageLink,
        row.platform,
        state.approvals[row.id] === true ? '✓ Yes' : state.approvals[row.id] === false ? '✗ No' : 'Pending',
        row.schedule
      ])
    ];
    const wsAppr = XLSX.utils.aoa_to_sheet(apprData);
    wsAppr['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 50 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsAppr, 'Approval Sheet');
  }

  // ─── Sheet 7: Scheduling ───
  if (state.scheduledPosts.length) {
    const schData = [
      ['Agent 6 — Scheduling Agent'],
      [''],
      ['ID', 'Topic', 'Platform', 'Scheduled Time', 'API', 'Status'],
      ...state.scheduledPosts.map(s => [s.id, s.topic, s.platform, s.time, s.api, s.status])
    ];
    const wsSch = XLSX.utils.aoa_to_sheet(schData);
    wsSch['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsSch, 'Scheduling');
  }

  // ─── Sheet 8: Publishing ───
  if (state.publishResults.length) {
    const posted = state.publishResults.filter(r => r.success).length;
    const failed = state.publishResults.filter(r => !r.success).length;
    const rate = Math.round(posted / state.publishResults.length * 100);

    const pubData = [
      ['Agent 7 — Publishing Agent'],
      [''],
      ['ID', 'Topic', 'Platform', 'Status', 'Published Time', 'Success'],
      ...state.publishResults.map(p => [p.id, p.topic, p.platform, p.status, p.time, p.success ? '✅ Yes' : '❌ No']),
      [''],
      ['', '', '', 'SUMMARY', '', ''],
      ['', '', '', `Posted: ${posted}`, `Failed: ${failed}`, `Success Rate: ${rate}%`]
    ];
    const wsPub = XLSX.utils.aoa_to_sheet(pubData);
    wsPub['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsPub, 'Publishing');
  }

  // Download
  const filename = `${nicheName.replace(/[^a-zA-Z0-9]/g, '_')}_Social_Media_Workflow.xlsx`;
  XLSX.writeFile(wb, filename);
}
