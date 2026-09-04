import type { Property, PropertyEvent, Opportunity, Signal, SignalImpact, PropertyType, PropertyStatus, OpportunityPriority, SignalType } from '../types';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1e8741a50e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
];

export function mapDatabaseProperty(dbProp: any): Property {
  const idNum = typeof dbProp.id === 'number' ? dbProp.id : parseInt(String(dbProp.id), 10) || 0;
  const imageIndex = Math.abs(idNum) % SAMPLE_IMAGES.length;

  return {
    id: dbProp.id.toString(),
    address: dbProp.street_address || dbProp.address || 'Unknown Address',
    suburb: dbProp.suburb_name || 'Unknown Suburb',
    state: dbProp.state_code || 'NSW',
    postcode: dbProp.postcode || '',
    type: (dbProp.property_type || (dbProp.address?.toLowerCase().includes('apartment') || dbProp.address?.toLowerCase().includes('/') ? 'Apartment' : 'House')) as PropertyType,
    bedrooms: dbProp.bedrooms || 2,
    bathrooms: dbProp.bathrooms || 1,
    parking: dbProp.garages || 1,
    landSize: dbProp.land_size ? parseInt(dbProp.land_size, 10) : 0,
    currentPrice: dbProp.price_numeric || 750000,
    status: (dbProp.listing_status || 'Active') as PropertyStatus,
    imageUrl: dbProp.imageUrl || dbProp.image_url || SAMPLE_IMAGES[imageIndex]
  };
}

export function mapDatabaseEvent(dbEvent: any): PropertyEvent {
  const payload = dbEvent.payload || {};
  return {
    id: dbEvent.id.toString(),
    propertyId: dbEvent.property_id.toString(),
    type: dbEvent.event_type || 'NEW_LISTING',
    previousValue: payload.previous_price || null,
    newValue: payload.new_price || null,
    detectedAt: dbEvent.detected_at || new Date().toISOString(),
    importance: 'MEDIUM'
  };
}

export function mapDatabaseOpportunity(
  dbEvent: any, 
  dbScore: any, 
  dbExplanation: any, 
  dbFactors: any[]
): Opportunity {
  
  const signals: Signal[] = (dbFactors || []).map(f => {
    let impact: SignalImpact = 'MEDIUM';
    if (f.contribution > 0.2) impact = 'HIGH';
    else if (f.contribution < 0) impact = 'LOW';
    
    return {
      id: f.id.toString(),
      propertyId: dbEvent.property_id.toString(),
      eventId: dbEvent.id.toString(),
      type: 'PRICE_DROP' as SignalType, // Fallback, could map from factor_key
      label: (f.factor_key || 'Factor').replace(/_/g, ' '),
      description: `Factor value: ${f.factor_value}, Weight: ${f.weight}`,
      impact
    };
  });

  let priority: OpportunityPriority = 'MODERATE';
  const score = dbScore?.score || 0;
  if (score > 0.8) priority = 'HIGH';
  else if (score > 0.6) priority = 'MODERATE';
  else priority = 'LOW';

  return {
    id: dbEvent.id.toString(), // Using event ID as opportunity ID
    propertyId: dbEvent.property_id.toString(),
    eventId: dbEvent.id.toString(),
    score: Math.round(score * 100),
    priority,
    signals,
    aiSummary: {
      overview: dbExplanation?.explanation_text || 'No AI explanation available.',
      keyReasons: ['Score factor analysis', 'Market comparison'],
      confidence: 'MEDIUM',
      suggestedAction: 'Review property details and signals.'
    },
    detectedAt: dbEvent.detected_at || new Date().toISOString()
  };
}
