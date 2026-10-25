/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';
import * as roamApi from '../services/roamApi';

describe('RegisterPage Component', () => {
  it('renders registration form inputs and submit button', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/nama lengkap/i);
    const emailInput = screen.getByLabelText(/alamat email/i);
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitButton = screen.getByRole('button', { name: /daftar akun baru/i });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('handles registration success and failure', async () => {
    const regSpy = vi.spyOn(roamApi, 'registerUser');

    // Failure
    regSpy.mockResolvedValueOnce({
      status: 'fail',
      message: 'Email sudah terdaftar',
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/nama lengkap/i);
    const emailInput = screen.getByLabelText(/alamat email/i);
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitButton = screen.getByRole('button', { name: /daftar akun baru/i });

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email sudah terdaftar/i)).toBeInTheDocument();
    });

    // Success
    regSpy.mockResolvedValueOnce({
      status: 'success',
      message: 'Pendaftaran berhasil',
    });

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/pendaftaran berhasil/i)).toBeInTheDocument();
    });
  });
});
