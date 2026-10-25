/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import {
  calculateHaversineDistanceKm,
  estimateTravelTimeMinutes,
  calculateDayRouteStats,
  parseTimeToMinutes,
  formatMinutesToTime,
  optimizeDayRoute,
  formatCurrency,
  formatDuration,
} from '../utils/geo';
import {
  encodeTripToUrl,
  decodeTripFromUrl,
  generateShareUrl,
  exportTripToJsonFile,
} from '../utils/share';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('Geo Utilities', () => {
  it('calculates Haversine distance correctly', () => {
    const dist = calculateHaversineDistanceKm(-7.7956, 110.3695, -7.752, 110.4914);
    expect(dist).toBeGreaterThan(0);
  });

  it('estimates travel time for various distances', () => {
    expect(estimateTravelTimeMinutes(0.05)).toBe(2);
    expect(estimateTravelTimeMinutes(0.5)).toBeGreaterThanOrEqual(3);
    expect(estimateTravelTimeMinutes(10)).toBeGreaterThan(15);
  });

  it('calculates day route stats for empty and multi-destination days', () => {
    expect(calculateDayRouteStats([])).toEqual({
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      segments: [],
    });

    const singleDest = [PRESET_TRIPS[0].days[0].destinations[0]];
    expect(calculateDayRouteStats(singleDest)).toEqual({
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      segments: [],
    });

    const multiDest = PRESET_TRIPS[0].days[0].destinations;
    const stats = calculateDayRouteStats(multiDest);
    expect(stats.totalDistanceKm).toBeGreaterThan(0);
    expect(stats.segments.length).toBe(multiDest.length - 1);
  });

  it('parses time strings to minutes and formats minutes back to time', () => {
    expect(parseTimeToMinutes('08:30')).toBe(510);
    expect(parseTimeToMinutes('invalid')).toBe(540); // default 09:00
    expect(formatMinutesToTime(510)).toBe('08:30');
    expect(formatMinutesToTime(0)).toBe('00:00');
  });

  it('optimizes day route for <= 2 destinations and > 2 destinations', () => {
    const smallDests = PRESET_TRIPS[0].days[0].destinations.slice(0, 2);
    const smallResult = optimizeDayRoute(smallDests);
    expect(smallResult.optimizedDestinations).toEqual(smallDests);

    const largeDests = PRESET_TRIPS[0].days[0].destinations;
    const largeResult = optimizeDayRoute(largeDests);
    expect(largeResult.optimizedDestinations.length).toBe(largeDests.length);
  });

  it('formats currencies accurately', () => {
    expect(formatCurrency(100000, 'IDR')).toContain('100');
    expect(formatCurrency(50, 'USD')).toContain('50');
    expect(formatCurrency(50, 'EUR')).toContain('50');
    expect(formatCurrency(50, 'SGD')).toContain('50');
    expect(formatCurrency(50, 'MYR')).toContain('50');
    expect(formatCurrency(50, 'JPY')).toContain('50');
    expect(formatCurrency(50, 'AUD')).toContain('AUD');
  });

  it('formats duration strings', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(60)).toBe('1 jam');
    expect(formatDuration(90)).toBe('1j 30m');
  });
});

describe('Share Utilities', () => {
  it('encodes and decodes trip for sharing', () => {
    const trip = PRESET_TRIPS[0];
    const encoded = encodeTripToUrl(trip);
    expect(typeof encoded).toBe('string');
    const decoded = decodeTripFromUrl(encoded);
    expect(decoded).toEqual(trip);
  });

  it('handles invalid decoding gracefully', () => {
    expect(decodeTripFromUrl('invalid-base64-!!!')).toBeNull();
    expect(decodeTripFromUrl('e30=')).toBeNull(); // {}
  });

  it('generates share url', () => {
    const trip = PRESET_TRIPS[0];
    const url = generateShareUrl(trip);
    expect(url).toContain('trip=');
  });

  it('exports trip to JSON file', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const trip = PRESET_TRIPS[0];
    expect(() => exportTripToJsonFile(trip)).not.toThrow();

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');
  });
});
