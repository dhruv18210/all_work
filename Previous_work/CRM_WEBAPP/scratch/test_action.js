const { getCampaigns } = require('../src/app/actions/campaigns');
require('dotenv').config({ path: '.env' });

// Mock session/cookies if needed, but getCampaigns uses auth-utils which uses next/headers
// This might fail in a raw node environment if it tries to access cookies()
// I'll try to run it and see.

async function testAction() {
  try {
    const result = await getCampaigns();
    console.log("Result success:", result.success);
    if (result.success) {
      console.log("Campaigns count:", result.campaigns.length);
      result.campaigns.forEach(c => {
        console.log(`Campaign: ${c.name} (${c.id})`);
        console.log(` - Calls count: ${c.calls?.length || 0}`);
        if (c.calls && c.calls.length > 0) {
          console.log(` - First call status: ${c.calls[0].status}`);
        }
      });
    }
  } catch (err) {
    console.error("Action failed:", err);
  }
}

testAction();
