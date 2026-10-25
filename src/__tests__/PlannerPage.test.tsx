/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlannerPage } from '../pages/PlannerPage';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('PlannerPage Component', () => {
  const mockTrip = PRESET_TRIPS[0];
  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

  const defaultProps = {
    trip: mockTrip,
    setTrip: vi.fn(),
    activeDayIndex: 0,
    setActiveDayIndex: vi.fn(),
    activeViewTab: 'planner' as const,
    setActiveViewTab: vi.fn(),
    selectedDestinationId: null,
    setSelectedDestinationId: vi.fn(),
    quotaExceeded: true,
    googleMapsApiKey: 'mock-key',
    mobileSubTab: 'list' as const,
    setMobileSubTab: vi.fn(),
    currentUser: mockUser,
    isSharedTripImported: true,
    setIsSharedTripImported: vi.fn(),
    toastMessage: 'Inspirasi itinerary dimuat!',
    onOpenAddDestination: vi.fn(),
    onOpenEditDestination: vi.fn(),
    handleDeleteDestination: vi.fn(),
    handleMoveDestination: vi.fn(),
    handleOptimizeRoute: vi.fn(),
    handleAddDay: vi.fn(),
    handleDeleteDay: vi.fn(),
    handleUpdateDayTheme: vi.fn(),
    handleUpdateTotalBudget: vi.fn(),
    handleChangeCurrency: vi.fn(),
    handleSelectPresetTrip: vi.fn(),
    handleNewTrip: vi.fn(),
    handleTriggerPrint: vi.fn(),
    setIsShareModalOpen: vi.fn(),
    setIsCityModalOpen: vi.fn(),
    setIsAuthModalOpen: vi.fn(),
    setIsUsersModalOpen: vi.fn(),
    isPickingLocation: false,
    handlePickLocationFromMap: vi.fn(),
  };

  it('renders PlannerPage with header, banners, toast, and planner view controls', () => {
    render(
      <MemoryRouter>
        <PlannerPage {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Google Maps Platform quota reached/i)).toBeInTheDocument();
    expect(screen.getByText(/Mode Berbagi Teman/i)).toBeInTheDocument();
    expect(screen.getByText('Inspirasi itinerary dimuat!')).toBeInTheDocument();

    const closeBannerBtn = screen.getByText('Tutup');
    fireEvent.click(closeBannerBtn);
    expect(defaultProps.setIsSharedTripImported).toHaveBeenCalledWith(false);

    const titleInput = screen.getByTitle('Klik untuk mengubah judul rencana perjalanan');
    fireEvent.change(titleInput, { target: { value: 'New Trip Title' } });
    expect(defaultProps.setTrip).toHaveBeenCalled();

    const changeCityBadge = screen.getByLabelText(/Ganti kota tujuan saat ini/i);
    fireEvent.click(changeCityBadge);
    expect(defaultProps.setIsCityModalOpen).toHaveBeenCalledWith(true);

    const newTripBtn = screen.getByText('Rencana Baru');
    fireEvent.click(newTripBtn);
    expect(defaultProps.handleNewTrip).toHaveBeenCalled();

    const addCityBtn = screen.getByText('+ Ganti / Tambah Kota');
    fireEvent.click(addCityBtn);
    expect(defaultProps.setIsCityModalOpen).toHaveBeenCalledWith(true);
  });

  it('handles mobile sub tab toggling and budget active view tab', () => {
    const { rerender } = render(
      <MemoryRouter>
        <PlannerPage {...defaultProps} isSharedTripImported={false} quotaExceeded={false} toastMessage={null} />
      </MemoryRouter>
    );

    const mapSubTabBtn = screen.getByText('Google Maps');
    fireEvent.click(mapSubTabBtn);
    expect(defaultProps.setMobileSubTab).toHaveBeenCalledWith('map');

    const listSubTabBtn = screen.getByText(/Jadwal Hari 1/i);
    fireEvent.click(listSubTabBtn);
    expect(defaultProps.setMobileSubTab).toHaveBeenCalledWith('list');

    rerender(
      <MemoryRouter>
        <PlannerPage {...defaultProps} activeViewTab="budget" />
      </MemoryRouter>
    );

    expect(screen.getByText(/estimasi & pengendalian anggaran/i)).toBeInTheDocument();
  });
});

