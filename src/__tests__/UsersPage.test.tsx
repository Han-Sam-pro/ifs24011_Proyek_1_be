/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UsersPage } from '../pages/UsersPage';
import { PRESET_TRIPS } from '../data/presetTrips';
import * as roamApi from '../services/roamApi';

describe('UsersPage Component', () => {
  it('renders users directory header, fetches users, and filters list', async () => {
    const mockUsers = [
      { id: 1, name: 'Alice Wonderland', email: 'alice@example.com' },
      { id: 2, name: 'Bob Builder', email: 'bob@example.com' },
    ];
    vi.spyOn(roamApi, 'getUsersList').mockResolvedValue(mockUsers);

    render(
      <BrowserRouter>
        <UsersPage
          trip={PRESET_TRIPS[0]}
          currentUser={null}
          onOpenShareModal={() => {}}
          onTriggerPrint={() => {}}
          onSelectPresetTrip={() => {}}
          onChangeCurrency={() => {}}
          onNewTrip={() => {}}
          onOpenAuthModal={() => {}}
          onOpenUsersModal={() => {}}
        />
      </BrowserRouter>
    );

    const heading = screen.getByRole('heading', { name: /daftar pengguna/i });
    expect(heading).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
      expect(screen.getByText('Bob Builder')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari pengguna berdasarkan nama/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    expect(screen.queryByText('Bob Builder')).not.toBeInTheDocument();

    const refreshButton = screen.getByRole('button', { name: /muat ulang/i });
    fireEvent.click(refreshButton);
  });
});
