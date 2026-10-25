/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../components/AuthModal';
import * as roamApi from '../services/roamApi';

describe('AuthModal Detailed Coverage', () => {
  it('handles login and registration flows within the modal', async () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    const loginSpy = vi.spyOn(roamApi, 'loginUser');
    const registerSpy = vi.spyOn(roamApi, 'registerUser');

    render(
      <AuthModal
        isOpen={true}
        onClose={vi.fn()}
        currentUser={null}
        onUserLoggedIn={onLogin}
        onUserLoggedOut={onLogout}
      />
    );

    // Test Login failure
    loginSpy.mockResolvedValueOnce({ status: 'fail', message: 'Auth failed' });
    fireEvent.change(screen.getByPlaceholderText('contoh@gmail.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /masuk ke akun/i }));
    await waitFor(() => expect(screen.getByText('Auth failed')).toBeInTheDocument());

    // Switch to Register
    fireEvent.click(screen.getByRole('button', { name: /daftar akun/i }));
    
    // Test Register failure
    registerSpy.mockResolvedValueOnce({ status: 'fail', message: 'Reg failed' });
    fireEvent.change(screen.getByPlaceholderText('Masukkan nama Anda...'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('contoh@gmail.com'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /daftar akun baru/i }));
    await waitFor(() => expect(screen.getByText('Reg failed')).toBeInTheDocument());

    // Test Register Success
    registerSpy.mockResolvedValueOnce({ 
      status: 'success', 
      message: 'OK', 
      data: { token: 't', user: { id: 1, name: 'U', email: 'e' } } 
    });
    fireEvent.click(screen.getByRole('button', { name: /daftar akun baru/i }));
    await waitFor(() => expect(screen.getByText(/pendaftaran berhasil/i)).toBeInTheDocument());
  });

  it('renders logged in state and handles logout', () => {
    const onLogout = vi.fn();
    render(
      <AuthModal
        isOpen={true}
        onClose={vi.fn()}
        currentUser={{ id: 1, name: 'Active User', email: 'a@a.com' }}
        onUserLoggedIn={vi.fn()}
        onUserLoggedOut={onLogout}
      />
    );
    expect(screen.getByText('Active User')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /keluar \(logout\)/i }));
    expect(onLogout).toHaveBeenCalled();
  });
});

