require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { getScheduledPosts } = require('./src/googleSheets');
const { processScheduledPosts } = require('./src/scheduler');

const app = express();
const PORT = process.env.UI_PORT || 4000;

// ─── In-memory log buffer ───────────────────────────────────────────────────
const LOG_BUFFER_SIZE = 500;
const logBuffer = [];
let schedulerRunning = false;
let schedulerInterval = null;
let stats = { total: 0, scheduled: 0, published: 0, failed: 0, pending: 0 };

// Intercept console output to capture logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function captureLog(level, ...args) {
    const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message
    };
    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift();
}

console.log = (...args) => { originalLog(...args); captureLog('info', ...args); };
console.error = (...args) => { originalError(...args); captureLog('error', ...args); };
console.warn = (...args) => { originalWarn(...args); captureLog('warn', ...args); };

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helper: parse .env file ────────────────────────────────────────────────
function readEnvFile() {
    const envPath = path.join(__dirname, '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const result = {};
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) return;
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        result[key] = value;
    });
    return result;
}

function writeEnvFile(updates) {
    const envPath = path.join(__dirname, '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    let lines = content.split('\n');

    for (const [key, value] of Object.entries(updates)) {
        let found = false;
        lines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return line;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) return line;
            const k = trimmed.substring(0, eqIndex).trim();
            if (k === key) { found = true; return `${key}=${value}`; }
            return line;
        });
        if (!found) lines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
    // Reload dotenv
    Object.assign(process.env, updates);
}

// ─── Compute stats from sheet rows ──────────────────────────────────────────
function computeStats(rows) {
    let total = 0, scheduled = 0, published = 0, failed = 0, pending = 0;
    if (!rows || rows.length <= 2) return { total, scheduled, published, failed, pending };
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || (!row[16] && !row[5])) continue;
        total++;
        const status = (row[12] || '').toString().trim().toLowerCase();
        if (status === 'published') published++;
        else if (status === 'scheduled') scheduled++;
        else if (status === 'failed') failed++;
        else pending++;
    }
    return { total, scheduled, published, failed, pending };
}

// ─── API Routes ─────────────────────────────────────────────────────────────

// GET /api/status — scheduler state + last stats
app.get('/api/status', (req, res) => {
    res.json({ running: schedulerRunning, stats, uptime: process.uptime() });
});

// GET /api/posts — all posts from Google Sheets
app.get('/api/posts', async (req, res) => {
    try {
        const rows = await getScheduledPosts('Content!A1:Q');
        stats = computeStats(rows);

        // Build cleaned post list starting from row 3 (index 2)
        const posts = [];
        for (let i = 2; i < rows.length; i++) {
            const row = rows[i];
            if (!row) continue;
            const imageUrl = row[16] || '';
            const caption = row[5] || '';
            if (!imageUrl && !caption) continue;
            posts.push({
                rowNumber: i + 1,
                caption: caption,
                scheduledDate: row[7] || '',
                status: (row[12] || '').toString().trim() || 'Pending',
                imageUrl: imageUrl,
                category: row[2] || '',
                platform: row[3] || '',
            });
        }
        res.json({ posts, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/run — trigger scheduler once manually
app.post('/api/run', async (req, res) => {
    try {
        captureLog('info', '🔄 Manual scheduler run triggered from UI...');
        processScheduledPosts()
            .then(() => captureLog('info', '✅ Manual run complete.'))
            .catch(e => captureLog('error', '❌ Manual run error: ' + e.message));
        res.json({ ok: true, message: 'Scheduler triggered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/scheduler/start — start cron loop
app.post('/api/scheduler/start', (req, res) => {
    if (schedulerRunning) return res.json({ ok: true, message: 'Already running' });
    schedulerRunning = true;
    captureLog('info', '▶️  Scheduler started from UI.');
    schedulerInterval = setInterval(() => {
        processScheduledPosts().catch(e => captureLog('error', 'Scheduler error: ' + e.message));
    }, 60 * 1000);
    // Run immediately
    processScheduledPosts().catch(e => captureLog('error', 'Scheduler error: ' + e.message));
    res.json({ ok: true, message: 'Scheduler started' });
});

// POST /api/scheduler/stop — stop cron loop
app.post('/api/scheduler/stop', (req, res) => {
    if (!schedulerRunning) return res.json({ ok: true, message: 'Not running' });
    schedulerRunning = false;
    if (schedulerInterval) { clearInterval(schedulerInterval); schedulerInterval = null; }
    captureLog('info', '⏹️  Scheduler stopped from UI.');
    res.json({ ok: true, message: 'Scheduler stopped' });
});

// GET /api/logs — return buffered logs
app.get('/api/logs', (req, res) => {
    const since = parseInt(req.query.since || '0');
    const filtered = since > 0 ? logBuffer.filter((_, i) => i >= since) : logBuffer;
    res.json({ logs: filtered, total: logBuffer.length });
});

// GET /api/settings — read .env (sensitive fields masked)
const SENSITIVE_KEYS = ['IG_ACCESS_TOKEN', 'GOOGLE_CLIENT_SECRET'];
app.get('/api/settings', (req, res) => {
    try {
        const env = readEnvFile();
        const masked = {};
        for (const [k, v] of Object.entries(env)) {
            masked[k] = { value: v, sensitive: SENSITIVE_KEYS.includes(k) };
        }
        res.json(masked);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/settings — update .env values
app.post('/api/settings', (req, res) => {
    try {
        const updates = req.body;
        if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'Invalid body' });
        writeEnvFile(updates);
        captureLog('info', `⚙️  Settings updated: ${Object.keys(updates).join(', ')}`);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Serve SPA fallback ─────────────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    captureLog('info', `🚀 Instagram Automation UI running at http://localhost:${PORT}`);
    console.log(`\n🚀 Instagram Automation Dashboard`);
    console.log(`   → Open: http://localhost:${PORT}\n`);
});
