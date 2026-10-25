/**
 * Data structures for RoamPlan — Smart Trip Planner
 */

export type DestinationCategory = 'sightseeing' | 'culinary' | 'hotel' | 'shopping' | 'transit' | 'nature';

export interface Destination {
  id: string;
  title: string;
  category: DestinationCategory;
  startTime: string; // e.g. "09:00"
  durationMinutes: number; // e.g. 90
  cost: number; // in active currency
  lat: number;
  lng: number;
  address?: string;
  notes?: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  themeTitle?: string; // e.g. "Wisata Candi & Senja"
  destinations: Destination[];
}

export interface TripPlan {
  id: string;
  title: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  currency: 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR' | 'JPY';
  totalBudget: number;
  days: DayPlan[];
}

export interface RouteSegment {
  fromId: string;
  toId: string;
  fromTitle: string;
  toTitle: string;
  distanceKm: number;
  estimatedMinutes: number;
}

export interface DayRouteStats {
  totalDistanceKm: number;
  totalTravelMinutes: number;
  segments: RouteSegment[];
}
