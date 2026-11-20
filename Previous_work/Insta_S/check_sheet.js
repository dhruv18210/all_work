require('dotenv').config();
const { getScheduledPosts } = require('./src/googleSheets');

async function checkSheet() {
    console.log('\n========================================');
    console.log('  Google Sheet — Post Status Summary');
    console.log('========================================\n');

    const rows = await getScheduledPosts('Content!A1:Q');
    if (!rows || rows.length <= 2) {
        console.log('  ⚠️  No data found in sheet.');
        return;
    }

    let total = 0, scheduled = 0, published = 0, failed = 0, pending = 0;
    const failedPosts = [];
    const scheduledPosts = [];
    const upcomingPosts = [];

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || (!row[16] && !row[5])) continue;
        total++;
        const status = (row[12] || '').toString().trim().toLowerCase();
        const caption = (row[5] || '').toString().substring(0, 50);
        const date = row[7] || 'No date';

        if (status === 'published') published++;
        else if (status === 'scheduled') {
            scheduled++;
            scheduledPosts.push({ row: i + 1, caption, date, status: row[12] });
        }
        else if (status === 'failed') {
            failed++;
            failedPosts.push({ row: i + 1, caption, date });
        }
        else {
            pending++;
            upcomingPosts.push({ row: i + 1, caption, date, status: row[12] || 'Pending' });
        }
    }

    // Summary
    console.log('📊 SUMMARY');
    console.log(`  Total Posts   : ${total}`);
    console.log(`  ✅ Published  : ${published}`);
    console.log(`  🕐 Scheduled  : ${scheduled}`);
    console.log(`  ❌ Failed     : ${failed}`);
    console.log(`  ⏳ Pending    : ${pending}`);
    console.log();

    // Scheduled posts
    if (scheduledPosts.length > 0) {
        console.log('🕐 SCHEDULED (queued in Meta Content Planner):');
        scheduledPosts.forEach(p => {
            console.log(`  Row ${p.row} | ${p.date} | ${p.caption}...`);
        });
        console.log();
    }

    // Failed posts
    if (failedPosts.length > 0) {
        console.log('❌ FAILED POSTS (need retry — change status to "Scheduled" in sheet):');
        failedPosts.forEach(p => {
            console.log(`  Row ${p.row} | ${p.date} | ${p.caption}...`);
        });
        console.log();
    }

    // Pending posts (next up)
    if (upcomingPosts.length > 0) {
        console.log('⏳ PENDING POSTS (upcoming, not yet processed):');
        upcomingPosts.slice(0, 5).forEach(p => {
            console.log(`  Row ${p.row} | ${p.date} | [${p.status}] | ${p.caption}...`);
        });
        if (upcomingPosts.length > 5) console.log(`  ... and ${upcomingPosts.length - 5} more`);
        console.log();
    }

    console.log('========================================\n');
}

checkSheet().catch(console.error);
