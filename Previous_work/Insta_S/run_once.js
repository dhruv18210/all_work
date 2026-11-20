/**
 * run_once.js — Manually trigger the scheduler once from terminal
 * Usage: node run_once.js
 */
require('dotenv').config();
const { processScheduledPosts } = require('./src/scheduler');

console.log('\n▶️  Running scheduler manually...\n');
processScheduledPosts()
    .then(() => {
        console.log('\n✅ Manual run complete.');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    });
