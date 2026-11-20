const cron = require('node-cron');
const moment = require('moment-timezone');
const { getScheduledPosts, updatePostStatus } = require('./googleSheets');
const { postToInstagram, scheduleToInstagram } = require('./instagram');
// Reading and writing directly from Google Sheets API (Excel sync bypassed for faster run times)

require('dotenv').config();

const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';

// Columns in Sheet "Content":
// F (Index 5): Post Caption
// H (Index 7): Sceduled Date (e.g., 24 May 2025)
// M (Index 12): Final Status
// Q (Index 16): Image URL
const SHEET_NAME = 'Content';

// Meta requires scheduled_publish_time to be at least 10 minutes in the future
const META_MIN_SCHEDULE_MINUTES = 10;
// Meta allows scheduling at most 75 days in the future
const META_MAX_SCHEDULE_DAYS = 75;

const getDirectImageUrl = (url) => {
    // Convert Google Drive viewer links to direct download links
    if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
    }
    return url;
};

const processScheduledPosts = async () => {
    console.log(`\n[${moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss')}] Checking scheduled posts directly from Google Sheets...`);

    // Fetch all rows from row 1 to column R directly from Google Sheets API
    const rows = await getScheduledPosts(`${SHEET_NAME}!A1:R`);

    if (rows.length <= 2) {
        console.log('No posts found in the sheet.');
        return;
    }

    const currentTime = moment().tz(TIMEZONE);

    // Step 3: Loop starting from row index 2 (corresponds to row 3 in Excel/Sheets)
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const rowNumber = i + 1; // index 2 corresponds to row 3
        const caption = row[5];
        let scheduledTimeStr = row[7];
        const status = row[12];
        let imageUrl = row[16];
        const timeStr = row[17];

        if (!imageUrl || !scheduledTimeStr) continue;

        // If time is provided in Column R, append it to the date
        if (timeStr) {
            // Remove any existing time portion safely without breaking dates that have spaces (like '25 May 2026')
            const timeRegex = /\s+\d{1,2}:\d{2}(:\d{2})?$/;
            scheduledTimeStr = scheduledTimeStr.replace(timeRegex, '');
            scheduledTimeStr = `${scheduledTimeStr} ${timeStr}`;
        }

        // Convert URL if it's a Google Drive link
        imageUrl = getDirectImageUrl(imageUrl);

        // Only process if status is empty or 'Pending' (skip Published/Scheduled/Failed/Removed)
        const statusVal = (status || '').toString().trim().toLowerCase();
        if (statusVal && statusVal !== 'pending') continue;

        // Parse scheduled time with support for multiple formats
        const DATE_FORMATS = [
            "DD MMM YYYY HH:mm:ss",
            "DD MMM YYYY HH:mm",
            "DD MMM YYYY",
            "DD MMMM YYYY HH:mm:ss",
            "DD MMMM YYYY HH:mm",
            "DD MMMM YYYY",
            "DD MMMM YY HH:mm:ss",
            "DD MMMM YY HH:mm",
            "DD MMMM YY",
            "YYYY-MM-DD HH:mm:ss",
            "YYYY-MM-DD HH:mm",
            "YYYY-MM-DD",
            "DD/MM/YYYY HH:mm:ss",
            "DD/MM/YYYY HH:mm",
            "DD/MM/YYYY",
            "MM/DD/YYYY HH:mm:ss",
            "MM/DD/YYYY HH:mm",
            "MM/DD/YYYY"
        ];
        let scheduledTime = moment.tz(scheduledTimeStr, DATE_FORMATS, TIMEZONE);

        if (!scheduledTime.isValid()) {
            console.log(`⚠️  [Row ${rowNumber}] Invalid date format: "${scheduledTimeStr}" — skipping.`);
            continue;
        }

        const statusCell = `${SHEET_NAME}!M${rowNumber}`; // Column M is 'Final Status'
        const minutesUntilPost = scheduledTime.diff(currentTime, 'minutes');
        const daysUntilPost = scheduledTime.diff(currentTime, 'days');

        // ─── CASE 1: Post is due now (past or exact time) → Publish immediately ───
        if (minutesUntilPost <= 0) {
            console.log(`\n📤 [Row ${rowNumber}] Post is due — publishing immediately to Instagram...`);
            console.log(`   Scheduled Time : ${scheduledTimeStr}`);
            console.log(`   Caption        : ${(caption || '').substring(0, 80).replace(/\n/g, ' ')}...`);
            console.log(`   Image URL      : ${imageUrl}`);

            const postId = await postToInstagram(imageUrl, caption);
            const finalStatus = postId ? 'Published' : 'FAILED';
            await updatePostStatus(statusCell, finalStatus);

            if (postId) {
                console.log(`\n✅ [Row ${rowNumber}] Successfully published! Instagram Post ID: ${postId}`);
            } else {
                console.log(`\n❌ [Row ${rowNumber}] Failed to publish. Status set to FAILED.`);
            }
            console.log(`   ↳ Google Sheets Column M updated to: "${finalStatus}"`);

            // ─── CASE 2: Post is more than 75 days away → Cannot schedule via Meta API ───
        } else if (daysUntilPost > META_MAX_SCHEDULE_DAYS) {
            console.log(`\n⏭️  [Row ${rowNumber}] Scheduled too far ahead (${daysUntilPost} days). Meta only allows up to 75 days. Skipping.`);
            console.log(`   Scheduled Time : ${scheduledTimeStr}`);

            // ─── CASE 3: Future post (10 min – 75 days) → Wait and auto-publish at scheduled time ───
        } else {
            const hoursUntil = Math.floor(minutesUntilPost / 60);
            const minsRemaining = minutesUntilPost % 60;
            console.log(`\n⏳ [Row ${rowNumber}] Upcoming post — will auto-publish at scheduled time.`);
            console.log(`   Scheduled Time : ${scheduledTime.format('DD MMM YYYY HH:mm')} (${TIMEZONE})`);
            console.log(`   Time Remaining : ${hoursUntil}h ${minsRemaining}m`);
            console.log(`   Caption        : ${(caption || '').substring(0, 80).replace(/\n/g, ' ')}...`);
            // No action needed — scheduler will publish automatically when time arrives (CASE 1)
        }
    }
};

const startScheduler = () => {
    cron.schedule('* * * * *', () => {
        processScheduledPosts();
    });
    console.log('Scheduler started. Checking for posts every minute...');
    processScheduledPosts();
};

module.exports = {
    startScheduler,
    processScheduledPosts
};

