require('dotenv').config();
const { verifyInstagramConfig } = require('./src/verifyInstagram');

console.log('======================================');
console.log('  Instagram Automation — Starting Up');
console.log('======================================');

const requiredEnvs = [
    'GOOGLE_SHEET_ID',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'IG_ACCOUNT_ID',
    'IG_ACCESS_TOKEN'
];

const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missingEnvs.join(', ')}`);
    console.error('   Please configure them in your .env file.\n');
    process.exit(1);
}

// Run Instagram config check first, then start UI server
verifyInstagramConfig().then(ok => {
    if (!ok) {
        console.error('❌ Instagram configuration check FAILED.');
        console.error('   Fix the issues above before running the automation.\n');
        process.exit(1);
    }
    console.log('🚀 Starting UI server...');
    console.log('   Scheduler is MANUAL: use the UI or run: node run_once.js\n');
    require('./server');
}).catch(err => {
    console.error('\n❌ Startup error:', err.message);
    process.exit(1);
});
