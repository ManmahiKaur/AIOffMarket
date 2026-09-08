import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAlerts() {
  const { data, error } = await supabase.from('alerts').select('*').limit(1);
  if (error) {
    console.error('Error querying alerts:', error);
  } else {
    console.log('Alerts data:', data);
    if (data.length === 0) {
      // Trigger an insert error to see constraints
      const { error: insertErr } = await supabase.from('alerts').insert([{}]);
      console.log('Insert error:', insertErr);
    }
  }
}

checkAlerts();
