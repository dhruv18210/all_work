const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupWorkflows() {
  // Create table if not exists
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        trigger TEXT NOT NULL,
        action TEXT NOT NULL,
        enabled BOOLEAN DEFAULT true,
        last_run TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (tableError) {
    // If RPC is not available, we assume the table might need to be created manually or it already exists.
    // For this environment, we'll try to insert a seed if the table exists.
    console.log('RPC exec_sql failed, attempting direct seed...');
  }

  // Seed some data for the current organization
  const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
  if (!org) return;

  const { error: seedError } = await supabase.from('workflows').upsert([
    { 
      organization_id: org.id,
      name: 'Instant Lead Response', 
      trigger: 'New Lead Added', 
      action: 'Trigger AI Call', 
      enabled: true 
    },
    { 
      organization_id: org.id,
      name: 'Retry Missed Calls', 
      trigger: 'Call Status: Busy/No Answer', 
      action: 'Schedule Retry (2 hours)', 
      enabled: true 
    },
    { 
      organization_id: org.id,
      name: 'Qualified Lead Alert', 
      trigger: 'Lead Status: Qualified', 
      action: 'Send Webhook / Slack', 
      enabled: false 
    }
  ], { onConflict: 'name, organization_id' });

  if (seedError) console.error('Seed error:', seedError);
  else console.log('Workflows seeded successfully');
}

setupWorkflows();
