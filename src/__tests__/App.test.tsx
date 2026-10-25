/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import App from '../App';
import * as roamApi from '../services/roamApi';

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


describe('App Root Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    window.history.pushState({}, '', '/');

    // Provide default resolved values for mocked promises to avoid 'cannot read then of undefined'
    vi.mocked(roamApi.getStoredToken).mockReturnValue(null);
    vi.mocked(roamApi.getStoredUser).mockReturnValue(null);
    vi.mocked(roamApi.getProfile).mockResolvedValue(null);
    vi.mocked(roamApi.getUserTrips).mockResolvedValue([]);
    vi.mocked(roamApi.saveTrip).mockResolvedValue(true);
  });



  it('renders App root and redirects unauthenticated user to login', () => {
    vi.mocked(roamApi.getStoredToken).mockReturnValue(null);
    render(<App />);
    expect(screen.getByText(/masuk ke roamplan/i)).toBeInTheDocument();
  });

  it('covers all app handlers and interactions', async () => {
    const mockUser = { id: 10, name: 'Budi Santoso', email: 'budi@example.com' };
    vi.mocked(roamApi.getStoredToken).mockReturnValue('valid-token-123');
    vi.mocked(roamApi.getStoredUser).mockReturnValue(mockUser);
    vi.mocked(roamApi.getProfile).mockResolvedValue(mockUser);

    render(<App />);
    await waitFor(() => expect(screen.queryAllByText(/Budi/i).length).toBeGreaterThan(0));

    // 1. Add a new destination
    fireEvent.click(screen.getByRole('button', { name: /tambah destinasi tempat baru/i }));
    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: 'New Test Place' } });
    fireEvent.click(screen.getByRole('button', { name: /tambahkan ke jadwal/i }));
    expect(screen.getAllByText('New Test Place').length).toBeGreaterThan(0);

    // 2. Edit the destination
    fireEvent.click(screen.getAllByLabelText(/edit destinasi/i)[0]);
    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: 'Updated Place' } });
    fireEvent.click(screen.getByRole('button', { name: /simpan perubahan/i }));
    expect(screen.getAllByText('Updated Place').length).toBeGreaterThan(0);

    // 3. Move destination
    fireEvent.click(screen.getByRole('button', { name: /tambah destinasi tempat baru/i }));
    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: 'Second Place' } });
    fireEvent.click(screen.getByRole('button', { name: /tambahkan ke jadwal/i }));
    
    const moveUpBtns = screen.getAllByLabelText(/pindahkan.*ke atas/i);
    if (moveUpBtns.length > 0) fireEvent.click(moveUpBtns[moveUpBtns.length - 1]);

    // 4. Optimize Route
    const optBtn = screen.queryByRole('button', { name: /optimalkan rute/i });
    if (optBtn) fireEvent.click(optBtn);

    // 5. Delete Destination
    fireEvent.click(screen.getAllByLabelText(/hapus.*dari jadwal/i)[0]);


    // 6. Day management
    fireEvent.click(screen.getByRole('button', { name: /tambah hari baru/i }));
    fireEvent.click(screen.getByLabelText(/pilih hari ke 2/i));
    fireEvent.click(screen.getByLabelText(/hapus hari 2/i));

    // 7. Update Day Theme
    fireEvent.click(screen.getByLabelText(/edit judul tema atau tanggal hari ini/i));
    fireEvent.change(screen.getByLabelText(/judul tema hari/i), { target: { value: 'New Theme' } });
    fireEvent.click(screen.getByLabelText(/simpan perubahan tema dan tanggal hari ini/i));

    // 8. Map interaction
    fireEvent.click(screen.getByTestId('google-map'));
  });
});









