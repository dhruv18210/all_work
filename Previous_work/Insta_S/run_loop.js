/**
 * run_loop.js — Continuous terminal scheduler
 * Usage: node run_loop.js
 * 
 * This script stays running in the terminal and checks the Google Sheet
 * every 1 minute for posts that are due to be published.
 */
require('dotenv').config();
const cron = require('node-cron');
const { processScheduledPosts } = require('./src/scheduler');

console.log('======================================');
console.log('  Instagram Automation — Auto-Loop');
console.log('======================================');
console.log('🔄 Background loop started.');
console.log('⏳ Checking your Google Sheet every minute...');
console.log('Press Ctrl+C to stop.\n');

// Run immediately on start
processScheduledPosts().catch(err => {
    console.error('❌ Error during initial check:', err.message);
});

// Then run every minute
cron.schedule('* * * * *', () => {
    processScheduledPosts().catch(err => {
        console.error('❌ Error during scheduled check:', err.message);
    });
});
