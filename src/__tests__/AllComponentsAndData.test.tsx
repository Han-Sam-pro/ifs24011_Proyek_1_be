/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DestinationModal } from '../components/DestinationModal';
import { ItineraryView } from '../components/ItineraryView';
import { ShareModal } from '../components/ShareModal';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('All Components and Data Validation', () => {
  it('validates presetTrips data integrity', () => {
    expect(Array.isArray(PRESET_TRIPS)).toBe(true);
    expect(PRESET_TRIPS.length).toBeGreaterThan(0);
    PRESET_TRIPS.forEach((trip) => {
      expect(trip.id).toBeDefined();
      expect(trip.title).toBeDefined();
      expect(trip.destinationCity).toBeDefined();
      expect(Array.isArray(trip.days)).toBe(true);
    });
  });

  it('renders DestinationModal when open', () => {
    render(
      <DestinationModal
        isOpen={true}
        onClose={() => {}}
        onSave={() => {}}
        destinationToEdit={null}
        dayNumber={1}
        currency="IDR"
        destinationCity="Yogyakarta"
        onTriggerMapPick={() => {}}
        pendingCoordinates={null}
      />
    );
    expect(screen.getByText(/tambah destinasi/i)).toBeInTheDocument();
  });

  it('renders ItineraryView with day destinations', () => {
    const day = PRESET_TRIPS[0].days[0];
    render(
      <ItineraryView
        currentDay={day}
        currency="IDR"
        selectedDestinationId={null}
        onSelectDestination={() => {}}
        onAddDestination={() => {}}
        onEditDestination={() => {}}
        onDeleteDestination={() => {}}
        onMoveDestination={() => {}}
        onOptimizeRoute={() => {}}
      />
    );
    expect(screen.getByText(new RegExp(day.themeTitle || 'Rencana', 'i'))).toBeInTheDocument();
  });

  it('renders ShareModal when open', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={() => {}}
        trip={PRESET_TRIPS[0]}
        onImportTrip={() => {}}
        onTriggerPrint={() => {}}
      />
    );
    expect(screen.getByText(/bagikan itinerary ke rekan perjalanan/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users in ProtectedRoute', () => {
    localStorage.clear();
    render(
      <BrowserRouter>
        <ProtectedRoute />
      </BrowserRouter>
    );
    expect(window.location.pathname).toBe('/auth/login');
  });
});
