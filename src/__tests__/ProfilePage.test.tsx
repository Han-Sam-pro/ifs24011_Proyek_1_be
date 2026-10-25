/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';

import { render, screen, fireEvent } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('ProfilePage Component', () => {
  it('renders user profile details when logged in', () => {
    const onLogout = vi.fn();
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      photo: '/default-avatar.svg',
    };

    render(
      <BrowserRouter>
        <ProfilePage
          trip={PRESET_TRIPS[0]}
          currentUser={mockUser}
          onUserLoggedOut={onLogout}
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

    const userName = screen.getByRole('heading', { name: /test user/i });
    const userEmail = screen.getByText(/test@example.com/i);
    const logoutButton = screen.getByRole('button', { name: /keluar \(logout\)/i });

    expect(userName).toBeInTheDocument();
    expect(userEmail).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /keluar \(logout\)/i });
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalled();
  });


  it('navigates to planner on Buka Planner click', () => {
    render(
      <BrowserRouter>
        <ProfilePage
          trip={PRESET_TRIPS[0]}
          currentUser={{ id: 1, name: 'Test', email: 'test@example.com' }}
          onUserLoggedOut={() => {}}
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

    const openPlannerBtn = screen.getByRole('button', { name: /buka planner/i });
    fireEvent.click(openPlannerBtn);
    expect(openPlannerBtn).toBeInTheDocument();
  });
});

