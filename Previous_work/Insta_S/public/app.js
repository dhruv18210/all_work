/* ═══════════════════════════════════════════════════
   InstaScheduler — Frontend Application
   Vanilla JS: routing, polling, rendering
═══════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────
const state = {
    currentPage: 'dashboard',
    schedulerRunning: false,
    stats: {},
    allPosts: [],
    logOffset: 0,
    logLines: [],
    settings: {},
    autoScroll: true,
    pollInterval: null,
    statusInterval: null,
};

// ── DOM Helpers ───────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Toast Notifications ───────────────────────────
function showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const container = $('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

// ── Navigation ────────────────────────────────────
const PAGE_TITLES = {
    dashboard: ['Dashboard', 'Live overview of your Instagram automation'],
    posts:     ['Post Queue', 'All posts from your Google Sheet'],
    logs:      ['Activity Log', 'Full scheduler output'],
    settings:  ['Settings', 'Configure credentials and preferences'],
};

function navigateTo(page) {
    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = $(`page-${page}`);
    const navEl = $(`nav-${page}`);
    if (pageEl) pageEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    state.currentPage = page;
    const [title, sub] = PAGE_TITLES[page] || ['', ''];
    $('topbar-title').textContent = title;
    $('topbar-sub').textContent = sub;

    if (page === 'posts') loadPosts();
    if (page === 'settings') loadSettings();
}

// ── SPA Navigation Events ─────────────────────────
$$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

$('btn-goto-logs').addEventListener('click', () => navigateTo('logs'));

// ── Scheduler Toggle ──────────────────────────────
const toggle = $('scheduler-toggle');
toggle.addEventListener('change', async () => {
    const endpoint = toggle.checked ? '/api/scheduler/start' : '/api/scheduler/stop';
    try {
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        updateSchedulerUI(toggle.checked);
        showToast(data.message, 'info');
    } catch (e) {
        showToast('Failed to toggle scheduler', 'error');
        toggle.checked = !toggle.checked;
    }
});

function updateSchedulerUI(running) {
    state.schedulerRunning = running;
    toggle.checked = running;

    const dots = [$('sched-dot'), $('info-sched-dot')];
    const label = $('sched-label');
    const infoLabel = $('info-sched-label');

    dots.forEach(d => {
        if (!d) return;
        d.classList.toggle('running', running);
    });
    if (label) label.textContent = running ? 'Running' : 'Stopped';
    if (infoLabel) {
        infoLabel.textContent = running ? 'Running' : 'Stopped';
        infoLabel.style.color = running ? 'var(--green)' : 'var(--text-secondary)';
    }
}

// ── Run Now Button ────────────────────────────────
$('btn-run-now').addEventListener('click', async () => {
    const btn = $('btn-run-now');
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="spinning"></i> Running…';
    lucide.createIcons();

    try {
        const res = await fetch('/api/run', { method: 'POST' });
        const data = await res.json();
        showToast('Scheduler triggered! Check logs for output.', 'success');
    } catch (e) {
        showToast('Failed to trigger scheduler', 'error');
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="zap"></i> Run Now';
            lucide.createIcons();
        }, 3000);
    }
});

// ── Refresh Button ────────────────────────────────
$('btn-refresh').addEventListener('click', () => {
    refreshAll();
    showToast('Refreshing data…', 'info');
});

async function refreshAll() {
    await fetchStatus();
    await fetchLogs();
    if (state.currentPage === 'posts') await loadPosts();
    if (state.currentPage === 'settings') await loadSettings();
    $('topbar-sub').textContent = `Last refresh: ${new Date().toLocaleTimeString()}`;
}

// ── Status Polling ─────────────────────────────────
async function fetchStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        updateSchedulerUI(data.running);
        updateStats(data.stats || {});
        updateUptime(data.uptime || 0);
    } catch (e) { /* silent */ }
}

function updateStats(stats) {
    state.stats = stats;
    const map = {
        'stat-total': 'total',
        'stat-pending': 'pending',
        'stat-scheduled': 'scheduled',
        'stat-published': 'published',
        'stat-failed': 'failed',
    };
    for (const [id, key] of Object.entries(map)) {
        const el = $(id);
        if (el) el.textContent = stats[key] ?? '0';
    }
    const badge = $('posts-badge');
    if (badge) badge.textContent = stats.total ?? '–';
}

function updateUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const el = $('info-uptime');
    if (el) el.textContent = `${h}h ${m}m ${s}s`;
}

