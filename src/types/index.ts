export type PropertyType = 'House' | 'Apartment' | 'Townhouse' | 'Unit' | 'Land';

export type PropertyStatus = 'Active' | 'Sold' | 'Off Market' | 'Withdrawn';

export interface Property {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSize: number;
  currentPrice: number | null;
  status: PropertyStatus;
  imageUrl?: string;
}

export type EventType =
  | 'NEW_LISTING'
  | 'PRICE_DROP'
  | 'PRICE_INCREASE'
  | 'LISTING_WITHDRAWN'
  | 'RELISTED';

export interface PropertyEvent {
  id: string;
  propertyId: string;
  type: EventType;
  previousValue: string | number | null;
  newValue: string | number | null;
  detectedAt: string; // ISO date string
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export type SignalType =
  | 'PRICE_DROP'
  | 'PRICE_INCREASE'
  | 'LOCATION_MATCH'
  | 'BUDGET_MATCH'
  | 'PROPERTY_TYPE_MATCH'
  | 'NEW_LISTING'
  | 'LISTING_WITHDRAWN'
  | 'RELISTED';

export type SignalImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Signal {
  id: string;
  propertyId: string;
  eventId: string;
  type: SignalType;
  label: string;
  description: string;
  impact: SignalImpact;
}

export type OpportunityPriority = 'LOW' | 'MODERATE' | 'HIGH' | 'PRIORITY';

export interface Opportunity {
  id: string;
  propertyId: string;
  eventId: string;
  score: number; // 0-100
  priority: OpportunityPriority;
  signals: Signal[];
  aiSummary: {
    overview: string;
    keyReasons: string[];
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestedAction: string;
  };
  detectedAt: string; // ISO date string
}

export interface MonitoringCriteria {
  locations: string[]; // e.g., ["Parramatta NSW", "Chatswood NSW"]
  propertyTypes: PropertyType[];
  priceRange: {
    min: number;
    max: number;
  };
  minBedrooms: number;
  priorityEvents: EventType[];
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  location?: string;
  eventTypes?: EventType[];
  minimumScore?: number;
  matchingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  name: string;
  type: EventType | 'HIGH_OPPORTUNITY';
  condition: string;
  location: string;
  isActive: boolean;
}
