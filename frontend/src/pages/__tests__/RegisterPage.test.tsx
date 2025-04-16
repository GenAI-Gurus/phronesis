/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import RegisterPage from '../RegisterPage';
import { MemoryRouter } from 'react-router-dom';

// Mock api client
vi.mock('../../api/client', () => ({
  __esModule: true,
  default: { post: vi.fn() },
}));
import api from '../../api/client';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });
    await waitFor(() => {
      const errorAlert = screen.getByTestId('form-error');
      try {
        expect(errorAlert.textContent).toMatch(/Email and password are required\.?/);
      } catch (e) {
        // Print the full DOM for debugging if the assertion fails
        // eslint-disable-next-line no-console
        screen.debug();
        throw e;
      }
    });
  });

  it('shows validation error for short password', async () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      const errorAlert = screen.getByTestId('form-error');
      expect(errorAlert.textContent).toMatch(/Password must be at least 8 characters/);
    });
  });

  it('shows success message after successful registration', async () => {
    (api.post as Mock).mockResolvedValue({});
    render(<RegisterPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'longenoughpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    (api.post as Mock).mockRejectedValue({ response: { data: { detail: 'Email already registered' } } });
    render(<RegisterPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'longenoughpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });
});
