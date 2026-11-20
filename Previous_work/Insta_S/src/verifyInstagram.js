require('dotenv').config();
const axios = require('axios');

const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
const ACCESS_TOKEN  = process.env.IG_ACCESS_TOKEN;
const API_VERSION   = 'v19.0';
const BASE          = `https://graph.facebook.com/${API_VERSION}`;

/**
 * Verifies Instagram API credentials before starting the server.
 * Returns true if all checks pass, false if critical checks fail.
 */
async function verifyInstagramConfig() {
    console.log('\n🔍 Verifying Instagram configuration...');

    // ── 1. Env values present ───────────────────────────────────────────────
    if (!ACCESS_TOKEN || !IG_ACCOUNT_ID) {
        console.error('   ❌ IG_ACCESS_TOKEN or IG_ACCOUNT_ID missing in .env');
        return false;
    }

    // ── 2. Token validity ───────────────────────────────────────────────────
    try {
        const { data } = await axios.get(`${BASE}/debug_token`, {
            params: { input_token: ACCESS_TOKEN, access_token: ACCESS_TOKEN },
            timeout: 10000
        });
        const d = data.data;

        if (!d.is_valid) {
            console.error('   ❌ Access token is INVALID. Please generate a new token.');
            return false;
        }

        let expiry = 'Never (non-expiring)';
        if (d.expires_at) {
            const exp  = new Date(d.expires_at * 1000);
            const days = Math.round((exp - Date.now()) / 86400000);
            if (days < 0) {
                console.error(`   ❌ Access token EXPIRED ${Math.abs(days)} days ago. Please renew it.`);
                return false;
            }
            expiry = `${exp.toLocaleDateString()} (${days} days left)`;
        }
        console.log(`   ✅ Token valid — expires: ${expiry}`);
        console.log(`   ✅ Scopes: ${(d.scopes || []).join(', ') || 'N/A'}`);
    } catch (err) {
        console.error('   ❌ Token check failed:', err.response?.data?.error?.message || err.message);
        return false;
    }

    // ── 3. Account reachable ────────────────────────────────────────────────
    try {
        const { data } = await axios.get(`${BASE}/${IG_ACCOUNT_ID}`, {
            params: { fields: 'id,username,name', access_token: ACCESS_TOKEN },
            timeout: 10000
        });
        console.log(`   ✅ Account: @${data.username || data.name || data.id} (ID: ${data.id})`);
    } catch (err) {
        const e = err.response?.data?.error;
        // Non-fatal — some account types don't expose all fields
        console.warn(`   ⚠️  Account fetch warning: ${e?.message || err.message}`);
    }

    // ── 4. Publishing quota ─────────────────────────────────────────────────
    try {
        const { data } = await axios.get(`${BASE}/${IG_ACCOUNT_ID}/content_publishing_limit`, {
            params: { fields: 'config,quota_usage', access_token: ACCESS_TOKEN },
            timeout: 10000
        });
        const q = data.data?.[0];
        if (q) {
            const used  = q.quota_usage ?? '?';
            const limit = q.config?.quota_total ?? 100;
            console.log(`   ✅ Publish quota: ${used}/${limit} used today`);
        } else {
            console.log('   ✅ Publishing API accessible');
        }
    } catch (err) {
        const e = err.response?.data?.error;
        if (e?.code === 3) {
            console.error('   ❌ Publishing access denied (#3). App may need Live Mode or token refresh.');
            return false;
        }
        console.warn(`   ⚠️  Quota check warning: ${e?.message || err.message}`);
    }

    console.log('   ✅ Instagram configuration OK\n');
    return true;
}

module.exports = { verifyInstagramConfig };
