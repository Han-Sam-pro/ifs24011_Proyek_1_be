/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import * as roamApi from '../services/roamApi';

describe('LoginPage Component', () => {
  it('renders required grading selectors (#username, #password, #btn-submit)', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /alamat email \/ username/i });
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitButton = screen.getByRole('button', { name: /masuk \(login\)/i });

    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('id', 'username');

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('id', 'password');

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('id', 'btn-submit');
  });

  it('handles login form submission success and failure', async () => {
    const loginSpy = vi.spyOn(roamApi, 'loginUser');

    // Failure case
    loginSpy.mockResolvedValueOnce({
      status: 'fail',
      message: 'Email atau password salah',
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const usernameInput = screen.getByRole('textbox', { name: /alamat email \/ username/i });
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitButton = screen.getByRole('button', { name: /masuk \(login\)/i });

    fireEvent.change(usernameInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email atau password salah/i)).toBeInTheDocument();
    });

    // Success case
    loginSpy.mockResolvedValueOnce({
      status: 'success',
      message: 'Berhasil',
      data: {
        token: 'token-123',
        user: { id: 1, name: 'User 1', email: 'user1@example.com' },
      },
    });

    fireEvent.change(usernameInput, { target: { value: 'user1@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correct' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/berhasil masuk/i)).toBeInTheDocument();
    });
  });
});
