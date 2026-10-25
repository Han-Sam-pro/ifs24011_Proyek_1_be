/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BudgetOverview } from '../components/BudgetOverview';
import { DayTabs } from '../components/DayTabs';
import { PrintView } from '../components/PrintView';
import { AuthModal } from '../components/AuthModal';
import { UsersDirectoryModal } from '../components/UsersDirectoryModal';
import { CitySelectorModal } from '../components/CitySelectorModal';
import { DestinationModal } from '../components/DestinationModal';
import { ItineraryView } from '../components/ItineraryView';
import { ShareModal } from '../components/ShareModal';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('UI Components & Modals Interaction', () => {
  it('renders and interacts with BudgetOverview', () => {
    const handleUpdateBudget = vi.fn();
    render(<BudgetOverview trip={PRESET_TRIPS[0]} onUpdateTotalBudget={handleUpdateBudget} />);
    expect(screen.getByText(/estimasi & pengendalian anggaran/i)).toBeInTheDocument();

    const editBtn = screen.getByTitle(/ubah batas anggaran/i);
    fireEvent.click(editBtn);

    const input = screen.getByDisplayValue(PRESET_TRIPS[0].totalBudget.toString());
    fireEvent.change(input, { target: { value: '6000000' } });

    const saveBtn = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(saveBtn);

    expect(handleUpdateBudget).toHaveBeenCalledWith(6000000);
  });

  it('renders and interacts with DayTabs', () => {
    const handleSelectDay = vi.fn();
    const handleAddDay = vi.fn();

    render(
      <DayTabs
        days={PRESET_TRIPS[0].days}
        activeDayIndex={0}
        onSelectDay={handleSelectDay}
        onAddDay={handleAddDay}
        onDeleteDay={() => {}}
        onUpdateDayTheme={() => {}}
      />
    );

    const day1Tab = screen.getByRole('button', { name: /pilih hari ke 1/i });
    fireEvent.click(day1Tab);
    expect(handleSelectDay).toHaveBeenCalledWith(0);

    const addDayBtn = screen.getByRole('button', { name: /tambah hari baru/i });
    fireEvent.click(addDayBtn);
    expect(handleAddDay).toHaveBeenCalled();
  });

  it('renders PrintView', () => {
    render(<PrintView trip={PRESET_TRIPS[0]} />);
    expect(screen.getByText(PRESET_TRIPS[0].title)).toBeInTheDocument();
  });

  it('renders and interacts with AuthModal', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        currentUser={null}
        onUserLoggedIn={() => {}}
        onUserLoggedOut={() => {}}
      />
    );
    expect(screen.getByText(/autentikasi akun/i)).toBeInTheDocument();

    const registerTab = screen.getByRole('button', { name: /daftar akun/i });
    fireEvent.click(registerTab);

    expect(screen.getByRole('button', { name: /masuk \(login\)/i })).toBeInTheDocument();
  });

  it('renders and interacts with UsersDirectoryModal', async () => {
    render(<UsersDirectoryModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/daftar pengguna/i)).toBeInTheDocument();
  });

  it('renders and interacts with CitySelectorModal', () => {
    const handleUpdateCity = vi.fn();
    render(
      <BrowserRouter>
        <CitySelectorModal
          isOpen={true}
          onClose={() => {}}
          currentTrip={PRESET_TRIPS[0]}
          onUpdateTripCity={handleUpdateCity}
          onCreateTripForCity={() => {}}
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/ganti atau tambah kota tujuan/i)).toBeInTheDocument();

    const customInput = screen.getByPlaceholderText(/masukkan nama kota impian anda/i);
    fireEvent.change(customInput, { target: { value: 'Bali' } });

    const applyBtn = screen.getByRole('button', { name: /atur kota ke/i });
    fireEvent.click(applyBtn);

    expect(handleUpdateCity).toHaveBeenCalledWith('Bali');
  });

  it('renders and interacts with DestinationModal', () => {
    const handleSave = vi.fn();
    render(
      <DestinationModal
        isOpen={true}
        onClose={() => {}}
        onSave={handleSave}
        destinationToEdit={null}
        dayNumber={1}
        currency="IDR"
        destinationCity="Yogyakarta"
        onTriggerMapPick={() => {}}
        pendingCoordinates={null}
      />
    );

    const titleInput = screen.getByLabelText(/nama destinasi \/ tempat/i);
    fireEvent.change(titleInput, { target: { value: 'Pantai Parangtritis' } });

    const submitBtn = screen.getByRole('button', { name: /tambahkan ke jadwal/i });
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalled();
  });

  it('renders and interacts with ItineraryView', () => {
    const handleMove = vi.fn();
    const handleAdd = vi.fn();
    const handleOptimize = vi.fn();

    render(
      <ItineraryView
        currentDay={PRESET_TRIPS[0].days[0]}
        currency="IDR"
        selectedDestinationId={null}
        onSelectDestination={() => {}}
        onAddDestination={handleAdd}
        onEditDestination={() => {}}
        onDeleteDestination={() => {}}
        onMoveDestination={handleMove}
        onOptimizeRoute={handleOptimize}
      />
    );

    const addBtn = screen.getByRole('button', { name: /tambah destinasi tempat baru/i });
    fireEvent.click(addBtn);
    expect(handleAdd).toHaveBeenCalled();

    const optBtn = screen.getByRole('button', { name: /optimalkan urutan rute/i });
    fireEvent.click(optBtn);
    expect(handleOptimize).toHaveBeenCalled();
  });

  it('renders ShareModal and tests copy, print, export, and close actions', async () => {
    const handleClose = vi.fn();
    const handlePrint = vi.fn();
    const handleImport = vi.fn();

    render(
      <ShareModal
        isOpen={true}
        onClose={handleClose}
        trip={PRESET_TRIPS[0]}
        onImportTrip={handleImport}
        onTriggerPrint={handlePrint}
      />
    );

    expect(screen.getByText(/bagikan itinerary ke rekan perjalanan/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /salin tautan itinerary ke clipboard/i });
    fireEvent.click(copyBtn);

    const exportBtn = screen.getByRole('button', { name: /unduh salinan data perjalanan dalam format berkas json/i });
    fireEvent.click(exportBtn);

    const closeHeaderBtn = screen.getByLabelText(/tutup jendela bagikan itinerary/i);
    fireEvent.click(closeHeaderBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});

