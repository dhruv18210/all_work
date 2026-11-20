require('dotenv').config();
const axios = require('axios');

const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
const ACCESS_TOKEN  = process.env.IG_ACCESS_TOKEN;
const API_VERSION   = 'v19.0';
const BASE          = `https://graph.facebook.com/${API_VERSION}`;

async function verify() {
    console.log('\n========================================');
    console.log('  Instagram Configuration Verifier');
    console.log('========================================\n');

    // 1. Check token is present
    console.log('📋 Step 1: Checking .env values...');
    if (!ACCESS_TOKEN) { console.error('  ❌ IG_ACCESS_TOKEN is missing in .env'); process.exit(1); }
    if (!IG_ACCOUNT_ID) { console.error('  ❌ IG_ACCOUNT_ID is missing in .env'); process.exit(1); }
    console.log(`  ✅ IG_ACCOUNT_ID : ${IG_ACCOUNT_ID}`);
    console.log(`  ✅ IG_ACCESS_TOKEN: ${ACCESS_TOKEN.substring(0, 20)}... (truncated)\n`);

    // 2. Validate token & get token info
    console.log('📋 Step 2: Validating access token via /debug_token...');
    try {
        const r = await axios.get(`${BASE}/debug_token`, {
            params: {
                input_token: ACCESS_TOKEN,
                access_token: ACCESS_TOKEN
            }
        });
        const d = r.data.data;
        console.log(`  App ID       : ${d.app_id}`);
        console.log(`  Token Type   : ${d.type}`);
        console.log(`  Valid        : ${d.is_valid ? '✅ YES' : '❌ NO — TOKEN IS INVALID'}`);
        if (d.expires_at) {
            const exp = new Date(d.expires_at * 1000);
            const now = new Date();
            const diff = Math.round((exp - now) / (1000 * 60 * 60 * 24));
            console.log(`  Expires At   : ${exp.toLocaleString()} (${diff >= 0 ? `in ${diff} days` : `EXPIRED ${Math.abs(diff)} days ago ❌`})`);
        } else {
            console.log(`  Expires At   : Never (long-lived / system user token ✅)`);
        }
        if (d.scopes) console.log(`  Scopes       : ${d.scopes.join(', ')}`);
        if (!d.is_valid) {
            console.error('\n  ❌ TOKEN IS INVALID. Please generate a new access token.\n');
            process.exit(1);
        }
        console.log();
    } catch (err) {
        console.error('  ❌ Token validation failed:', err.response?.data?.error || err.message);
        process.exit(1);
    }

    // 3. Fetch IG account details
    console.log('📋 Step 3: Fetching Instagram account details...');
    try {
        const r = await axios.get(`${BASE}/${IG_ACCOUNT_ID}`, {
            params: {
                fields: 'id,name,username,account_type,followers_count,media_count',
                access_token: ACCESS_TOKEN
            }
        });
        const d = r.data;
        console.log(`  ✅ Account Found!`);
        console.log(`  ID           : ${d.id}`);
        console.log(`  Name         : ${d.name || 'N/A'}`);
        console.log(`  Username     : @${d.username || 'N/A'}`);
        console.log(`  Type         : ${d.account_type || 'N/A'}`);
        console.log(`  Followers    : ${d.followers_count ?? 'N/A'}`);
        console.log(`  Posts        : ${d.media_count ?? 'N/A'}`);
        console.log();
    } catch (err) {
        const e = err.response?.data?.error;
        console.error(`  ❌ Could not fetch account: ${e?.message || err.message}`);
        if (e?.code === 190) console.error('  → Token is expired or invalid. Generate a new one.');
        if (e?.code === 3)   console.error('  → App is in Development Mode & this account is NOT whitelisted.');
        if (e?.code === 100) console.error('  → IG_ACCOUNT_ID may be wrong.');
        console.log();
    }

    // 4. Check publish permissions
    console.log('📋 Step 4: Checking content publishing permissions...');
    try {
        const r = await axios.get(`${BASE}/${IG_ACCOUNT_ID}/content_publishing_limit`, {
            params: {
                fields: 'config,quota_usage',
                access_token: ACCESS_TOKEN
            }
        });
        const d = r.data.data?.[0];
        if (d) {
            console.log(`  ✅ Content Publishing API is accessible!`);
            console.log(`  Quota Usage  : ${d.quota_usage ?? 'N/A'}`);
            console.log(`  Daily Limit  : ${d.config?.quota_total ?? 'N/A'}`);
        } else {
            console.log('  ✅ Content Publishing limit endpoint responded (no quota data).');
        }
        console.log();
    } catch (err) {
        const e = err.response?.data?.error;
        console.error(`  ❌ Publishing check failed: ${e?.message || err.message}`);
        if (e?.code === 3) {
            console.error('  → ⚠️  WHITELIST ERROR: Your app is in Development Mode.');
            console.error('     Fix: Add the Instagram account owner as a Tester in Meta App Roles');
            console.error('     and make sure they ACCEPT the invite at facebook.com/settings.');
        }
        console.log();
    }

    console.log('========================================');
    console.log('  Verification Complete');
    console.log('========================================\n');
}

verify();
