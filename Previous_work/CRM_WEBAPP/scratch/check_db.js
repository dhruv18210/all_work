const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log("--- Campaigns ---");
  const { data: campaigns } = await supabase.from('campaigns').select('id, name, leads_count');
  console.table(campaigns);

  console.log("\n--- Calls ---");
  const { data: calls } = await supabase.from('calls').select('id, campaign_id, status, duration_sec, room_name').limit(10);
  console.table(calls);
  
  console.log("\n--- campaign_leads ---");
  const { data: campaignLeads } = await supabase.from('campaign_leads').select('campaign_id, lead_id').limit(10);
  console.table(campaignLeads);
}

checkData();
