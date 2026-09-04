import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRole || supabaseAnonKey);

async function generateData() {
  console.log('Fetching properties...');
  const { data: properties, error: propsErr } = await supabase
    .from('properties')
    .select('*');

  if (propsErr) {
    console.error('Error fetching properties:', propsErr);
    return;
  }

  console.log(`Found ${properties.length} properties. Generating events...`);

  let eventsInserted = 0;
  let scoresInserted = 0;

  // Process in small batches
  const batchSize = 100;
  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);
    
    // Check which properties already have events to make it idempotent
    const propertyIds = batch.map(p => p.id);
    const { data: existingEvents } = await supabase
      .from('events')
      .select('property_id')
      .in('property_id', propertyIds);
      
    const existingPropertyIdsWithEvents = new Set((existingEvents || []).map(e => e.property_id));

    const eventsToInsert = [];
    const scoreRecordsMap = new Map(); // map event index to score object

    for (const prop of batch) {
      if (existingPropertyIdsWithEvents.has(prop.id)) {
        continue;
      }

      let eventType = 'NEW_LISTING';
      const statusStr = (prop.status || '').toLowerCase();
      
      if (statusStr.includes('withdrawn') || statusStr.includes('off market')) {
        eventType = 'WITHDRAWN';
      } else if (statusStr.includes('sold')) {
        eventType = 'SOLD';
      } else if (prop.price_numeric && prop.price_numeric < 500000) {
        eventType = 'RELISTED'; // Just for variety since PRICE_DROP is invalid
      }

      eventsToInsert.push({
        property_id: prop.id,
        event_type: eventType,
        payload: { reason: 'POC Generated Signal' },
        detected_at: new Date().toISOString()
      });
    }

    if (eventsToInsert.length > 0) {
      const { data: insertedEvents, error: insertErr } = await supabase
        .from('events')
        .insert(eventsToInsert)
        .select('id, property_id, event_type');

      if (insertErr) {
        console.error('Error inserting events:', insertErr);
        continue;
      }

      eventsInserted += insertedEvents.length;

      const scoresToInsert = insertedEvents.map(ev => {
        let baseScore = 50;
        if (ev.event_type === 'WITHDRAWN') baseScore = 85;
        else if (ev.event_type === 'RELISTED') baseScore = 75;
        else if (ev.event_type === 'NEW_LISTING') baseScore = 60;

        const finalScore = Math.min(100, Math.max(0, baseScore + (Math.random() * 10 - 5)));

        return {
          property_id: ev.property_id,
          score: finalScore / 100,
          computed_at: new Date().toISOString()
        };
      });

      if (scoresToInsert.length > 0) {
        const { error: scoresErr } = await supabase
          .from('opportunity_scores')
          .insert(scoresToInsert);
          
        if (scoresErr) {
          console.error('Error inserting scores:', scoresErr);
        } else {
          scoresInserted += scoresToInsert.length;
        }
      }
    }
  }

  console.log(`Generation complete. Inserted ${eventsInserted} events and ${scoresInserted} scores.`);
}

generateData();
