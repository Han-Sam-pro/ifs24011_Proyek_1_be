/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleMapView } from '../components/GoogleMapView';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('GoogleMapView Component', () => {
  const sampleTrip = PRESET_TRIPS[0];
  const sampleDay = sampleTrip.days[0];

  it('renders GoogleMapView with map controls and markers', () => {
    const onSelect = vi.fn();
    const onPick = vi.fn();
    const onEdit = vi.fn();

    render(
      <GoogleMapView
        apiKey="test-key"
        currentDay={sampleDay}
        selectedDestinationId={sampleDay.destinations[0].id}
        onSelectDestination={onSelect}
        currency="IDR"
        destinationCity="Yogyakarta"
        isPickingLocation={true}
        onPickLocation={onPick}
        onEditDestination={onEdit}
      />
    );

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
    expect(screen.getByText(/Mode Penempatan Pin Google Maps/i)).toBeInTheDocument();
    expect(screen.getByText('Satelit')).toBeInTheDocument();

    const layerBtn = screen.getByText('Satelit');
    fireEvent.click(layerBtn);
    expect(screen.getByText('Jalan')).toBeInTheDocument();
  });

  it('renders GoogleMapView without picking location mode', () => {
    render(
      <GoogleMapView
        apiKey="test-key"
        currentDay={{ ...sampleDay, destinations: [] }}
        selectedDestinationId={null}
        onSelectDestination={vi.fn()}
        currency="USD"
        destinationCity="Bali"
        isPickingLocation={false}
      />
    );

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
    expect(screen.queryByText(/Mode Penempatan Pin Google Maps/i)).not.toBeInTheDocument();
  });
});
