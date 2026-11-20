
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkDb() {
  const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
  console.log('Org Count:', orgCount);

  const { data: orgs } = await supabase.from('organizations').select('id, name');
  console.log('Organizations List:', orgs);

  const { count: callCount } = await supabase.from('calls').select('*', { count: 'exact', head: true });
  console.log('Call Count:', callCount);
}

checkDb();
