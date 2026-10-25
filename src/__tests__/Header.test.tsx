/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { PRESET_TRIPS } from '../data/presetTrips';


describe('Header Component', () => {
  const defaultProps = {
    trip: PRESET_TRIPS[0],
    activeViewTab: 'planner' as const,
    currentUser: null,
    onChangeViewTab: vi.fn(),
    onOpenShareModal: vi.fn(),
    onTriggerPrint: vi.fn(),
    onSelectPresetTrip: vi.fn(),
    onChangeCurrency: vi.fn(),
    onNewTrip: vi.fn(),
    onOpenCityModal: vi.fn(),
    onOpenAuthModal: vi.fn(),
    onOpenUsersModal: vi.fn(),
  };

  it('renders RoamPlan brand and navigation elements', () => {
    render(
      <BrowserRouter>
        <Header {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByText(/roamplan/i)).toBeInTheDocument();
    expect(screen.getByText(/itinerary & peta/i)).toBeInTheDocument();
    expect(screen.getByText(/anggaran & biaya/i)).toBeInTheDocument();
  });

  it('handles user interactions across all header controls', () => {
    const mockUser = { id: 1, name: 'Siti Aminah', email: 'siti@example.com' };

    const { rerender } = render(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={mockUser} activeViewTab="budget" />
      </BrowserRouter>
    );

    expect(screen.getByText('Siti')).toBeInTheDocument();

    const brandLink = screen.getByText(/roamplan/i);
    fireEvent.click(brandLink);
    expect(defaultProps.onChangeViewTab).toHaveBeenCalledWith('planner');

    const presetBtn = screen.getByRole('button', { name: /Muat contoh itinerary Bali/i });
    fireEvent.click(presetBtn);
    expect(defaultProps.onSelectPresetTrip).toHaveBeenCalled();

    const addCityBtn = screen.getByRole('button', { name: /Buka pilihan atau tambah kota tujuan baru/i });
    fireEvent.click(addCityBtn);
    expect(defaultProps.onOpenCityModal).toHaveBeenCalled();

    const budgetTabBtn = screen.getByRole('button', { name: /Tampilan Anggaran dan Biaya/i });
    fireEvent.click(budgetTabBtn);

    const currencySelect = screen.getByTitle('Pilih Mata Uang');
    fireEvent.change(currencySelect, { target: { value: 'EUR' } });
    expect(defaultProps.onChangeCurrency).toHaveBeenCalledWith('EUR');

    const printBtn = screen.getByTitle('Cetak atau Simpan PDF');
    fireEvent.click(printBtn);
    expect(defaultProps.onTriggerPrint).toHaveBeenCalled();

    const shareBtn = screen.getByRole('button', { name: /Buka dialog bagikan itinerary/i });
    fireEvent.click(shareBtn);
    expect(defaultProps.onOpenShareModal).toHaveBeenCalled();

    rerender(
      <BrowserRouter>
        <Header {...defaultProps} currentUser={null} />
      </BrowserRouter>
    );
    expect(screen.getByText('Masuk')).toBeInTheDocument();
  });
});

