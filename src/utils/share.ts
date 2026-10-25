import { TripPlan } from '../types/trip';

/**
 * Serialize a TripPlan to a URL-safe Base64 string
 */
export function encodeTripToUrl(trip: TripPlan): string {
  try {
    const jsonStr = JSON.stringify(trip);
    // Use UTF-8 safe base64 encoding
    const encoded = btoa(encodeURIComponent(jsonStr));
    return encoded;
  } catch (err) {
    console.error('Failed to encode trip plan', err);
    return '';
  }
}

/**
 * Decode a TripPlan from a URL-safe Base64 string
 */
export function decodeTripFromUrl(encodedStr: string): TripPlan | null {
  try {
    const jsonStr = decodeURIComponent(atob(encodedStr));
    const parsed = JSON.parse(jsonStr) as TripPlan;
    if (parsed && parsed.days && Array.isArray(parsed.days)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode trip plan from URL', err);
    return null;
  }
}

/**
 * Generate full shareable URL containing the current trip state
 */
export function generateShareUrl(trip: TripPlan): string {
  const encoded = encodeTripToUrl(trip);
  const url = new URL(window.location.href);
  url.searchParams.set('trip', encoded);
  return url.toString();
}

/**
 * Download the trip as a JSON file backup
 */
export function exportTripToJsonFile(trip: TripPlan): void {
  const jsonStr = JSON.stringify(trip, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const safeFilename = trip.title.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const link = document.createElement('a');
  link.href = url;
  link.download = `roamplan_${safeFilename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
