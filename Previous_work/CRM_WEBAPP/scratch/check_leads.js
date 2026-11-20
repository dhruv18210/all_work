const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLeads() {
  const { data, error } = await supabase.from('leads').select('status');
  if (error) {
    console.error(error);
    return;
  }
  console.log('Lead Statuses:', data.map(l => l.status));
}

checkLeads();
