const LIVE_DB_URL = (process.env.VITE_LIVE_DATABASE_URL || '').replace(/\/$/, '');

async function dbFetch(endpoint, options = {}) {
  const url = `${LIVE_DB_URL}/${endpoint.replace(/^\//, '')}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB Error [${res.status}]: ${text}`);
  }
  return res.json();
}

async function generateData() {
  if (!LIVE_DB_URL) {
    console.error('Error: VITE_LIVE_DATABASE_URL is not set.');
    return;
  }

  console.log('Fetching properties from live database...');
  try {
    const properties = await dbFetch('properties?select=*');
    console.log(`Found ${properties.length} properties. Generating events...`);

    let eventsInserted = 0;
    let scoresInserted = 0;

    const batchSize = 100;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      const propertyIds = batch.map(p => p.id);
      
      const existingEvents = await dbFetch(`events?select=property_id&property_id=in.(${propertyIds.join(',')})`);
      const existingPropertyIdsWithEvents = new Set((existingEvents || []).map(e => e.property_id));

      const eventsToInsert = [];

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
          eventType = 'RELISTED';
        }

        eventsToInsert.push({
          property_id: prop.id,
          event_type: eventType,
          payload: { reason: 'POC Generated Signal' },
          detected_at: new Date().toISOString()
        });
      }

      if (eventsToInsert.length > 0) {
        const insertedEvents = await dbFetch('events', {
          method: 'POST',
          body: JSON.stringify(eventsToInsert),
        });

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
          await dbFetch('opportunity_scores', {
            method: 'POST',
            body: JSON.stringify(scoresToInsert),
          });
          scoresInserted += scoresToInsert.length;
        }
      }
    }

    console.log(`Generation complete. Inserted ${eventsInserted} events and ${scoresInserted} scores.`);
  } catch (err) {
    console.error('Data generation error:', err);
  }
}

generateData();
