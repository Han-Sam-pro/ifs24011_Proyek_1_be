/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredToken,
  setAuthSession,
  clearAuthSession,
  getStoredUser,
  registerUser,
  loginUser,
  getProfile,
  getUsersList,
  saveTrip,
  getUserTrips,
} from '../services/roamApi';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('RoamPlan API Service & Session Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('manages auth session storage correctly', () => {
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();

    const mockUser = { id: 1, name: 'Tester', email: 'tester@example.com' };
    setAuthSession('mock-token-123', mockUser);

    expect(getStoredToken()).toBe('mock-token-123');
    expect(getStoredUser()).toEqual(mockUser);

    clearAuthSession();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('handles invalid user JSON in localStorage', () => {
    localStorage.setItem('roamplan_user', 'invalid-json');
    expect(getStoredUser()).toBeNull();
  });

  it('calls registerUser API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', message: 'Registered successfully' }),
    } as Response);

    const res = await registerUser('John', 'john@example.com', 'secret123');
    expect(res.status).toBe('success');
  });

  it('handles registerUser network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'));

    const res = await registerUser('John', 'john@example.com', 'secret123');
    expect(res.status).toBe('fail');
    expect(res.message).toContain('Network offline');
  });

  it('calls loginUser API and sets session on success', async () => {
    const mockUser = { id: 10, name: 'Login User', email: 'login@example.com' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        message: 'Login success',
        data: { user: mockUser, token: 'jwt-123' },
      }),
    } as Response);

    const res = await loginUser('login@example.com', 'secret123');
    expect(res.status).toBe('success');
    expect(getStoredToken()).toBe('jwt-123');
  });

  it('handles loginUser failure or network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Auth failed'));

    const res = await loginUser('login@example.com', 'wrong');
    expect(res.status).toBe('fail');
  });

  it('fetches profile with getProfile', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Old Name', email: 'me@example.com' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        data: { user: { id: 1, name: 'Updated Name', email: 'me@example.com' } },
      }),
    } as Response);

    const profile = await getProfile();
    expect(profile?.name).toBe('Updated Name');
  });

  it('returns null from getProfile if not logged in or error', async () => {
    expect(await getProfile()).toBeNull();

    setAuthSession('jwt-123', { id: 1, name: 'Old', email: 'old@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Unauthorized'));
    expect(await getProfile()).toBeNull();
  });

  it('fetches users list with getUsersList', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        data: { users: [{ id: 1, name: 'User A', email: 'a@example.com' }] },
      }),
    } as Response);

    const list = await getUsersList();
    expect(list.length).toBe(1);
  });

  it('returns empty list from getUsersList if no token or error', async () => {
    expect(await getUsersList()).toEqual([]);

    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed'));
    expect(await getUsersList()).toEqual([]);
  });

  it('saves trip with saveTrip', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success' }),
    } as Response);

    const ok = await saveTrip(PRESET_TRIPS[0]);
    expect(ok).toBe(true);
  });

  it('returns false from saveTrip if no token or error', async () => {
    expect(await saveTrip(PRESET_TRIPS[0])).toBe(false);

    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Save error'));
    expect(await saveTrip(PRESET_TRIPS[0])).toBe(false);
  });

  it('fetches user trips with getUserTrips', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });

    const tripObj = PRESET_TRIPS[0];
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        data: { trips: [tripObj] },
      }),
    } as Response);

    const trips = await getUserTrips();
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/trips');
    expect(trips.length).toBe(1);
    expect(trips[0].id).toBe(tripObj.id);
  });

  it('returns empty array from getUserTrips if no token or error', async () => {
    expect(await getUserTrips()).toEqual([]);

    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Fetch error'));
    expect(await getUserTrips()).toEqual([]);
  });
});