// ── Log Polling ───────────────────────────────────
async function fetchLogs() {
    try {
        const res = await fetch(`/api/logs?since=${state.logOffset}`);
        const data = await res.json();

        if (data.logs && data.logs.length > 0) {
            appendLogs(data.logs);
            state.logOffset = data.total;
        }
    } catch (e) { /* silent */ }
}

function classifyLog(msg) {
    const m = msg.toLowerCase();
    if (m.includes('✅') || m.includes('successfully') || m.includes('published')) return 'contains-success';
    if (m.includes('❌') || m.includes('error') || m.includes('failed')) return 'contains-error';
    if (m.includes('📅') || m.includes('scheduling') || m.includes('scheduled')) return 'contains-schedule';
    if (m.includes('⚠️') || m.includes('warn') || m.includes('skipping')) return 'contains-warning';
    return 'info';
}

function appendLogs(newLogs) {
    state.logLines.push(...newLogs);

    const targets = [$('mini-log'), $('full-log')];

    targets.forEach(terminal => {
        if (!terminal) return;

        // Clear empty state if present
        const empty = terminal.querySelector('.empty-state');
        if (empty) empty.remove();

        newLogs.forEach(entry => {
            const line = document.createElement('div');
            line.className = 'log-line';

            const time = new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour12: false });
            const cls = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : classifyLog(entry.message);

            line.innerHTML = `
                <span class="log-time">${time}</span>
                <span class="log-msg ${cls}">${escapeHtml(entry.message)}</span>
            `;
            terminal.appendChild(line);
        });

        // Limit mini-log to last 100 lines
        if (terminal.id === 'mini-log') {
            const lines = terminal.querySelectorAll('.log-line');
            if (lines.length > 100) {
                for (let i = 0; i < lines.length - 100; i++) lines[i].remove();
            }
        }

        // Auto-scroll
        const shouldScroll = terminal.id === 'mini-log' || ($('log-autoscroll')?.checked && state.currentPage === 'logs');
        if (shouldScroll) terminal.scrollTop = terminal.scrollHeight;
    });
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Clear logs button
$('btn-clear-logs').addEventListener('click', () => {
    const terminal = $('full-log');
    terminal.innerHTML = '<div class="empty-state" style="padding:20px;"><i data-lucide="terminal" style="width:28px;height:28px;opacity:0.3;"></i><p>Cleared.</p></div>';
    lucide.createIcons();
    state.logLines = [];
    state.logOffset = 0;
});

// ── Load Posts ────────────────────────────────────
async function loadPosts() {
    const wrapper = $('posts-table-wrapper');
    wrapper.innerHTML = `
        <div class="empty-state" style="padding:60px;">
            <i data-lucide="loader" class="spinning" style="width:32px;height:32px;opacity:0.4;"></i>
            <p>Loading posts from Google Sheets…</p>
        </div>`;
    lucide.createIcons();

    try {
        const res = await fetch('/api/posts');
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        state.allPosts = data.posts || [];
        updateStats(data.stats || {});
        renderPostsTable(state.allPosts);
    } catch (e) {
        wrapper.innerHTML = `
            <div class="empty-state" style="padding:60px;">
                <i data-lucide="alert-circle" style="width:36px;height:36px;color:var(--red);opacity:0.6;"></i>
                <h3>Failed to load posts</h3>
                <p>${escapeHtml(e.message)}</p>
            </div>`;
        lucide.createIcons();
    }
}

