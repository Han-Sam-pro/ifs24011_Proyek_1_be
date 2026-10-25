/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';

import App from '../App';
import * as roamApi from '../services/roamApi';
import { PRESET_TRIPS } from '../data/presetTrips';
import type { TripPlan, Destination } from '../types/trip';

// Captures the props that App passes down, so each handler can be exercised directly.
const captured = vi.hoisted(() => ({
  planner: null as any,
  destination: null as any,
  share: null as any,
  city: null as any,
  auth: null as any,
  users: null as any,
}));

vi.mock('../pages/PlannerPage', () => ({
  PlannerPage: (props: any) => {
    captured.planner = props;
    return null;
  },
}));

vi.mock('../components/DestinationModal', () => ({
  DestinationModal: (props: any) => {
    captured.destination = props;
    return null;
  },
}));

vi.mock('../components/ShareModal', () => ({
  ShareModal: (props: any) => {
    captured.share = props;
    return null;
  },
}));

vi.mock('../components/CitySelectorModal', () => ({
  CitySelectorModal: (props: any) => {
    captured.city = props;
    return null;
  },
}));

vi.mock('../components/AuthModal', () => ({
  AuthModal: (props: any) => {
    captured.auth = props;
    return null;
  },
}));

vi.mock('../components/UsersDirectoryModal', () => ({
  UsersDirectoryModal: (props: any) => {
    captured.users = props;
    return null;
  },
}));

vi.mock('../services/roamApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/roamApi')>();
  return {
    ...actual,
    getStoredToken: vi.fn(),
    getStoredUser: vi.fn(),
    getProfile: vi.fn(),
    getUserTrips: vi.fn(),
    saveTrip: vi.fn(),
  };
});

const mockUser = { id: 10, name: 'Budi Santoso', email: 'budi@example.com' };

const sampleDestination: Destination = {
  id: 'dest-test-1',
  title: 'Pantai Uji',
  category: 'nature',
  startTime: '09:00',
  durationMinutes: 60,
  cost: 0,
  lat: -8.65,
  lng: 115.2,
};

// Always read the most recent props, since each App render replaces them.
const planner = () => captured.planner;

// Renders App with an authenticated user and waits until the planner has mounted.
async function renderAuthenticated() {
  vi.mocked(roamApi.getStoredToken).mockReturnValue('valid-token-123');
  vi.mocked(roamApi.getProfile).mockResolvedValue(mockUser);
  render(<App />);
  await waitFor(() => expect(planner()?.currentUser).toEqual(mockUser));
}

