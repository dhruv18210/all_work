require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const API_VERSION = 'v19.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

async function getInstagramAccountId() {
    console.log('\n🔍 Fetching linked Instagram Account IDs...');

    if (!ACCESS_TOKEN) {
        console.error('   ❌ IG_ACCESS_TOKEN is missing in .env');
        return;
    }

    try {
        // Step 1: Get Facebook Pages managed by the user
        const { data } = await axios.get(`${BASE}/me/accounts`, {
            params: {
                fields: 'name,instagram_business_account',
                access_token: ACCESS_TOKEN
            }
        });

        const pages = data.data;
        if (!pages || pages.length === 0) {
            console.log('   ❌ No Facebook Pages found for this user token.');
            return;
        }

        let found = false;
        pages.forEach(page => {
            console.log(`\n📄 Facebook Page: ${page.name} (ID: ${page.id})`);
            if (page.instagram_business_account) {
                console.log(`   ✅ Linked Instagram Account ID: ${page.instagram_business_account.id}`);
                found = true;
            } else {
                console.log('   ⚠️  No Instagram Business Account linked to this page.');
            }
        });

        if (!found) {
            console.log('\n❌ Could not find any linked Instagram Business Accounts.');
            console.log('   Make sure your Instagram account is a Professional/Business account');
            console.log('   and is correctly linked to your Facebook Page.');
        }

    } catch (err) {
        console.error('   ❌ API Error:', err.response?.data?.error?.message || err.message);
    }
    console.log();
}

getInstagramAccountId();
