import { Destination, DayRouteStats, RouteSegment } from '../types/trip';

/**
 * Calculate the great-circle distance between two points on the Earth surface (Haversine formula).
 * Returns distance in kilometers (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimate travel time between two coordinates in minutes.
 * Assumes urban traffic average speed of ~30 km/h plus 4 minutes initial buffer.
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  if (distanceKm <= 0.1) return 2;
  const speedKmH = 30; // average city driving speed
  const baseMinutes = (distanceKm / speedKmH) * 60;
  const buffer = distanceKm > 1 ? 4 : 2;
  const total = Math.round(baseMinutes + buffer);
  return Math.max(3, total);
}

/**
 * Compute the route segments, total distance, and total travel time for a day's destinations.
 */
export function calculateDayRouteStats(destinations: Destination[]): DayRouteStats {
  if (destinations.length < 2) {
    return {
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      segments: [],
    };
  }

  const segments: RouteSegment[] = [];
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;

  for (let i = 0; i < destinations.length - 1; i++) {
    const from = destinations[i];
    const to = destinations[i + 1];
    const distanceKm = calculateHaversineDistanceKm(from.lat, from.lng, to.lat, to.lng);
    const estimatedMinutes = estimateTravelTimeMinutes(distanceKm);

    totalDistanceKm += distanceKm;
    totalTravelMinutes += estimatedMinutes;

    segments.push({
      fromId: from.id,
      toId: to.id,
      fromTitle: from.title,
      toTitle: to.title,
      distanceKm,
      estimatedMinutes,
    });
  }

  return {
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalTravelMinutes,
    segments,
  };
}

/**
 * Parse "HH:MM" into total minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length < 2) return 9 * 60; // default 09:00
  const hours = parseInt(parts[0], 10) || 0;
  const mins = parseInt(parts[1], 10) || 0;
  return hours * 60 + mins;
}

/**
 * Convert minutes from midnight to "HH:MM" format
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const wrapped = (totalMinutes % (24 * 60) + (24 * 60)) % (24 * 60);
  const hours = Math.floor(wrapped / 60);
  const mins = Math.floor(wrapped % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Smart Route Optimizer using Nearest Neighbor Traveling Salesperson Heuristic.
 * Keeps the 1st location (start anchor) as starting point, and visits nearest remaining point.
 * Recalculates start times dynamically based on visit duration + estimated travel time.
 */
export function optimizeDayRoute(destinations: Destination[]): {
  optimizedDestinations: Destination[];
  distanceSavedKm: number;
  timeSavedMinutes: number;
} {
  if (destinations.length <= 2) {
    return {
      optimizedDestinations: destinations,
      distanceSavedKm: 0,
      timeSavedMinutes: 0,
    };
  }

  const initialStats = calculateDayRouteStats(destinations);

  // Keep first point as anchor (starting base)
  const unvisited = [...destinations];
  const ordered: Destination[] = [];

  // Start with first element
  const startItem = unvisited.shift()!;
  ordered.push(startItem);

  let current = startItem;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const candidate = unvisited[i];
      const dist = calculateHaversineDistanceKm(current.lat, current.lng, candidate.lat, candidate.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextItem = unvisited.splice(nearestIndex, 1)[0];
    ordered.push(nextItem);
    current = nextItem;
  }

  // Now recalculate scheduled start times sequentially from the initial start time
  const initialStartMinutes = parseTimeToMinutes(ordered[0].startTime || '08:30');
  let currentMinutes = initialStartMinutes;

  const adjusted: Destination[] = ordered.map((dest, index) => {
    if (index === 0) {
      currentMinutes = initialStartMinutes + dest.durationMinutes;
      return dest;
    }

    // Distance from previous
    const prev = ordered[index - 1];
    const dist = calculateHaversineDistanceKm(prev.lat, prev.lng, dest.lat, dest.lng);
    const travelTime = estimateTravelTimeMinutes(dist);

    // Round start time to nearest 5 minutes
    const rawStart = currentMinutes + travelTime;
    const roundedStart = Math.ceil(rawStart / 5) * 5;

    const updated: Destination = {
      ...dest,
      startTime: formatMinutesToTime(roundedStart),
    };

    currentMinutes = roundedStart + dest.durationMinutes;
    return updated;
  });

  const finalStats = calculateDayRouteStats(adjusted);
  const distanceSavedKm = Math.max(0, Math.round((initialStats.totalDistanceKm - finalStats.totalDistanceKm) * 10) / 10);
  const timeSavedMinutes = Math.max(0, initialStats.totalTravelMinutes - finalStats.totalTravelMinutes);

  return {
    optimizedDestinations: adjusted,
    distanceSavedKm,
    timeSavedMinutes,
  };
}

/**
 * Format currency with international formatting standards
 */
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  switch (currency) {
    case 'IDR':
      return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;
    case 'USD':
      return `$${new Intl.NumberFormat('en-US').format(amount)}`;
    case 'EUR':
      return `€${new Intl.NumberFormat('de-DE').format(amount)}`;
    case 'SGD':
      return `S$${new Intl.NumberFormat('en-SG').format(amount)}`;
    case 'MYR':
      return `RM ${new Intl.NumberFormat('ms-MY').format(amount)}`;
    case 'JPY':
      return `¥${new Intl.NumberFormat('ja-JP').format(amount)}`;
    default:
      return `${currency} ${new Intl.NumberFormat().format(amount)}`;
  }
}

/**
 * Format duration nicely: "1j 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}
