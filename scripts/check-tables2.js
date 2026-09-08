import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tablesToTest = ['watchlists', 'saved_properties', 'alerts', 'ai_explanations', 'opportunity_scores', 'score_factors', 'events', 'properties'];

async function testTables() {
  for (const table of tablesToTest) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') { // relation does not exist
      console.log(`❌ Table missing: ${table}`);
    } else if (error) {
      console.log(`⚠️ Table exists but error: ${table} - ${error.message}`);
    } else {
      console.log(`✅ Table exists: ${table}`);
    }
  }
}

testTables();
