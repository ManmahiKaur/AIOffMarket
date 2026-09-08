import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Bypass RLS
const PROPRADAR_API_KEY = process.env.PROPRADAR_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !PROPRADAR_API_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SUBURBS_TO_SYNC = [
  { state: 'VIC', suburb: 'Pascoe Vale' },
  { state: 'VIC', suburb: 'Richmond' },
  { state: 'NSW', suburb: 'Parramatta' }
];

async function syncPropRadar() {
  console.log("Starting PropRadar Sync...");
  let totalImported = 0;
  
  for (const { state, suburb } of SUBURBS_TO_SYNC) {
    let cursor = null;
    let pageCount = 0;
    const maxPages = 2; // Protect Free plan quota (50 requests/mo)
    
    console.log(`Syncing ${suburb}, ${state}...`);
    
    do {
      pageCount++;
      const url = new URL(`https://api.propradar.com.au/v1/suburbs/${state}/${encodeURIComponent(suburb)}/listings`);
      if (cursor) url.searchParams.set('cursor', cursor);
      
      const response = await fetch(url.toString(), {
        headers: { 'X-API-Key': PROPRADAR_API_KEY }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch PropRadar data for ${suburb}: ${response.status} ${await response.text()}`);
        break;
      }
      
      const data = await response.json();
      
      if (!data.listings || data.listings.length === 0) {
        break;
      }

      // Map to Supabase schema based on actual schema
      const mappedProperties = data.listings.map(p => {
        const fullAddress = p.address || '';
        const streetAddress = fullAddress.split(',')[0]?.trim();
        return {
          external_id: p.property_id,
          url: `https://propradar.com.au/property/${p.property_id}`,
          address: fullAddress,
          street_address: streetAddress,
          suburb_name: suburb,
          state_code: state,
          property_type: p.property_type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          garages: p.parking,
          land_size: p.land_size ? p.land_size.toString() : null,
          price_numeric: p.asking_price_low || p.asking_price_high || 0,
          price: (p.asking_price_low || p.asking_price_high) ? `$${(p.asking_price_low || p.asking_price_high)}` : null,
          source: 'propradar',
          created_at: p.added_at || new Date().toISOString()
        };
      });

      // Insert to Supabase, checking for existing records manually
      let newCount = 0;
      for (const prop of mappedProperties) {
        const { data: existing, error: findErr } = await supabase
          .from('properties')
          .select('id')
          .eq('external_id', prop.external_id)
          .limit(1);
          
        if (findErr) {
          console.error("Supabase find error:", findErr.message);
          continue;
        }

        if (existing && existing.length > 0) {
          // Update existing
          await supabase.from('properties').update(prop).eq('id', existing[0].id);
        } else {
          // Insert new
          const { error: insErr } = await supabase.from('properties').insert(prop);
          if (insErr) {
            console.error("Supabase insert error:", insErr.message);
          } else {
            newCount++;
          }
        }
      }
      totalImported += newCount;
      console.log(`  Imported ${newCount} new records, updated existing. (Page ${pageCount})`);
      
      cursor = data.pagination?.next_cursor;
      
    } while (cursor && pageCount < maxPages);
  }
  
  console.log(`Sync complete. Total imported/updated: ${totalImported}`);
  return { success: true, imported: totalImported };
}

// If executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncPropRadar();
}

export { syncPropRadar };
