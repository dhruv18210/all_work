const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFK() {
  const { data, error } = await supabase.from('calls').select('*, campaigns(*)').limit(1);
  if (error) {
    console.log("Join failed:", error.message);
  } else {
    console.log("Join success!");
  }
}

checkFK();