function renderPostsTable(posts) {
    const filterVal = $('filter-status').value.toLowerCase();
    const filtered = filterVal
        ? posts.filter(p => p.status.toLowerCase() === filterVal || (filterVal === 'pending' && p.status.toLowerCase() === 'pending'))
        : posts;

    const wrapper = $('posts-table-wrapper');

    if (!filtered.length) {
        wrapper.innerHTML = `
            <div class="empty-state" style="padding:60px;">
                <i data-lucide="calendar-x" style="width:36px;height:36px;opacity:0.3;"></i>
                <h3>No posts found</h3>
                <p>${filterVal ? 'Try changing the filter.' : 'Your Google Sheet has no data yet.'}</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    const rows = filtered.map(post => {
        const statusClass = post.status.toLowerCase();
        const validClass = ['published','scheduled','failed','pending'].includes(statusClass) ? statusClass : 'pending';
        const displayStatus = post.status || 'Pending';

        const thumbHtml = post.imageUrl
            ? `<img class="thumb" src="${escapeHtml(post.imageUrl)}" alt="thumb" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
               <div class="thumb-placeholder" style="display:none;"><i data-lucide="image" style="width:14px;height:14px;stroke-width:1.5;"></i></div>`
            : `<div class="thumb-placeholder"><i data-lucide="image" style="width:14px;height:14px;stroke-width:1.5;"></i></div>`;

        const caption = post.caption
            ? escapeHtml(post.caption.substring(0, 100)) + (post.caption.length > 100 ? '…' : '')
            : '<span style="color:var(--text-muted);">–</span>';

        return `
        <tr>
            <td class="row-number">#${post.rowNumber}</td>
            <td style="display:flex; align-items:center; gap:10px; padding:12px 16px;">
                ${thumbHtml}
            </td>
            <td class="caption-cell" title="${escapeHtml(post.caption || '')}">${caption}</td>
            <td class="date-cell">${escapeHtml(post.scheduledDate) || '–'}</td>
            <td><span class="badge badge-${validClass}">${escapeHtml(displayStatus)}</span></td>
        </tr>`;
    }).join('');

    wrapper.innerHTML = `
    <table>
        <thead>
            <tr>
                <th>Row</th>
                <th>Image</th>
                <th>Caption</th>
                <th>Scheduled Date</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;

    lucide.createIcons();
}

// Filter change handler
$('filter-status').addEventListener('change', () => {
    renderPostsTable(state.allPosts);
});

// ── Load Settings ─────────────────────────────────
async function loadSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        state.settings = data;
        state._originalSettings = JSON.stringify(data);

        const setVal = (id, key) => {
            const el = $(id);
            if (el && data[key]) el.value = data[key].value || '';
        };

        setVal('s-ig-token', 'IG_ACCESS_TOKEN');
        setVal('s-ig-id', 'IG_ACCOUNT_ID');
        setVal('s-sheet-id', 'GOOGLE_SHEET_ID');
        setVal('s-google-client-id', 'GOOGLE_CLIENT_ID');
        setVal('s-google-secret', 'GOOGLE_CLIENT_SECRET');
        setVal('s-timezone', 'TIMEZONE');

        // Update info cards
        const igId = $('info-ig-id');
        const sheetId = $('info-sheet-id');
        const tz = $('info-tz');
        if (igId && data.IG_ACCOUNT_ID) igId.textContent = data.IG_ACCOUNT_ID.value;
        if (sheetId && data.GOOGLE_SHEET_ID) sheetId.textContent = data.GOOGLE_SHEET_ID.value;
        if (tz && data.TIMEZONE) tz.textContent = data.TIMEZONE.value;

    } catch (e) {
        showToast('Failed to load settings', 'error');
    }
}

// Save Settings
$('btn-save-settings').addEventListener('click', async () => {
    const btn = $('btn-save-settings');
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="spinning"></i> Saving…';
    lucide.createIcons();

    const updates = {
        IG_ACCESS_TOKEN: $('s-ig-token').value,
        IG_ACCOUNT_ID: $('s-ig-id').value,
        GOOGLE_SHEET_ID: $('s-sheet-id').value,
        GOOGLE_CLIENT_ID: $('s-google-client-id').value,
        GOOGLE_CLIENT_SECRET: $('s-google-secret').value,
        TIMEZONE: $('s-timezone').value,
    };

    // Remove empty values
    for (const k of Object.keys(updates)) {
        if (!updates[k]) delete updates[k];
    }

    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (data.ok) {
            showToast('Settings saved successfully!', 'success');
            await loadSettings();
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (e) {
        showToast(`Failed to save: ${e.message}`, 'error');
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="save"></i> Save Changes';
            lucide.createIcons();
        }, 2000);
    }
});

// Reset Settings
$('btn-reset-settings').addEventListener('click', () => {
    loadSettings();
    showToast('Settings reset to current values', 'info');
});

// ── Reveal Button Handler ─────────────────────────
$$('.reveal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = $(targetId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword
            ? '<i data-lucide="eye-off"></i>'
            : '<i data-lucide="eye"></i>';
        lucide.createIcons();
    });
});

// ── Auto-scroll toggle ────────────────────────────
$('log-autoscroll').addEventListener('change', (e) => {
    state.autoScroll = e.target.checked;
});

// ── Initialize Polling ─────────────────────────────
function startPolling() {
    // Poll status every 5s
    state.statusInterval = setInterval(fetchStatus, 5000);
    // Poll logs every 3s
    state.pollInterval = setInterval(fetchLogs, 3000);
}

// ── Boot ──────────────────────────────────────────
async function init() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Initial data fetch
    await fetchStatus();
    await fetchLogs();
    await loadSettings();

    // Start background polling
    startPolling();

    $('topbar-sub').textContent = `Last refresh: ${new Date().toLocaleTimeString()}`;
}

// Run
init().catch(console.error);
