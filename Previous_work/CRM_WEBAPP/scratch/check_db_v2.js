const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log("--- Detailed Campaigns ---");
  const { data: campaigns } = await supabase.from('campaigns').select('id, name, agent_id, status');
  console.table(campaigns);

  console.log("\n--- Detailed Calls ---");
  const { data: calls } = await supabase.from('calls').select('id, campaign_id, lead_id, agent_id, status, duration_sec, room_name, created_at').order('created_at', { ascending: false }).limit(5);
  console.table(calls);
  
  console.log("\n--- Agents ---");
  const { data: agents } = await supabase.from('agents').select('id, name');
  console.table(agents);
}

checkData();
