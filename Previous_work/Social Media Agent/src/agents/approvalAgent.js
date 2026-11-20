// Agent 5: Excel/Google Sheet Approval — Human-in-the-loop

import { getState, setState } from '../store.js';
import { exportToExcel } from '../excelExporter.js';

export function renderApprovalDetail(state) {
  const data = state.approvalSheet.length ? state.approvalSheet : [];
  const hasApprovals = Object.keys(state.approvals).length > 0;

  if (!data.length) {
    return `
      <div style="text-align:center;padding:24px;color:var(--text-muted);">
        <p style="font-size:0.85rem;">Waiting for posts and designs...</p>
        <p style="font-size:0.75rem;margin-top:8px;">User reviews · sets Approval = Yes/No · sets Schedule Time</p>
      </div>
    `;
  }

  const approvedCount = Object.values(state.approvals).filter(v => v === true).length;
  const rejectedCount = Object.values(state.approvals).filter(v => v === false).length;
  const pendingCount = data.length - approvedCount - rejectedCount;

  return `
    <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <span class="human-badge"><span class="check">✅</span> Human-in-the-Loop</span>
      <div style="display:flex;gap:8px;align-items:center;">
        ${hasApprovals ? `
          <span style="font-size:0.72rem;color:var(--status-complete);">✓ ${approvedCount} approved</span>
          ${rejectedCount ? `<span style="font-size:0.72rem;color:var(--status-error);">✗ ${rejectedCount} rejected</span>` : ''}
          ${pendingCount ? `<span style="font-size:0.72rem;color:var(--text-muted);">○ ${pendingCount} pending</span>` : ''}
        ` : ''}
        <button class="btn-export-excel" onclick="window.__exportExcel()">📥 Download Excel</button>
      </div>
    </div>
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Topic</th>
            <th>Post Content</th>
            <th>Image</th>
            <th>Platform</th>
            <th>Approval</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => {
            const approved = state.approvals[row.id];
            return `
              <tr>
                <td style="font-weight:600;color:var(--text-muted);">${row.id}</td>
                <td style="font-weight:500;">${row.topic}</td>
                <td style="max-width:200px;font-size:0.78rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${row.postContent}</td>
                <td><span style="font-size:0.72rem;color:var(--accent-teal);">🔗 ${row.imageLink}</span></td>
                <td><span class="platform-badge ${row.platform.toLowerCase()}">${row.platform}</span></td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="approval-btn approve ${approved === true ? 'active' : ''}" onclick="window.__handleApproval('${row.id}', true)">✓ Yes</button>
                    <button class="approval-btn reject ${approved === false ? 'active' : ''}" onclick="window.__handleApproval('${row.id}', false)">✗ No</button>
                  </div>
                </td>
                <td>
                  <input class="schedule-input" type="text" value="${row.schedule}" placeholder="e.g. Mon 9am" />
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    <p style="font-size:0.72rem;color:var(--text-muted);margin-top:10px;">← User reviews · sets Approval = Yes/No · sets Schedule Time →</p>
  `;
}

// Global approval handler
window.__handleApproval = function(id, approved) {
  const state = getState();
  const newApprovals = { ...state.approvals, [id]: approved };
  setState({ approvals: newApprovals });
};

// Global excel export handler
window.__exportExcel = function() {
  exportToExcel();
};