describe('App handlers', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    captured.planner = null;
    captured.destination = null;
    captured.share = null;
    captured.city = null;
    captured.auth = null;
    captured.users = null;

    vi.mocked(roamApi.getStoredToken).mockReturnValue(null);
    vi.mocked(roamApi.getStoredUser).mockReturnValue(null);
    vi.mocked(roamApi.getProfile).mockResolvedValue(null);
    vi.mocked(roamApi.getUserTrips).mockResolvedValue([]);
    vi.mocked(roamApi.saveTrip).mockResolvedValue(true);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects unauthenticated users away from the planner', () => {
    render(<App />);
    expect(captured.planner).toBeNull();
  });

  it('loads the profile of a stored session into currentUser', async () => {
    await renderAuthenticated();
    expect(roamApi.getProfile).toHaveBeenCalled();
  });

  describe('trip-level handlers', () => {
    beforeEach(async () => {
      await renderAuthenticated();
    });

    it('handleSelectPresetTrip replaces the trip and resets selection', async () => {
      const preset = PRESET_TRIPS[PRESET_TRIPS.length - 1];
      await act(async () => planner().handleSelectPresetTrip(preset));
      expect(planner().trip.id).toBe(preset.id);
      expect(planner().activeDayIndex).toBe(0);
      expect(planner().selectedDestinationId).toBeNull();
    });

    it('handleNewTrip creates a fresh single-day trip', async () => {
      await act(async () => planner().handleNewTrip());
      const trip: TripPlan = planner().trip;
      expect(trip.title).toBe('Perjalanan Baru Tanpa Judul');
      expect(trip.days).toHaveLength(1);
      expect(trip.days[0].destinations).toEqual([]);
    });

    it('handleAddDay appends a day and focuses it', async () => {
      const before = planner().trip.days.length;
      await act(async () => planner().handleAddDay());
      expect(planner().trip.days).toHaveLength(before + 1);
      expect(planner().trip.days[before].dayNumber).toBe(before + 1);
      expect(planner().activeDayIndex).toBe(before);
    });

    it('handleUpdateDayTheme updates theme and date of the given day', async () => {
      const dayId = planner().trip.days[0].id;
      await act(async () => planner().handleUpdateDayTheme(dayId, 'Tema Uji', '2030-01-02'));
      expect(planner().trip.days[0].themeTitle).toBe('Tema Uji');
      expect(planner().trip.days[0].date).toBe('2030-01-02');
    });

    it('handleUpdateTotalBudget and handleChangeCurrency update the trip', async () => {
      await act(async () => planner().handleUpdateTotalBudget(7500000));
      expect(planner().trip.totalBudget).toBe(7500000);

      await act(async () => planner().handleChangeCurrency('USD'));
      expect(planner().trip.currency).toBe('USD');
    });

    it('handleTriggerPrint calls window.print', async () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      await act(async () => planner().handleTriggerPrint());
      expect(printSpy).toHaveBeenCalled();
      printSpy.mockRestore();
    });

    it('opens the destination modal from the planner', async () => {
      await act(async () => planner().onOpenAddDestination());
      expect(captured.destination.isOpen).toBe(true);
    });

    it('handleOptimizeRoute runs without throwing on the current day', async () => {
      await act(async () => planner().handleOptimizeRoute());
      expect(planner().trip.days.length).toBeGreaterThan(0);
    });

    it('handlePickLocationFromMap stores coordinates and reopens the destination modal', async () => {
      await act(async () => planner().handlePickLocationFromMap(-6.2, 106.8));
      expect(captured.destination.isOpen).toBe(true);
      expect(captured.destination.pendingCoordinates).toEqual({ lat: -6.2, lng: 106.8 });
    });
  });

  describe('destination handlers', () => {
    beforeEach(async () => {
      await renderAuthenticated();
    });

    it('saves a destination into the active day from the destination modal', async () => {
      await act(async () => captured.destination.onSave(sampleDestination));
      const day = planner().trip.days[planner().activeDayIndex];
      expect(day.destinations.map((d: Destination) => d.title)).toContain('Pantai Uji');
    });

    it('moves a destination up and down within the active day', async () => {
      // Start from an empty day so only the test's own destinations are reordered.
      await act(async () => planner().handleNewTrip());
      const second: Destination = { ...sampleDestination, id: 'dest-test-2', title: 'Kedua' };
      await act(async () => captured.destination.onSave(sampleDestination));
      await act(async () => captured.destination.onSave(second));

      await act(async () => planner().handleMoveDestination(1, 'up'));
      let titles = planner().trip.days[planner().activeDayIndex].destinations.map((d: Destination) => d.title);
      expect(titles).toEqual(['Kedua', 'Pantai Uji']);

      await act(async () => planner().handleMoveDestination(0, 'down'));
      titles = planner().trip.days[planner().activeDayIndex].destinations.map((d: Destination) => d.title);
      expect(titles).toEqual(['Pantai Uji', 'Kedua']);
    });

    it('deletes a destination from the active day', async () => {
      await act(async () => captured.destination.onSave(sampleDestination));
      await act(async () => planner().handleDeleteDestination(sampleDestination.id));
      const titles = planner().trip.days[planner().activeDayIndex].destinations.map((d: Destination) => d.title);
      expect(titles).not.toContain('Pantai Uji');
    });
  });

  describe('sync and session handlers', () => {
    it('does not sync to the database when no user is logged in', async () => {
      vi.mocked(roamApi.getStoredToken).mockReturnValue(null);
      render(<App />);
      await act(async () => captured.city.onUpdateTripCity('Bali'));
      expect(roamApi.saveTrip).not.toHaveBeenCalled();
    });

    it('updates the destination city and saves it for a logged-in user', async () => {
      await renderAuthenticated();
      await act(async () => captured.city.onUpdateTripCity('Bali'));
      expect(planner().trip.destinationCity).toBe('Bali');
      await waitFor(() => expect(roamApi.saveTrip).toHaveBeenCalled());
    });

    it('creates a new trip for another city and resets the day focus', async () => {
      await renderAuthenticated();
      const newTrip: TripPlan = { ...PRESET_TRIPS[0], id: 'trip-city-x', destinationCity: 'Lombok' };
      await act(async () => captured.city.onCreateTripForCity(newTrip));
      expect(planner().trip.id).toBe('trip-city-x');
      expect(planner().trip.destinationCity).toBe('Lombok');
      expect(planner().activeDayIndex).toBe(0);
      expect(planner().selectedDestinationId).toBeNull();
    });

    it('imports a shared trip from the share modal', async () => {
      await renderAuthenticated();
      const imported: TripPlan = { ...PRESET_TRIPS[1], id: 'trip-imported' };
      await act(async () => captured.share.onImportTrip(imported));
      expect(planner().trip.id).toBe('trip-imported');
    });

    it('loads the first saved trip after login', async () => {
      const saved: TripPlan = { ...PRESET_TRIPS[0], id: 'trip-from-db', title: 'Trip Dari DB' };
      vi.mocked(roamApi.getUserTrips).mockResolvedValue([saved]);
      await renderAuthenticated();
      await act(async () => captured.auth.onUserLoggedIn(mockUser));
      expect(planner().trip.title).toBe('Trip Dari DB');
      expect(roamApi.getUserTrips).toHaveBeenCalled();
    });

    it('saves the current trip after login when the user has no saved trips', async () => {
      await renderAuthenticated();
      await act(async () => captured.auth.onUserLoggedIn(mockUser));
      await waitFor(() => expect(roamApi.saveTrip).toHaveBeenCalled());
    });

    it('logs out: clears the current user, the stored session and calls the logout API', async () => {
      // logoutUser reads the token from localStorage directly, so store it there first.
      localStorage.setItem('roamplan_auth_token', 'valid-token-123');
      await renderAuthenticated();
      await act(async () => captured.auth.onUserLoggedOut());
      expect(planner().currentUser).toBeNull();
      expect(captured.auth.isOpen).toBe(false);
      expect(localStorage.getItem('roamplan_auth_token')).toBeNull();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'), expect.anything());
    });
  });
});
