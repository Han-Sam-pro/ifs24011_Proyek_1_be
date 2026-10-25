/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { POPULAR_CITIES, getCoordinatesForCityName } from '../data/cityData';

describe('City Data Helpers', () => {
  it('validates POPULAR_CITIES array', () => {
    expect(Array.isArray(POPULAR_CITIES)).toBe(true);
    expect(POPULAR_CITIES.length).toBeGreaterThan(0);
    POPULAR_CITIES.forEach((city) => {
      expect(city.id).toBeDefined();
      expect(city.cityName).toBeDefined();
      expect(city.lat).toBeTypeOf('number');
      expect(city.lng).toBeTypeOf('number');
    });
  });

  it('gets coordinates for matched popular cities', () => {
    const jogjaCoords = getCoordinatesForCityName('Yogyakarta');
    expect(jogjaCoords.lat).toBe(-7.7956);

    const baliCoords = getCoordinatesForCityName('bali');
    expect(baliCoords.lat).toBe(-8.4095);
  });

  it('gets coordinates for fallback cities and unknown city', () => {
    expect(getCoordinatesForCityName('Semarang')).toEqual({ lat: -6.9667, lng: 110.4167 });
    expect(getCoordinatesForCityName('Malang')).toEqual({ lat: -7.9666, lng: 112.6326 });
    expect(getCoordinatesForCityName('Medan')).toEqual({ lat: 3.5952, lng: 98.6722 });
    expect(getCoordinatesForCityName('Makassar')).toEqual({ lat: -5.1477, lng: 119.4327 });
    expect(getCoordinatesForCityName('Solo')).toEqual({ lat: -7.5755, lng: 110.8243 });
    expect(getCoordinatesForCityName('Palembang')).toEqual({ lat: -2.9761, lng: 104.7754 });
    expect(getCoordinatesForCityName('Manado')).toEqual({ lat: 1.4748, lng: 124.8428 });
    expect(getCoordinatesForCityName('Batam')).toEqual({ lat: 1.1299, lng: 104.0529 });
    expect(getCoordinatesForCityName('Paris')).toEqual({ lat: 48.8566, lng: 2.3522 });
    expect(getCoordinatesForCityName('London')).toEqual({ lat: 51.5074, lng: -0.1278 });
    expect(getCoordinatesForCityName('Sydney')).toEqual({ lat: -33.8688, lng: 151.2093 });

    // Unknown city defaults to Jakarta
    expect(getCoordinatesForCityName('Unknown City XYZ')).toEqual({ lat: -6.2088, lng: 106.8456 });
  });
});
